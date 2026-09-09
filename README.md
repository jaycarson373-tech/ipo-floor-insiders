# IPO — Initial Pump Offering

IPO combines Solana desk membership, sourced IPO Watch research rooms, and optional project-token launch tools. The interface separates mint-funded asset capital from revenue-funded rewards and distinguishes receipts, purchases, allocations, claims, and operations.

## Desk defaults

- Supply: `1,212` Metaplex Core NFTs
- Mint price: `0.12 SOL` per desk plus network/account costs
- `$IPO` required to mint: none
- Reward participation: equal base weight per eligible desk
- Proposed mint split: `80%` desk-attributed asset capital / `20%` operations
- Gross sellout scenario: `145.44 SOL`; this is not money already raised

All product economics are centralized in `work/site/product-config.json`. The client refuses to enable minting if deployed configuration differs from the expected supply, SOL price, or zero-token requirement.

## Status

Available locally: sourced Room drafts, launch/support application drafts, fee-share validation, deterministic artwork, wallet connection, revised Metaplex Core mint source with atomic 80/20 routing, transaction states, integer epoch accounting, receipt deduplication, equal desk allocation, and documentation.

Not production-connected: Pump execution, metadata storage, recipient fee accounts, creator-fee indexing, reward purchases, reward vault/claims, ownership indexing, curated submission backend, presale escrow, settlements, refunds, and activity indexing. Production actions remain disabled rather than represented with fake data.

## Commands

```bash
npm install
npm run dev:vercel -- --port 3001
npm run lint
npm --workspace sites-project run typecheck
npm test
npm run build:vercel
```

See `work/PRODUCT_SPEC.md` and `work/LAUNCH_RUNBOOK.md` for product boundaries and launch requirements.
