"use client";

import {
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  FileCheck2,
  Gift,
  LockKeyhole,
  Radar,
  Rocket,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { launchConfig } from "./launch-config";

const stages = [
  ["01", "Apply", "Project, team, terms, and disclosures."],
  ["02", "Presale", "Separate raise terms and participant receipts."],
  ["03", "Fair launch", "Open Solana market through supported infrastructure."],
  ["04", "Reward", "Configured creator-fee receipts become trackable rewards."],
];

const launchFilters = ["All", "Upcoming", "Presale", "Fair launch", "Completed"];

export default function LaunchpadHome() {
  const [filter, setFilter] = useState("All");
  const emptyFilterLabel = filter === "All" ? "" : `${filter.toLowerCase()} `;

  return (
    <main className="lpMain">
      <section className="lpHeroImmersive">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" aria-hidden="true" className="lpHeroBackdrop" src="/launch-chamber-hero-v2.png" />
        <div className="lpHeroShade" />
        <div className="lpHeroStage lpWrap">
          <div className="lpHeroCopy">
            <div className="lpKicker"><span /> INITIAL PUMP OFFERING · SOLANA LAUNCHPAD</div>
            <h1>Initial Pump Offering.</h1>
            <p className="lpHeroLead">
              Structure a presale, publish the terms, move into a fair launch, and route disclosed creator fees back to the communities that made it possible.
            </p>
            <div className="lpHeroActions">
              <Link className="lpPrimary" href="/launch">Launch a project <ArrowRight size={17} /></Link>
              <a className="lpSecondary" href="#launches">Explore offerings</a>
            </div>
            <p className="lpHeroDisclosure">Brokerage-style clarity for project-token launches. IPO is not a broker, and project tokens are not company shares.</p>
          </div>
          <div className="lpHeroRoute" aria-label="Initial Pump Offering lifecycle">
            <div><span>01</span><strong>Structure</strong><small>Terms + presale</small></div>
            <ArrowRight />
            <div><span>02</span><strong>Launch</strong><small>Open market</small></div>
            <ArrowRight />
            <div><span>03</span><strong>Reward</strong><small>Visible fee route</small></div>
          </div>
        </div>
      </section>

      <div className="lpTape" aria-label="Platform capabilities">
        <span>PRESALE TERMS</span><i />
        <span>FAIR-LAUNCH RAIL</span><i />
        <span>CREATOR-FEE ROUTING</span><i />
        <span>HOLDER REWARDS</span><i />
        <span>ON-CHAIN RECEIPTS</span>
      </div>

      <section className="lpSection lpWrap" id="launches">
        <div className="lpSectionHead">
          <div><span>DISCOVER</span><h2>Offerings, not noise.</h2></div>
          <Link href="/launch">Submit a project <ArrowRight size={16} /></Link>
        </div>
        <div className="lpMarketTabs" role="tablist" aria-label="Offering filters">
          {launchFilters.map((label) => (
            <button
              aria-selected={filter === label}
              className={filter === label ? "active" : ""}
              key={label}
              onClick={() => setFilter(label)}
              role="tab"
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="lpLaunchTable">
          <div className="lpTableHead"><span>PROJECT</span><span>STAGE</span><span>TERMS</span><span>ACTIVITY</span><span /></div>
          <div className="lpLaunchEmpty">
            <Radar size={30} />
            <div><strong>No verified {emptyFilterLabel}offerings are open.</strong><p>The board only lists projects after their identity, terms, and launch state can be sourced.</p></div>
            <Link className="lpSecondary" href="/launch">Build the first draft</Link>
          </div>
        </div>
      </section>

      <section className="lpHowBand">
        <div className="lpWrap">
          <div className="lpSectionHead light"><div><span>THE IPO FLOW</span><h2>Raise clearly. Launch fairly. Reward visibly.</h2></div></div>
          <div className="lpStages">
            {stages.map(([number, title, copy]) => (
              <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>
            ))}
          </div>
          <div className="lpFlowNote"><LockKeyhole size={17} /><span>Presale deposits remain disabled until segregated escrow and refund settlement are implemented and reviewed.</span></div>
        </div>
      </section>

      <section className="lpSection lpWrap lpRewardSplit">
        <div className="lpRewardIntro">
          <span className="lpMiniLabel">WHY HOLDERS CARE</span>
          <h2>Every collected fee has a destination.</h2>
          <p>Projects can use a proposed fee template after launch. It applies to creator fees actually received, not trading volume or every protocol fee.</p>
          <Link className="lpPrimary" href="/rewards">Open rewards center <ArrowRight size={17} /></Link>
        </div>
        <div className="lpAllocation">
          <div className="coin"><span>60%</span><strong>Coin holders</strong><small>Eligible holder asset purchases</small></div>
          <div className="desk"><span>15%</span><strong>Desk holders</strong><small>Shared desk reward purchases</small></div>
          <div className="creator"><span>15%</span><strong>Creator</strong><small>Disclosed creator share</small></div>
          <div className="ops"><span>10%</span><strong>Operations</strong><small>Platform infrastructure</small></div>
        </div>
      </section>

      <section className="lpSection lpWrap lpMembershipTease">
        <div className="lpDeskThumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="IPO Launch Console architectural collectible" src="/collection/images/IPO-0420-L3.svg" />
        </div>
        <div>
          <span className="lpMiniLabel">DESK MEMBERSHIP</span>
          <h2>The launchpad&apos;s membership layer.</h2>
          <p>Anyone can browse and prepare a launch. Each desk has equal base participation in separately disclosed desk reward pools and a transparent mint-funded asset allocation.</p>
          <dl>
            <div><dt>SUPPLY</dt><dd>{launchConfig.supply.toLocaleString()}</dd></div>
            <div><dt>MINT</dt><dd>{launchConfig.mintPriceSol.toFixed(2)} SOL</dd></div>
            <div><dt>$IPO REQUIRED</dt><dd>NONE</dd></div>
          </dl>
          <Link className="lpSecondary" href="/collection">View the collection <Sparkles size={16} /></Link>
        </div>
      </section>

      <section className="lpSection lpWrap">
        <div className="lpSectionHead"><div><span>WHY LAUNCH HERE</span><h2>Built for the whole launch, not just the deploy button.</h2></div></div>
        <div className="lpReasons">
          <article><FileCheck2 /><h3>Terms first</h3><p>Presale structure, allocations, vesting, cancellation, and refund treatment live beside the project.</p></article>
          <article><Rocket /><h3>Two launch paths</h3><p>Prepare a fast fair launch or apply for a reviewed offering with a separate settlement path.</p></article>
          <article><Gift /><h3>Reward ledger</h3><p>Fees received, purchases, allocated rewards, claims, and failures are distinct states.</p></article>
          <article><BadgeCheck /><h3>Receipts over claims</h3><p>Addresses and transaction receipts become visible only after they can be verified.</p></article>
        </div>
      </section>

      <section className="lpFinalCta">
        <div className="lpWrap"><div><CircleDollarSign /><span>BUILD THE OFFERING</span><h2>Give your idea a fair start.</h2></div><Link className="lpPrimary" href="/launch">Start a launch draft <ArrowRight size={18} /></Link></div>
      </section>
    </main>
  );
}
