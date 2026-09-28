#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$DIR/../.."

echo "🍎 Launching PeThar on iOS (iPhone / Simulator)..."
cd "$ROOT/pethar_mobile"
flutter run -d ios
