import productConfig from '../product-config.json';

export const launchConfig = {
  cluster: process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? 'devnet',
  rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com',
  programId: process.env.NEXT_PUBLIC_IPO_PROGRAM_ID ?? 'GMSArcjhrpxt6JkqwmJX47tbuFH6PtdH21JARt3hBUnm',
  config: process.env.NEXT_PUBLIC_IPO_CONFIG ?? '',
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
  platformRevenueBps: productConfig.platformRevenueBps,
  platformRevenueExecutionEnabled: productConfig.platformRevenueExecutionEnabled,
  upgradePolicy: productConfig.upgradePolicy,
  pumpExecutionEnabled: process.env.NEXT_PUBLIC_PUMP_EXECUTION_ENABLED === 'true',
  publicMintEnabled: process.env.NEXT_PUBLIC_PUBLIC_MINT_ENABLED === 'true',
};

export const mintEnvironmentConfigured = [
  launchConfig.config,
  launchConfig.treasury,
  launchConfig.assetTreasury,
  launchConfig.coreCollection,
].every(Boolean) && launchConfig.treasury !== launchConfig.assetTreasury;

export const publicMintConfigured = mintEnvironmentConfigured && launchConfig.publicMintEnabled;
