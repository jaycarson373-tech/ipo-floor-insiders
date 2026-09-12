"use client";

import {
  BarChart3,
  BookOpen,
  Boxes,
  Gift,
  Menu,
  Rocket,
  Search,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { WalletProvider } from "./solana-client";

declare global {
  interface Window {
    solana?: WalletProvider & { isPhantom?: boolean };
  }
}

const nav = [
  { href: "/", label: "Discover", icon: Search },
  { href: "/launch", label: "Launch", icon: Rocket },
  { href: "/rewards", label: "Rewards", icon: Gift },
  { href: "/collection", label: "Collection", icon: Boxes },
];

export default function PlatformChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [wallet, setWallet] = useState("Connect");
  const [notice, setNotice] = useState("");

  async function connectWallet() {
    if (!window.solana) {
      setNotice("No compatible Solana wallet was found in this browser.");
      return;
    }
    try {
      const response = await window.solana.connect();
      const key = response.publicKey.toString();
      setWallet(`${key.slice(0, 4)}...${key.slice(-4)}`);
      setNotice("Wallet connected. Financial actions remain unavailable until their on-chain programs are verified.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Wallet connection was cancelled.");
    }
  }

  return (
    <>
      <header className="lpHeader">
        <Link className="lpBrand" href="/" aria-label="IPO home">
          <span>IPO</span>
          <small>INITIAL PUMP OFFERING</small>
        </Link>
        <nav className="lpDesktopNav" aria-label="Primary navigation">
          {nav.map((item) => (
            <Link className={pathname === item.href ? "active" : ""} href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <Link className={pathname === "/activity" ? "active" : ""} href="/activity">
            Activity
          </Link>
        </nav>
        <div className="lpHeaderActions">
          <Link className="lpDocsLink" href="/docs"><BookOpen size={15} /> Docs</Link>
          <button className="lpWallet" onClick={connectWallet} type="button">
            <WalletCards size={16} /> {wallet}
          </button>
          <details className="lpMenu">
            <summary aria-label="Open menu"><Menu size={20} /></summary>
            <div>
              <Link href="/docs"><BookOpen size={16} /> Docs</Link>
              <Link href="/activity"><BarChart3 size={16} /> Activity</Link>
              <button onClick={connectWallet} type="button"><WalletCards size={16} /> {wallet}</button>
            </div>
          </details>
        </div>
      </header>
      {notice && (
        <div className="lpNotice" role="status">
          <span>{notice}</span>
          <button aria-label="Dismiss notice" onClick={() => setNotice("")} type="button">×</button>
        </div>
      )}
      {children}
      <footer className="lpFooter">
        <div>
          <strong>IPO</strong>
          <span>Initial Pump Offering</span>
        </div>
        <p>Launch terms, fee routes, and rewards should be verifiable before capital moves.</p>
        <nav>
          <Link href="/docs">Docs</Link>
          <Link href="/activity">Activity</Link>
          <a href="https://solana.com" rel="noreferrer" target="_blank">Solana</a>
        </nav>
      </footer>
      <nav className="lpMobileNav" aria-label="Mobile navigation">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <Link className={pathname === item.href ? "active" : ""} href={item.href} key={item.href}>
              <Icon size={19} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
