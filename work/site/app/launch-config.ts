import productConfig from '../product-config.json';

export const launchConfig = {
  cluster: process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? 'devnet',
  rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com',
  programId: process.env.NEXT_PUBLIC_IPO_PROGRAM_ID ?? '2P9ehfkHUgght4YmW43YG1vEqFatKa3zKAkaV5ona7wo',
  config: process.env.NEXT_PUBLIC_IPO_CONFIG ?? '',
  ipoMint: process.env.NEXT_PUBLIC_IPO_MINT ?? '',
  ipoVault: process.env.NEXT_PUBLIC_IPO_VAULT ?? '',
  treasury: process.env.NEXT_PUBLIC_TREASURY_WALLET ?? '',
  assetTreasury: process.env.NEXT_PUBLIC_ASSET_TREASURY_WALLET ?? '',
  coreCollection: process.env.NEXT_PUBLIC_CORE_COLLECTION ?? '',
  metadataBaseUrl: process.env.NEXT_PUBLIC_METADATA_BASE_URL ?? '/api/metadata',
  mintPriceSol: productConfig.mintPriceSol,
  mintPriceLamports: BigInt(productConfig.mintPriceLamports),
  mintPriceIpo: 0,
  supply: productConfig.supply,
  maxLevels: productConfig.maxLevels,
  defaultFeeSharesBps: productConfig.defaultFeeSharesBps,
  draftMintCapitalBps: productConfig.draftMintCapitalBps,
  upgradePolicy: productConfig.upgradePolicy,
  pumpExecutionEnabled: process.env.NEXT_PUBLIC_PUMP_EXECUTION_ENABLED === 'true',
};
