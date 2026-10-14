# Péthar Desktop (ဒက်စ်တော့ အက်ပ်)

The **Desktop Banking & Operations Application** for macOS, Windows, and Linux.

## Native Project Locations
1. **Flutter Native macOS Desktop App**:
   - `apps/desktop/macos-project` ➔ points to `pethar_mobile/macos/`
   - Native Cocoa/Swift window with native menus and hardware acceleration.
2. **Electron Standalone Desktop App**:
   - `apps/desktop/electron-project` ➔ points to `pethar-wallet/electron/`
   - Cross-platform desktop runtime for macOS, Windows, and Linux.

## Features
- Full-screen banking dashboard with wide desktop ergonomics.
- Institutional Treasury and double-entry transaction ledger tables.
- Foreign Exchange Special Board with live rate ticker.
- Desktop window resizing, native macOS menu bar integration, and keyboard shortcuts.

## How to Run
```bash
# 1. Run Flutter Native macOS Desktop App:
./apps/desktop/run-macos.sh

# 2. Run Electron Standalone Desktop Window:
./apps/desktop/run-electron.sh

# 3. Or install as PWA from Chrome:
# Open http://localhost:3000 in Chrome and click "Install Péthar" in address bar.
```
