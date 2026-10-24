// ============================================================================
// Péthar (ဖေ့သာ) Financial Infrastructure
// Supabase API Endpoint Token Authorization Middleware (TypeScript / Node.js / Deno)
// Enforces Server-Side GoTrue Token Validation, Active User DB Check & Context Injection
// ============================================================================

import {
  createClient,
  type SupabaseClient,
  type User,
} from 'https://esm.sh/@supabase/supabase-js@2';

// ── Environment Helpers (Universal Deno / Node.js Support) ──

function getEnv(key: string, defaultValue = ''): string {
  // Check Deno environment (Supabase Edge runtime)
  try {
    if (typeof Deno !== 'undefined' && typeof Deno.env?.get === 'function') {
      return Deno.env.get(key) ?? defaultValue;
    }
  } catch (_) {
    // Graceful fallback if env permission is restricted
  }
  // Check Node.js process environment
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] ?? defaultValue;
    }
  } catch (_) {
    // Graceful fallback
  }
  return defaultValue;
}

// ── TypeScript Types & Interfaces ──

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'FROZEN' | 'CLOSED';

export interface AuthenticatedUser {
  /** Verified primary UUID key from auth and database ledger */
  readonly id: string;
  /** Verified primary email address */
  readonly email: string;
  /** Verified database account status, strictly 'ACTIVE' */
  readonly status: 'ACTIVE';
  /** KYC tier: 1 (Email verified), 2 (National ID / Passport verified) */
  readonly kycTier: number;
  /** Primary ledger wallet address / UID */
  readonly walletAddress: string;
  /** Supabase Auth Role (e.g., 'authenticated') */
  readonly role?: string;
  /** Raw GoTrue user payload verified server-side */
  readonly rawUser: User;
}

export interface AuthContext {
  /** Injected, cryptographically verified user identity */
  readonly user: AuthenticatedUser;
  /** Extracted raw Bearer JWT token */
  readonly token: string;
  /** Privileged Supabase client using Service Role key for atomic/ledger DB ops */
  readonly supabaseAdmin: SupabaseClient;
  /** User-scoped Supabase client initialized with the caller's verified Bearer token */
  readonly userClient: SupabaseClient;
}

export interface AuthMiddlewareOptions {
  /** Minimum KYC tier required for endpoint access (e.g. 2 for high-value P2P / Swaps) */
  readonly requireKycTier?: number;
  /** Allowed origins for CORS headers (defaults to ALLOWED_ORIGINS env var or '*') */
  readonly allowedOrigins?: string[];
  /** Override Supabase project URL */
  readonly supabaseUrl?: string;
  /** Override Supabase Anon Key */
  readonly supabaseAnonKey?: string;
  /** Override Supabase Service Role Key */
  readonly supabaseServiceRoleKey?: string;
}

export interface AuthErrorResponse {
  readonly success: false;
  readonly error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'INTERNAL_SERVER_ERROR';
  readonly code:
    | 'AUTH_HEADER_MISSING'
    | 'AUTH_HEADER_MALFORMED'
    | 'AUTH_INVALID_TOKEN'
    | 'AUTH_TOKEN_EXPIRED'
    | 'USER_NOT_REGISTERED'
    | 'ACCOUNT_NOT_ACTIVE'
    | 'INSUFFICIENT_KYC_TIER'
    | 'AUTH_SERVICE_UNAVAILABLE';
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

export type EdgeHandler = (
  req: Request,
  context: AuthContext
) => Promise<Response>;

// ── Strict Bearer Token Regex ──
// Matches standard base64url/RFC-7519 compact JWT tokens: header.payload.signature
const BEARER_TOKEN_REGEX =
  /^Bearer\s+([A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_.+/=]*)$/i;

// ── Security Headers & CORS ──

export function buildCorsHeaders(
  req: Request,
  allowedOrigins?: string[]
): Record<string, string> {
  const origin = req.headers.get('Origin') ?? '';
  const configuredOrigins =
    allowedOrigins ??
    getEnv('ALLOWED_ORIGINS', '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

  let allowOrigin = '*';
  if (configuredOrigins.length > 0) {
    allowOrigin = configuredOrigins.includes(origin) ? origin : configuredOrigins[0];
  } else if (origin) {
    allowOrigin = origin;
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type, idempotency-key, x-requested-with',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
    Vary: 'Origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  };
}

export function jsonResponse(
  body: unknown,
  status: number,
  headers: Record<string, string>
): Response {
  return new Response(JSON.stringify(body), { status, headers });
}

export function authErrorResponse(
  error: AuthErrorResponse,
  status: number,
  headers: Record<string, string>
): Response {
  return jsonResponse(error, status, headers);
}

// ── Core Step 1: Safe Header Extraction ──

export function extractBearerToken(req: Request):
  | { success: true; token: string }
  | { success: false; status: number; error: AuthErrorResponse } {
  const authHeader =
    req.headers.get('Authorization') ?? req.headers.get('authorization');

  if (!authHeader || authHeader.trim().length === 0) {
    return {
      success: false,
      status: 401,
      error: {
        success: false,
        error: 'UNAUTHORIZED',
        code: 'AUTH_HEADER_MISSING',
        message:
          'Authorization header with Bearer token is missing. Access denied.',
      },
    };
  }

  const match = authHeader.trim().match(BEARER_TOKEN_REGEX);
  if (!match || !match[1] || match[1].trim().length === 0) {
    return {
      success: false,
      status: 401,
      error: {
        success: false,
        error: 'UNAUTHORIZED',
        code: 'AUTH_HEADER_MALFORMED',
        message:
          "Malformed Authorization header. Format must strictly adhere to 'Bearer <jwt_token>'.",
      },
    };
  }

  return { success: true, token: match[1].trim() };
}

// ── Core Step 2 & 3: Server-Side Validation, Expiry & DB Status Check ──

export async function validateTokenAndUser(
  token: string,
  options?: AuthMiddlewareOptions
): Promise<
  | { success: true; context: AuthContext }
  | { success: false; status: number; error: AuthErrorResponse }
> {
  const supabaseUrl =
    options?.supabaseUrl ||
    getEnv('SUPABASE_URL') ||
    'https://uklqksioruxvatwpvopm.supabase.co';
  const supabaseAnonKey =
    options?.supabaseAnonKey ||
    getEnv('SUPABASE_ANON_KEY') ||
    'sb_publishable_rUiqzJYfjRLzNK0d6xyg-g_5Z6WmTya';
  const supabaseServiceRoleKey =
    options?.supabaseServiceRoleKey ||
    getEnv('SUPABASE_SERVICE_ROLE_KEY') ||
    supabaseAnonKey;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      success: false,
      status: 503,
      error: {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        code: 'AUTH_SERVICE_UNAVAILABLE',
        message: 'Authentication infrastructure configuration is unavailable.',
      },
    };
  }

  // 1. Initialise dedicated server-side Supabase clients
  // persistSession and autoRefreshToken are strictly disabled for serverless/edge environments
  const authVerificationClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  // 2. Server-Side Token Validation via Supabase GoTrue Auth
  // Cryptographically verifies JWT signature, iss, aud, exp without trusting client payload
  let verifiedAuthUser: User;
  try {
    const {
      data: { user },
      error: authError,
    } = await authVerificationClient.auth.getUser(token);

    if (authError || !user) {
      const isExpired =
        authError?.message?.toLowerCase().includes('expired') ?? false;
      return {
        success: false,
        status: 401,
        error: {
          success: false,
          error: 'UNAUTHORIZED',
          code: isExpired ? 'AUTH_TOKEN_EXPIRED' : 'AUTH_INVALID_TOKEN',
          message:
            authError?.message ||
            'The provided session token is invalid, expired, or tampered.',
        },
      };
    }
    verifiedAuthUser = user;
  } catch (err) {
    return {
      success: false,
      status: 401,
      error: {
        success: false,
        error: 'UNAUTHORIZED',
        code: 'AUTH_INVALID_TOKEN',
        message: 'Failed to authenticate token with identity provider.',
        details: { exception: err instanceof Error ? err.message : String(err) },
      },
    };
  }

  // 3. Database User Status & Session Integrity Check
  // Inspect authoritative public.users row using elevated service role client
  try {
    // Primary query by Auth UUID
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('users')
      .select('id, uid, email, status, kyc_tier, wallet_address')
      .eq('id', verifiedAuthUser.id)
      .maybeSingle();

    let userRecord = dbUser;

    // Fallback lookup by uid or email if UUID mapping is bridged
    if (!userRecord && !dbError) {
      const fallbackQuery = await supabaseAdmin
        .from('users')
        .select('id, uid, email, status, kyc_tier, wallet_address')
        .or(
          `uid.eq.${verifiedAuthUser.id}${
            verifiedAuthUser.email ? `,email.eq.${verifiedAuthUser.email}` : ''
          }`
        )
        .maybeSingle();
      userRecord = fallbackQuery.data;
    }

    if (!userRecord) {
      return {
        success: false,
        status: 401,
        error: {
          success: false,
          error: 'UNAUTHORIZED',
          code: 'USER_NOT_REGISTERED',
          message:
            'Authenticated identity has no corresponding ledger account registered.',
        },
      };
    }

    // Reject immediately if user status is NOT marked as 'ACTIVE'
    const status = (userRecord.status ?? '').trim().toUpperCase();
    if (status !== 'ACTIVE') {
      return {
        success: false,
        status: 403,
        error: {
          success: false,
          error: 'FORBIDDEN',
          code: 'ACCOUNT_NOT_ACTIVE',
          message: `User account is currently marked as ${
            status || 'INACTIVE'
          }. Financial operations are suspended.`,
        },
      };
    }

    // Enforce optional KYC Tier constraint (e.g. Tier 2 for P2P/Swaps)
    const requiredKyc = options?.requireKycTier ?? 1;
    const currentKyc = Number(userRecord.kyc_tier ?? 1);
    if (currentKyc < requiredKyc) {
      return {
        success: false,
        status: 403,
        error: {
          success: false,
          error: 'FORBIDDEN',
          code: 'INSUFFICIENT_KYC_TIER',
          message: `This operation requires KYC Level ${requiredKyc}. Current tier: ${currentKyc}.`,
        },
      };
    }

    // 4. Context Construction
    const authenticatedUser: AuthenticatedUser = {
      id: userRecord.id,
      email: userRecord.email ?? verifiedAuthUser.email ?? '',
      status: 'ACTIVE',
      kycTier: currentKyc,
      walletAddress:
        userRecord.wallet_address ||
        userRecord.uid ||
        userRecord.id,
      role: verifiedAuthUser.role,
      rawUser: verifiedAuthUser,
    };

    return {
      success: true,
      context: {
        user: authenticatedUser,
        token,
        supabaseAdmin,
        userClient,
      },
    };
  } catch (dbErr) {
    return {
      success: false,
      status: 500,
      error: {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        code: 'AUTH_SERVICE_UNAVAILABLE',
        message: 'Database identity verification encounter unexpected error.',
        details: { exception: dbErr instanceof Error ? dbErr.message : String(dbErr) },
      },
    };
  }
}

// ── Core Step 4: Context Injection Middleware Wrapper ──

/**
 * Higher-Order Function wrapping Supabase Edge Functions / Fetch API request handlers.
 * Intercepts requests, validates authorization, checks DB active status, and injects context.
 *
 * @example
 * ```ts
 * import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
 * import { withAuth } from '../auth-middleware.ts';
 *
 * serve(withAuth(async (req, { user, supabaseAdmin }) => {
 *   // user.id and user.email are 100% verified server-side.
 *   // Never trust or use client-supplied sender IDs!
 *   const senderId = user.id;
 *   return new Response(JSON.stringify({ success: true, senderId }));
 * }));
 * ```
 */
export function withAuth(
  handler: EdgeHandler,
  options?: AuthMiddlewareOptions
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    const corsHeaders = buildCorsHeaders(req, options?.allowedOrigins);

    // 1. Handle HTTP OPTIONS CORS preflight immediately
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 2. Safe Header Extraction
    const extractionResult = extractBearerToken(req);
    if (!extractionResult.success) {
      return authErrorResponse(
        extractionResult.error,
        extractionResult.status,
        corsHeaders
      );
    }

    // 3. Server-Side Token Validation & Active DB Status Verification
    const authResult = await validateTokenAndUser(
      extractionResult.token,
      options
    );
    if (!authResult.success) {
      return authErrorResponse(
        authResult.error,
        authResult.status,
        corsHeaders
      );
    }

    // 4. Context Injection into downstream controller
    try {
      const response = await handler(req, authResult.context);

      // Append security and CORS headers to the downstream response
      const augmentedHeaders = new Headers(response.headers);
      for (const [key, value] of Object.entries(corsHeaders)) {
        if (!augmentedHeaders.has(key)) {
          augmentedHeaders.set(key, value);
        }
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: augmentedHeaders,
      });
    } catch (handlerError) {
      return jsonResponse(
        {
          success: false,
          error: 'INTERNAL_SERVER_ERROR',
          message:
            handlerError instanceof Error
              ? handlerError.message
              : 'Unhandled controller error',
        },
        500,
        corsHeaders
      );
    }
  };
}

// ── Node.js / Express Middleware Adapter ──

export interface ExpressAuthenticatedRequest {
  headers: Record<string, string | string[] | undefined>;
  user?: AuthenticatedUser;
  authContext?: AuthContext;
  [key: string]: unknown;
}

export interface ExpressResponse {
  status(code: number): ExpressResponse;
  json(body: unknown): ExpressResponse;
  header(key: string, value: string): ExpressResponse;
}

export type ExpressNext = (err?: unknown) => void;

/**
 * Standard Node.js / Express middleware adapter.
 * Intercepts incoming requests, validates server-side token & DB status, and injects `req.user`.
 *
 * @example
 * ```ts
 * import express from 'express';
 * import { expressAuthMiddleware } from './auth-middleware.js';
 *
 * const app = express();
 * app.post('/api/p2p/transfer', expressAuthMiddleware(), async (req, res) => {
 *   const verifiedSenderId = req.user.id; // Spoof-proof verified identity
 *   // Execute atomic transaction...
 * });
 * ```
 */
export function expressAuthMiddleware(options?: AuthMiddlewareOptions) {
  return async (
    req: ExpressAuthenticatedRequest,
    res: ExpressResponse,
    next: ExpressNext
  ): Promise<void> => {
    const rawHeader = req.headers['authorization'];
    const authHeader = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

    if (!authHeader || !authHeader.trim()) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        code: 'AUTH_HEADER_MISSING',
        message: 'Authorization header is missing.',
      });
      return;
    }

    const match = authHeader.trim().match(BEARER_TOKEN_REGEX);
    if (!match || !match[1]) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        code: 'AUTH_HEADER_MALFORMED',
        message: "Invalid Authorization format. Expected 'Bearer <token>'.",
      });
      return;
    }

    const result = await validateTokenAndUser(match[1].trim(), options);
    if (!result.success) {
      res.status(result.status).json(result.error);
      return;
    }

    // Inject verified user and context into request object
    req.user = result.context.user;
    req.authContext = result.context;
    next();
  };
}
