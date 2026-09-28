#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$DIR/../.."

echo "💻 Launching PeThar Native macOS Desktop App (Flutter)..."
cd "$ROOT/pethar_mobile"
flutter run -d macos
