# Péthar Threat Model & Cryptographic Security Architecture

## 1. Adversary Model & Operating Environment

Péthar is explicitly engineered to operate in hostile, intermittent, and adversarial environments characterized by:
* State-sponsored or conflict-induced telecommunications blackouts.
* Man-in-the-Middle (MitM) attacks on public Wi-Fi and rogue cellular towers.
* Offline device capture, theft, or confiscation.

---

## 2. Security Invariants & Defenses

### A. Offline Double-Spend Prevention
* **Mechanism:** Chaumian blind e-cash tokens.
* **Nonce Validation:** Every offline bearer token contains a unique cryptographically random serial nonce generated within the sender's secure hardware module.
* **Local Double-Spend Database:** The recipient device verifies local database state and records the token signature prior to acknowledging receipt.
* **Reconciliation Settlement:** When reconnecting via Starlink or restored terrestrial fiber, the first device to sync invalidates any duplicate claims at the central mint.

### B. Device Binding & Key Storage
* **Android:** Keys generated inside Android Keystore with `KeyProperties.PURPOSE_SIGN` and hardware-backed StrongBox backing where supported.
* **iOS:** Private transaction signing keys stored inside Apple's Secure Enclave (`kSecAccessControlPrivateKeyUsage`).
* **Zero Cloud Exposure:** Private keys are never transmitted to Firebase, Google Cloud, or any central database.

### C. Web Application Hardening
* Strict Content Security Policy (CSP) blocking unauthorized external scripts.
* `X-Frame-Options: DENY` preventing clickjacking.
* `X-Content-Type-Options: nosniff`.
* Automatic session expiration on idle.
