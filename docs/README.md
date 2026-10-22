# Péthar Documentation

This directory is the working product and engineering record for Péthar (ဖေ့သာ). Documents describe decisions, controls, and user-visible behavior in plain language.

---

## Directory Structure

```
docs/
├── architecture/          # System design, topology, and service boundaries
│   └── ENTERPRISE_ARCHITECTURE.md
├── security/              # Threat model, cryptographic specs
│   └── THREAT_MODEL_AND_SECURITY.md
├── compliance/            # Privacy, Google OAuth, and regulatory policies
│   └── COMPLIANCE_AND_PRIVACY.md
├── api/                   # Versioned API contracts
│   └── API_SPECIFICATION.md
├── auth/                  # Authentication, KYC, and identity flows
│   ├── AUTH_SECURITY_FLOW.md
│   ├── NO_PASSWORD_AUTH_FLOW.md
│   └── KYC_LEVEL2_IMPLEMENTATION.md
├── guides/                # Setup, maintenance, and platform guides
│   ├── QUICKSTART.md
│   ├── PLATFORMS.md
│   ├── MAINTENANCE_GUIDE.md
│   └── admin-dashboard-setup.md
├── implementation/        # Implementation details and roadmaps
│   ├── IMPLEMENTATION_ROADMAP.md
│   ├── FINAL_IMPLEMENTATION_SUMMARY.md
│   ├── USER_FLOW_IMPLEMENTATION.md
│   ├── UPDATED_DASHBOARD_IMPLEMENTATION.md
│   └── SIMPLIFIED_DASHBOARD_FINAL.md
└── product/               # Product vision, principles, and roadmap
    ├── FOUNDER_ROADMAP.md
    ├── product-principles.md
    └── pethar-landing-outline.md
```

## Documentation Rules

1. Mark mock behavior, planned behavior, and production behavior explicitly.
2. Record the owner and review date for operational or compliance documents.
3. Never place secrets, real customer information, private keys, or identity documents in documentation.
4. Link product claims to an implemented control or label them as a proposal.
5. Burmese translations should be reviewed by a fluent speaker and checked for accessibility.
