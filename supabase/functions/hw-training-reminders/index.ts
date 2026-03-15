import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Find trainings with due_date in 3 days that are not completed
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    const dateStr = targetDate.toISOString().split("T")[0];

    const { data: trainings, error } = await supabase
      .from("hw_training_assignments")
      .select("id, user_id, tenant_id, training_title, due_date")
      .eq("due_date", dateStr)
      .neq("status", "completed");

    if (error) throw error;

    let notified = 0;

    for (const t of trainings || []) {
      await supabase.from("hw_notifications").insert({
        user_id: t.user_id,
        tenant_id: t.tenant_id,
        type: "training",
        title: "Treinamento vencendo em 3 dias",
        body: `O treinamento "${t.training_title}" vence em ${new Date(t.due_date).toLocaleDateString("pt-BR")}. Conclua antes do prazo.`,
        related_entity_type: "hw_training_assignments",
        related_entity_id: t.id,
      });
      notified++;
    }

    return new Response(JSON.stringify({ ok: true, notified }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
