import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Check if any nos_admin already exists
    const { count, error: countError } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("user_type", "nos_admin");

    if (countError) throw countError;

    if ((count ?? 0) > 0) {
      return new Response(
        JSON.stringify({ error: "Bootstrap já foi realizado. Um administrador já existe." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Parse request body
    const { email, password, fullName } = await req.json();

    if (!email || !password || !fullName) {
      return new Response(
        JSON.stringify({ error: "Email, senha e nome completo são obrigatórios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Senha deve ter no mínimo 6 caracteres." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Create user via admin API (email auto-confirmed)
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError) {
      if (createError.message.includes("already been registered")) {
        return new Response(
          JSON.stringify({ error: "Este email já está cadastrado no sistema." }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw createError;
    }

    const userId = userData.user.id;

    // 4. Get the first tenant (main tenant)
    const { data: tenantData } = await supabaseAdmin
      .from("tenants")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const tenantId = tenantData?.id ?? null;

    // 5. Upsert profile (handle_new_user trigger may have created one)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        { user_id: userId, email, full_name: fullName },
        { onConflict: "user_id" }
      );

    if (profileError) {
      console.error("Profile upsert error:", profileError);
    }

    // 6. Upsert user_roles with nos_admin type + admin role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert(
        {
          user_id: userId,
          user_type: "nos_admin",
          role: "admin",
          tenant_id: tenantId,
          is_active: true,
        },
        { onConflict: "user_id" }
      );

    if (roleError) {
      console.error("Role upsert error:", roleError);
      throw roleError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Administrador raiz criado com sucesso.",
        userId,
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Bootstrap error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno ao criar administrador." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
