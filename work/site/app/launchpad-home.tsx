import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  CircleDollarSign,
  FileCheck2,
  Flame,
  Gavel,
  Landmark,
  ReceiptText,
  Rocket,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { launchConfig } from "./launch-config";
import PumpioArt from "./pumpio-art";
import { pumpioPreviews } from "./pumpio-data";

const revenue = launchConfig.platformRevenueBps;
const launchRules = [
  ["Terms before funds", "Token identity, allocation, caps, timing, vesting, and cancellation rules are published before participation."],
  ["One public book", "Raise state, material changes, settlement, and refunds belong in one timestamped offering record."],
  ["Money stays separated", "Presale deposits, holder rewards, mint receipts, and operating funds use distinct accounting."],
  ["Proof after execution", "A signature is pending. IPO marks actions complete only after chain state and receipts verify the result."],
];

export default function LaunchpadHome() {
  return (
    <main className="ipoHome">
      <section className="ipoHero">
        <div className="ipoHeroGrid" aria-hidden="true" />
        <div className="ipoHeroInner">
          <div className="ipoHeroCopy">
            <p className="ipoKicker"><span /> INITIAL PUMP OFFERING / SOLANA</p>
            <h1>THE LAUNCHPAD<br />BEFORE THE <em>PUMP.</em></h1>
            <p className="ipoHeroLead">A marketplace for structured presales and fair launches. Publish the terms, build a verifiable record, and move from idea to market in public.</p>
            <div className="ipoHeroActions">
              <Link className="ipoAction primary" href="/launchpad">EXPLORE OFFERINGS <ArrowRight size={17} /></Link>
              <Link className="ipoAction secondary" href="/launch">START A LAUNCH BRIEF</Link>
            </div>
            <p className="ipoHeroNote">Browsing and launch drafting are open. Deposits and Pump execution remain disabled until their rails are verified.</p>
          </div>

          <div className="ipoMarketPanel" aria-label="IPO marketplace status">
            <div className="ipoMarketTop"><span>IPO MARKET / PRIMARY BOOK</span><b>PUBLIC PREVIEW</b></div>
            <div className="ipoMarketTitle">
              <div className="ipoMarketMark">IPO</div>
              <div><small>OFFERING 0001</small><strong>THE FIRST VERIFIED LAUNCH</strong></div>
            </div>
            <div className="ipoMarketState">
              <span>MARKET STATUS</span><strong>AWAITING VERIFIED OFFERING</strong>
              <div><i /><i /><i /><i /><i /></div>
              <small>No fabricated project, raise, volume, or countdown.</small>
            </div>
            <div className="ipoMarketFacts">
              <div><span>PRESALE</span><strong>TERMS FIRST</strong></div>
              <div><span>FAIR LAUNCH</span><strong>CHAIN VERIFIED</strong></div>
              <div><span>REPUTATION</span><strong>EARNED</strong></div>
              <div><span>SETTLEMENT</span><strong>RECEIPTED</strong></div>
            </div>
          </div>
        </div>
        <div className="ipoHeroRail">
          {[["01", "DISCOVER"], ["02", "PREPARE"], ["03", "OPEN"], ["04", "SETTLE"], ["05", "PROVE"]].map(([number, label]) => <div key={number}><span>{number}</span><strong>{label}</strong></div>)}
        </div>
      </section>

      <section className="ipoBand ipoMarket" id="market">
        <div className="ipoSectionHead">
          <div><p>01 / MARKETPLACE</p><h2>TWO WAYS TO<br />OPEN THE MARKET.</h2></div>
          <p>Choose a direct fair launch or prepare a reviewed presale. Both paths expose status and terms before asking for a signature.</p>
        </div>
        <div className="ipoLaunchPaths">
          <article><div><Rocket /><span>INSTANT</span></div><h3>FAIR LAUNCH</h3><p>Prepare a token, reward route, and launch record for supported Pump infrastructure.</p><small>EXECUTION INTEGRATION PENDING</small><Link href="/launch">BUILD THE BRIEF <ArrowRight size={15} /></Link></article>
          <article><div><Landmark /><span>CURATED</span></div><h3>STRUCTURED PRESALE</h3><p>Apply with allocation, caps, vesting, settlement, cancellation, and refund terms.</p><small>APPLICATION DRAFTING AVAILABLE</small><Link href="/launch">START AN APPLICATION <ArrowRight size={15} /></Link></article>
        </div>
        <div className="ipoBoard">
          <div className="ipoBoardHead"><span>OFFERING</span><span>TYPE</span><span>STATE</span><span>TERMS</span><span>PROOF</span></div>
          <div className="ipoBoardEmpty"><FileCheck2 /><div><strong>No verified offerings are open.</strong><p>The board stays empty until a project publishes real terms and a source-backed state.</p></div><Link href="/launchpad">VIEW MARKET <ArrowRight size={15} /></Link></div>
        </div>
      </section>

      <section className="ipoBand ipoRules" id="standard">
        <div className="ipoSectionHead light">
          <div><p>02 / THE IPO STANDARD</p><h2>FAIR IS A SET<br />OF RULES.</h2></div>
          <p>Every offering uses the same disclosure standard. Sponsored placement cannot purchase approval or rewrite the record.</p>
        </div>
        <div className="ipoRuleGrid">
          {launchRules.map(([title, description], index) => <article key={title}><span>0{index + 1}</span><Scale /><h3>{title}</h3><p>{description}</p></article>)}
        </div>
        <Link className="ipoInlineLink light" href="/docs#launch-rules">READ THE LAUNCH RULES <ArrowRight size={15} /></Link>
      </section>

      <section className="ipoBand ipoReputation" id="reputation">
        <div className="ipoReputationCopy">
          <p className="ipoLabel">03 / REPUTATION</p>
          <h2>THE RECORD<br />IS THE REPUTATION.</h2>
          <p>Creators build an IPO Record by publishing complete terms, honoring distributions, resolving refunds, and keeping material updates on the books.</p>
          <div className="ipoTruthPill"><ShieldCheck size={16} /><span>REPUTATION CANNOT BE BOUGHT, BURNED, OR UPGRADED.</span></div>
          <Link className="ipoInlineLink" href="/reputation">SEE THE REPUTATION STANDARD <ArrowRight size={15} /></Link>
        </div>
        <div className="ipoRecord">
          <div className="ipoRecordTop"><span>IPO RECORD / CREATOR</span><b>UNSCORED</b></div>
          {[[BookOpenCheck, "DISCLOSURE COMPLETENESS", "NOT INDEXED"], [ReceiptText, "FULFILLED DISTRIBUTIONS", "NO DATA"], [Gavel, "REFUND RESOLUTION", "NO DATA"], [BadgeCheck, "VERIFIED MILESTONES", "NO DATA"]].map(([Icon, label, value]) => {
            const RecordIcon = Icon as typeof BookOpenCheck;
            return <div className="ipoRecordRow" key={String(label)}><RecordIcon size={18} /><span>{String(label)}</span><strong>{String(value)}</strong></div>;
          })}
          <p>Unavailable history is never converted into a zero score.</p>
        </div>
      </section>

      <section className="ipoBand ipoRevenue" id="revenue">
        <div className="ipoSectionHead">
          <div><p>04 / VALUE ROUTING</p><h2>REVENUE GOES<br />BACK ON THE BOOKS.</h2></div>
          <p>A configured platform-revenue policy, separate from mint proceeds and each project&apos;s creator-fee agreement.</p>
        </div>
        <div className="ipoRevenueSource"><CircleDollarSign /><span>PLATFORM REVENUE ACTUALLY RECEIVED</span><strong>100%</strong><small>EXECUTION NOT ACTIVE</small></div>
        <div className="ipoRevenueSplit">
          <article className="holders"><strong>{revenue.holderRewards / 100}%</strong><span>PUMPIO-HOLDER REWARDS</span><p>Eligible holder purchases or distributions under published snapshot and claim rules.</p></article>
          <article className="burn"><strong>{revenue.ipoBuybackBurn / 100}%</strong><span>$IPO BUYBACK + BURN</span><p>Executed through disclosed routes with purchase and burn transactions.</p></article>
          <article className="ops"><strong>{revenue.protocolOperations / 100}%</strong><span>PROTOCOL OPERATIONS</span><p>Infrastructure, moderation, review, indexing, and continued development.</p></article>
        </div>
        <div className="ipoPolicyNote"><Flame size={17} /><p>This is the configured policy, not a claim that routing is live. It activates only after custody, execution, snapshots, claims, accounting, and public receipts are verified.</p></div>
      </section>

      <section className="ipoBand ipoMembership" id="pumpios">
        <div className="ipoMembershipArt">
          {pumpioPreviews.slice(0, 3).map((item, index) => <figure className={`ipoPumpio ipoPumpio${index + 1}`} key={item.id}><PumpioArt art={item.art} /><figcaption>#{String(item.id).padStart(4, "0")} / {item.rarity}</figcaption></figure>)}
        </div>
        <div className="ipoMembershipCopy">
          <p className="ipoLabel">05 / MEMBERSHIP</p>
          <h2>1,200 PUMPIOS.<br />ONE REWARD LAYER.</h2>
          <p>Pumpios are the collectible membership layer behind IPO, not the product itself. One NFT carries one equal base reward unit under the published holder policy.</p>
          <dl><div><dt>SUPPLY</dt><dd>{launchConfig.supply.toLocaleString()}</dd></div><div><dt>TARGET MINT</dt><dd>{launchConfig.mintPriceSol.toFixed(2)} SOL</dd></div><div><dt>BASE WEIGHT</dt><dd>1 / NFT</dd></div></dl>
          <p className="ipoSmall">Mint remains release-gated while the revised Core collection and program configuration are not deployed on mainnet.</p>
          <Link className="ipoAction dark" href="/pumpios">EXPLORE PUMPIOS <Sparkles size={15} /></Link>
        </div>
      </section>

      <section className="ipoBand ipoProofCta">
        <div><p className="ipoLabel">06 / PROOF</p><h2>DON&apos;T TRUST THE PITCH.<br />READ THE RECEIPTS.</h2><p>Contracts, fee receipts, settlement, refunds, reward purchases, holder distributions, and burns belong in one proof center.</p></div>
        <div><Link className="ipoAction primary" href="/proof">OPEN PROOF CENTER <ArrowRight size={16} /></Link><Link className="ipoAction secondary" href="/docs">READ THE DOCS</Link></div>
      </section>

      <section className="ipoClosing">
        <div><p>INITIAL PUMP OFFERING / SOLANA</p><h2>BRING THE IDEA.<br />OPEN THE MARKET.</h2></div>
        <Link className="ipoAction paper" href="/launch">START A LAUNCH BRIEF <ArrowRight size={17} /></Link>
      </section>
    </main>
  );
}
