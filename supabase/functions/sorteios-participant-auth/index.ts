import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, cpf, senha, nome, whatsapp, tenant_id } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!tenant_id) {
      return new Response(
        JSON.stringify({ success: false, message: "tenant_id é obrigatório." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "register") {
      if (!cpf || !senha || !nome || !whatsapp) {
        return new Response(
          JSON.stringify({ success: false, message: "Dados incompletos." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: existing } = await supabase
        .from("sorteios_participants")
        .select("id, nome, whatsapp, senha_hash")
        .eq("cpf", cpf)
        .eq("tenant_id", tenant_id)
        .maybeSingle();

      if (existing) {
        if (!existing.senha_hash) {
          await supabase.rpc("set_sorteio_participant_password", {
            p_participant_id: existing.id,
            p_senha: senha,
          });
        }
        return new Response(
          JSON.stringify({
            success: true,
            isExisting: true,
            participant: { id: existing.id, nome: existing.nome, whatsapp: existing.whatsapp },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: newP, error: insertErr } = await supabase
        .from("sorteios_participants")
        .insert({ nome: nome.trim(), cpf, whatsapp, tenant_id })
        .select("id")
        .single();

      if (insertErr) {
        return new Response(
          JSON.stringify({ success: false, message: "Erro ao cadastrar." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase.rpc("set_sorteio_participant_password", {
        p_participant_id: newP.id,
        p_senha: senha,
      });

      return new Response(
        JSON.stringify({
          success: true,
          isExisting: false,
          participant: { id: newP.id, nome: nome.trim() },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "login") {
      if (!cpf || !senha) {
        return new Response(
          JSON.stringify({ success: false, message: "CPF e senha são obrigatórios." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: result, error } = await supabase.rpc("verify_sorteio_participant_login", {
        p_cpf: cpf,
        p_senha: senha,
        p_tenant_id: tenant_id,
      });

      if (error) {
        return new Response(
          JSON.stringify({ success: false, message: "Erro na verificação." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify(result || { success: false, message: "Erro na verificação." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "Ação inválida." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: "Erro interno." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
