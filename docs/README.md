# PeThar documentation

This directory is the working product and engineering record for PeThar. Documents should describe decisions, controls, and user-visible behavior in plain language.

## Suggested document set

- `product-principles.md`: mission, user needs, safety principles, and non-negotiable experience rules
- `architecture.md`: service boundaries, data flows, trust boundaries, and failure modes
- `api/`: versioned API contracts and webhook behavior
- `runbooks/`: reconciliation, incident response, agent support, and disaster recovery
- `compliance/`: jurisdiction-specific requirements, control owners, and evidence links
- `legal/`: approved terms, privacy notice, fees, risk disclosures, and agent agreements

## Documentation rules

1. Mark mock behavior, planned behavior, and production behavior explicitly.
2. Record the owner and review date for operational or compliance documents.
3. Never place secrets, real customer information, private keys, or identity documents in documentation.
4. Link product claims to an implemented control or label them as a proposal.
5. Burmese translations should be reviewed by a fluent speaker and checked for accessibility.
