#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOYER_KEYPAIR="$ROOT/keys/deployer-authority.json"
PROGRAM_KEYPAIR="$ROOT/keys/program.json"
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
echo "Wallet:   $(NO_DNA=1 solana-keygen pubkey "$DEPLOYER_KEYPAIR")"
echo "Program:  $(NO_DNA=1 solana-keygen pubkey "$PROGRAM_KEYPAIR")"
echo

cd "$PROGRAM_DIR"
mkdir -p target/deploy
install -m 600 "$PROGRAM_KEYPAIR" target/deploy/program-keypair.json
NO_DNA=1 anchor build
install -m 600 "$PROGRAM_KEYPAIR" target/deploy/program-keypair.json
NO_DNA=1 anchor deploy --provider.cluster "$RPC_URL" --provider.wallet "$DEPLOYER_KEYPAIR"
