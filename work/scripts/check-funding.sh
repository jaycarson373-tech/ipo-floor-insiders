#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOYER_KEYPAIR="$ROOT/keys/deployer-authority.json"
DEPLOYER_ADDRESS="$(NO_DNA=1 solana-keygen pubkey "$DEPLOYER_KEYPAIR")"
RPC_URL="${SOLANA_RPC_URL:-https://api.mainnet-beta.solana.com}"
PROGRAM_BINARY="$ROOT/program/target/deploy/program.so"

echo "Cluster RPC: $RPC_URL"
echo "Deployer:    $DEPLOYER_ADDRESS"
echo
NO_DNA=1 solana balance "$DEPLOYER_ADDRESS" --url "$RPC_URL"

if [[ -f "$PROGRAM_BINARY" ]]; then
  PROGRAM_BYTES="$(stat -f%z "$PROGRAM_BINARY")"
  PROGRAM_DATA_BYTES="$((PROGRAM_BYTES + 45))"
  echo
  echo "Compiled program: $PROGRAM_BYTES bytes"
  echo "Known program-data rent floor:"
  NO_DNA=1 solana rent "$PROGRAM_DATA_BYTES" --url "$RPC_URL"
  echo "This floor excludes the config, collection, temporary deployment buffer, and transaction fees."
else
  echo
  echo "Program binary is missing. Run the verified build before funding or deployment."
fi
