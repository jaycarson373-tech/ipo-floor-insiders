import Link from "next/link";
import { launchConfig, mintEnvironmentConfigured } from "../launch-config";
import { productFeatures } from "../product-data";

function Flag({
  live = false,
  blocked = false,
}: {
  live?: boolean;
  blocked?: boolean;
}) {
  return (
    <span
      className={`status ${live ? "status-available" : blocked ? "status-blocked" : "status-preview"}`}
    >
      {live ? "AVAILABLE" : blocked ? "BLOCKED" : "PREVIEW"}
    </span>
  );
}

export default function DocsPage() {
  const mintConfigured = mintEnvironmentConfigured;
  const sections = [
    "overview",
    "economics",
    "ownership",
    "assets",
    "rooms",
    "launches",
    "fee-routing",
    "rewards",
    "upgrades",
    "status",
    "disclosures",
  ];
  return (
    <main className="docsPage">
      <header className="siteHeader">
        <Link className="wordmark" href="/">
          <span>IPO</span>
          <small>PRODUCT DOCS</small>
        </Link>
        <nav>
          <Link href="/">Explore</Link>
          <a href="#rooms">Rooms</a>
          <a href="#status">Status</a>
        </nav>
        <div className="headerActions">
          <Link href="/">Back to app</Link>
        </div>
      </header>
      <header className="docsHero shell">
        <p className="eyebrow">INITIAL PUMP OFFERING</p>
        <h1>Terms before transactions.</h1>
        <p>
          Fair launches, curated presales, desk economics, $IPO upgrades, and
          the receipts required before any financial action can be described as
          complete.
        </p>
      </header>
      <div className="docsLayout shell">
        <aside className="docsNav">
          {sections.map((section) => (
            <a href={`#${section}`} key={section}>
              {section.replaceAll("-", " ")}
            </a>
          ))}
        </aside>
        <article className="docsContent">
          <section id="overview">
            <p className="eyebrow">OVERVIEW</p>
            <h2>A launch platform with a limited membership layer.</h2>
            <p>
              IPO means Initial Pump Offering. It combines instant fair-launch
              tooling, curated presale preparation, 1,212 desk NFTs, and IPO
              Watch research rooms. A creator can prepare a launch without a
              desk; membership participates in separately disclosed desk pools
              and unlocks optional product tools.
            </p>
            <p>
              Project tokens are not company IPOs. Third-party tokenized pre-IPO
              exposure requires explicit provider and rights verification.
            </p>
          </section>
          <section id="economics">
            <p className="eyebrow">PROPOSED V1 MINT POLICY</p>
            <h2>
              {launchConfig.supply.toLocaleString()} desks at{" "}
              {launchConfig.mintPriceSol.toFixed(2)} SOL.
            </h2>
            <div className="docRows">
              <div>
                <strong>Mint-funded assets</strong>
                <p>
                  80% or 0.096 SOL per desk, attributable to that desk until
                  purchased or claimed under published rules.
                </p>
              </div>
              <div>
                <strong>Operations</strong>
                <p>
                  20% or 0.024 SOL per desk for development, infrastructure, and
                  operations.
                </p>
              </div>
              <div>
                <strong>Extra costs</strong>
                <p>
                  Network and account-creation costs are disclosed separately.
                </p>
              </div>
              <div>
                <strong>$IPO requirement</strong>
                <p>None. No token lock or burn is required to mint.</p>
              </div>
              <div>
                <strong>Full-supply scenario</strong>
                <p>
                  145.44 SOL gross, 116.352 SOL initial assets, and 29.088 SOL
                  operations. This is a scenario, not funds raised.
                </p>
              </div>
            </div>
            <Flag live={mintConfigured} blocked={!mintConfigured} />
            <p>
              {mintConfigured
                ? "The client verifies deployed supply, price, and zero-token requirement before minting."
                : "The revised source splits each mint between separate asset and operations treasuries, but it is not deployed and public config is missing. Minting remains disabled."}
            </p>
          </section>
          <section id="ownership">
            <p className="eyebrow">OWNERSHIP AND EPOCHS</p>
            <h2>Earned balances stay; future rights move.</h2>
            <p>
              One desk equals one base participation unit. Initial desk capital
              stays attributable to that desk. Revenue rewards accrue to
              eligible owners by finalized epoch. Selling a desk transfers
              participation starting with the next epoch; rewards finalized for
              the previous owner remain claimable by that owner.
            </p>
            <p>
              The integer epoch adapter, rounding, excluded-address handling,
              transfer cutoff, and duplicate-claim protection are tested
              locally. A production indexer, accumulator/vault, ownership
              proofs, and claim program are not deployed.
            </p>
            <Flag />
          </section>
          <section id="assets">
            <p className="eyebrow">ASSET REGISTRY</p>
            <h2>No address, no purchase.</h2>
            <p>
              An asset record must include exact chain and mint, provider,
              category, backing and rights documents, transfer constraints,
              token program and extensions, authorities, supported quote route,
              liquidity limits, purchase status, and verification time.
            </p>
            <p>
              Project/community tokens, third-party tokenized private-company
              exposure, and issuer-authorized securities are distinct
              categories. IPO currently has no purchase-enabled tokenized
              pre-IPO asset. Failed quotes retain visible unspent capital; the
              system never silently substitutes another asset.
            </p>
            <Flag blocked />
          </section>
          <section id="rooms">
            <p className="eyebrow">IPO ROOMS / IPO WATCH</p>
            <h2>Research can exist without a token.</h2>
            <p>
              Room drafts capture a thesis, dated source, catalyst with
              confirmed/reported/speculative status, invalidation criteria,
              author identity, and sponsorship or financial-interest disclosure.
              Local drafts, preserved browser revisions, follows, bookmarks,
              alert preferences, and share-card copying work now.
            </p>
            <p>
              A campaign lab stores campaign terms and pending contributions in
              the browser without claiming funding, review, rewards, or
              publication. Authentication, durable storage, real notifications,
              discussion, moderation, reviewer decisions, funding, and reward
              receipts require backend services. No fake rooms or engagement
              numbers appear while those services are unavailable.
            </p>
            <Flag />
          </section>
          <section id="launches">
            <p className="eyebrow">TWO LAUNCH PATHS</p>
            <h2>Instant fair launch or curated presale.</h2>
            <p>
              The instant six-step builder records token metadata, reviewed
              reward asset, fee shares, optional initial buy, full review, and
              execution readiness. Drafts persist through interruption. Pump
              create_v2 can compose creation with an initial buy; successful
              bonding curves graduate to PumpSwap.
            </p>
            <p>
              Curated presales use a separate application and published terms.
              Deposits require reviewed segregated escrow, caps, tranche rules,
              oversubscription treatment, settlement authorization,
              cancellation, and refunds. A Pump bonding curve does not provide
              fixed-price presale escrow by itself.
            </p>
            <p>
              Metadata storage, final recipients, Pump SDK transaction
              execution, creator authorization, and post-transaction chain-state
              verification are not connected. A saved launch packet is not a
              launched token.
            </p>
            <p>
              Pump&apos;s current fee-sharing flow creates an initial config with
              the creator at 100%, then permits one final recipient update that
              revokes the admin. Sweeping and distribution are permissionless.
              IPO must read that resulting config on-chain before describing a
              route as verified; fee distribution alone is not a holder reward
              accounting or claim system.
            </p>
            <Flag />
          </section>
          <section id="fee-routing">
            <p className="eyebrow">THIRD-PARTY CREATOR-FEE TEMPLATE</p>
            <h2>60 / 15 / 15 / 10.</h2>
            <div className="docRows">
              <div>
                <strong>Coin-holder purchases</strong>
                <p>60% of creator fees actually collected.</p>
              </div>
              <div>
                <strong>Desk-holder purchases</strong>
                <p>15%, allocated equally per eligible desk by epoch.</p>
              </div>
              <div>
                <strong>Creator</strong>
                <p>15%.</p>
              </div>
              <div>
                <strong>IPO platform operations</strong>
                <p>10%, the proposed disclosed platform share.</p>
              </div>
            </div>
            <p>
              This is configurable and applies to creator-fee receipts, not
              total volume or all trading fees. It cannot redirect an existing
              coin without creator authorization. Routing is verified only after
              reading chain state.
            </p>
            <p>
              For IPO’s own token, the planned policy is 100% of creator-fee
              receipts actually received by the project toward
              desk-holder purchases, with execution costs funded separately by
              operations. It remains planned.
            </p>
          </section>
          <section id="rewards">
            <p className="eyebrow">ACCOUNTING STATES</p>
            <h2>Contributed is not earned.</h2>
            <p>
              Initial capital waiting, mint-funded assets purchased, recurring
              revenue awaiting investment, revenue-funded rewards, claimable
              balances, claimed balances, and operations are separate. Mint
              capital is not yield or recurring revenue. No APR, redemption
              floor, principal protection, or resale guarantee exists.
            </p>
            <p>
              Receipt deduplication, integer splits, per-desk allocation, dust
              preservation, purchase-failure retention, and duplicate claims are
              tested. Production collection, purchase, and claim infrastructure
              remains blocked.
            </p>
          </section>
          <section id="upgrades">
            <p className="eyebrow">OPTIONAL $IPO UTILITY</p>
            <h2>
              Five tool levels and a proposed{" "}
              {launchConfig.upgradePolicy.burnBps / 100}% burn.
            </h2>
            <p>
              The proposed progression is Member, Scout, Analyst, Operator,
              and Studio. Features may include alerts, research organization,
              analytics, exports, creator tools, personalization, and artwork.
              Basic holdings, claims, receipts, disclosures, and equal economic
              participation stay available to every entitled desk.
            </p>
            <p>
              The configured draft sends{" "}
              {launchConfig.upgradePolicy.burnBps / 100}% of any future upgrade
              payment to an $IPO burn and zero to the desk or operations pools. Pricing,
              payment, and on-chain burn execution are disabled until the token
              mint and program are verified. Upgrades never multiply reward
              weight.
            </p>
          </section>
          <section id="status">
            <p className="eyebrow">IMPLEMENTATION STATUS</p>
            <h2>Available, preview, and blocked.</h2>
            <div className="statusRows">
              {productFeatures.map((feature) => (
                <div key={feature.name}>
                  <Flag
                    live={feature.status === "available"}
                    blocked={feature.status === "blocked"}
                  />
                  <div>
                    <strong>{feature.name}</strong>
                    <p>{feature.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section id="disclosures">
            <p className="eyebrow">DISCLOSURES</p>
            <h2>Exposure is not equity by default.</h2>
            <p>
              Tokenized private-company exposure may be a third-party instrument
              with contractual, eligibility, transfer, liquidity, and
              counterparty constraints. It must not be described as company
              stock, voting rights, official affiliation, or guaranteed IPO
              access unless issuer-supported documentation proves those exact
              rights.
            </p>
            <p>
              No launch, asset availability, valuation, reward, claim value,
              liquidity, return, acceptance, or resale is guaranteed. Passing
              tests is not a smart-contract audit.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
