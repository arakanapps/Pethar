// PeThar — shared multi-chain helpers for USDT / USDC custody edge functions.
// Address validation and minimal JSON-RPC clients. No key material is handled here.
import { keccak_256 } from 'npm:@noble/hashes@1.5.0/sha3'
import { sha256 } from 'npm:@noble/hashes@1.5.0/sha256'
import { bytesToHex, utf8ToBytes } from 'npm:@noble/hashes@1.5.0/utils'
import { base58 } from 'npm:@scure/base@1.1.9'

export type ChainFamily = 'EVM' | 'TRON' | 'SOLANA'
export type NetworkCode = 'ETHEREUM' | 'TRON' | 'BSC' | 'POLYGON' | 'SOLANA'
export type TokenSymbol = 'USDT' | 'USDC'

export const NETWORK_FAMILY: Record<NetworkCode, ChainFamily> = {
  ETHEREUM: 'EVM',
  BSC: 'EVM',
  POLYGON: 'EVM',
  TRON: 'TRON',
  SOLANA: 'SOLANA',
}

export const TOKENS: readonly TokenSymbol[] = ['USDT', 'USDC']

export function isNetworkCode(value: unknown): value is NetworkCode {
  return typeof value === 'string' && value in NETWORK_FAMILY
}

export function isTokenSymbol(value: unknown): value is TokenSymbol {
  return value === 'USDT' || value === 'USDC'
}

// ── Address validation ──────────────────────────────────────────────────────

/** EVM address with EIP-55 checksum enforcement for mixed-case input. */
export function isValidEvmAddress(address: string): boolean {
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) return false
  const body = address.slice(2)
  if (/^0+$/.test(body)) return false // zero address burns funds
  if (body === body.toLowerCase() || body === body.toUpperCase()) return true
  const hash = bytesToHex(keccak_256(utf8ToBytes(body.toLowerCase())))
  for (let i = 0; i < 40; i++) {
    const ch = body[i]
    if (/[a-fA-F]/.test(ch)) {
      const upper = parseInt(hash[i], 16) >= 8
      if (upper !== (ch === ch.toUpperCase())) return false
    }
  }
  return true
}

/** Tron base58check address (mainnet prefix 0x41, starts with "T"). */
export function isValidTronAddress(address: string): boolean {
  if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) return false
  try {
    const bytes = base58.decode(address)
    if (bytes.length !== 25 || bytes[0] !== 0x41) return false
    const payload = bytes.slice(0, 21)
    const checksum = sha256(sha256(payload)).slice(0, 4)
    return checksum.every((b, i) => b === bytes[21 + i])
  } catch {
    return false
  }
}

/** Solana base58 public key (32 bytes). */
export function isValidSolanaAddress(address: string): boolean {
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return false
  try {
    return base58.decode(address).length === 32
  } catch {
    return false
  }
}

export function isValidAddress(family: ChainFamily, address: string): boolean {
  switch (family) {
    case 'EVM':
      return isValidEvmAddress(address)
    case 'TRON':
      return isValidTronAddress(address)
    case 'SOLANA':
      return isValidSolanaAddress(address)
  }
}

export function normalizeAddress(family: ChainFamily, address: string): string {
  const trimmed = address.trim()
  return family === 'EVM' ? trimmed.toLowerCase() : trimmed
}

// ── JSON-RPC ────────────────────────────────────────────────────────────────

let rpcId = 0

export async function jsonRpc<T>(url: string, method: string, params: unknown[]): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++rpcId, method, params }),
  })
  if (!res.ok) throw new Error(`${method} HTTP ${res.status}`)
  const body = await res.json() as { result?: T; error?: { code: number; message: string } }
  if (body.error) throw new Error(`${method} RPC error ${body.error.code}: ${body.error.message}`)
  return body.result as T
}

/** Constant-time string comparison for shared secrets. */
export function safeEqual(a: string, b: string): boolean {
  const ab = utf8ToBytes(a)
  const bb = utf8ToBytes(b)
  if (ab.length !== bb.length) return false
  let diff = 0
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i]
  return diff === 0
}
