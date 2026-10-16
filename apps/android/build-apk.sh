#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$DIR/../.."

echo "📦 Building Release APK for Android in pethar-wallet..."
cd "$ROOT/pethar-wallet"
flutter build apk --release

APK_SRC="$ROOT/pethar-wallet/build/app/outputs/flutter-apk/app-release.apk"
if [ -f "$APK_SRC" ]; then
  cp -f "$APK_SRC" "$ROOT/pethar-wallet/public/pethar-release.apk"
  cp -f "$APK_SRC" "$ROOT/pethar-wallet/public/pethar.apk"
  echo "✅ Synced release APK to:"
  echo "   - $ROOT/pethar-wallet/public/pethar-release.apk"
  echo "   - $ROOT/pethar-wallet/public/pethar.apk"
fi
