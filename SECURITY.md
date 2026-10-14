# Péthar Enterprise Security Policy

**Péthar (ဖေ့သာ)** adheres to defense-in-depth principles across its distributed web, native mobile, and offline mesh financial infrastructure.

---

## 1. Reporting a Vulnerability

We welcome responsible security research. Please do **NOT** open public GitHub issues for security vulnerabilities.

Submit reports privately to our security operations team:
* **Email:** [security@pethar.co.uk](mailto:security@pethar.co.uk)
* **Response SLA:** Initial triage within 24 hours; status updates every 48 hours.

### What to Include
1. Component or repository path (e.g. `pethar-wallet`, `pethar_mobile/offline_payment_service.dart`, `firestore.rules`).
2. Detailed proof of concept (PoC) or reproducible steps.
3. Assessment of vulnerability impact and potential exploit vectors.
4. Redacted logs or packet traces (strictly remove all keys or tokens).

---

## 2. Cryptographic Security Standards

* **Offline Bearer Token Minting (Cashu Chaumian Model):**
  * Blind signature verification guarantees issuer untraceability.
  * Replay protection via double-spend database and local nonces.
  * Hardware-backed keystores on Android (Android KeyStore) and iOS (Secure Enclave).
* **Ledger Verifiability:**
  * Every transaction slip generates a deterministic verification payload (`https://app.pethar.co.uk/verify/${refId}`).
  * Cryptographic Merkle tree inclusion proofs with public root hashes.
* **Network & Transport:**
  * Mandatory TLS 1.3 with strict HSTS, `X-Content-Type-Options: nosniff`, and CSP headers.
  * Zero plain-text communication over BLE or local ad-hoc Wi-Fi mesh.

---

## 3. Data Minimization & Google Cloud Verification

* **Authentication Scopes:** Only standard identity scopes (`openid`, `email`, `profile`) are requested via Google Sign-In.
* **No Unnecessary Scopes:** Péthar will never request Google Drive, Gmail, or Contact read/write access.
* **Zero Telemetry Tracking:** No third-party ad pixels or commercial trackers are embedded in our web or mobile applications.
