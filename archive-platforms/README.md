# Archive Platforms (`archive-platforms/`)

This directory contains preserved, fully-functional implementations of the **Web**, **Point-of-Sale (POS)**, and **Desktop** platforms that have been archived to focus the active workspace strictly on native **Android and iOS** mobile clients (`pethar-wallet`).

---

## Archived Platforms Index

### 1. `archive-platforms/web-wallet/`
- **Stack:** React 19, TypeScript, Vite, Tailwind CSS, Radix UI, Vercel
- **Previous Location:** `pethar-wallet/src/`, `pethar-wallet/public/`, `pethar-wallet/web/`, root and wallet `vercel.json`
- **Contents:**
  - `src/` — React 19 customer wallet portal, FX board, and landing page
  - `public/` — Web manifests, service workers, icons, and Apple mobile configurations
  - `flutter-web/` — Compiled Flutter web platform integration
  - `vite.config.ts`, `vercel.json`, `root-vercel.json` — Edge hosting configurations
  - `package.json`, `package-lock.json` — Web npm dependencies
  - `run.sh` — Web portal launcher script
- **Reactivation:** Copy `src/`, `public/`, and web configs back to a dedicated web project or deploy directly using `vercel`.

### 2. `archive-platforms/pos-terminal/`
- **Stack:** Flutter (Dart) & React (TypeScript)
- **Previous Location:** `apps/pos/`, `archive-offline-features/pos-system/`
- **Contents:**
  - `pos_terminal_screen.dart` — Flutter POS register UI for touchscreens
  - `pos_screen.dart` — Flutter cashier and transaction summary screen
  - `POSTerminal.tsx` — Web POS register with quick catalog, custom charge, and thermal receipt print simulation
  - `run.sh` — POS register launcher script
  - `README.md` — Merchant POS specifications and hardware details

### 3. `archive-platforms/desktop-client/`
- **Stack:** Flutter macOS Runner, Electron cross-platform launcher
- **Previous Location:** `apps/desktop/`, `pethar-wallet/macos/`
- **Contents:**
  - `macos/` — Native macOS Xcode Runner workspace (`Runner.xcworkspace`), Podfile, entitlements, and app icons
  - `desktop_portal_screen.dart` — Flutter wide-screen desktop portal
  - `electron/` — Electron entrypoint (`main.js`) for desktop window wrappers
  - `run-macos.sh` — Native macOS Flutter build & launch script
  - `run-electron.sh` — Standalone Electron desktop launcher
  - `README.md` — Desktop client documentation
