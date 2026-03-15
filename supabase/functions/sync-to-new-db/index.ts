import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-new-key",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const newKey = req.headers.get("x-new-key");
  if (!newKey) return new Response(JSON.stringify({ error: "Header x-new-key obrigatório" }), {
    status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

  const oldSupabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const newSupabase = createClient("https://aocrxaercsmgcnybdsto.supabase.co", newKey);

  const { data: tableNames, error: tableError } = await oldSupabase.rpc("get_public_tables");
  if (tableError) return new Response(JSON.stringify({ error: tableError.message }), {
    status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

  const results: Record<string, any> = {};

  for (const tableName of tableNames) {
    let allRows: any[] = [];
    let from = 0;
    const PAGE = 1000;
    while (true) {
      const { data, error } = await oldSupabase.from(tableName).select("*").range(from, from + PAGE - 1);
      if (error) { results[tableName] = { error: error.message }; break; }
      if (!data || data.length === 0) break;
      allRows = allRows.concat(data);
      if (data.length < PAGE) break;
      from += PAGE;
    }

    if (allRows.length === 0) { results[tableName] = { synced: 0 }; continue; }

    const hasId = "id" in allRows[0];
    const BATCH = 500;
    let synced = 0;
    let err = null;

    for (let i = 0; i < allRows.length; i += BATCH) {
      const batch = allRows.slice(i, i + BATCH);
      const { error } = hasId
        ? await newSupabase.from(tableName).upsert(batch, { onConflict: "id", ignoreDuplicates: false })
        : await newSupabase.from(tableName).upsert(batch);
      if (error) { err = error.message; break; }
      synced += batch.length;
    }

    results[tableName] = err ? { error: err } : { synced };
  }

  const errors = Object.entries(results).filter(([, v]: any) => v.error);
  const totalSynced = Object.values(results).reduce((acc: number, v: any) => acc + (v.synced || 0), 0);

  return new Response(JSON.stringify({
    total_synced: totalSynced,
    errors: errors.length,
    details: results,
  }, null, 2), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
