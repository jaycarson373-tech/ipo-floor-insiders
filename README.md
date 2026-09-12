# IPO + Pumpios

IPO means Initial Pump Offering: a Solana launchpad for structured presale preparation, fair launches, and transparent reward routing. Pumpios are the intended 1,200-item Metaplex Core membership collection.

## Intended economics

- Pumpios supply: `1,200`
- Mint price: `0.12 SOL` plus network/account costs
- `$IPO` required to mint: none
- Mint allocation: `100%` to Pumpio-attributed mint-funded asset capital in the revised source
- Base participation: equal per eligible Pumpio when an offering publishes a funded holder program
- Levels: ten intended product/art stages; prices unset and payments disabled

All target economics are centralized in `work/site/product-config.json`. The previous source and frontend used a 1,212-item collection. Changing this file does not change any deployed contract; production minting remains disabled until the revised program/config and Pumpios Core collection are deployed and verified.

## Product status

Implemented locally: responsive IPO/Pumpios frontend, approved collection-preview art, rarity filtering and search, Pumpio detail previews, launch-draft persistence, wallet detection, deployment validation, transaction lifecycle, integer reward accounting, receipt deduplication, and a migration-blocked mint interface.

Preview only: the final 1,200-item art/metadata set, ten-level upgrades, holder snapshots, PUMP rewards, $IPO buyback/burn, revenue routing, offering cards, and proof ledgers.

Blocked externally: finalized metadata, Metaplex Core collection, revised program/config deployment, production RPC/address set, Pump integration, creator-fee indexer, swap/reward engine, ownership snapshots, claims/distributions, presale escrow, refunds, and security review.

## Commands

```bash
cd work/site
npm run generate:collection
npm run lint
npm run typecheck
npm test
npm run build:vercel
npm run launch:preflight

cd ../program
cargo fmt --check
cargo test
```

`launch:preflight` is read-only and intentionally fails until the complete production deployment matches the target configuration.
