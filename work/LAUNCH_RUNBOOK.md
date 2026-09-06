# IPO Floor Launch Runbook

## Fixed Economics

- Supply: 333 Metaplex Core assets
- Mint payment: 0.25 SOL
- Mint lock: 1,000,000 IPO, scaled using the token mint's decimals
- Markets: GTA, NLNK, ANTH, assigned by serial
- Upgrades: Base through L10 using the published ten-step cost table
- Sellout SOL revenue: 83.25 SOL before network and account-rent costs

The mint instruction transfers SOL, transfers IPO into the config-owned vault, creates the Core asset, and records the desk atomically. A failed Core creation rolls back every transfer.

## Public Addresses

- Setup funding wallet: `7vHThHyHXzEXyNwFYC4y2bVBAa5A4nAY2wUddr99dJ7C`
- Treasury wallet: `5AjpQUTJSD4PJAx7v6saLv1wLwABk7pJn83q9tgiX875`
- Program: `2P9ehfkHUgght4YmW43YG1vEqFatKa3zKAkaV5ona7wo`
- Planned Core collection: `3oWH9UQ2E8D7GuHUAfzn1GTkB9HAoEfbRo7JJ7e4o4RK`

The real IPO token mint is intentionally not hard-coded. Supply it through `IPO_MINT` after verifying it on the selected cluster.

## Funding

Fund the setup wallet, not the treasury:

```text
7vHThHyHXzEXyNwFYC4y2bVBAa5A4nAY2wUddr99dJ7C
```

Recommended mainnet setup funding: 2 SOL. The script prints the current balance before asking for confirmation. Unused SOL remains in the setup wallet.

## Verification

```bash
npm run lint
npm --workspace sites-project run typecheck
npm test
npm run build:vercel
npm run anchor:build
```

Before mainnet, deploy and test the same program on devnet with a devnet IPO test mint. Complete at least one successful mint and these failure cases: insufficient SOL, insufficient IPO, wrong token account, paused mint, wrong collection, and sold-out supply.

## Mainnet Setup

The mainnet wrapper requires the real token mint and an explicit confirmation:

```bash
IPO_MINT=<PUBLIC_IPO_TOKEN_MINT> work/scripts/run-mainnet-setup.sh
```

It performs these steps:

1. Prints the funded authority, program, IPO mint, and treasury.
2. Builds and deploys the Anchor program.
3. Creates the Core collection with the program config PDA as update authority.
4. Creates the IPO token vault owned by the config PDA.
5. Initializes fixed supply and pricing.
6. Prints the exact public site environment values.

## Site Environment

Publish the values printed by the initializer:

```bash
NEXT_PUBLIC_SOLANA_CLUSTER=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=<MAINNET_RPC_URL>
NEXT_PUBLIC_IPO_PROGRAM_ID=<PROGRAM_ID>
NEXT_PUBLIC_IPO_CONFIG=<CONFIG_PDA>
NEXT_PUBLIC_IPO_MINT=<IPO_MINT>
NEXT_PUBLIC_IPO_VAULT=<CONFIG_OWNED_VAULT>
NEXT_PUBLIC_TREASURY_WALLET=<TREASURY>
NEXT_PUBLIC_CORE_COLLECTION=<CORE_COLLECTION>
NEXT_PUBLIC_METADATA_BASE_URL=https://ipo-floor-insiders.vercel.app/api/metadata
```

The website enables mint only after it fetches the config and verifies the program owner, 333 supply, 0.25 SOL price, and 1,000,000 IPO lock. It simulates the signed transaction before sending it and verifies the resulting Core asset after confirmation.

## Not Live

The 3.3% holder pool, allocation rounds, project review/KYC workflow, launchpad, and rentals remain Coming Soon. Do not market those as operational until their contracts and backend flows are deployed and tested.
