import { Activity, ArrowRight, ReceiptText } from "lucide-react";
import Link from "next/link";

export default function ActivityPage() {
  return (
    <main className="lpMain lpAppPage lpWrap">
      <div className="lpPageIntro"><div><span>PROTOCOL ACTIVITY</span><h1>Receipts, not vanity metrics.</h1><p>Launches, fee receipts, purchases, allocations, claims, settlements, cancellations, and refunds belong in one auditable timeline.</p></div><div className="lpPreviewBadge"><i /> INDEXER OFFLINE</div></div>
      <div className="lpActivitySummary">
        <article><span>VERIFIED LAUNCHES</span><strong>Unavailable</strong></article>
        <article><span>FEES COLLECTED</span><strong>Unavailable</strong></article>
        <article><span>REWARDS DELIVERED</span><strong>Unavailable</strong></article>
        <article><span>REFUNDS COMPLETED</span><strong>Unavailable</strong></article>
      </div>
      <section className="lpActivityTable">
        <div><span>EVENT</span><span>PROJECT</span><span>STATE</span><span>RECEIPT</span></div>
        <div className="lpEmptyLedger"><Activity size={28} /><div><strong>No production activity indexed.</strong><p>The interface does not turn wallet connections, drafts, or submitted signatures into completed financial events.</p></div></div>
      </section>
      <div className="lpActivityRules"><ReceiptText size={18} /><p>A transaction is complete only after confirmation and chain-state verification. Failed or interrupted setup remains visible and recoverable.</p></div>
      <Link className="lpTextLink" href="/docs#status">View implementation status <ArrowRight size={15} /></Link>
    </main>
  );
}
