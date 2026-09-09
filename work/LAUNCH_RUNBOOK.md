# IPO Launch Runbook

## Fixed frontend economics

- Supply: 1,212 desks
- Mint payment: 0.12 SOL per desk
- `$IPO` mint requirement: zero
- Base reward weight: equal per eligible desk
- Mint allocation: 80% to the separate asset-capital treasury and 20% to operations
- Fair-launch fee template: 60% coin-holder purchases, 15% desk-holder purchases, 15% creator, and 10% IPO platform operations
- Upgrade draft: five levels, 100% of upgrade payments burned, pricing and payment disabled

Do not launch if the deployed program config differs. The client fetches the config, checks program ownership, supply, price, pause state, and linked accounts, simulates the mint, prevents duplicate submission, waits for confirmation, and verifies asset ownership before success. Desk minting has no `$IPO` account dependency; a real `$IPO` mint is configured separately only if upgrades are enabled later.

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
11. Verify the `$IPO` mint, token program, burn instruction, supply readback, and upgrade-level authority before enabling upgrades.

## Launch state

Track: draft → metadata ready → token submitted → token confirmed → fee routing pending → fee routing verified → rewards active. A failure resumes from the last verified state. Never label a partially configured coin as a functioning reward launch.

Pump fee-sharing configuration starts with the creator at 100% and supports one final recipient update that revokes the admin. Verify the resulting config on-chain after finalization. Permissionless fee sweeps/distribution do not replace holder indexing, reward purchases, epoch allocation, or claims.

## Financial boundaries

No mainnet token creation, fund movement, authority change, or fee finalization is part of frontend deployment. The proposed third-party creator-fee template is 60% coin-holder purchases, 15% desk-holder purchases, 15% creator, and 10% operations. Publish exact recipients, costs, eligibility, exclusions, rounding, dust, and unclaimed balances before enabling money flows.

Upgrade payments are a separate proposed flow: 100% `$IPO` burn, 0% desk rewards, and 0% operations. Never burn holder assets or owed rewards. Confirm the burn and reduced supply on-chain before recording a new level.

## Deployment checks

```bash
npm ci
npm run generate:collection
npm run lint
npm --workspace sites-project run typecheck
npm test
npm run build:vercel
cd work/program && cargo fmt --check && cargo test
npm run launch:preflight
```

`npm run launch:preflight` is the final read-only mainnet gate. It validates the
central economics, required public environment, separate treasuries, executable
program, config ownership and decoding, Metaplex Core
collection ownership, pause/supply state, and public metadata. It exits nonzero
and sends no transaction when any check fails.

For a devnet rehearsal, run:

```bash
npm --workspace sites-project run launch:preflight -- --allow-devnet
```

Do not publish `NEXT_PUBLIC_IPO_CONFIG` by itself. Publish the complete address
set together only after this preflight passes against the same cluster and RPC
used by the production site.

The current verified program binary is 270,312 bytes with a program-data rent
floor of 1.712981505 SOL. This is not the complete deployment cost: temporary
buffer capacity, collection/config rent, and transaction fees also apply. See
`DEPLOYMENT_REVIEW.md` for the public address set and current hard blocks.

The config PDA is deterministically derived from the deployment authority and
program ID. For the checked-in deployment package it is
`Emg8QsJyiGgyQCNxjR6C1X7VD27A1Q56GRdXJZFk49Go`.

Verify 390px, 430px, and desktop layouts; keyboard navigation; disconnected wallet; rejection; insufficient balance; unavailable supply; pending/failed/confirmed states; duplicate prevention; and no production fixture data.
