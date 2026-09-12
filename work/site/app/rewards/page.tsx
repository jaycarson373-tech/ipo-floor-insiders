import { ArrowDown, CircleAlert, Coins, Flame, Gift, ReceiptText, WalletCards } from "lucide-react";

export default function RewardsPage() {
  return (
    <main className="pioPage pioRewardsPage">
      <header className="pioPageHero pioRewardHero">
        <div><p className="pioEyebrow">REWARDS / ARCHITECTURE</p><h1>THE FLOOR GETS PAID.</h1><p>Platform revenue can fund PUMP purchases, Pumpio distributions, $IPO buybacks and continued development after each route is implemented and verified.</p></div>
        <div className="pioRewardMark"><Gift /><span>REVENUE ROUTING</span><strong>NOT ACTIVE</strong></div>
      </header>
      <section className="pioRewardFlow">
        <div className="pioRewardSource"><Coins /><span>IPO REVENUE</span><strong>RECEIVED FEES</strong><small>NOT MINT CAPITAL</small></div><ArrowDown />
        <div className="pioRewardDestinations">
          <article><Gift /><span>PUMP HOLDER REWARDS</span><strong>--</strong><small>PAIR, ROUTE, SNAPSHOT + DISTRIBUTOR REQUIRED</small></article>
          <article><Flame /><span>$IPO BUYBACK + BURN</span><strong>--</strong><small>TOKEN, POLICY + EXECUTION REQUIRED</small></article>
          <article><ReceiptText /><span>TREASURY / DEVELOPMENT</span><strong>--</strong><small>FINAL POLICY REQUIRED</small></article>
        </div>
      </section>
      <section className="pioRewardLedger">
        <div><p className="pioEyebrow">MY REWARDS</p><h2>Wallet ledger</h2></div>
        <div className="pioRewardMetrics">{["FEES RECEIVED", "PUMP PURCHASED", "ALLOCATED", "CLAIMABLE", "DISTRIBUTED", "$IPO BURNED"].map((item) => <article key={item}><span>{item}</span><strong>--</strong><small>UNAVAILABLE</small></article>)}</div>
        <div className="pioWalletEmpty light"><WalletCards /><strong>No production reward data.</strong><p>Zero and unavailable are different. Amounts appear only after receipts, purchases, snapshots, and distributions can be reconciled.</p></div>
      </section>
      <div className="pioRewardWarning"><CircleAlert /><p>No reward percentage is final. Rewards are not guaranteed returns, yield, company equity, or principal protection.</p></div>
    </main>
  );
}
