#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$DIR/../.."

echo "💻 Launching PeThar Wallet Native macOS Desktop App (Flutter)..."
cd "$ROOT/pethar-wallet"
flutter run -d macos
