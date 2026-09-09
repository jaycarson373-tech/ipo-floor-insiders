"use client";

/* eslint-disable @next/next/no-img-element */

import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Blocks,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ExternalLink,
  FileCheck2,
  FolderOpen,
  LayoutDashboard,
  Menu,
  Plus,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { launchConfig } from "./launch-config";
import {
  productFeatures,
  rewardAssets,
  type ProductStatus,
} from "./product-data";
import { validateFeeShares } from "./platform-domain.mjs";
import type { WalletProvider } from "./solana-client";

declare global {
  interface Window {
    solana?: WalletProvider & { isPhantom?: boolean };
  }
}

type View = "explore" | "desk" | "rooms" | "activity";
type MintPhase =
  | "idle"
  | "review"
  | "signing"
  | "submitted"
  | "confirmed"
  | "cancelled"
  | "failed";
type Receipt = { serial: number; asset: string; signature: string };
type LocalEvent = { id: string; time: string; event: string; state: string };
type LaunchDraft = {
  name: string;
  ticker: string;
  description: string;
  artwork: string;
  website: string;
  social: string;
  rewardAsset: string;
  coinHolders: number;
  deskHolders: number;
  creator: number;
  operations: number;
  initialPurchaseSol: string;
  state: "draft" | "review_ready";
  updatedAt: string;
};
type OfferingDraft = {
  project: string;
  contact: string;
  product: string;
  raise: string;
  supply: string;
  teamAllocation: string;
  vesting: string;
  useOfFunds: string;
  launchPlan: string;
  materials: string;
  updatedAt: string;
};
type RoomDraft = {
  title: string;
  thesis: string;
  source: string;
  catalyst: string;
  catalystStatus: "confirmed" | "reported" | "speculative";
  invalidation: string;
  author: string;
  disclosure: string;
  updatedAt: string;
};

const defaultLaunch: LaunchDraft = {
  name: "",
  ticker: "",
  description: "",
  artwork: "",
  website: "",
  social: "",
  rewardAsset: "wsol",
  ...launchConfig.defaultFeeSharesBps,
  initialPurchaseSol: "",
  state: "draft",
  updatedAt: "",
};
const defaultOffering: OfferingDraft = {
  project: "",
  contact: "",
  product: "",
  raise: "",
  supply: "",
  teamAllocation: "",
  vesting: "",
  useOfFunds: "",
  launchPlan: "",
  materials: "",
  updatedAt: "",
};
const defaultRoom: RoomDraft = {
  title: "",
  thesis: "",
  source: "",
  catalyst: "",
  catalystStatus: "reported",
  invalidation: "",
  author: "",
  disclosure: "",
  updatedAt: "",
};
const navItems: Array<{ id: View; label: string; icon: typeof Search }> = [
  { id: "explore", label: "Explore", icon: Search },
  { id: "desk", label: "My Desk", icon: LayoutDashboard },
  { id: "rooms", label: "Rooms", icon: FolderOpen },
  { id: "activity", label: "Activity", icon: Activity },
];
const launchSteps = [
  "Project",
  "Rewards",
  "Fee routing",
  "Initial buy",
  "Review",
  "Execute",
];

function Status({
  children,
  tone = "preview",
}: {
  children: ReactNode;
  tone?: ProductStatus | "live";
}) {
  return <span className={`status status-${tone}`}>{children}</span>;
}
function EmptyState({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="emptyState">
      <span>{eyebrow}</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="sectionHeading">
      <p>{eyebrow}</p>
      <h2>{title}</h2>
      {body && <span>{body}</span>}
    </div>
  );
}
function formatBps(value: number) {
  return `${(value / 100).toFixed(value % 100 ? 2 : 0)}%`;
}

export default function IpoApp() {
  const [view, setView] = useState<View>("explore");
  const [roomsMode, setRoomsMode] = useState<
    "watch" | "launch" | "application"
  >("watch");
  const [connected, setConnected] = useState(false);
  const [walletLabel, setWalletLabel] = useState("Connect");
  const [minted, setMinted] = useState<number | null>(null);
  const [mintReady, setMintReady] = useState(false);
  const [connectionNote, setConnectionNote] = useState(
    "Public mint configuration is not published.",
  );
  const [quantity, setQuantity] = useState(1);
  const [mintPhase, setMintPhase] = useState<MintPhase>("idle");
  const [mintError, setMintError] = useState("");
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [launchStep, setLaunchStep] = useState(0);
  const [launchDraft, setLaunchDraft] = useState<LaunchDraft>(defaultLaunch);
  const [offeringDraft, setOfferingDraft] =
    useState<OfferingDraft>(defaultOffering);
  const [roomDraft, setRoomDraft] = useState<RoomDraft>(defaultRoom);
  const [localEvents, setLocalEvents] = useState<LocalEvent[]>([]);
  const [notice, setNotice] = useState("");
  const submitting = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const launch = localStorage.getItem("ipo-launch-draft-v1");
        const offering = localStorage.getItem("ipo-offering-draft-v1");
        const events = localStorage.getItem("ipo-local-events-v1");
        const room = localStorage.getItem("ipo-room-draft-v1");
        if (launch) setLaunchDraft({ ...defaultLaunch, ...JSON.parse(launch) });
        if (offering)
          setOfferingDraft({ ...defaultOffering, ...JSON.parse(offering) });
        if (events) setLocalEvents(JSON.parse(events));
        if (room) setRoomDraft({ ...defaultRoom, ...JSON.parse(room) });
      } catch {
        setNotice("A saved browser draft could not be loaded.");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const total = quantity * launchConfig.mintPriceSol;
  const remaining =
    minted === null ? null : Math.max(0, launchConfig.supply - minted);
  const feeValidation = useMemo(
    () =>
      validateFeeShares({
        coinHolders: launchDraft.coinHolders,
        deskHolders: launchDraft.deskHolders,
        creator: launchDraft.creator,
        operations: launchDraft.operations,
      }),
    [
      launchDraft.coinHolders,
      launchDraft.deskHolders,
      launchDraft.creator,
      launchDraft.operations,
    ],
  );

  function addLocalEvent(event: string, state: string) {
    const entry = {
      id: crypto.randomUUID(),
      time: new Date().toISOString(),
      event,
      state,
    };
    setLocalEvents((current) => {
      const next = [entry, ...current].slice(0, 20);
      localStorage.setItem("ipo-local-events-v1", JSON.stringify(next));
      return next;
    });
  }
  function saveLaunchDraft(reviewReady = false) {
    const next = {
      ...launchDraft,
      state: reviewReady ? ("review_ready" as const) : ("draft" as const),
      updatedAt: new Date().toISOString(),
    };
    setLaunchDraft(next);
    localStorage.setItem("ipo-launch-draft-v1", JSON.stringify(next));
    addLocalEvent(
      reviewReady
        ? "Instant launch packet completed"
        : "Instant launch draft saved",
      "BROWSER ONLY",
    );
    setNotice(
      reviewReady
        ? "Review packet saved. Execution remains disabled until production services are configured."
        : "Draft saved in this browser.",
    );
  }
  function saveOfferingDraft() {
    const next = { ...offeringDraft, updatedAt: new Date().toISOString() };
    setOfferingDraft(next);
    localStorage.setItem("ipo-offering-draft-v1", JSON.stringify(next));
    addLocalEvent("Curated offering application saved", "BROWSER ONLY");
    setNotice(
      "Application saved locally. Server submission and deposits are not enabled.",
    );
  }
  function saveRoomDraft() {
    const next = { ...roomDraft, updatedAt: new Date().toISOString() };
    setRoomDraft(next);
    localStorage.setItem("ipo-room-draft-v1", JSON.stringify(next));
    addLocalEvent("IPO Room research draft saved", "BROWSER ONLY");
    setNotice("Research draft saved in this browser. It is not published.");
  }
  function goTo(next: View) {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function openRooms(mode: "watch" | "launch" | "application") {
    setRoomsMode(mode);
    goTo("rooms");
  }

  async function connectWallet() {
    if (!window.solana) {
      setConnectionNote(
        "No compatible Solana wallet was found in this browser.",
      );
      return false;
    }
    try {
      const response = await window.solana.connect();
      const key = response.publicKey.toString();
      setConnected(true);
      setWalletLabel(`${key.slice(0, 4)}...${key.slice(-4)}`);
      if (!launchConfig.config) {
        setMintReady(false);
        setConnectionNote(
          "Wallet connected. Mint remains unavailable until the on-chain configuration is published.",
        );
        return false;
      }
      const { fetchLaunchState } = await import("./solana-client");
      const state = await fetchLaunchState();
      setMinted(state.minted);
      const ready = !state.paused && state.minted < state.totalSupply;
      setMintReady(ready);
      setConnectionNote(
        state.paused
          ? "Wallet connected. Minting is paused on-chain."
          : "Wallet connected. On-chain economics verified.",
      );
      return ready;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Wallet connection failed.";
      setConnected(false);
      setWalletLabel("Connect");
      setMintReady(false);
      setConnectionNote(message);
      return false;
    }
  }
  async function startMint() {
    if (!launchConfig.config) {
      goTo("desk");
      setConnectionNote(
        "Mint preview only: the public on-chain configuration has not been published.",
      );
      return;
    }
    const ready = connected ? mintReady : await connectWallet();
    if (!ready) return;
    setMintError("");
    setMintPhase("review");
  }
  async function confirmMint() {
    if (!window.solana || submitting.current || mintPhase !== "review") return;
    submitting.current = true;
    setIsSubmitting(true);
    setMintError("");
    setMintPhase("signing");
    const completed: Receipt[] = [];
    try {
      const { mintDesk } = await import("./solana-client");
      for (let index = 0; index < quantity; index += 1) {
        const result = await mintDesk(window.solana, () =>
          setMintPhase("submitted"),
        );
        completed.push(result);
        setMinted(result.serial);
        setMintPhase(index + 1 === quantity ? "confirmed" : "signing");
      }
      setReceipts((current) => [...completed, ...current]);
      setView("desk");
    } catch (error) {
      if (completed.length)
        setReceipts((current) => [...completed, ...current]);
      const message = error instanceof Error ? error.message : "Mint failed.";
      setMintError(message);
      setMintPhase(/reject|cancel/i.test(message) ? "cancelled" : "failed");
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  function renderExplore() {
    const mintConfigured = Boolean(launchConfig.config);
    return (
      <>
        <section className="hero shell">
          <div className="heroCopy">
            <Status tone={mintConfigured ? "available" : "preview"}>
              {mintConfigured ? "MINT CONFIG VERIFIED" : "PRODUCT PREVIEW"}
            </Status>
            <h1>
              Your desk on
              <br />
              the <em>IPO floor.</em>
            </h1>
            <p>
              Follow sourced theses, join IPO Rooms, and track exactly how desk
              capital and future rewards move from receipt to asset to claim.
            </p>
            <div className="economicsStrip">
              <div>
                <span>SUPPLY</span>
                <strong>{launchConfig.supply.toLocaleString()}</strong>
              </div>
              <div>
                <span>PRICE</span>
                <strong>{launchConfig.mintPriceSol.toFixed(2)} SOL</strong>
              </div>
              <div>
                <span>$IPO TO MINT</span>
                <strong>NONE</strong>
              </div>
            </div>
            <div className="heroActions">
              <button className="primaryAction" onClick={startMint}>
                {mintConfigured ? "Mint a desk" : "Preview a desk"}{" "}
                <ArrowRight size={17} />
              </button>
              <button
                className="secondaryAction"
                onClick={() => openRooms("watch")}
              >
                Explore IPO Watch
              </button>
            </div>
          </div>
          <div className="heroDesk" aria-label="IPO architectural desk preview">
            <img
              src="/collection/images/IPO-0420-L3.svg"
              alt="IPO architectural research desk 0420"
            />
            <div>
              <span>IPO DESK #0420</span>
              <Status>ART PREVIEW</Status>
            </div>
          </div>
        </section>
        <section className="pathBand">
          <div className="shell pathGrid">
            <article className="pathCard instant">
              <div className="pathIcon">
                <Search />
              </div>
              <div>
                <Status tone="available">OPEN RESEARCH</Status>
                <h2>IPO Watch</h2>
                <p>
                  Sourced theses, dated catalysts, invalidation criteria,
                  disclosures, and optional community launches. Reading never
                  requires a mint or trade.
                </p>
                <button onClick={() => openRooms("watch")}>
                  Enter the rooms <ArrowRight size={16} />
                </button>
              </div>
            </article>
            <article className="pathCard curated">
              <div className="pathIcon">
                <Rocket />
              </div>
              <div>
                <Status>CREATOR TOOLS</Status>
                <h2>Launch from a thesis</h2>
                <p>
                  Turn a useful room into an optional project-token launch with
                  visible reward settings, fee recipients, and recoverable
                  setup.
                </p>
                <button onClick={() => openRooms("launch")}>
                  Open launch builder <ArrowRight size={16} />
                </button>
              </div>
            </article>
          </div>
        </section>
        <section className="contentSection shell">
          <SectionHeading
            eyebrow="MINT ALLOCATION — PROPOSED V1"
            title="A desk starts with its own ledger."
            body="Each mint’s initial asset allocation stays attributable to that desk. It is not protocol revenue or guaranteed value."
          />
          <div className="capitalSplit">
            <article>
              <span>80% / MINT-FUNDED ASSETS</span>
              <strong>0.096 SOL</strong>
              <p>
                Held for eligible, explicitly verified tokenized pre-IPO
                exposure. Failed or unavailable purchases remain visible as
                unspent capital.
              </p>
            </article>
            <article>
              <span>20% / OPERATIONS</span>
              <strong>0.024 SOL</strong>
              <p>
                Development, infrastructure, and operations. Network and
                account-creation costs are disclosed separately.
              </p>
            </article>
          </div>
        </section>
        <section className="contentSection shell">
          <SectionHeading
            eyebrow="WHY IPO"
            title="Research first. Receipts all the way down."
            body="Discover a sourced thesis, follow the room, optionally join its project-token launch, then verify every actual distribution."
          />
          <div className="benefitGrid">
            <article>
              <Blocks />
              <h3>Sourced rooms</h3>
              <p>
                Thesis, dated sources, catalyst status, invalidation criteria,
                authorship, and conflicts.
              </p>
            </article>
            <article>
              <CircleDollarSign />
              <h3>Separated balances</h3>
              <p>
                Initial capital, revenue pending investment, holder assets owed,
                and operations never blur together.
              </p>
            </article>
            <article>
              <ShieldCheck />
              <h3>Verified assets</h3>
              <p>
                Exact mint, provider, rights, controls, constraints, quote
                route, liquidity, and verification time.
              </p>
            </article>
            <article>
              <BadgeCheck />
              <h3>Transfer cutoffs</h3>
              <p>
                Epoch accounting preserves earned owner balances while future
                participation follows the desk.
              </p>
            </article>
          </div>
        </section>
        <section className="contentSection shell opportunitySection">
          <div className="opportunityHeader">
            <SectionHeading
              eyebrow="IPO WATCH"
              title="Theses when the sources are ready."
              body="Rooms can exist without tokens. Unavailable research is not filled with invented listings or fake catalysts."
            />
            <div className="filterTabs">
              <button className="active">All</button>
              <button>Following</button>
              <button>Bookmarked</button>
            </div>
          </div>
          <div className="opportunityBoard">
            <div className="boardHead roomHead">
              <span>THESIS</span>
              <span>CATALYST</span>
              <span>UPDATED</span>
              <span>LAUNCH</span>
              <span>SOURCES</span>
            </div>
            <EmptyState
              eyebrow="NO PUBLISHED ROOMS"
              title="The research feed is ready for sourced work."
            >
              No company, tokenized exposure, price, inventory, affiliation, or
              launch is being invented. Create a browser-only room draft to test
              the workflow.
            </EmptyState>
          </div>
        </section>
        <section className="contentSection shell transparentSection">
          <SectionHeading
            eyebrow="RECURRING FUNDING — PLANNED"
            title="100% of project-received $IPO creator fees."
            body="The proposal applies only to creator-fee receipts actually received by IPO, not volume, all trading fees, or third-party creator income. Operations fund execution costs separately."
          />
          <div className="moneyFlow">
            <div>
              <span>CREATOR FEES RECEIVED</span>
              <strong>Unavailable</strong>
            </div>
            <ArrowRight />
            <div>
              <span>REVENUE AWAITING INVESTMENT</span>
              <strong>Unavailable</strong>
            </div>
            <ArrowRight />
            <div>
              <span>REWARD ASSETS OWED</span>
              <strong>Unavailable</strong>
            </div>
            <ArrowRight />
            <div>
              <span>CLAIMED</span>
              <strong>Unavailable</strong>
            </div>
          </div>
        </section>
      </>
    );
  }

  function renderRooms() {
    return (
      <section className="appPage shell">
        <div className="pageHeader">
          <div>
            <p className="eyebrow">IPO ROOMS / IPO WATCH</p>
            <h1>Research can lead. Trading is optional.</h1>
            <p>
              Build a sourced thesis, follow its updates, and attach a
              project-token launch only when the creator chooses to.
              Company-themed tokens are not company shares.
            </p>
          </div>
          <Status>LOCAL WORKFLOW</Status>
        </div>
        <div className="roomModeTabs">
          <button className="active">Research feed</button>
          <button onClick={() => setRoomsMode("launch")}>Launch builder</button>
          <button onClick={() => setRoomsMode("application")}>
            Curated support
          </button>
        </div>
        <div className="roomLayout">
          <div className="roomFeed">
            <div className="roomTools">
              <div>
                <button className="active">Latest</button>
                <button>Following</button>
                <button>Bookmarks</button>
              </div>
              <button
                className="secondaryAction"
                onClick={() =>
                  document
                    .getElementById("room-draft")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Draft a room <Plus size={16} />
              </button>
            </div>
            <EmptyState
              eyebrow="NO PUBLISHED RESEARCH"
              title="No room is being fabricated for launch theater."
            >
              Published rooms will include sourced claims, catalyst confidence,
              invalidation criteria, timestamps, edit history, authorship, and
              financial-interest disclosure.
            </EmptyState>
            <div className="roomRules">
              <article>
                <Search />
                <h3>Source the thesis</h3>
                <p>
                  Use dated, attributable sources. Preserve updates instead of
                  silently rewriting old calls.
                </p>
              </article>
              <article>
                <BadgeCheck />
                <h3>Label the catalyst</h3>
                <p>
                  Confirmed, reported, and speculative events must look
                  different at a glance.
                </p>
              </article>
              <article>
                <ShieldCheck />
                <h3>Disclose the interest</h3>
                <p>
                  Sponsorship, holdings, creator roles, and conflicts sit beside
                  the research.
                </p>
              </article>
            </div>
          </div>
          <form
            id="room-draft"
            className="roomDraft"
            onSubmit={(event) => {
              event.preventDefault();
              saveRoomDraft();
            }}
          >
            <SectionHeading
              eyebrow="BROWSER-ONLY DRAFT"
              title="Create a sourced room."
            />
            <label>
              Room title
              <input
                required
                value={roomDraft.title}
                onChange={(event) =>
                  setRoomDraft({ ...roomDraft, title: event.target.value })
                }
                placeholder="A precise research theme"
              />
            </label>
            <label>
              Thesis
              <textarea
                required
                value={roomDraft.thesis}
                onChange={(event) =>
                  setRoomDraft({ ...roomDraft, thesis: event.target.value })
                }
                placeholder="What do you believe, and why?"
              />
            </label>
            <label>
              Primary source
              <input
                required
                type="url"
                value={roomDraft.source}
                onChange={(event) =>
                  setRoomDraft({ ...roomDraft, source: event.target.value })
                }
                placeholder="https://"
              />
            </label>
            <div className="formGrid roomFields">
              <label>
                Catalyst
                <input
                  value={roomDraft.catalyst}
                  onChange={(event) =>
                    setRoomDraft({ ...roomDraft, catalyst: event.target.value })
                  }
                />
              </label>
              <label>
                Catalyst status
                <select
                  value={roomDraft.catalystStatus}
                  onChange={(event) =>
                    setRoomDraft({
                      ...roomDraft,
                      catalystStatus: event.target
                        .value as RoomDraft["catalystStatus"],
                    })
                  }
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="reported">Reported</option>
                  <option value="speculative">Speculative</option>
                </select>
              </label>
            </div>
            <label>
              Invalidation criteria
              <textarea
                value={roomDraft.invalidation}
                onChange={(event) =>
                  setRoomDraft({
                    ...roomDraft,
                    invalidation: event.target.value,
                  })
                }
                placeholder="What evidence would make this thesis wrong?"
              />
            </label>
            <label>
              Author identity
              <input
                value={roomDraft.author}
                onChange={(event) =>
                  setRoomDraft({ ...roomDraft, author: event.target.value })
                }
              />
            </label>
            <label>
              Sponsorship / financial interest
              <textarea
                value={roomDraft.disclosure}
                onChange={(event) =>
                  setRoomDraft({ ...roomDraft, disclosure: event.target.value })
                }
              />
            </label>
            <button className="primaryAction full" type="submit">
              Save research draft <FileCheck2 size={16} />
            </button>
            <p className="formNote">
              This saves locally. Authentication, version history, publishing,
              following, bookmarks, alerts, discussion, and moderation require a
              backend.
            </p>
          </form>
        </div>
      </section>
    );
  }

  function renderLaunch() {
    const asset =
      rewardAssets.find((item) => item.id === launchDraft.rewardAsset) ??
      rewardAssets[0];
    const basicsComplete = Boolean(
      launchDraft.name && launchDraft.ticker && launchDraft.description,
    );
    return (
      <section className="appPage shell">
        <button className="backToRooms" onClick={() => setRoomsMode("watch")}>
          <ChevronLeft size={16} /> Back to IPO Rooms
        </button>
        <div className="pageHeader">
          <div>
            <p className="eyebrow">ROOM LAUNCH BUILDER</p>
            <h1>Build the launch before you sign it.</h1>
            <p>
              Attach an optional project-token launch to a useful room.
              Production creation remains gated until metadata, recipient
              wallets, and Pump execution are configured.
            </p>
          </div>
          <Status tone={launchConfig.pumpExecutionEnabled ? "live" : "blocked"}>
            {launchConfig.pumpExecutionEnabled
              ? "EXECUTION ENABLED"
              : "EXECUTION BLOCKED"}
          </Status>
        </div>
        <div className="wizardSteps">
          {launchSteps.map((step, index) => (
            <button
              key={step}
              className={
                index === launchStep
                  ? "active"
                  : index < launchStep
                    ? "done"
                    : ""
              }
              onClick={() => setLaunchStep(index)}
            >
              <span>
                {index < launchStep ? <Check size={14} /> : index + 1}
              </span>
              {step}
            </button>
          ))}
        </div>
        <div className="builderLayout">
          <div className="builderMain">
            {launchStep === 0 && (
              <div className="formSection">
                <SectionHeading
                  eyebrow="STEP 1"
                  title="Project basics"
                  body="Final metadata must be hosted before execution."
                />
                <div className="formGrid">
                  <label>
                    Project name
                    <input
                      maxLength={32}
                      value={launchDraft.name}
                      onChange={(e) =>
                        setLaunchDraft({ ...launchDraft, name: e.target.value })
                      }
                      placeholder="Example Project"
                    />
                  </label>
                  <label>
                    Ticker
                    <input
                      maxLength={13}
                      value={launchDraft.ticker}
                      onChange={(e) =>
                        setLaunchDraft({
                          ...launchDraft,
                          ticker: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="EXAMPLE"
                    />
                  </label>
                  <label className="wide">
                    Description
                    <textarea
                      value={launchDraft.description}
                      onChange={(e) =>
                        setLaunchDraft({
                          ...launchDraft,
                          description: e.target.value,
                        })
                      }
                      placeholder="What are you building?"
                    />
                  </label>
                  <label>
                    Artwork URL
                    <input
                      value={launchDraft.artwork}
                      onChange={(e) =>
                        setLaunchDraft({
                          ...launchDraft,
                          artwork: e.target.value,
                        })
                      }
                      placeholder="https://"
                    />
                  </label>
                  <label>
                    Website
                    <input
                      value={launchDraft.website}
                      onChange={(e) =>
                        setLaunchDraft({
                          ...launchDraft,
                          website: e.target.value,
                        })
                      }
                      placeholder="https://"
                    />
                  </label>
                  <label className="wide">
                    Social profile
                    <input
                      value={launchDraft.social}
                      onChange={(e) =>
                        setLaunchDraft({
                          ...launchDraft,
                          social: e.target.value,
                        })
                      }
                      placeholder="https://"
                    />
                  </label>
                </div>
              </div>
            )}
            {launchStep === 1 && (
              <div className="formSection">
                <SectionHeading
                  eyebrow="STEP 2"
                  title="Reward settings"
                  body="A symbol match is not verification. Purchases stay unavailable until identity, controls, liquidity, and execution pass review."
                />
                <div className="assetList">
                  {rewardAssets.map((item) => (
                    <button
                      key={item.id}
                      className={
                        launchDraft.rewardAsset === item.id ? "selected" : ""
                      }
                      onClick={() =>
                        setLaunchDraft({ ...launchDraft, rewardAsset: item.id })
                      }
                    >
                      <div>
                        <strong>{item.name}</strong>
                        <span>
                          {item.symbol} / {item.category}
                        </span>
                      </div>
                      <Status
                        tone={item.purchaseEligible ? "available" : "blocked"}
                      >
                        {item.purchaseEligible ? "ELIGIBLE" : "NOT EXECUTABLE"}
                      </Status>
                      <small>{item.note}</small>
                    </button>
                  ))}
                </div>
                <button
                  className="requestAsset"
                  onClick={() =>
                    setNotice(
                      "Custom asset intake requires a review service before requests can be submitted.",
                    )
                  }
                >
                  Request another asset <Plus size={16} />
                </button>
              </div>
            )}
            {launchStep === 2 && (
              <div className="formSection">
                <SectionHeading
                  eyebrow="STEP 3"
                  title="Route creator-fee receipts"
                  body="This template is a draft until recipient accounts and the final on-chain fee-sharing configuration are verified."
                />
                <div className="feeGrid">
                  {(
                    [
                      "coinHolders",
                      "deskHolders",
                      "creator",
                      "operations",
                    ] as const
                  ).map((key) => (
                    <label key={key}>
                      <span>
                        {key === "coinHolders"
                          ? "Coin-holder rewards"
                          : key === "deskHolders"
                            ? "Desk-holder rewards"
                            : key[0].toUpperCase() + key.slice(1)}
                      </span>
                      <div>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={launchDraft[key] / 100}
                          onChange={(e) =>
                            setLaunchDraft({
                              ...launchDraft,
                              [key]: Math.round(Number(e.target.value) * 100),
                            })
                          }
                        />
                        <b>%</b>
                      </div>
                    </label>
                  ))}
                </div>
                <div
                  className={`feeTotal ${feeValidation.valid ? "valid" : "invalid"}`}
                >
                  <span>TOTAL ALLOCATED</span>
                  <strong>{formatBps(feeValidation.total)}</strong>
                  <small>
                    {feeValidation.valid
                      ? "Ready for review"
                      : `${formatBps(Math.abs(feeValidation.remaining))} ${feeValidation.remaining > 0 ? "unassigned" : "overallocated"}`}
                  </small>
                </div>
                <p className="formNote">
                  Fee sharing routes creator-fee receipts. Reward purchases,
                  accounting, and claims require IPO’s separate reward engine.
                </p>
              </div>
            )}
            {launchStep === 3 && (
              <div className="formSection">
                <SectionHeading
                  eyebrow="STEP 4"
                  title="Optional initial purchase"
                  body="A quote, slippage limit, price impact, and costs must be shown before signing."
                />
                <label className="standaloneLabel">
                  Initial purchase amount
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={launchDraft.initialPurchaseSol}
                    onChange={(e) =>
                      setLaunchDraft({
                        ...launchDraft,
                        initialPurchaseSol: e.target.value,
                      })
                    }
                    placeholder="0.00"
                  />
                  <span>SOL</span>
                </label>
                <div className="quoteUnavailable">
                  <span>QUOTE</span>
                  <strong>Unavailable</strong>
                  <p>
                    No production Pump quote adapter or signer is connected. No
                    transaction will be prepared.
                  </p>
                </div>
              </div>
            )}
            {launchStep === 4 && (
              <div className="formSection">
                <SectionHeading
                  eyebrow="STEP 5"
                  title="Review the full packet"
                />
                <div className="reviewRows">
                  <div>
                    <span>TOKEN</span>
                    <strong>
                      {launchDraft.name || "Missing name"} /{" "}
                      {launchDraft.ticker || "Missing ticker"}
                    </strong>
                  </div>
                  <div>
                    <span>REWARD ASSET</span>
                    <strong>{asset.name}</strong>
                    <small>
                      {asset.purchaseEligible
                        ? "Purchase eligible"
                        : "Execution not approved"}
                    </small>
                  </div>
                  <div>
                    <span>FEE ROUTING</span>
                    <strong>
                      {feeValidation.valid ? "100% allocated" : "Invalid total"}
                    </strong>
                    <small>
                      {formatBps(launchDraft.coinHolders)} coin /{" "}
                      {formatBps(launchDraft.deskHolders)} desks /{" "}
                      {formatBps(launchDraft.creator)} creator /{" "}
                      {formatBps(launchDraft.operations)} operations
                    </small>
                  </div>
                  <div>
                    <span>INITIAL BUY</span>
                    <strong>
                      {launchDraft.initialPurchaseSol
                        ? `${launchDraft.initialPurchaseSol} SOL`
                        : "None"}
                    </strong>
                    <small>No quote available</small>
                  </div>
                  <div>
                    <span>AUTHORITIES</span>
                    <strong>Not fetched</strong>
                    <small>Must be reviewed after creation</small>
                  </div>
                </div>
              </div>
            )}
            {launchStep === 5 && (
              <div className="formSection">
                <SectionHeading
                  eyebrow="STEP 6"
                  title="Execution readiness"
                  body="A complete draft is not a launched token."
                />
                <div className="readinessList">
                  <div className={basicsComplete ? "ready" : ""}>
                    <span>{basicsComplete ? <Check /> : <X />}</span>
                    <div>
                      <strong>Project metadata</strong>
                      <small>
                        {basicsComplete
                          ? "Draft fields complete"
                          : "Name, ticker, and description required"}
                      </small>
                    </div>
                  </div>
                  <div className={feeValidation.valid ? "ready" : ""}>
                    <span>{feeValidation.valid ? <Check /> : <X />}</span>
                    <div>
                      <strong>Fee-share conservation</strong>
                      <small>
                        {feeValidation.valid
                          ? "Exactly 10,000 basis points"
                          : "Shares must total 100%"}
                      </small>
                    </div>
                  </div>
                  <div>
                    <span>
                      <X />
                    </span>
                    <div>
                      <strong>Reward execution eligibility</strong>
                      <small>{asset.note}</small>
                    </div>
                  </div>
                  <div>
                    <span>
                      <X />
                    </span>
                    <div>
                      <strong>Production chain services</strong>
                      <small>
                        Metadata, recipients, transaction QA, reconciliation,
                        vault, and claims are not configured
                      </small>
                    </div>
                  </div>
                </div>
                <button
                  className="primaryAction full"
                  disabled={!basicsComplete || !feeValidation.valid}
                  onClick={() => saveLaunchDraft(true)}
                >
                  Save launch packet <FileCheck2 size={17} />
                </button>
                <button className="blockedAction full" disabled>
                  Execute on Solana — unavailable
                </button>
              </div>
            )}
            <div className="builderControls">
              <button
                className="secondaryAction"
                disabled={launchStep === 0}
                onClick={() => setLaunchStep((step) => Math.max(0, step - 1))}
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button
                className="saveText"
                onClick={() => saveLaunchDraft(false)}
              >
                Save draft
              </button>
              {launchStep < 5 && (
                <button
                  className="primaryAction"
                  onClick={() => setLaunchStep((step) => Math.min(5, step + 1))}
                >
                  Continue <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
          <aside className="builderAside">
            <div>
              <span>DRAFT STATE</span>
              <strong>
                {launchDraft.state.replace("_", " ").toUpperCase()}
              </strong>
              <small>
                {launchDraft.updatedAt
                  ? `Saved ${new Date(launchDraft.updatedAt).toLocaleString()}`
                  : "Not saved yet"}
              </small>
            </div>
            <div>
              <span>LAUNCH RAIL</span>
              <strong>Pump create_v2</strong>
              <small>Successful bonding curves graduate to PumpSwap.</small>
            </div>
            <div>
              <span>FEE TEMPLATE</span>
              <strong>
                {feeValidation.valid ? "Conserves 100%" : "Needs attention"}
              </strong>
              <small>Final recipients are not configured.</small>
            </div>
            <div>
              <span>FAILURE RECOVERY</span>
              <strong>Draft retained</strong>
              <small>Interrupted setup resumes from verified state.</small>
            </div>
          </aside>
        </div>
      </section>
    );
  }

  function renderOfferings() {
    return (
      <section className="appPage shell">
        <button className="backToRooms" onClick={() => setRoomsMode("watch")}>
          <ChevronLeft size={16} /> Back to IPO Rooms
        </button>
        <div className="pageHeader">
          <div>
            <p className="eyebrow">CURATED LAUNCH SUPPORT</p>
            <h1>Structured terms before deposits.</h1>
            <p>
              Teams can prepare an application now. Review, escrow, settlement,
              and refunds must be operational before a contribution is accepted.
            </p>
          </div>
          <Status>APPLICATION PREVIEW</Status>
        </div>
        <div className="offeringIntro">
          <div>
            <FileCheck2 />
            <h2>Apply</h2>
            <p>
              Document team, product, raise, distribution, vesting, use of
              funds, and launch plan.
            </p>
          </div>
          <ArrowRight />
          <div>
            <ShieldCheck />
            <h2>Review</h2>
            <p>
              Publish checks, unresolved issues, conflicts, and exact offering
              terms.
            </p>
          </div>
          <ArrowRight />
          <div>
            <CircleDollarSign />
            <h2>Settle</h2>
            <p>
              Use segregated escrow with verifiable cancellation, refund, and
              release rules.
            </p>
          </div>
        </div>
        <div className="applicationLayout">
          <form
            className="applicationForm"
            onSubmit={(e) => {
              e.preventDefault();
              saveOfferingDraft();
            }}
          >
            <SectionHeading
              eyebrow="APPLICATION DRAFT"
              title="Tell us what you are building."
            />
            <div className="formGrid">
              <label>
                Project name
                <input
                  required
                  value={offeringDraft.project}
                  onChange={(e) =>
                    setOfferingDraft({
                      ...offeringDraft,
                      project: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Team contact
                <input
                  required
                  type="email"
                  value={offeringDraft.contact}
                  onChange={(e) =>
                    setOfferingDraft({
                      ...offeringDraft,
                      contact: e.target.value,
                    })
                  }
                />
              </label>
              <label className="wide">
                Product or concept
                <textarea
                  required
                  value={offeringDraft.product}
                  onChange={(e) =>
                    setOfferingDraft({
                      ...offeringDraft,
                      product: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Requested raise
                <input
                  value={offeringDraft.raise}
                  onChange={(e) =>
                    setOfferingDraft({
                      ...offeringDraft,
                      raise: e.target.value,
                    })
                  }
                  placeholder="Amount and asset"
                />
              </label>
              <label>
                Total token supply
                <input
                  value={offeringDraft.supply}
                  onChange={(e) =>
                    setOfferingDraft({
                      ...offeringDraft,
                      supply: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Team allocation
                <input
                  value={offeringDraft.teamAllocation}
                  onChange={(e) =>
                    setOfferingDraft({
                      ...offeringDraft,
                      teamAllocation: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Vesting
                <input
                  value={offeringDraft.vesting}
                  onChange={(e) =>
                    setOfferingDraft({
                      ...offeringDraft,
                      vesting: e.target.value,
                    })
                  }
                />
              </label>
              <label className="wide">
                Intended use of funds
                <textarea
                  value={offeringDraft.useOfFunds}
                  onChange={(e) =>
                    setOfferingDraft({
                      ...offeringDraft,
                      useOfFunds: e.target.value,
                    })
                  }
                />
              </label>
              <label className="wide">
                Launch plan
                <textarea
                  value={offeringDraft.launchPlan}
                  onChange={(e) =>
                    setOfferingDraft({
                      ...offeringDraft,
                      launchPlan: e.target.value,
                    })
                  }
                />
              </label>
              <label className="wide">
                Supporting materials
                <input
                  value={offeringDraft.materials}
                  onChange={(e) =>
                    setOfferingDraft({
                      ...offeringDraft,
                      materials: e.target.value,
                    })
                  }
                  placeholder="Deck, docs, or repository"
                />
              </label>
            </div>
            <button className="primaryAction" type="submit">
              Save application draft <FileCheck2 size={16} />
            </button>
            <p className="formNote">
              Browser-only draft. This does not submit an application, reserve a
              launch, or transfer funds.
            </p>
          </form>
          <aside className="offeringTerms">
            <Status tone="blocked">DEPOSITS DISABLED</Status>
            <h2>Required before opening</h2>
            {[
              "Exact token identity",
              "Soft and hard cap",
              "Holder and public tranches",
              "Oversubscription rules",
              "Vesting and liquidity terms",
              "Segregated escrow",
              "Cancellation and refunds",
              "Settlement authorization",
            ].map((item) => (
              <div key={item}>
                <Check size={15} />
                <span>{item}</span>
              </div>
            ))}
            <p>
              A public Pump bonding curve is not a fixed-price presale escrow.
              IPO will not accept deposits until a compatible design is
              implemented and reviewed.
            </p>
          </aside>
        </div>
      </section>
    );
  }

  function renderDesk() {
    const mintConfigured = Boolean(launchConfig.config);
    return (
      <section className="appPage shell">
        <div className="pageHeader">
          <div>
            <p className="eyebrow">MY DESK</p>
            <h1>Owned, pending, claimable.</h1>
            <p>
              One desk has one base participation unit. A transfer moves future
              epoch participation; previously earned owner entitlements stay
              with that owner.
            </p>
          </div>
          {connected ? (
            <Status tone="live">{walletLabel}</Status>
          ) : (
            <button className="primaryAction compact" onClick={connectWallet}>
              <WalletCards size={16} /> Connect wallet
            </button>
          )}
        </div>
        <div className="deskOverview">
          <div className="mintPreview">
            <img
              src="/collection/images/IPO-0001-L1.svg"
              alt="IPO desk membership preview"
            />
            <div>
              <Status tone={mintConfigured ? "available" : "preview"}>
                {mintConfigured ? "MINT AVAILABLE" : "PREVIEW"}
              </Status>
              <h2>IPO Desk</h2>
              <dl>
                <div>
                  <dt>SUPPLY</dt>
                  <dd>{launchConfig.supply.toLocaleString()}</dd>
                </div>
                <div>
                  <dt>PRICE</dt>
                  <dd>{launchConfig.mintPriceSol.toFixed(2)} SOL</dd>
                </div>
                <div>
                  <dt>IPO TO MINT</dt>
                  <dd>NONE</dd>
                </div>
              </dl>
              <button
                className={mintConfigured ? "primaryAction" : "blockedAction"}
                onClick={startMint}
              >
                {mintConfigured ? "Mint a desk" : "Mint unavailable"}
              </button>
              <small>{connectionNote} Network/account costs may apply.</small>
            </div>
          </div>
          <div className="deskMetrics">
            <article>
              <span>CURRENT OWNERSHIP</span>
              <strong>
                {receipts.length || (connected ? "Unavailable" : "—")}
              </strong>
              <small>
                {receipts.length
                  ? "Confirmed this session"
                  : "Ownership indexer not connected"}
              </small>
            </article>
            <article>
              <span>INITIAL CAPITAL</span>
              <strong>Unavailable</strong>
              <small>Per-desk ledger not deployed</small>
            </article>
            <article>
              <span>REVENUE REWARDS</span>
              <strong>Unavailable</strong>
              <small>No verified fee receipts</small>
            </article>
            <article>
              <span>CLAIMABLE</span>
              <strong>Unavailable</strong>
              <small>No reward claim program</small>
            </article>
          </div>
        </div>
        {receipts.length > 0 && (
          <div className="ownedGrid">
            {receipts.map((receipt) => (
              <article key={receipt.asset}>
                <img
                  src={`/collection/images/IPO-${String(receipt.serial).padStart(4, "0")}-L1.svg`}
                  alt={`IPO Desk ${receipt.serial}`}
                />
                <div>
                  <Status tone="live">CONFIRMED</Status>
                  <h3>IPO #{String(receipt.serial).padStart(4, "0")}</h3>
                  <p>Metaplex Core asset confirmed during this session.</p>
                  <a
                    href={`https://solscan.io/tx/${receipt.signature}?cluster=${launchConfig.cluster}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View receipt <ExternalLink size={14} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
        <div className="balanceLedger">
          <article>
            <span>INITIAL CAPITAL WAITING</span>
            <strong>Unavailable</strong>
            <small>Mint-funded assets only</small>
          </article>
          <article>
            <span>PURCHASED ASSETS</span>
            <strong>Unavailable</strong>
            <small>No verified purchases</small>
          </article>
          <article>
            <span>REVENUE-FUNDED REWARDS</span>
            <strong>Unavailable</strong>
            <small>Separate from capital</small>
          </article>
          <article>
            <span>CLAIMED BALANCE</span>
            <strong>Unavailable</strong>
            <small>No claim indexer</small>
          </article>
        </div>
        <div className="deskDataGrid">
          <div>
            <h2>Initial assets and claims</h2>
            <EmptyState
              eyebrow="ACCOUNTING PROGRAM REQUIRED"
              title="No balances can be loaded."
            >
              The revised mint source splits 80/20 into separate treasuries and
              records both amounts per desk. Deployment, asset purchases, epoch
              accounting, and claims are still required.
            </EmptyState>
          </div>
          <div>
            <h2>Membership tools</h2>
            <div className="toolRows">
              <div>
                <Check />
                <span>
                  <strong>Equal base participation</strong>
                  <small>One unit per eligible desk</small>
                </span>
              </div>
              <div>
                <Check />
                <span>
                  <strong>Epoch transfer cutoff</strong>
                  <small>New owner enters the next finalized epoch</small>
                </span>
              </div>
              <div>
                <Sparkles />
                <span>
                  <strong>Optional upgrades</strong>
                  <small>
                    Alerts, research, analytics, exports, and art only; payments
                    disabled
                  </small>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderActivity() {
    return (
      <section className="appPage shell">
        <div className="pageHeader">
          <div>
            <p className="eyebrow">ACTIVITY</p>
            <h1>Capital and revenue never share a label.</h1>
            <p>
              Browser drafts are separated from initial asset capital,
              creator-fee receipts, reward purchases, allocations, claims, and
              operations.
            </p>
          </div>
          <Status tone="blocked">INDEXER NOT CONNECTED</Status>
        </div>
        <div className="activitySummary">
          <article>
            <span>INITIAL ASSET CAPITAL</span>
            <strong>Unavailable</strong>
            <small>No per-desk ledger</small>
          </article>
          <article>
            <span>REVENUE AWAITING INVESTMENT</span>
            <strong>Unavailable</strong>
            <small>No fee indexer or vault</small>
          </article>
          <article>
            <span>ASSETS / REWARDS OWED</span>
            <strong>Unavailable</strong>
            <small>No allocation program</small>
          </article>
          <article>
            <span>OPERATIONS</span>
            <strong>Unavailable</strong>
            <small>No published budget feed</small>
          </article>
        </div>
        <div className="activityTable">
          <div className="tableHead">
            <span>TIME</span>
            <span>EVENT</span>
            <span>STATE</span>
            <span>RECEIPT</span>
          </div>
          {receipts.map((receipt) => (
            <div className="tableRow" key={receipt.signature}>
              <span>THIS SESSION</span>
              <span>DESK MINT</span>
              <Status tone="live">CONFIRMED</Status>
              <a
                href={`https://solscan.io/tx/${receipt.signature}?cluster=${launchConfig.cluster}`}
                target="_blank"
                rel="noreferrer"
              >
                {receipt.signature.slice(0, 8)}… <ExternalLink size={13} />
              </a>
            </div>
          ))}
          {localEvents.map((event) => (
            <div className="tableRow local" key={event.id}>
              <span>{new Date(event.time).toLocaleString()}</span>
              <span>{event.event}</span>
              <Status>{event.state}</Status>
              <span>NO CHAIN RECEIPT</span>
            </div>
          ))}
          {!receipts.length && !localEvents.length && (
            <div className="tableEmpty">
              No verified protocol activity or saved browser events.
            </div>
          )}
        </div>
        <div className="featureMatrix">
          <SectionHeading
            eyebrow="IMPLEMENTATION STATUS"
            title="What the product can do today."
          />
          {productFeatures.map((feature) => (
            <div key={feature.name}>
              <Status tone={feature.status}>
                {feature.status.toUpperCase()}
              </Status>
              <strong>{feature.name}</strong>
              <p>{feature.detail}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const page =
    view === "explore"
      ? renderExplore()
      : view === "desk"
        ? renderDesk()
        : view === "rooms"
          ? roomsMode === "launch"
            ? renderLaunch()
            : roomsMode === "application"
              ? renderOfferings()
              : renderRooms()
          : renderActivity();
  return (
    <main>
      <header className="siteHeader">
        <button
          className="wordmark"
          onClick={() => goTo("explore")}
          aria-label="IPO home"
        >
          <span>IPO</span>
          <small>INITIAL PUMP OFFERING</small>
        </button>
        <nav aria-label="Primary navigation">
          {navItems.map(({ id, label }) => (
            <button
              className={view === id ? "active" : ""}
              key={id}
              onClick={() => goTo(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="headerActions">
          <a href="/docs">Docs</a>
          <button className="walletControl" onClick={connectWallet}>
            <WalletCards size={15} /> {walletLabel}
          </button>
          <details className="mobileMenu">
            <summary aria-label="Open menu">
              <Menu size={20} />
            </summary>
            <div>
              <a href="/docs">Docs</a>
              <button onClick={connectWallet}>{walletLabel}</button>
            </div>
          </details>
        </div>
      </header>
      {notice && (
        <div className="noticeBar" role="status">
          <span>{notice}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {page}
      <footer>
        <button className="footerBrand" onClick={() => goTo("explore")}>
          IPO
        </button>
        <p>
          Initial Pump Offering combines desk membership, sourced research, and
          optional project-token tools. It does not imply company equity, issuer
          affiliation, guaranteed allocations, or returns.
        </p>
        <div>
          <button onClick={() => openRooms("watch")}>Rooms</button>
          <button onClick={() => openRooms("launch")}>Launch</button>
          <a href="/docs">Docs</a>
        </div>
      </footer>
      <nav className="mobileNav" aria-label="Mobile navigation">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            className={view === id ? "active" : ""}
            key={id}
            onClick={() => goTo(id)}
          >
            <Icon size={19} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {mintPhase !== "idle" && (
        <div className="modalBackdrop">
          <section
            className="mintDialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mint-title"
          >
            <div className="dialogHead">
              <div>
                <p className="eyebrow">DESK MINT</p>
                <h2 id="mint-title">
                  {mintPhase === "review"
                    ? "Review your mint."
                    : mintPhase === "confirmed"
                      ? "Mint confirmed."
                      : mintPhase === "failed"
                        ? "Mint failed."
                        : mintPhase === "cancelled"
                          ? "Signature cancelled."
                          : "Transaction in progress."}
                </h2>
              </div>
              {!isSubmitting && (
                <button
                  aria-label="Close mint dialog"
                  onClick={() => setMintPhase("idle")}
                >
                  <X />
                </button>
              )}
            </div>
            {mintPhase === "review" ? (
              <>
                <label className="quantityLabel">
                  Quantity{" "}
                  <span>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity === 1}
                    >
                      −
                    </button>
                    <strong>{quantity}</strong>
                    <button
                      onClick={() => setQuantity(Math.min(3, quantity + 1))}
                      disabled={quantity === 3}
                    >
                      +
                    </button>
                  </span>
                </label>
                <dl className="mintSummary">
                  <div>
                    <dt>Desk price</dt>
                    <dd>{launchConfig.mintPriceSol.toFixed(2)} SOL</dd>
                  </div>
                  <div>
                    <dt>Quantity</dt>
                    <dd>{quantity}</dd>
                  </div>
                  <div>
                    <dt>Mint total</dt>
                    <dd>{total.toFixed(2)} SOL</dd>
                  </div>
                  <div>
                    <dt>Mint-funded assets (80%)</dt>
                    <dd>{(total * 0.8).toFixed(3)} SOL</dd>
                  </div>
                  <div>
                    <dt>Operations (20%)</dt>
                    <dd>{(total * 0.2).toFixed(3)} SOL</dd>
                  </div>
                  <div>
                    <dt>Network/account costs</dt>
                    <dd>Estimated by wallet</dd>
                  </div>
                  <div>
                    <dt>Remaining supply</dt>
                    <dd>{remaining === null ? "Unavailable" : remaining}</dd>
                  </div>
                </dl>
                <p className="formNote">
                  The current deployed program must support per-desk 80/20
                  accounting before mint is enabled.
                </p>
                <button
                  className="primaryAction full"
                  onClick={confirmMint}
                  disabled={isSubmitting}
                >
                  Request signature
                </button>
              </>
            ) : mintPhase === "confirmed" ? (
              <>
                <p>
                  The asset and transaction were confirmed on{" "}
                  {launchConfig.cluster}. Open My Desk for the receipt.
                </p>
                <button
                  className="primaryAction full"
                  onClick={() => setMintPhase("idle")}
                >
                  Open My Desk
                </button>
              </>
            ) : mintPhase === "failed" || mintPhase === "cancelled" ? (
              <>
                <p className="errorText">{mintError}</p>
                <button
                  className="secondaryAction full"
                  onClick={() => setMintPhase("review")}
                >
                  Review and retry
                </button>
              </>
            ) : (
              <div className="pendingState">
                <span className="spinner" />
                <strong>
                  {mintPhase === "signing"
                    ? "Check your wallet"
                    : "Waiting for confirmation"}
                </strong>
                <p>
                  Do not submit the same mint again while this transaction is
                  pending.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
