#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$DIR/../.."

echo "🤖 Launching PeThar Wallet on Android..."

# Check if an Android device or emulator is connected
ADB_BIN="$(which adb || echo "$ANDROID_HOME/platform-tools/adb")"
CONNECTED_DEVICES=$("$ADB_BIN" devices | grep -E '\b(device)\b' || true)

if [ -z "$CONNECTED_DEVICES" ]; then
  AVD_NAME=$(flutter emulators | awk '/• android$/ {print $1; exit}')
  AVD_NAME="${AVD_NAME:-Pixel_PeThar}"
  echo "📱 No active Android device detected. Launching $AVD_NAME emulator..."
  EMULATOR_BIN="$ANDROID_HOME/emulator/emulator"
  if [ -x "$EMULATOR_BIN" ]; then
    "$EMULATOR_BIN" -avd "$AVD_NAME" -no-snapshot-load -no-boot-anim -gpu host > /dev/null 2>&1 &
  else
    flutter emulators --launch "$AVD_NAME" > /dev/null 2>&1 &
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
DART_DEFINES=()
if [ -f ".env" ]; then
  DART_DEFINES+=(--dart-define-from-file=.env)
fi
flutter run -d "$TARGET_DEVICE" "${DART_DEFINES[@]}" "$@"
