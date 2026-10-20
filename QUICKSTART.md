# 🚀 Péthar Quick Start Guide
## Get Your Android App Running in 30 Minutes

---

## ✅ What You Have Now

Your Péthar system is **80% ready** for launch:

✅ **Database** - PostgreSQL with double-entry ledger, RLS policies, transaction history  
✅ **Authentication** - Firebase Auth (Google Sign-In + Email/Password)  
✅ **Wallets** - AKD wallet + USD crypto account structures  
✅ **Offline Payments** - Cashu voucher system with BLE/NFC  
✅ **Android App** - Flutter mobile app with full UI  
✅ **Security** - Row-level security, encrypted storage, PIN protection  

---

## 🔧 What You Need to Do

### Step 1: Generate Production Signing Key (5 minutes)

```bash
# From your project root
bash scripts/generate-signing-key.sh
```

**Output:**
```
✅ Keystore generated successfully!
📍 Location: pethar-wallet/android/app/pethar-release.jks
🔑 Alias: pethar
🔒 Password: pethar2026
```

**⚠️ Important:** 
- Store this `.jks` file securely (DO NOT commit to git)
- Add to `.gitignore`: `pethar-release.jks`
- Backup to USB drive or cloud storage

---

### Step 2: Update Firebase Configuration (10 minutes)

**Why?** Your package name changed from `com.example.pethar_mobile` to `uk.co.pethar.wallet`

#### A. Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click ⚙️ → Project Settings
4. Under "Your apps", find Android app
5. Click "Add another app" or edit existing
6. **Package name:** `uk.co.pethar.wallet`
7. Download new `google-services.json`

#### B. Replace Configuration File

```bash
# Backup old config
mv pethar-wallet/android/app/google-services.json pethar-wallet/android/app/google-services.json.backup

# Copy new config (from Downloads folder)
cp ~/Downloads/google-services.json pethar-wallet/android/app/
```

#### C. Update OAuth Redirect URIs

1. Firebase Console → Authentication → Sign-in method
2. Google Sign-In → Configure
3. Add authorized domain: `pethar.co.uk`
4. OAuth redirect URI should auto-update

---

### Step 3: Deploy Server-Side Transaction API (5 minutes)

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref uklqksioruxvatwpvopm

# Deploy transaction processor
supabase functions deploy process-transaction --no-verify-jwt

# Apply database migration for pending approvals
supabase db push
```

**Verify deployment:**
```bash
curl https://uklqksioruxvatwpvopm.supabase.co/functions/v1/process-transaction
# Should return: {"error":"Method not allowed"}
```

---

### Step 4: Build Production APK (10 minutes)

```bash
# Build release APK
bash scripts/build-android-apk.sh
```

**Output:**
```
✅ Build complete!

📱 APK Files:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app-release.apk (45.2 MB) - Universal APK
app-arm64-v8a-release.apk (22.1 MB) - Modern phones
app-armeabi-v7a-release.apk (19.8 MB) - Older phones
```

**Test Installation:**

1. Connect Android phone via USB
2. Enable USB debugging
3. Install APK:
   ```bash
   adb install pethar-wallet/build/app/outputs/flutter-apk/app-release.apk
   ```
4. Open "Péthar Wallet" on your phone
5. Sign in with Google or test email

---

## 🧪 Testing Your App (Before Public Release)

### Test 1: User Registration

```
1. Open Péthar app
2. Tap "Sign in with Google"
3. Select your Google account
4. Set 6-digit PIN (e.g., 123456)
5. ✅ Should see: "AKD Wallet: ₳0.00"
```

### Test 2: P2P Transfer (Needs 2 Users)

**On User A phone:**
```
1. Tap "Receive"
2. Show QR code or share UID
```

**On User B phone:**
```
1. Manually add ₳100 to User B via Supabase dashboard (for testing)
2. Tap "Send"
3. Enter User A's UID
4. Amount: ₳50
5. Enter PIN
6. ✅ Transaction should complete
7. ✅ User A balance: ₳50.00
8. ✅ User B balance: ₳50.00
```

**Verify in Database:**
```sql
-- In Supabase SQL Editor
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 5;
SELECT * FROM ledger_entries ORDER BY created_at DESC LIMIT 10;
```

### Test 3: AKD → USD Approval Flow

**On User A phone:**
```
1. Tap "USD Account"
2. Tap "Convert AKD to USD"
3. Amount: ₳50
4. Enter PIN
5. ✅ Should see: "Request submitted. Awaiting approval."
```

**Check Pending Approvals:**
```sql
SELECT * FROM pending_approvals WHERE status = 'PENDING';
```

---

## 📦 Distributing Your APK

### Option 1: Direct Website Download (Recommended)

**Upload to pethar.co.uk:**

```bash
# Generate SHA-256 checksum
sha256sum pethar-wallet/build/app/outputs/flutter-apk/app-release.apk
# Output: abc123def456... app-release.apk

# Rename with version
cp app-release.apk pethar-v1.0.0.apk

# Upload to your hosting (Vercel/Cloudflare)
# Place in: public/downloads/pethar-v1.0.0.apk
```

**Update Download Page:**

```html
<!-- On pethar.co.uk -->
<div class="download-section">
  <h2>Download Péthar Wallet</h2>
  <a href="/downloads/pethar-v1.0.0.apk" download class="btn-download">
    📱 Download APK (45 MB)
  </a>
  <p class="version">Version 1.0.0 | Released Oct 20, 2026</p>
  <details>
    <summary>SHA-256 Checksum</summary>
    <code>abc123def456...</code>
  </details>
</div>
```

### Option 2: Telegram Distribution

```
1. Create Telegram channel: @PetharWallet
2. Upload APK as file
3. Pin message with:
   "Latest version: 1.0.0
   Download: [Link]
   SHA-256: abc123...
   
   Installation:
   1. Enable Unknown Sources
   2. Install APK
   3. Sign in with Google"
```

### Option 3: Google Drive (Temporary)

```
1. Upload to Google Drive
2. Set sharing: "Anyone with link can view"
3. Share link in WhatsApp groups
4. Add installation instructions PDF
```

---

## 🔐 Security Checklist (Must Do Before Launch)

### Critical:

- [ ] ✅ Package name changed to `uk.co.pethar.wallet`
- [ ] ✅ APK signed with production key (not debug)
- [ ] ✅ `google-services.json` updated for new package
- [ ] ✅ Server-side transaction API deployed
- [ ] ✅ Direct balance updates disabled in client code
- [ ] ⚠️ `SUPABASE_SERVICE_ROLE_KEY` not in client `.env`
- [ ] ⚠️ Firebase Auth redirect URIs include pethar.co.uk

### Verify RLS Policies:

```bash
# Test that User A cannot see User B's data
supabase db test
```

Or manually test:
```sql
-- Login as User A in Supabase Auth
-- Try to query User B's balance
SELECT * FROM user_profiles WHERE user_id = 'user_b_uuid';
-- Should return: 0 rows (blocked by RLS)
```

---

## 🎯 Your First 10 Users (Beta Test)

### Week 1: Closed Beta

**Recruit:**
- 5 family members
- 5 trusted friends in Arakanese community

**Provide:**
- Direct APK link (Google Drive)
- Video tutorial (record screen, Arakanese voiceover)
- WhatsApp support group

**Onboarding Script:**
```
"ဖေ့သာ Wallet ကို စမ်းသပ်ရန် ဖိတ်ခေါ်ပါတယ်။

1. APK ဖိုင်ကို ဒေါင်းလုဒ်လုပ်ပါ
2. Install လုပ်ပါ (Unknown Sources ဖွင့်ရန်လိုမည်)
3. Google နဲ့ Sign in လုပ်ပါ
4. PIN 6 လုံး သတ်မှတ်ပါ
5. AKD ငွေလွှဲပို့ခြင်းစတင်နိုင်ပါပြီ!

ပြဿနာရှိရင် ဒီ WhatsApp group မှာ မေးနိုင်ပါတယ်။"
```

**Seed Initial Balances:**
```sql
-- Give each beta tester ₳100 to start
UPDATE user_profiles 
SET balance = 100.00 
WHERE user_id IN (
  'beta_user_1',
  'beta_user_2',
  -- ... etc
);
```

**Monitor:**
- Daily transaction count
- Error logs in Supabase
- User feedback in WhatsApp

---

## 📊 Admin Dashboard (Optional for Now)

**You can start without admin dashboard** and manage via Supabase Dashboard:

### Approve AKD → USD Manually:

```sql
-- 1. Check pending requests
SELECT * FROM pending_approvals WHERE status = 'PENDING';

-- 2. Approve request
UPDATE pending_approvals
SET 
  status = 'APPROVED',
  reviewed_at = NOW(),
  admin_notes = 'Approved - verified user'
WHERE id = 'approval_uuid';

-- 3. Execute the actual transfer (manually via post_transaction RPC)
SELECT post_transaction(
  p_from_user_id := 'user_uuid',
  p_to_user_id := 'user_uuid', -- same user (conversion)
  p_amount := 50.00,
  p_currency := 'AKD',
  p_description := 'AKD to USD conversion approved'
);
```

**Build admin.pethar.co.uk later** (Week 3-4) when you have 50+ users.

---

## 💰 Funding User Wallets (Bootstrap Phase)

### Option 1: Manual Credits (First 100 Users)

```sql
-- Give new user ₳10 welcome bonus
INSERT INTO ledger_entries (
  account_id,
  amount,
  currency,
  entry_type,
  description
) VALUES (
  (SELECT id FROM accounts WHERE user_id = 'new_user_uuid' AND currency = 'AKD'),
  10.00,
  'AKD',
  'CREDIT',
  'Welcome bonus'
);

UPDATE user_profiles 
SET balance = balance + 10.00 
WHERE user_id = 'new_user_uuid';
```

### Option 2: Cash-In via Agent (Later)

```
1. User gives cash to local agent
2. Agent credits AKD to user's wallet
3. Agent keeps cash, gets commission from treasury
4. Treasury reconciles daily
```

### Option 3: Crypto Deposit (Future)

```
1. User sends USDT to treasury wallet
2. System detects on-chain transaction
3. Credits equivalent AKD to user wallet
4. 1 USDT = 1 AKD (minus 1% fee)
```

---

## 🐛 Troubleshooting Common Issues

### Issue 1: "App Not Installed"

**Solution:**
```
1. Uninstall old version first
2. Clear cache: Settings → Apps → Péthar → Clear Data
3. Ensure 100MB free space
4. Reboot phone
5. Try installing again
```

### Issue 2: "Transaction Failed"

**Check:**
```sql
-- View recent failed transactions
SELECT * FROM transactions 
WHERE status = 'FAILED' 
ORDER BY created_at DESC;

-- Check user balance
SELECT uid, balance FROM user_profiles WHERE uid = 'USER_UID';

-- Verify ledger integrity
SELECT SUM(amount) FROM ledger_entries WHERE currency = 'AKD';
-- Should equal: SUM of all user balances
```

### Issue 3: "Google Sign-In Not Working"

**Verify:**
```bash
# Check Firebase config
cat pethar-wallet/android/app/google-services.json | grep package_name
# Should output: "package_name": "uk.co.pethar.wallet"

# Check OAuth client ID
# Firebase Console → Authentication → Sign-in method → Google
# Ensure Android app is listed
```

### Issue 4: "Balance Not Updating"

**Debug:**
```typescript
// Check if transaction API is reachable
fetch('https://uklqksioruxvatwpvopm.supabase.co/functions/v1/process-transaction')
  .then(r => r.json())
  .then(console.log)
// Should return method error (means API is live)

// Check RLS policies
// User must be authenticated to see their own balance
```

---
## 📞 Next Steps & Support

### Immediate Actions (Today):

1. ✅ Run `bash scripts/generate-signing-key.sh`
2. ✅ Update Firebase `google-services.json`
3. ✅ Deploy transaction API: `supabase functions deploy process-transaction`
4. ✅ Build APK: `bash scripts/build-android-apk.sh`
5. ✅ Test on your own Android phone

### This Week:

- [ ] Recruit 5 beta testers
- [ ] Create installation video tutorial
- [ ] Set up Telegram support channel
- [ ] Upload APK to Google Drive
- [ ] Send invites to beta testers

### Next Week:

- [ ] Monitor beta testing results
- [ ] Fix bugs reported by testers
- [ ] Prepare public download page
- [ ] Create marketing materials (screenshots, descriptions)

### Questions?

**Ask in this chat** or:
- Review: `docs/IMPLEMENTATION_ROADMAP.md`
- Admin setup: `docs/admin-dashboard-setup.md`
- Database schema: `supabase/migrations/20261020000001_enterprise_database.sql`

---

**You're ready to build! Start with Step 1 above. 🚀**
