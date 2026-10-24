#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$DIR/../.."

echo "🛒 Starting PeThar Merchant POS Register Terminal..."
cd "$ROOT/pethar-wallet"
npm run dev -- --host --open '?platform=pos'
