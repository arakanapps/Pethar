# 🚀 Péthar Free Tier Quick Start
## Get Your App Running in 30 Minutes (No Costs)

---

## ✅ What You're Building

**Simple & Secure Money Transfer App:**
- ✅ Google Sign-In → Create PIN → Enable Biometric (optional)
- ✅ Transfer money to other Péthar users (online only)
- ✅ Bank-level security (PIN + biometric)
- ✅ **100% FREE** (Supabase free tier + Vercel free tier)
- ✅ No app store needed (direct APK distribution)

**What's NOT included (for simplicity):**
- ❌ Offline payments (removed for now)
- ❌ Bill payments (not ready)
- ❌ Top-up (not ready)
- ❌ Admin dashboard (build later when you have users)

---

## 💰 Free Tier Limits

### Supabase Free:
- ✅ 500MB database (enough for 10,000+ users)
- ✅ 50,000 monthly active users
- ✅ 2GB file storage
- ✅ 1GB bandwidth/month
- ⚠️ Database pauses after 1 week of inactivity (just visit it to wake up)

### Vercel Free:
- ✅ 100GB bandwidth/month
- ✅ Unlimited websites
- ✅ Auto-SSL certificates
- ✅ Global CDN

**Total Cost: $0/month** ✅

---

## 🔧 Step-by-Step Setup

### Step 1: Generate Signing Key (5 min)

```bash
bash scripts/generate-signing-key.sh
```

**Output:**
```
✅ Keystore generated successfully!
📍 Location: pethar-wallet/android/app/pethar-release.jks
```

**⚠️ IMPORTANT:** 
- Backup this file! If you lose it, you can't update your app later.
- Add to `.gitignore`: `*.jks`

---

### Step 2: Update Firebase Config (10 min)

#### A. Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create new one - it's FREE)
3. Click ⚙️ → Project Settings → Add app → Android
4. **Package name:** `uk.co.pethar.wallet`
5. **App nickname:** Péthar Wallet
6. Click "Register app"
7. Download `google-services.json`

#### B. Replace Config File:

```bash
# Backup old config
mv pethar-wallet/android/app/google-services.json pethar-wallet/android/app/google-services.json.backup

# Copy new config
cp ~/Downloads/google-services.json pethar-wallet/android/app/
```

#### C. Enable Google Sign-In:

1. Firebase Console → Authentication → Get Started
2. Click "Sign-in method" tab
3. Click "Google" → Enable → Save
4. That's it! (No need to configure OAuth redirect for now)

---

### Step 3: Update Database Schema (5 min)

Add PIN security fields to your database:

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref uklqksioruxvatwpvopm

# Apply migrations
supabase db push
```

This adds:
- `pin_hash` - Encrypted PIN storage
- `pin_attempts` - Failed login counter
- `pin_locked_until` - Account lock timestamp
- `biometric_enabled` - Biometric login flag
- `pending_approvals` - Table for AKD→USD approval queue

---

### Step 4: Deploy Transaction API (5 min)

```bash
# Deploy secure transaction processor
supabase functions deploy process-transaction
```

**Verify it's working:**
```bash
curl https://uklqksioruxvatwpvopm.supabase.co/functions/v1/process-transaction
# Should return: {"error":"Method not allowed"}
# This means the API is live!
```

---

### Step 5: Install Flutter Dependencies (3 min)

```bash
cd pethar-wallet

# Add biometric + secure storage packages
flutter pub add local_auth flutter_secure_storage

# Get all dependencies
flutter pub get
```

---

### Step 6: Build Production APK (5 min)

```bash
# From project root
bash scripts/build-android-apk.sh
```

**Output:**
```
✅ Build complete!

📱 Universal APK (45 MB):
pethar-wallet/build/app/outputs/flutter-apk/app-release.apk
```

---

### Step 7: Test on Your Phone (5 min)

#### Option A: Install via USB

```bash
# Connect phone via USB
# Enable USB debugging on phone

adb install pethar-wallet/build/app/outputs/flutter-apk/app-release.apk
```

#### Option B: Transfer APK to Phone

1. Copy `app-release.apk` to Google Drive
2. Download on your phone
3. Open the file
4. Tap "Install" (enable Unknown Sources if prompted)

---

## 🧪 Testing Your App

### Test 1: Sign Up Flow

```
1. Open Péthar app
2. Tap "Sign in with Google"
3. Select your Google account
4. ✅ Should show: "Create Your PIN"
5. Enter 6 digits (e.g., 123456)
6. Confirm PIN (enter again)
7. Dialog: "Enable Biometric Login?" → Tap "Enable"
8. Use fingerprint/face to authorize
9. ✅ Should see Dashboard:
   - AKD Wallet: ₳0.00
   - Transfer button
   - Receive button
```

### Test 2: Receive Money (Manual)

Since you don't have 2 users yet, add balance manually:

```sql
-- In Supabase SQL Editor

-- 1. Find your user ID
SELECT user_id, email, uid FROM user_profiles;

-- 2. Add ₳100 test balance
UPDATE user_profiles 
SET balance = 100.00 
WHERE user_id = 'YOUR_USER_ID_HERE';

-- 3. Create ledger entry (for accounting)
INSERT INTO ledger_entries (
    account_id,
    amount,
    currency,
    entry_type,
    description
) 
SELECT 
    id,
    100.00,
    'AKD',
    'CREDIT',
    'Test balance'
FROM accounts 
WHERE user_id = 'YOUR_USER_ID_HERE' 
AND currency = 'AKD';
```

Now refresh your app - balance should show ₳100.00

### Test 3: Transfer Money (Needs 2 Users)

**On Phone 1 (Sender):**
```
1. Tap "Transfer"
2. Enter recipient UID (from Phone 2)
3. Amount: ₳50
4. Tap "Confirm"
5. Use biometric or enter PIN
6. ✅ Should see: "Transfer successful!"
7. Balance: ₳50.00 (was ₳100)
```

**On Phone 2 (Receiver):**
```
1. Pull to refresh
2. ✅ Balance: ₳50.00 (was ₳0)
3. Check transaction history
4. See: "Received ₳50 from [Sender Name]"
```

---

## 🔐 Security Features Working

### PIN Security:
- ✅ PIN stored as SHA-256 hash (not plain text)
- ✅ 5 failed attempts → Account locked 30 minutes
- ✅ Server-side validation (client can't bypass)
- ✅ All transactions require PIN

### Biometric Security:
- ✅ Uses device secure hardware (Keystore/Secure Enclave)
- ✅ Fallback to PIN if biometric fails
- ✅ Can be disabled in settings

### Transaction Security:
- ✅ Server-side balance checks (prevent overdraft)
- ✅ Double-entry ledger (money can't be created)
- ✅ All transactions logged and auditable
- ✅ No service_role key in client code

---

## 🎯 What You Can Do Now

### ✅ Working Features:
1. **User registration** - Google Sign-In
2. **PIN creation** - 6-digit secure PIN
3. **Biometric login** - Fingerprint/Face ID
4. **Transfer money** - To other Péthar users (online)
5. **Receive money** - Show QR code or share UID
6. **Transaction history** - See all transfers
7. **Balance tracking** - Real-time AKD wallet

### ⏳ Coming Later (When You Have Users):
- Admin dashboard (admin.pethar.co.uk)
- AKD → USD conversion approval
- KYC document upload
- Customer support chat
- Bill payments
- Mobile top-up

---

## 📱 Getting Your First 10 Users

### Week 1: Friends & Family (5 users)

```
1. Install APK on 5 phones (friends/family)
2. Create WhatsApp group "Péthar Beta Test"
3. Give each user ₳100 test balance (via SQL)
4. Ask them to:
   - Transfer money to each other
   - Try biometric login
   - Report any issues
```

### Week 2: Extended Testing (10 users)

```
1. Share APK via Google Drive link
2. Record 2-minute tutorial video:
   - How to install
   - How to sign up
   - How to transfer
3. Upload video to YouTube (unlisted)
4. Share link in Arakanese WhatsApp groups
```

### Manual Balance Top-Up (For Now):

Until you have real cash-in system:

```sql
-- When user sends you cash, give them AKD:

UPDATE user_profiles 
SET balance = balance + 100.00 
WHERE uid = 'USER_UID_HERE';

INSERT INTO ledger_entries (account_id, amount, currency, entry_type, description)
SELECT id, 100.00, 'AKD', 'CREDIT', 'Cash deposit via admin'
FROM accounts 
WHERE user_id = (SELECT user_id FROM user_profiles WHERE uid = 'USER_UID_HERE')
AND currency = 'AKD';
```

---

## 🆘 Troubleshooting

### Issue: "App Not Installed"

**Solution:**
```
1. Uninstall old version first
2. Settings → Apps → Péthar → Uninstall
3. Try installing again
4. If still fails: Reboot phone
```

### Issue: "Google Sign-In Failed"

**Check:**
```bash
# Verify package name in google-services.json
cat pethar-wallet/android/app/google-services.json | grep package_name
# Should show: "package_name": "uk.co.pethar.wallet"
```

**Fix:**
1. Rebuild APK after updating google-services.json
2. Uninstall old app completely
3. Install new APK

### Issue: "Transaction Failed"

**Check balance:**
```sql
SELECT uid, balance FROM user_profiles WHERE uid = 'USER_UID';
```

**Check transaction logs:**
```sql
SELECT * FROM transactions 
WHERE status = 'FAILED' 
ORDER BY created_at DESC 
LIMIT 5;
```

### Issue: "PIN Locked"

**Manual unlock:**
```sql
UPDATE user_profiles 
SET pin_attempts = 0, pin_locked_until = NULL 
WHERE uid = 'USER_UID';
```

### Issue: Database Paused (Supabase Free Tier)

**Fix:**
1. Go to Supabase Dashboard
2. Click "Resume database"
3. Or: Set up daily health check (see below)

**Prevent pausing:**
```bash
# Add to crontab (runs daily at 9am)
0 9 * * * curl https://uklqksioruxvatwpvopm.supabase.co/rest/v1/ > /dev/null 2>&1
```

---

## 📊 Monitoring Your App (Free Tools)

### Daily Checks (5 minutes):

```sql
-- 1. User count
SELECT COUNT(*) as total_users FROM users;

-- 2. Today's transactions
SELECT COUNT(*) as txn_count, SUM(amount) as volume
FROM transactions 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- 3. Active users today
SELECT COUNT(DISTINCT metadata->>'user_id') as active_users
FROM transactions
WHERE created_at > NOW() - INTERVAL '24 hours';

-- 4. Check for failed transactions
SELECT * FROM transactions 
WHERE status = 'FAILED' 
AND created_at > NOW() - INTERVAL '24 hours';
```

### Weekly Review:

```sql
-- User growth
SELECT 
    DATE(created_at) as date,
    COUNT(*) as new_users
FROM users
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at);

-- Transaction volume
SELECT 
    DATE(created_at) as date,
    COUNT(*) as transactions,
    SUM(amount) as volume_akd
FROM transactions
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at);
```

---

## 🚀 When to Upgrade to Paid Plans

### Supabase Pro ($25/month) - Upgrade When:
- ✅ You have 100+ daily active users
- ✅ Database size > 400MB
- ✅ You want database to never pause
- ✅ You need email support

### Vercel Pro ($20/month) - Upgrade When:
- ✅ Bandwidth > 80GB/month
- ✅ You want custom domains with SSL
- ✅ You need password-protected preview deployments

**For now: FREE tier is perfect for 0-500 users** ✅

---

## ✅ Success Checklist

Before sharing with users:

- [ ] APK builds successfully
- [ ] Google Sign-In works
- [ ] PIN creation works
- [ ] Biometric login works (if device supports it)
- [ ] Transfer between 2 test users works
- [ ] Balance updates in real-time
- [ ] Transaction history shows correctly
- [ ] PIN lockout works after 5 failed attempts
- [ ] Server-side API validates all transactions
- [ ] No service_role key in client code

---

## 🎓 Next Steps

### This Week:
1. ✅ Get 5 beta testers
2. ✅ Test transfers
3. ✅ Fix any bugs
4. ✅ Record tutorial video

### Next Week:
1. ✅ Get 10 more users
2. ✅ Upload APK to pethar.co.uk
3. ✅ Share in Arakanese community groups
4. ✅ Monitor daily transactions

### Month 2:
1. ✅ Build simple admin dashboard
2. ✅ Add KYC document upload
3. ✅ Implement AKD→USD approval workflow
4. ✅ Upgrade to paid plans if needed

---

## 💡 Cost Projection

```
Users:         0-500   |   500-1,000   |   1,000-5,000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Supabase:      FREE    |   $25/mo      |   $25/mo
Vercel:        FREE    |   FREE         |   $20/mo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total:         $0/mo   |   $25/mo      |   $45/mo
```

**Translation:** You can run your app for FREE until you have 500 users! 🎉

---

## 📞 Support Resources

**Official Docs:**
- Supabase: https://supabase.com/docs
- Flutter: https://flutter.dev/docs
- Firebase Auth: https://firebase.google.com/docs/auth

**Your Project Docs:**
- `docs/AUTH_SECURITY_FLOW.md` - Authentication implementation
- `QUICKSTART.md` - Original full-featured guide
- `SUMMARY.md` - Complete project overview

**Community:**
- Supabase Discord: https://discord.supabase.com
- Flutter Discord: https://discord.gg/flutter

---

**You're ready to build! Start with Step 1 above. 🚀**

**Total time: 30 minutes | Total cost: $0 | Result: Working money transfer app** ✅
