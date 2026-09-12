"use client";

import { ArrowLeft, ArrowRight, Check, CircleAlert, Save, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Draft = {
  name: string;
  ticker: string;
  description: string;
  website: string;
  raise: string;
  duration: string;
  allocation: string;
  vesting: string;
};

const emptyDraft: Draft = {
  name: "",
  ticker: "",
  description: "",
  website: "",
  raise: "",
  duration: "",
  allocation: "",
  vesting: "",
};

const steps = ["Project", "Presale", "Rewards", "Review"];

export default function LaunchPage() {
  const [step, setStep] = useState(0);
  const [path, setPath] = useState<"curated" | "instant">("curated");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saved, setSaved] = useState("");

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

  function update(field: keyof Draft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setSaved("");
  }

  function save() {
    localStorage.setItem("ipo-offering-draft-v2", JSON.stringify(draft));
    setSaved("Draft saved in this browser. Nothing was submitted or published.");
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
                <label className="wide">Website or source link<input value={draft.website} onChange={(event) => update("website", event.target.value)} placeholder="https://" /></label>
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
              <div className="lpFeeRoute">
                <div className="coin"><b>60%</b><span>Coin holders</span></div>
                <div className="desk"><b>15%</b><span>Pumpio holders</span></div>
                <div className="creator"><b>15%</b><span>Creator</span></div>
                <div className="ops"><b>10%</b><span>Operations</span></div>
              </div>
              <p className="lpQuiet">This configurable template applies only to creator-fee receipts actually collected. It is not a share of volume or every trading fee. Routing remains unverified until it is read back from chain state.</p>
            </div>
          )}
          {step === 3 && (
            <div className="lpFormBlock">
              <span className="lpMiniLabel">REVIEW</span><h2>One record before one signature.</h2>
              <dl className="lpReviewList">
                <div><dt>PATH</dt><dd>{path === "curated" ? "Curated presale" : "Instant fair launch"}</dd></div>
                <div><dt>PROJECT</dt><dd>{draft.name || "Missing"} {draft.ticker ? `/ $${draft.ticker}` : ""}</dd></div>
                <div><dt>TERMS</dt><dd>{draft.raise || "Not configured"}</dd></div>
                <div><dt>FEE ROUTE</dt><dd>60 / 15 / 15 / 10 proposed</dd></div>
                <div><dt>EXECUTION</dt><dd>Unavailable</dd></div>
              </dl>
              <div className="lpInlineWarning"><ShieldCheck size={17} /><p>This review is local. It does not create a token, accept deposits, reserve allocations, or publish an offering.</p></div>
              <button className="lpDisabled" disabled type="button">Execution unavailable</button>
            </div>
          )}
          <div className="lpBuilderControls">
            <button className="lpTextButton" onClick={save} type="button"><Save size={15} /> Save draft</button>
            <div>
              <button className="lpSecondary" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))} type="button"><ArrowLeft size={15} /> Back</button>
              {step < steps.length - 1 && <button className="lpPrimary" disabled={step === 0 && !ready} onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))} type="button">Continue <ArrowRight size={15} /></button>}
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
        </aside>
      </div>
    </main>
  );
}
