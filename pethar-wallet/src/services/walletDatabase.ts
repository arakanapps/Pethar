import { supabase } from '../lib/supabase'
import type { Txn } from '../data'

// Dynamic query client to interface cleanly with live Supabase tables
const db = supabase as any

export interface DbUserProfile {
  id: string
  name: string
  phone: string
  ak_id: string
  username: string
  uid: string
  balance: number
  currency: string
  avatar_url?: string
  kyc_tier: number
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
      category: row.category || 'p2p',
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
 * Fetch user profile & wallet balance from Supabase
 */
export async function fetchUserProfileFromDb(): Promise<DbUserProfile | null> {
  try {
    const { data, error } = await db
      .from('user_profiles')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error) {
      console.warn('Supabase fetch user profile warning:', error.message)
      return null
    }

    if (!data) return null

    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      ak_id: data.ak_id,
      username: data.username,
      uid: data.uid,
      balance: parseFloat(data.balance),
      currency: data.currency,
      avatar_url: data.avatar_url,
      kyc_tier: data.kyc_tier,
    }
  } catch (err) {
    console.error('Error fetching user profile from Supabase:', err)
    return null
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
export async function fetchFavoriteContactsFromDb(): Promise<DbFavoriteContact[]> {
  try {
    const { data, error } = await db
      .from('favorite_contacts')
      .select('*')
      .order('created_at', { ascending: true })

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
            category: row.category || 'p2p',
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

