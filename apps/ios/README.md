# Péthar iOS (အိုင်ဖုန်း မိုဘိုင်းလ်)

The **iOS (iPhone & iPad) Native Client** for Péthar.

## Native Project Location
The native iOS Xcode workspace is located at:
- `apps/ios/project` ➔ points to `pethar-wallet/ios/`
  - `Runner.xcworkspace`
  - `Runner.xcodeproj`
  - `Runner/Info.plist`
  - `Runner/Assets.xcassets` (App icons, launch images)
  - `Runner/AppDelegate.swift`

## Features
- Smooth iOS animations with Dynamic Island & notch support.
- Cupertino and Material integration with royal Arakan tokens.
- Secure Face ID / Touch ID authentication integration.
- Apple Pay / Card top-up UI simulation.

## How to Run & Build
```bash
# 1. Run in iOS Simulator:
open -a Simulator
./apps/ios/run.sh

# 2. Run on physical iPhone connected via USB:
./apps/ios/run.sh

# 3. Open in Xcode for signing, archiving, and TestFlight release:
./apps/ios/open-xcode.sh
```
