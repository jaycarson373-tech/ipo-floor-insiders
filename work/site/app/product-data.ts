export type ProductStatus = 'available' | 'preview' | 'blocked';

export const rewardAssets = [
  {
    id: 'wsol',
    name: 'Wrapped SOL',
    symbol: 'wSOL',
    mint: 'So11111111111111111111111111111111111111112',
    chain: 'Solana',
    category: 'network asset',
    provider: 'Solana native wrapper',
    tokenProgram: 'SPL Token',
    controls: 'Native wrapper; no mint or freeze authority',
    quoteRoute: 'Pump SOL quote asset',
    controlsCheckedAt: '2026-09-08',
    liquidityCheckedAt: '',
    backingReviewedAt: '',
    purchaseEligible: false,
    note: 'Identity matched. Reward-purchase execution is not connected.',
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    chain: 'Solana',
    category: 'third-party payment token',
    provider: 'Circle',
    tokenProgram: 'SPL Token',
    controls: 'Dynamic authority and extension recheck required before execution',
    quoteRoute: 'Pump USDC quote asset',
    controlsCheckedAt: '',
    liquidityCheckedAt: '',
    backingReviewedAt: '',
    purchaseEligible: false,
    note: 'Identity matched. Controls, liquidity, and execution eligibility are pending.',
  },
] as const;

export const productFeatures: Array<{ name: string; status: ProductStatus; detail: string }> = [
  { name: 'IPO Room research workspace', status: 'available', detail: 'Sourced drafts, revision history, local follows, bookmarks, alert preferences, and share-card copying work in this browser.' },
  { name: 'Contribution campaign lab', status: 'available', detail: 'Campaign drafts and pending contribution submissions persist locally; funding, review, rewards, and publication need production services.' },
  { name: '80/20 mint split source', status: 'preview', detail: 'The revised Anchor source atomically splits and records each mint; it is not deployed or externally reviewed.' },
  { name: 'Launch planning and recovery', status: 'available', detail: 'Drafts persist in this browser and produce a complete review packet.' },
  { name: 'Pump create_v2 execution', status: 'blocked', detail: 'Requires metadata storage, production recipient wallets, SDK transaction QA, and operator enablement.' },
  { name: 'Creator-fee reconciliation', status: 'preview', detail: 'Integer accounting and receipt deduplication are tested; no production indexer is connected.' },
  { name: 'Reward allocation and claims', status: 'preview', detail: 'Equal per-desk allocation logic is tested; vault, purchase, and claim programs are not deployed.' },
  { name: 'Curated support applications', status: 'available', detail: 'Applications can be retained as a local draft; server submission is not connected.' },
];
