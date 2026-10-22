# Péthar Long-Term Maintenance & Operations Guide

## 🎯 Daily Operations (5-10 minutes/day)

### Morning Routine:

```bash
# 1. Check system health
curl https://uklqksioruxvatwpvopm.supabase.co/rest/v1/
# Should return: 200 OK

# 2. Check recent transactions
# Login to Supabase Dashboard → SQL Editor
SELECT COUNT(*) as txn_count, 
       SUM(amount) as total_volume
FROM transactions 
WHERE created_at > NOW() - INTERVAL '24 hours';

# 3. Check for failed transactions
SELECT * FROM transactions 
WHERE status = 'FAILED' 
AND created_at > NOW() - INTERVAL '24 hours';

# 4. Review pending approvals
SELECT COUNT(*) FROM pending_approvals WHERE status = 'PENDING';
```

### Evening Routine:

```bash
# Review error logs
# Supabase Dashboard → Logs → Filter by "error"

# Check user growth
SELECT COUNT(*) as new_users 
FROM users 
WHERE created_at > NOW() - INTERVAL '24 hours';
```

---

## 📊 Weekly Monitoring (30 minutes/week)

### Every Monday Morning:

```sql
-- 1. Weekly transaction summary
SELECT 
    DATE(created_at) as date,
    COUNT(*) as transactions,
    SUM(amount) as volume_akd,
    COUNT(DISTINCT metadata->>'user_id') as active_users
FROM transactions
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 2. User growth trend
SELECT 
    DATE(created_at) as signup_date,
    COUNT(*) as new_signups
FROM users
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at);

-- 3. AKD wallet balance distribution
SELECT 
    CASE 
        WHEN balance = 0 THEN '₳0'
        WHEN balance < 10 THEN '₳0-10'
        WHEN balance < 100 THEN '₳10-100'
        WHEN balance < 1000 THEN '₳100-1,000'
        ELSE '₳1,000+'
    END as balance_range,
    COUNT(*) as user_count
FROM user_profiles
GROUP BY balance_range
ORDER BY MIN(balance);

-- 4. Check for suspicious patterns
SELECT 
    metadata->>'user_id' as user_id,
    COUNT(*) as txn_count,
    SUM(amount) as total_amount
FROM transactions
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY metadata->>'user_id'
HAVING COUNT(*) > 20 -- More than 20 transactions/day
ORDER BY txn_count DESC;
```

---

## 🔄 Database Backups (Automated)

### Supabase Built-in Backups:

- **Point-in-Time Recovery (PITR):** Last 7 days (automatic)
- **Daily Backups:** Retained for 30 days (Supabase Pro)

### Additional Manual Backup (Monthly):

```bash
#!/bin/bash
# Save as: scripts/monthly-backup.sh

TIMESTAMP=$(date +%Y%m%d)
BACKUP_FILE="pethar_backup_$TIMESTAMP.sql"

# Export database
pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

# Compress
gzip "$BACKUP_FILE"

# Upload to multiple locations
aws s3 cp "$BACKUP_FILE.gz" s3://pethar-backups/monthly/
scp "$BACKUP_FILE.gz" backup-server:/backups/pethar/

echo "✅ Backup completed: $BACKUP_FILE.gz"
```

**Schedule with cron:**
```bash
# Run on 1st of every month at 3am
0 3 1 * * /path/to/scripts/monthly-backup.sh
```

---

## 🆙 App Updates & Versioning

### When to Release New Version:

1. **Bug fixes** → Patch version (1.0.0 → 1.0.1)
2. **New features** → Minor version (1.0.1 → 1.1.0)
3. **Breaking changes** → Major version (1.1.0 → 2.0.0)

### Release Process:

```bash
# 1. Update version in pubspec.yaml
cd pethar-wallet

# Edit pubspec.yaml:
# version: 1.0.1+2  (version+build_number)

# 2. Update CHANGELOG.md
cat >> CHANGELOG.md << EOF
## [1.0.1] - 2026-10-25
### Fixed
- Transaction receipt QR code rendering
- Offline payment BLE connection stability

### Added
- Arakanese language support for error messages
EOF

# 3. Build new APK
bash scripts/build-android-apk.sh

# 4. Generate checksum
sha256sum build/app/outputs/flutter-apk/app-release.apk

# 5. Rename and upload
cp app-release.apk pethar-v1.0.1.apk
# Upload to pethar.co.uk/downloads/

# 6. Update download page
# Change version number and SHA-256 checksum

# 7. Announce in Telegram
# "New version 1.0.1 available!
#  What's new: Bug fixes and Arakanese translations
#  Download: pethar.co.uk"
```

### Backward Compatibility:

```typescript
// In app code, check minimum supported version
const MINIMUM_API_VERSION = '1.0.0'

if (currentAppVersion < MINIMUM_API_VERSION) {
  showUpdateRequiredDialog()
  // Force user to update before continuing
}
```

---

## 🚨 Handling Errors & Incidents

### Common Issues & Quick Fixes:

#### Issue 1: User Can't Login

**Symptoms:** "Authentication failed" error

**Diagnosis:**
```sql
-- Check if user exists
SELECT * FROM users WHERE email = 'user@example.com';

-- Check auth.users table (Supabase Auth)
-- Supabase Dashboard → Authentication → Users
```

**Fix:**
- Reset password via Firebase Auth console
- Or manually reset in Supabase Auth

#### Issue 2: Balance Mismatch

**Symptoms:** User reports balance doesn't match transaction history

**Diagnosis:**
```sql
-- Calculate actual balance from ledger
SELECT 
    a.user_id,
    a.currency,
    SUM(CASE WHEN le.entry_type = 'CREDIT' THEN le.amount ELSE -le.amount END) as calculated_balance,
    up.balance as displayed_balance
FROM accounts a
LEFT JOIN ledger_entries le ON a.id = le.account_id
JOIN user_profiles up ON a.user_id = up.user_id
WHERE a.user_id = 'user_uuid'
GROUP BY a.user_id, a.currency, up.balance;
```

**Fix:**
```sql
-- Recalculate and update balance
UPDATE user_profiles up
SET balance = (
    SELECT SUM(CASE WHEN le.entry_type = 'CREDIT' THEN le.amount ELSE -le.amount END)
    FROM ledger_entries le
    JOIN accounts a ON le.account_id = a.id
    WHERE a.user_id = up.user_id AND a.currency = 'AKD'
)
WHERE user_id = 'user_uuid';
```

#### Issue 3: Slow Transaction Processing

**Symptoms:** Transactions take >5 seconds

**Diagnosis:**
```sql
-- Check database performance
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check slow queries
-- Supabase Dashboard → Logs → Performance Insights
```

**Fix:**
- Add missing indexes
- Vacuum database (Supabase does this automatically)
- Upgrade to larger Supabase plan if needed

---

## 🔐 Security Maintenance

### Monthly Security Checks:

```bash
# 1. Review access logs
# Supabase Dashboard → Logs → Filter by "auth"

# 2. Check for suspended users
SELECT COUNT(*) FROM users WHERE status = 'SUSPENDED';

# 3. Review high-value transactions
SELECT * FROM transactions 
WHERE amount > 1000 
AND created_at > NOW() - INTERVAL '30 days'
ORDER BY amount DESC;

# 4. Update dependencies
cd pethar-wallet
flutter pub outdated
flutter pub upgrade

# 5. Check Firebase Auth security settings
# Firebase Console → Authentication → Settings
# - Password policy: Enforce strong passwords
# - Email enumeration protection: Enabled
```

### Quarterly Security Audit:

- [ ] Test RLS policies (user isolation)
- [ ] Review admin access logs
- [ ] Rotate signing keys (if compromised)
- [ ] Update SSL certificates (auto-renewed by Vercel/Cloudflare)
- [ ] Penetration testing (optional, hire external)

---

## 💰 Treasury & Reserve Management

### Daily Reserve Check:

```sql
-- Total AKD in circulation
SELECT SUM(balance) as total_akd_circulating FROM user_profiles;

-- Should match 1:1 with your USDT/USDC holdings
-- Check wallet balances on:
-- - Tron Network (USDT): tronscan.org
-- - Ethereum Network (USDC): etherscan.io
```

### Monthly Proof of Reserves:

```markdown
# Péthar Reserve Report - October 2026

## Assets:
- USDT (Tron): 5,234.56
- USDC (Ethereum): 2,100.00
- Cash (Bank): $1,500.00
**Total Assets: $8,834.56**

## Liabilities:
- AKD in circulation: ₳8,500.00
**Total Liabilities: ₳8,500.00**

## Reserve Ratio: 103.94%
✅ Fully backed with surplus

Published: https://pethar.co.uk/reserves/2026-10
```

---

## 📈 Scaling Checklist

### When You Reach 1,000 Users:

- [ ] Upgrade Supabase to Team plan ($599/month)
- [ ] Enable connection pooling (Supabase Pooler)
- [ ] Set up monitoring alerts (Supabase Alerts)
- [ ] Hire part-time customer support (4 hours/day)
- [ ] Build automated fraud detection rules

### When You Reach 10,000 Users:

- [ ] Dedicated admin team (2-3 people)
- [ ] 24/7 monitoring & on-call rotation
- [ ] Load balancer for Edge Functions
- [ ] Regional database replicas (if serving global users)
- [ ] Formal AML/KYC compliance officer

### When You Reach 100,000 Users:

- [ ] Apply for full EMI license (UK FCA)
- [ ] Migrate to dedicated infrastructure
- [ ] Build mobile app v2 with native code
- [ ] Submit to Google Play Store (now have revenue for $25 fee)
- [ ] Hire full engineering team

---

## 🔧 Developer Handoff

### If You Need to Onboard Another Developer:

**Share these files:**
```
1. QUICKSTART.md - Getting started
2. docs/IMPLEMENTATION_ROADMAP.md - Overall plan
3. docs/admin-dashboard-setup.md - Admin features
4. docs/MAINTENANCE_GUIDE.md - This file
5. .env.example - Environment variables (they create their own .env)
```

**Grant Access:**
- [ ] Supabase project (read-only first)
- [ ] Firebase console (read-only first)
- [ ] GitHub repository
- [ ] Vercel/hosting dashboard
- [ ] Domain registrar (read-only)

**Knowledge Transfer:**
```bash
# 1. Clone repo
git clone https://github.com/realjackhalder/pethar.git

# 2. Install dependencies
cd pethar-wallet
flutter pub get
npm install

# 3. Set up environment
cp .env.example .env
# Fill in actual values

# 4. Run locally
flutter run
```

---

## 📞 Emergency Contacts

### Critical Issues (Respond within 1 hour):

- **Database down:** Check Supabase status page
- **Mass transaction failures:** Check Edge Function logs
- **Security breach:** Immediately disable service_role API key

### Support Channels:

- **User support:** support@pethar.co.uk
- **Telegram:** @PetharSupport
- **Admin emergency:** (Your personal phone)

### Escalation Path:

1. **Level 1:** Check this guide + Supabase docs
2. **Level 2:** Supabase community Discord
3. **Level 3:** Supabase support ticket (Pro plan includes email support)
4. **Level 4:** Hire emergency consultant (Upwork/Fiverr)

---

## ✅ Monthly Checklist

**First Week of Month:**
- [ ] Review previous month's metrics
- [ ] Generate reserve proof report
- [ ] Backup database manually
- [ ] Check dependency updates
- [ ] Review pending approvals (should be none)
- [ ] Update documentation if features changed

**Budget Review:**
- [ ] Supabase bill
- [ ] Vercel bill
- [ ] Domain renewal
- [ ] S3 storage costs
- [ ] Support tools (if any)

**Compliance:**
- [ ] KYC approval queue cleared
- [ ] High-value transactions reviewed
- [ ] No suspended users without reason

---

## 🎓 Continuous Learning

### Stay Updated:

- **Supabase Blog:** supabase.com/blog
- **Flutter Updates:** flutter.dev/docs/release/breaking-changes
- **Security News:** crypto.com/security, coindesk.com

### Recommended Courses (When You Have Time):

- Financial app security (Udemy)
- PostgreSQL performance tuning
- Mobile app scaling patterns
- AML/KYC compliance (for fintech)

---

**Remember:** Start small, monitor daily, scale gradually. You're building this for the Arakanese community—focus on reliability and trust over features. 🚀
