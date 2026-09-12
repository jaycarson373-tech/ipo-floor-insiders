import assert from 'node:assert/strict';
import test from 'node:test';
import { Keypair, PublicKey } from '@solana/web3.js';
import product from '../product-config.json' with { type: 'json' };
import { decodeLaunchConfig, evaluateStaticLaunchReadiness } from '../app/launch-readiness.mjs';

function validEnvironment() {
  const address = () => Keypair.generate().publicKey.toBase58();
  return {
    NEXT_PUBLIC_SOLANA_CLUSTER: 'mainnet-beta',
    NEXT_PUBLIC_SOLANA_RPC_URL: 'https://api.mainnet-beta.solana.com',
    NEXT_PUBLIC_IPO_PROGRAM_ID: address(),
    NEXT_PUBLIC_IPO_CONFIG: address(),
    NEXT_PUBLIC_TREASURY_WALLET: address(),
    NEXT_PUBLIC_ASSET_TREASURY_WALLET: address(),
    NEXT_PUBLIC_CORE_COLLECTION: address(),
    NEXT_PUBLIC_METADATA_BASE_URL: 'https://example.com/api/metadata',
    NEXT_PUBLIC_PUBLIC_MINT_ENABLED: 'true',
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

test('static launch preflight permits localhost RPC only for rehearsal', () => {
  const env = validEnvironment();
  env.NEXT_PUBLIC_SOLANA_CLUSTER = 'devnet';
  env.NEXT_PUBLIC_SOLANA_RPC_URL = 'http://127.0.0.1:8899';
  assert.equal(evaluateStaticLaunchReadiness(product, env).ready, false);
  assert.equal(evaluateStaticLaunchReadiness(product, env, { requireMainnet: false }).ready, true);
});

test('static launch preflight requires an explicit public mint release switch', () => {
  const env = validEnvironment();
  env.NEXT_PUBLIC_PUBLIC_MINT_ENABLED = 'false';
  const result = evaluateStaticLaunchReadiness(product, env);
  assert.equal(result.ready, false);
  assert.equal(result.checks.find((check) => check.id === 'public-mint-switch').status, 'fail');
});

test('launch config decoder matches the no-token mint account layout', () => {
  const data = new Uint8Array(447);
  data.set([155, 12, 170, 224, 30, 250, 204, 130], 0);
  const keys = Array.from({ length: 4 }, () => Keypair.generate().publicKey);
  keys.forEach((key, index) => data.set(key.toBytes(), 8 + index * 32));
  const uri = new TextEncoder().encode('https://example.com/api/metadata');
  const view = new DataView(data.buffer);
  view.setUint32(136, uri.length, true);
  data.set(uri, 140);
  const numericOffset = 140 + uri.length;
  view.setUint16(numericOffset, 1_200, true);
  view.setUint16(numericOffset + 2, 17, true);
  view.setBigUint64(numericOffset + 4, 120_000_000n, true);

  const address = PublicKey.unique();
  const decoded = decodeLaunchConfig(address, data);
  assert.equal(decoded.address, address);
  assert.equal(decoded.authority.toBase58(), keys[0].toBase58());
  assert.equal(decoded.treasury.toBase58(), keys[1].toBase58());
  assert.equal(decoded.assetTreasury.toBase58(), keys[2].toBase58());
  assert.equal(decoded.coreCollection.toBase58(), keys[3].toBase58());
  assert.equal(decoded.metadataBaseUri, 'https://example.com/api/metadata');
  assert.equal(decoded.totalSupply, 1_200);
  assert.equal(decoded.minted, 17);
  assert.equal(decoded.mintPriceLamports, 120_000_000n);
  assert.equal(decoded.paused, false);
});
