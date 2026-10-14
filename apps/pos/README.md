# Péthar Merchant POS (ကုန်သည် အရောင်းကောင်တာ POS စနစ်)

The **Merchant Point-of-Sale Register Terminal** for physical Arakan retailers, pharmacies, solar vendors, and grocery stores.

## Source Implementations
- Web POS: `apps/pos/POSTerminal.tsx` (React component in `pethar-wallet`)
- Flutter POS: `apps/pos/pos_terminal_screen.dart` (Flutter screen in `pethar_mobile`)

## Features
- **Fast Touchscreen Catalog**: One-tap item presets for common commodities (Rice, Fuel, Solar Battery, Antibiotics, Starlink, Cooking Oil).
- **Custom Amount Keypad**: Rapid charge entry for uncataloged goods.
- **Real-Time Cart Drawer**: Quantity multipliers (`+` / `-`), subtotals, item deletion, and total due.
- **Dynamic Arakan QR (AK QR) Code**: Instantly generates customer scan-to-pay QR.
- **Payment Settled Animation**: Immediate feedback with audio/visual confirmation upon payment receipt.
- **Monochrome Thermal Paper Receipt**: Printable sales slip with store metadata, itemized breakdown, total, barcode, Ed25519 hash, and print button.

## How to Run
```bash
# 1. Run Web POS Register in browser:
./apps/pos/run.sh

# 2. Or run native Flutter POS Terminal:
cd pethar_mobile
flutter run -d macos # or -d chrome
```

Direct Browser Link: **[http://localhost:3000/?platform=pos](http://localhost:3000/?platform=pos)**
