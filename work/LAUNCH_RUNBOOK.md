# IPO Launch Runbook

## Confirmed Economics

- Supply: 1,212 Metaplex Core assets
- Mint payment: 0.044 SOL per desk
- Mint token requirement: none
- Token lock or burn during mint: none
- Upgrade currency: `$IPO`, after mint only
- Upgrade levels: five configurable levels
- Maximum gross mint proceeds: 53.328 SOL before network and account costs

The mint instruction transfers SOL, creates the Core asset, and records the desk atomically. A failed Core creation rolls back the SOL transfer. Upgrade execution is disabled by default until the authority explicitly configures and publishes the five upgrade prices.

## Public Addresses

- Setup funding wallet: `7vHThHyHXzEXyNwFYC4y2bVBAa5A4nAY2wUddr99dJ7C`
- Treasury wallet: `5AjpQUTJSD4PJAx7v6saLv1wLwABk7pJn83q9tgiX875`
- Existing program address: `2P9ehfkHUgght4YmW43YG1vEqFatKa3zKAkaV5ona7wo`
- Planned Core collection address: `3oWH9UQ2E8D7GuHUAfzn1GTkB9HAoEfbRo7JJ7e4o4RK`

These addresses do not prove that the current source has been deployed. Verify every account and the deployed program data against the intended cluster before enabling public minting.

The real `$IPO` token mint is intentionally not hard-coded. Supply it through `IPO_MINT` only after verifying the mint and authority on the selected cluster.

## Funding

Fund the setup wallet, not the treasury:

```text
7vHThHyHXzEXyNwFYC4y2bVBAa5A4nAY2wUddr99dJ7C
```

Determine the required balance from a devnet rehearsal and current mainnet fees. The repository does not promise that a fixed funding estimate will cover deployment. Unused SOL remains in the setup wallet.

## Verification

```bash
cd work/site
npm run lint
npm run typecheck
npm test
npm run build:vercel

cd ../program
cargo fmt --check
cargo test
NO_DNA=1 anchor build
```

Before mainnet, deploy and test the same build on devnet. Complete at least one successful mint and test wallet rejection, insufficient SOL, paused mint, wrong collection, sold out, disconnect, duplicate submission prevention, pending confirmation, failure, and confirmed receipt states. Configure upgrades only after the five prices and token policy are approved.

## Mainnet Setup

Mainnet setup requires the verified `$IPO` mint and an explicit operator confirmation:

```bash
IPO_MINT=<PUBLIC_IPO_TOKEN_MINT> work/scripts/run-mainnet-setup.sh
```

It performs these steps:

1. Prints the authority, program, `$IPO` upgrade mint, and treasury.
2. Builds and deploys the Anchor program.
3. Creates the Core collection with the program config PDA as update authority.
4. Creates the `$IPO` token vault owned by the config PDA.
5. Initializes the 1,212 supply and 0.044 SOL mint price.
6. Prints the public site environment values.

Do not run this command until devnet verification is complete. The redesign task does not deploy contracts or execute mainnet transactions.

## Site Environment

Publish the verified values printed by the initializer:

```bash
NEXT_PUBLIC_SOLANA_CLUSTER=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=<MAINNET_RPC_URL>
NEXT_PUBLIC_IPO_PROGRAM_ID=<PROGRAM_ID>
NEXT_PUBLIC_IPO_CONFIG=<CONFIG_PDA>
NEXT_PUBLIC_IPO_MINT=<IPO_MINT>
NEXT_PUBLIC_IPO_VAULT=<CONFIG_OWNED_VAULT>
NEXT_PUBLIC_TREASURY_WALLET=<TREASURY>
NEXT_PUBLIC_CORE_COLLECTION=<CORE_COLLECTION>
NEXT_PUBLIC_METADATA_BASE_URL=https://<PUBLIC_SITE>/api/metadata
NEXT_PUBLIC_SITE_URL=https://<PUBLIC_SITE>
```

The website enables minting only after it fetches the config and verifies program ownership, 1,212 supply, 0.044 SOL price, and zero `$IPO` mint requirement. It simulates each signed transaction before sending it and waits for confirmation before showing success.

## Planned, Not Live

The 3.3% holder reserve, allocation rounds, project review, KYC workflow, launchpad, IPO Signal, claims, and issuer-backed pre-IPO inventory are not implemented in this repository. Keep their actions disabled and their status labeled `Planned` until contracts, funding, moderation, compliance, and backend flows are deployed and independently tested.
