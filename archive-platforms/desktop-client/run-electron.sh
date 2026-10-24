#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$DIR/../.."

echo "💻 Launching PeThar Standalone Desktop Window (Electron)..."
cd "$ROOT/pethar-wallet"
npx electron electron/main.js
