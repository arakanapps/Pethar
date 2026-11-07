import { supabase } from '../lib/supabase'
import type { DbUserProfile } from './walletDatabase'
import {
  fetchAllUsersForAdmin,
  updateCitizenKycInDb,
  updateUserStatusInDb,
} from './walletDatabase'

const db = supabase as any

export interface AdminUserRow {
  id: string
  userId: string
  uid: string
  name: string
  email: string
  phone: string
  username: string
  status: string
  kycTier: 1 | 2
  kycStatus: string
  nationalIdNo: string
  address: string
  dob: string
  balance: number
  usdBalance: number
  createdAt: string
  rejectionReason: string
  nricFrontUrl: string
  nricBackUrl: string
  selfieUrl: string
  addressHouseNo: string
  addressStreet: string
  addressWard: string
  addressSubDistrict: string
  addressDistrict: string
  addressProvince: string
  addressCountry: string
  addressPostalCode: string
  kycSubmittedAt: string
  kycReviewedAt: string
}

export interface AdminTransactionRow {
  id: string
  refId: string
  title: string
  category: string
  amount: number
  currency: string
  fee: number
  status: string
  counterparty: string
  userId: string
  createdAt: string
  risk: 'Low' | 'Medium' | 'High'
  flagReason: string
}

export interface AdminApprovalRow {
  id: string
  userId: string
  type: string
  amount: number
  currency: string
  status: string
  requestedAt: string
  reviewedAt: string
  adminNotes: string
  metadata: Record<string, unknown>
}

export interface AdminSnapshot {
  users: AdminUserRow[]
  transactions: AdminTransactionRow[]
  approvals: AdminApprovalRow[]
  source: 'admin-api' | 'supabase'
}

function normalizeKycStatus(value?: string, tier?: number, hasId?: boolean): string {
  const clean = String(value || '').toUpperCase()
  if (clean === 'VERIFIED') return 'verified'
  if (clean === 'PENDING_REVIEW') return 'pending_review'
  if (clean === 'REJECTED') return 'rejected'
  if (clean === 'UNVERIFIED') return 'unverified'
  return tier === 2 ? 'verified' : hasId ? 'pending_review' : 'unverified'
}

function mapUser(row: any): AdminUserRow {
  const name =
    row.name ||
    [row.firstName || row.first_name, row.lastName || row.last_name].filter(Boolean).join(' ') ||
    row.username ||
    row.email ||
    'Unnamed user'

  return {
    id: row.id || '',
    userId: row.userId || row.user_id || '',
    uid: row.uid || '',
    name,
    email: row.email || '',
    phone: row.phone || '',
    username: row.username || '',
    status: row.status || 'ACTIVE',
    kycTier: row.kyc_tier === 2 || row.kycTier === 2 ? 2 : 1,
    kycStatus: normalizeKycStatus(
      row.kycStatus || row.kyc_status,
      row.kyc_tier || row.kycTier,
      Boolean(row.nationalIdNo || row.national_id_no),
    ),
    nationalIdNo: row.nationalIdNo || row.national_id_no || '',
    address: row.address || '',
    dob: row.dob || '',
    balance: Number(row.balance || 0),
    usdBalance: Number(row.usdAccountBalance || row.usd_account_balance || 0),
    createdAt: row.createdAt || row.created_at || '',
    rejectionReason: row.kycRejectionReason || row.kyc_rejection_reason || '',
    nricFrontUrl: row.nricFrontUrl || row.nric_front_url || '',
    nricBackUrl: row.nricBackUrl || row.nric_back_url || '',
    selfieUrl: row.selfieUrl || row.selfie_url || '',
    addressHouseNo: row.addressHouseNo || row.address_house_no || '',
    addressStreet: row.addressStreet || row.address_street || '',
    addressWard: row.addressWard || row.address_ward || '',
    addressSubDistrict: row.addressSubDistrict || row.address_sub_district || '',
    addressDistrict: row.addressDistrict || row.address_district || '',
    addressProvince: row.addressProvince || row.address_province || '',
    addressCountry: row.addressCountry || row.address_country || '',
    addressPostalCode: row.addressPostalCode || row.address_postal_code || '',
    kycSubmittedAt: row.kycSubmittedAt || row.kyc_submitted_at || '',
    kycReviewedAt: row.kycReviewedAt || row.kyc_reviewed_at || '',
  }
}

function mapTransaction(row: any): AdminTransactionRow {
  const amount = Number(row.amount || 0)
  const status = String(row.status || '').toUpperCase()
  const metadataRisk = String(row.metadata?.risk || '').toUpperCase()
  const highAmount = Math.abs(amount) >= 5000
  const failed = status.includes('FAILED') || status.includes('REVERSED') || status.includes('FLAGGED')
  const risk: 'Low' | 'Medium' | 'High' =
    metadataRisk === 'HIGH' || failed
      ? 'High'
      : metadataRisk === 'MEDIUM' || highAmount
        ? 'Medium'
        : 'Low'

  return {
    id: row.id,
    refId: row.ref_id || row.reference_id || row.id,
    title: row.title || row.transaction_type || 'Transaction',
    category: row.category || row.transaction_type || 'transfer',
    amount,
    currency: row.currency || 'AKD',
    fee: Number(row.fee || 0),
    status: row.status || 'SETTLED',
    counterparty: row.counterparty || '',
    userId: row.user_id || row.sender_user_id || row.recipient_user_id || '',
    createdAt: row.created_at || '',
    risk,
    flagReason:
      risk === 'High'
        ? failed
          ? 'Transaction marked failed or reversed by the ledger'
          : 'High-risk transaction flagged by monitoring policy'
        : risk === 'Medium'
          ? 'Amount above review threshold'
          : 'Normal settlement',
  }
}

function mapApproval(row: any): AdminApprovalRow {
  return {
    id: row.id,
    userId: row.user_id || '',
    type: row.transaction_type || row.action || 'APPROVAL',
    amount: Number(row.amount || 0),
    currency: row.currency || 'AKD',
    status: row.status || 'PENDING',
    requestedAt: row.requested_at || row.created_at || '',
    reviewedAt: row.reviewed_at || '',
    adminNotes: row.admin_notes || '',
    metadata: row.metadata || {},
  }
}

export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const users = await fetchAllUsersForAdmin()
  return users.map((user: DbUserProfile) => mapUser(user))
}

export async function fetchAdminTransactions(): Promise<AdminTransactionRow[]> {
  try {
    const { data, error } = await db
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) {
      console.warn('Admin transactions query:', error.message)
      return []
    }
    return (data || []).map(mapTransaction)
  } catch (error) {
    console.error('Admin transactions exception:', error)
    return []
  }
}

export async function fetchAdminApprovals(): Promise<AdminApprovalRow[]> {
  try {
    const { data, error } = await db
      .from('pending_approvals')
      .select('*')
      .order('requested_at', { ascending: false })
      .limit(200)

    if (error) {
      console.warn('Admin approvals query:', error.message)
      return []
    }
    return (data || []).map(mapApproval)
  } catch (error) {
    console.error('Admin approvals exception:', error)
    return []
  }
}

export async function fetchAdminSnapshot(): Promise<AdminSnapshot> {
  try {
    const response = await fetch('/api/admin/snapshot', { headers: { Accept: 'application/json' } })
    if (response.ok) {
      const payload = await response.json()
      return {
        users: (payload.users || []).map(mapUser),
        transactions: (payload.transactions || []).map(mapTransaction),
        approvals: (payload.approvals || []).map(mapApproval),
        source: 'admin-api',
      }
    }
  } catch {
    // Fall through to direct Supabase reads.
  }

  const [users, transactions, approvals] = await Promise.all([
    fetchAdminUsers(),
    fetchAdminTransactions(),
    fetchAdminApprovals(),
  ])
  return { users, transactions, approvals, source: 'supabase' }
}

export async function reviewAdminApproval(
  id: string,
  status: 'APPROVED' | 'REJECTED',
  notes?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/admin/approval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, notes }),
    })
    if (response.ok) return { success: true }
  } catch {
    // Fall back to direct Supabase update.
  }

  try {
    const { error } = await db
      .from('pending_approvals')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        admin_notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Unable to update approval' }
  }
}

export async function adminUpdateKyc(
  uid: string,
  status: 'verified' | 'rejected' | 'pending_review',
  tier: 1 | 2,
  reason?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/admin/kyc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, status: status.toUpperCase(), tier, reason }),
    })
    if (response.ok) return { success: true }
  } catch {
    // Fall back to direct Supabase update.
  }
  return updateCitizenKycInDb(uid, status, tier, reason)
}

export async function adminFreezeUser(
  uid: string,
  status: 'ACTIVE' | 'SUSPENDED' | 'FROZEN',
  reason?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/admin/freeze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, status, reason }),
    })
    if (response.ok) return { success: true }
  } catch {
    // Fall back to direct Supabase update.
  }
  return updateUserStatusInDb(uid, status, reason)
}

export async function fetchKycDocumentUrl(path: string): Promise<string | null> {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  try {
    const response = await fetch(`/api/admin/signed-url?path=${encodeURIComponent(path)}`)
    if (response.ok) {
      const payload = await response.json()
      if (payload.url) return payload.url
    }
  } catch {
    // Fall back to direct storage signing.
  }
  try {
    const { data, error } = await db.storage.from('kyc-documents').createSignedUrl(path, 60 * 10)
    if (error) return null
    return data?.signedUrl || null
  } catch {
    return null
  }
}


export interface AdminKycProfileFields {
  name?: string
  phone?: string
  nationalIdNo?: string
  dob?: string
  addressHouseNo?: string
  addressStreet?: string
  addressWard?: string
  addressSubDistrict?: string
  addressDistrict?: string
  addressProvince?: string
  addressCountry?: string
  addressPostalCode?: string
}

export async function adminUpdateKycProfile(
  uid: string,
  fields: AdminKycProfileFields,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/admin/kyc-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, fields }),
    })
    if (response.ok) return { success: true }
    const payload = await response.json().catch(() => ({}))
    if (payload.error) return { success: false, error: payload.error }
  } catch {
    // Fall back to direct Supabase update.
  }

  try {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (fields.name !== undefined) payload.name = fields.name
    if (fields.phone !== undefined) payload.phone = fields.phone
    if (fields.nationalIdNo !== undefined) payload.national_id_no = fields.nationalIdNo
    if (fields.dob !== undefined) payload.dob = fields.dob || null
    if (fields.addressHouseNo !== undefined) payload.address_house_no = fields.addressHouseNo
    if (fields.addressStreet !== undefined) payload.address_street = fields.addressStreet
    if (fields.addressWard !== undefined) payload.address_ward = fields.addressWard
    if (fields.addressSubDistrict !== undefined) payload.address_sub_district = fields.addressSubDistrict
    if (fields.addressDistrict !== undefined) payload.address_district = fields.addressDistrict
    if (fields.addressProvince !== undefined) payload.address_province = fields.addressProvince
    if (fields.addressCountry !== undefined) payload.address_country = fields.addressCountry
    if (fields.addressPostalCode !== undefined) payload.address_postal_code = fields.addressPostalCode
    const { error } = await db.from('user_profiles').update(payload).eq('uid', uid)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Unable to update profile' }
  }
}
