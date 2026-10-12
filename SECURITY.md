# Security policy

PeThar is an early prototype. It is not approved for real-money use, production credentials, or customer data.

## Reporting a vulnerability

Do not open a public issue for a vulnerability. Contact the project security maintainers privately at [pethar-app@protonmail.com](mailto:pethar-app@protonmail.com) and include:

- affected component, commit, or deployment
- reproducible steps or proof of concept
- impact and likely abuse path
- any logs or artifacts with secrets removed

Never include passwords, API keys, private keys, seed phrases, identity documents, or customer information in a report.

## Security scope

Priority areas include authentication and device binding, authorization, ledger integrity, idempotency, replay protection, offline voucher redemption, agent permissions, webhook verification, secrets management, rate limits, privacy, and dependency vulnerabilities.

The project aims for defense in depth, not an impossible promise that an application can never be attacked. Production launch requires an independent security review, threat model, penetration testing, incident response plan, backups, reconciliation, and regulated-partner controls.

## Safe development rules

- Use test accounts and synthetic data only.
- Store secrets in a managed secret store, never in Git.
- Treat frontend balances and status as untrusted display data.
- Require backend authorization for every money-moving operation.
- Log security-relevant events without logging sensitive personal data or secrets.
