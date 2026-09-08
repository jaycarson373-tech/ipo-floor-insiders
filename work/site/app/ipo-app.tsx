'use client';

/* eslint-disable @next/next/no-img-element */

import { useRef, useState, type ReactNode } from 'react';
import { launchConfig } from './launch-config';
import type { WalletProvider } from './solana-client';

declare global {
  interface Window {
    solana?: WalletProvider & { isPhantom?: boolean };
  }
}

type View = 'explore' | 'desk' | 'signal' | 'activity';
type MintPhase = 'idle' | 'review' | 'signing' | 'submitted' | 'confirmed' | 'cancelled' | 'failed';
type Receipt = { serial: number; asset: string; signature: string };

const navItems: Array<[View, string, string]> = [
  ['explore', 'Explore', 'E'],
  ['desk', 'My Pass', 'P'],
  ['signal', 'Signal', 'S'],
  ['activity', 'Activity', 'A'],
];

const levels = ['Member', 'Researcher', 'Analyst', 'Strategist', 'Director'];

function Status({ children, tone = 'muted' }: { children: ReactNode; tone?: 'live' | 'planned' | 'muted' }) {
  return <span className={`status status-${tone}`}>{children}</span>;
}

function EmptyState({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <div className="emptyState"><span>{eyebrow}</span><h3>{title}</h3><p>{children}</p></div>;
}

export default function IpoApp() {
  const [view, setView] = useState<View>('explore');
  const [connected, setConnected] = useState(false);
  const [walletLabel, setWalletLabel] = useState('Connect wallet');
  const [minted, setMinted] = useState<number | null>(null);
  const [mintReady, setMintReady] = useState(false);
  const [connectionNote, setConnectionNote] = useState('Public mint configuration is not published.');
  const [quantity, setQuantity] = useState(1);
  const [mintPhase, setMintPhase] = useState<MintPhase>('idle');
  const [mintError, setMintError] = useState('');
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);

  const total = quantity * launchConfig.mintPriceSol;
  const remaining = minted === null ? null : Math.max(0, launchConfig.supply - minted);

  async function connectWallet() {
    if (!window.solana) {
      setConnectionNote('No compatible Solana wallet was found in this browser.');
      return false;
    }
    try {
      const response = await window.solana.connect();
      const key = response.publicKey.toString();
      setConnected(true);
      setWalletLabel(`${key.slice(0, 4)}...${key.slice(-4)}`);
      if (!launchConfig.config) {
        setMintReady(false);
        setConnectionNote('Wallet connected. Mint remains unavailable until the on-chain configuration is published.');
        return false;
      }
      const { fetchLaunchState } = await import('./solana-client');
      const state = await fetchLaunchState();
      setMinted(state.minted);
      const ready = !state.paused && state.minted < state.totalSupply;
      setMintReady(ready);
      setConnectionNote(state.paused ? 'Wallet connected. Minting is paused on-chain.' : 'Wallet connected. On-chain economics verified.');
      return ready;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Wallet connection failed.';
      setConnected(false);
      setWalletLabel('Connect wallet');
      setMintReady(false);
      setConnectionNote(message);
      return false;
    }
  }

  async function startMint() {
    if (!launchConfig.config) {
      setView('desk');
      return;
    }
    const ready = connected ? mintReady : await connectWallet();
    if (!ready) return;
    setMintError('');
    setMintPhase('review');
  }

  async function confirmMint() {
    if (!window.solana || submitting.current || mintPhase !== 'review') return;
    submitting.current = true;
    setIsSubmitting(true);
    setMintError('');
    setMintPhase('signing');
    const completed: Receipt[] = [];
    try {
      const { mintDesk } = await import('./solana-client');
      for (let index = 0; index < quantity; index += 1) {
        const result = await mintDesk(window.solana, () => setMintPhase('submitted'));
        completed.push(result);
        setMinted(result.serial);
        setMintPhase(index + 1 === quantity ? 'confirmed' : 'signing');
      }
      setReceipts((current) => [...completed, ...current]);
      setView('desk');
    } catch (error) {
      if (completed.length) setReceipts((current) => [...completed, ...current]);
      const message = error instanceof Error ? error.message : 'Mint failed.';
      setMintError(message);
      setMintPhase(/reject|cancel/i.test(message) ? 'cancelled' : 'failed');
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  function renderExplore() {
    const operational = Boolean(launchConfig.config);
    return <>
      <section className="hero launchHero sectionShell">
        <div className="heroCopy">
          <Status tone={operational ? 'live' : 'planned'}>{operational ? 'PASS MINT VERIFIED' : 'PASS MINT IN PREVIEW'}</Status>
          <p className="kicker">Initial Pump Offering</p>
          <h1>The launch starts before the chart.</h1>
          <p className="lede">Discover curated Solana launches, compare the setup, and follow every holder drop from funding to claim. Launch Pass holders get the first look when verified rounds go live.</p>
          <div className="economics" aria-label="Launch Pass economics">
            <div><span>LAUNCH PASSES</span><strong>{launchConfig.supply.toLocaleString()}</strong></div>
            <div><span>MINT</span><strong>{launchConfig.mintPriceSol.toFixed(3)} SOL</strong></div>
            <div><span>IPO TO MINT</span><strong>NONE</strong></div>
          </div>
          <div className="heroActions"><button className="primaryAction" type="button" onClick={startMint}>{operational ? 'Mint a Launch Pass' : 'Preview your pass'}</button><a className="secondaryAction" href="#pipeline">Explore the pipeline</a></div>
          <p className="inlineNote">{connectionNote} Network and account costs are separate.</p>
        </div>
        <div className="passStack" aria-label="IPO Launch Pass artwork previews">
          <article className="passCard passCardA"><img src="/collection/images/IPO-0001-L3.svg" alt="IPO Launch Pass 0001" /><span>IPO #0001</span></article>
          <article className="passCard passCardB"><img src="/collection/images/IPO-0420-L2.svg" alt="IPO Launch Pass 0420" /><span>IPO #0420</span></article>
          <article className="passCard passCardC"><img src="/collection/images/IPO-1212-L5.svg" alt="IPO Launch Pass 1212" /><span>IPO #1212</span></article>
        </div>
      </section>

      <div className="signalTape" aria-label="IPO product principles"><span>CURATED SUBMISSIONS</span><span>FAIR-LAUNCH RAILS</span><span>FUNDED HOLDER DROPS</span><span>ON-CHAIN RECEIPTS</span></div>

      <section className="contentSection sectionShell" id="pipeline">
        <div className="sectionTitle"><p>Launch pipeline</p><h2>Good launches deserve a better front row.</h2><span>IPO combines curation, research, community launch work, and verifiable holder benefits without pretending every submission is approved.</span></div>
        <div className="launchModules">
          <article className="accentMint"><span>01</span><h3>Discover</h3><p>Track reviewed projects by research, upcoming, funded, live, graduated, or cancelled state.</p></article>
          <article className="accentBlue"><span>02</span><h3>Compare</h3><p>Read launch structure, supply, liquidity route, holder reserve, links, and risk notes side by side.</p></article>
          <article className="accentCoral"><span>03</span><h3>Contribute</h3><p>Submit useful research, creative launch assets, explainers, feedback, and community answers.</p></article>
          <article className="accentGold"><span>04</span><h3>Verify</h3><p>Follow reserve funding, allocation, claims, creator fees, buybacks, and burns by transaction.</p></article>
        </div>
      </section>

      <section className="contentSection sectionShell opportunitySection">
        <div className="opportunityTop"><div className="sectionTitle"><p>Launch board</p><h2>Curated, not crowded.</h2></div><div className="filterTabs" aria-label="Launch filters"><button className="active">All</button><button>Research</button><button>Upcoming</button><button>Live</button></div></div>
        <div className="boardFrame"><div className="boardHead"><span>PROJECT</span><span>STAGE</span><span>HOLDER DROP</span><span>LAUNCH RAIL</span><span>RECEIPTS</span></div><EmptyState eyebrow="APPLICATIONS OPENING SOON" title="No project is being presented as live.">Approved projects will appear only after review, launch terms, token address, funding status, and risk disclosures can be shown accurately.</EmptyState></div>
      </section>

      <section className="contentSection sectionShell holderDropSection">
        <div className="holderDropCopy"><Status tone="planned">PROPOSED</Status><p className="kicker">Pass-holder drops</p><h2>Projects fund it. Holders verify it.</h2><p>Approved projects may choose a disclosed holder reserve before launch. The tokens must be deposited before eligibility opens, and every wallet can verify the reserve and final claim.</p><div className="dropFlow"><span>PROJECT FUNDS</span><i /><span>SNAPSHOT</span><i /><span>ALLOCATE</span><i /><span>CLAIM</span></div></div>
        <div className="dropOptions"><article><small>STANDARD DROP</small><strong>{launchConfig.holderPoolPercent}%</strong><p>Proposed share of project-token supply reserved for eligible passes.</p></article><article><small>FEATURED DROP</small><strong>10%</strong><p>Optional larger reserve, selected and funded by the launching project.</p></article><p>Percentages are templates, not guaranteed rights. Final terms are published per launch.</p></div>
      </section>

      <section className="contentSection sectionShell compareSection">
        <div className="compareIntro"><Status tone="planned">DATA ADAPTER NEEDED</Status><p className="kicker">IPO Compare</p><h2>Put any Solana launch beside the one you are watching.</h2><p>Comparison will use addresses, not ticker guesses. Market data, liquidity, holder concentration, launch source, and contract signals stay timestamped and attributable.</p></div>
        <div className="compareTerminal" aria-label="Token comparison preview"><div className="compareInputs"><label>TOKEN A<input disabled placeholder="Paste Solana token address" /></label><span>VS</span><label>TOKEN B<input disabled placeholder="Paste Solana token address" /></label></div><div className="compareRows"><div><span>PRICE / LIQUIDITY</span><b>Unavailable</b><b>Unavailable</b></div><div><span>HOLDER CONCENTRATION</span><b>Unavailable</b><b>Unavailable</b></div><div><span>LAUNCH SOURCE</span><b>Unavailable</b><b>Unavailable</b></div><div><span>CONTRACT SIGNALS</span><b>Unavailable</b><b>Unavailable</b></div></div><p>COMING SOON — no market-data provider is connected.</p></div>
      </section>

      <section className="contentSection sectionShell launchRailSection">
        <div className="railPanel"><p className="kicker">Planned launch rail</p><h2>Reviewed on IPO. Launched through Pump.</h2><p>Selected projects can prepare their launch with IPO, then create the token through Pump.fun. Pump’s canonical route pairs launches with SOL or USDC and graduates successful bonding curves to PumpSwap.</p><Status tone="planned">PUMP INTEGRATION NOT CONNECTED</Status></div>
        <div className="railSteps">{['Project applies', 'Review and terms', 'Holder reserve funded', 'Launch on Pump.fun', 'Track graduation and receipts'].map((step, index) => <div key={step}><span>0{index + 1}</span><strong>{step}</strong></div>)}</div>
      </section>

      <section className="contentSection sectionShell valueLoopSection">
        <article className="genesisPanel"><span className="colorDot coral" /><p className="kicker">IPO genesis drop</p><h3>A future claim for verified Launch Pass holders.</h3><p>Snapshot rules, token amount, exclusions, vesting, and claim infrastructure are not finalized. No entitlement exists until those terms and a funded claim contract are published.</p><Status tone="planned">PROPOSED</Status></article>
        <article className="burnPanel"><span className="colorDot gold" /><p className="kicker">Revenue loop</p><h3>Buy back. Burn. Prove every step.</h3><p>A future policy may direct a disclosed share of realized platform revenue to IPO purchases and burns. It is not revenue sharing, a holder payment, or a promise of returns.</p><Status tone="planned">POLICY + CONTRACT REQUIRED</Status></article>
      </section>

      <section className="contentSection sectionShell signalStrip"><div><p className="kicker">IPO Signal</p><h2>Help strong ideas travel.</h2><p>Research, explainers, launch coverage, creative campaign assets, and useful community answers can earn disclosed contribution credit after human review.</p></div><button className="secondaryAction" type="button" onClick={() => setView('signal')}>Open Signal</button></section>
    </>;
  }

  function renderDesk() {
    return <section className="appPage sectionShell">
      <div className="pageHeader"><div><p className="kicker">My Launch Pass</p><h1>Your place in the pipeline.</h1><p>Ownership, launch eligibility, funded drops, claims, contribution credit, and receipts belong in one view.</p></div>{connected ? <Status tone="live">{walletLabel}</Status> : <button className="primaryAction compact" onClick={connectWallet}>Connect wallet</button>}</div>
      {!connected ? <EmptyState eyebrow="WALLET NOT CONNECTED" title="Connect to load your passes.">A Launch Pass will gate future holder rounds. Holdings, existing claims, receipts, and disclosures will never require an upgrade.</EmptyState> : receipts.length === 0 ? <EmptyState eyebrow="NO INDEXED PASSES" title="No pass data is available yet.">The wallet is connected, but a production ownership indexer and public collection address are not configured.</EmptyState> : <div className="ownedGrid">{receipts.map((receipt) => <article key={receipt.asset}><img src={`/collection/images/IPO-${String(receipt.serial).padStart(4, '0')}-L1.svg`} alt={`IPO Launch Pass ${receipt.serial}`} /><div><Status tone="live">CONFIRMED</Status><h3>IPO #{String(receipt.serial).padStart(4, '0')}</h3><p>Member level. Metaplex Core asset confirmed in this session.</p><a href={`https://solscan.io/tx/${receipt.signature}?cluster=${launchConfig.cluster}`} target="_blank" rel="noreferrer">View transaction</a></div></article>)}</div>}
      <div className="passMetrics"><article><span>ELIGIBLE LAUNCHES</span><strong>Unavailable</strong><small>Round indexer not connected</small></article><article><span>CLAIMABLE</span><strong>Unavailable</strong><small>No funded claim program</small></article><article><span>SIGNAL CREDIT</span><strong>Unavailable</strong><small>Review system not connected</small></article></div>
      <div className="deskColumns"><div><h2>Holder drops</h2><EmptyState eyebrow="NO FUNDED ROUNDS" title="Nothing to claim yet.">Future claims will show the token address, funded reserve, snapshot, allocation, vesting, and transaction receipt.</EmptyState></div><div><h2>Optional pass levels</h2><div className="levelList">{levels.map((level, index) => <div key={level}><span>L{index + 1}</span><strong>{level}</strong><small>{index === 0 ? 'Core access and equal base eligibility' : 'Optional research tools and visual progression'}</small></div>)}</div><p className="inlineNote">Upgrade prices and payments are not finalized. Allocation multipliers are not active.</p></div></div>
    </section>;
  }

  function renderSignal() {
    return <section className="appPage sectionShell"><div className="pageHeader"><div><p className="kicker">IPO Signal</p><h1>Build attention without farming it.</h1><p>Project teams can apply. Contributors can submit original work. Every campaign needs a clear brief, deadline, reviewer, and funded reward before it opens.</p></div><Status tone="planned">PREVIEW ONLY</Status></div><div className="signalSplit"><div><h2>For projects</h2><div className="signalFlow">{['Submit the idea', 'Complete review', 'Fund the campaign', 'Publish the brief'].map((step, index) => <article key={step}><span>0{index + 1}</span><h3>{step}</h3></article>)}</div></div><div><h2>For contributors</h2><div className="signalFlow">{['Read the brief', 'Create useful work', 'Submit evidence', 'Receive review'].map((step, index) => <article key={step}><span>0{index + 1}</span><h3>{step}</h3></article>)}</div></div></div><EmptyState eyebrow="INTAKE COMING SOON" title="No campaigns are active.">Submission storage, moderation, anti-abuse review, campaign funding, and contribution credits are not connected. No projects, submissions, or rewards are being invented.</EmptyState></section>;
  }

  function renderActivity() {
    return <section className="appPage sectionShell"><div className="pageHeader"><div><p className="kicker">Activity</p><h1>The proof layer.</h1><p>Launches, deposits, snapshots, allocations, claims, creator fees, purchases, burns, and refunds are separate events.</p></div><Status tone="planned">INDEXER NEEDED</Status></div><div className="activityLegend">{['RESERVE FUNDED','SNAPSHOT FINALIZED','DROP CLAIMED','BUYBACK EXECUTED','TOKENS BURNED'].map((item) => <span key={item}>{item}</span>)}</div><div className="activityTable"><div className="tableHead"><span>TIME</span><span>EVENT</span><span>AMOUNT</span><span>TRANSACTION</span></div>{receipts.length ? receipts.map((receipt) => <div className="tableRow" key={receipt.signature}><span>THIS SESSION</span><span>PASS MINT CONFIRMED</span><span>{launchConfig.mintPriceSol.toFixed(3)} SOL</span><a href={`https://solscan.io/tx/${receipt.signature}?cluster=${launchConfig.cluster}`} target="_blank" rel="noreferrer">{receipt.signature.slice(0, 8)}...</a></div>) : <div className="tableEmpty">No verified protocol activity is available.</div>}</div></section>;
  }

  return <main>
    <header className="siteHeader"><button className="wordmark" onClick={() => setView('explore')} aria-label="IPO home"><span>IPO</span><small>INITIAL PUMP OFFERING</small></button><nav aria-label="Primary navigation">{navItems.map(([id, label]) => <button className={view === id ? 'active' : ''} key={id} onClick={() => setView(id)}>{label}</button>)}<a href="/docs">Docs</a></nav><button className="walletControl" onClick={connectWallet}>{walletLabel}</button><details className="mobileMenu"><summary aria-label="Open menu">MENU</summary><a href="/docs">Docs</a><span>{connectionNote}</span></details></header>
    {view === 'explore' ? renderExplore() : view === 'desk' ? renderDesk() : view === 'signal' ? renderSignal() : renderActivity()}
    <footer><span>IPO</span><p>Curated project-token launches and membership. Not equity, guaranteed access, or financial advice.</p><a href="/docs">Read the docs</a></footer>
    <nav className="mobileNav" aria-label="Mobile navigation">{navItems.map(([id, label, icon]) => <button className={view === id ? 'active' : ''} key={id} onClick={() => setView(id)}><i>{icon}</i><span>{label}</span></button>)}</nav>
    {mintPhase !== 'idle' && <div className="modalBackdrop" role="presentation"><section className="mintDialog" role="dialog" aria-modal="true" aria-labelledby="mint-title"><div className="dialogHead"><div><p className="kicker">Pass mint</p><h2 id="mint-title">{mintPhase === 'review' ? 'Review your mint.' : mintPhase === 'confirmed' ? 'Mint confirmed.' : mintPhase === 'failed' ? 'Mint failed.' : mintPhase === 'cancelled' ? 'Signature cancelled.' : 'Transaction in progress.'}</h2></div>{!isSubmitting && <button aria-label="Close mint dialog" onClick={() => setMintPhase('idle')}>X</button>}</div>{mintPhase === 'review' ? <><label className="quantityLabel">Quantity <span><button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity === 1}>-</button><strong>{quantity}</strong><button onClick={() => setQuantity(Math.min(3, quantity + 1))} disabled={quantity === 3 || (remaining !== null && quantity >= remaining)}>+</button></span></label><dl className="mintSummary"><div><dt>Pass price</dt><dd>{launchConfig.mintPriceSol.toFixed(3)} SOL</dd></div><div><dt>Quantity</dt><dd>{quantity}</dd></div><div><dt>Mint total</dt><dd>{total.toFixed(3)} SOL</dd></div><div><dt>Network/account costs</dt><dd>Estimated by wallet simulation</dd></div><div><dt>IPO required</dt><dd>None</dd></div><div><dt>Remaining</dt><dd>{remaining === null ? 'Unavailable' : remaining.toLocaleString()}</dd></div></dl><button className="primaryAction full" onClick={confirmMint}>Request signature</button></> : <div className="transactionState"><span className={`stateMark ${mintPhase}`} />{mintPhase === 'signing' && <p>Review the exact transaction in your wallet.</p>}{mintPhase === 'submitted' && <p>Submitted. Waiting for on-chain confirmation.</p>}{mintPhase === 'confirmed' && <p>Your Core asset was verified after confirmation and added to My Pass.</p>}{(mintPhase === 'failed' || mintPhase === 'cancelled') && <><p>{mintError}</p><button className="secondaryAction" onClick={() => setMintPhase('review')}>Review and retry</button></>}</div>}</section></div>}
  </main>;
}
