## Description
<!-- Provide a brief overview of changes and why they are necessary. -->

## Type of Change
- [ ] 🚀 New feature (non-breaking change which adds functionality)
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] 💅 UI/UX Refinement or Theming (consistent with Péthar design language)
- [ ] 🛡️ Security hardening or cryptographic upgrade
- [ ] 📚 Documentation update or Architecture Decision Record (ADR)
- [ ] ⚙️ CI/CD, Monorepo build, or configuration change

## Péthar Enterprise Checklist
- [ ] **Branding:** All user-facing text uses the official brand **Péthar** (ဖေ့သာ).
- [ ] **Currency Peg:** 1 ₳ = $1.00 USD currency parity preserved.
- [ ] **Offline Resilience:** Changes do not break offline Cashu/BLE/NFC bearer token transport.
- [ ] **Receipt Scannability:** Verification QR codes produce valid URL endpoints (`https://app.pethar.co.uk/verify/${refId}`).
- [ ] **Typecheck & Build:** Ran `npm run build` in `pethar-wallet` with zero TypeScript errors.
- [ ] **Mobile Analysis:** Ran `flutter analyze` in `pethar_mobile` with zero fatal warnings.
- [ ] **Security:** No hardcoded API secrets or private keys introduced.
- [ ] **Cross-Platform:** Tested across responsive desktop and mobile viewports.
