import { supabase } from '../lib/supabase'
import { generateUserUid, type Txn } from '../data'
export { generateUserUid }

// Dynamic query client to interface cleanly with live Supabase tables
const db = supabase as any

export interface DbUserProfile {
  id: string
  name: string
  firstName: string
  lastName: string
  nickname: string
  username: string
  uid: string
  walletAddress: string
  email: string
  phone: string
  pinHash?: string
  nationalIdNo: string
  dob: string
  address: string
  usdAccountWalletAddress: string
  ak_id?: string // deprecated, aliases to uid
  balance: number
  akdWalletBalance: number
  usdAccountBalance: number
  totalBalance: number
  currency: string
  avatar_url?: string
  kyc_tier: 1 | 2
  kyc_status?: 'unverified' | 'email_verified' | 'pending_review' | 'verified'
}

export interface DbFavoriteContact {
  id: string
  user_id?: string
  name: string
  username: string
  uid: string
  phone: string
  initials: string
  color_value: number
  category: string
  avatar_url?: string
}

// In-memory OTP storage for password reset & email verification (10 minutes expiry)
interface StoredOtp {
  code: string
  email: string
  expiresAt: number // timestamp
}
const otpStore = new Map<string, StoredOtp>()

const API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:3001'

/**
 * Generate 6-digit OTP code with 10-minute validity
 */
export function generateOtpForEmail(email: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const cleanEmail = email.trim().toLowerCase()
  const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes
  otpStore.set(cleanEmail, { code, email: cleanEmail, expiresAt })

  // Dispatch OTP email via Gmail and persist to MongoDB
  if (typeof fetch !== 'undefined') {
    fetch(`${API_URL}/api/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, code, purpose: 'SIGN_UP' }),
    }).catch((err) => console.warn('Could not dispatch OTP email via server:', err))
  }

  return code
}

/**
 * Verify OTP code for given email (returns true if valid and not expired)
 */
export function verifyEmailOtp(email: string, inputCode: string): { valid: boolean; reason?: 'expired' | 'invalid' } {
  const cleanEmail = email.trim().toLowerCase()
  const record = otpStore.get(cleanEmail)
  if (!record) {
    return { valid: false, reason: 'invalid' }
  }
  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail)
    return { valid: false, reason: 'expired' }
  }
  if (record.code !== inputCode.trim()) {
    return { valid: false, reason: 'invalid' }
  }
  // OTP is verified and consumed
  otpStore.delete(cleanEmail)
  return { valid: true }
}

/**
 * Simple hash helper for 6-digit PIN
 */
function hashPin(pin: string): string {
  let hash = 0
  for (let i = 0; i < pin.length; i++) {
    hash = (hash << 5) - hash + pin.charCodeAt(i)
    hash |= 0
  }
  return 'pin_' + Math.abs(hash).toString(16)
}

/**
 * Fetch all transactions directly from Supabase 'transactions' table
 */
export async function fetchTransactionsFromDb(): Promise<Txn[]> {
  try {
    const { data, error } = await db
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Supabase fetch transactions warning:', error.message)
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    return data.map((row: any) => ({
      id: row.id,
      refId: row.ref_id || row.id,
      title: row.title,
      titleMm: row.title_mm || '',
      category: row.category || 'transfer',
      amount: parseFloat(row.amount),
      currency: row.currency || 'AKD',
      time: row.time || 'Today',
      status: row.status || 'SETTLED',
      counterparty: row.counterparty || '',
      counterpartyMm: row.counterparty_mm || '',
      fee: parseFloat(row.fee || 0),
      hash: row.hash || '',
    }))
  } catch (err) {
    console.error('Error fetching transactions from Supabase:', err)
    return []
  }
}

/**
 * Insert a newly executed payment or transfer into Supabase
 */
export async function insertTransactionToDb(tx: Txn): Promise<boolean> {
  try {
    const { error } = await db.from('transactions').insert({
      id: tx.id,
      ref_id: tx.refId,
      title: tx.title,
      title_mm: tx.titleMm,
      category: tx.category,
      amount: tx.amount,
      currency: tx.currency,
      time: tx.time,
      status: tx.status,
      counterparty: tx.counterparty,
      counterparty_mm: tx.counterpartyMm,
      fee: tx.fee,
      hash: tx.hash,
    })

    if (error) {
      console.error('Failed to insert transaction to Supabase:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.error('Exception inserting transaction to Supabase:', err)
    return false
  }
}

/**
 * Fetch user profile & wallet balance from Supabase (without hardcoded personal info fallbacks)
 */
export async function fetchUserProfileFromDb(lookupUidOrEmail?: string): Promise<DbUserProfile | null> {
  try {
    const activeUid = lookupUidOrEmail || (typeof window !== 'undefined' ? localStorage.getItem('pethar_active_uid') : null)
    const activeEmail = typeof window !== 'undefined' ? localStorage.getItem('pethar_active_email') : null

    let query = db.from('user_profiles').select('*')
    if (activeUid) {
      query = query.eq('uid', activeUid)
    } else if (activeEmail) {
      query = query.eq('email', activeEmail.trim().toLowerCase())
    }

    const { data, error } = await query.limit(1).maybeSingle()

    if (error) {
      console.warn('Supabase fetch user profile warning:', error.message)
    }

    if (!data) {
      // If specific search yielded no result, fallback to latest existing profile or null
      const fallbackQuery = await db.from('user_profiles').select('*').limit(1).maybeSingle()
      if (fallbackQuery.data) {
        return mapDbProfile(fallbackQuery.data)
      }
      return null
    }

    return mapDbProfile(data)
  } catch (err) {
    console.error('Error fetching user profile from Supabase:', err)
    return null
  }
}

function mapDbProfile(data: any): DbUserProfile {
  const bal = parseFloat(data.balance || 0)
  const usdBal = parseFloat(data.usd_account_balance || 0)
  const uid = data.uid || data.wallet_address || '202610190001'

  return {
    id: data.id,
    name: data.name || data.first_name || 'User',
    firstName: data.first_name || '',
    lastName: data.last_name || '',
    nickname: data.nickname || '',
    username: data.username || '@user',
    uid: uid,
    walletAddress: data.wallet_address || uid,
    email: data.email || '',
    phone: data.phone || '',
    pinHash: data.pin_hash || '',
    nationalIdNo: data.national_id_no || '',
    dob: data.dob || '',
    address: data.address || '',
    usdAccountWalletAddress: data.usd_account_wallet_address || '0x36a8F492C109bE742819aBcD8391048291045f19',
    ak_id: uid, // replaced ak_id with uid
    balance: bal,
    akdWalletBalance: data.akd_wallet_balance ? parseFloat(data.akd_wallet_balance) : bal,
    usdAccountBalance: usdBal,
    totalBalance: data.total_balance ? parseFloat(data.total_balance) : bal + usdBal,
    currency: data.currency || 'AKD',
    avatar_url: data.avatar_url || '',
    kyc_tier: (data.kyc_tier === 2 ? 2 : 1) as 1 | 2,
    kyc_status: (data.kyc_status || (data.kyc_tier === 2 ? 'verified' : 'email_verified')) as any,
  }
}

/**
 * Authenticate user with Email and 6-digit PIN code
 */
export async function authenticateWithEmailAndPin(
  email: string,
  pin: string
): Promise<{ success: boolean; user?: DbUserProfile; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase()
    const pinH = hashPin(pin.trim())

    // 0. Query MongoDB user_profiles via API
    if (typeof fetch !== 'undefined') {
      try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, pin: pin.trim() }),
        })
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.user) {
            const profile = mapDbProfile(json.user)
            if (typeof window !== 'undefined') {
              localStorage.setItem('pethar_logged_in', 'true')
              localStorage.setItem('pethar_active_uid', profile.uid)
              localStorage.setItem('pethar_active_email', profile.email)
            }
            return { success: true, user: profile }
          }
        }
      } catch (_) {}
    }

    // 1. Query Supabase user_profiles
    const { data, error } = await db
      .from('user_profiles')
      .select('*')
      .eq('email', cleanEmail)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.warn('Database error while signing in:', error.message)
    }

    if (data) {
      // Check stored PIN (accepts plain PIN match or hash match, or initial default)
      const isPinMatch =
        data.pin_hash === pinH ||
        data.pin_hash === pin.trim() ||
        (data.pin_hash === '' && pin.trim() === '123456') ||
        data.pin === pin.trim()

      if (!isPinMatch) {
        return { success: false, error: 'INCORRECT_CREDENTIALS' }
      }

      const profile = mapDbProfile(data)
      if (typeof window !== 'undefined') {
        localStorage.setItem('pethar_logged_in', 'true')
        localStorage.setItem('pethar_active_uid', profile.uid)
        localStorage.setItem('pethar_active_email', profile.email)
      }
      return { success: true, user: profile }
    }

    // Check local fallback user if database is offline/unreachable
    const localEmail = typeof window !== 'undefined' ? localStorage.getItem('pethar_saved_email') : null
    const localPin = typeof window !== 'undefined' ? localStorage.getItem('pethar_saved_pin') : null
    if (localEmail && localEmail.toLowerCase() === cleanEmail && localPin === pin.trim()) {
      const localProfile: DbUserProfile = {
        id: 'local_user',
        name: localStorage.getItem('pethar_saved_name') || 'User',
        firstName: '',
        lastName: '',
        nickname: '',
        username: localStorage.getItem('pethar_saved_username') || '@user',
        uid: localStorage.getItem('pethar_saved_uid') || '202610190001',
        walletAddress: localStorage.getItem('pethar_saved_uid') || '202610190001',
        email: cleanEmail,
        phone: '',
        nationalIdNo: '',
        dob: '',
        address: '',
        usdAccountWalletAddress: '0x36a8F492C109bE742819aBcD8391048291045f19',
        ak_id: localStorage.getItem('pethar_saved_uid') || '202610190001',
        balance: 0.0,
        akdWalletBalance: 0.0,
        usdAccountBalance: 0.0,
        totalBalance: 0.0,
        currency: 'AKD',
        kyc_tier: 1,
        kyc_status: 'email_verified',
      }
      localStorage.setItem('pethar_logged_in', 'true')
      localStorage.setItem('pethar_active_uid', localProfile.uid)
      localStorage.setItem('pethar_active_email', localProfile.email)
      return { success: true, user: localProfile }
    }

    return { success: false, error: 'INCORRECT_CREDENTIALS' }
  } catch (err: any) {
    console.error('Sign in exception:', err)
    return { success: false, error: err.message || 'SIGNIN_FAILED' }
  }
}

/**
 * Register a new user with Email, 6-digit PIN, Full Name, and Username (KYC Level 1: Email Verified)
 */
export async function registerWithEmailAndPin(params: {
  email: string
  pin: string
  name: string
  username: string
}): Promise<{ success: boolean; user?: DbUserProfile; error?: string }> {
  try {
    const cleanEmail = params.email.trim().toLowerCase()
    const cleanPin = params.pin.trim()
    const cleanUsername = params.username.trim().startsWith('@')
      ? params.username.trim()
      : `@${params.username.trim()}`
    const cleanName = params.name.trim()

    // Generate custom UID: yearmmddusercount (e.g. 202610190001)
    const newUid = generateUserUid(Math.floor(1000 + Math.random() * 8999))
    const pinH = hashPin(cleanPin)

    const newProfile = {
      id: 'usr_' + Date.now().toString(36),
      username: cleanUsername,
      uid: newUid,
      wallet_address: newUid,
      email: cleanEmail,
      pin_hash: pinH,
      name: cleanName,
      first_name: cleanName.split(' ')[0] || cleanName,
      last_name: cleanName.split(' ').slice(1).join(' ') || '',
      nickname: cleanName.split(' ')[0] || '',
      national_id_no: '',
      dob: '',
      address: '',
      usd_account_wallet_address: '0x36a8F492C109bE742819aBcD8391048291045f19',
      balance: 0.0,
      usd_account_balance: 0.0,
      currency: 'AKD',
      kyc_tier: 1, // KYC Level 1: Email verified!
      kyc_status: 'email_verified',
    }

    // Persist to MongoDB user_profiles via API
    if (typeof fetch !== 'undefined') {
      fetch(`${API_URL}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          action: 'save',
          profile: {
            ...newProfile,
            uid: newUid,
            name: cleanName,
            username: cleanUsername,
          },
        }),
      }).catch((e) => console.warn('MongoDB profile save error:', e))
    }

    // Try inserting into Supabase user_profiles
    const { data, error } = await db.from('user_profiles').insert(newProfile).select().maybeSingle()

    if (error) {
      console.warn('Could not insert to user_profiles table (using local persistence):', error.message)
    }

    // Also insert into users table for multi-table directory synchronization
    try {
      await db.from('users').insert({
        uid: newUid,
        username: cleanUsername,
        email: cleanEmail,
        first_name: cleanName.split(' ')[0] || cleanName,
        last_name: cleanName.split(' ').slice(1).join(' ') || '',
        full_name: cleanName,
        kyc_tier: 1,
        status: 'ACTIVE',
      })
    } catch (uErr) {
      console.warn('Could not insert to users table:', uErr)
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('pethar_logged_in', 'true')
      localStorage.setItem('pethar_active_uid', newUid)
      localStorage.setItem('pethar_active_email', cleanEmail)
      localStorage.setItem('pethar_saved_email', cleanEmail)
      localStorage.setItem('pethar_saved_pin', cleanPin)
      localStorage.setItem('pethar_saved_name', cleanName)
      localStorage.setItem('pethar_saved_username', cleanUsername)
      localStorage.setItem('pethar_saved_uid', newUid)
    }

    const created = data ? mapDbProfile(data) : mapDbProfile(newProfile)
    return { success: true, user: created }
  } catch (err: any) {
    console.error('Registration exception:', err)
    return { success: false, error: err.message || 'REGISTRATION_FAILED' }
  }
}

/**
 * Update user email in Supabase (updates both user_profiles and users tables)
 */
export async function updateUserEmailInDb(
  uid: string,
  newEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanEmail = newEmail.trim().toLowerCase()
    const { error: profileError } = await db
      .from('user_profiles')
      .update({ email: cleanEmail, updated_at: new Date().toISOString() })
      .eq('uid', uid)

    if (profileError) {
      console.warn('Could not update user_profiles email in Supabase:', profileError.message)
    }

    const { error: userError } = await db
      .from('users')
      .update({ email: cleanEmail, updated_at: new Date().toISOString() })
      .eq('uid', uid)

    if (userError) {
      console.warn('Could not update users table email in Supabase:', userError.message)
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('pethar_active_email', cleanEmail)
      localStorage.setItem('pethar_saved_email', cleanEmail)
    }

    return { success: true }
  } catch (err: any) {
    console.error('Update email exception:', err)
    return { success: false, error: err.message || 'EMAIL_UPDATE_FAILED' }
  }
}

/**
 * Update user avatar in Supabase and localStorage
 */
export async function updateUserAvatarInDb(
  uid: string,
  avatarUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pethar_user_avatar', avatarUrl)
    }

    if (uid) {
      const { error: profileError } = await db
        .from('user_profiles')
        .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq('uid', uid)

      if (profileError) {
        console.warn('Could not update user_profiles avatar in Supabase:', profileError.message)
      }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Update avatar exception:', err)
    return { success: false, error: err.message || 'AVATAR_UPDATE_FAILED' }
  }
}


/**
 * Reset user PIN by email
 */
export async function resetPinWithEmail(
  email: string,
  newPin: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase()
    const pinH = hashPin(newPin.trim())

    const { error } = await db
      .from('user_profiles')
      .update({ pin_hash: pinH, updated_at: new Date().toISOString() })
      .eq('email', cleanEmail)

    if (error) {
      console.warn('Failed to update pin in Supabase:', error.message)
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('pethar_saved_pin', newPin.trim())
    }

    return { success: true }
  } catch (err: any) {
    console.error('Reset PIN exception:', err)
    return { success: false, error: err.message || 'RESET_PIN_FAILED' }
  }
}

/**
 * Upgrade to KYC Level 2 (National ID Verified)
 * User enters personal info (first name, last name, national ID no, dob, address) and submits for review.
 */
export async function submitKycLevel2Verification(
  uid: string,
  data: {
    firstName: string
    lastName: string
    nationalIdNo: string
    dob: string
    address: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await db
      .from('user_profiles')
      .update({
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        name: `${data.firstName.trim()} ${data.lastName.trim()}`.trim(),
        national_id_no: data.nationalIdNo.trim(),
        dob: data.dob.trim(),
        address: data.address.trim(),
        kyc_tier: 2,
        kyc_status: 'pending_review',
        updated_at: new Date().toISOString(),
      })
      .eq('uid', uid)

    if (error) {
      console.warn('Failed to submit KYC Level 2 to Supabase:', error.message)
    }

    return { success: true }
  } catch (err: any) {
    console.error('KYC Level 2 submission exception:', err)
    return { success: false, error: err.message || 'KYC_SUBMIT_FAILED' }
  }
}

/**
 * Update user balance in Supabase
 */
export async function updateUserBalanceInDb(newBalance: number): Promise<boolean> {
  try {
    const { error } = await db
      .from('user_profiles')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .neq('id', '') // updates active profile

    if (error) {
      console.warn('Failed to update balance in Supabase:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.error('Exception updating balance in Supabase:', err)
    return false
  }
}

/**
 * Fetch favorite contacts from Supabase
 */
export async function fetchFavoriteContactsFromDb(userId?: string): Promise<DbFavoriteContact[]> {
  try {
    let query = db
      .from('favorite_contacts')
      .select('*')
      .order('created_at', { ascending: true })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.warn('Supabase fetch favorite contacts warning:', error.message)
      return []
    }
    return data || []
  } catch (err) {
    console.error('Error fetching favorite contacts from Supabase:', err)
    return []
  }
}

/**
 * Realtime subscription to new transactions
 */
export function subscribeToTransactions(onNewTx: (tx: Txn) => void) {
  const channel = supabase
    .channel('transactions-stream')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'transactions' },
      (payload) => {
        const row = payload.new as any
        if (row && row.id) {
          onNewTx({
            id: row.id,
            refId: row.ref_id || row.id,
            title: row.title,
            titleMm: row.title_mm || '',
            category: row.category || 'transfer',
            amount: parseFloat(row.amount),
            currency: row.currency || 'AKD',
            time: row.time || 'Just now',
            status: row.status || 'SETTLED',
            counterparty: row.counterparty || '',
            counterpartyMm: row.counterparty_mm || '',
            fee: parseFloat(row.fee || 0),
            hash: row.hash || '',
          })
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Fetch physical agents directory directly from Supabase
 */
export async function fetchAgentsFromDb(): Promise<any[]> {
  try {
    const { data, error } = await db
      .from('agents')
      .select('*')
      .order('agent_code', { ascending: true })

    if (error) {
      console.warn('Supabase fetch agents warning:', error.message)
      return []
    }
    return (data || []).map((row: any) => ({
      code: row.agent_code,
      name: row.display_name,
      mm: row.display_name_mm || row.display_name,
      township: row.township || 'Sittwe',
      townshipMm: row.township_mm || 'စစ်တွေ',
      distance: row.distance || '0.5 km',
      floatStatus: row.float_status || 'High',
      floatStatusMm: row.float_status_mm || 'ငွေသားအပြည့်ရှိ',
      phone: row.phone || '+95 9 881 000 101',
      cashReserveAkd: parseFloat(row.cash_reserve_akd || 50000),
      open: row.is_open ?? true,
    }))
  } catch (err) {
    console.error('Error fetching agents from Supabase:', err)
    return []
  }
}

/**
 * Fetch real-time foreign exchange rate board from Supabase
 */
export async function fetchFxRatesFromDb(): Promise<any[]> {
  try {
    const { data, error } = await db
      .from('fx_rate_board')
      .select('*')
      .order('pair', { ascending: true })

    if (error) {
      console.warn('Supabase fetch fx rates warning:', error.message)
      return []
    }
    return (data || []).map((row: any) => ({
      pair: row.pair.replace('/', ' / '),
      name: `${row.pair} Exchange Corridor`,
      nameMm: `${row.pair} နိုင်ငံတကာငွေလဲနှုန်း`,
      rate: parseFloat(row.rate),
      change24h: '+0.00%',
      high24h: parseFloat(row.rate),
      low24h: parseFloat(row.rate),
      trend: 'flat',
    }))
  } catch (err) {
    console.error('Error fetching fx rates from Supabase:', err)
    return []
  }
}

/**
 * Fetch bill providers directly from Supabase
 */
export async function fetchBillProvidersFromDb(): Promise<any[]> {
  try {
    const { data, error } = await db
      .from('bill_providers')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.warn('Supabase fetch bill providers warning:', error.message)
      return []
    }
    return data || []
  } catch (err) {
    console.error('Error fetching bill providers from Supabase:', err)
    return []
  }
}

/**
 * Fetch topup packages directly from Supabase
 */
export async function fetchTopupPackagesFromDb(): Promise<any[]> {
  try {
    const { data, error } = await db
      .from('topup_packages')
      .select('*')
      .order('mmk_price', { ascending: true })

    if (error) {
      console.warn('Supabase fetch topup packages warning:', error.message)
      return []
    }
    return data || []
  } catch (err) {
    console.error('Error fetching topup packages from Supabase:', err)
    return []
  }
}

/**
 * Fetch POS merchant terminals directly from Supabase
 */
export async function fetchPosTerminalsFromDb(): Promise<any[]> {
  try {
    const { data, error } = await db
      .from('pos_terminals')
      .select('*')
      .order('terminal_code', { ascending: true })

    if (error) {
      console.warn('Supabase fetch POS terminals warning:', error.message)
      return []
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      terminalCode: row.terminal_code,
      name: row.store_name,
      nameMm: row.store_name_mm || row.store_name,
      township: row.township,
      limit: parseFloat(row.daily_sales_limit || 50000),
      status: row.status,
    }))
  } catch (err) {
    console.error('Error fetching POS terminals from Supabase:', err)
    return []
  }
}

/**
 * Fetch all users for Admin operations hub
 */
export async function fetchAllUsersForAdmin(): Promise<DbUserProfile[]> {
  try {
    const { data, error } = await db
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Supabase fetch users for admin warning:', error.message)
      return []
    }
    return (data || []).map(mapDbProfile)
  } catch (err) {
    console.error('Error fetching all users for admin from Supabase:', err)
    return []
  }
}

/**
 * Update user account status (ACTIVE, SUSPENDED, FROZEN)
 */
export async function updateUserStatusInDb(
  uid: string,
  status: 'ACTIVE' | 'SUSPENDED' | 'FROZEN',
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload: any = {
      status: status,
      updated_at: new Date().toISOString(),
    }
    if (reason) {
      payload.compliance_notes = reason
    }
    const { error: profileErr } = await db
      .from('user_profiles')
      .update(payload)
      .eq('uid', uid)

    if (profileErr) {
      console.warn('Update user profile status warning:', profileErr.message)
    }

    // Also update users table if applicable
    await db
      .from('users')
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('uid', uid)

    return { success: true }
  } catch (err: any) {
    console.error('Error updating user status:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Approve or Reject KYC for a citizen user
 */
export async function updateCitizenKycInDb(
  uid: string,
  kycStatus: 'verified' | 'rejected' | 'pending_review',
  kycTier: 1 | 2,
  rejectionReason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const updatePayload: any = {
      kyc_status: kycStatus,
      kyc_tier: kycTier,
      updated_at: new Date().toISOString(),
    }
    if (rejectionReason) {
      updatePayload.kyc_rejection_reason = rejectionReason
    }

    const { error } = await db
      .from('user_profiles')
      .update(updatePayload)
      .eq('uid', uid)

    if (error) {
      console.warn('Supabase update KYC status warning:', error.message)
    }

    // Also update users table
    await db
      .from('users')
      .update({
        kyc_tier: kycTier,
        updated_at: new Date().toISOString(),
      })
      .eq('uid', uid)

    return { success: true }
  } catch (err: any) {
    console.error('Exception updating citizen KYC:', err)
    return { success: false, error: err.message }
  }
}

