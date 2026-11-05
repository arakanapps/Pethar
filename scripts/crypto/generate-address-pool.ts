/**
 * PeThar — OFFLINE deposit address pool generator (EVM / TRON / SOLANA).
 *
 * Derives PUBLIC deposit addresses from the custody master mnemonic and writes
 * a SQL file that inserts them into public.crypto_address_pool. Only public
 * addresses are written. Run this on an air-gapped / hardened machine; the
 * mnemonic must never be copied to Supabase, CI, or a developer laptop.
 *
 * Derivation paths (compatible with MetaMask / TronLink / Phantom):
 *   EVM     m/44'/60'/0'/0/i      (one address serves Ethereum, BSC, Polygon)
 *   TRON    m/44'/195'/0'/0/i
 *   SOLANA  m/44'/501'/i'/0'      (SLIP-0010 ed25519, hardened only)
 *
 * Usage:
 *   npx tsx scripts/crypto/generate-address-pool.ts --self-test
 *   npx tsx scripts/crypto/generate-address-pool.ts --new-mnemonic
 *   PETHAR_POOL_MNEMONIC_FILE=/secure/mnemonic.txt \
 *     npx tsx scripts/crypto/generate-address-pool.ts --start 0 --count 5000 --out pool.sql
 *
 * The mnemonic is read from the file named by PETHAR_POOL_MNEMONIC_FILE (never
 * from command-line arguments, which leak into shell history).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { HDKey } from '@scure/bip32'
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english'
import { keccak_256 } from '@noble/hashes/sha3'
import { sha256 } from '@noble/hashes/sha256'
import { hmac } from '@noble/hashes/hmac'
import { sha512 } from '@noble/hashes/sha512'
import { bytesToHex } from '@noble/hashes/utils'
import { secp256k1 } from '@noble/curves/secp256k1'
import { ed25519 } from '@noble/curves/ed25519'
import { base58 } from '@scure/base'

type Family = 'EVM' | 'TRON' | 'SOLANA'

// ── Derivation ──────────────────────────────────────────────────────────────

function secpAddressBytes(root: HDKey, path: string): Uint8Array {
  const node = root.derive(path)
  if (!node.publicKey) throw new Error(`No public key at ${path}`)
  const uncompressed = secp256k1.ProjectivePoint.fromHex(node.publicKey).toRawBytes(false)
  node.wipePrivateData()
  return keccak_256(uncompressed.slice(1)).slice(12)
}

export function evmAddress(root: HDKey, index: number): string {
  return '0x' + bytesToHex(secpAddressBytes(root, `m/44'/60'/0'/0/${index}`))
}

export function tronAddress(root: HDKey, index: number): string {
  const payload = new Uint8Array(21)
  payload[0] = 0x41
  payload.set(secpAddressBytes(root, `m/44'/195'/0'/0/${index}`), 1)
  const checksum = sha256(sha256(payload)).slice(0, 4)
  const full = new Uint8Array(25)
  full.set(payload)
  full.set(checksum, 21)
  return base58.encode(full)
}

/** SLIP-0010 ed25519 derivation (all segments hardened). */
function slip10Ed25519(seed: Uint8Array, segments: number[]): Uint8Array {
  let I = hmac(sha512, new TextEncoder().encode('ed25519 seed'), seed)
  let key = I.slice(0, 32)
  let chain = I.slice(32)
  for (const segment of segments) {
    const data = new Uint8Array(37)
    data[0] = 0
    data.set(key, 1)
    new DataView(data.buffer).setUint32(33, (segment | 0x80000000) >>> 0, false)
    I = hmac(sha512, chain, data)
    key.fill(0)
    key = I.slice(0, 32)
    chain = I.slice(32)
  }
  return key
}

export function solanaAddress(seed: Uint8Array, index: number): string {
  const priv = slip10Ed25519(seed, [44, 501, index, 0])
  const pub = ed25519.getPublicKey(priv)
  priv.fill(0)
  return base58.encode(pub)
}

// ── CLI ─────────────────────────────────────────────────────────────────────

function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : fallback
}

function selfTest() {
  // Public BIP-39 test mnemonic. NEVER use it for real funds.
  const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
  const seed = mnemonicToSeedSync(mnemonic)
  const root = HDKey.fromMasterSeed(seed)
  const vectors: [string, string, string][] = [
    ['EVM #0', evmAddress(root, 0), '0x9858effd232b4033e47d90003d41ec34ecaeda94'],
    ['TRON #0', tronAddress(root, 0), 'TUEZSdKsoDHQMeZwihtdoBiN46zxhGWYdH'],
    ['SOLANA #0', solanaAddress(seed, 0), 'HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk'],
  ]
  let ok = true
  for (const [label, got, want] of vectors) {
    const pass = got === want
    ok &&= pass
    console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}  ${got}${pass ? '' : `  (expected ${want})`}`)
  }
  process.exit(ok ? 0 : 1)
}

function main() {
  if (process.argv.includes('--self-test')) return selfTest()

  if (process.argv.includes('--new-mnemonic')) {
    console.error('WARNING: write this down offline and store it in your KMS/HSM backup procedure.')
    console.log(generateMnemonic(wordlist, 256))
    return
  }

  const file = process.env.PETHAR_POOL_MNEMONIC_FILE
  if (!file) throw new Error('Set PETHAR_POOL_MNEMONIC_FILE to the path of the mnemonic file')
  const mnemonic = readFileSync(file, 'utf8').trim().split(/\s+/).join(' ')
  if (!validateMnemonic(mnemonic, wordlist)) throw new Error('Invalid BIP-39 mnemonic')

  const start = Number(arg('start', '0'))
  const count = Number(arg('count', '1000'))
  const out = arg('out', `crypto_address_pool_${start}_${start + count - 1}.sql`)!
  if (!Number.isInteger(start) || start < 0 || !Number.isInteger(count) || count <= 0 || count > 100_000) {
    throw new Error('--start must be >= 0 and --count between 1 and 100000')
  }

  const seed = mnemonicToSeedSync(mnemonic)
  const root = HDKey.fromMasterSeed(seed)
  const rows: [Family, number, string][] = []
  for (let i = start; i < start + count; i++) {
    rows.push(['EVM', i, evmAddress(root, i)])
    rows.push(['TRON', i, tronAddress(root, i)])
    rows.push(['SOLANA', i, solanaAddress(seed, i)])
  }
  root.wipePrivateData()
  seed.fill(0)

  const lines = [
    `-- PeThar crypto_address_pool: indexes ${start}..${start + count - 1} (public addresses only)`,
    `-- Generated ${new Date().toISOString()}`,
    'BEGIN;',
  ]
  for (let i = 0; i < rows.length; i += 1000) {
    const chunk = rows.slice(i, i + 1000)
      .map(([f, idx, addr]) => `('${f}', ${idx}, '${addr}')`).join(',\n  ')
    lines.push(`INSERT INTO public.crypto_address_pool (family, hd_index, address) VALUES\n  ${chunk}\nON CONFLICT (family, hd_index) DO NOTHING;`)
  }
  lines.push('COMMIT;', '')
  writeFileSync(out, lines.join('\n'))
  console.log(`Wrote ${rows.length} addresses (${count} per family) to ${out}`)
}

main()
