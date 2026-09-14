"use client";

import { Maximize2, Search, SlidersHorizontal, WalletCards, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PumpioArt from "../pumpio-art";
import { compatibilityRules, pumpioPreviews, rarityPlan, traitCategories, traitCount, type PumpioRarity } from "../pumpio-data";

const filters: Array<"ALL" | PumpioRarity> = ["ALL", "STANDARD", "RARE", "SUPER RARE", "LEGENDARY", "CHAIRMAN"];

export default function PumpiosPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("ALL");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = pumpioPreviews.find((item) => item.id === selectedId);
  useEffect(() => {
    const requested = Number(new URLSearchParams(window.location.search).get("pumpio"));
    if (!pumpioPreviews.some((item) => item.id === requested)) return;
    const frame = window.requestAnimationFrame(() => setSelectedId(requested));
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const visible = useMemo(() => {
    const needle = query.replace("#", "").trim().toLowerCase();
    return pumpioPreviews.filter((item) => {
      const matchesFilter = filter === "ALL" || item.rarity === filter;
      const matchesQuery = !needle || [String(item.id), item.name, item.capsule, item.outfit, item.background].some((value) => value.toLowerCase().includes(needle));
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  return (
    <main className="pioPage">
      <header className="pioPageHero pioPumpiosHero">
        <div><p className="pioEyebrow">PUMPIOS / COLLECTION PREVIEW</p><h1>1,200 CAPSULE-HEADED UNDERWRITERS.</h1><p>One unmistakable capsule bloodline. Strange identities, impossible markets, saturated worlds, and controlled visual chaos.</p></div>
        <PumpioArt alt="The Chairman Pumpio collection preview" src="/pumpios/v8/0001.webp" />
      </header>
      <section className="pioBrowser">
        <div className="pioBrowserBar">
          <div className="pioFilters" role="tablist" aria-label="Rarity filter">
            {filters.map((item) => <button aria-selected={filter === item} className={filter === item ? "active" : ""} key={item} onClick={() => setFilter(item)} role="tab" type="button">{item}</button>)}
          </div>
          <label className="pioSearch"><Search size={16} /><span className="srOnly">Search preview</span><input onChange={(event) => setQuery(event.target.value)} placeholder="# ID or name" value={query} /></label>
        </div>
        <div className="pioPreviewNotice"><SlidersHorizontal size={16} /><p>These 24 art-directed portraits are representative previews, not minted tokens or finalized metadata. The deterministic 1,200-ID trait blueprint exists; full production, metadata review, and Core deployment remain separate gates. <a href="/pumpios/v8/contact-sheet.jpg" target="_blank">Open the contact sheet.</a></p></div>
        <div className="pioCollectionGrid">
          {visible.map((item) => (
            <button className="pioCollectionCard" key={item.id} onClick={() => setSelectedId(item.id)} type="button">
              <PumpioArt alt={`${item.name} Pumpio collection preview`} src={item.image} />
              <span>{item.status}</span>
              <div><strong>#{String(item.id).padStart(4, "0")}</strong><b>{item.name}</b><small>{item.rarity} / LEVEL {item.level}</small></div>
            </button>
          ))}
        </div>
        {visible.length === 0 && <div className="pioEmpty"><Search /><strong>No preview matches that filter.</strong><p>Try another rarity or clear the ID search.</p></div>}
      </section>
      <section className="pioTraitSystem" id="traits">
        <div className="pioTraitIntro"><p className="pioEyebrow">PRODUCTION SYSTEM / V8</p><h2>{traitCount}+ WAYS TO WORK THE OFFERING.</h2><p>{traitCategories.length} trait families create range without breaking the capsule silhouette. Every draft assignment is deterministic and all 1,200 full trait signatures are unique.</p></div>
        <div className="pioTraitGrid">{traitCategories.map((category) => {
          const examples = Object.values(category.values).flat().slice(0, 4);
          return <article key={category.id}><div><span>{String(category.count).padStart(2, "0")} TRAITS</span><strong>{category.label}</strong></div><ul>{examples.map((value) => <li key={value}>{value}</li>)}</ul></article>;
        })}</div>
        <div className="pioTraitRules"><strong>THE SILHOUETTE IS SACRED.</strong><div>{compatibilityRules.slice(0, 4).map((rule) => <p key={rule}>{rule}</p>)}</div></div>
      </section>
      <section className="pioRarityPlan">
        <div><p className="pioEyebrow">RARITY PLAN</p><h2>Simple at the bottom. Unmistakable at the top.</h2></div>
        <div>{rarityPlan.map((item) => <article key={item.label}><strong>{item.count}</strong><span>{item.label}</span></article>)}</div>
        <p>This distribution is an intended art plan only. It is not enforced on-chain and must not be treated as final until collection metadata is frozen.</p>
      </section>
      <section className="pioMyPumpios">
        <div><p className="pioEyebrow">MY PUMPIOS</p><h2>YOUR CAPSULES. YOUR RECEIPTS.</h2></div>
        <div className="pioWalletEmpty"><WalletCards /><strong>Connect a wallet to inspect ownership.</strong><p>Owned Pumpios, level state, offering eligibility, rewards, and claims will appear only from verified indexer and chain data.</p></div>
      </section>
      {selected && (
        <div className="pioModalBackdrop" onClick={() => setSelectedId(null)} role="presentation">
          <article aria-labelledby="pumpio-detail-title" aria-modal="true" className="pioDetail" onClick={(event) => event.stopPropagation()} role="dialog">
            <button aria-label="Close Pumpio detail" className="pioClose" onClick={() => setSelectedId(null)} type="button"><X /></button>
            <div className="pioDetailArt">
              <PumpioArt alt={`${selected.name} Pumpio collection preview`} src={selected.image} />
              <a href={selected.image} rel="noreferrer" target="_blank"><Maximize2 size={16} /> OPEN FULL IMAGE</a>
            </div>
            <div className="pioDetailBody">
              <span>{selected.status}</span><h2 id="pumpio-detail-title">{selected.name}</h2><p>#{String(selected.id).padStart(4, "0")} / {selected.rarity}</p>
              <dl><div><dt>LEVEL</dt><dd>{selected.level}</dd></div><div><dt>CAPSULE</dt><dd>{selected.capsule}</dd></div><div><dt>FACE</dt><dd>{selected.face}</dd></div><div><dt>OUTFIT</dt><dd>{selected.outfit}</dd></div><div><dt>ACCESSORY</dt><dd>{selected.accessory}</dd></div><div><dt>BACKGROUND</dt><dd>{selected.background}</dd></div><div><dt>SURFACE</dt><dd>{selected.surface}</dd></div><div><dt>UTILITY</dt><dd>Equal base participation; offering-specific eligibility only when published.</dd></div><div><dt>HISTORY</dt><dd>Not minted. No on-chain history.</dd></div></dl>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}
