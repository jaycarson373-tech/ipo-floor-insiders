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
  RENT_JSON="$(NO_DNA=1 solana rent "$PROGRAM_DATA_BYTES" --lamports --output json --url "$RPC_URL")"
  RENT_LAMPORTS="$(node -e "const value=JSON.parse(process.argv[1]);process.stdout.write(String(value.rentExemptMinimumLamports))" "$RENT_JSON")"
  RECOMMENDED_LAMPORTS="$((RENT_LAMPORTS * 2 + 100000000))"
  echo
  echo "Compiled program: $PROGRAM_BYTES bytes"
  echo "Known program-data rent floor:"
  NO_DNA=1 solana rent "$PROGRAM_DATA_BYTES" --url "$RPC_URL"
  printf 'Recommended peak deployment funding: %.9f SOL\n' "$(node -e "process.stdout.write(String(Number(process.argv[1])/1e9))" "$RECOMMENDED_LAMPORTS")"
  echo "The recommendation includes a same-size temporary buffer and 0.1 SOL headroom for the program, config, collection, and fees. Unused buffer rent is recoverable."
else
  echo
  echo "Program binary is missing. Run the verified build before funding or deployment."
fi
