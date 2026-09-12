import { BadgeCheck, BookOpenCheck, CircleAlert, Gavel, ReceiptText, ShieldCheck } from "lucide-react";

const signals = [
  [BookOpenCheck, "Disclosure completeness", "Required terms and material updates published before and during the offering."],
  [BadgeCheck, "Verified milestones", "Token, authority, fee route, launch, and settlement state read from verifiable sources."],
  [ReceiptText, "Fulfilled obligations", "Allocations, distributions, vesting events, and creator commitments tied to receipts."],
  [Gavel, "Resolution history", "Cancelled launches, refunds, disputes, and corrective updates preserved in the record."],
];

export default function ReputationPage() {
  return (
    <main className="ipoReputationPage">
      <header>
        <div><p>IPO RECORD / REPUTATION</p><h1>EARN THE RECORD.<br />KEEP IT PUBLIC.</h1><span>IPO reputation is an evidence layer for creators and offerings. It is not a token balance, popularity contest, or paid badge.</span></div>
        <div className="ipoReputationSeal"><ShieldCheck /><strong>NOT FOR SALE</strong><span>VERIFIABLE EVENTS ONLY</span></div>
      </header>
      <section className="ipoReputationSignals">
        <div><p>WHAT COUNTS</p><h2>Behavior over hype.</h2></div>
        <div>{signals.map(([Icon, title, description]) => { const SignalIcon = Icon as typeof BookOpenCheck; return <article key={String(title)}><SignalIcon /><h3>{String(title)}</h3><p>{String(description)}</p></article>; })}</div>
      </section>
      <section className="ipoReputationBoundaries">
        <div><BadgeCheck /><h3>Evidence can improve a record</h3><p>Complete disclosures, fulfilled distributions, verified launches, timely refunds, and transparent corrections.</p></div>
        <div><CircleAlert /><h3>Money cannot improve a record</h3><p>Buying or burning $IPO, owning more Pumpios, paying for placement, follower counts, and token price performance.</p></div>
      </section>
      <section className="ipoReputationStatus"><span>INDEXER STATUS</span><strong>NOT CONNECTED</strong><p>The methodology and interface are ready. Public creator scores remain disabled until signed identities, indexed events, dispute handling, and an appeal process are implemented.</p></section>
    </main>
  );
}
