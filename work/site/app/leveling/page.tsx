import { ArrowRight, Flame, LockKeyhole, Sparkles } from "lucide-react";
import Link from "next/link";
import PumpioArt from "../pumpio-art";
import { levelPlan } from "../pumpio-data";

export default function LevelingPage() {
  return (
    <main className="pioPage pioLevelPage">
      <header className="pioPageHero dark">
        <div><p className="pioEyebrow">LEVELING / TARGET SYSTEM</p><h1>START AT THE BOTTOM.</h1><p>Ten visual and product stages. No paid allocation multipliers, no hidden rights, and no upgrade transaction until the migrated contract and pricing are verified.</p></div>
        <PumpioArt art="golden-pump" />
      </header>
      <section className="pioLevelList">
        {levelPlan.map((name, index) => (
          <article className={index === 9 ? "chairman" : ""} key={name}>
            <span>{String(index + 1).padStart(2, "0")}</span><h2>{name}</h2>
            <p>{index < 3 ? "Core membership and increasingly useful research organization." : index < 6 ? "Advanced alerts, analytics, exports, and stronger art treatment." : index < 9 ? "Deeper creator tooling, monitoring, and premium personalization." : "The complete Pumpio art state and product toolkit."}</p>
            <small>LEVEL PREVIEW</small>
          </article>
        ))}
      </section>
      <section className="pioMigrationPanel">
        <LockKeyhole /><div><p className="pioEyebrow">CONTRACT MIGRATION REQUIRED</p><h2>Five levels exist in the previous source. Ten are the new target.</h2><p>The intended local configuration now supports ten levels, but no live contract has been changed. Upgrade prices remain unset and payments remain disabled.</p></div>
      </section>
      <section className="pioBurnPanel">
        <div><Flame /><p className="pioEyebrow">OPTIONAL $IPO UTILITY</p><h2>BURN TO LEVEL. NOT TO CLAIM.</h2><p>The proposed upgrade path can burn verified $IPO payments. Basic ownership, claims, receipts, and offering disclosures will never require a paid upgrade.</p></div>
        <div className="pioBurnState"><span>UPGRADE PRICES</span><strong>--</strong><small>NOT FINALIZED</small><span>PAYMENTS</span><strong>OFF</strong><small>NOT ACTIVE</small></div>
      </section>
      <Link className="pioButton primary pioPageCta" href="/pumpios"><Sparkles size={16} /> EXPLORE PUMPIOS <ArrowRight size={16} /></Link>
    </main>
  );
}
