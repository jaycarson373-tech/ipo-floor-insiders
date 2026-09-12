#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RPC_URL="https://api.devnet.solana.com"
PROGRAM_ID="$(NO_DNA=1 solana-keygen pubkey "$ROOT/keys/program.json")"
AUTHORITY="$(NO_DNA=1 solana-keygen pubkey "$ROOT/keys/deployer-authority.json")"
TREASURY="${TREASURY_WALLET:-$(NO_DNA=1 solana-keygen pubkey "$ROOT/keys/treasury.json")}"
ASSET_TREASURY="${ASSET_TREASURY_WALLET:-$AUTHORITY}"
COLLECTION="$(NO_DNA=1 solana-keygen pubkey "$ROOT/keys/core-collection.json")"
CONFIG="$(node -e "const {PublicKey}=require('@solana/web3.js');const[p]=PublicKey.findProgramAddressSync([Buffer.from('config'),new PublicKey('$AUTHORITY').toBuffer()],new PublicKey('$PROGRAM_ID'));process.stdout.write(p.toBase58())")"
BALANCE="$(NO_DNA=1 solana balance "$AUTHORITY" --lamports --url "$RPC_URL" | awk '{print $1}')"

if (( BALANCE < 2500000000 )); then
  echo "Devnet authority needs at least 2.5 devnet SOL before rehearsal."
  echo "Fund: $AUTHORITY"
  echo "Current lamports: $BALANCE"
  exit 1
fi

SOLANA_RPC_URL="$RPC_URL" "$ROOT/scripts/01-deploy-program.sh"
SOLANA_RPC_URL="$RPC_URL" \
EXECUTE=true \
TREASURY_WALLET="$TREASURY" \
ASSET_TREASURY_WALLET="$ASSET_TREASURY" \
node "$ROOT/scripts/03-initialize-program.mjs"
SOLANA_RPC_URL="$RPC_URL" node "$ROOT/scripts/04-smoke-mint.mjs"

NEXT_PUBLIC_SOLANA_CLUSTER=devnet \
NEXT_PUBLIC_SOLANA_RPC_URL="$RPC_URL" \
NEXT_PUBLIC_IPO_PROGRAM_ID="$PROGRAM_ID" \
NEXT_PUBLIC_IPO_CONFIG="$CONFIG" \
NEXT_PUBLIC_TREASURY_WALLET="$TREASURY" \
NEXT_PUBLIC_ASSET_TREASURY_WALLET="$ASSET_TREASURY" \
NEXT_PUBLIC_CORE_COLLECTION="$COLLECTION" \
NEXT_PUBLIC_METADATA_BASE_URL=https://ipo-floor-insiders.vercel.app/api/metadata \
NEXT_PUBLIC_PUBLIC_MINT_ENABLED=true \
node "$ROOT/site/scripts/launch-preflight.mjs" --allow-devnet
