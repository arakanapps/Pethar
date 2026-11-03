// Supabase Edge Function: verify-otp
// Verifies phone OTP token for authentication and agent cash-in/cash-out verification

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",").map((origin) => origin.trim()).filter(Boolean);
const baseHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

interface VerifyOtpRequest {
  phone: string;
  token: string;
  type?: "sms" | "phone_change";
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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const body: VerifyOtpRequest = await req.json() as VerifyOtpRequest;
    const { phone, token, type = "sms" } = body;

    if (!/^\+[1-9]\d{7,14}$/.test(phone) || !/^\d{6}$/.test(token)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: phone and token" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data, error } = await supabaseClient.auth.verifyOtp({
      phone,
      token,
      type,
    });

    if (error) {
      console.error("verifyOtp error:", error.code);
      return new Response(
        JSON.stringify({ error: "Invalid or expired verification code" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        session: data.session,
        user: data.user,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: unknown) {
    console.error("verify-otp error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
