# IPO + Pumpios Launch Runbook

## Hard gate

Do not enable minting because the frontend says 1,200. The client must read and match the deployed executable program, config owner, exact supply, 0.12 SOL price, Core collection, metadata base URL, pause state, and published accounts.

## Required migration

1. Review the deterministic 1,200-item metadata and generative artwork service, then freeze or move it to permanent storage.
2. Decide whether to deploy a new program/config or migrate the existing deployment.
3. Review the ten-level on-chain mapping, cost indexes, authority model, and metadata update path.
4. Create the Pumpios Metaplex Core collection under the intended authority.
5. Publish immutable HTTPS metadata.
6. Deploy and initialize on devnet with supply 1,200 and price 120,000,000 lamports.
7. Test wallet rejection, insufficient balance, pause, sold out, duplicate submission, partial multi-mint, confirmation, metadata, transfers, and upgrades.
8. Complete security review and authority/treasury policy.
9. Deploy mainnet only with explicit authorization.
10. Publish the complete address set together and pass read-only production preflight.

## Rewards gate

Before activating PUMP distributions or $IPO buyback/burn, publish exact mints and pair, revenue sources, custody, percentages, execution costs, swap routes, slippage, snapshot rules, exclusions, rounding/dust, distribution or claims, unclaimed treatment, retries, and transaction receipts.

Do not use mint capital or owed rewards as protocol revenue. Do not show unavailable values as zero.

## Presale gate

Keep deposits disabled until segregated escrow, soft/hard caps, participant limits, tranche inventory, oversubscription, release authority, cancellation, settlement, and refunds are implemented and reviewed. A public bonding curve is not fixed-price presale escrow.

## Final checks

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

After the deployment authority holds at least 2.5 devnet SOL, run the complete
devnet sequence from the repository root with `npm run launch:devnet`. It deploys,
initializes, smoke-mints, tests rejection states, and runs the read-only preflight.

Verify every major route at 390px, 430px, and desktop. Confirm no horizontal overflow, broken art, fake activity, or enabled financial action without verified infrastructure.
