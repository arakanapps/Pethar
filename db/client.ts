import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql, eq } from 'drizzle-orm';
import * as schema from '../drizzle/schema';
import { users, akdWallets, cryptoWallets, transactions } from '../drizzle/schema';

const connectionString =
  process.env.DATABASE_URL ||
  'postgres://postgres.uklqksioruxvatwpvopm:PetharEnterprise2026@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

// Initialize postgres client with Transaction pooler configuration
const client = postgres(connectionString, {
  prepare: false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
export { client, schema };
export * from '../drizzle/schema';

/**
 * Generate a deterministic or randomized public EVM-compatible blockchain deposit address
 */
export function generateBlockchainDepositAddress(userId: string): string {
  // Generates 0x-prefixed 40-char hex string derived from user UUID
  const cleanHex = userId.replace(/-/g, '').toLowerCase().padEnd(40, '0').slice(0, 40);
  return `0x${cleanHex}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVISIONING LOGIC: Dual-Wallet Setup (1:1 Relation with users.id)
// ─────────────────────────────────────────────────────────────────────────────
export async function provisionUserDualWallets(params: {
  userId: string;
  email: string;
  username?: string;
  fullName?: string;
}) {
  return await db.transaction(async (tx) => {
    // 1. Ensure user row exists in 'users'
    const [user] = await tx
      .insert(users)
      .values({
        id: params.userId,
        email: params.email.trim().toLowerCase(),
        username: params.username || params.email.split('@')[0],
        fullName: params.fullName || params.email.split('@')[0],
        status: 'active',
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          status: 'active',
          updatedAt: new Date(),
        },
      })
      .returning();

    // 2. Provision Main AKD Wallet (1:1 relation, $0.00 gas fees, 0.00 initial balance)
    const [akdWallet] = await tx
      .insert(akdWallets)
      .values({
        userId: user.id,
        currency: 'AKD',
        balance: '0.00',
        gasFeeRate: '0.00',
      })
      .onConflictDoUpdate({
        target: akdWallets.userId,
        set: { updatedAt: new Date() },
      })
      .returning();

    // 3. Provision Crypto USD Gateway Wallet (1:1 relation, USDT & USDC, generated public address)
    const depositAddress = generateBlockchainDepositAddress(user.id);
    const [cryptoWallet] = await tx
      .insert(cryptoWallets)
      .values({
        userId: user.id,
        depositAddress,
        usdtBalance: '0.00',
        usdcBalance: '0.00',
      })
      .onConflictDoUpdate({
        target: cryptoWallets.userId,
        set: { updatedAt: new Date() },
      })
      .returning();

    return {
      user,
      akdWallet,
      cryptoWallet,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1:1 IN-APP SWAP: CRYPTO TO AKD (Row-Level Locking FOR UPDATE)
// Prevents double-spending by acquiring exclusive row locks before balance checks
// ─────────────────────────────────────────────────────────────────────────────
export async function swapCryptoToAkd(params: {
  userId: string;
  amount: number;
  token: 'USDT' | 'USDC';
}) {
  if (params.amount <= 0) {
    throw new Error('Swap amount must be greater than 0.00');
  }

  const amtNumeric = params.amount.toFixed(2);

  return await db.transaction(async (tx) => {
    // 1. Acquire Row-Level Lock (FOR UPDATE) on Crypto USD Gateway Wallet
    const lockedCryptoWallets = await tx.execute(
      sql`SELECT id, user_id, usdt_balance, usdc_balance FROM crypto_wallets WHERE user_id = ${params.userId} FOR UPDATE`
    );

    if (!lockedCryptoWallets || lockedCryptoWallets.length === 0) {
      throw new Error('Crypto wallet not found for user');
    }

    const currentCrypto = lockedCryptoWallets[0] as any;
    const balanceKey = params.token === 'USDT' ? 'usdt_balance' : 'usdc_balance';
    const currentBalance = parseFloat(currentCrypto[balanceKey] || '0.00');

    if (currentBalance < params.amount) {
      throw new Error(`Insufficient ${params.token} balance for 1:1 in-app swap`);
    }

    // 2. Acquire Row-Level Lock (FOR UPDATE) on AKD Main Ledger Wallet
    const lockedAkdWallets = await tx.execute(
      sql`SELECT id, user_id, balance FROM akd_wallets WHERE user_id = ${params.userId} FOR UPDATE`
    );

    if (!lockedAkdWallets || lockedAkdWallets.length === 0) {
      throw new Error('AKD wallet not found for user');
    }

    // 3. 1:1 In-App Swap Balance Updates (Pure SQL ACID)
    if (params.token === 'USDT') {
      await tx.execute(
        sql`UPDATE crypto_wallets 
            SET usdt_balance = usdt_balance - ${amtNumeric}::numeric, updated_at = NOW() 
            WHERE user_id = ${params.userId}`
      );
    } else {
      await tx.execute(
        sql`UPDATE crypto_wallets 
            SET usdc_balance = usdc_balance - ${amtNumeric}::numeric, updated_at = NOW() 
            WHERE user_id = ${params.userId}`
      );
    }

    await tx.execute(
      sql`UPDATE akd_wallets 
          SET balance = balance + ${amtNumeric}::numeric, updated_at = NOW() 
          WHERE user_id = ${params.userId}`
    );

    // 4. Record 1:1 Swap Transaction ($0.00 gas fee)
    const [txRecord] = await tx
      .insert(transactions)
      .values({
        userId: params.userId,
        type: 'swap_crypto_to_akd',
        amount: amtNumeric,
        currency: params.token,
        fee: '0.00',
        status: 'completed',
        reference: `1:1 Swap: ${amtNumeric} ${params.token} -> ${amtNumeric} AKD`,
      })
      .returning();

    return {
      success: true,
      transaction: txRecord,
      swappedAmount: amtNumeric,
      fromCurrency: params.token,
      toCurrency: 'AKD',
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1:1 IN-APP SWAP: AKD TO CRYPTO (Row-Level Locking FOR UPDATE)
// ─────────────────────────────────────────────────────────────────────────────
export async function swapAkdToCrypto(params: {
  userId: string;
  amount: number;
  token: 'USDT' | 'USDC';
}) {
  if (params.amount <= 0) {
    throw new Error('Swap amount must be greater than 0.00');
  }

  const amtNumeric = params.amount.toFixed(2);

  return await db.transaction(async (tx) => {
    // 1. Acquire Row-Level Lock (FOR UPDATE) on AKD Main Ledger Wallet
    const lockedAkdWallets = await tx.execute(
      sql`SELECT id, user_id, balance FROM akd_wallets WHERE user_id = ${params.userId} FOR UPDATE`
    );

    if (!lockedAkdWallets || lockedAkdWallets.length === 0) {
      throw new Error('AKD wallet not found for user');
    }

    const currentAkd = lockedAkdWallets[0] as any;
    const currentBalance = parseFloat(currentAkd.balance || '0.00');

    if (currentBalance < params.amount) {
      throw new Error('Insufficient AKD balance for 1:1 in-app swap');
    }

    // 2. Acquire Row-Level Lock (FOR UPDATE) on Crypto USD Gateway Wallet
    const lockedCryptoWallets = await tx.execute(
      sql`SELECT id, user_id, usdt_balance, usdc_balance FROM crypto_wallets WHERE user_id = ${params.userId} FOR UPDATE`
    );

    if (!lockedCryptoWallets || lockedCryptoWallets.length === 0) {
      throw new Error('Crypto wallet not found for user');
    }

    // 3. 1:1 In-App Swap Balance Updates (Pure SQL ACID)
    await tx.execute(
      sql`UPDATE akd_wallets 
          SET balance = balance - ${amtNumeric}::numeric, updated_at = NOW() 
          WHERE user_id = ${params.userId}`
    );

    if (params.token === 'USDT') {
      await tx.execute(
        sql`UPDATE crypto_wallets 
            SET usdt_balance = usdt_balance + ${amtNumeric}::numeric, updated_at = NOW() 
            WHERE user_id = ${params.userId}`
      );
    } else {
      await tx.execute(
        sql`UPDATE crypto_wallets 
            SET usdc_balance = usdc_balance + ${amtNumeric}::numeric, updated_at = NOW() 
            WHERE user_id = ${params.userId}`
      );
    }

    // 4. Record 1:1 Swap Transaction ($0.00 gas fee)
    const [txRecord] = await tx
      .insert(transactions)
      .values({
        userId: params.userId,
        type: 'swap_akd_to_crypto',
        amount: amtNumeric,
        currency: 'AKD',
        fee: '0.00',
        status: 'completed',
        reference: `1:1 Swap: ${amtNumeric} AKD -> ${amtNumeric} ${params.token}`,
      })
      .returning();

    return {
      success: true,
      transaction: txRecord,
      swappedAmount: amtNumeric,
      fromCurrency: 'AKD',
      toCurrency: params.token,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// P2P INTERNAL AKD TRANSFER (Pure Relational SQL ACID, $0.00 Gas Fee)
// Row-Level Locking FOR UPDATE to completely prevent double-spending
// ─────────────────────────────────────────────────────────────────────────────
export async function transferAkdP2P(params: {
  senderUserId: string;
  recipientUserId: string;
  amount: number;
  reference?: string;
}) {
  if (params.amount <= 0) {
    throw new Error('Transfer amount must be greater than 0.00');
  }
  if (params.senderUserId === params.recipientUserId) {
    throw new Error('Cannot transfer to self');
  }

  const amtNumeric = params.amount.toFixed(2);

  return await db.transaction(async (tx) => {
    // Sort user IDs to enforce deterministic locking order and prevent deadlocks
    const [firstId, secondId] = [params.senderUserId, params.recipientUserId].sort();

    await tx.execute(
      sql`SELECT id, user_id, balance FROM akd_wallets WHERE user_id = ${firstId} FOR UPDATE`
    );
    await tx.execute(
      sql`SELECT id, user_id, balance FROM akd_wallets WHERE user_id = ${secondId} FOR UPDATE`
    );

    // Verify sender balance
    const senderRows = await tx.execute(
      sql`SELECT balance FROM akd_wallets WHERE user_id = ${params.senderUserId}`
    );
    const senderBalance = parseFloat((senderRows[0] as any)?.balance || '0.00');
    if (senderBalance < params.amount) {
      throw new Error('Insufficient AKD balance');
    }

    // Debit Sender
    await tx.execute(
      sql`UPDATE akd_wallets 
          SET balance = balance - ${amtNumeric}::numeric, updated_at = NOW() 
          WHERE user_id = ${params.senderUserId}`
    );

    // Credit Recipient ($0.00 Gas Fee)
    await tx.execute(
      sql`UPDATE akd_wallets 
          SET balance = balance + ${amtNumeric}::numeric, updated_at = NOW() 
          WHERE user_id = ${params.recipientUserId}`
    );

    // Record Transaction
    const [txRecord] = await tx
      .insert(transactions)
      .values({
        userId: params.senderUserId,
        senderUserId: params.senderUserId,
        recipientUserId: params.recipientUserId,
        type: 'p2p_transfer',
        amount: amtNumeric,
        currency: 'AKD',
        fee: '0.00',
        status: 'completed',
        reference: params.reference || `P2P Transfer: ${amtNumeric} AKD`,
      })
      .returning();

    return {
      success: true,
      transaction: txRecord,
    };
  });
}

export default db;
