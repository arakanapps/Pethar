# Péthar Documentation

This directory is the working product and engineering record for Péthar (ဖေ့သာ). Documents describe decisions, controls, and user-visible behavior in plain language.

---

## Directory Structure

```
docs/
├── architecture/          # System design, topology, and service boundaries
│   └── system-architecture.md
├── security/              # Threat model, cryptographic specs
│   └── threat-model.md
├── compliance/            # Privacy, Google OAuth, and regulatory policies
│   └── compliance-and-privacy.md
├── api/                   # Versioned API contracts
│   └── api-specification.md
├── auth/                  # Authentication, KYC, and identity flows
│   ├── auth-security-flow.md
│   ├── passwordless-auth-flow.md
│   └── kyc-verification.md
├── guides/                # Setup, maintenance, and platform guides
│   ├── quickstart.md
│   ├── mobile-platforms.md
│   ├── maintenance-guide.md
│   └── admin-dashboard-setup.md
├── implementation/        # Implementation details and roadmaps
│   ├── implementation-roadmap.md
│   ├── system-implementation.md
│   ├── user-flow-specification.md
│   ├── dual-wallet-dashboard.md
│   └── wallet-dashboard-spec.md
└── product/               # Product vision, principles, and roadmap
    ├── product-roadmap.md
    ├── product-principles.md
    └── landing-page-spec.md
```

## Documentation Rules

1. Mark mock behavior, planned behavior, and production behavior explicitly.
2. Record the owner and review date for operational or compliance documents.
3. Never place secrets, real customer information, private keys, or identity documents in documentation.
4. Link product claims to an implemented control or label them as a proposal.
5. Arakanese translations should be reviewed by a fluent speaker and checked for accessibility.
