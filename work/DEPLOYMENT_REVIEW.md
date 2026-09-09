# IPO Deployment Review

Prepared from the verified build on 2026-09-09. This file contains public
addresses only.

## Fixed launch state

- Network target: Solana mainnet-beta, after a successful devnet rehearsal
- Program: `9Gqg4yjDH34pgMXRTqxdJFbzvzeBBDkGvaJvb9kKRaPU`
- Config PDA: `Emg8QsJyiGgyQCNxjR6C1X7VD27A1Q56GRdXJZFk49Go`
- Deployment/config authority: `7vHThHyHXzEXyNwFYC4y2bVBAa5A4nAY2wUddr99dJ7C`
- Operations treasury: `5AjpQUTJSD4PJAx7v6saLv1wLwABk7pJn83q9tgiX875`
- Asset-capital treasury: `7vHThHyHXzEXyNwFYC4y2bVBAa5A4nAY2wUddr99dJ7C`
- Core collection candidate: `3oWH9UQ2E8D7GuHUAfzn1GTkB9HAoEfbRo7JJ7e4o4RK`
- Metadata base: `https://ipo-floor-insiders.vercel.app/api/metadata`
- Supply: 1,212
- Price: 0.12 SOL
- Per mint: 0.096 SOL asset capital and 0.024 SOL operations
- `$IPO` mint dependency: none
- Paid upgrades: disabled; future upgrade mint is unset

The asset-capital and operations destinations are different addresses. The
asset-capital destination currently uses the deployment authority address; move
to reviewed multisig custody before enabling mint if that is not the intended
operating model.

## Verified package

- Program binary: 270,312 bytes
- SHA-256: `bed565d1655c8ea0e42fe3ac0fa5c0047f493cf03cd45652e669a395238f80ea`
- Program-data rent floor: 1.712981505 SOL
- Config rent floor: 0.003641475 SOL
- Current deployer balance: 0 SOL on devnet and mainnet-beta
- Web: lint, typecheck, 21 tests, and production build pass
- Program: 6 Rust tests and Anchor build pass
- Public site, docs, metadata, and collection manifest return HTTP 200

The rent floor is not the final funding amount. Deployment also needs temporary
buffer capacity, collection/config account rent, and transaction fees.

## Hard blocks

1. Rehearse deploy, initialize, mint, reject, and confirm behavior on devnet.
2. Resolve or independently validate the current SBF post-processing warning
   about standard Solana syscalls before mainnet deployment.
3. Review program and custody design; tests are not a smart-contract audit.
4. Fund the deployment authority only after reviewing the exact transaction
   sequence and cluster.
5. Deploy program, create collection, and initialize config.
6. Run `npm run launch:preflight` against mainnet until every check passes.
7. Publish the complete verified environment set to Vercel together.

Until those steps are complete, the production site must continue to show the
membership preview and must not expose a working-looking mint button.
