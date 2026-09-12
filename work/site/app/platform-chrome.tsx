"use client";

import {
  BookOpen,
  Flame,
  Gift,
  Layers3,
  LogOut,
  Menu,
  Rocket,
  ShieldCheck,
  Sparkles,
  WalletCards,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useWallet } from "./wallet-context";

const nav = [
  { href: "/", label: "IPO", icon: Flame },
  { href: "/pumpios", label: "Pumpios", icon: Sparkles },
  { href: "/leveling", label: "Leveling", icon: Layers3 },
  { href: "/rewards", label: "Rewards", icon: Gift },
  { href: "/launchpad", label: "Launchpad", icon: Rocket },
  { href: "/proof", label: "Proof", icon: ShieldCheck },
  { href: "/mint", label: "Mint", icon: WalletCards },
];

const mobileNav = nav.filter((item) => ["/", "/pumpios", "/launchpad", "/mint"].includes(item.href));

export default function PlatformChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { address, connected, disconnect, notice, openPicker, setNotice } = useWallet();
  const walletLabel = connected ? `${address.slice(0, 4)}...${address.slice(-4)}` : "Connect";

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
        </nav>
        <div className="lpHeaderActions">
          <Link className="lpDocsLink" href="/docs"><BookOpen size={15} /> Docs</Link>
          {connected ? (
            <details className="lpAccount">
              <summary className="lpWallet"><i /> {walletLabel}</summary>
              <div><span>CONNECTED WALLET</span><code>{address}</code><small>SOLANA / {process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? "devnet"}</small><button onClick={() => void disconnect()} type="button"><LogOut size={14} /> Disconnect</button></div>
            </details>
          ) : <button className="lpWallet" onClick={openPicker} type="button"><WalletCards size={16} /> Connect</button>}
          <details className="lpMenu">
            <summary aria-label="Open menu"><Menu size={20} /></summary>
            <div>
              <Link href="/docs"><BookOpen size={16} /> Docs</Link>
              {mobileNav.map((item) => {
                const Icon = item.icon;
                return <Link href={item.href} key={item.href}><Icon size={16} /> {item.label}</Link>;
              })}
              {connected ? <button onClick={() => void disconnect()} type="button"><LogOut size={16} /> Disconnect {walletLabel}</button> : <button onClick={openPicker} type="button"><WalletCards size={16} /> Connect wallet</button>}
            </div>
          </details>
        </div>
      </header>
      {notice && (
        <div className="lpNotice" role="status">
          <span>{notice}</span>
          <button aria-label="Dismiss notice" onClick={() => setNotice("")} type="button"><X size={16} /></button>
        </div>
      )}
      {children}
      <footer className="lpFooter">
        <div>
          <strong>IPO</strong>
          <span>Initial Pump Offering</span>
        </div>
        <p>Serious launch infrastructure. Unserious underwriters.</p>
        <nav>
          <Link href="/docs">Docs</Link>
          <Link href="/proof">Proof</Link>
          <a href="https://solana.com" rel="noreferrer" target="_blank">Solana</a>
        </nav>
      </footer>
      <nav className="lpMobileNav" aria-label="Mobile navigation">
        {mobileNav.map((item) => {
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
