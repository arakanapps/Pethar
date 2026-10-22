# Péthar Founder Roadmap

A founder-facing plan for building a trustworthy product for the Arakanese community on a constrained budget, while avoiding premature complexity. This is a product and engineering plan, not legal, financial, or compliance advice.

## Executive decision

Build **one Android app, one financial ledger, and one supported action: authenticated online AKD transfers between Péthar users**. Keep the public website as a lightweight download and status page. Do not enable cash-in/out, USDT/USDC custody, AKD/USD conversion, bill pay, top-up, POS, offline transfer, iOS web wallet, AI decision-making, or automated KYC approval until the technical, operational, and jurisdictional requirements are independently validated.

A free-tier system can support development and a small, non-custodial demonstration. It is not a dependable always-on financial platform: free services may pause, throttle, change quotas, or lack support and recovery guarantees. Do not accept or promise real monetary value on infrastructure you cannot monitor, back up, restore, and afford to operate.

## Product boundaries and release gates

### Stage 0 — Founder decisions (before more feature work)

- Define what AKD represents: an internal test unit, a redeemable claim, or a regulated payment instrument. Do not advertise a 1:1 USD peg, backing, deposits, or withdrawals unless those claims are true, provable, and legally cleared.
- Decide the first lawful user audience and countries. Arakanese users may live in many jurisdictions; domain registration in the UK does not establish where the service can be offered.
- Obtain qualified UK and target-market advice on payments/crypto rules, safeguarding, AML/KYC and sanctions screening, consumer terms, privacy, data retention, and incident obligations before handling real funds or identity documents.
- Choose a company/operator, support contact, complaints process, risk owner, and emergency decision-maker. Do not represent the app as a bank or guaranteed store of value.
- Pick one canonical identity and ledger database. In this repository, use Supabase Auth + PostgreSQL as the proposed source of truth only after schema/RLS review; decide whether Firebase Auth is retained or removed. Do not dual-write financial data to Firebase, MongoDB, MySQL, and Postgres.

**Gate:** written scope, jurisdiction review plan, data-flow diagram, and operator responsibilities agreed.

### Stage 1 — Safe prototype (no real money)

- Build Android install, sign-up/sign-in, email verification, PIN creation, user profile, balance display, QR/UID receive, and transfer screens against a staging environment.
- Clearly label balances and transfers as test-only; use seeded test accounts and no customer deposits or promises of redemption.
- Require a verified server identity for every operation. A PIN is an additional confirmation, not a replacement for authentication. Store no PIN or OTP in browser/local app storage; never log them.
- Implement the ledger server-side: balanced double-entry postings in one database transaction, atomic balance/limit enforcement, unique idempotency keys, immutable audit events, and replay-safe request handling.
- Use explicit sender/recipient account ownership columns and database policies. Do not base financial authorization on user-supplied IDs, email, local storage, or JSON metadata alone.
- Create test cases for concurrent spending, duplicate requests, self-transfers, invalid amounts, disabled users, KYC state, anonymous access, and cross-account reads/writes.

**Gate:** security review and automated isolation/concurrency tests pass; no unresolved critical/high findings.

### Stage 2 — Closed usability pilot (still no customer funds unless legally cleared)

- Recruit a small invited group from the community, with informed consent and a clear statement of what the pilot can and cannot do.
- Measure onboarding completion, failed logins, transfer latency, crashes, support response time, and confusing screens. Collect the minimum analytics needed and do not collect identity documents unless required and protected.
- Distribute APKs from `pethar.co.uk` using HTTPS, a release signature, published version and SHA-256 checksum, change notes, and a safe update/rollback procedure. Android direct distribution means users must trust the signing key and install source; protect that key offline and preserve it for all updates.
- Establish a vulnerability reporting channel, issue triage, release checklist, support playbook, account suspension process, and service status/maintenance notice.
- Start with manual support. Do not use AI to approve users, KYC, transactions, or fraud cases. Automation can later triage alerts, but decisions need auditable human oversight.

**Gate:** pilot feedback addressed, release signing verified, restores and rollback rehearsed, support and incident process usable by someone other than the founder.

### Stage 3 — Limited real-value pilot (only after approvals)

- Proceed only after written legal/compliance clearance, a viable funding and safeguarding model, operating budget, provider approvals, and verified reserve/reconciliation procedures where relevant.
- Keep customer funds and company operating funds separate. Reconcile the internal ledger against any external bank/chain/provider records daily; investigate every discrepancy before resuming affected activity.
- Add documented transaction limits, velocity and risk rules, sanctions/AML handling as required, dual-control for privileged actions, admin MFA, immutable admin audit, complaint/dispute handling, and a tested incident kill switch.
- Keep user-facing features locked unless server-side state authorizes them. KYC approvals must be attributable, reasoned, and appealable; store evidence in private encrypted storage with limited retention and access.
- Make no assumption that a “free” tier is suitable for real funds or sensitive identity data. Budget for dependable database backups, private object storage, logs/alerts, transactional email, domain, and any required verification/compliance vendors. Confirm each provider's terms and data location first.

**Gate:** external review, recovery drill, reconciliation and incident drills, operational owner on call, and explicit go/no-go approval.

### Stage 4 — Scale based on measured bottlenecks

Grow in steps, not by guessing at user-count thresholds:

1. Instrument API latency/error rates, database connections, query plans, queue depth, storage growth, OTP delivery, crash-free sessions, and support backlog.
2. Set service objectives and alerts (availability, transfer completion, p95 latency, recovery point/time) that match the product's actual risk and budget.
3. Load-test realistic concurrent transfers and reads; test database failover/restore and client retry behavior before increasing onboarding.
4. Scale the bottleneck: indexes/query design first; pooling and appropriately sized database next; queues for slow non-financial work; replicas for read-heavy workloads only after consistency rules are clear.
5. Add regions, providers, teams, or microservices only when measured availability, regulatory, latency, or organizational needs justify their operational cost.
6. Review vendor costs, limits, data-processing terms, and exit/export plans monthly. Keep a tested restore and provider migration path.

## Minimal-budget architecture

```text
Android Flutter app ─┐
                     ├─ Authenticated HTTPS ─> trusted transaction API
Public website ──────┘                           │
                                                 ├─ PostgreSQL ledger (canonical)
                                                 ├─ private object storage (only if KYC is enabled)
                                                 └─ logs, metrics, alerts, backups
```

- Keep customer app and marketing/download pages separate in access policy, even if served from the same frontend project at first.
- Use a single backend identity provider and PostgreSQL system of record. Keep app binaries and web bundles free of service-role keys, database passwords, and provider secrets.
- Keep KYC files out of public buckets and avoid storing them until a lawful process, access model, retention policy, and breach response exist.
- Treat VPS screenshots, “online” labels, allocated disk, cron success, and a green build as insufficient proof of end-to-end reliability. Check deployment logs, app-to-API connectivity, database health, durable backups, and restore evidence.
- Do not run MySQL, MongoDB, and PostgreSQL for the same records just because separate 10 GB volumes are visible. Each database adds patching, backups, credentials, monitoring, and failure modes. Use one database for the core product; add another only for a documented need.

## Minimal professional repository layout

Target a small, clear top level. This is a proposed destination, not a blanket instruction to move/delete the current work:

```text
.
├── README.md                 # Product status, scope, local setup, links
├── CONTRIBUTING.md           # Branch, review, test, release conventions
├── SECURITY.md               # Vulnerability reporting and security posture
├── docs/
│   ├── product/              # Scope, user journeys, decisions
│   ├── architecture/         # System boundaries and data flow
│   ├── operations/           # Runbooks, recovery, incident response
│   └── compliance/           # Reviewed policies; no unsupported claims
├── apps/
│   ├── android/              # Flutter app (eventual canonical location)
│   └── web/                  # Public site/admin only when actually supported
├── backend/
│   ├── supabase/             # One migrations/functions source of truth
│   └── tests/                # RLS, ledger, concurrency, API tests
├── scripts/                 # Small, documented maintenance/build scripts
└── .github/workflows/        # CI, dependency/security checks, release workflow
```

The existing repository currently has overlapping root SQL, `db/`, `drizzle/`, and Supabase migrations, plus duplicate or obsolete summary/quickstart docs and a combined `pethar-wallet/` directory. **Do not reorganize by moving everything at once.** First identify the canonical migration history and app entrypoints; then in small reviewed changes, remove only confirmed duplicates, update imports/CI/release paths, and verify clean checkout builds. Preserve history and avoid deleting generated artifacts or user work without confirming their use.

### Documentation rules

- Label each feature as **implemented and tested**, **prototype**, **planned**, or **not available**.
- Keep one authoritative getting-started guide, one founder roadmap, one architecture document, one operations guide, and one security/compliance source.
- Remove stale exact pricing, vendor tier promises, fabricated targets, sample secrets/URLs, and claims of reserves/licenses/offline settlement unless independently substantiated.
- Never document real OTPs, customer records, private connection strings, or production keys.

### CI and release hygiene

- On every pull request: format/analyze Dart, typecheck/build web, run unit/integration tests, validate SQL/migrations against disposable Postgres, and scan dependencies/secrets. Make failures block releases; do not suppress findings.
- Keep migrations append-only and reviewed. Test upgrade from a representative previous schema and verify rollback/recovery strategy before production.
- Tag releases, record source commit and APK checksum, sign with protected release credentials, test install/upgrade on physical devices, and publish a concise changelog.
- Keep `dist`, build outputs, reports, APKs, local databases, credentials, and device data out of Git unless a specific artifact is intentionally versioned and safely reproducible.

## Founder operating cadence

### Daily (during a live pilot)

- Check service health, transfer failures/latency, suspicious alerts, pending user support, and reconciliation exceptions.
- Escalate security or ledger mismatch immediately; pause affected transactions rather than manually editing balances.

### Weekly

- Review access/admin actions, release and dependency alerts, backup status, open incidents, fraud/support trends, and user feedback.
- Check actual resource usage and free-tier limits; set a warning before any quota or bill limit is reached.

### Monthly

- Perform a restore drill to an isolated environment, review who has production access, rotate credentials when warranted, review vendor invoices/terms, and update operating procedures.
- Review scope against evidence; do not add features simply because they are in the interface.

## First 30 days: concrete founder checklist

1. Freeze scope to online test AKD transfer; hide or disable unfinished money movement and crypto paths.
2. Reconcile the actual Supabase project, migration history, repo changes, and production secrets without applying unreviewed migrations.
3. Decide the single identity provider and remove unauthenticated/local-storage login fallbacks before any pilot.
4. Write a data-flow and threat model; classify profile, transaction, and KYC data; minimize what is collected.
5. Implement and test authenticated, idempotent, atomic transfer processing in staging; verify user A cannot read or spend user B's data.
6. Fix APK release signing and produce a signed test build; document the key backup and update process.
7. Replace overclaiming documents with feature-status language and a short privacy/support page.
8. Ask qualified counsel about target jurisdictions and proposed product before real value, customer deposits, or KYC documents are accepted.
9. Create an operating-cost ceiling and choose services only after verifying free-tier pause, quota, retention, backup, and data-region behavior.
10. Run a small usability test, collect feedback, and decide explicitly whether to proceed, narrow, or pause.

## Go/no-go criteria for any real-value launch

Do not launch if any answer is “no” or unknown:

- Is the product legally permitted for the specific operator, asset, flow, and user locations?
- Are funds/claims accurately described, safeguarded where required, and reconciled to reliable external evidence?
- Can only the authenticated owner initiate a transfer, with atomic posting and safe retries under concurrency?
- Are authorization policies tested for every sensitive table and privileged action?
- Can the operator detect suspicious activity, freeze a compromised account, investigate, communicate, and recover?
- Is there a tested backup restore, release rollback, and response owner outside the founder's memory?
- Can the service be operated without depending on an undocumented free-tier or a single person being always available?
- Are support, privacy, complaints, access, retention, and incident procedures written and actually usable?

When a gate fails, keep the feature in test mode. Trust and a small reliable scope are more valuable than a broad feature list.
