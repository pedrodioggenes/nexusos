import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TENANT_ID = "11111111-1111-1111-1111-111111111111";

function uuid(ns: string, idx: number): string {
  const hex = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return Math.abs(h).toString(16).padStart(8, "0");
  };
  const key = `${ns}-${idx}`;
  const a = hex(key);
  const b = hex(key + "b");
  const c = hex(key + "c");
  const d = hex(key + "d");
  return `${a}-${b.slice(0, 4)}-4${b.slice(5, 8)}-a${c.slice(1, 4)}-${d}${a.slice(0, 4)}`;
}

function dateStr(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

function tsStr(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
}

async function safeInsert(sb: any, table: string, rows: any[]) {
  const { error } = await sb.from(table).insert(rows);
  if (error) {
    console.error(`[seed] ERROR inserting into ${table}:`, error.message, error.details);
    throw new Error(`Insert into ${table} failed: ${error.message}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    // ══════════════════════════════════════════════════════════════
    // CLEAN existing demo data
    // ══════════════════════════════════════════════════════════════
    const tablesToClean = [
      "compras_audit_log", "compras_executive_summary", "compras_kpi_snapshots",
      "compras_alerts", "compras_divergences", "compras_negotiations",
      "compras_trade_allowances", "compras_po_items", "compras_purchase_orders",
      "compras_price_history", "compras_supplier_scores",
      "compras_skus", "compras_suppliers",
    ];
    for (const t of tablesToClean) {
      await sb.from(t).delete().eq("tenant_id", TENANT_ID);
    }

    // ══════════════════════════════════════════════════════════════
    // SUPPLIERS (11)
    // Columns: id, tenant_id, name, cnpj, contact_email, contact_phone,
    //          payment_terms (text), lead_time_days, min_order_value,
    //          composite_score, classification, status, notes
    // ══════════════════════════════════════════════════════════════
    const suppliers = [
      { name: "Nestlé", cnpj: "60.409.075/0001-52", lead_time_days: 3, min_order_value: 5000, payment_terms: "30 DDL", composite_score: 88, status: "active", classification: "parceiro_estrategico" },
      { name: "Ambev", cnpj: "07.526.557/0001-00", lead_time_days: 2, min_order_value: 8000, payment_terms: "28 DDL", composite_score: 72, status: "active", classification: "padrao" },
      { name: "Coca-Cola FEMSA", cnpj: "45.997.418/0001-10", lead_time_days: 2, min_order_value: 6000, payment_terms: "35 DDL", composite_score: 91, status: "active", classification: "parceiro_estrategico" },
      { name: "Unilever", cnpj: "61.068.276/0001-04", lead_time_days: 4, min_order_value: 3000, payment_terms: "30 DDL", composite_score: 79, status: "active", classification: "padrao" },
      { name: "P&G Brasil", cnpj: "61.405.129/0001-73", lead_time_days: 5, min_order_value: 4000, payment_terms: "45 DDL", composite_score: 83, status: "active", classification: "parceiro_estrategico" },
      { name: "BRF S.A.", cnpj: "01.838.723/0001-27", lead_time_days: 2, min_order_value: 3000, payment_terms: "21 DDL", composite_score: 65, status: "active", classification: "observacao" },
      { name: "JBS S.A.", cnpj: "02.916.265/0001-60", lead_time_days: 2, min_order_value: 4000, payment_terms: "21 DDL", composite_score: 58, status: "active", classification: "observacao" },
      { name: "M. Dias Branco", cnpj: "07.206.816/0001-15", lead_time_days: 3, min_order_value: 2000, payment_terms: "30 DDL", composite_score: 94, status: "active", classification: "parceiro_estrategico" },
      { name: "Heineken Brasil", cnpj: "61.082.624/0001-74", lead_time_days: 3, min_order_value: 7000, payment_terms: "30 DDL", composite_score: 76, status: "active", classification: "padrao" },
      { name: "Camil Alimentos", cnpj: "64.904.295/0001-03", lead_time_days: 4, min_order_value: 2500, payment_terms: "28 DDL", composite_score: 81, status: "active", classification: "padrao" },
      { name: "Distribuidora Alfa", cnpj: "12.345.678/0001-90", lead_time_days: 7, min_order_value: 1000, payment_terms: "14 DDL", composite_score: 42, status: "inactive", classification: "em_risco" },
    ].map((s, i) => ({ id: uuid("sup", i), tenant_id: TENANT_ID, ...s }));

    await safeInsert(sb, "compras_suppliers", suppliers);

    // ══════════════════════════════════════════════════════════════
    // SUPPLIER SCORES (3 periods × 11 suppliers = 33)
    // ══════════════════════════════════════════════════════════════
    const periods = [dateStr(-90), dateStr(-60), dateStr(-30)];
    const scores: any[] = [];
    let scoreIdx = 0;
    for (const sup of suppliers) {
      for (const period of periods) {
        const base = sup.composite_score;
        scores.push({
          id: uuid("ssc", scoreIdx++),
          tenant_id: TENANT_ID,
          supplier_id: sup.id,
          period,
          score_preco: Math.min(100, base + Math.round(Math.random() * 10 - 5)),
          score_otif: Math.min(100, base + Math.round(Math.random() * 8 - 4)),
          score_qualidade: Math.min(100, base + Math.round(Math.random() * 6 - 3)),
          score_responsividade: Math.min(100, base + Math.round(Math.random() * 12 - 6)),
          score_comercial: Math.min(100, base + Math.round(Math.random() * 8 - 4)),
          composite_score: base + Math.round(Math.random() * 4 - 2),
        });
      }
    }
    await safeInsert(sb, "compras_supplier_scores", scores);

    // ══════════════════════════════════════════════════════════════
    // SKUs (~53)
    // Columns: id, tenant_id, code, name, category, unit,
    //          primary_supplier_id, avg_cta, last_price,
    //          coverage_min_days, coverage_max_days, avg_daily_demand, is_active
    // ══════════════════════════════════════════════════════════════
    const skuDefs = [
      { name: "Nescafé Tradição 200g", code: "NEST001", category: "Mercearia", sup: 0, lastPrice: 18.50 },
      { name: "Leite Moça 395g", code: "NEST002", category: "Mercearia", sup: 0, lastPrice: 8.90 },
      { name: "Neston 3 Cereais 400g", code: "NEST003", category: "Mercearia", sup: 0, lastPrice: 12.40 },
      { name: "KitKat 41.5g", code: "NEST004", category: "Mercearia", sup: 0, lastPrice: 3.20 },
      { name: "Maggi Tempero 50g", code: "NEST005", category: "Mercearia", sup: 0, lastPrice: 2.80 },
      { name: "Brahma 350ml (Lata)", code: "AMBV001", category: "Bebidas", sup: 1, lastPrice: 2.90 },
      { name: "Skol 350ml (Lata)", code: "AMBV002", category: "Bebidas", sup: 1, lastPrice: 2.70 },
      { name: "Guaraná Antarctica 2L", code: "AMBV003", category: "Bebidas", sup: 1, lastPrice: 7.50 },
      { name: "Pepsi 2L", code: "AMBV004", category: "Bebidas", sup: 1, lastPrice: 6.80 },
      { name: "Budweiser 350ml", code: "AMBV005", category: "Bebidas", sup: 1, lastPrice: 3.40 },
      { name: "Coca-Cola 2L", code: "COCA001", category: "Bebidas", sup: 2, lastPrice: 9.90 },
      { name: "Coca-Cola Zero 350ml", code: "COCA002", category: "Bebidas", sup: 2, lastPrice: 3.50 },
      { name: "Fanta Laranja 2L", code: "COCA003", category: "Bebidas", sup: 2, lastPrice: 7.20 },
      { name: "Del Valle Uva 1L", code: "COCA004", category: "Bebidas", sup: 2, lastPrice: 6.40 },
      { name: "Sprite 2L", code: "COCA005", category: "Bebidas", sup: 2, lastPrice: 7.00 },
      { name: "Crystal 1.5L", code: "COCA006", category: "Bebidas", sup: 2, lastPrice: 2.10 },
      { name: "OMO Lavagem Perfeita 1.6kg", code: "UNVR001", category: "HPC", sup: 3, lastPrice: 22.90 },
      { name: "Dove Sabonete 90g", code: "UNVR002", category: "HPC", sup: 3, lastPrice: 3.80 },
      { name: "Rexona Aerosol 150ml", code: "UNVR003", category: "HPC", sup: 3, lastPrice: 14.90 },
      { name: "Seda Shampoo 325ml", code: "UNVR004", category: "HPC", sup: 3, lastPrice: 11.50 },
      { name: "Hellmanns Maionese 500g", code: "UNVR005", category: "Mercearia", sup: 3, lastPrice: 9.20 },
      { name: "Pampers Premium XXG 30un", code: "PG001", category: "HPC", sup: 4, lastPrice: 44.90 },
      { name: "Gillette Mach3 2un", code: "PG002", category: "HPC", sup: 4, lastPrice: 19.90 },
      { name: "Oral-B Pro-Saúde", code: "PG003", category: "HPC", sup: 4, lastPrice: 8.50 },
      { name: "Ariel Líquido 1.2L", code: "PG004", category: "HPC", sup: 4, lastPrice: 18.90 },
      { name: "Head & Shoulders 200ml", code: "PG005", category: "HPC", sup: 4, lastPrice: 16.90 },
      { name: "Sadia Peito de Frango 1kg", code: "BRF001", category: "Frios", sup: 5, lastPrice: 22.90 },
      { name: "Perdigão Salsicha 500g", code: "BRF002", category: "Frios", sup: 5, lastPrice: 8.40 },
      { name: "Sadia Presunto 200g", code: "BRF003", category: "Frios", sup: 5, lastPrice: 7.90 },
      { name: "Qualy 500g", code: "BRF004", category: "Frios", sup: 5, lastPrice: 9.80 },
      { name: "Perdigão Nuggets 300g", code: "BRF005", category: "Frios", sup: 5, lastPrice: 14.50 },
      { name: "Friboi Coxão Mole 1kg", code: "JBS001", category: "Frios", sup: 6, lastPrice: 42.90 },
      { name: "Seara Presunto 200g", code: "JBS002", category: "Frios", sup: 6, lastPrice: 7.50 },
      { name: "Swift Hambúrguer 672g", code: "JBS003", category: "Frios", sup: 6, lastPrice: 19.90 },
      { name: "Seara Linguiça 500g", code: "JBS004", category: "Frios", sup: 6, lastPrice: 12.90 },
      { name: "Friboi Picanha 1kg", code: "JBS005", category: "Frios", sup: 6, lastPrice: 69.90 },
      { name: "Adria Penne 500g", code: "MDIA001", category: "Mercearia", sup: 7, lastPrice: 4.20 },
      { name: "Fortaleza Biscoito Cream Cracker", code: "MDIA002", category: "Mercearia", sup: 7, lastPrice: 3.50 },
      { name: "Piraquê Biscoito Wafer", code: "MDIA003", category: "Mercearia", sup: 7, lastPrice: 4.80 },
      { name: "Vitarella Macarrão 500g", code: "MDIA004", category: "Mercearia", sup: 7, lastPrice: 3.90 },
      { name: "Adria Farinha de Trigo 1kg", code: "MDIA005", category: "Mercearia", sup: 7, lastPrice: 5.60 },
      { name: "Heineken 350ml (Lata)", code: "HNKN001", category: "Bebidas", sup: 8, lastPrice: 4.50 },
      { name: "Amstel 350ml", code: "HNKN002", category: "Bebidas", sup: 8, lastPrice: 3.20 },
      { name: "Sol Premium 350ml", code: "HNKN003", category: "Bebidas", sup: 8, lastPrice: 2.80 },
      { name: "Devassa 350ml", code: "HNKN004", category: "Bebidas", sup: 8, lastPrice: 2.60 },
      { name: "Camil Arroz Tipo 1 5kg", code: "CAML001", category: "Mercearia", sup: 9, lastPrice: 27.90 },
      { name: "Camil Feijão Carioca 1kg", code: "CAML002", category: "Mercearia", sup: 9, lastPrice: 8.90 },
      { name: "Camil Açúcar 1kg", code: "CAML003", category: "Mercearia", sup: 9, lastPrice: 4.50 },
      { name: "Coqueiro Atum 170g", code: "CAML004", category: "Mercearia", sup: 9, lastPrice: 9.80 },
      { name: "Camil Feijão Preto 1kg", code: "CAML005", category: "Mercearia", sup: 9, lastPrice: 9.40 },
      { name: "Produto Genérico A", code: "ALFA001", category: "Multi", sup: 10, lastPrice: 5.00 },
      { name: "Produto Genérico B", code: "ALFA002", category: "Multi", sup: 10, lastPrice: 8.00 },
      { name: "Produto Genérico C", code: "ALFA003", category: "Multi", sup: 10, lastPrice: 3.50 },
    ];

    const skus = skuDefs.map((s, i) => ({
      id: uuid("sku", i),
      tenant_id: TENANT_ID,
      name: s.name,
      code: s.code,
      category: s.category,
      unit: "UN",
      primary_supplier_id: suppliers[s.sup].id,
      last_price: s.lastPrice,
      avg_cta: +(s.lastPrice * (1.02 + Math.random() * 0.06)).toFixed(2),
      coverage_min_days: s.category === "Frios" ? 7 : 15,
      coverage_max_days: s.category === "Frios" ? 21 : 45,
      avg_daily_demand: +(5 + Math.random() * 25).toFixed(1),
      is_active: true,
    }));
    for (let i = 0; i < skus.length; i += 20) {
      await safeInsert(sb, "compras_skus", skus.slice(i, i + 20));
    }

    // ══════════════════════════════════════════════════════════════
    // PRICE HISTORY (~318 records, 6 months)
    // Columns: id, tenant_id, sku_id, supplier_id, price, effective_date
    // ══════════════════════════════════════════════════════════════
    const priceHistory: any[] = [];
    let phIdx = 0;
    for (const sku of skus) {
      const base = sku.last_price;
      for (let m = 5; m >= 0; m--) {
        const drift = 1 + (Math.random() * 0.08 - 0.04) * (5 - m);
        priceHistory.push({
          id: uuid("ph", phIdx++),
          tenant_id: TENANT_ID,
          sku_id: sku.id,
          supplier_id: sku.primary_supplier_id,
          price: +(base * drift).toFixed(2),
          recorded_at: dateStr(-m * 30),
        });
      }
    }
    for (let i = 0; i < priceHistory.length; i += 50) {
      await safeInsert(sb, "compras_price_history", priceHistory.slice(i, i + 50));
    }

    // ══════════════════════════════════════════════════════════════
    // PURCHASE ORDERS (30)
    // Columns: id, tenant_id, po_number, supplier_id, status,
    //          total_value, ppv_total, expected_date, notes
    // ══════════════════════════════════════════════════════════════
    const poStatuses = ["draft", "pending_approval", "approved", "sent", "received", "received", "received", "divergent", "cancelled"];
    const purchaseOrders: any[] = [];
    for (let i = 0; i < 30; i++) {
      const supIdx = i % 10;
      const status = poStatuses[i % poStatuses.length];
      const daysAgo = Math.round(Math.random() * 60);
      const totalValue = 5000 + Math.round(Math.random() * 45000);
      purchaseOrders.push({
        id: uuid("po", i),
        tenant_id: TENANT_ID,
        po_number: `OC-2026-${String(i + 1).padStart(4, "0")}`,
        supplier_id: suppliers[supIdx].id,
        status,
        total_value: totalValue,
        ppv_total: +(Math.random() * 2000 - 500).toFixed(2),
        expected_date: tsStr(-daysAgo + suppliers[supIdx].lead_time_days),
        notes: `Pedido para ${suppliers[supIdx].name}`,
        created_at: tsStr(-daysAgo),
      });
    }
    await safeInsert(sb, "compras_purchase_orders", purchaseOrders);

    // ══════════════════════════════════════════════════════════════
    // PO ITEMS (~131)
    // Columns: id, tenant_id, purchase_order_id, sku_id, quantity,
    //          negotiated_price, reference_price, ppv, cta_estimated, gmroi_projected
    // ══════════════════════════════════════════════════════════════
    const poItems: any[] = [];
    let piIdx = 0;
    for (const po of purchaseOrders) {
      const supSkus = skus.filter(s => s.primary_supplier_id === po.supplier_id);
      const itemCount = Math.min(supSkus.length, 3 + Math.round(Math.random() * 3));
      for (let j = 0; j < itemCount; j++) {
        const sku = supSkus[j % supSkus.length];
        const qty = 10 + Math.round(Math.random() * 90);
        const negPrice = sku.last_price * (0.95 + Math.random() * 0.1);
        const refPrice = sku.last_price;
        poItems.push({
          id: uuid("pi", piIdx++),
          tenant_id: TENANT_ID,
          purchase_order_id: po.id,
          sku_id: sku.id,
          qty: qty,
          unit_price: +negPrice.toFixed(2),
          reference_price: +refPrice.toFixed(2),
          ppv: +((negPrice - refPrice) * qty).toFixed(2),
          cta_estimated: +(negPrice * 1.05).toFixed(2),
          gmroi_projected: +(1.2 + Math.random() * 2.5).toFixed(2),
        });
      }
    }
    for (let i = 0; i < poItems.length; i += 50) {
      await safeInsert(sb, "compras_po_items", poItems.slice(i, i + 50));
    }

    // ══════════════════════════════════════════════════════════════
    // TRADE ALLOWANCES (15)
    // Columns: id, tenant_id, supplier_id, type, description,
    //          fiscal_type, start_date, end_date, is_conditional,
    //          planned_value, realized_value, adherence_pct, status
    // ══════════════════════════════════════════════════════════════
    const allowanceTypes = ["rebate", "bonificacao", "desconto_volume", "verba_marketing", "bonificacao"];
    const allowances: any[] = [];
    for (let i = 0; i < 15; i++) {
      const supIdx = i % 10;
      const planned = 2000 + Math.round(Math.random() * 18000);
      const realizationRate = 0.3 + Math.random() * 0.7;
      const isActive = i < 10;
      allowances.push({
        id: uuid("ta", i),
        tenant_id: TENANT_ID,
        supplier_id: suppliers[supIdx].id,
        type: allowanceTypes[i % allowanceTypes.length],
        description: `Verba ${allowanceTypes[i % allowanceTypes.length]} — ${suppliers[supIdx].name}`,
        start_date: dateStr(isActive ? -90 : -180),
        end_date: dateStr(isActive ? (i < 3 ? 10 : 60) : -30),
        is_conditional: i % 3 === 0,
        planned_value: planned,
        realized_value: +(planned * realizationRate).toFixed(2),
        adherence_pct: +(realizationRate * 100).toFixed(1),
        status: isActive ? "active" : "expired",
      });
    }
    await safeInsert(sb, "compras_trade_allowances", allowances);

    // ══════════════════════════════════════════════════════════════
    // DIVERGENCES (25)
    // Columns: id, tenant_id, supplier_id, purchase_order_id, sku_id,
    //          type, qty_expected, qty_received, value_impact,
    //          action_taken, notes
    // ══════════════════════════════════════════════════════════════
    const divTypes = ["qty_mismatch", "price_mismatch", "quality_issue", "missing_item", "wrong_item"];
    const divActions = ["credit_note", "replacement", "accepted", "return", "pending"];
    const divergences: any[] = [];
    for (let i = 0; i < 25; i++) {
      const supIdx = i % 10;
      const poIdx = i % purchaseOrders.length;
      const supSkus = skus.filter(s => s.primary_supplier_id === suppliers[supIdx].id);
      divergences.push({
        id: uuid("dv", i),
        tenant_id: TENANT_ID,
        supplier_id: suppliers[supIdx].id,
        purchase_order_id: purchaseOrders[poIdx].id,
        sku_id: supSkus.length > 0 ? supSkus[i % supSkus.length].id : skus[0].id,
        type: divTypes[i % divTypes.length],
        qty_expected: 50 + Math.round(Math.random() * 50),
        qty_received: 30 + Math.round(Math.random() * 50),
        value_impact: +(Math.random() * 3000).toFixed(2),
        action_taken: divActions[i % divActions.length],
        notes: `Divergência detectada na OC ${purchaseOrders[poIdx].po_number}`,
        created_at: tsStr(-Math.round(Math.random() * 45)),
      });
    }
    await safeInsert(sb, "compras_divergences", divergences);

    // ══════════════════════════════════════════════════════════════
    // NEGOTIATIONS (20)
    // Columns: id, tenant_id, supplier_id, title, type, status,
    //          original_value, negotiated_value, saving_value, saving_pct, notes
    // ══════════════════════════════════════════════════════════════
    const negStatuses = ["planned", "in_progress", "completed", "completed", "cancelled"];
    const negTypes = ["preco", "prazo", "verba", "volume", "condicoes"];
    const negotiations: any[] = [];
    for (let i = 0; i < 20; i++) {
      const supIdx = i % 10;
      const originalValue = 10000 + Math.round(Math.random() * 40000);
      const isCompleted = negStatuses[i % negStatuses.length] === "completed";
      const savingPct = isCompleted ? +(2 + Math.random() * 8).toFixed(1) : null;
      const savingValue = isCompleted ? +(originalValue * (savingPct! / 100)).toFixed(2) : null;
      const negotiatedValue = isCompleted ? +(originalValue - (savingValue || 0)).toFixed(2) : null;
      negotiations.push({
        id: uuid("neg", i),
        tenant_id: TENANT_ID,
        supplier_id: suppliers[supIdx].id,
        title: `Negociação ${negTypes[i % 5]} — ${suppliers[supIdx].name}`,
        type: negTypes[i % 5],
        status: negStatuses[i % negStatuses.length],
        original_value: originalValue,
        negotiated_value: negotiatedValue,
        saving_value: savingValue,
        saving_pct: savingPct,
        notes: `Rodada ${Math.ceil((i + 1) / 5)} de negociações`,
        created_at: tsStr(-Math.round(Math.random() * 60)),
      });
    }
    await safeInsert(sb, "compras_negotiations", negotiations);

    // ══════════════════════════════════════════════════════════════
    // KPI SNAPSHOTS (60 days)
    // ══════════════════════════════════════════════════════════════
    const kpiSnapshots: any[] = [];
    for (let d = 59; d >= 0; d--) {
      kpiSnapshots.push({
        id: uuid("kpi", d),
        tenant_id: TENANT_ID,
        snapshot_date: dateStr(-d),
        metrics: {
          total_purchase_volume: 800000 + Math.round(Math.random() * 200000),
          active_pos: 8 + Math.round(Math.random() * 6),
          active_suppliers: 10,
          avg_dpo: 26 + Math.round(Math.random() * 6),
          avg_dio: 16 + Math.round(Math.random() * 5),
          avg_dso: 4 + Math.round(Math.random() * 3),
          saving_pct: +(0.5 + Math.random() * 0.8).toFixed(2),
          ppv_accumulated: +(15000 + Math.random() * 8000).toFixed(2),
          otif_avg: +(89 + Math.random() * 6).toFixed(1),
          gmroi_avg: +(1.8 + Math.random() * 1.2).toFixed(2),
          tdr_avg: +(3.2 + Math.random() * 2).toFixed(1),
        },
      });
    }
    for (let i = 0; i < kpiSnapshots.length; i += 30) {
      await safeInsert(sb, "compras_kpi_snapshots", kpiSnapshots.slice(i, i + 30));
    }

    // ══════════════════════════════════════════════════════════════
    // ALERTS (15)
    // Columns: id, tenant_id, title, description, category, level,
    //          related_entity_type, related_entity_id, status, resolved_at
    // ══════════════════════════════════════════════════════════════
    const alertDefs = [
      { level: "critical", category: "ppv", title: "PPV negativo crítico — Ambev", description: "PPV acumulado negativo > R$2.000 para Ambev nos últimos 30 dias" },
      { level: "critical", category: "otif", title: "OTIF < 90% — JBS S.A.", description: "JBS com OTIF de 85.3% nos últimos 3 meses, abaixo da meta de 90%" },
      { level: "critical", category: "cobertura", title: "Cobertura excessiva — Frios BRF", description: "Cobertura de 62 dias para Frios BRF, meta máxima é 21 dias" },
      { level: "warning", category: "dpo", title: "DPO abaixo da meta", description: "DPO médio de 28 dias, abaixo da meta de 30 dias" },
      { level: "warning", category: "verba", title: "Verba vencendo — Nestlé", description: "Rebate de R$12.000 vence em 10 dias com 45% de aderência" },
      { level: "warning", category: "gmroi", title: "GMROI < 1.5 — Frios", description: "Categoria Frios com GMROI de 1.4, abaixo do limiar de rentabilidade" },
      { level: "warning", category: "saving", title: "Saving abaixo da meta", description: "Saving realizado de 0.8%, meta é 1.0%" },
      { level: "warning", category: "divergencia", title: "Taxa de divergência alta — Heineken", description: "TDR de 5.2% para Heineken, acima da meta de 3%" },
      { level: "info", category: "negociacao", title: "Negociação pendente — P&G", description: "Negociação de prazo com P&G em andamento há 15 dias" },
      { level: "info", category: "oc", title: "OC aprovada — Coca-Cola", description: "OC-2026-0003 aprovada, valor R$28.400" },
      { level: "info", category: "score", title: "Score atualizado — M. Dias Branco", description: "Score composto subiu de 92 para 94" },
      { level: "warning", category: "icf", title: "ICF alto — Bebidas", description: "Índice de Concentração de Fornecedores em 72% para Bebidas" },
      { level: "critical", category: "preco", title: "Aumento de preço — Friboi Picanha", description: "Preço aumentou 8.5% em relação ao mês anterior" },
      { level: "info", category: "verba", title: "Verba concluída — Unilever", description: "Bonificação Unilever atingiu 100% de realização" },
      { level: "warning", category: "ccc", title: "CCC em elevação", description: "Ciclo de conversão de caixa subiu para 15 dias (meta: 12)" },
    ];
    const alerts = alertDefs.map((a, i) => ({
      id: uuid("alr", i),
      tenant_id: TENANT_ID,
      ...a,
      status: "active",
      resolved_at: null,
      created_at: tsStr(-Math.round(Math.random() * 10)),
    }));
    await safeInsert(sb, "compras_alerts", alerts);

    // ══════════════════════════════════════════════════════════════
    // EXECUTIVE SUMMARY (3 months)
    // ══════════════════════════════════════════════════════════════
    const summaries = [0, 1, 2].map(i => ({
      id: uuid("exs", i),
      tenant_id: TENANT_ID,
      period: dateStr(-30 * (i + 1)),
      total_purchase_volume: 950000 + Math.round(Math.random() * 100000),
      total_pos_emitted: 28 + Math.round(Math.random() * 8),
      active_suppliers: 10,
      avg_dpo: 27 + Math.round(Math.random() * 4),
      avg_otif: +(90 + Math.random() * 4).toFixed(1),
      avg_gmroi: +(2.0 + Math.random() * 0.8).toFixed(2),
      saving_pct: +(0.6 + Math.random() * 0.6).toFixed(2),
      saving_realized: +(5000 + Math.random() * 3000).toFixed(2),
      ppv_accumulated: +(15000 + Math.random() * 8000).toFixed(2),
      ccc_days: 12 + Math.round(Math.random() * 4),
      semaphore: "yellow",
    }));
    await safeInsert(sb, "compras_executive_summary", summaries);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Dados demo Compras carregados com sucesso",
        counts: {
          suppliers: suppliers.length,
          skus: skus.length,
          price_history: priceHistory.length,
          purchase_orders: purchaseOrders.length,
          po_items: poItems.length,
          trade_allowances: allowances.length,
          divergences: divergences.length,
          negotiations: negotiations.length,
          kpi_snapshots: kpiSnapshots.length,
          alerts: alerts.length,
          executive_summaries: summaries.length,
          supplier_scores: scores.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[seed-compras] Fatal error:", (err as Error).message);
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
