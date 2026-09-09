import assert from 'node:assert/strict';
import test from 'node:test';
import { Keypair } from '@solana/web3.js';
import product from '../product-config.json' with { type: 'json' };
import { evaluateStaticLaunchReadiness } from '../app/launch-readiness.mjs';

function validEnvironment() {
  const address = () => Keypair.generate().publicKey.toBase58();
  return {
    NEXT_PUBLIC_SOLANA_CLUSTER: 'mainnet-beta',
    NEXT_PUBLIC_SOLANA_RPC_URL: 'https://api.mainnet-beta.solana.com',
    NEXT_PUBLIC_IPO_PROGRAM_ID: address(),
    NEXT_PUBLIC_IPO_CONFIG: address(),
    NEXT_PUBLIC_IPO_MINT: address(),
    NEXT_PUBLIC_TREASURY_WALLET: address(),
    NEXT_PUBLIC_ASSET_TREASURY_WALLET: address(),
    NEXT_PUBLIC_CORE_COLLECTION: address(),
    NEXT_PUBLIC_METADATA_BASE_URL: 'https://example.com/api/metadata',
  };
}

test('static launch preflight accepts a complete configuration', () => {
  assert.equal(evaluateStaticLaunchReadiness(product, validEnvironment()).ready, true);
});

test('static launch preflight blocks missing config and shared treasuries', () => {
  const env = validEnvironment();
  env.NEXT_PUBLIC_IPO_CONFIG = '';
  env.NEXT_PUBLIC_ASSET_TREASURY_WALLET = env.NEXT_PUBLIC_TREASURY_WALLET;
  const result = evaluateStaticLaunchReadiness(product, env);
  assert.equal(result.ready, false);
  assert.equal(result.checks.find((check) => check.id === 'NEXT_PUBLIC_IPO_CONFIG').status, 'fail');
  assert.equal(result.checks.find((check) => check.id === 'treasury-separation').status, 'fail');
});

test('static launch preflight blocks non-mainnet release configuration', () => {
  const env = validEnvironment();
  env.NEXT_PUBLIC_SOLANA_CLUSTER = 'devnet';
  assert.equal(evaluateStaticLaunchReadiness(product, env).ready, false);
  assert.equal(evaluateStaticLaunchReadiness(product, env, { requireMainnet: false }).ready, true);
});
