#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOYER_KEYPAIR="$ROOT/keys/deployer-authority.json"
PROGRAM_DIR="$ROOT/program"
RPC_URL="${SOLANA_RPC_URL:-https://api.devnet.solana.com}"

if [[ "$RPC_URL" == *mainnet* && "${CONFIRM_MAINNET:-}" != "IPO" ]]; then
  echo "Mainnet selected. Set CONFIRM_MAINNET=IPO after reviewing the deployment summary."
  exit 1
fi

export ANCHOR_PROVIDER_URL="$RPC_URL"
export ANCHOR_WALLET="$DEPLOYER_KEYPAIR"

echo "Deploying IPO Anchor program"
echo "RPC:      $RPC_URL"
echo "Wallet:   $(solana-keygen pubkey "$DEPLOYER_KEYPAIR")"
echo "Program:  $(solana-keygen pubkey "$PROGRAM_DIR/target/deploy/program-keypair.json")"
echo

cd "$PROGRAM_DIR"
NO_DNA=1 anchor build
NO_DNA=1 anchor deploy --provider.cluster "$RPC_URL" --provider.wallet "$DEPLOYER_KEYPAIR"
