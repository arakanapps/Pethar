# Péthar Implementation Roadmap
## For Arakanese Community - Direct APK Distribution

---

## 🎯 Your Vision (Confirmed)

### What Works Now:
- ✅ **Android app structure** (Flutter-based)
- ✅ **Database schema** (Supabase PostgreSQL with RLS)
- ✅ **AKD Wallet** - P2P transfers between users
- ✅ **USD Account** - Crypto wallet structure (USDT/USDC)
- ✅ **Double-entry ledger** (`post_transaction` RPC)
- ✅ **Offline payment infrastructure** (Cashu vouchers)

### What Needs Implementation:
- 🔧 **Server-side transaction API** (prevent client manipulation)
- 🔧 **AKD → USD approval workflow**
- 🔧 **Admin dashboard** (admin.pethar.co.uk)
- 🔧 **Customer support chat** (chat.pethar.co.uk)
- 🔧 **KYC document upload** (basic tier 1 & tier 2)

### Not Needed Yet:
- ⏳ Bill payments
- ⏳ Mobile top-up
- ⏳ POS terminals
- ⏳ iOS web version (m.pethar.co.uk)

---

## 📅 Implementation Timeline

### Week 1: Android App Production Setup

**Day 1-2: Package & Signing**
```bash
# 1. Generate signing key
bash scripts/generate-signing-key.sh

# 2. Update AndroidManifest.xml package name
# From: com.example.pethar_mobile
# To: uk.co.pethar.wallet

# 3. Test build
bash scripts/build-android-apk.sh
```

**Day 3-4: Client Code Security Fixes**
- Remove direct balance updates from client
- Replace with server-side API calls
- Test P2P transfers with new API

**Day 5-7: Testing**
- Install APK on 3-5 real Android devices
- Test offline payments (BLE/NFC)
- Verify Firebase Auth works with new package ID

---

### Week 2: Server-Side APIs & Security

**Deploy Edge Functions:**
```bash
cd supabase

# Deploy transaction processor
supabase functions deploy process-transaction

# Deploy KYC handler (to be created)
supabase functions deploy kyc-upload

# Test endpoint
curl -X POST https://uklqksioruxvatwpvopm.supabase.co/functions/v1/process-transaction \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to_user_id":"recipient_uid","amount":100,"currency":"AKD","transaction_type":"P2P"}'
```

**Run Database Migration:**
```bash
# Apply pending_approvals table
supabase db push

# Verify
supabase db diff
```

---

### Week 3: Admin Dashboard (Basic)

**Create admin.pethar.co.uk:**
```bash
mkdir -p apps/admin
cd apps/admin
npx create-next-app@latest . --typescript --tailwind --app

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install recharts lucide-react date-fns
```

**Core Admin Features:**
1. **Login page** (admin@pethar.co.uk)
2. **Pending approvals queue**
   - AKD → USD requests
   - KYC tier upgrades
3. **User search** (by UID, email, phone)
4. **Transaction monitoring** (last 100 transactions, real-time)
5. **Quick actions**:
   - Approve/Reject conversion
   - Suspend/Unsuspend user
   - Update KYC tier

**Deploy:**
```bash
# Push to Vercel
vercel --prod

# Set environment variables in Vercel dashboard:
SUPABASE_URL=https://uklqksioruxvatwpvopm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Configure DNS
admin.pethar.co.uk → CNAME → your-admin-app.vercel.app
```

---

### Week 4: Customer Support Chat (AI + Human)

**Option A: Crisp Chat (Recommended - Free tier available)**
```html
<!-- Add to pethar-wallet/public/index.html -->
<script type="text/javascript">
  window.$crisp=[];
  window.CRISP_WEBSITE_ID="YOUR_CRISP_ID";
  (function(){
    d=document;s=d.createElement("script");
    s.src="https://client.crisp.chat/l.js";
    s.async=1;d.getElementsByTagName("head")[0].appendChild(s);
  })();
</script>
```

**Option B: Custom chat.pethar.co.uk with AI**
- Use OpenAI API for automated responses
- Escalate to human for complex issues
- Store chat history in Supabase

**Common Questions Database:**
```sql
CREATE TABLE support_faqs (
    id UUID PRIMARY KEY,
    question_en TEXT,
    question_rk TEXT, -- Arakanese/Rohingya
    answer_en TEXT,
    answer_rk TEXT,
    category VARCHAR(50),
    keywords TEXT[]
);

INSERT INTO support_faqs VALUES
('...', 
 'How do I transfer AKD to another user?',
 'AKD ကို အခြားသုံးစွဲသူသို့ မည်သို့လွှဲပြောင်းမည်နည်း',
 'Tap Send, enter recipient UID or scan QR code, enter amount, confirm with PIN.',
 'ပို့ပါ ခလုတ်ကို နှိပ်ပြီး လက်ခံသူ UID ထည့်ပါ သို့မဟုတ် QR ကုဒ် scan လုပ်ပါ...',
 'TRANSFERS',
 ARRAY['transfer', 'send', 'money', 'akd', 'လွှဲ', 'ပို့']);
```

---

## 🚀 Deployment Strategy

### Phase 1: Closed Beta (50 users)

**Week 5-6:**
1. Recruit 50 trusted Arakanese community members
2. Distribute APK via Google Drive + Telegram
3. Onboard users with video tutorial (Arakanese voiceover)
4. Monitor transactions daily
5. Collect feedback via WhatsApp group

**Success Criteria:**
- [ ] 500+ P2P transactions completed
- [ ] Zero balance manipulation incidents
- [ ] <5% transaction failures
- [ ] Average transaction time <3 seconds

---

### Phase 2: Public Launch (pethar.co.uk live)

**Week 7-8:**

**Update pethar.co.uk landing page:**
```typescript
// Add download section
<section className="bg-gradient-to-br from-[#F6F1E8] to-[#F0E3D0] py-20">
  <div className="max-w-4xl mx-auto text-center px-6">
    <h2 className="text-4xl font-bold mb-4">Download Péthar Wallet</h2>
    <p className="text-xl text-[#8A8A80] mb-8">
      Direct APK for Android devices. No Google Play required.
    </p>
    
    <a 
      href="/downloads/pethar-latest.apk"
      download
      className="inline-flex items-center gap-3 bg-[#C8853F] hover:bg-[#A86B2C] text-white px-8 py-4 rounded-lg text-lg font-semibold transition"
    >
      <Download size={24} />
      Download APK (45 MB)
    </a>
    
    <div className="mt-6 text-sm text-[#8A8A80]">
      <p>Version 1.0.0</p>
      <p>SHA-256: <code className="font-mono text-xs">abc123...</code></p>
    </div>
  </div>
</section>
```

**Installation guide:**
```markdown
# How to Install Péthar on Android

1. Download `pethar-latest.apk` from pethar.co.uk
2. Open the downloaded file
3. If prompted, enable "Install from Unknown Sources"
   - Settings → Security → Unknown Sources → Enable
4. Tap "Install"
5. Open Péthar and sign in with Google or email

## Troubleshooting

**"App not installed" error:**
- Uninstall old version first
- Ensure 100MB free storage
- Try rebooting device

**"Blocked by Play Protect":**
- Tap "Install anyway"
- This is normal for directly distributed APKs
```

---

## 💰 Operational Costs (Bootstrap Budget)

```
Monthly Costs (First 1,000 users):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Supabase Pro (8GB DB)                  $25
Vercel Pro (hosting)                   $20
Tigris S3 (KYC storage, ~5GB)          <$1
Crisp Chat (support)                   $0 (free tier)
Domain (pethar.co.uk)                  $15/year
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: ~$50/month
```

**No upfront costs for:**
- Google Play Store ($25 one-time) ❌ Not needed
- Apple Developer ($99/year) ❌ Not needed
- VPS hosting ❌ Using managed services

---

## 🔐 Security Checklist (Before Public Launch)

### Critical (Must Fix):
- [ ] Remove `SUPABASE_SERVICE_ROLE_KEY` from client code
- [ ] All transactions go through server-side API
- [ ] RLS policies tested (user A cannot access user B data)
- [ ] Firebase Auth working with new package ID
- [ ] APK signed with production key (not debug)

### Important (Fix Soon):
- [ ] Rate limiting on transaction API (max 10/minute per user)
- [ ] KYC document storage encrypted (S3 bucket private)
- [ ] Admin dashboard protected (password + 2FA)
- [ ] Error tracking enabled (Sentry free tier)

### Nice to Have (Can Wait):
- [ ] Automated daily database backups
- [ ] Transaction monitoring alerts (>$500 transfers)
- [ ] User analytics (Google Analytics 4)

---

## 📱 User Onboarding Flow

### First-Time User Journey:

1. **Download APK** from pethar.co.uk
2. **Install & Open** Péthar
3. **Sign Up** (Google or Email)
4. **Set 6-digit PIN** for transactions
5. **See Welcome Screen:**
   - "Your AKD Wallet: ₳0.00"
   - "Your USD Account: $0.00"
6. **First Action Options:**
   - 👤 Receive money (show QR code)
   - 💰 Request money from friend
   - 📖 Watch tutorial video

### Tier 1 User (Default):
- **Limits:** ₳500/day, ₳2,000/month
- **Requirements:** Email + Phone verified
- **Can do:**
  - Send/receive AKD
  - Create USD crypto wallet
  - USD → AKD instant conversion
  - Offline payments

### Tier 2 User (KYC Verified):
- **Limits:** ₳10,000/day, unlimited monthly
- **Requirements:** National ID + Selfie + Address proof
- **Additional features:**
  - AKD → USD conversion (with approval)
  - Higher transaction velocity
  - Priority support

---

## 🌍 Geographic Distribution Plan

**Primary Markets:**
1. **Arakan/Arakanese State** - Base community
2. **Myanmar mainland** - Yangon, Mandalay
3. **Bangladesh** - 
4. **Malaysia** - Arakanese diaspora
5. **Thailand** - Migrant workers
6. **Middle East** - UAE, Saudi Arabia workers

**Distribution Channels:**
- Telegram groups (Arakanese community)
- Facebook pages (Arakan news & culture)
- WhatsApp status shares
- Word of mouth (family remittances)

**Localization:**
- ✅ English (primary)
- ✅ Arakanese 
---

## 📊 Success Metrics (First 3 Months)

**User Growth:**
- Month 1: 50 users (closed beta)
- Month 2: 500 users (soft launch)
- Month 3: 2,000+ users (public)

**Transaction Volume:**
- Target: 100 transactions/day by Month 3
- Average transaction size: ₳50-200
- Total value: ₳5,000-20,000/day

**Engagement:**
- Daily active users: 30%
- Weekly active users: 60%
- Monthly retention: 70%

**Support:**
- Average response time: <2 hours
- Resolution rate: 90%
- User satisfaction: 4.5/5 stars

---

## 🆘 Emergency Contacts & Support

**For Users:**
- Email: support@pethar.co.uk
- Telegram: @PetharSupport
- In-app chat (chat.pethar.co.uk)

**For Admins:**
- Emergency hotline: (Your phone number)
- Admin dashboard: admin.pethar.co.uk
- Database access: Supabase dashboard

**Incident Response:**
1. Suspicious transactions → Freeze account immediately
2. User lockout → Manual unlock via admin dashboard
3. Server downtime → Check Supabase status page
4. Balance mismatch → Review ledger_entries for double-entry integrity

---

## Next Immediate Actions:

1. **Run signing key generation:** `bash scripts/generate-signing-key.sh`
2. **Test APK build:** `bash scripts/build-android-apk.sh`
3. **Deploy transaction API:** `supabase functions deploy process-transaction`
4. **Create first admin user** in Supabase dashboard
5. **Test end-to-end flow** on real Android device

**Questions?** Review this roadmap and let me know which step you want to tackle first!
