import { ArrowDown, CircleAlert, Coins, Flame, Gift, ReceiptText, WalletCards } from "lucide-react";
import { launchConfig } from "../launch-config";

export default function RewardsPage() {
  const route = launchConfig.platformRevenueBps;
  return (
    <main className="pioPage pioRewardsPage">
      <header className="pioPageHero pioRewardHero">
        <div><p className="pioEyebrow">VALUE ROUTING / CONFIGURED POLICY</p><h1>REVENUE, ROUTED IN PUBLIC.</h1><p>Platform revenue actually received follows a 70 / 20 / 10 policy after custody, purchase, snapshot, claim, burn, and receipt infrastructure is implemented and verified.</p></div>
        <div className="pioRewardMark"><Gift /><span>POLICY CONFIGURED</span><strong>EXECUTION NOT ACTIVE</strong></div>
      </header>
      <section className="pioRewardFlow">
        <div className="pioRewardSource"><Coins /><span>IPO REVENUE</span><strong>RECEIVED FEES</strong><small>NOT MINT CAPITAL</small></div><ArrowDown />
        <div className="pioRewardDestinations">
          <article><Gift /><span>PUMPIO-HOLDER REWARDS</span><strong>{route.holderRewards / 100}%</strong><small>SNAPSHOT, PURCHASE + DISTRIBUTOR REQUIRED</small></article>
          <article><Flame /><span>$IPO BUYBACK + BURN</span><strong>{route.ipoBuybackBurn / 100}%</strong><small>SWAP, BURN + RECEIPT ENGINE REQUIRED</small></article>
          <article><ReceiptText /><span>PROTOCOL OPERATIONS</span><strong>{route.protocolOperations / 100}%</strong><small>DISCLOSED OPERATIONS ACCOUNT</small></article>
        </div>
      </section>
      <section className="pioRewardLedger">
        <div><p className="pioEyebrow">MY REWARDS</p><h2>Wallet ledger</h2></div>
        <div className="pioRewardMetrics">{["FEES RECEIVED", "PUMP PURCHASED", "ALLOCATED", "CLAIMABLE", "DISTRIBUTED", "$IPO BURNED"].map((item) => <article key={item}><span>{item}</span><strong>--</strong><small>UNAVAILABLE</small></article>)}</div>
        <div className="pioWalletEmpty light"><WalletCards /><strong>No production reward data.</strong><p>Zero and unavailable are different. Amounts appear only after receipts, purchases, snapshots, and distributions can be reconciled.</p></div>
      </section>
      <div className="pioRewardWarning"><CircleAlert /><p>The 70 / 20 / 10 policy applies only to platform revenue actually received. It excludes Pumpio mint receipts, total trading volume, and creator shares belonging to third parties. Rewards are not guaranteed returns, yield, company equity, or principal protection.</p></div>
    </main>
  );
}
