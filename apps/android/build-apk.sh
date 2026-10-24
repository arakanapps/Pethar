#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$DIR/../.."

echo "📦 Building Release APK for Android in pethar-wallet..."
cd "$ROOT/pethar-wallet"
flutter build apk --release --no-tree-shake-icons

APK_SRC="$ROOT/pethar-wallet/build/app/outputs/flutter-apk/app-release.apk"
if [ -f "$APK_SRC" ]; then
  echo "✅ Release APK generated successfully:"
  echo "   - $APK_SRC"
fi
