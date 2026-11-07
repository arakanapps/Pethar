#!/usr/bin/env bash
# Remove disposable Flutter/Android build caches from pethar-wallet.
# Source, pubspec and platform config are never touched.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP="$DIR/../../pethar-wallet"

echo "Before:"
du -sh "$APP/build" "$APP/.dart_tool" "$APP/android/.gradle" "$APP/android/.kotlin" 2>/dev/null || true

rm -rf \
  "$APP/build" \
  "$APP/.dart_tool" \
  "$APP/android/.gradle" \
  "$APP/android/.kotlin" \
  "$APP/android/app/.cxx"

find "$APP" -maxdepth 1 -name "*.log" -type f -delete 2>/dev/null || true

echo ""
echo "✅ Caches removed. Run 'flutter pub get' before the next build."
du -sh "$APP" 2>/dev/null || true
