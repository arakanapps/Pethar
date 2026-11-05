// PeThar — Unified USDT / USDC multi-chain wallet edge function.
//
// Supported actions (POST JSON body `{ action: 'wallet' | 'provision' | 'withdraw', ... }`):
//   - 'wallet':    Returns balances, 5 networks (with assigned deposit addresses),
//                  and recent deposits/withdrawals via get_crypto_wallet().
//   - 'provision': Assigns EVM (ETH/BSC/POLYGON), TRON, and SOLANA deposit addresses
//                  from public.crypto_address_pool via provision_crypto_addresses().
//   - 'withdraw':  Validates destination address & 6-digit PIN, then places a ledger
//                  hold in SUSPENSE via service-role request_crypto_withdrawal().
import { createClient } from 'npm:@supabase/supabase-js@2'
import {
  isNetworkCode,
  isTokenSymbol,
  isValidAddress,
  NETWORK_FAMILY,
  normalizeAddress,
} from '../_shared/crypto-chains.ts'

const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',').map((origin) => origin.trim()).filter(Boolean)
const baseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, idempotency-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
  'Vary': 'Origin',
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const AMOUNT_RE = /^\d{1,12}(\.\d{1,6})?$/
const USER_SAFE_CODES = new Set(['22023', '42501', '53000'])

interface WalletRequest {
  action?: unknown
  network?: unknown
  token?: unknown
  to_address?: unknown
  amount?: unknown
  pin?: unknown
  idempotency_key?: unknown
}

function respond(body: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers })
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin')
  const originAllowed = !origin || allowedOrigins.includes(origin)
  const headers = origin && originAllowed
    ? { ...baseHeaders, 'Access-Control-Allow-Origin': origin }
    : baseHeaders
  if (req.method === 'OPTIONS') return new Response(null, { status: originAllowed ? 204 : 403, headers })
  if (!originAllowed) return respond({ success: false, message: 'Origin not allowed' }, 403, headers)
  if (req.method !== 'POST') return respond({ success: false, message: 'Method not allowed' }, 405, headers)

  try {
    const authorization = req.headers.get('Authorization')
    if (!authorization) return respond({ success: false, message: 'Unauthorized' }, 401, headers)

    const url = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !anonKey) {
      console.error('Supabase endpoint configuration is missing')
      return respond({ success: false, message: 'Crypto wallet service unavailable' }, 503, headers)
    }

    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) return respond({ success: false, message: 'Unauthorized' }, 401, headers)

    let body: WalletRequest = {}
    try {
      body = await req.json() as WalletRequest
    } catch {
      body = {}
    }

    const action = typeof body.action === 'string' ? body.action : 'wallet'

    if (action === 'wallet') {
      const { data, error } = await userClient.rpc('get_crypto_wallet')
      if (error) {
        console.error('get_crypto_wallet failed:', error)
        return respond({ success: false, message: 'Unable to load crypto wallet' }, 400, headers)
      }
      return respond({ ...(data as Record<string, unknown>), success: true }, 200, headers)
    }

    if (action === 'provision') {
      const { data, error } = await userClient.rpc('provision_crypto_addresses')
      if (error) {
        console.error('provision_crypto_addresses failed:', error)
        const safe = USER_SAFE_CODES.has(error.code ?? '')
        return respond({
          success: false,
          message: safe ? error.message : 'Unable to provision deposit addresses',
        }, 400, headers)
      }
      return respond({ ...(data as Record<string, unknown>), success: true }, 200, headers)
    }

    if (action === 'withdraw') {
      if (!serviceKey) {
        return respond({ success: false, message: 'Withdrawal service unavailable' }, 503, headers)
      }
      const headerKey = req.headers.get('Idempotency-Key') ?? ''
      const bodyKey = typeof body.idempotency_key === 'string' ? body.idempotency_key : ''
      if (headerKey && bodyKey && headerKey !== bodyKey) {
        return respond({ success: false, message: 'Idempotency keys do not match' }, 400, headers)
      }
      const idempotencyKey = headerKey || bodyKey
      const pin = typeof body.pin === 'string' ? body.pin : ''
      const amount = typeof body.amount === 'string' ? body.amount.trim()
        : typeof body.amount === 'number' ? String(body.amount) : ''
      const rawAddress = typeof body.to_address === 'string' ? body.to_address.trim() : ''

      if (!isNetworkCode(body.network)) return respond({ success: false, message: 'Unsupported network' }, 400, headers)
      if (!isTokenSymbol(body.token)) return respond({ success: false, message: 'Unsupported token' }, 400, headers)
      const family = NETWORK_FAMILY[body.network]
      if (!rawAddress || !isValidAddress(family, rawAddress)) {
        return respond({ success: false, message: `Invalid ${body.network} address` }, 400, headers)
      }
      if (!AMOUNT_RE.test(amount) || Number(amount) <= 0) {
        return respond({ success: false, message: 'Amount must be positive with at most 6 decimal places' }, 400, headers)
      }
      if (!/^\d{6}$/.test(pin)) return respond({ success: false, message: 'A 6-digit PIN is required' }, 400, headers)
      if (!UUID_RE.test(idempotencyKey)) {
        return respond({ success: false, message: 'A valid idempotency key is required' }, 400, headers)
      }

      const { data: pinResult, error: pinError } = await userClient.rpc('verify_user_pin', { p_pin: pin })
      if (pinError) {
        console.error('PIN verification failed:', pinError)
        return respond({ success: false, message: 'Unable to verify PIN' }, 503, headers)
      }
      if (pinResult?.valid !== true) {
        return respond({
          success: false,
          message: pinResult?.locked
            ? 'Account temporarily locked. Try again later.'
            : `Incorrect PIN. ${pinResult?.attempts_remaining ?? 0} attempts remaining.`,
          locked: Boolean(pinResult?.locked),
        }, 401, headers)
      }

      const admin = createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const { data, error } = await admin.rpc('request_crypto_withdrawal', {
        p_user_id: user.id,
        p_network: body.network,
        p_token: body.token,
        p_to_address: normalizeAddress(family, rawAddress),
        p_amount: amount,
        p_idempotency_key: idempotencyKey,
      })
      if (error) {
        console.error('request_crypto_withdrawal failed:', error)
        const safe = USER_SAFE_CODES.has(error.code ?? '')
        return respond({ success: false, message: safe ? error.message : 'Withdrawal could not be submitted' }, 400, headers)
      }
      return respond({ ...(data as Record<string, unknown>), success: true }, 200, headers)
    }

    return respond({ success: false, message: `Unknown action: ${action}` }, 400, headers)
  } catch (error) {
    console.error('Crypto wallet function error:', error)
    return respond({ success: false, message: 'Internal server error' }, 500, headers)
  }
})
