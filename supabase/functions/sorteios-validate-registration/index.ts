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
    const { cpf, cupom, participant_id, sorteio_id, tenant_id } = await req.json();

    if (!cpf || !cupom || !tenant_id) {
      return new Response(
        JSON.stringify({ fraud: false, message: "Dados incompletos" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Check if participant is blocked
    const { data: participant } = await supabase
      .from("sorteios_participants")
      .select("id, status")
      .eq("cpf", cpf)
      .eq("tenant_id", tenant_id)
      .maybeSingle();

    if (participant?.status === "bloqueado") {
      await supabase.from("sorteios_fraud_logs").insert({
        participant_id: participant.id,
        tenant_id,
        tipo: "cpf_duplicado",
        detalhes: `CPF ${cpf} está bloqueado e tentou se cadastrar novamente.`,
      });

      return new Response(
        JSON.stringify({ fraud: true, message: "CPF bloqueado. Entre em contato com o suporte." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Validate cupom fiscal format
    const nfClean = cupom.trim();
    const isChaveNFCe = /^\d{44}$/.test(nfClean);
    if (!isChaveNFCe && (nfClean.length < 5 || !/^[A-Za-z0-9\-\.\/]+$/.test(nfClean))) {
      return new Response(
        JSON.stringify({ fraud: true, message: "Formato de cupom fiscal inválido." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Check for duplicate NF within tenant
    const { data: existingCoupon } = await supabase
      .from("sorteios_coupons")
      .select("id")
      .eq("cupom_numero", nfClean)
      .eq("tenant_id", tenant_id)
      .maybeSingle();

    if (existingCoupon) {
      const pid = participant_id || participant?.id;
      if (pid) {
        await supabase.from("sorteios_fraud_logs").insert({
          participant_id: pid,
          tenant_id,
          coupon_id: existingCoupon.id,
          tipo: "cupom_invalido",
          detalhes: `Cupom fiscal ${nfClean} já cadastrado anteriormente.`,
        });
      }

      return new Response(
        JSON.stringify({ fraud: true, message: "Este cupom fiscal já foi cadastrado." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Frequency check — more than 10 coupons in last 24h
    if (participant) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("sorteios_coupons")
        .select("id", { count: "exact", head: true })
        .eq("participant_id", participant.id)
        .eq("tenant_id", tenant_id)
        .gte("created_at", since);

      if (count && count >= 10) {
        await supabase.from("sorteios_fraud_logs").insert({
          participant_id: participant.id,
          tenant_id,
          tipo: "frequencia_anormal",
          detalhes: `CPF ${cpf} registrou ${count} cupons nas últimas 24h.`,
        });

        return new Response(
          JSON.stringify({ fraud: true, message: "Muitos cadastros em pouco tempo. Tente novamente mais tarde." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ fraud: false, message: "Validação aprovada", sorteio_id: sorteio_id || null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ fraud: false, message: "Erro na validação" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
