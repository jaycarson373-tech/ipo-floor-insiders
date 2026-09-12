"use client";

import { ArrowRight, Check, CircleAlert, Minus, Plus, RotateCcw, WalletCards } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { launchConfig, publicMintConfigured } from "../launch-config";
import PumpioArt from "../pumpio-art";
import { useWallet } from "../wallet-context";

type Phase = "idle" | "review" | "signing" | "submitted" | "confirmed" | "failed";
type Receipt = { asset: string; serial: number; signature: string };

function deploymentErrorMessage(error: unknown) {
  const detail = error instanceof Error ? error.message : "";
  if (/supply/i.test(detail)) return "The deployed collection does not match the intended 1,200 Pumpios supply.";
  if (/not executable/i.test(detail)) return "The published IPO program is not executable on the configured network.";
  if (/not initialized/i.test(detail)) return "The Pumpios mint has not been initialized on this network.";
  return "The 1,200-supply Pumpios deployment could not be verified.";
}

export default function MintPage() {
  const { address, connected, disconnect, openPicker, provider } = useWallet();
  const [availability, setAvailability] = useState<"checking" | "available" | "unavailable">(publicMintConfigured ? "checking" : "unavailable");
  const [availabilityMessage, setAvailabilityMessage] = useState(publicMintConfigured ? "Verifying program, config, price, supply, and Core collection." : "Public minting remains disabled until migration, metadata, and deployment checks pass.");
  const [minted, setMinted] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const submitting = useRef(false);

  useEffect(() => {
    if (!publicMintConfigured) return;
    let active = true;
    void (async () => {
      try {
        const { fetchLaunchState } = await import("../solana-client");
        const state = await fetchLaunchState();
        if (!active) return;
        setMinted(state.minted);
        if (state.paused || state.minted >= state.totalSupply) {
          setAvailability("unavailable");
          setAvailabilityMessage(state.paused ? "The verified mint is paused on-chain." : "The verified collection is sold out.");
        } else {
          setAvailability("available");
          setAvailabilityMessage(`${(state.totalSupply - state.minted).toLocaleString()} Pumpios remain on ${launchConfig.cluster}.`);
        }
      } catch (error) {
        if (!active) return;
        setAvailability("unavailable");
        setAvailabilityMessage(deploymentErrorMessage(error));
      }
    })();
    return () => { active = false; };
  }, []);

  async function reviewMint() {
    if (availability !== "available") return;
    if (!provider) {
      openPicker();
      setMessage("Connect a compatible Solana wallet to continue.");
      return;
    }
    try {
      const { fetchLaunchState } = await import("../solana-client");
      const state = await fetchLaunchState();
      if (state.paused || state.minted + quantity > state.totalSupply) throw new Error(state.paused ? "Minting is paused on-chain." : "Not enough Pumpios remain for that quantity.");
      setMinted(state.minted);
      setPhase("review");
      setMessage(`Review ${quantity} Pumpio mint${quantity === 1 ? "" : "s"} before requesting wallet signatures.`);
    } catch (error) {
      setPhase("failed");
      setMessage(error instanceof Error ? error.message : "The mint could not be prepared.");
    }
  }

  async function confirmMint() {
    if (!provider || submitting.current || phase !== "review") return;
    submitting.current = true;
    setReceipts([]);
    setPhase("signing");
    try {
      const { mintPumpio } = await import("../solana-client");
      const completed: Receipt[] = [];
      for (let index = 0; index < quantity; index += 1) {
        setMessage(`Approve Pumpio ${index + 1} of ${quantity} in your wallet.`);
        const result = await mintPumpio(provider, () => setPhase("submitted"));
        completed.push(result);
        setReceipts([...completed]);
        setPhase(index + 1 === quantity ? "confirmed" : "signing");
      }
      setMinted((current) => (current ?? 0) + completed.length);
      setMessage(`${completed.length} Pumpio mint${completed.length === 1 ? "" : "s"} confirmed and verified on-chain.`);
    } catch (error) {
      setPhase("failed");
      setMessage(error instanceof Error ? error.message : "Minting failed.");
    } finally {
      submitting.current = false;
    }
  }

  const total = (quantity * launchConfig.mintPriceSol).toFixed(2);
  const remaining = minted === null ? null : launchConfig.supply - minted;

  return (
    <main className="pioPage pioMintPage">
      <header className="pioMintHero">
        <div className="pioMintArt"><PumpioArt art="intern" /><span>REVEAL AFTER CONFIRMATION</span></div>
        <div className="pioMintPanel">
          <p className="pioEyebrow">PUMPIOS / METAPLEX CORE</p><h1>MINT YOUR PUMPIO.</h1><p className="pioMintIntro">The intended collection is 1,200 Pumpios at 0.12 SOL. No $IPO lock or burn is required to mint.</p>
          <div className={`pioMintStatus ${availability}`}><i /> {availability === "checking" ? "VERIFYING DEPLOYMENT" : availability === "available" ? "MINT AVAILABLE" : "MIGRATION REQUIRED"}</div>
          <div className="pioWalletInline"><div><WalletCards size={16} /><span>{connected ? "CONNECTED" : "WALLET REQUIRED"}</span><strong>{connected ? `${address.slice(0, 4)}...${address.slice(-4)}` : "No wallet connected"}</strong></div>{connected ? <button onClick={() => void disconnect()} type="button">DISCONNECT</button> : <button onClick={openPicker} type="button">CONNECT WALLET</button>}</div>
          <dl className="pioMintStats"><div><dt>PRICE</dt><dd>0.12 SOL</dd></div><div><dt>SUPPLY</dt><dd>1,200</dd></div><div><dt>MINTED</dt><dd>{minted === null ? "--" : minted.toLocaleString()}</dd></div><div><dt>REMAINING</dt><dd>{remaining === null ? "--" : remaining.toLocaleString()}</dd></div></dl>
          <div className="pioQuantity"><span>QUANTITY</span><div><button aria-label="Decrease quantity" disabled={quantity === 1 || phase === "signing" || phase === "submitted"} onClick={() => setQuantity((value) => Math.max(1, value - 1))} type="button"><Minus /></button><strong>{quantity}</strong><button aria-label="Increase quantity" disabled={quantity === 3 || phase === "signing" || phase === "submitted"} onClick={() => setQuantity((value) => Math.min(3, value + 1))} type="button"><Plus /></button></div></div>
          <div className="pioMintTotal"><span>TOTAL</span><strong>{total} SOL</strong><small>+ estimated network and account costs</small></div>
          <button className="pioMintButton" disabled={availability !== "available" || phase === "signing" || phase === "submitted"} onClick={phase === "review" ? confirmMint : reviewMint} type="button">{availability === "available" ? phase === "review" ? "REQUEST SIGNATURE" : "MINT PUMPIO" : "MINT UNAVAILABLE"} <ArrowRight /></button>
          <p className="pioMintAvailability" role="status">{availabilityMessage}</p>
          {phase !== "idle" && <div className={`pioTransactionState ${phase}`}><span>{phase.toUpperCase()}</span><p>{message}</p>{phase === "review" && <div><Check size={15} /> {quantity} x 0.12 SOL / no $IPO requirement</div>}{phase === "failed" && <button onClick={() => { setPhase("idle"); setMessage(""); }} type="button"><RotateCcw size={14} /> TRY AGAIN</button>}</div>}
          {receipts.length > 0 && <div className="pioReceipts">{receipts.map((receipt) => <a href={`https://solscan.io/tx/${receipt.signature}?cluster=${launchConfig.cluster}`} key={receipt.signature} rel="noreferrer" target="_blank">PUMPIO #{String(receipt.serial).padStart(4, "0")} <ArrowRight size={14} /></a>)}</div>}
          <div className="pioMintDisclosure"><CircleAlert size={15} /><p>No success is shown before confirmation and Core asset verification. Preview rarity is never assigned to a real mint.</p></div>
        </div>
      </header>
      <section className="pioMintSteps">{[["01", "CONNECT", "Connect a compatible Solana wallet."], ["02", "REVIEW", "Confirm quantity, total, and extra costs."], ["03", "SIGN", "Approve each transaction in the wallet."], ["04", "VERIFY", "Wait for confirmation and Core asset state."], ["05", "REVEAL", "Read the final metadata assigned to the NFT."]].map(([number, title, copy]) => <article key={number}><span>{number}</span><WalletCards /><h2>{title}</h2><p>{copy}</p></article>)}</section>
    </main>
  );
}
