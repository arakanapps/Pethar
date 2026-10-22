# Péthar (ဖေ့သာ) — Multi-Platform Architecture Guide

This document provides a clean overview of how all files in the Péthar codebase are structured across the 5 platforms: **Web**, **Android**, **iOS**, **Merchant POS**, and **Desktop**.

---

## 🗂️ Platform Directory Map (`apps/`)

```text
Péthar/
├── package.json                 # Master platform runner (npm run web, android, ios, pos, desktop)
├── apps/
│   ├── web/                     # 🌐 WEB PLATFORM (Customer Portal & Operations Console)
│   │   ├── run.sh               # Starts Web Portal on http://localhost:3000/?platform=web
│   │   └── README.md
│   │
│   ├── android/                 # 🤖 ANDROID PLATFORM (Mobile Client)
│   │   ├── run.sh               # Runs app on connected Android phone or emulator
│   │   ├── build-apk.sh         # Compiles release APK and syncs to pethar-wallet/public/
│   │   └── README.md
│   │
│   ├── ios/                     # 🍎 iOS PLATFORM (iPhone / iPad Client)
│   │   ├── run.sh               # Runs app on iOS Simulator or physical iPhone
│   │   ├── open-xcode.sh        # Opens Runner.xcworkspace in Xcode
│   │   └── README.md
│   │
│   ├── pos/                     # 🛒 MERCHANT POS PLATFORM (Retailer Cashier Register)
│   │   ├── run.sh               # Starts POS Terminal on http://localhost:3000/?platform=pos
│   │   └── README.md
│   │
│   └── desktop/                 # 💻 DESKTOP PLATFORM (macOS, Windows, Linux)
│       ├── run-macos.sh         # Runs native Flutter macOS Desktop App
│       ├── run-electron.sh      # Launches standalone Electron Desktop Window
│       └── README.md
│
└── pethar-wallet/               # Unified Web (React 19 + Vite) & Native Mobile/Desktop (Flutter + Swift) Engine
```

---

## ⚡ Quick Run Reference

From the root directory (`/Users/jack/Documents/Péthar`):

| Target Platform | Command | What it does |
|---|---|---|
| **🌐 Web** | `npm run web` | Opens the full Web Banking Portal & FX Board in browser |
| **🤖 Android** | `npm run android` | Deploys & runs native Android app on device/emulator |
| **📦 Android APK** | `npm run android:apk` | Compiles `app-release.apk` for direct phone download |
| **🍎 iOS** | `npm run ios` | Runs native iOS app in iOS Simulator or iPhone |
| **🛠️ iOS Xcode** | `npm run ios:xcode` | Opens Xcode workspace for signing and TestFlight |
| **🛒 Merchant POS** | `npm run pos` | Opens the Touchscreen Register & Thermal Receipt Terminal |
| **📱 Flutter Mobile Web (m.domain)** | `npm run flutter:web` | Runs the unified Flutter mobile wallet in Chrome |
| **📦 Build Flutter Web** | `npm run flutter:build:web` | Compiles Flutter web bundle to `public/flutter/` |
| **💻 macOS Desktop** | `npm run desktop` | Launches the compiled native macOS Flutter desktop app |
| **⚡ Electron Desktop**| `npm run desktop:electron`| Launches standalone cross-platform Electron window |

---

## 🎯 Direct URLs on Dev Server (Port 3000)

When running the web dev server (`npm run web`):

| View | Direct Browser Link |
|---|---|
| **Web Banking Portal** | [http://localhost:3000/?platform=web](http://localhost:3000/?platform=web) |
| **Merchant POS Terminal** | [http://localhost:3000/?platform=pos](http://localhost:3000/?platform=pos) |
| **Android Phone Simulator** | [http://localhost:3000/?device=android](http://localhost:3000/?device=android) |
| **iPhone Simulator** | [http://localhost:3000/?device=ios](http://localhost:3000/?device=ios) |
| **Real Phone on Wi-Fi** | `http://192.168.1.104:3000` |
