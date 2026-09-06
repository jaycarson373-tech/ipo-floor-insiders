'use client';

/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { launchConfig } from './launch-config';
import type { WalletProvider } from './solana-client';

declare global {
  interface Window {
    solana?: WalletProvider & {
      isPhantom?: boolean;
    };
  }
}

const insiderSamples = [
  { id: 'GTA-001', market: 'GTA', rarity: 'Common', level: 1, environment: 'Bedroom desk' },
  { id: 'GTA-181', market: 'GTA', rarity: 'Uncommon', level: 2, environment: 'Private office' },
  { id: 'NLNK-251', market: 'NLNK', rarity: 'Rare', level: 3, environment: 'Institutional room' },
  { id: 'GTA-319', market: 'GTA', rarity: 'Epic', level: 4, environment: 'Elite trading floor' },
  { id: 'NLNK-332', market: 'NLNK', rarity: 'Mythic', level: 5, environment: 'Executive command center' },
  { id: 'ANTH-333', market: 'ANTH', rarity: 'Mythic', level: 5, environment: 'Executive command center' },
];

const markets = [
  { ticker: 'GTA', name: 'GTA', description: 'Entertainment / gaming market', accent: '#bbff34', sample: 'GTA-001' },
  { ticker: 'NLNK', name: 'NEURALINK', description: 'Deep-tech market', accent: '#42d8ff', sample: 'NLNK-002' },
  { ticker: 'ANTH', name: 'ANTHROPIC', description: 'Frontier-AI market', accent: '#ffca3a', sample: 'ANTH-003' },
];

const upgrades = [
  ['L1', 'Current level', '1.00x'],
  ['L2', '150,000 IPO + 0.03 SOL', '1.35x'],
  ['L3', '250,000 IPO + 0.04 SOL', '1.70x'],
  ['L4', '400,000 IPO + 0.06 SOL', '2.05x'],
  ['L5', '650,000 IPO + 0.08 SOL', '2.40x'],
  ['L6', '1,000,000 IPO + 0.11 SOL', '2.75x'],
  ['L7', '1,500,000 IPO + 0.15 SOL', '3.10x'],
  ['L8', '2,250,000 IPO + 0.21 SOL', '3.45x'],
  ['L9', '3,300,000 IPO + 0.30 SOL', '3.80x'],
  ['L10', '4,800,000 IPO + 0.42 SOL', '4.15x'],
] as const;

const launchSteps = [
  'Project applies',
  'Project review / KYC',
  'Token launches',
  '3.3% holder pool',
  'Desk holders receive priority based on level',
];

function InsiderCard({ desk }: { desk: (typeof insiderSamples)[number] }) {
  return (
    <article className="nftCard">
      <img
        alt={`${desk.rarity} ${desk.market} IPO Floor anonymous insider ${desk.id}`}
        className="nftImage"
        src={`/collection/images/${desk.id}-L${desk.level}.webp`}
      />
      <div className="nftMeta">
        <span>{desk.rarity}</span>
        <h3>{desk.id}</h3>
        <p>{desk.environment}</p>
        <small>Anonymous insider · Art stage {desk.level}</small>
      </div>
    </article>
  );
}

export default function Home() {
  const [selectedMarket, setSelectedMarket] = useState(markets[0]);
  const [walletLabel, setWalletLabel] = useState('Not connected');
  const [connected, setConnected] = useState(false);
  const [minted, setMinted] = useState<number | null>(null);
  const [mintStatus, setMintStatus] = useState<'idle' | 'checking' | 'ready' | 'minting' | 'confirmed' | 'error'>('idle');
  const [log, setLog] = useState([
    '$ ipo floor status',
    '> wallet connection............ live',
    `> on-chain mint................ ${launchConfig.config ? 'checking' : 'setup pending'}`,
    '> desk rentals................. coming soon',
  ]);

  async function connectWallet() {
    if (typeof window === 'undefined' || !window.solana) {
      setLog([
        '$ wallet connect',
        '> Solana wallet not found',
        '> install or open a compatible wallet, then retry',
      ]);
      return;
    }

    try {
      setMintStatus('checking');
      const response = await window.solana.connect();
      const publicKey = response.publicKey.toString();
      const label = `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
      setConnected(true);
      setWalletLabel(label);
      try {
        const { fetchLaunchState } = await import('./solana-client');
        const launch = await fetchLaunchState();
        setMinted(launch.minted);
        setMintStatus('ready');
        setLog([
          '$ wallet connect',
          `> wallet...................... ${label}`,
          `> network..................... ${launchConfig.cluster}`,
          `> supply...................... ${launch.minted}/${launch.totalSupply}`,
          `> mint........................ ${launch.paused ? 'paused' : 'ready'}`,
        ]);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Mint configuration could not be verified.';
        setMintStatus('error');
        setLog(['$ launch verify', `> ${message}`]);
      }
    } catch {
      setConnected(false);
      setWalletLabel('Not connected');
      setMintStatus('idle');
      setLog(['$ wallet connect', '> connection cancelled']);
    }
  }

  async function handleMint() {
    if (!connected) {
      await connectWallet();
      return;
    }
    if (!window.solana) return;

    try {
      setMintStatus('minting');
      setLog([
        '$ mint desk',
        '> cost......................... 0.25 SOL',
        '> lock......................... 1,000,000 IPO',
        '> awaiting wallet approval',
      ]);
      const { mintDesk } = await import('./solana-client');
      const result = await mintDesk(window.solana);
      setMinted(result.serial);
      setMintStatus('confirmed');
      setLog([
        '$ mint desk',
        `> desk......................... #${String(result.serial).padStart(3, '0')}`,
        `> core asset................... ${result.asset.slice(0, 8)}...${result.asset.slice(-8)}`,
        `> transaction.................. ${result.signature.slice(0, 12)}...`,
        '> status....................... confirmed',
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Mint failed.';
      setMintStatus('error');
      setLog(['$ mint desk', `> ${message}`]);
    }
  }

  const mintReady = connected && (mintStatus === 'ready' || mintStatus === 'confirmed');
  const mintBusy = mintStatus === 'checking' || mintStatus === 'minting';
  const mintLabel = mintStatus === 'minting'
    ? 'Signing and minting...'
    : !connected
      ? 'Connect to mint'
      : mintReady
        ? `Mint desk #${String((minted ?? 0) + 1).padStart(3, '0')}`
        : 'Mint unavailable';

  return (
    <main>
      <nav className="topbar" aria-label="Primary">
        <a className="brand" href="#mint" aria-label="IPO Floor home">
          <span className="brandMark" />
          IPO
        </a>
        <div className="navLinks">
          <a href="#mint">Mint</a>
          <a href="#priority">Allocation</a>
          <a href="#markets">Markets</a>
          <a href="#collection">Art</a>
          <a href="#levels">Levels</a>
          <a href="#launchpad">Launchpad</a>
          <a href="/docs">Docs</a>
          <a href="#terminal">Terminal</a>
        </div>
      </nav>

      <section className="hero" id="mint">
        <div className="heroCopy">
          <p className="eyebrow">Initial Pump Offering</p>
          <h1>OWN THE IPO FLOOR.</h1>
          <p className="heroPromise">
            333 insider desks.<br />
            Three markets.<br />
            Priority access to every launch.
          </p>
          <div className="heroCosts" aria-label="Mint costs">
            <span><small>Mint</small>0.25 SOL</span>
            <span><small>Lock</small>1,000,000 $IPO</span>
          </div>
          <div className="actions">
            <button className="primaryBtn" type="button" onClick={connectWallet}>
              {connected ? `Connected ${walletLabel}` : 'CONNECT TO MINT'}
            </button>
          </div>
          <p className="statusNote">
            {launchConfig.config
              ? 'Connect to verify the live on-chain mint configuration.'
              : 'The mint contract is built. Public launch addresses are not configured yet.'}
          </p>
        </div>

        <div className="mintPanel" aria-label="Mint preview">
          <div className="panelHeader">
            <span>mint book</span>
            <strong>{launchConfig.supply} desks</strong>
          </div>
          <div className="selector" role="group" aria-label="Choose market">
            {markets.map((market) => (
              <button
                key={market.ticker}
                className={market.ticker === selectedMarket.ticker ? 'selected' : ''}
                type="button"
                onClick={() => setSelectedMarket(market)}
              >
                {market.ticker}
              </button>
            ))}
          </div>
          <img
            alt={`${selectedMarket.name} IPO Floor insider preview`}
            className="mintNftPreview"
            src={`/collection/images/${selectedMarket.sample}-L1.webp`}
          />
          <dl className="stats compactStats">
            <div><dt>Mint</dt><dd>0.25 SOL</dd></div>
            <div><dt>IPO lock</dt><dd>1,000,000 $IPO</dd></div>
            <div><dt>Minted</dt><dd>{minted === null ? `— / ${launchConfig.supply}` : `${minted} / ${launchConfig.supply}`}</dd></div>
          </dl>
          <button
            className={`mintButton ${mintReady || !connected ? '' : 'isDisabled'}`}
            type="button"
            disabled={mintBusy || (connected && !mintReady)}
            onClick={handleMint}
          >
            {mintLabel}
          </button>
          <small className="feeNote">Normal network fees may apply.</small>
        </div>
      </section>

      <section className="priorityBand" id="priority" aria-labelledby="priority-title">
        <div className="priorityCopy">
          <p className="eyebrow">Holder priority</p>
          <h2 id="priority-title">EVERY LAUNCH.<br />DESK HOLDERS FIRST.</h2>
          <p>Every IPO Floor launch reserves 3.3% for desk holders.</p>
          <p>Your desk level determines your weight inside the holder allocation.</p>
        </div>
        <div className="priorityMetric" aria-label="Holder allocation pool">
          <strong>3.3%</strong>
          <span>holder priority pool</span>
        </div>
        <div className="mechanicLine" aria-label="Holder progression">
          <span>MINT</span><b>→</b><span>LEVEL UP</span><b>→</b><span>INCREASE ALLOCATION WEIGHT</span>
        </div>
      </section>

      <section className="deskBand" id="markets" aria-labelledby="market-title">
        <div className="sectionHead">
          <div><p className="eyebrow">Three IPO markets</p><h2 id="market-title">Choose your desk.</h2></div>
        </div>
        <div className="deskGrid marketScroller">
          {markets.map((market, index) => (
            <article className="deskCard" key={market.ticker}>
              <div className="cardArt" style={{ '--accent': market.accent } as CSSProperties}>
                <span className="serial">MARKET {String(index + 1).padStart(2, '0')}</span>
                <span className="ticker">{market.ticker}</span>
                <span className="plug" />
              </div>
              <h3>{market.name}</h3>
              <p>{market.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="artBand" id="collection" aria-labelledby="art-title">
        <div className="sectionHead">
          <div><p className="eyebrow">Insider collection</p><h2 id="art-title">333 anonymous insiders.</h2></div>
        </div>
        <div className="nftGrid">
          {insiderSamples.map((desk) => <InsiderCard desk={desk} key={desk.id} />)}
        </div>
      </section>

      <section className="upgradeBand" id="levels" aria-labelledby="level-title">
        <div className="sectionHead">
          <div><p className="eyebrow">Ten levels</p><h2 id="level-title">Level determines allocation weight.</h2></div>
          <a className="ghostBtn" href="/docs#levels">Detailed costs in Docs</a>
        </div>
        <div className="levelTrack" aria-label="Level progression">
          {upgrades.map(([level]) => <span key={level}>{level}</span>)}
        </div>
        <div className="levelStats">
          <div><small>Current level</small><strong>BASE</strong></div>
          <div><small>Next upgrade cost</small><strong>L1 · 150,000 IPO + 0.03 SOL</strong></div>
          <div><small>Allocation weight</small><strong>1.00x</strong></div>
          <div><small>Max level</small><strong>L10</strong></div>
        </div>
        <p className="statusNote darkNote">On-chain level upgrades are coming soon. Economics are unchanged.</p>
      </section>

      <section className="launchBand" id="launchpad" aria-labelledby="launch-title">
        <div className="sectionHead">
          <div><p className="eyebrow">How a launch works</p><h2 id="launch-title">From application to holder pool.</h2></div>
        </div>
        <div className="launchFlow">
          {launchSteps.map((step, index) => (
            <div className="launchStep" key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
              {index < launchSteps.length - 1 ? <b aria-hidden="true">↓</b> : null}
            </div>
          ))}
        </div>
        <p className="statusNote">Launchpad applications and token launches are coming soon. No allocation is guaranteed.</p>
      </section>

      <section className="comingBand" aria-labelledby="coming-title">
        <div className="sectionHead">
          <div><p className="eyebrow">Coming soon</p><h2 id="coming-title">Next on the floor.</h2></div>
        </div>
        <div className="comingGrid">
          {launchConfig.config
            ? <article><span>LIVE</span><h3>On-chain mint</h3><p>Atomic Metaplex Core mint and $IPO lock.</p></article>
            : <article><span>SETUP REQUIRED</span><h3>On-chain mint</h3><p>Contract deployment addresses must be published.</p></article>}
          <article><span>COMING SOON</span><h3>Level upgrades</h3><p>On-chain level progression and allocation weights.</p></article>
          <article><span>COMING SOON</span><h3>Desk rentals</h3><p>Rentals are not currently functional.</p></article>
          <article><span>COMING SOON</span><h3>Launchpad</h3><p>Project applications, review, KYC, and holder rounds.</p></article>
        </div>
      </section>

      <section className="terminalWrap" id="terminal" aria-labelledby="terminal-title">
        <div className="terminalIntro">
          <p className="eyebrow">IPO terminal</p>
          <h2 id="terminal-title">Open the floor.</h2>
          <p>Connect a Solana wallet to verify the contract, balances, supply, and mint status.</p>
          <button className="primaryBtn" type="button" onClick={connectWallet}>
            {connected ? `Connected ${walletLabel}` : 'CONNECT WALLET'}
          </button>
        </div>
        <div className="terminal" role="region" aria-label="IPO terminal status">
          <div className="terminalChrome"><span /><span /><span /></div>
          <pre>{log.join('\n')}</pre>
        </div>
      </section>
    </main>
  );
}
