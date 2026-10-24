# Péthar Corporate Compliance & Privacy Standard

## 1. Regulatory Status & Purpose
**Péthar (ဖေ့သာ)** is developed as a community-centric digital cash infrastructure for Arakan. It does not engage in fractional-reserve banking, high-risk leverage lending, or customer asset hypothecation.

---

## 2. Reserve Collateralization & Peg Integrity
* **Unit of Account:** 1.00 AKD = 1.00 USD (`1.00 ₳ = $1.00`).
* **Collateral Mandate:** For every 1.00 AKD issued in circulation, the treasury maintains $1.00 USD in segregated stablecoins (**USDT, USDC**).
* **Dual-Wallet Ledger:** Main AKD wallet balances and on-chain USDT/USDC balances are stored with fixed `NUMERIC(18, 2)` decimal precision.
* **1:1 In-App Swaps:** Instant 1:1 conversions between USDT/USDC and AKD execute with $0 slippage using PostgreSQL `FOR UPDATE` ACID transactions.

---

## 3. Privacy Policy & Google Cloud Limited Use
* **Data Minimization:** We only collect information strictly required to authenticate the user and facilitate ledger accounting (Name, Email, Google UID).
* **Prohibited Practices:**
  * No selling or licensing of personal data.
  * No advertising trackers or data broker partnerships.
  * No scraping of contacts, photos, or emails.
* **Right to Erasure:** Contact `pethar-app@protonmail.com` to purge account data permanently.
