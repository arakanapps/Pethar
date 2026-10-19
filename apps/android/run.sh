#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$DIR/../.."

echo "🤖 Launching PeThar Wallet on Android..."

# Check if an Android device or emulator is connected
ADB_BIN="$(which adb || echo "/Users/jack/Library/Android/sdk/platform-tools/adb")"
CONNECTED_DEVICES=$("$ADB_BIN" devices | grep -E '\b(device)\b' || true)

if [ -z "$CONNECTED_DEVICES" ]; then
  echo "📱 No active Android device detected. Launching Pixel_PeThar emulator..."
  EMULATOR_BIN="/Users/jack/Library/Android/sdk/emulator/emulator"
  if [ -x "$EMULATOR_BIN" ]; then
    "$EMULATOR_BIN" -avd Pixel_PeThar -no-snapshot-load -no-boot-anim -gpu host > /dev/null 2>&1 &
  else
    flutter emulators --launch Pixel_PeThar > /dev/null 2>&1 &
  fi

  echo "⏳ Waiting for Android emulator to finish booting..."
  "$ADB_BIN" wait-for-device
  while [ "$("$ADB_BIN" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" != "1" ]; do
    sleep 1
  done
  echo "✅ Android emulator is ready!"
fi
DEVICE_ID=$("$ADB_BIN" devices | awk '/device$/ {print $1; exit}')
TARGET_DEVICE="${DEVICE_ID:-android}"

echo "🚀 Deploying to device: $TARGET_DEVICE"
cd "$ROOT/pethar-wallet"
flutter run -d "$TARGET_DEVICE" "$@"
