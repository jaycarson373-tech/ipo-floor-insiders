# IPO Product Specification

## Confirmed for this revision

- Collection: 1,212 Metaplex Core Launch Pass memberships.
- Mint price: 0.044 SOL per pass, plus separately disclosed network and account costs.
- Mint currency: SOL only. No `$IPO` lock, burn, or payment during mint.
- Collection art: deterministic architectural trading and research workspaces with five visual stages.
- Product category: curated Solana project-token launch discovery and membership.
- Essential ownership information, receipts, and future claims remain available without an upgrade.

The repository does not contain substantiated issuer-backed tokenized pre-IPO assets, company share ownership, issuer affiliations, or guaranteed launch allocations. Company research entries must not be presented as confirmed offerings.

## Implemented

- A dark responsive Explore, My Pass, Signal, Activity, and Docs interface.
- A SOL-only Anchor mint instruction for Metaplex Core assets.
- Frontend verification that blocks minting when deployed config differs from 1,212 supply, 0.044 SOL price, or zero `$IPO` mint requirement.
- Wallet balance checks, transaction simulation, duplicate submission prevention, submitted and confirmed states, failure recovery, and transaction receipts.
- Deterministic metadata and five artwork stages for all 1,212 Launch Pass IDs.
- Upgrade configuration controlled by the program authority and disabled by default.

## Planned, Not Implemented

- Project-funded holder-drop templates: 3.3% standard or 10% featured.
- Allocation calculation, cutoff snapshots, vesting, claims, unclaimed-token policy, refunds, and funding receipts.
- Project intake, review, launch terms, and Pump.fun integration.
- Address-based token comparison and market-data adapters.
- IPO-token genesis claims for verified Launch Pass holders.
- A receipt-backed revenue-funded IPO buyback and burn policy.
- IPO Signal campaign funding, moderation, anti-abuse checks, contribution credits, and rewards.
- Public upgrade prices and payment execution.

## Proposed holder reserve

For a future project-token launch, a project may select a 3.3% standard reserve or 10% featured reserve of total token supply for eligible passes. A round must not open until the reserve is funded and the asset mint, eligibility cutoff, equal per-pass weighting, rounding, vesting, claim conditions, and unclaimed-token treatment are published. These are templates, not automatic entitlements, company equity, guaranteed purchase rights, or guaranteed returns.

## Launch rail proposal

Selected projects may prepare launch terms through IPO and create their token through Pump.fun. Pump.fun currently documents SOL and USDC launch pairs and automatic graduation from its bonding curve to a canonical PumpSwap pool. The repository does not create Pump.fun coins, route trades, collect creator fees, or support a direct PUMP-token pair.

## IPO token proposal

A future IPO token may launch through Pump.fun. A genesis claim for verified Launch Pass holders requires final snapshot rules, token amount, exclusions, vesting, claim authority, funding, and an audited claim contract. A future buyback and burn policy requires a finalized revenue percentage, public wallets, programmatic controls, accounting, and transaction receipts. Neither proposal creates revenue rights or a promise of returns.

## Upgrade proposal

Five membership levels are displayed: Member, Researcher, Analyst, Strategist, and Director. Upgrades may add watchlists, research tools, alerts, analytics, appearance options, and contribution history. Pricing and final benefits remain unresolved, so upgrade payments stay disabled. Basic allocation rights must not depend on upgrading in the first release.

## Launch blockers

1. Deploy and verify the current program build on devnet, then mainnet only after approval.
2. Create and verify the Core collection and `$IPO` upgrade vault.
3. Configure production environment addresses from deployed accounts.
4. Run wallet and transaction-state testing against devnet.
5. Decide and publish upgrade economics before enabling upgrades.
6. Implement and audit reserve funding, allocation, claim, and receipt contracts before marketing holder drops as live.
7. Complete legal and compliance review for any issuer-backed asset access.
8. Connect a reviewed Pump.fun launch flow and market-data adapter before enabling launch or comparison actions.
9. Finalize and audit any IPO genesis claim or revenue-funded buyback and burn policy before announcing entitlement or execution.
