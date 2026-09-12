#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

ASSET_TREASURY_WALLET="${ASSET_TREASURY_WALLET:-7vHThHyHXzEXyNwFYC4y2bVBAa5A4nAY2wUddr99dJ7C}"

SOLANA_RPC_URL=https://api.mainnet-beta.solana.com "$ROOT/scripts/check-funding.sh"
echo
echo "Program:  $(NO_DNA=1 solana-keygen pubkey "$ROOT/keys/program.json")"
echo "Treasury: ${TREASURY_WALLET:-5AjpQUTJSD4PJAx7v6saLv1wLwABk7pJn83q9tgiX875}"
echo "Asset treasury: $ASSET_TREASURY_WALLET"
if [[ "${CONFIRM_MAINNET:-}" != "IPO" ]]; then
  echo "Dry stop. Review the addresses and transactions, then rerun with CONFIRM_MAINNET=IPO."
  exit 1
fi

SOLANA_RPC_URL=https://api.mainnet-beta.solana.com \
CONFIRM_MAINNET=IPO \
"$ROOT/scripts/01-deploy-program.sh"

SOLANA_RPC_URL=https://api.mainnet-beta.solana.com \
CONFIRM_MAINNET=IPO \
EXECUTE=true \
TREASURY_WALLET="${TREASURY_WALLET:-5AjpQUTJSD4PJAx7v6saLv1wLwABk7pJn83q9tgiX875}" \
ASSET_TREASURY_WALLET="$ASSET_TREASURY_WALLET" \
node "$ROOT/scripts/03-initialize-program.mjs"
