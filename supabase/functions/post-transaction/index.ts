// Supabase Edge Function: post-transaction
// Calls post_transaction() RPC to atomically record double-entry ledger transactions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",").map((origin) => origin.trim()).filter(Boolean);
const baseHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

interface PostTransactionRequest {
  reference_id: string;
  transaction_type: string;
  metadata?: Record<string, unknown>;
  entries: Array<{
    account_id: string;
    amount: string | number;
  }>;
}

serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  const originAllowed = !origin || allowedOrigins.includes(origin);
  const corsHeaders = origin && originAllowed
    ? { ...baseHeaders, "Access-Control-Allow-Origin": origin }
    : baseHeaders;
  if (req.method === "OPTIONS") {
    return new Response(null, { status: originAllowed ? 204 : 403, headers: corsHeaders });
  }
  if (!originAllowed) {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!url || !anonKey) {
      console.error("Supabase endpoint configuration is missing");
      return new Response(JSON.stringify({ error: "Transaction service unavailable" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseClient = createClient(
      url,
      anonKey,
      {
        global: {
          headers: { Authorization: authorization },
        },
        auth: { persistSession: false, autoRefreshToken: false },
      }
    );
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: PostTransactionRequest = await req.json() as PostTransactionRequest;
    const { reference_id, transaction_type, metadata = {}, entries } = body;

    if (!reference_id || !transaction_type || !entries || !Array.isArray(entries)) {
      return new Response(
        JSON.stringify({
          error: "Invalid request payload. Required: reference_id, transaction_type, entries array.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (entries.length < 2) {
      return new Response(
        JSON.stringify({
          error: "Double-entry transaction requires at least 2 entries.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (
      entries.length > 10 ||
      entries.some(
        (entry) =>
          typeof entry.account_id !== "string" ||
          !entry.account_id ||
          !Number.isFinite(Number(entry.amount))
      )
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid transaction entries." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call atomic PostgreSQL function post_transaction
    const { data, error } = await supabaseClient.rpc("post_transaction", {
      p_reference_id: reference_id,
      p_transaction_type: transaction_type,
      p_metadata: metadata,
      p_entries: entries,
    });

    if (error) {
      console.error("RPC post_transaction failed:", error.code);
      return new Response(
        JSON.stringify({ error: "Transaction could not be completed." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: data,
        reference_id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("post-transaction error:", err);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
