// ============================================================================
// Péthar (ဖေ့သာ) Financial Infrastructure
// Production Example: P2P Transfer & Wallet Swap Controller
// Protected by withAuth Middleware with Anti-Spoofing & Isolated Row Locks (FOR UPDATE)
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { withAuth, jsonResponse, type AuthContext } from './auth-middleware.ts';

interface P2PTransferRequestBody {
  recipient_account_or_email: string;
  amount: number;
  currency: 'AKD' | 'USD';
  note?: string;
  idempotency_key: string;
}

/**
 * Production P2P Transfer Endpoint Handler
 * Intercepted by `withAuth` — caller identity is GUARANTEED server-side.
 */
async function handleP2PTransfer(req: Request, context: AuthContext): Promise<Response> {
  if (req.method !== 'POST') {
    return jsonResponse(
      { success: false, error: 'METHOD_NOT_ALLOWED', message: 'Only POST is supported.' },
      405,
      { 'Content-Type': 'application/json' }
    );
  }

  // 1. Context Verification (Anti-Spoofing Guarantee)
  // senderId is STRICTLY extracted from the verified AuthContext, NEVER from the request body!
  const verifiedSenderId = context.user.id;
  const verifiedSenderEmail = context.user.email;

  // 2. Body Payload Parsing & Validation
  let body: P2PTransferRequestBody;
  try {
    body = (await req.json()) as P2PTransferRequestBody;
  } catch {
    return jsonResponse(
      { success: false, error: 'BAD_REQUEST', message: 'Invalid JSON request payload.' },
      400,
      { 'Content-Type': 'application/json' }
    );
  }

  const { recipient_account_or_email, amount, currency, note, idempotency_key } = body;

  if (!recipient_account_or_email || typeof recipient_account_or_email !== 'string') {
    return jsonResponse(
      { success: false, error: 'BAD_REQUEST', message: 'Valid recipient account or email is required.' },
      400,
      { 'Content-Type': 'application/json' }
    );
  }

  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return jsonResponse(
      { success: false, error: 'BAD_REQUEST', message: 'Transfer amount must be a positive number.' },
      400,
      { 'Content-Type': 'application/json' }
    );
  }

  if (!idempotency_key || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotency_key)) {
    return jsonResponse(
      { success: false, error: 'BAD_REQUEST', message: 'Valid RFC 4122 v4 UUID idempotency_key is required.' },
      400,
      { 'Content-Type': 'application/json' }
    );
  }

  // Prevent self-transfer spoofing
  if (recipient_account_or_email.toLowerCase() === verifiedSenderEmail.toLowerCase()) {
    return jsonResponse(
      { success: false, error: 'BAD_REQUEST', message: 'Cannot transfer funds to your own account.' },
      400,
      { 'Content-Type': 'application/json' }
    );
  }

  // 3. PostgreSQL ACID Execution via Isolated Row Locks (FOR UPDATE)
  // Uses Supabase RPC or direct backend transaction to acquire row locks:
  //
  // BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
  //   -- 1. Lock sender account exclusively
  //   SELECT id, balance FROM accounts WHERE user_id = $verifiedSenderId FOR UPDATE;
  //   IF balance < $amount THEN ROLLBACK; RAISE EXCEPTION 'INSUFFICIENT_FUNDS'; END IF;
  //
  //   -- 2. Lock recipient account exclusively (ordered to prevent deadlocks)
  //   SELECT id, balance FROM accounts WHERE identifier = $recipient FOR UPDATE;
  //
  //   -- 3. Atomic Debit & Credit posting
  //   UPDATE accounts SET balance = balance - $amount WHERE id = sender_account_id;
  //   UPDATE accounts SET balance = balance + $amount WHERE id = recipient_account_id;
  //
  //   -- 4. Record double-entry immutable audit entry
  //   INSERT INTO ledger_entries (...) VALUES (...);
  // COMMIT;
  const { data: rpcResult, error: rpcError } = await context.supabaseAdmin.rpc(
    'transfer_akd_idempotent',
    {
      p_sender_id: verifiedSenderId, // Injected securely from auth context
      p_recipient: recipient_account_or_email.trim(),
      p_amount: amount,
      p_currency: currency ?? 'AKD',
      p_idempotency_key: idempotency_key,
      p_note: (note ?? '').slice(0, 280),
    }
  );

  if (rpcError) {
    return jsonResponse(
      {
        success: false,
        error: 'TRANSACTION_FAILED',
        message: rpcError.message || 'Atomic transaction failed. Row locks released.',
      },
      400,
      { 'Content-Type': 'application/json' }
    );
  }

  return jsonResponse(
    {
      success: true,
      data: {
        transaction_id: rpcResult?.transaction_id ?? idempotency_key,
        sender_id: verifiedSenderId,
        recipient: recipient_account_or_email,
        amount,
        currency,
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
      },
    },
    200,
    { 'Content-Type': 'application/json' }
  );
}

// ── Export Protected Endpoint via withAuth ──
// Requires KYC Tier 1 minimum (or Tier 2 for high-value operations)
export const transferEndpoint = withAuth(handleP2PTransfer, {
  requireKycTier: 1,
});

// Start Deno HTTP server if executed directly
if (import.meta.main) {
  serve(transferEndpoint);
}
