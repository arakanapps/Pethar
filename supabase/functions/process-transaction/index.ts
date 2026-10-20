// Péthar server-side AKD transfer endpoint.
// All funds movement is performed by a narrowly scoped, identity-bound SQL RPC.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',').map((origin) => origin.trim()).filter(Boolean)
const baseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, idempotency-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
  'Vary': 'Origin',
}
interface TransferRequest {
  recipient?: unknown
  amount?: unknown
  currency?: unknown
  note?: unknown
  pin?: unknown
  idempotency_key?: unknown
}

function respond(body: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers })
}

serve(async (req) => {
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
    if (!url || !anonKey) {
      console.error('Supabase endpoint configuration is missing')
      return respond({ success: false, message: 'Transfer service unavailable' }, 503, headers)
    }
    const supabase = createClient(url, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return respond({ success: false, message: 'Unauthorized' }, 401, headers)

    let body: TransferRequest
    try {
      body = await req.json() as TransferRequest
    } catch {
      return respond({ success: false, message: 'Invalid JSON body' }, 400, headers)
    }
    const recipient = typeof body.recipient === 'string' ? body.recipient.trim() : ''
    const amount = Number(body.amount)
    const pin = typeof body.pin === 'string' ? body.pin : ''
    const note = typeof body.note === 'string' ? body.note.trim().slice(0, 280) || null : null
    const headerIdempotencyKey = req.headers.get('Idempotency-Key') ?? ''
    const bodyIdempotencyKey = typeof body.idempotency_key === 'string' ? body.idempotency_key : ''
    if (headerIdempotencyKey && bodyIdempotencyKey && headerIdempotencyKey !== bodyIdempotencyKey) {
      return respond({ success: false, message: 'Idempotency keys do not match' }, 400, headers)
    }
    const idempotencyKey = headerIdempotencyKey || bodyIdempotencyKey

    if (body.currency !== 'AKD') return respond({ success: false, message: 'Only AKD transfers are enabled' }, 400, headers)
    if (!recipient || recipient.length > 128) return respond({ success: false, message: 'A valid recipient is required' }, 400, headers)
    if (!/^\d{6}$/.test(pin)) return respond({ success: false, message: 'A 6-digit PIN is required' }, 400, headers)
    if (!Number.isFinite(amount) || amount <= 0 || Math.round(amount * 100) !== amount * 100) {
      return respond({ success: false, message: 'Amount must be positive with at most two decimal places' }, 400, headers)
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotencyKey)) {
      return respond({ success: false, message: 'A valid idempotency key is required' }, 400, headers)
    }

    const { data: pinResult, error: pinError } = await supabase.rpc('verify_user_pin', { p_pin: pin })
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

    const { data, error } = await supabase.rpc('transfer_akd_idempotent', {
      p_recipient: recipient,
      p_amount: amount,
      p_idempotency_key: idempotencyKey,
      p_note: note,
    })
    if (error) {
      // Do not return raw database error details to an untrusted client.
      console.error('AKD transfer RPC failed:', error)
      return respond({ success: false, message: 'Transfer could not be completed' }, 400, headers)
    }
    if (!data || typeof data !== 'object' || (data as Record<string, unknown>).success !== true) {
      console.error('AKD transfer RPC returned an invalid result')
      return respond({ success: false, message: 'Transfer could not be completed' }, 502, headers)
    }
    return respond({ ...(data as Record<string, unknown>), success: true, currency: 'AKD', requires_approval: false }, 200, headers)
  } catch (error) {
    console.error('Transaction processing error:', error)
    return respond({ success: false, message: 'Internal server error' }, 500, headers)
  }
})
