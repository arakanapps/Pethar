#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$DIR/../.."

echo "📦 Building Release APK for Android..."
cd "$ROOT/pethar_mobile"
flutter build apk --release

echo ""
echo "✅ Build complete! APK generated at:"
echo "$ROOT/pethar_mobile/build/app/outputs/flutter-apk/app-release.apk"
