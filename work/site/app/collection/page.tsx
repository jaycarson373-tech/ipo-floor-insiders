"use client";

import { ArrowRight, Equal, ImageIcon, Layers3 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { launchConfig, mintEnvironmentConfigured } from "../launch-config";

const desks = [1, 47, 121, 333, 420, 561, 741, 888, 999, 1068, 1195, 1212];

function deploymentErrorMessage(error: unknown) {
  const detail = error instanceof Error ? error.message : "";
  if (/403|forbidden/i.test(detail)) return "The configured Solana endpoint denied the deployment check. Minting stays disabled.";
  if (/not executable/i.test(detail)) return "The published IPO program is not deployed as an executable program.";
  if (/not initialized/i.test(detail)) return "The IPO mint has not been initialized on this network.";
  return "The mint deployment could not be verified. Minting stays disabled.";
}

export default function CollectionPage() {
  const [availability, setAvailability] = useState<"checking" | "available" | "unavailable">(
    mintEnvironmentConfigured ? "checking" : "unavailable",
  );
  const [availabilityMessage, setAvailabilityMessage] = useState(
    mintEnvironmentConfigured ? "Verifying the published program and collection on-chain." : "The mint deployment is not configured.",
  );
  const [phase, setPhase] = useState<"idle" | "review" | "signing" | "submitted" | "confirmed" | "failed">("idle");
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState<{ asset: string; serial: number; signature: string } | null>(null);
  const submitting = useRef(false);

  useEffect(() => {
    if (!mintEnvironmentConfigured) return;
    let active = true;
    const verifyDeployment = window.setTimeout(async () => {
      try {
        const { fetchLaunchState } = await import("../solana-client");
        const state = await fetchLaunchState();
        if (!active) return;
        if (state.paused) {
          setAvailability("unavailable");
          setAvailabilityMessage("The verified mint is currently paused on-chain.");
        } else if (state.minted >= state.totalSupply) {
          setAvailability("unavailable");
          setAvailabilityMessage("The verified collection is sold out.");
        } else {
          setAvailability("available");
          setAvailabilityMessage(`${(state.totalSupply - state.minted).toLocaleString()} desks remain on ${launchConfig.cluster}.`);
        }
      } catch (error) {
        if (!active) return;
        setAvailability("unavailable");
        setAvailabilityMessage(deploymentErrorMessage(error));
      }
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(verifyDeployment);
    };
  }, []);

  async function reviewMint() {
    if (availability !== "available") return;
    if (!window.solana) {
      setMessage("No compatible Solana wallet was found in this browser.");
      setPhase("failed");
      return;
    }
    try {
      await window.solana.connect();
      const { fetchLaunchState } = await import("../solana-client");
      const state = await fetchLaunchState();
      if (state.paused || state.minted >= state.totalSupply) throw new Error(state.paused ? "Minting is paused on-chain." : "The collection is sold out.");
      setMessage(`The next desk is #${String(state.minted + 1).padStart(4, "0")}. Review the exact split before requesting a signature.`);
      setPhase("review");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The mint could not be prepared.");
      setPhase("failed");
    }
  }

  async function confirmMint() {
    if (!window.solana || submitting.current) return;
    submitting.current = true;
    setPhase("signing");
    setMessage("Review and approve the transaction in your wallet.");
    try {
      const { mintDesk } = await import("../solana-client");
      const result = await mintDesk(window.solana, () => setPhase("submitted"));
      setReceipt(result);
      setPhase("confirmed");
      setMessage(`IPO Desk #${String(result.serial).padStart(4, "0")} confirmed on-chain.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Minting failed.");
      setPhase("failed");
    } finally {
      submitting.current = false;
    }
  }

  return (
    <main className="lpMain lpAppPage lpWrap">
      <div className="lpPageIntro">
        <div><span>THE COLLECTION</span><h1>{launchConfig.supply.toLocaleString()} launch consoles.</h1><p>Architectural offering machines with one shared silhouette and equal base participation. Artwork and optional upgrades never multiply financial rights.</p></div>
        <div className="lpPreviewBadge"><i /> {availability === "checking" ? "VERIFYING MINT" : availability === "available" ? "MINT AVAILABLE" : "MINT UNAVAILABLE"}</div>
      </div>
      <section className="lpCollectionHero">
        <div className="lpCollectionArt">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="IPO Launch Console 1212 collection preview" src="/collection/images/IPO-1212-L5.svg" />
        </div>
        <div className="lpCollectionTerms">
          <span className="lpMiniLabel">METAPLEX CORE COLLECTION</span><h2>One console. One participation unit.</h2>
          <p>Each mint creates one Core NFT. No `$IPO` token is required. The full mint price is attributed to that desk&apos;s mint-funded asset capital.</p>
          <dl>
            <div><dt>SUPPLY</dt><dd>1,212</dd></div>
            <div><dt>PRICE</dt><dd>0.12 SOL</dd></div>
            <div><dt>MINT-FUNDED ASSETS</dt><dd>0.12 SOL</dd></div>
            <div><dt>$IPO TO MINT</dt><dd>NONE</dd></div>
          </dl>
          <button className={availability === "available" ? "lpPrimary" : "lpDisabled"} disabled={availability !== "available" || phase === "signing" || phase === "submitted"} onClick={reviewMint} type="button">
            {availability === "checking" ? "Verifying mint" : availability === "available" ? "Mint a desk" : "Mint unavailable"} <ArrowRight size={16} />
          </button>
          <p className="lpAvailability" role="status">{availabilityMessage}</p>
          <small>Network and account-creation costs apply separately. No success appears before confirmation.</small>
          {phase !== "idle" && (
            <div className="lpMintState" role="status">
              <span>{phase.toUpperCase()}</span>
              <p>{message}</p>
              {phase === "review" && (
                <>
                  <dl>
                    <div><dt>DESK PRICE</dt><dd>0.12 SOL</dd></div>
                    <div><dt>ASSET CAPITAL</dt><dd>0.12 SOL</dd></div>
                    <div><dt>PLATFORM DEDUCTION</dt><dd>NONE</dd></div>
                    <div><dt>EXTRA COST</dt><dd>Network + accounts</dd></div>
                  </dl>
                  <button className="lpPrimary" onClick={confirmMint} type="button">Request wallet signature <ArrowRight size={16} /></button>
                </>
              )}
              {receipt && <a href={`https://solscan.io/tx/${receipt.signature}?cluster=${launchConfig.cluster}`} rel="noreferrer" target="_blank">View transaction <ArrowRight size={14} /></a>}
            </div>
          )}
        </div>
      </section>
      <section className="lpCollectionPrinciples">
        <article><Equal /><strong>Equal base rights</strong><p>No rarity or paid-level allocation multiplier.</p></article>
        <article><Layers3 /><strong>Five visual levels</strong><p>Optional workspace progression; payment remains disabled.</p></article>
        <article><ImageIcon /><strong>Deterministic art</strong><p>Every ID and level resolves to a stable artwork and metadata record.</p></article>
      </section>
      <section className="lpGallerySection">
        <div className="lpSectionHead"><div><span>DESK INDEX</span><h2>Collection preview</h2></div><p>Level and rarity are visual traits only.</p></div>
        <div className="lpGallery">
          {desks.map((id, index) => {
            const level = (index % 5) + 1;
            return (
              <article key={id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={`IPO Launch Console ${String(id).padStart(4, "0")}`} src={`/collection/images/IPO-${String(id).padStart(4, "0")}-L${level}.svg`} />
                <div><strong>IPO #{String(id).padStart(4, "0")}</strong><span>LEVEL {level}</span></div>
              </article>
            );
          })}
        </div>
      </section>
      <Link className="lpTextLink" href="/docs#ownership">Read ownership rules <ArrowRight size={15} /></Link>
    </main>
  );
}
