# IPO

IPO, short for Initial Pump Offering, is a curated Solana launch and discovery product with 1,212 Metaplex Core Launch Pass memberships.

## Confirmed product defaults

- Supply: `1,212`
- Mint price: `0.044 SOL` per pass, plus network and account costs
- Mint token requirement: none
- Upgrade currency: `$IPO`, after mint only
- Upgrade levels: five configurable membership levels

The current repository supports an architectural Launch Pass collection and a SOL-only mint program. It does not substantiate issuer-backed pre-IPO securities access. Project submissions, Pump.fun launches, token comparison, 3.3%/10% holder drops, IPO claims, and buyback/burn execution are documented as planned and are not executable.

## Contents

- `work/site` - Next/Vinext product site, generated NFT collection, and Core helpers
- `work/program` - Anchor program for SOL-only minting, configurable upgrades, and treasury handling
- `work/scripts` - launch setup helpers
- `work/PRODUCT_SPEC.md` - confirmed behavior, planned features, and unresolved launch decisions
- `work/LAUNCH_RUNBOOK.md` - deployment checklist and current public addresses

Private keypairs and local environment files are intentionally ignored.

## Site

```bash
cd work/site
npm install
npm run generate:collection
npm run dev:vercel -- --port 3001
```

Open `http://localhost:3001/`.

Production checks:

```bash
cd work/site
npm run lint
npm run typecheck
npm test
npm run build:vercel
```

## Vercel

This repository is configured for Vercel from the repository root.

```bash
npm ci
npm run build:vercel
```

Manual import settings:

```text
Framework Preset: Next.js
Install Command: npm ci
Build Command: npm run build:vercel
Output Directory: work/site/.next
```

## Collection

The deterministic generator creates:

- `1,212` metadata files
- `6,060` SVG images: five upgrade stages for every Launch Pass
- A fixed base rarity and identity for every serial
- Architectural research workspaces with no external image dependencies

```bash
cd work/site
npm run generate:collection
npm test
```

## Program

```bash
cd work/program
npm install
NO_DNA=1 anchor build
cargo test
```

The compiled program artifact is written to `work/program/target/deploy/program.so`. The `target/` directory is ignored, so rebuild before deployment.

## Launch

Read `work/LAUNCH_RUNBOOK.md` before funding or deployment. Do not commit private keypairs or `.env.local`.
