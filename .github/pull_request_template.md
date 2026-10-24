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
- [ ] **Currency Peg:** `1.00 AKD = 1.00 USD` (`1.00 ₳ = $1.00`) currency parity preserved with `NUMERIC(18, 2)` precision.
- [ ] **Mobile Scope:** Changes apply strictly to native Android & iOS mobile client (`pethar-wallet/`) or dual-wallet backend.
- [ ] **Archive Hygiene:** No imports or dependencies reintroduced from root `/archive/`.
- [ ] **Mobile Analysis & Tests:** Ran `flutter analyze` and `flutter test` in `pethar-wallet` with zero failures.
- [ ] **Security:** Tokens and PIN hashes stored via hardware secure storage (`flutter_secure_storage`); server auth validated with `supabase.auth.getUser()`.
- [ ] **Contact Info:** Official email `pethar-app@protonmail.com` and test account `realjackhalder@gmail.com` preserved.
