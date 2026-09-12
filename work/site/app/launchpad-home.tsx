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
  ShieldCheck,
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
      <section className="lpHero lpWrap">
        <div className="lpHeroCopy">
          <div className="lpKicker"><span /> SOLANA LAUNCHPAD · PUBLIC PREVIEW</div>
          <h1>Initial Pump Offerings.</h1>
          <p className="lpHeroLead">
            Structured presales, fair launches, and holder rewards with the money route shown before anyone signs.
          </p>
          <div className="lpHeroActions">
            <Link className="lpPrimary" href="/launch">Create an offering <ArrowRight size={17} /></Link>
            <a className="lpSecondary" href="#launches">Browse launches</a>
          </div>
          <div className="lpHeroProof">
            <div><strong>2</strong><span>launch paths</span></div>
            <div><strong>1,212</strong><span>desk memberships</span></div>
            <div><strong>100%</strong><span>fee route disclosed</span></div>
          </div>
        </div>
        <div className="lpLaunchPreview" aria-label="Initial Pump Offering lifecycle preview">
          <div className="lpPreviewHead">
            <div className="lpTokenMark">I</div>
            <div><span>OFFERING PREVIEW</span><strong>YOUR PROJECT / $IDEA</strong></div>
            <b>PRE-LAUNCH</b>
          </div>
          <div className="lpCurvePanel">
            <div className="lpCurveMeta"><span>PRESALE PROGRESS</span><strong>TERMS REQUIRED</strong></div>
            <div className="lpCurveTrack"><i /></div>
            <div className="lpCurveLabels"><span>APPLICATION</span><span>FAIR LAUNCH</span></div>
          </div>
          <div className="lpPreviewGrid">
            <div><span>RAISE</span><strong>Not configured</strong></div>
            <div><span>DESK REWARD SHARE</span><strong>15% template</strong></div>
            <div><span>SETTLEMENT</span><strong>Disabled</strong></div>
            <div><span>VERIFICATION</span><strong>Required</strong></div>
          </div>
          <p><ShieldCheck size={15} /> A saved launch draft is not a token, sale, or guarantee.</p>
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
          <img alt="IPO Desk architectural collectible" src="/collection/images/IPO-0420-L3.svg" />
        </div>
        <div>
          <span className="lpMiniLabel">DESK MEMBERSHIP</span>
          <h2>A membership layer, not a toll booth.</h2>
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
