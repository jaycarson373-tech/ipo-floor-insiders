import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Connection, PublicKey } from '@solana/web3.js';
import {
  decodeLaunchConfig,
  evaluateStaticLaunchReadiness,
} from '../app/launch-readiness.mjs';

const CORE_PROGRAM_ID = new PublicKey('CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
const envFileArg = process.argv.find((value) => value.startsWith('--env-file='));
const envFile = envFileArg ? envFileArg.slice('--env-file='.length) : path.join(root, '.env.local');
const product = JSON.parse(fs.readFileSync(path.join(root, 'product-config.json'), 'utf8'));
const env = { ...readEnvFile(envFile), ...process.env };
const result = evaluateStaticLaunchReadiness(product, env, { requireMainnet: !args.has('--allow-devnet') });

if (result.ready && !args.has('--offline')) {
  await runNetworkChecks(result.checks, product, env);
}

result.ready = result.checks.every((check) => check.status !== 'fail');
if (args.has('--json')) {
  console.log(JSON.stringify(result, null, 2));
} else {
  printReport(result);
}
process.exitCode = result.ready ? 0 : 1;

function readEnvFile(filename) {
  if (!fs.existsSync(filename)) return {};
  const values = {};
  for (const line of fs.readFileSync(filename, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    values[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, '$2');
  }
  return values;
}

function add(checks, id, status, detail) {
  checks.push({ id, status, detail });
}

async function runNetworkChecks(checks, config, values) {
  const connection = new Connection(values.NEXT_PUBLIC_SOLANA_RPC_URL, 'confirmed');
  const programId = new PublicKey(values.NEXT_PUBLIC_IPO_PROGRAM_ID);
  const configAddress = new PublicKey(values.NEXT_PUBLIC_IPO_CONFIG);
  let programAccount;
  let configAccount;
  try {
    [programAccount, configAccount] = await Promise.all([
      connection.getAccountInfo(programId, 'confirmed'),
      connection.getAccountInfo(configAddress, 'confirmed'),
    ]);
  } catch (error) {
    add(checks, 'rpc-read', 'fail', `RPC read failed: ${cleanError(error)}`);
    return;
  }

  add(checks, 'program-deployed', programAccount?.executable ? 'pass' : 'fail', programAccount?.executable ? 'IPO program is deployed and executable.' : 'IPO program is not deployed or executable.');
  if (!configAccount) {
    add(checks, 'config-published', 'fail', 'IPO launch config account does not exist.');
    return;
  }
  if (!configAccount.owner.equals(programId)) {
    add(checks, 'config-owner', 'fail', 'IPO launch config is owned by a different program.');
    return;
  }
  add(checks, 'config-owner', 'pass', 'IPO launch config is owned by the published program.');

  let state;
  try {
    state = decodeLaunchConfig(configAddress, configAccount.data);
    add(checks, 'config-decode', 'pass', 'IPO launch config decoded successfully.');
  } catch (error) {
    add(checks, 'config-decode', 'fail', cleanError(error));
    return;
  }

  const [derivedConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from('config'), state.authority.toBuffer()],
    programId,
  );
  add(checks, 'config-pda', derivedConfig.equals(configAddress) ? 'pass' : 'fail', derivedConfig.equals(configAddress) ? 'Config address is the canonical authority PDA.' : 'Config address is not the canonical authority PDA.');

  const addressChecks = [
    ['operations-treasury', state.treasury, values.NEXT_PUBLIC_TREASURY_WALLET],
    ['asset-treasury', state.assetTreasury, values.NEXT_PUBLIC_ASSET_TREASURY_WALLET],
    ['core-collection-address', state.coreCollection, values.NEXT_PUBLIC_CORE_COLLECTION],
  ];
  for (const [id, actual, expected] of addressChecks) {
    const matches = actual.equals(new PublicKey(expected));
    add(checks, id, matches ? 'pass' : 'fail', matches ? `${id} matches the on-chain config.` : `${id} does not match the on-chain config.`);
  }

  add(checks, 'onchain-supply', state.totalSupply === config.supply ? 'pass' : 'fail', `On-chain supply: ${state.totalSupply.toLocaleString()}.`);
  add(checks, 'onchain-price', state.mintPriceLamports === BigInt(config.mintPriceLamports) ? 'pass' : 'fail', `On-chain mint price: ${state.mintPriceLamports.toString()} lamports.`);
  add(checks, 'onchain-supply-state', state.minted <= state.totalSupply ? 'pass' : 'fail', `Minted: ${state.minted.toLocaleString()} of ${state.totalSupply.toLocaleString()}.`);
  add(checks, 'onchain-pause', state.paused ? 'fail' : 'pass', state.paused ? 'Mint is paused on-chain.' : 'Mint is not paused.');
  const metadataMatches = normalizeUrl(state.metadataBaseUri) === normalizeUrl(values.NEXT_PUBLIC_METADATA_BASE_URL);
  add(checks, 'onchain-metadata', metadataMatches ? 'pass' : 'fail', metadataMatches ? 'Published metadata URL matches the on-chain config.' : 'Published metadata URL differs from the on-chain config.');

  try {
    const collectionAccount = await connection.getAccountInfo(state.coreCollection, 'confirmed');
    add(checks, 'core-collection-owner', collectionAccount?.owner.equals(CORE_PROGRAM_ID) ? 'pass' : 'fail', collectionAccount?.owner.equals(CORE_PROGRAM_ID) ? 'Collection is owned by Metaplex Core.' : 'Collection is missing or is not owned by Metaplex Core.');
    const authorityMatches = collectionAccount?.data.length >= 33
      && collectionAccount.data[0] === 5
      && new PublicKey(collectionAccount.data.subarray(1, 33)).equals(configAddress);
    add(checks, 'core-update-authority', authorityMatches ? 'pass' : 'fail', authorityMatches ? 'Core collection update authority is the IPO config PDA.' : 'Core collection update authority does not match the IPO config PDA.');
  } catch (error) {
    add(checks, 'linked-accounts', 'fail', `Linked-account verification failed: ${cleanError(error)}`);
  }

  try {
    const metadataUrl = `${normalizeUrl(values.NEXT_PUBLIC_METADATA_BASE_URL)}/PUMPIO-0001?level=0`;
    const response = await fetch(metadataUrl, { signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const metadata = await response.json();
    const valid = typeof metadata.name === 'string' && typeof metadata.image === 'string' && Array.isArray(metadata.attributes);
    add(checks, 'metadata-live', valid ? 'pass' : 'fail', valid ? 'Public Pumpio metadata resolves.' : 'Public Pumpio metadata is incomplete or still preview-only.');
    if (valid) {
      const imageResponse = await fetch(metadata.image, { signal: AbortSignal.timeout(10_000) });
      const imageType = imageResponse.headers.get('content-type') ?? '';
      add(checks, 'metadata-image', imageResponse.ok && imageType.startsWith('image/') ? 'pass' : 'fail', imageResponse.ok && imageType.startsWith('image/') ? 'Pumpio image resolves with an image content type.' : 'Pumpio image is missing or has an invalid content type.');
    }
  } catch (error) {
    add(checks, 'metadata-live', 'fail', `Public metadata check failed: ${cleanError(error)}`);
  }
}

function normalizeUrl(value) {
  return value.replace(/\/$/, '');
}

function cleanError(error) {
  return error instanceof Error ? error.message.replace(/https?:\/\/[^\s]+/g, '[RPC URL hidden]') : 'Unknown error';
}

function printReport(report) {
  console.log(`IPO launch preflight: ${report.ready ? 'READY' : 'BLOCKED'}`);
  for (const check of report.checks) {
    const mark = check.status === 'pass' ? 'PASS' : check.status === 'warning' ? 'WARN' : 'FAIL';
    console.log(`${mark.padEnd(4)}  ${check.id.padEnd(30)} ${check.detail}`);
  }
  if (!report.ready) console.log('\nNo transaction was sent. Resolve every FAIL before enabling production minting.');
}
