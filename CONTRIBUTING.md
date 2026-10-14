# Contributing to Péthar (ဖေ့သာ)

Thank you for contributing to **Péthar**, the resilient sovereign financial infrastructure for Arakan and global digital commerce.

---

## 1. Development Lifecycle & Standards

### Branching Strategy
* `main`: Production-ready code deployed to `pethar.co.uk` and subdomains.
* `develop`: Active integration branch for upcoming releases.
* `feature/<name>`: Feature branches cut from `develop`.
* `fix/<name>`: Bug fixes and security patches.

### Conventional Commits
All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
* `feat:` New user-facing capability or service.
* `fix:` Bug fix or vulnerability remediation.
* `docs:` Documentation or ADR modifications.
* `refactor:` Code restructuring without logic alterations.
* `style:` UI theming, visual styling, or cosmetic changes.
* `test:` Unit, integration, or offline sync test cases.
* `chore:` Build scripts, dependencies, or monorepo configurations.

---

## 2. Local Setup & Verification

### Web Monorepo (`pethar-wallet`)
```bash
cd pethar-wallet
npm install
npm run dev
npm run build    # Must succeed with 0 TypeScript errors
```

### Mobile Engine (`pethar_mobile`)
```bash
cd pethar_mobile
flutter pub get
flutter test
flutter analyze
```

---

## 3. Core Enterprise Invariants

1. **Brand Fidelity:** All user-facing references MUST use **Péthar** (ဖေ့သာ).
2. **Currency Standard:** 1 ₳ = $1.00 USD must remain exact across all screens, balance displays, and receipts.
3. **Receipt Verifiability:** Any new transaction type must generate a cryptographic reference ID and support scannable QR verification.
4. **Offline Zero-Internet Invariant:** Offline peer-to-peer functions must NEVER depend on network connectivity, cloud sync, or external DNS lookups to complete a bearer transfer.
