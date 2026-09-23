# Contributing to PeThar

## Before changing code

- Read the root README and the relevant document in `docs/`.
- Keep prototype data and production data clearly separated.
- For money movement, identity, risk, or security changes, describe the invariant and failure mode in the pull request.

## Local development

```bash
cd pethar-wallet
npm install
npm run dev
npm run lint
npm run build
```

## Pull request expectations

- Keep changes focused and explain user impact.
- Add or update tests for ledger, authorization, idempotency, reconciliation, and failure behavior when those areas are affected.
- Do not add real credentials, personal data, wallet seeds, private keys, or provider secrets.
- Do not call a mock flow “settled”, “insured”, “licensed”, or “secure” without an implemented and reviewed control.
- Include Burmese copy review for customer-visible language.
- Update documentation when behavior, limits, fees, risk, or supported jurisdictions change.

## Commit guidance

Use short imperative subjects, for example `Add agent cash-out limit checks`. Keep generated files and unrelated formatting changes out of feature commits.
