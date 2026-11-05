#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$DIR/../.."

echo "🍎 Launching PeThar Wallet on iOS (iPhone / Simulator)..."
cd "$ROOT/pethar-wallet"
DART_DEFINES=()
if [ -f ".env" ]; then
  DART_DEFINES+=(--dart-define-from-file=.env)
fi
flutter run -d ios "${DART_DEFINES[@]}" "$@"
