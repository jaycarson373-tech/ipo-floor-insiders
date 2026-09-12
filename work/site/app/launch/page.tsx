"use client";

/* eslint-disable @next/next/no-img-element */

import { ArrowLeft, ArrowRight, AtSign, Check, CircleAlert, Download, ImagePlus, Save, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Draft = {
  name: string;
  ticker: string;
  description: string;
  xAccount: string;
  telegram: string;
  website: string;
  pair: "SOL" | "USDC";
  raise: string;
  duration: string;
  allocation: string;
  vesting: string;
  feeShares: { coinHolders: number; pumpios: number; creator: number; protocol: number };
};

const emptyDraft: Draft = {
  name: "",
  ticker: "",
  description: "",
  xAccount: "",
  telegram: "",
  website: "",
  pair: "SOL",
  raise: "",
  duration: "",
  allocation: "",
  vesting: "",
  feeShares: { coinHolders: 60, pumpios: 15, creator: 15, protocol: 10 },
};

const steps = ["Project", "Presale", "Rewards", "Review"];

export default function LaunchPage() {
  const [step, setStep] = useState(0);
  const [path, setPath] = useState<"curated" | "instant">("curated");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saved, setSaved] = useState("");
  const [imageName, setImageName] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    const hydrateDraft = window.setTimeout(() => {
      const stored = localStorage.getItem("ipo-offering-draft-v2");
      if (stored) {
        try { setDraft({ ...emptyDraft, ...JSON.parse(stored) }); } catch { /* Ignore malformed local drafts. */ }
      }
    }, 0);

    return () => window.clearTimeout(hydrateDraft);
  }, []);

  const ready = useMemo(() => Boolean(draft.name && draft.ticker && draft.description), [draft]);
  const feeTotal = Object.values(draft.feeShares).reduce((sum, value) => sum + value, 0);

  function update(field: keyof Draft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setSaved("");
  }

  function save() {
    localStorage.setItem("ipo-offering-draft-v2", JSON.stringify(draft));
    setSaved("Draft saved in this browser. Nothing was submitted or published.");
  }

  function updateFee(field: keyof Draft["feeShares"], value: string) {
    const amount = Math.max(0, Math.min(100, Number(value) || 0));
    setDraft((current) => ({ ...current, feeShares: { ...current.feeShares, [field]: amount } }));
    setSaved("");
  }

  function selectImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 15_000_000) {
      setSaved("Choose a PNG, JPG, GIF, or WebP image under 15 MB.");
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageName(file.name);
    setImagePreview(URL.createObjectURL(file));
    setSaved("Artwork is previewed locally. It has not been uploaded.");
  }

  function exportBrief() {
    const payload = { version: 3, path, project: draft, artworkFile: imageName || null, status: "LOCAL_DRAFT", execution: "UNAVAILABLE" };
    const url = URL.createObjectURL(new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${draft.ticker.toLowerCase() || "ipo"}-launch-brief.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setSaved("Launch brief exported. No transaction was created.");
  }

  return (
    <main className="lpMain lpAppPage lpWrap">
      <div className="lpPageIntro">
        <div><span>CREATE</span><h1>Build an Initial Pump Offering.</h1><p>Choose the path, define the terms, and review the complete money route before any transaction is prepared.</p></div>
        <div className="lpPreviewBadge"><i /> LOCAL DRAFT</div>
      </div>

      <div className="lpPathPicker" aria-label="Launch path">
        <button className={path === "curated" ? "active" : ""} onClick={() => setPath("curated")} type="button">
          <span>CURATED PRESALE</span><strong>Apply, raise with published terms, then launch.</strong><small>Escrow execution is not connected.</small>
        </button>
        <button className={path === "instant" ? "active" : ""} onClick={() => setPath("instant")} type="button">
          <span>INSTANT FAIR LAUNCH</span><strong>Configure a token and launch directly.</strong><small>Pump execution is not connected.</small>
        </button>
      </div>

      <div className="lpBuilder">
        <div className="lpStepRail">
          {steps.map((label, index) => (
            <button className={step === index ? "active" : step > index ? "done" : ""} onClick={() => setStep(index)} type="button" key={label}>
              <span>{step > index ? <Check size={14} /> : index + 1}</span>{label}
            </button>
          ))}
        </div>
        <section className="lpBuilderBody">
          {step === 0 && (
            <div className="lpFormBlock">
              <span className="lpMiniLabel">PROJECT BASICS</span><h2>What are you launching?</h2>
              <div className="lpFormGrid">
                <label>Project name<input value={draft.name} onChange={(event) => update("name", event.target.value)} placeholder="Project name" /></label>
                <label>Ticker<input value={draft.ticker} onChange={(event) => update("ticker", event.target.value.toUpperCase().slice(0, 10))} placeholder="IDEA" /></label>
                <label className="wide">Description<textarea value={draft.description} onChange={(event) => update("description", event.target.value)} placeholder="What does the project do, and why should a community care?" /></label>
                <label>Website<input value={draft.website} onChange={(event) => update("website", event.target.value)} placeholder="https://" /></label>
                <label>X profile<input value={draft.xAccount} onChange={(event) => update("xAccount", event.target.value)} placeholder="https://x.com/project" /><small><AtSign size={12} /> Profile link only. Verified OAuth is not active.</small></label>
                <label>Telegram<input value={draft.telegram} onChange={(event) => update("telegram", event.target.value)} placeholder="https://t.me/project" /></label>
                <label>Quote pair<select onChange={(event) => update("pair", event.target.value as Draft["pair"])} value={draft.pair}><option value="SOL">SOL</option><option value="USDC">USDC</option></select></label>
                <label className="wide lpImageInput"><span>Project artwork</span><input accept="image/png,image/jpeg,image/gif,image/webp" onChange={(event) => selectImage(event.target.files?.[0])} type="file" /><div>{imagePreview ? <img alt="Local project artwork preview" src={imagePreview} /> : <ImagePlus />}<strong>{imageName || "Choose square artwork"}</strong><small>LOCAL PREVIEW / MAX 15 MB</small></div></label>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="lpFormBlock">
              <span className="lpMiniLabel">{path === "curated" ? "PRESALE TERMS" : "INITIAL PURCHASE"}</span><h2>{path === "curated" ? "Define the raise before deposits." : "Define the launch transaction."}</h2>
              <div className="lpFormGrid">
                <label>Target raise<input value={draft.raise} onChange={(event) => update("raise", event.target.value)} placeholder="Not set" /></label>
                <label>Duration<input value={draft.duration} onChange={(event) => update("duration", event.target.value)} placeholder="Not set" /></label>
                <label>Public allocation<input value={draft.allocation} onChange={(event) => update("allocation", event.target.value)} placeholder="Not set" /></label>
                <label>Vesting / unlock<input value={draft.vesting} onChange={(event) => update("vesting", event.target.value)} placeholder="Not set" /></label>
              </div>
              <div className="lpInlineWarning"><CircleAlert size={17} /><p>{path === "curated" ? "Deposits stay disabled until segregated escrow, settlement, cancellation, and refunds are implemented." : "The interface will not claim a token launched until the transaction and resulting chain state are confirmed."}</p></div>
            </div>
          )}
          {step === 2 && (
            <div className="lpFormBlock">
              <span className="lpMiniLabel">PROPOSED CREATOR-FEE ROUTE</span><h2>Decide where collected fees go.</h2>
              <div className="lpFeeEditor">
                {([['coinHolders', 'Coin holders'], ['pumpios', 'Pumpio holders'], ['creator', 'Creator'], ['protocol', 'Protocol']] as const).map(([key, label]) => <label key={key}><span>{label}</span><div><input aria-label={`${label} fee percentage`} max="100" min="0" onChange={(event) => updateFee(key, event.target.value)} type="number" value={draft.feeShares[key]} /><b>%</b></div></label>)}
              </div>
              <div className={`lpFeeTotal ${feeTotal === 100 ? "valid" : "invalid"}`}><span>TOTAL ROUTED</span><strong>{feeTotal}%</strong><small>{feeTotal === 100 ? "READY FOR REVIEW" : "MUST EQUAL 100%"}</small></div>
              <p className="lpQuiet">This configurable template applies only to creator-fee receipts actually collected. It is not a share of volume or every trading fee. Routing remains unverified until it is read back from chain state.</p>
            </div>
          )}
          {step === 3 && (
            <div className="lpFormBlock">
              <span className="lpMiniLabel">REVIEW</span><h2>One record before one signature.</h2>
              <dl className="lpReviewList">
                <div><dt>PATH</dt><dd>{path === "curated" ? "Curated presale" : "Instant fair launch"}</dd></div>
                <div><dt>PROJECT</dt><dd>{draft.name || "Missing"} {draft.ticker ? `/ $${draft.ticker}` : ""}</dd></div>
                <div><dt>PAIR</dt><dd>{draft.pair}</dd></div>
                <div><dt>TERMS</dt><dd>{draft.raise || "Not configured"}</dd></div>
                <div><dt>FEE ROUTE</dt><dd>{Object.values(draft.feeShares).join(" / ")} ({feeTotal}%)</dd></div>
                <div><dt>SOCIAL IDENTITY</dt><dd>{draft.xAccount ? "X profile supplied / unverified" : "Not supplied"}</dd></div>
                <div><dt>EXECUTION</dt><dd>Unavailable</dd></div>
              </dl>
              <div className="lpInlineWarning"><ShieldCheck size={17} /><p>This review is local. It does not create a token, accept deposits, reserve allocations, or publish an offering.</p></div>
              <div className="lpReviewActions"><button className="lpPrimary" onClick={exportBrief} type="button"><Download size={15} /> Export launch brief</button><button className="lpDisabled" disabled type="button">Execution unavailable</button></div>
            </div>
          )}
          <div className="lpBuilderControls">
            <button className="lpTextButton" onClick={save} type="button"><Save size={15} /> Save draft</button>
            <div>
              <button className="lpSecondary" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))} type="button"><ArrowLeft size={15} /> Back</button>
              {step < steps.length - 1 && <button className="lpPrimary" disabled={(step === 0 && !ready) || (step === 2 && feeTotal !== 100)} onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))} type="button">Continue <ArrowRight size={15} /></button>}
            </div>
          </div>
          {saved && <p className="lpSaved" role="status">{saved}</p>}
        </section>
        <aside className="lpBuilderAside">
          <span>LAUNCH CHECK</span>
          <div><Check size={15} /><p><strong>Draft persistence</strong><small>Available in this browser</small></p></div>
          <div><CircleAlert size={15} /><p><strong>Project review</strong><small>Backend required</small></p></div>
          <div><CircleAlert size={15} /><p><strong>Escrow / Pump rail</strong><small>Not connected</small></p></div>
          <div><CircleAlert size={15} /><p><strong>Fee verification</strong><small>On-chain readback required</small></p></div>
          <div><CircleAlert size={15} /><p><strong>X account verification</strong><small>OAuth backend required</small></p></div>
        </aside>
      </div>
    </main>
  );
}
