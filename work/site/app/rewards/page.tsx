import { ArrowRight, CircleAlert, Coins, Gift, ReceiptText, WalletCards } from "lucide-react";
import Link from "next/link";

export default function RewardsPage() {
  return (
    <main className="lpMain lpAppPage lpWrap">
      <div className="lpPageIntro">
        <div><span>REWARDS CENTER</span><h1>Know what was earned and why.</h1><p>Track collected creator fees, completed purchases, desk allocations, and claims as separate verifiable events.</p></div>
        <div className="lpPreviewBadge"><i /> PREVIEW</div>
      </div>
      <section className="lpRewardHero">
        <div><Gift size={24} /><span>PROPOSED DESK ROUTE</span><strong>15%</strong><p>of creator-fee receipts collected by participating third-party launches, routed to shared desk-holder asset purchases.</p></div>
        <div><Coins size={24} /><span>IPO TOKEN POLICY</span><strong>100%</strong><p>of creator-fee receipts actually received by IPO is planned for desk purchases. This route is not deployed or verified.</p></div>
      </section>
      <section className="lpRewardLedger">
        <div className="lpSectionHead"><div><span>MY REWARDS</span><h2>Wallet ledger</h2></div><div className="lpWalletInline"><WalletCards size={16} /> Connect from the header</div></div>
        <div className="lpLedgerGrid">
          <article><span>FEES RECEIVED</span><strong>Unavailable</strong><small>No production indexer</small></article>
          <article><span>AWAITING PURCHASE</span><strong>Unavailable</strong><small>No verified fee route</small></article>
          <article><span>ASSETS ALLOCATED</span><strong>Unavailable</strong><small>No finalized epoch</small></article>
          <article><span>CLAIMABLE</span><strong>Unavailable</strong><small>No claim program</small></article>
        </div>
        <div className="lpEmptyLedger"><ReceiptText size={28} /><div><strong>No verified reward activity.</strong><p>Zero and unavailable are different. Values appear here only after receipts can be indexed and reconciled.</p></div></div>
      </section>
      <section className="lpRewardRules">
        <div><span>01</span><h3>Fee received</h3><p>The platform records an actual creator-fee receipt.</p></div>
        <ArrowRight />
        <div><span>02</span><h3>Asset purchased</h3><p>A quote executes for the disclosed reward asset.</p></div>
        <ArrowRight />
        <div><span>03</span><h3>Epoch finalized</h3><p>Equal desk units determine the allocation.</p></div>
        <ArrowRight />
        <div><span>04</span><h3>Claim confirmed</h3><p>The transaction receipt proves delivery.</p></div>
      </section>
      <div className="lpInlineWarning"><CircleAlert size={17} /><p>Rewards are not APR, principal protection, company equity, or guaranteed value. Essential holdings and claims will not require a paid upgrade.</p></div>
      <Link className="lpTextLink" href="/docs#rewards">Read reward accounting rules <ArrowRight size={15} /></Link>
    </main>
  );
}
