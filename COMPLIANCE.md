# Péthar Enterprise Compliance & Regulatory Framework

## 1. Executive Summary

**Péthar (ဖေ့သာ)** is a digital cash infrastructure built for financial resilience. This document outlines our corporate compliance posture, stablecoin reserve auditing, and privacy standards for the active mobile client and backend ledger.

---

## 2. Reserve Backing Standard (1.00 AKD = 1.00 USD / 1.00 ₳ = $1.00)

* **Parity Standard:** Every unit of **₳ (Arakan Dollar / AKD)** in user circulation is guaranteed 1:1 with audited US Dollar collateral (`1.00 AKD = 1.00 USD`).
* **Precision:** Enforced at `NUMERIC(18, 2)` across database tables (`akd_wallets`, `crypto_wallets`).
* **Collateral Asset Allocation:**
  * **USDT (Tether USD):** Tier-1 treasury reserve.
  * **USDC (Circle Internet Financial):** Audited monthly attestation standard.
* **1:1 In-App Swaps:** Users swap deposited USDT/USDC directly to AKD at 1:1 parity with zero slippage using ACID row locks (`FOR UPDATE`).
* **Multi-Signature Vaults:** Treasury movements require multi-signature hardware key approvals from designated treasury trustees.
* **Proof of Reserves:** Cryptographic reserve attestations published to the transparency ledger.

---

## 3. Privacy & Google Cloud Verification

* **Google API Services User Data Policy:** Péthar strictly adheres to Google's Limited Use requirements.
* **No Telemetry Selling:** User financial transaction data, identity records, and biometric metadata are never sold or rented to commercial brokers.
* **Right to Erasure (GDPR Art. 17):** Users retain the permanent right to delete their credentials, profiles, and associated records via `pethar-app@protonmail.com`.

---

## 4. Archived Legacy Features

* **Legacy Offline Mesh Modules:** Historical offline Cashu bearer token, BLE, and NFC modules have been consolidated and archived under `archive/offline-core/`. Active production focuses exclusively on the high-security Android and iOS Flutter mobile client (`pethar-wallet/lib/`) and the PostgreSQL / Supabase dual-wallet backend.
