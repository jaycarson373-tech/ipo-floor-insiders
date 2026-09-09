# IPO Launch Runbook

## Fixed frontend economics

- Supply: 1,212 desks
- Mint payment: 0.12 SOL per desk
- `$IPO` mint requirement: zero
- Base reward weight: equal per eligible desk
- Mint allocation: 80% to the separate asset-capital treasury and 20% to operations

Do not launch if the deployed program config differs. The client fetches the config, checks program ownership, supply, price, pause state, and zero-token requirement, simulates the mint, prevents duplicate submission, waits for confirmation, and verifies asset ownership before success.

## Required external services

1. Publish final Metaplex collection and program/config addresses.
2. Host immutable NFT and launch-token metadata.
3. Configure production RPC, treasury, collection, and program environment values.
4. Complete devnet mint, rejection, insufficient-balance, pause, sold-out, and duplicate tests.
5. Review the Anchor program and collection authorities before any mainnet deployment.
6. Configure Pump SDK execution, creator-fee recipients, and post-transaction chain-state verification.
7. Deploy fee reconciliation, reward quote/purchase, vault, snapshot, allocation, and claim services.
8. Configure monitoring, retries, idempotency, and an activity indexer.
9. Implement authenticated curated applications and review records.
10. Select and review segregated escrow/settlement before enabling presale deposits.

## Launch state

Track: draft → metadata ready → token submitted → token confirmed → fee routing pending → fee routing verified → rewards active. A failure resumes from the last verified state. Never label a partially configured coin as a functioning reward launch.

## Financial boundaries

No mainnet token creation, fund movement, authority change, or fee finalization is part of frontend deployment. The proposed third-party creator-fee template is 60% coin-holder purchases, 15% desk-holder purchases, 15% creator, and 10% operations. Publish exact recipients, costs, eligibility, exclusions, rounding, dust, and unclaimed balances before enabling money flows.

## Deployment checks

```bash
npm ci
npm run generate:collection
npm run lint
npm --workspace sites-project run typecheck
npm test
npm run build:vercel
cd work/program && cargo fmt --check && cargo test
```

Verify 390px, 430px, and desktop layouts; keyboard navigation; disconnected wallet; rejection; insufficient balance; unavailable supply; pending/failed/confirmed states; duplicate prevention; and no production fixture data.
