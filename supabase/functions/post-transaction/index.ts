// Supabase Edge Function: post-transaction
// Calls post_transaction() RPC to atomically record double-entry ledger transactions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const body: PostTransactionRequest = await req.json();
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

    // Call atomic PostgreSQL function post_transaction
    const { data, error } = await supabaseClient.rpc("post_transaction", {
      p_reference_id: reference_id,
      p_transaction_type: transaction_type,
      p_metadata: metadata,
      p_entries: entries,
    });

    if (error) {
      console.error("RPC post_transaction failed:", error);
      return new Response(
        JSON.stringify({ error: error.message, details: error.details }),
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
