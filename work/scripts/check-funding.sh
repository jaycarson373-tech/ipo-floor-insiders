#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOYER_KEYPAIR="$ROOT/keys/deployer-authority.json"
DEPLOYER_ADDRESS="$(NO_DNA=1 solana-keygen pubkey "$DEPLOYER_KEYPAIR")"
RPC_URL="${SOLANA_RPC_URL:-https://api.mainnet-beta.solana.com}"

echo "Cluster RPC: $RPC_URL"
echo "Deployer:    $DEPLOYER_ADDRESS"
echo
NO_DNA=1 solana balance "$DEPLOYER_ADDRESS" --url "$RPC_URL"
