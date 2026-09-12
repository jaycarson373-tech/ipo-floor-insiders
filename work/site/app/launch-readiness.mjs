import { PublicKey } from '@solana/web3.js';

export const REQUIRED_LAUNCH_ADDRESSES = [
  'NEXT_PUBLIC_IPO_PROGRAM_ID',
  'NEXT_PUBLIC_IPO_CONFIG',
  'NEXT_PUBLIC_TREASURY_WALLET',
  'NEXT_PUBLIC_ASSET_TREASURY_WALLET',
  'NEXT_PUBLIC_CORE_COLLECTION',
];

const add = (checks, id, status, detail) => checks.push({ id, status, detail });

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export function evaluateStaticLaunchReadiness(product, env, { requireMainnet = true } = {}) {
  const checks = [];
  const feeTotal = Object.values(product.defaultFeeSharesBps ?? {}).reduce((sum, value) => sum + value, 0);
  const mintSplitTotal = Object.values(product.draftMintCapitalBps ?? {}).reduce((sum, value) => sum + value, 0);

  add(checks, 'supply', product.supply === 1_200 ? 'pass' : 'fail', `Configured supply: ${product.supply ?? 'missing'}`);
  add(
    checks,
    'mint-price',
    product.mintPriceLamports === 120_000_000 && product.mintPriceSol === 0.12 ? 'pass' : 'fail',
    `Configured mint: ${product.mintPriceLamports ?? 'missing'} lamports`,
  );
  add(checks, 'mint-split', mintSplitTotal === 10_000 ? 'pass' : 'fail', `Mint allocation total: ${mintSplitTotal} bps`);
  add(checks, 'fee-split', feeTotal === 10_000 ? 'pass' : 'fail', `Creator-fee template total: ${feeTotal} bps`);
  add(
    checks,
    'upgrade-payments',
    product.upgradePolicy?.paymentEnabled === false ? 'pass' : 'fail',
    product.upgradePolicy?.paymentEnabled === false ? 'Upgrade payments are disabled.' : 'Upgrade payments must remain disabled until burn execution is deployed.',
  );

  const cluster = env.NEXT_PUBLIC_SOLANA_CLUSTER ?? '';
  add(
    checks,
    'cluster',
    !requireMainnet || cluster === 'mainnet-beta' ? 'pass' : 'fail',
    cluster ? `Cluster: ${cluster}` : 'Cluster is missing.',
  );
  add(
    checks,
    'rpc',
    isHttpsUrl(env.NEXT_PUBLIC_SOLANA_RPC_URL ?? '') ? 'pass' : 'fail',
    env.NEXT_PUBLIC_SOLANA_RPC_URL ? 'RPC URL is present and uses HTTPS.' : 'RPC URL is missing.',
  );
  add(
    checks,
    'metadata',
    isHttpsUrl(env.NEXT_PUBLIC_METADATA_BASE_URL ?? '') ? 'pass' : 'fail',
    !env.NEXT_PUBLIC_METADATA_BASE_URL
      ? 'Metadata base URL is missing.'
      : isHttpsUrl(env.NEXT_PUBLIC_METADATA_BASE_URL)
        ? 'Metadata base URL is present and uses HTTPS.'
        : 'Metadata base URL must be a public HTTPS URL.',
  );

  const parsedAddresses = new Map();
  for (const name of REQUIRED_LAUNCH_ADDRESSES) {
    const value = env[name] ?? '';
    try {
      parsedAddresses.set(name, new PublicKey(value));
      add(checks, name, 'pass', `${name.replace('NEXT_PUBLIC_', '')} is a valid public key.`);
    } catch {
      add(checks, name, 'fail', value ? `${name.replace('NEXT_PUBLIC_', '')} is not a valid public key.` : `${name.replace('NEXT_PUBLIC_', '')} is missing.`);
    }
  }

  const operations = parsedAddresses.get('NEXT_PUBLIC_TREASURY_WALLET');
  const assets = parsedAddresses.get('NEXT_PUBLIC_ASSET_TREASURY_WALLET');
  if (operations && assets) {
    add(
      checks,
      'treasury-separation',
      operations.equals(assets) ? 'fail' : 'pass',
      operations.equals(assets) ? 'Asset capital and operations point to the same wallet.' : 'Asset capital and operations use separate wallets.',
    );
  }

  return {
    ready: checks.every((check) => check.status !== 'fail'),
    checks,
  };
}

export function decodeLaunchConfig(address, data) {
  const discriminator = [155, 12, 170, 224, 30, 250, 204, 130];
  if (data.length < 155 || !discriminator.every((byte, index) => data[index] === byte)) {
    throw new Error('The configured account is not an IPO launch config.');
  }
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const readKey = (offset) => new PublicKey(data.slice(offset, offset + 32));
  const uriLength = view.getUint32(136, true);
  const numericOffset = 140 + uriLength;
  if (uriLength > 180 || numericOffset + 15 > data.length) throw new Error('The launch config is malformed.');
  return {
    address,
    authority: readKey(8),
    treasury: readKey(40),
    assetTreasury: readKey(72),
    coreCollection: readKey(104),
    metadataBaseUri: new TextDecoder().decode(data.slice(140, numericOffset)),
    totalSupply: view.getUint16(numericOffset, true),
    minted: view.getUint16(numericOffset + 2, true),
    mintPriceLamports: view.getBigUint64(numericOffset + 4, true),
    paused: data[numericOffset + 12] === 1,
  };
}
