#!/usr/bin/env bash
# Build a lightweight Péthar release APK.
#
# Default: split per ABI (arm64-v8a + armeabi-v7a), which produces the smallest
# download for real phones and drops the emulator-only x86_64 payload.
#
#   PETHAR_ABI=arm64    -> single arm64-v8a APK (smallest single download)
#   PETHAR_ABI=split    -> one APK per supported phone ABI (default)
#   PETHAR_ABI=all      -> universal APK (largest, includes x86_64)
#   PETHAR_OBFUSCATE=1  -> also obfuscate Dart code (keep build/symbols for traces)
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$DIR/../.."
cd "$ROOT/pethar-wallet"

TARGET="${PETHAR_ABI:-split}"
OUT_DIR="build/app/outputs/flutter-apk"
EXTRA_FLAGS=()

if [ "${PETHAR_OBFUSCATE:-0}" = "1" ]; then
  EXTRA_FLAGS+=(--obfuscate --split-debug-info=build/symbols)
fi

echo "📦 Building lightweight release APK (target: $TARGET)..."
flutter pub get

case "$TARGET" in
  arm64)
    flutter build apk --release --target-platform android-arm64 "${EXTRA_FLAGS[@]}"
    ;;
  all)
    flutter build apk --release --target-platform android-arm,android-arm64,android-x64 "${EXTRA_FLAGS[@]}"
    ;;
  *)
    flutter build apk --release --split-per-abi \
      --target-platform android-arm,android-arm64 "${EXTRA_FLAGS[@]}"
    ;;
esac

echo ""
echo "✅ Release APK(s) generated:"
ls -lh "$OUT_DIR"/*.apk 2>/dev/null || true
echo ""
echo "Tip: PETHAR_ABI=arm64 gives the smallest single file to distribute."
