#!/bin/bash
# Generate production signing key for Péthar Android APK
# Run this ONCE and store the .jks file securely

set -e

echo "🔐 Generating Péthar Release Signing Key..."
echo ""

KEYSTORE_FILE="pethar-wallet/android/app/pethar-release.jks"

if [ -f "$KEYSTORE_FILE" ]; then
    echo "⚠️  Keystore already exists at $KEYSTORE_FILE"
    echo "If you want to regenerate, delete it first (WARNING: This will invalidate all previously signed APKs)"
    exit 1
fi

# Generate the keystore
keytool -genkey -v \
    -keystore "$KEYSTORE_FILE" \
    -alias pethar \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -dname "CN=Péthar Wallet, OU=Engineering, O=Péthar, L=Arakan, ST=Rakhine, C=MM" \
    -storepass pethar2026 \
    -keypass pethar2026

echo "✅ Keystore generated successfully!"
echo ""
echo "📍 Location: $KEYSTORE_FILE"
echo "🔑 Alias: pethar"
echo "🔒 Password: pethar2026"
echo ""
echo "⚠️  IMPORTANT: Store this file securely and NEVER commit it to git!"
echo "Add to .gitignore: pethar-release.jks"
echo ""
echo "For production, set environment variables:"
echo "export PETHAR_KEYSTORE_PASSWORD='your_secure_password'"
echo "export PETHAR_KEY_PASSWORD='your_secure_password'"
