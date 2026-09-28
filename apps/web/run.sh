#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$DIR/../.."

echo "🚀 Starting PeThar Web Banking Portal (React + Vite)..."
cd "$ROOT/pethar-wallet"
npm run dev -- --host --open '?platform=web'
