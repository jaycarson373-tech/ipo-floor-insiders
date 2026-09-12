# IPO Deployment Review

Prepared from the verified source on 2026-09-12. This file contains public
addresses only.

## Fixed launch state

- Network target: Solana mainnet-beta, after a successful devnet rehearsal
- Program candidate: `GMSArcjhrpxt6JkqwmJX47tbuFH6PtdH21JARt3hBUnm`
- Config PDA after deployment: `FWUph1gcQRbfhUz6rMkScDEKLd4itHVLf2ZYF4oc1hR8`
- Deployment/config authority: `7vHThHyHXzEXyNwFYC4y2bVBAa5A4nAY2wUddr99dJ7C`
- Operations treasury: `5AjpQUTJSD4PJAx7v6saLv1wLwABk7pJn83q9tgiX875`
- Asset-capital treasury: `7vHThHyHXzEXyNwFYC4y2bVBAa5A4nAY2wUddr99dJ7C`
- Core collection candidate: `3oWH9UQ2E8D7GuHUAfzn1GTkB9HAoEfbRo7JJ7e4o4RK`
- Metadata base: `https://ipo-floor-insiders.vercel.app/api/metadata`
- Supply: 1,200
- Price: 0.12 SOL
- Per mint: 0.12 SOL asset capital and 0 SOL operations
- `$IPO` mint dependency: none
- Paid upgrades: disabled; future upgrade mint is unset

The asset-capital and operations destinations are different addresses. The
asset-capital destination currently uses the deployment authority address. Move
it to reviewed multisig custody before enabling mint if that is not the intended
operating model.

## Verified package

- Program binary: 270,216 bytes
- SHA-256: `4784b3b4a58e36508a68add8c6e4074a03d92838c95320b33e1e47adf21c9adb`
- Program-data rent floor: 1.37357612 SOL
- Recommended peak deployment funding: 2.847152240 SOL, including a same-size temporary buffer and 0.1 SOL setup/fee headroom
- Current deployer balance: 0 SOL on devnet and mainnet-beta
- Web: lint, typecheck, 26 tests, and production build pass
- Program: 6 Rust tests and Anchor build pass
- Local chain: deploy, Core collection creation, config initialization, two signed mints, exact 0.12 SOL routing, duplicate rejection, insufficient-balance rejection, and pause rejection pass
- Metadata: all 1,200 IDs resolve locally; sampled artwork outputs are distinct

The rent floor is not the final funding amount. Deployment also needs temporary
buffer capacity, collection/config account rent, and transaction fees.

## Hard blocks

1. Fund the deployment authority and repeat the successful local rehearsal on devnet.
2. Independently review program and custody design; tests are not a smart-contract audit.
3. Approve and freeze the 1,200 images/metadata or move them to permanent storage.
4. Fund the deployment authority only after reviewing the exact transaction
   sequence and cluster.
5. Deploy program, create collection, and initialize config.
6. Run `npm run launch:preflight` against mainnet until every check passes.
7. Publish the complete verified environment set to Vercel together.

Until those steps are complete, the production site must continue to show the
membership preview and must not expose a working-looking mint button.
