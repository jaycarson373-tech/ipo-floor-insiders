"use client";

import { Check, ExternalLink, WalletCards, X } from "lucide-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { PublicKey } from "@solana/web3.js";
import type { WalletProvider } from "./solana-client";

type BrowserWallet = WalletProvider & {
  disconnect?: () => Promise<void>;
  isBackpack?: boolean;
  isConnected?: boolean;
  isPhantom?: boolean;
  isSolflare?: boolean;
  name?: string;
  on?: (event: string, callback: (key?: PublicKey) => void) => void;
  off?: (event: string, callback: (key?: PublicKey) => void) => void;
  providers?: BrowserWallet[];
};

declare global {
  interface Window {
    backpack?: { solana?: BrowserWallet };
    phantom?: { solana?: BrowserWallet };
    solana?: BrowserWallet;
    solflare?: BrowserWallet;
  }
}

type WalletState = {
  address: string;
  connected: boolean;
  connecting: boolean;
  disconnect: () => Promise<void>;
  notice: string;
  openPicker: () => void;
  provider: BrowserWallet | null;
  setNotice: (notice: string) => void;
};

const WalletContext = createContext<WalletState | null>(null);

function walletName(provider: BrowserWallet) {
  if (provider.isPhantom) return "Phantom";
  if (provider.isSolflare) return "Solflare";
  if (provider.isBackpack) return "Backpack";
  return provider.name || "Solana wallet";
}

function discoverWallets() {
  const candidates = [
    window.phantom?.solana,
    window.solflare,
    window.backpack?.solana,
    ...(window.solana?.providers ?? []),
    window.solana,
  ].filter(Boolean) as BrowserWallet[];
  return [...new Map(candidates.map((provider) => [walletName(provider), provider])).entries()].map(([name, provider]) => ({ name, provider }));
}

export function WalletProviderRoot({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<Array<{ name: string; provider: BrowserWallet }>>([]);
  const [provider, setProvider] = useState<BrowserWallet | null>(null);
  const [address, setAddress] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const initial = window.setTimeout(() => setWallets(discoverWallets()), 0);
    const delayed = window.setTimeout(() => setWallets(discoverWallets()), 800);
    return () => { window.clearTimeout(initial); window.clearTimeout(delayed); };
  }, []);

  useEffect(() => {
    if (!provider) return;
    const handleAccount = (key?: PublicKey) => {
      const next = key?.toString() ?? "";
      setAddress(next);
      if (!next) setProvider(null);
    };
    const handleDisconnect = () => { setAddress(""); setProvider(null); };
    provider.on?.("accountChanged", handleAccount);
    provider.on?.("disconnect", handleDisconnect);
    return () => {
      provider.off?.("accountChanged", handleAccount);
      provider.off?.("disconnect", handleDisconnect);
    };
  }, [provider]);

  async function connect(nextProvider: BrowserWallet) {
    setConnecting(true);
    setNotice("");
    try {
      const response = await nextProvider.connect();
      setProvider(nextProvider);
      setAddress(response.publicKey.toString());
      setPickerOpen(false);
      setNotice(`${walletName(nextProvider)} connected. Review every transaction in your wallet before signing.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Wallet connection was cancelled.");
    } finally {
      setConnecting(false);
    }
  }

  async function disconnect() {
    try {
      await provider?.disconnect?.();
    } finally {
      setAddress("");
      setProvider(null);
      setNotice("Wallet disconnected.");
    }
  }

  function openPicker() {
    setWallets(discoverWallets());
    setPickerOpen(true);
  }

  const value = { address, connected: Boolean(address && provider), connecting, disconnect, notice, openPicker, provider, setNotice };

  return (
    <WalletContext.Provider value={value}>
      {children}
      {pickerOpen && (
        <div className="walletBackdrop" onClick={() => setPickerOpen(false)} role="presentation">
          <section aria-labelledby="wallet-picker-title" aria-modal="true" className="walletPicker" onClick={(event) => event.stopPropagation()} role="dialog">
            <button aria-label="Close wallet picker" className="walletPickerClose" onClick={() => setPickerOpen(false)} type="button"><X size={18} /></button>
            <div className="walletPickerMark"><WalletCards /></div>
            <p className="pioEyebrow">SOLANA WALLET</p>
            <h2 id="wallet-picker-title">Connect to IPO.</h2>
            <p>Connecting is free. IPO cannot access funds without a transaction you explicitly approve.</p>
            <div className="walletChoices">
              {wallets.map(({ name, provider: option }) => (
                <button disabled={connecting} key={name} onClick={() => void connect(option)} type="button">
                  <span>{name.slice(0, 1)}</span><strong>{name}</strong><small>{connecting ? "CONNECTING" : "DETECTED"}</small><Check size={16} />
                </button>
              ))}
            </div>
            {wallets.length === 0 && (
              <div className="walletInstall">
                <strong>No compatible wallet detected.</strong>
                <p>Install a Wallet Standard-compatible Solana wallet, then refresh this page.</p>
                <div><a href="https://phantom.com" rel="noreferrer" target="_blank">Phantom <ExternalLink size={13} /></a><a href="https://solflare.com" rel="noreferrer" target="_blank">Solflare <ExternalLink size={13} /></a><a href="https://backpack.app" rel="noreferrer" target="_blank">Backpack <ExternalLink size={13} /></a></div>
              </div>
            )}
          </section>
        </div>
      )}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const state = useContext(WalletContext);
  if (!state) throw new Error("useWallet must be used inside WalletProviderRoot.");
  return state;
}
