#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -z "${IPO_MINT:-}" ]]; then
  echo "IPO_MINT is required. It must be the public mint address of the real IPO token."
  exit 1
fi
if [[ -z "${ASSET_TREASURY_WALLET:-}" ]]; then
  echo "ASSET_TREASURY_WALLET is required and must be separate from operations."
  exit 1
fi

SOLANA_RPC_URL=https://api.mainnet-beta.solana.com "$ROOT/scripts/check-funding.sh"
echo
echo "Program:  9Gqg4yjDH34pgMXRTqxdJFbzvzeBBDkGvaJvb9kKRaPU"
echo "IPO mint: $IPO_MINT"
echo "Treasury: ${TREASURY_WALLET:-5AjpQUTJSD4PJAx7v6saLv1wLwABk7pJn83q9tgiX875}"
echo "Asset treasury: ${ASSET_TREASURY_WALLET:-missing}"
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
IPO_MINT="$IPO_MINT" \
TREASURY_WALLET="${TREASURY_WALLET:-5AjpQUTJSD4PJAx7v6saLv1wLwABk7pJn83q9tgiX875}" \
node "$ROOT/scripts/03-initialize-program.mjs"
