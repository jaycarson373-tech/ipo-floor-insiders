import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  Flame,
  Gift,
  Layers3,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { launchConfig } from "./launch-config";
import PumpioArt from "./pumpio-art";
import { levelPlan, pumpioPreviews, rarityPlan } from "./pumpio-data";

const showcase = [pumpioPreviews[2], pumpioPreviews[0], pumpioPreviews[8], pumpioPreviews[5], pumpioPreviews[6]];

export default function LaunchpadHome() {
  return (
    <main className="pioMain">
      <section className="pioHero">
        <div className="pioHeroCopy">
          <p className="pioEyebrow">IPO / SOLANA</p>
          <h1><span>1,200 PUMPIOS.</span> ONE INITIAL PUMP OFFERING.</h1>
          <p className="pioHeroLead">Mint a Pumpio for 0.12 SOL.</p>
          <p className="pioHeroSub">Collect. Level. Access the offering.</p>
          <div className="pioActions">
            <Link className="pioButton primary" href="/mint">MINT A PUMPIO / 0.12 SOL <ArrowRight size={17} /></Link>
            <Link className="pioButton ghost" href="/pumpios">EXPLORE COLLECTION</Link>
          </div>
          <div className="pioHeroFacts">
            <div><span>SUPPLY</span><strong>{launchConfig.supply.toLocaleString()}</strong></div>
            <div><span>PRICE</span><strong>{launchConfig.mintPriceSol.toFixed(2)} SOL</strong></div>
            <div><span>STATUS</span><strong>MIGRATION PENDING</strong></div>
          </div>
        </div>
        <div className="pioHeroArt" aria-label="Pumpios collection preview">
          {showcase.map((item, index) => (
            <figure className={`pioHeroPump pioHeroPump${index + 1}`} key={item.id}>
              <PumpioArt art={item.art} />
              <figcaption>#{String(item.id).padStart(4, "0")} / {item.rarity}</figcaption>
            </figure>
          ))}
          <div className="pioArtStamp"><Sparkles size={16} /> COLLECTION PREVIEW</div>
        </div>
      </section>

      <div className="pioTicker" aria-label="IPO product identity">
        <span>SERIOUS PRODUCT.</span><i />
        <span>UNSERIOUS UNDERWRITERS.</span><i />
        <span>INITIAL PUMP OFFERING.</span><i />
        <span>BUILT ON SOLANA.</span>
      </div>

      <section className="pioSection pioCream" id="pumpios">
        <div className="pioSectionHead">
          <div><p className="pioEyebrow">01 / PUMPIOS</p><h2>MEET THE PUMPIOS.</h2></div>
          <p>1,200 capsule-headed underwriters built for the Initial Pump Offering.</p>
        </div>
        <div className="pioPreviewGrid">
          {pumpioPreviews.slice(0, 8).map((item) => (
            <article className="pioCard" key={item.id}>
              <PumpioArt art={item.art} />
              <div><span>#{String(item.id).padStart(4, "0")}</span><strong>{item.name}</strong><small>{item.rarity}</small></div>
            </article>
          ))}
        </div>
        <div className="pioSectionAction">
          <div className="pioRarityLine">{rarityPlan.map((item) => <span key={item.label}><b>{item.count}</b> {item.label}</span>)}</div>
          <Link className="pioTextLink" href="/pumpios">EXPLORE COLLECTION <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="pioSection pioInk" id="leveling">
        <div className="pioSectionHead light">
          <div><p className="pioEyebrow">02 / LEVELING</p><h2>START AT THE BOTTOM.</h2></div>
          <p>Level your Pumpio through the IPO floor. Progression is visual and product-based, not a paid payout multiplier.</p>
        </div>
        <div className="pioLevelRail">
          {levelPlan.map((name, index) => (
            <div className={index === 9 ? "chairman" : ""} key={name}><span>{String(index + 1).padStart(2, "0")}</span><strong>{name}</strong></div>
          ))}
        </div>
        <div className="pioLevelFeature">
          <PumpioArt art="golden-pump" />
          <div><span>LEVEL 10 PREVIEW</span><h3>CHAIRMAN.</h3><p>A dramatic final art state and the deepest product toolkit. Upgrade prices and payments stay disabled until the migrated contract and final economics are verified.</p><Link href="/leveling">VIEW THE PROGRESSION <ArrowRight size={15} /></Link></div>
        </div>
      </section>

      <section className="pioSection pioAccess" id="access">
        <div className="pioSectionHead">
          <div><p className="pioEyebrow">03 / ACCESS</p><h2>GET IN BEFORE<br />THE MARKET OPENS.</h2></div>
          <p>Pumpios are the membership layer around IPO launches. Each offering must publish exactly what holders receive and when eligibility is measured.</p>
        </div>
        <div className="pioAccessFlow">
          <article><Search /><span>01</span><h3>Offering published</h3><p>Terms, token identity, funding state, and risks appear before participation.</p></article>
          <ArrowRight />
          <article><BadgeCheck /><span>02</span><h3>Holder snapshot</h3><p>A funded holder tranche uses a disclosed cutoff. No universal percentage is currently contract-enforced.</p></article>
          <ArrowRight />
          <article><Gift /><span>03</span><h3>Claim + proof</h3><p>Final allocation, vesting, unclaimed treatment, and transaction receipts remain visible.</p></article>
        </div>
        <div className="pioTruthNote"><ShieldCheck size={18} /><p>The previous universal 3.3% promise is not implemented in the current contract. IPO will only show holder priority on offerings where the tranche is funded and verifiable.</p></div>
      </section>

      <section className="pioSection pioRewards" id="rewards">
        <div className="pioSectionHead">
          <div><p className="pioEyebrow">04 / REWARDS</p><h2>THE FLOOR<br />GETS PAID.</h2></div>
          <p>As IPO grows, platform revenue can flow through Pumpio rewards, $IPO buybacks and continued development. Nothing is counted before it is received.</p>
        </div>
        <div className="pioRouting">
          <div className="source"><CircleDollarSign /><span>IPO REVENUE</span><strong>VERIFIED RECEIPTS ONLY</strong></div>
          <ArrowDown />
          <div className="routes">
            <article><Gift /><span>PUMP HOLDER REWARDS</span><strong>--</strong><small>NOT ACTIVE</small></article>
            <article><Flame /><span>$IPO BUYBACK + BURN</span><strong>--</strong><small>NOT ACTIVE</small></article>
            <article><Layers3 /><span>TREASURY</span><strong>--</strong><small>POLICY TBD</small></article>
          </div>
        </div>
        <Link className="pioTextLink" href="/rewards">OPEN REWARDS ARCHITECTURE <ArrowRight size={16} /></Link>
      </section>

      <section className="pioSection pioLaunchpad" id="launchpad">
        <div className="pioSectionHead light">
          <div><p className="pioEyebrow">05 / LAUNCHPAD</p><h2>THE MARKET<br />OPENS HERE.</h2></div>
          <p>Curated presales and fair launches presented as modern offering memoranda, with the money route beside the project.</p>
        </div>
        <div className="pioOfferingShell">
          <div className="pioOfferingHeader"><span>OFFERING</span><span>STATUS</span><span>TERMS</span><span>PROOF</span></div>
          <div className="pioOfferingEmpty"><Rocket /><div><strong>No verified offerings are open.</strong><p>Production cards appear only after project terms and launch state can be sourced. No fake raises, countdowns, or volume.</p></div><Link className="pioButton paper" href="/launch">BUILD A LAUNCH DRAFT</Link></div>
        </div>
        <Link className="pioTextLink light" href="/launchpad">ENTER THE LAUNCHPAD <ArrowRight size={16} /></Link>
      </section>

      <section className="pioSection pioRevenue" id="revenue">
        <div className="pioSectionHead">
          <div><p className="pioEyebrow">06 / REVENUE</p><h2>EVERY OFFERING<br />FEEDS THE FLOOR.</h2></div>
          <p>Revenue routing will separate collected fees, reward purchases, distributions, burns, and treasury funding.</p>
        </div>
        <div className="pioMetricGrid">
          {[["TOTAL IPO VOLUME", "--"], ["PLATFORM REVENUE", "--"], ["PUMP DISTRIBUTED", "--"], ["$IPO BURNED", "--"], ["TREASURY", "--"]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong><small>UNAVAILABLE</small></div>)}
        </div>
      </section>

      <section className="pioSection pioProof" id="proof">
        <div className="pioSectionHead light">
          <div><p className="pioEyebrow">07 / PROOF</p><h2>EVERYTHING<br />ON THE BOOKS.</h2></div>
          <p>Addresses and receipts replace promises. Missing infrastructure is shown as missing, never as zero.</p>
        </div>
        <div className="pioProofRows">
          {["MINT CONTRACT", "PUMPIOS COLLECTION", "$IPO TOKEN", "PUMP PAIR", "OFFERING CONTRACTS", "REVENUE TXS", "PUMPIO DISTRIBUTIONS", "$IPO BURNS"].map((label) => <div key={label}><span>{label}</span><strong>NOT PUBLISHED</strong><small>--</small></div>)}
        </div>
        <Link className="pioTextLink light" href="/proof">OPEN PROOF CENTER <ArrowRight size={16} /></Link>
      </section>

      <section className="pioFinal">
        <div><p className="pioEyebrow">PUMPIOS / 1,200</p><h2>CLAIM YOUR SEAT<br />AT THE OFFERING.</h2><p>Mint opens after the 1,200-supply Core collection and revised program configuration pass the public deployment checks.</p></div>
        <Link className="pioButton primary" href="/mint">VIEW MINT STATUS <ArrowRight size={17} /></Link>
      </section>
    </main>
  );
}
