import { ArrowRight, BadgeCheck, CircleAlert, FileText, Rocket, Scale, ShieldCheck } from "lucide-react";
import Link from "next/link";

const fields = ["PROJECT", "THESIS", "PAIR", "PRESALE TERMS", "TARGET", "HOLDER PRIORITY", "TIMELINE", "LAUNCH CONDITIONS", "REVENUE ROUTING", "CONTRACTS", "PROOF", "RISK DISCLOSURES"];

export default function LaunchpadPage() {
  return (
    <main className="pioPage">
      <header className="pioPageHero pioLaunchHero">
        <div><p className="pioEyebrow">INITIAL PUMP OFFERING / MARKET</p><h1>THE MARKET OPENS HERE.</h1><p>A professional marketplace for structured presales and fair launches. Every listing must put terms, status, reputation evidence, money routes, and proof in one record.</p><div className="pioActions"><Link className="pioButton primary" href="/launch">START A LAUNCH BRIEF <ArrowRight size={16} /></Link><a className="pioButton ghost" href="#offerings">VIEW THE BOOK</a></div></div>
        <div className="pioProspectus"><span>IPO 0000</span><FileText /><h2>YOUR PROJECT</h2><p>OFFERING MEMORANDUM</p><dl><div><dt>STATUS</dt><dd>DRAFT</dd></div><div><dt>PAIR</dt><dd>UNSET</dd></div><div><dt>TERMS</dt><dd>REQUIRED</dd></div></dl></div>
      </header>
      <section className="pioOfferingPage" id="offerings">
        <div className="pioSectionHead"><div><p className="pioEyebrow">OFFERING BOARD</p><h2>LAUNCHES, WITH RECEIPTS.</h2></div><p>Upcoming, live, filled, opening, and trading states come from real project data. Nothing is open right now.</p></div>
        <div className="pioOfferingEmpty large"><Rocket /><div><strong>No verified Initial Pump Offerings.</strong><p>Production offerings will appear after exact token identity, terms, creator authorization, and launch state are available.</p></div><Link className="pioButton primary" href="/launch">CREATE A DRAFT</Link></div>
      </section>
      <section className="pioOfferingAnatomy">
        <div><p className="pioEyebrow">OFFERING DETAIL STANDARD</p><h2>Everything needed to understand the deal.</h2><p>An offering page is not a hype card. It is a readable record of what is being launched, who controls it, where money goes, and what can fail.</p></div>
        <div className="pioFieldGrid">{fields.map((field) => <span key={field}><BadgeCheck size={14} /> {field}</span>)}</div>
      </section>
      <section className="ipoMarketRules">
        <div><p className="pioEyebrow">THE IPO STANDARD</p><h2>Fair launch rules</h2><span>These rules define how a launch earns its place on the marketplace.</span></div>
        <ol>
          <li><Scale /><div><strong>Publish terms before participation</strong><p>Exact token identity, caps, timing, allocation, vesting, cancellation, refunds, authorities, and fee routes.</p></div></li>
          <li><Scale /><div><strong>Separate every balance</strong><p>Deposits, holder rewards, platform revenue, creator proceeds, and operations must be independently reconcilable.</p></div></li>
          <li><Scale /><div><strong>Use equal published access rules</strong><p>Wallet caps, eligibility, oversubscription, and any Pumpio tranche are disclosed before the opening block.</p></div></li>
          <li><Scale /><div><strong>Prove completion</strong><p>Settlement, refunds, fee routing, distributions, and burns are complete only after verifiable receipts.</p></div></li>
        </ol>
      </section>
      <section className="pioLaunchBoundaries">
        <div><ShieldCheck /><h3>Fair-launch infrastructure</h3><p>IPO intends to use supported Pump infrastructure rather than inventing a new exchange. Execution is not connected yet.</p></div>
        <div><CircleAlert /><h3>Presale settlement</h3><p>Deposits stay disabled until segregated escrow, caps, cancellation, and refunds are implemented and reviewed.</p></div>
      </section>
    </main>
  );
}
