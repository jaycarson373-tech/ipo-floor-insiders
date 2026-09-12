import { ArrowUpRight, CircleAlert, ReceiptText, ShieldCheck } from "lucide-react";
import { launchConfig, mintEnvironmentConfigured } from "../launch-config";

const rows = [
  ["MINT PROGRAM", launchConfig.programId, "SOURCE ID ONLY"],
  ["MINT CONFIG", launchConfig.config, "NOT PUBLISHED"],
  ["PUMPIOS CORE COLLECTION", launchConfig.coreCollection, "NOT PUBLISHED"],
  ["ASSET TREASURY", launchConfig.assetTreasury, "NOT PUBLISHED"],
  ["$IPO TOKEN", "", "NOT PUBLISHED"],
  ["PUMP PAIR", "", "NOT CONFIGURED"],
  ["OFFERING CONTRACTS", "", "NOT DEPLOYED"],
  ["REVENUE TRANSACTIONS", "", "INDEXER OFFLINE"],
  ["PUMP PURCHASES", "", "NOT ACTIVE"],
  ["PUMPIO DISTRIBUTIONS", "", "NOT ACTIVE"],
  ["$IPO BURNS", "", "NOT ACTIVE"],
] as const;

export default function ProofPage() {
  return (
    <main className="pioPage pioProofPage">
      <header className="pioPageHero dark">
        <div><p className="pioEyebrow">PROOF CENTER</p><h1>EVERYTHING ON THE BOOKS.</h1><p>Contracts, tokens, collections, revenue receipts, reward purchases, distributions, burns, and snapshots belong in one public ledger.</p></div>
        <div className="pioProofSeal"><ShieldCheck /><strong>{mintEnvironmentConfigured ? "CONFIGURED" : "MIGRATION BLOCKED"}</strong><span>PUBLIC MINT STATUS</span></div>
      </header>
      <section className="pioProofTable">
        <div className="pioProofTableHead"><span>RESOURCE</span><span>ADDRESS / RECEIPT</span><span>STATE</span></div>
        {rows.map(([label, value, state]) => <div className="pioProofTableRow" key={label}><strong>{label}</strong><code>{value || "--"}</code><span>{state}</span>{value && label === "MINT PROGRAM" ? <a aria-label="Open program in Solscan" href={`https://solscan.io/account/${value}?cluster=${launchConfig.cluster}`} rel="noreferrer" target="_blank"><ArrowUpRight size={15} /></a> : null}</div>)}
      </section>
      <section className="pioProofRules"><ReceiptText /><div><h2>What counts as proof?</h2><p>A wallet connection is not a transaction. A signature is not confirmation. Confirmation is not enough when resulting chain state cannot be verified.</p></div></section>
      <div className="pioRewardWarning"><CircleAlert /><p>The checked-in program ID is not evidence that the 1,200-supply Pumpios migration is deployed. Minting remains disabled until the complete address set passes preflight.</p></div>
    </main>
  );
}
