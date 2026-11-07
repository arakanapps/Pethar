import { supabase } from '../lib/supabase'
import type { DbUserProfile } from './walletDatabase'
import { fetchAllUsersForAdmin } from './walletDatabase'

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

function mapUser(row: DbUserProfile): AdminUserRow {
  const name = row.name || [row.firstName, row.lastName].filter(Boolean).join(' ') || row.username || row.email
  const kycStatus =
    row.kyc_status ||
    (row.kyc_tier === 2 ? 'verified' : row.nationalIdNo ? 'pending_review' : 'unverified')

  return {
    id: row.id,
    userId: row.userId || '',
    uid: row.uid,
    name: name || 'Unnamed user',
    email: row.email || '',
    phone: row.phone || '',
    username: row.username || '',
    status: row.status || 'ACTIVE',
    kycTier: row.kyc_tier === 2 ? 2 : 1,
    kycStatus,
    nationalIdNo: row.nationalIdNo || '',
    address: row.address || '',
    dob: row.dob || '',
    balance: Number(row.balance || 0),
    usdBalance: Number(row.usdAccountBalance || 0),
    createdAt: row.createdAt || '',
    rejectionReason: row.kycRejectionReason || '',
  }
}

export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const users = await fetchAllUsersForAdmin()
  return users.map(mapUser)
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

    return (data || []).map((row: any) => {
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
              ? 'Transaction marked failed or reversed by ledger'
              : 'High-risk transaction flagged by monitoring policy'
            : risk === 'Medium'
              ? 'Amount above review threshold'
              : 'Normal settlement',
      }
    })
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

    return (data || []).map((row: any) => ({
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
    }))
  } catch (error) {
    console.error('Admin approvals exception:', error)
    return []
  }
}

export async function reviewAdminApproval(
  id: string,
  status: 'APPROVED' | 'REJECTED',
  notes?: string,
): Promise<{ success: boolean; error?: string }> {
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

export function toAdminUser(row: DbUserProfile): AdminUserRow {
  return mapUser(row)
}
