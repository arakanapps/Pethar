# PeThar Web (ကွန်ရက် ဘဏ်လုပ်ငန်း ပေါ်တယ်)

The **Customer Web App & Operations Console** for PeThar.

## Features
- **Institutional Treasury & Net Worth Overview**: Live AKD balance, USD equivalence ($21,526.00), and reserve audit status.
- **Arakan FX Ticker Bar**: Real-time rates for `AKD/USD`, `AKD/USDT`, `AKD/THB`, `AKD/MYR`, `AKD/SGD`, and `BTC/AKD`.
- **Searchable Ledger Table**: Filterable double-entry transaction history by category (P2P, Crypto, Merchant POS, Cash Out, Remittance, Cards).
- **Quick Send Widget**: 1-click transfers to frequent contacts.
- **Interactive Mobile Simulator**: Built-in side-by-side simulator for Android and iOS testing.

## How to Run
```bash
# Direct launcher:
./apps/web/run.sh

# Or from pethar-wallet:
cd pethar-wallet
npm run dev
```

URL: **[http://localhost:3000/?platform=web](http://localhost:3000/?platform=web)**
