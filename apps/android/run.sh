#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$DIR/../.."

echo "🤖 Launching PeThar Wallet on Android..."
cd "$ROOT/pethar-wallet"
flutter run -d android
