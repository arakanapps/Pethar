#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$DIR/../.."

echo "🍎 Launching PeThar Wallet on iOS (iPhone / Simulator)..."
cd "$ROOT/pethar-wallet"
flutter run -d ios
