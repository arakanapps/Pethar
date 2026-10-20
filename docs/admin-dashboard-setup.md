# Péthar Admin Dashboard Setup Guide

## Overview

The admin dashboard (`admin.pethar.co.uk`) provides real-time monitoring and control for:

1. **KYC Approvals** - Review and approve user identity verification
2. **Transaction Monitoring** - Real-time fraud detection and approval workflows
3. **AKD → USD Approvals** - Manual approval for crypto conversions
4. **User Management** - Account status, limits, and support

---

## Architecture

```
┌─────────────────────────────────────┐
│   admin.pethar.co.uk (React SPA)    │
│   - Next.js + TypeScript            │
│   - Supabase Auth (Admin Role)      │
│   - Real-time subscriptions         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Supabase Backend                  │
│   - Row Level Security (RLS)        │
│   - service_role for admin queries  │
│   - Realtime subscriptions          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   PostgreSQL Database               │
│   - pending_approvals               │
│   - transactions                    │
│   - users (kyc_tier, kyc_status)    │
│   - fraud_alerts (future)           │
└─────────────────────────────────────┘
```

---

## Database Schema for Admin Operations

### Pending Approvals Table

```sql
SELECT 
    pa.id,
    pa.transaction_type,
    pa.amount,
    pa.currency,
    pa.status,
    pa.requested_at,
    u.uid,
    u.full_name,
    u.email,
    u.kyc_tier
FROM pending_approvals pa
JOIN users u ON pa.user_id = u.id
WHERE pa.status = 'PENDING'
ORDER BY pa.requested_at ASC;
```

### Admin Actions

**Approve AKD → USD Transfer:**
```sql
-- 1. Update approval status
UPDATE pending_approvals
SET 
    status = 'APPROVED',
    reviewed_at = NOW(),
    reviewed_by = 'admin_user_id',
    admin_notes = 'Approved - verified user identity'
WHERE id = 'approval_id';

-- 2. Execute the actual transfer
-- This should call post_transaction() RPC
```

**Reject Request:**
```sql
UPDATE pending_approvals
SET 
    status = 'REJECTED',
    reviewed_at = NOW(),
    reviewed_by = 'admin_user_id',
    admin_notes = 'Rejected - suspicious activity pattern'
WHERE id = 'approval_id';
```

---

## Admin Dashboard Features

### 1. Pending Approvals Queue

**Real-time subscription:**
```typescript
const subscription = supabase
  .channel('pending-approvals')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'pending_approvals',
      filter: 'status=eq.PENDING'
    },
    (payload) => {
      // Show notification: "New approval request from {user}"
      playNotificationSound()
      addToApprovalQueue(payload.new)
    }
  )
  .subscribe()
```

### 2. KYC Document Review

**Fetch pending KYC:**
```typescript
const { data: kycRequests } = await supabase
  .from('users')
  .select('id, uid, full_name, email, kyc_tier, kyc_documents, created_at')
  .eq('kyc_status', 'PENDING')
  .order('created_at', { ascending: true })

// Display documents from S3
const documentUrl = `https://pethar-kyc-storage.s3.amazonaws.com/${userId}/national_id.jpg`
```

**Approve KYC:**
```typescript
await supabase
  .from('users')
  .update({
    kyc_status: 'APPROVED',
    kyc_tier: 2,
    kyc_verified_at: new Date().toISOString(),
    daily_limit_akd: 10000,
    monthly_limit_akd: 999999
  })
  .eq('id', userId)
```

### 3. Transaction Monitoring Dashboard

**Real-time transaction stream:**
```typescript
const { data: recentTransactions } = await supabase
  .from('transactions')
  .select(`
    ref_id,
    amount,
    currency,
    status,
    created_at,
    metadata
  `)
  .order('created_at', { ascending: false })
  .limit(100)

// Subscribe to new transactions
supabase
  .channel('transactions-monitor')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'transactions'
  }, (payload) => {
    // Check for suspicious patterns
    if (payload.new.amount > 5000) {
      showHighValueAlert(payload.new)
    }
  })
  .subscribe()
```

### 4. User Search & Management

```typescript
// Search users by UID, email, phone
const searchUser = async (query: string) => {
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .or(`uid.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
    .limit(10)
  
  return data
}

// Suspend user
const suspendUser = async (userId: string, reason: string) => {
  await supabase
    .from('users')
    .update({ 
      status: 'SUSPENDED',
      suspension_reason: reason,
      suspended_at: new Date().toISOString()
    })
    .eq('id', userId)
}
```

---

## Admin Authentication

### Create Admin User

```sql
-- 1. Create admin user in auth.users (via Supabase Dashboard)
-- 2. Add admin metadata
INSERT INTO public.users (id, email, role, permissions)
VALUES (
    'admin_user_auth_uid',
    'admin@pethar.co.uk',
    'ADMIN',
    ARRAY['APPROVE_TRANSACTIONS', 'APPROVE_KYC', 'SUSPEND_USERS']
);
```

### Protect Admin Routes

```typescript
// middleware.ts for admin.pethar.co.uk
export async function middleware(req: NextRequest) {
  const supabase = createClient(req)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  // Check if user has admin role
  const { data: adminUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (adminUser?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }
  
  return NextResponse.next()
}
```

---

## Deployment

### Subdomain Configuration

**Vercel/Cloudflare:**
```json
// vercel.json
{
  "routes": [
    {
      "src": "admin.pethar.co.uk/(.*)",
      "dest": "/admin/$1"
    }
  ]
}
```

**DNS Records:**
```
admin.pethar.co.uk  CNAME  pethar-admin.vercel.app
```

---

## Security Checklist

- [ ] Admin dashboard only accessible via HTTPS
- [ ] Admin users have 2FA enabled (Firebase Auth)
- [ ] All admin actions logged to audit table
- [ ] Session timeout: 30 minutes of inactivity
- [ ] IP whitelist for admin access (optional)
- [ ] Rate limiting: Max 100 requests/minute per admin

---

## Next Steps

1. Create `apps/admin` directory in monorepo
2. Set up Next.js 14+ with App Router
3. Install dependencies: `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`
4. Build approval queue UI with real-time updates
5. Implement KYC document viewer
6. Deploy to `admin.pethar.co.uk`
