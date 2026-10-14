# Péthar API Specification & Ledger Endpoints

## 1. Overview
The Péthar API provides enterprise financial institutions, merchants, and developer integrations with type-safe interfaces for payment routing, balance queries, and on-chain verification.

Base URL: `https://app.pethar.co.uk/api/v1`

---

## 2. Public Verification Endpoints

### `GET /verify/:refId`
Retrieves the cryptographic receipt verification status for any transaction reference.

#### Request Parameters
- `refId` *(path, string, required)*: The 14-digit transaction reference number.

#### Response (`200 OK`)
```json
{
  "status": "VERIFIED",
  "refId": "50059261069021",
  "amount": 5.00,
  "currency": "AKD",
  "peggedValueUsd": 5.00,
  "timestamp": "2026-10-14T17:35:10Z",
  "sender": {
    "name": "MYAT SOE P****",
    "id": "ARAK-8891-JACK"
  },
  "recipient": {
    "name": "MR. MYAT SOE PAI****",
    "id": "TX-5001"
  },
  "proof": {
    "merkleRoot": "0x8a91f4c2901bfa829471de990c7412ae8b7244ef",
    "blockHeight": 948192,
    "collateralReserve": "100% USDT / USDC Audited"
  }
}
```

---

## 3. Merchant & POS API

### `POST /merchant/charge`
Generates a signed invoice payload for offline or online POS terminal processing.

#### Request Body
```json
{
  "merchantId": "MERCHANT-SITTWE-01",
  "amount": 25.50,
  "currency": "AKD",
  "memo": "Local agriculture supplies"
}
```

#### Response (`201 Created`)
```json
{
  "invoiceId": "INV-89104",
  "qrPayload": "pethar://pay?to=MERCHANT-SITTWE-01&amount=25.50&invoice=INV-89104",
  "expiresAt": "2026-10-14T18:05:10Z"
}
```
