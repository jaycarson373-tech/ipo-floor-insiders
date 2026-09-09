# IPO — Initial Pump Offering

IPO is an Initial Pump Offering platform for instant fair launches, curated presale preparation, sourced IPO Watch research rooms, and a limited desk membership. The interface separates mint-funded asset capital from revenue-funded rewards and distinguishes receipts, purchases, allocations, claims, burns, and operations.

## Desk defaults

- Supply: `1,212` Metaplex Core NFTs
- Mint price: `0.12 SOL` per desk plus network/account costs
- `$IPO` required to mint: none
- Reward participation: equal base weight per eligible desk
- Proposed mint split: `80%` desk-attributed asset capital / `20%` operations
- Gross sellout scenario: `145.44 SOL`; this is not money already raised
- Proposed fair-launch creator-fee split: `60%` coin-holder purchases / `15%` desk-holder purchases / `15%` creator / `10%` platform operations
- Proposed upgrades: five tool and art levels with `100%` of upgrade payments burned; pricing and payment disabled

All product economics are centralized in `work/site/product-config.json`. The client refuses to enable minting if deployed configuration differs from the expected supply, SOL price, or zero-token requirement.

## Status

Available locally: sourced Room drafts with preserved revisions, local follows/bookmarks, share-card copying, contribution campaign drafts, pending local submissions, launch/support application drafts, fee-share validation, deterministic artwork, wallet connection, revised Metaplex Core mint source with atomic 80/20 routing, transaction states, integer epoch accounting, receipt deduplication, equal desk allocation, and documentation. Browser-local social and campaign actions do not publish, notify, fund rewards, or submit work to IPO.

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
