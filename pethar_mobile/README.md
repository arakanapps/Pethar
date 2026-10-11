# PeThar Mobile (ဖေ့သာ မိုဘိုင်းလ်) — Flutter App

This is the complete cross-platform mobile application for **PeThar (ဖေ့သာ)**, the Arakan national digital financial infrastructure, built with Flutter for **Android** and **iOS (iPhone)**.

---

## 📱 Features Included

- **Bilingual Support**: Instant toggle between **Arakanese / Burmese (ရခိုင်)** and **English**.
- **Dark & Light Mode**: Complete royal Arakan theme (Royal Crimson `#D91624`, Arakan Gold `#D4AF37`, Obsidian `#090D14`).
- **5-Dock Navigation with Elevated Scan Button**:
  - **Home**: Krungthai NEXT inspired top header, balance eye masking, 8 quick services, favorites horizontal scroll, announcement notice, and live ledger transaction feed.
  - **Account**: Primary Arakan Dollar account card, PeThar Visa Debit card widget with freeze/unfreeze and CVV reveal.
  - **Scan / My QR / QR to Pay**: Animated camera viewfinder with laser scan line, authentic Arakan QR card with Save and Share, and Merchant QR to Pay.
  - **Services**: Full directory for Money Movement, Global Banking & Remittance, and Digital Assets.
  - **Settings**: Vibrant gradient hero banner, Edit Personal Profile dialog, Auto-save slip toggle, Security (PIN reset, 2FA toggle), and Legal policies.
- **P2P Send Money**: 4-step wizard with recipient search, amount keypad with quick preset chips, 6-digit PIN authorization, and auto-saved Electronic Transaction Slip (e-Slip).
- **Receive Money**: Dynamic Arakan QR (AK QR) code (`pethar://pay...`) with one-tap PeThar ID copy.
- **Agent Cash-Out**: Verified physical agent branch directory with distance and float indicators, plus 30-second dynamic TOTP withdrawal codes.
- **International Banking & Wire**: Wise global corridors (THB, MYR, SGD, USD) with zero-fee calculation.
- **Crypto & Stablecoin Gateway**: Proof of Reserves audit view (105% coverage) and multi-chain USDT deposit addresses (TRC-20, ERC-20, TON, Polygon).
- **Merchant POS Terminal**: Retailer inventory catalog, real-time cart with quantity multipliers, and customer charge QR generation.
- **Notification Center**: Filter pills (All, Transaction, System, Promotion) with live unread counter synced across the app.

---

## 🛠️ Getting Started on Your Mac

### 1. Install Flutter (via Homebrew)
Run the following in your terminal:
```bash
brew install --cask flutter
```

Verify your installation:
```bash
flutter doctor
```

### 2. Fetch Dependencies
Navigate to the mobile app directory and run:
```bash
cd pethar_mobile
flutter pub get
```

### 3. Run on Your Devices

#### For Android Phones:
1. Enable **Developer Options** and **USB Debugging** on your Android phone.
2. Plug your phone into your Mac via USB.
3. Verify your device appears:
   ```bash
   flutter devices
   ```
4. Run the app:
   ```bash
   flutter run
   ```
5. To build a standalone APK for installation or sharing:
   ```bash
   flutter build apk --release
   ```
   The APK will be generated at `build/app/outputs/flutter-apk/app-release.apk`. Transfer this file to your Android phone to install directly!

#### For iPhones (iOS):
1. Make sure you have Xcode installed from the Mac App Store.
2. Plug your iPhone into your Mac via USB and tap "Trust This Computer".
3. Run:
   ```bash
   flutter run
   ```
4. To test on the iOS Simulator:
   ```bash
   open -a Simulator
   flutter run
   ```

---

## 📂 Project Architecture

```text
pethar_mobile/
├── pubspec.yaml            # Dependencies (Provider, QR Flutter, Google Fonts, etc.)
└── lib/
    ├── main.dart           # App entry point with Provider and theme switcher
    ├── app_state.dart      # Reactive AppState (balance, notifications, language, theme)
    ├── theme.dart          # PeThar color tokens (Crimson, Gold, Obsidian)
    ├── i18n.dart           # Complete Arakanese and English translation dictionary
    ├── models/
    │   └── data.dart       # UserProfile, WalletBalance, Contacts, Agents, Transactions
    ├── widgets/
    │   ├── arakan_emblem.dart # Royal Arakan emblem badge
    │   ├── keypad.dart        # 3-column financial numeric keypad
    │   └── otp_dots.dart      # 6-digit PIN indicator dots
    └── screens/
        ├── main_shell.dart         # Bottom nav with elevated center Scan button
        ├── home_screen.dart        # Home dashboard with Krungthai NEXT style
        ├── account_screen.dart     # Account balances and Visa debit card
        ├── send_screen.dart        # 4-step transfer with e-Slip receipt
        ├── receive_screen.dart     # Personal Arakan QR (AK QR) receiver
        ├── scan_screen.dart        # Viewfinder, My QR, and QR to Pay tabs
        ├── cashout_screen.dart     # Physical agent branch directory & TOTP
        ├── services_screen.dart    # Full services categorized directory
        ├── settings_screen.dart    # Profile editor, 2FA, language, dark mode
        ├── notifications_screen.dart # Notification center with filter pills
        ├── intl_screen.dart        # Wise remittance corridors
        ├── crypto_screen.dart      # Proof of Reserves & USDT multi-chain
        └── pos_screen.dart         # Merchant touchscreen register
```
