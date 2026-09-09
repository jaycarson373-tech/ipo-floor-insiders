# IPO Economics and Entitlement Specification

## Product

IPO means Initial Pump Offering. It is a Solana launch platform with two paths: instant fair launches on supported Pump infrastructure and curated presales with structured terms. It also combines 1,212 desk NFTs and IPO Watch research rooms. Research can exist without a token, and creators do not need a desk to prepare an instant launch. Project tokens are not actual company IPOs or company equity.

## Mint policy

- Price: 0.12 SOL per desk plus network/account costs.
- Mint-funded assets: 80%, or 0.096 SOL per desk.
- Operations: 20%, or 0.024 SOL per desk.
- No `$IPO` requirement, lock, or burn.
- Full-supply scenario: 145.44 SOL gross, 116.352 SOL initial assets, and 29.088 SOL operations. This is not money already raised.

The revised Anchor source routes the two amounts atomically to distinct treasuries and records both on the desk account. Desk minting does not depend on a `$IPO` mint. This changes account layout and initialization arguments, so an old deployment cannot be reused silently. The web client decodes the new layout and verifies the separate published asset treasury before minting.

## Entitlement accounting

Initial capital stays attributable to its desk until purchased or claimed. Purchases may batch execution while preserving per-desk integer balances and unspent amounts. Mint capital is not yield or protocol revenue.

Recurring rewards use finalized epochs. One eligible desk equals one unit. A newly minted desk cannot join historical epochs. On transfer, future participation starts with the next epoch; balances finalized for the previous owner remain theirs. Claims use immutable allocation IDs and reject duplicates. Pool/vault addresses are excluded from the denominator. Integer division dust remains in the source account under published treatment.

This epoch, transfer, purchase-failure, rounding, and duplicate-claim logic is locally tested. Production enforcement still needs ownership indexing/proofs, an accumulator or vault, purchase instructions, allocation finalization, and a claim program.

## Assets

The target basket is a small, reviewed set of third-party tokenized pre-IPO exposure. Every entry needs an exact Solana mint, provider, category, backing/rights documentation, transfer constraints, token controls/extensions, quote route, liquidity limits, current purchase eligibility, and timestamp. No such asset is currently purchase-enabled in this repository.

Project/community tokens, third-party exposure, and issuer-authorized securities remain distinct. A provider token is not its underlying exposure. Failed or expired quotes retain funds visibly as unspent; no substitute purchase is allowed.

## IPO Rooms

Room drafts store thesis, source, catalyst and confidence, invalidation criteria, author, and sponsorship/financial-interest disclosure locally. Browser-local revision history, follows, bookmarks, alert preferences, share-card copying, campaign drafts, and pending contribution submissions are implemented for workflow testing. Production publishing, notifications, funded campaigns, reviewer decisions, reward receipts, moderation, discussion, and durable storage still need authenticated services.

An optional room launch uses the current six-step fair-launch builder. Proposed third-party creator-fee routing is 60% coin-holder purchases, 15% desk-holder purchases, 15% creator, and 10% IPO platform operations. The template applies only to creator fees received and requires creator authorization and chain-state verification. The 15% desk pool uses equal participation by eligible desk at the finalized epoch; it is not a fixed return.

Curated presales are a separate application path. Deposits remain disabled until segregated escrow, published caps and tranches, oversubscription rules, settlement authorization, cancellation, and refunds are implemented and reviewed. A Pump bonding curve does not create a fixed-price presale allocation.

Current Pump documentation describes an initial fee-sharing config with the creator at 100%, followed by a one-time final recipient update that revokes the admin; fee sweeps and distribution are permissionless. IPO must verify the finalized config from chain state. That primitive routes creator-fee receipts but does not provide dynamic holder snapshots, reward purchases, accrual, or claims.

For `$IPO` itself, the planned policy is 100% of creator-fee receipts actually received by the project toward desk-holder asset purchases. Operations pays execution costs separately. This is planned until routing, indexing, and purchases are deployed and verified.

## Upgrades

Optional `$IPO` upgrades use five proposed product levels: Member, Scout, Analyst, Operator, and Studio. They may provide alerts, research organization, analytics, exports, creator tools, personalization, and artwork. They do not multiply payouts. Holdings, essential disclosures, claims, receipts, and equal desk participation remain accessible without an upgrade.

The configured draft burn policy sends 100% of any future `$IPO` upgrade payment to burn. No price is set, and payments are disabled. The on-chain burn path exists but its mint address is unset until the authority explicitly configures upgrades. A future release must verify the exact `$IPO` mint, burn instruction, transaction confirmation, and resulting supply before enabling or displaying a paid level change. Upgrade burns may not use mint-funded assets, desk rewards, or operations balances.

## Status

Implemented: responsive product shell, Room drafts and local social workflow, campaign/submission preview, launch/support drafts, deterministic desk art, wallet flow, revised 80/20 mint source/client, integer accounting domain, transfer cutoffs, failure retention, duplicate protection, and public docs.

Preview: mint and accounting source before deployment, research publishing, asset registry review, launch configuration, and reward allocation.

Blocked: public mint config, tokenized pre-IPO purchase registry, Pump execution, fee indexing, purchases, ownership history, reward vault/claims, Room backend, valuations, and production activity receipts.
