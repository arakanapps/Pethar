// PeThar — USDT / USDC deposit watcher for Ethereum, BSC, Polygon, Tron and Solana.
//
// Invoked on a schedule (pg_cron + pg_net) with header `x-watcher-secret`.
// Only confirmed/finalized transfers are recorded. Crediting is idempotent:
// record_crypto_deposit() has a unique key on (network, tx_hash, log_index, to).
//
// Required secrets:
//   CRYPTO_WATCHER_SECRET, ETH_RPC_URL, BSC_RPC_URL, POLYGON_RPC_URL,
//   SOLANA_RPC_URL, TRONGRID_API_KEY
// Optional tuning:
//   TRONGRID_URL (default https://api.trongrid.io), EVM_MAX_BLOCK_RANGE (2000),
//   ADDRESSES_PER_RUN (100), WATCHER_TIME_BUDGET_MS (50000)
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { jsonRpc, type NetworkCode, safeEqual } from '../_shared/crypto-chains.ts'

const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
const EVM_RPC_ENV: Record<string, string> = {
  ETHEREUM: 'ETH_RPC_URL',
  BSC: 'BSC_RPC_URL',
  POLYGON: 'POLYGON_RPC_URL',
}
const EVM_TOPIC_CHUNK = 200

const env = (key: string, fallback = '') => Deno.env.get(key) ?? fallback
const EVM_MAX_RANGE = Number(env('EVM_MAX_BLOCK_RANGE', '2000'))
const ADDRESSES_PER_RUN = Number(env('ADDRESSES_PER_RUN', '100'))
const TIME_BUDGET_MS = Number(env('WATCHER_TIME_BUDGET_MS', '50000'))

interface NetworkRow { code: NetworkCode; family: string; confirmations: number }
interface TokenRow { network_code: NetworkCode; symbol: string; contract_address: string }
interface AddressRow {
  id: string
  address: string
  scan_cursors: Record<string, string>
  created_at: string
}
interface Summary { network: string; credited: number; scanned: string; error?: string }

class Budget {
  private readonly deadline = Date.now() + TIME_BUDGET_MS
  get exhausted() { return Date.now() > this.deadline }
}

async function record(db: SupabaseClient, args: {
  network: string; token: string; txHash: string; logIndex: number
  from: string | null; to: string; raw: bigint; block?: number | null; time?: string | null
}): Promise<boolean> {
  const { data, error } = await db.rpc('record_crypto_deposit', {
    p_network: args.network,
    p_token: args.token,
    p_tx_hash: args.txHash,
    p_log_index: args.logIndex,
    p_from_address: args.from,
    p_to_address: args.to,
    p_raw_amount: args.raw.toString(),
    p_block_number: args.block ?? null,
    p_block_time: args.time ?? null,
  })
  if (error) throw new Error(`record_crypto_deposit: ${error.message}`)
  return data?.status === 'CREDITED' && !data?.duplicate
}

async function loadAllAddresses(db: SupabaseClient, network: string): Promise<string[]> {
  const out: string[] = []
  const page = 1000
  for (let from = 0; ; from += page) {
    const { data, error } = await db.from('crypto_deposit_addresses')
      .select('address').eq('network_code', network).order('id').range(from, from + page - 1)
    if (error) throw error
    out.push(...(data ?? []).map((r) => r.address as string))
    if (!data || data.length < page) return out
  }
}

async function loadAddressBatch(db: SupabaseClient, network: string): Promise<AddressRow[]> {
  const { data, error } = await db.from('crypto_deposit_addresses')
    .select('id,address,scan_cursors,created_at')
    .eq('network_code', network)
    .order('last_scanned_at', { ascending: true, nullsFirst: true })
    .limit(ADDRESSES_PER_RUN)
  if (error) throw error
  return (data ?? []) as AddressRow[]
}

async function saveAddressCursor(db: SupabaseClient, row: AddressRow) {
  const { error } = await db.from('crypto_deposit_addresses')
    .update({ scan_cursors: row.scan_cursors, last_scanned_at: new Date().toISOString() })
    .eq('id', row.id)
  if (error) throw error
}

// ── EVM (Ethereum / BSC / Polygon) ──────────────────────────────────────────

interface EvmLog { transactionHash: string; logIndex: string; blockNumber: string; topics: string[]; data: string }

async function scanEvm(db: SupabaseClient, net: NetworkRow, tokens: TokenRow[], budget: Budget): Promise<Summary> {
  const rpcUrl = env(EVM_RPC_ENV[net.code])
  if (!rpcUrl) return { network: net.code, credited: 0, scanned: 'skipped', error: `${EVM_RPC_ENV[net.code]} not set` }

  const latest = Number(BigInt(await jsonRpc<string>(rpcUrl, 'eth_blockNumber', [])))
  const safe = latest - net.confirmations
  const addresses = await loadAllAddresses(db, net.code)
  const topicChunks: string[][] = []
  for (let i = 0; i < addresses.length; i += EVM_TOPIC_CHUNK) {
    topicChunks.push(addresses.slice(i, i + EVM_TOPIC_CHUNK).map((a) => '0x' + a.slice(2).padStart(64, '0')))
  }

  let credited = 0
  const scanned: string[] = []
  for (const token of tokens) {
    const { data: cursorRow, error } = await db.from('crypto_scan_cursors')
      .select('last_block').eq('network_code', net.code).eq('token_symbol', token.symbol).maybeSingle()
    if (error) throw error

    let cursor: number
    if (!cursorRow) {
      // First run: start from the current safe head (no historical backfill).
      cursor = safe
      const { error: insErr } = await db.from('crypto_scan_cursors')
        .insert({ network_code: net.code, token_symbol: token.symbol, last_block: cursor })
      if (insErr) throw insErr
    } else {
      cursor = Number(cursorRow.last_block)
    }

    while (cursor < safe && !budget.exhausted) {
      const fromBlock = cursor + 1
      const toBlock = Math.min(safe, fromBlock + EVM_MAX_RANGE - 1)
      for (const topics of topicChunks) {
        const logs = await jsonRpc<EvmLog[]>(rpcUrl, 'eth_getLogs', [{
          address: token.contract_address,
          fromBlock: '0x' + fromBlock.toString(16),
          toBlock: '0x' + toBlock.toString(16),
          topics: [TRANSFER_TOPIC, null, topics],
        }])
        for (const log of logs) {
          if (log.topics.length < 3 || log.data === '0x') continue
          const raw = BigInt(log.data)
          if (raw <= 0n) continue
          if (await record(db, {
            network: net.code,
            token: token.symbol,
            txHash: log.transactionHash.toLowerCase(),
            logIndex: Number(BigInt(log.logIndex)),
            from: '0x' + log.topics[1].slice(26).toLowerCase(),
            to: '0x' + log.topics[2].slice(26).toLowerCase(),
            raw,
            block: Number(BigInt(log.blockNumber)),
          })) credited++
        }
      }
      cursor = toBlock
      const { error: upErr } = await db.from('crypto_scan_cursors')
        .update({ last_block: cursor, updated_at: new Date().toISOString() })
        .eq('network_code', net.code).eq('token_symbol', token.symbol)
      if (upErr) throw upErr
    }
    scanned.push(`${token.symbol}@${cursor}/${safe}`)
  }
  return { network: net.code, credited, scanned: scanned.join(' ') }
}

// ── Tron (TronGrid TRC-20 history per address) ──────────────────────────────

interface TronTransfer {
  transaction_id: string
  from: string
  to: string
  value: string
  block_timestamp: number
  token_info: { address: string }
}

async function scanTron(db: SupabaseClient, net: NetworkRow, tokens: TokenRow[], budget: Budget): Promise<Summary> {
  const apiKey = env('TRONGRID_API_KEY')
  if (!apiKey) return { network: net.code, credited: 0, scanned: 'skipped', error: 'TRONGRID_API_KEY not set' }
  const base = env('TRONGRID_URL', 'https://api.trongrid.io')

  let credited = 0
  let count = 0
  for (const row of await loadAddressBatch(db, net.code)) {
    if (budget.exhausted) break
    for (const token of tokens) {
      let minTs = Number(row.scan_cursors[token.symbol] ?? new Date(row.created_at).getTime())
      let fingerprint: string | undefined
      const perTx = new Map<string, number>()
      do {
        const qs = new URLSearchParams({
          only_confirmed: 'true',
          only_to: 'true',
          contract_address: token.contract_address,
          min_timestamp: String(minTs),
          order_by: 'block_timestamp,asc',
          limit: '200',
        })
        if (fingerprint) qs.set('fingerprint', fingerprint)
        const res = await fetch(`${base}/v1/accounts/${row.address}/transactions/trc20?${qs}`, {
          headers: { 'TRON-PRO-API-KEY': apiKey, Accept: 'application/json' },
        })
        if (!res.ok) throw new Error(`TronGrid HTTP ${res.status}`)
        const body = await res.json() as { data?: TronTransfer[]; meta?: { fingerprint?: string } }
        for (const t of body.data ?? []) {
          if (t.to !== row.address || t.token_info?.address !== token.contract_address) continue
          const raw = BigInt(t.value)
          if (raw <= 0n) continue
          const idx = perTx.get(t.transaction_id) ?? 0
          perTx.set(t.transaction_id, idx + 1)
          if (await record(db, {
            network: net.code, token: token.symbol, txHash: t.transaction_id, logIndex: idx,
            from: t.from, to: t.to, raw, time: new Date(t.block_timestamp).toISOString(),
          })) credited++
          minTs = Math.max(minTs, t.block_timestamp)
        }
        fingerprint = body.meta?.fingerprint
      } while (fingerprint && !budget.exhausted)
      // min_timestamp is inclusive; duplicates at the boundary are deduplicated in SQL.
      row.scan_cursors[token.symbol] = String(minTs)
    }
    await saveAddressCursor(db, row)
    count++
  }
  return { network: net.code, credited, scanned: `${count} addresses` }
}

// ── Solana (finalized signatures per token account) ─────────────────────────

interface SigInfo { signature: string; err: unknown; blockTime: number | null }
interface TokenBalance { accountIndex: number; mint: string; owner?: string; uiTokenAmount: { amount: string } }
interface SolTx {
  slot: number
  blockTime: number | null
  meta: { err: unknown; preTokenBalances?: TokenBalance[]; postTokenBalances?: TokenBalance[] } | null
}

async function scanSolana(db: SupabaseClient, net: NetworkRow, tokens: TokenRow[], budget: Budget): Promise<Summary> {
  const rpcUrl = env('SOLANA_RPC_URL')
  if (!rpcUrl) return { network: net.code, credited: 0, scanned: 'skipped', error: 'SOLANA_RPC_URL not set' }

  let credited = 0
  let count = 0
  for (const row of await loadAddressBatch(db, net.code)) {
    if (budget.exhausted) break
    const createdSec = Math.floor(new Date(row.created_at).getTime() / 1000)
    for (const token of tokens) {
      const accounts = await jsonRpc<{ value: { pubkey: string }[] }>(rpcUrl, 'getTokenAccountsByOwner', [
        row.address, { mint: token.contract_address }, { encoding: 'jsonParsed', commitment: 'finalized' },
      ])
      for (const { pubkey } of accounts.value) {
        const cursorKey = `${token.symbol}:${pubkey}`
        const until = row.scan_cursors[cursorKey]
        // Collect new signatures (newest first), paging backwards until the cursor.
        const sigs: SigInfo[] = []
        let before: string | undefined
        while (true) {
          const page = await jsonRpc<SigInfo[]>(rpcUrl, 'getSignaturesForAddress', [
            pubkey, { limit: 100, commitment: 'finalized', ...(until ? { until } : {}), ...(before ? { before } : {}) },
          ])
          sigs.push(...page)
          if (page.length < 100) break
          before = page[page.length - 1].signature
        }
        // Process oldest first so the cursor only advances past handled signatures.
        for (const sig of sigs.reverse()) {
          if (budget.exhausted) break
          if (!sig.err && (sig.blockTime ?? createdSec) >= createdSec) {
            const tx = await jsonRpc<SolTx | null>(rpcUrl, 'getTransaction', [
              sig.signature, { encoding: 'jsonParsed', commitment: 'finalized', maxSupportedTransactionVersion: 0 },
            ])
            if (tx && tx.meta && !tx.meta.err) {
              const pre = tx.meta.preTokenBalances ?? []
              const post = tx.meta.postTokenBalances ?? []
              for (const p of post) {
                if (p.mint !== token.contract_address || p.owner !== row.address) continue
                const prevBal = pre.find((b) => b.accountIndex === p.accountIndex)
                const delta = BigInt(p.uiTokenAmount.amount) - BigInt(prevBal?.uiTokenAmount.amount ?? '0')
                if (delta <= 0n) continue
                const sender = post.find((b) => {
                  if (b.mint !== token.contract_address || b.owner === row.address) return false
                  const prev = pre.find((x) => x.accountIndex === b.accountIndex)
                  return prev !== undefined && BigInt(prev.uiTokenAmount.amount) > BigInt(b.uiTokenAmount.amount)
                })
                if (await record(db, {
                  network: net.code, token: token.symbol, txHash: sig.signature, logIndex: p.accountIndex,
                  from: sender?.owner ?? null, to: row.address, raw: delta, block: tx.slot,
                  time: tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : null,
                })) credited++
              }
            }
          }
          row.scan_cursors[cursorKey] = sig.signature
        }
      }
    }
    await saveAddressCursor(db, row)
    count++
  }
  return { network: net.code, credited, scanned: `${count} addresses` }
}

// ── Entry point ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

  if (req.method !== 'POST') return json({ success: false, message: 'Method not allowed' }, 405)
  const secret = env('CRYPTO_WATCHER_SECRET')
  const provided = req.headers.get('x-watcher-secret') ?? ''
  if (!secret || secret.length < 32 || !safeEqual(provided, secret)) {
    return json({ success: false, message: 'Unauthorized' }, 401)
  }

  const url = env('SUPABASE_URL')
  const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !serviceKey) return json({ success: false, message: 'Service unavailable' }, 503)
  const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

  let only: string | undefined
  try {
    only = ((await req.json()) as { network?: string })?.network
  } catch { /* empty body = all networks */ }

  const { data: networks, error: netErr } = await db.from('crypto_networks')
    .select('code,family,confirmations').eq('enabled', true).order('sort_order')
  if (netErr) return json({ success: false, message: netErr.message }, 500)
  const { data: tokens, error: tokErr } = await db.from('crypto_tokens')
    .select('network_code,symbol,contract_address').eq('deposit_enabled', true)
  if (tokErr) return json({ success: false, message: tokErr.message }, 500)

  const budget = new Budget()
  const results = await Promise.all((networks as NetworkRow[])
    .filter((n) => !only || n.code === only)
    .map(async (net): Promise<Summary> => {
      const netTokens = (tokens as TokenRow[]).filter((t) => t.network_code === net.code)
      if (netTokens.length === 0) return { network: net.code, credited: 0, scanned: 'no tokens' }
      try {
        if (net.family === 'EVM') return await scanEvm(db, net, netTokens, budget)
        if (net.family === 'TRON') return await scanTron(db, net, netTokens, budget)
        return await scanSolana(db, net, netTokens, budget)
      } catch (e) {
        console.error(`[${net.code}] watcher error:`, e)
        return { network: net.code, credited: 0, scanned: 'error', error: (e as Error).message }
      }
    }))

  return json({ success: true, results })
})
