#!/bin/bash
# Build production-ready Péthar Android APK for direct distribution

set -e

cd "$(dirname "$0")/.."

echo "🚀 Building Péthar Android APK..."
echo ""

# Check if signing key exists
if [ ! -f "pethar-wallet/android/app/pethar-release.jks" ]; then
    echo "❌ Signing key not found!"
    echo "Run: bash scripts/generate-signing-key.sh"
    exit 1
fi

# Navigate to Flutter project
cd pethar-wallet

# Clean previous builds
echo "🧹 Cleaning previous builds..."
flutter clean

# Get dependencies
echo "📦 Getting dependencies..."
flutter pub get

# Build release APK
echo "🔨 Building release APK..."
flutter build apk --release --split-per-abi

# Build universal APK (larger file, compatible with all devices)
echo "🔨 Building universal APK..."
flutter build apk --release

echo ""
echo "✅ Build complete!"
echo ""
echo "📱 APK Files:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ls -lh build/app/outputs/flutter-apk/*.apk
echo ""
echo "📍 Universal APK (recommended for download page):"
echo "   build/app/outputs/flutter-apk/app-release.apk"
echo ""
echo "📍 Architecture-specific APKs (smaller, faster):"
echo "   build/app/outputs/flutter-apk/app-armeabi-v7a-release.apk (32-bit ARM)"
echo "   build/app/outputs/flutter-apk/app-arm64-v8a-release.apk (64-bit ARM - most modern phones)"
echo "   build/app/outputs/flutter-apk/app-x86_64-release.apk (Intel/AMD emulators)"
echo ""
echo "🌐 Next steps:"
echo "1. Upload app-release.apk to pethar.co.uk/downloads/"
echo "2. Generate SHA-256 checksum: sha256sum app-release.apk"
echo "3. Update download page with version number and checksum"
