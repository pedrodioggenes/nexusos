import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return new Response(
        JSON.stringify({ valid: false, error: "Code is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to access system_settings (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // --- Rate limiting ---
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("cf-connecting-ip")
      || "unknown";

    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

    const { count } = await supabaseAdmin
      .from("failed_access_attempts")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", clientIp)
      .gte("attempted_at", windowStart);

    if ((count ?? 0) >= MAX_ATTEMPTS) {
      return new Response(
        JSON.stringify({ valid: false, error: "Muitas tentativas. Tente novamente em alguns minutos." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Validate code ---
    const { data, error } = await supabaseAdmin
      .from("system_settings")
      .select("value")
      .eq("key", "console_access_code")
      .single();

    if (error) {
      console.error("Error fetching access code:", error);
      return new Response(
        JSON.stringify({ valid: false, error: "Could not validate code" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the stored value
    const storedCode = data?.value
      ? JSON.parse(JSON.stringify(data.value)).replace(/"/g, "")
      : null;

    const isValid = storedCode && code.trim() === storedCode.trim();

    // Track failed attempt
    if (!isValid) {
      await supabaseAdmin
        .from("failed_access_attempts")
        .insert({ ip_address: clientIp });

      // Cleanup old attempts (older than 1 hour)
      const cleanupThreshold = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      await supabaseAdmin
        .from("failed_access_attempts")
        .delete()
        .lt("attempted_at", cleanupThreshold);
    }

    return new Response(
      JSON.stringify({ valid: isValid }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ valid: false, error: "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
