#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Fund this deployer/authority wallet first:"
echo "$(NO_DNA=1 solana-keygen pubkey "$ROOT/keys/deployer-authority.json")"
echo
echo "Generated public addresses:"
echo "Treasury wallet:          $(NO_DNA=1 solana-keygen pubkey "$ROOT/keys/treasury.json")"
echo "Asset-capital treasury:   ${ASSET_TREASURY_WALLET:-$(NO_DNA=1 solana-keygen pubkey "$ROOT/keys/deployer-authority.json")}"
echo "Future upgrade mint:      not configured (upgrades disabled)"
echo "Core collection candidate: $(NO_DNA=1 solana-keygen pubkey "$ROOT/keys/core-collection.json") (not created)"
echo "Anchor program id:        $(NO_DNA=1 solana-keygen pubkey "$ROOT/program/target/deploy/program-keypair.json")"
echo
echo "Do not fund from a guess. Build first, estimate program rent, and review the exact deployment transactions."
