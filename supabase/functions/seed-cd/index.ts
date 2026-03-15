import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TENANT_ID = "11111111-1111-1111-1111-111111111111";

// Deterministic UUID generator for reproducibility
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

function tsStr(daysFromNow: number, hours = 8, minutes = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    // ══════════════════════════════════════════════════════════════
    // CLEAN: Delete existing demo data for this tenant
    // ══════════════════════════════════════════════════════════════
    const tablesToClean = [
      "cd_audit_log", "cd_kpi_snapshots", "cd_alerts",
      "cd_romaneio_orders", "cd_romaneios", "cd_shipping_manifests",
      "cd_picking_tasks", "cd_picking_waves",
      "cd_transfer_order_items", "cd_transfer_orders",
      "cd_rupture_projections", "cd_order_suggestions",
      "cd_consumption_history", "cd_replenishment_params",
      "cd_cycle_counts", "cd_stock_lots",
      "cd_putaway_tasks", "cd_non_conformities",
      "cd_receiving_items", "cd_receiving_records", "cd_receiving_schedules",
      "cd_purchase_order_items", "cd_purchase_orders",
      "cd_slotting_configs", "cd_locations",
      "cd_loss_records", "cd_skus", "cd_stores", "cd_suppliers",
    ];
    for (const t of tablesToClean) {
      await sb.from(t).delete().eq("tenant_id", TENANT_ID);
    }

    // ══════════════════════════════════════════════════════════════
    // LAYER 1: Base registrations
    // ══════════════════════════════════════════════════════════════

    // — Suppliers (11)
    const suppliers = [
      { name: "Nestlé", code: "NEST", cnpj: "60.409.075/0001-52", lead_time_promised_days: 3, delivery_accuracy_rate: 96.5 },
      { name: "Ambev", code: "AMBV", cnpj: "07.526.557/0001-00", lead_time_promised_days: 2, delivery_accuracy_rate: 94.2 },
      { name: "Coca-Cola FEMSA", code: "COCA", cnpj: "45.997.418/0001-10", lead_time_promised_days: 2, delivery_accuracy_rate: 97.1 },
      { name: "Unilever", code: "UNVR", cnpj: "61.068.276/0001-04", lead_time_promised_days: 4, delivery_accuracy_rate: 93.8 },
      { name: "P&G Brasil", code: "PG01", cnpj: "61.405.129/0001-73", lead_time_promised_days: 5, delivery_accuracy_rate: 95.3 },
      { name: "BRF S.A.", code: "BRF1", cnpj: "01.838.723/0001-27", lead_time_promised_days: 2, delivery_accuracy_rate: 91.7 },
      { name: "JBS S.A.", code: "JBS1", cnpj: "02.916.265/0001-60", lead_time_promised_days: 2, delivery_accuracy_rate: 90.5 },
      { name: "M. Dias Branco", code: "MDIA", cnpj: "07.206.816/0001-15", lead_time_promised_days: 3, delivery_accuracy_rate: 98.1 },
      { name: "Camil Alimentos", code: "CAML", cnpj: "64.904.295/0001-03", lead_time_promised_days: 4, delivery_accuracy_rate: 97.4 },
      { name: "Três Corações", code: "3COR", cnpj: "28.526.166/0001-07", lead_time_promised_days: 3, delivery_accuracy_rate: 95.9 },
      { name: "Bunge Alimentos", code: "BUNG", cnpj: "84.046.101/0001-93", lead_time_promised_days: 3, delivery_accuracy_rate: 96.0 },
    ].map((s, i) => ({
      id: uuid("sup", i), tenant_id: TENANT_ID, ...s,
      contact_name: `Representante ${s.name}`,
      contact_email: `vendas@${s.code.toLowerCase()}.com.br`,
      lead_time_actual_avg_days: s.lead_time_promised_days + (i % 3 === 0 ? 1 : 0),
    }));
    await sb.from("cd_suppliers").insert(suppliers);

    // — Stores (7)
    const storeNames = [
      { name: "Beira Rio", code: "LJ01" },
      { name: "Canaã", code: "LJ02" },
      { name: "Carajás", code: "LJ03" },
      { name: "Marabá Centro", code: "LJ04" },
      { name: "Nova Marabá", code: "LJ05" },
      { name: "Cidade Nova", code: "LJ06" },
      { name: "Morada Nova", code: "LJ07" },
    ];
    const stores = storeNames.map((s, i) => ({
      id: uuid("sto", i), tenant_id: TENANT_ID, ...s,
    }));
    await sb.from("cd_stores").insert(stores);

    // — SKUs (~80)
    const skuDefs = [
      // Mercearia Seca (25)
      { code: "MRC001", desc: "Arroz Tipo 1 5kg Camil", cat: "Mercearia", sub: "Grãos", brand: "Camil", cost: 22.50, price: 29.90, abc: "A", pack: 6, lt: 4, sup: 8 },
      { code: "MRC002", desc: "Feijão Carioca 1kg Camil", cat: "Mercearia", sub: "Grãos", brand: "Camil", cost: 7.80, price: 11.90, abc: "A", pack: 12, lt: 4, sup: 8 },
      { code: "MRC003", desc: "Açúcar Refinado 1kg União", cat: "Mercearia", sub: "Açúcar", brand: "Camil", cost: 4.50, price: 6.49, abc: "A", pack: 10, lt: 3, sup: 10 },
      { code: "MRC004", desc: "Café Torrado 500g Três Corações", cat: "Mercearia", sub: "Café", brand: "Três Corações", cost: 14.90, price: 21.90, abc: "A", pack: 10, lt: 3, sup: 9 },
      { code: "MRC005", desc: "Óleo de Soja 900ml Soya", cat: "Mercearia", sub: "Óleos", brand: "Bunge", cost: 6.20, price: 8.99, abc: "A", pack: 12, lt: 3, sup: 10 },
      { code: "MRC006", desc: "Macarrão Espaguete 500g Adria", cat: "Mercearia", sub: "Massas", brand: "M. Dias Branco", cost: 3.90, price: 5.79, abc: "B", pack: 20, lt: 3, sup: 7 },
      { code: "MRC007", desc: "Farinha de Trigo 1kg Dona Benta", cat: "Mercearia", sub: "Farinhas", brand: "M. Dias Branco", cost: 5.10, price: 7.49, abc: "B", pack: 10, lt: 3, sup: 7 },
      { code: "MRC008", desc: "Leite Condensado 395g Moça", cat: "Mercearia", sub: "Leites", brand: "Nestlé", cost: 6.80, price: 9.49, abc: "B", pack: 24, lt: 3, sup: 0 },
      { code: "MRC009", desc: "Nescafé Solúvel 200g", cat: "Mercearia", sub: "Café", brand: "Nestlé", cost: 18.50, price: 27.90, abc: "A", pack: 6, lt: 3, sup: 0 },
      { code: "MRC010", desc: "Biscoito Cream Cracker 400g Vitarella", cat: "Mercearia", sub: "Biscoitos", brand: "M. Dias Branco", cost: 4.20, price: 6.29, abc: "B", pack: 20, lt: 3, sup: 7 },
      { code: "MRC011", desc: "Molho de Tomate 340g Heinz", cat: "Mercearia", sub: "Molhos", brand: "Unilever", cost: 3.80, price: 5.99, abc: "B", pack: 12, lt: 4, sup: 3 },
      { code: "MRC012", desc: "Achocolatado Nescau 800g", cat: "Mercearia", sub: "Achocolatados", brand: "Nestlé", cost: 12.40, price: 17.90, abc: "B", pack: 6, lt: 3, sup: 0 },
      // Bebidas (15)
      { code: "BEB001", desc: "Cerveja Brahma Lata 350ml", cat: "Bebidas", sub: "Cervejas", brand: "Ambev", cost: 2.10, price: 3.49, abc: "A", pack: 12, lt: 2, sup: 1 },
      { code: "BEB002", desc: "Refrigerante Coca-Cola 2L", cat: "Bebidas", sub: "Refrigerantes", brand: "Coca-Cola", cost: 5.90, price: 8.99, abc: "A", pack: 6, lt: 2, sup: 2 },
      { code: "BEB003", desc: "Cerveja Skol Lata 350ml", cat: "Bebidas", sub: "Cervejas", brand: "Ambev", cost: 2.00, price: 3.29, abc: "A", pack: 12, lt: 2, sup: 1 },
      { code: "BEB004", desc: "Guaraná Antarctica 2L", cat: "Bebidas", sub: "Refrigerantes", brand: "Ambev", cost: 4.80, price: 7.49, abc: "B", pack: 6, lt: 2, sup: 1 },
      { code: "BEB005", desc: "Água Mineral 500ml Crystal", cat: "Bebidas", sub: "Águas", brand: "Coca-Cola", cost: 0.90, price: 1.99, abc: "B", pack: 12, lt: 2, sup: 2 },
      { code: "BEB006", desc: "Refrigerante Fanta 2L", cat: "Bebidas", sub: "Refrigerantes", brand: "Coca-Cola", cost: 5.20, price: 7.99, abc: "B", pack: 6, lt: 2, sup: 2 },
      { code: "BEB007", desc: "Suco Del Valle 1L Uva", cat: "Bebidas", sub: "Sucos", brand: "Coca-Cola", cost: 5.50, price: 8.49, abc: "C", pack: 12, lt: 2, sup: 2 },
      // Frios/Refrigerados (15) - requires temp control
      { code: "FRI001", desc: "Presunto Cozido Fatiado 200g Sadia", cat: "Frios", sub: "Frios Fatiados", brand: "BRF", cost: 8.50, price: 12.90, abc: "A", pack: 8, lt: 2, sup: 5, temp: true, tmin: 0, tmax: 4 },
      { code: "FRI002", desc: "Queijo Mussarela Fatiado 200g Sadia", cat: "Frios", sub: "Queijos", brand: "BRF", cost: 9.20, price: 14.90, abc: "A", pack: 8, lt: 2, sup: 5, temp: true, tmin: 0, tmax: 4 },
      { code: "FRI003", desc: "Margarina Qualy 500g", cat: "Frios", sub: "Margarinas", brand: "BRF", cost: 5.90, price: 8.99, abc: "B", pack: 12, lt: 2, sup: 5, temp: true, tmin: 2, tmax: 8 },
      { code: "FRI004", desc: "Iogurte Nestlé Grego 100g", cat: "Frios", sub: "Iogurtes", brand: "Nestlé", cost: 3.20, price: 5.49, abc: "B", pack: 12, lt: 3, sup: 0, temp: true, tmin: 1, tmax: 5 },
      { code: "FRI005", desc: "Requeijão Cremoso 200g Vigor", cat: "Frios", sub: "Queijos", brand: "JBS", cost: 6.80, price: 10.90, abc: "B", pack: 6, lt: 2, sup: 6, temp: true, tmin: 2, tmax: 7 },
      { code: "FRI006", desc: "Salsicha Hot Dog 500g Sadia", cat: "Frios", sub: "Embutidos", brand: "BRF", cost: 5.40, price: 8.49, abc: "B", pack: 12, lt: 2, sup: 5, temp: true, tmin: 0, tmax: 4 },
      { code: "FRI007", desc: "Linguiça Toscana 1kg Seara", cat: "Frios", sub: "Embutidos", brand: "JBS", cost: 16.50, price: 24.90, abc: "A", pack: 4, lt: 2, sup: 6, temp: true, tmin: 0, tmax: 4 },
      // Congelados (10) - requires temp control
      { code: "CON001", desc: "Pizza Congelada Sadia 460g", cat: "Congelados", sub: "Pizzas", brand: "BRF", cost: 10.50, price: 16.90, abc: "B", pack: 6, lt: 2, sup: 5, temp: true, tmin: -18, tmax: -12 },
      { code: "CON002", desc: "Hambúrguer Bovino Seara 672g", cat: "Congelados", sub: "Carnes", brand: "JBS", cost: 12.90, price: 19.90, abc: "B", pack: 6, lt: 2, sup: 6, temp: true, tmin: -18, tmax: -12 },
      { code: "CON003", desc: "Nuggets Frango Sadia 300g", cat: "Congelados", sub: "Empanados", brand: "BRF", cost: 8.90, price: 14.49, abc: "B", pack: 12, lt: 2, sup: 5, temp: true, tmin: -18, tmax: -12 },
      { code: "CON004", desc: "Sorvete Kibon 1.5L", cat: "Congelados", sub: "Sorvetes", brand: "Unilever", cost: 14.90, price: 22.90, abc: "C", pack: 4, lt: 4, sup: 3, temp: true, tmin: -22, tmax: -16 },
      // HPC (13)
      { code: "HPC001", desc: "Sabonete Dove 90g", cat: "HPC", sub: "Sabonetes", brand: "Unilever", cost: 3.50, price: 5.99, abc: "B", pack: 12, lt: 4, sup: 3 },
      { code: "HPC002", desc: "Shampoo Pantene 400ml", cat: "HPC", sub: "Cabelos", brand: "P&G", cost: 16.90, price: 24.90, abc: "B", pack: 6, lt: 5, sup: 4 },
      { code: "HPC003", desc: "Creme Dental Colgate 90g", cat: "HPC", sub: "Higiene Oral", brand: "P&G", cost: 4.20, price: 6.99, abc: "A", pack: 12, lt: 5, sup: 4 },
      { code: "HPC004", desc: "Desodorante Rexona 150ml", cat: "HPC", sub: "Desodorantes", brand: "Unilever", cost: 10.90, price: 16.90, abc: "B", pack: 6, lt: 4, sup: 3 },
      { code: "HPC005", desc: "Papel Higiênico Neve 12un", cat: "HPC", sub: "Papéis", brand: "P&G", cost: 12.50, price: 18.90, abc: "A", pack: 4, lt: 5, sup: 4 },
      { code: "HPC006", desc: "Sabão em Pó Omo 1.6kg", cat: "HPC", sub: "Limpeza", brand: "Unilever", cost: 15.90, price: 23.90, abc: "A", pack: 6, lt: 4, sup: 3 },
      { code: "HPC007", desc: "Detergente Ypê 500ml", cat: "HPC", sub: "Limpeza", brand: "P&G", cost: 2.20, price: 3.79, abc: "B", pack: 24, lt: 5, sup: 4 },
      { code: "HPC008", desc: "Amaciante Comfort 2L", cat: "HPC", sub: "Limpeza", brand: "Unilever", cost: 12.80, price: 19.90, abc: "C", pack: 4, lt: 4, sup: 3 },
    ];

    const skus = skuDefs.map((s, i) => ({
      id: uuid("sku", i), tenant_id: TENANT_ID,
      sku_code: s.code, description: s.desc,
      category: s.cat, subcategory: s.sub, brand: s.brand,
      avg_unit_cost: s.cost, avg_unit_price: s.price,
      abc_curve: s.abc, pack_size: s.pack,
      lead_time_days: s.lt, unit_measure: "UN",
      requires_temp_control: !!s.temp,
      temp_min: s.tmin ?? null, temp_max: s.tmax ?? null,
      weight_kg: 0.3 + i * 0.05,
    }));
    // Insert in batches of 20
    for (let i = 0; i < skus.length; i += 20) {
      await sb.from("cd_skus").insert(skus.slice(i, i + 20));
    }

    // — Locations (~120)
    const zones = [
      { zone: "Seco", aisles: ["A", "B", "C", "D"], modules: 10, levels: 4, type: "reserve" },
      { zone: "Frio", aisles: ["E"], modules: 6, levels: 3, type: "cold" },
      { zone: "Congelado", aisles: ["F"], modules: 4, levels: 3, type: "frozen" },
      { zone: "Devolução", aisles: ["G"], modules: 2, levels: 1, type: "quarantine" },
    ];
    const locations: any[] = [];
    let locIdx = 0;
    for (const z of zones) {
      for (const aisle of z.aisles) {
        for (let m = 1; m <= z.modules; m++) {
          for (let l = 1; l <= z.levels; l++) {
            const code = `${aisle}${String(m).padStart(2, "0")}-N${l}`;
            // ~75% occupation
            const isOccupied = (locIdx % 4 !== 3);
            locations.push({
              id: uuid("loc", locIdx), tenant_id: TENANT_ID,
              code, zone: z.zone, aisle,
              module: String(m).padStart(2, "0"),
              level: String(l), position: `${aisle}${m}`,
              location_type: z.type,
              is_occupied: isOccupied,
              max_weight_kg: z.zone === "Congelado" ? 500 : 1000,
              max_volume_m3: z.zone === "Congelado" ? 1.5 : 3.0,
              width_cm: 120, height_cm: 150, depth_cm: 100,
            });
            locIdx++;
          }
        }
      }
    }
    for (let i = 0; i < locations.length; i += 50) {
      const { error } = await sb.from("cd_locations").insert(locations.slice(i, i + 50));
      if (error) console.error("cd_locations insert error:", error.message);
    }

    // — Slotting configs for class A SKUs (~25)
    const classASkus = skus.filter(s => skuDefs.find(d => d.code === s.sku_code)?.abc === "A");
    const slotting = classASkus.slice(0, 25).map((sku, i) => ({
      id: uuid("slot", i), tenant_id: TENANT_ID,
      sku_id: sku.id,
      primary_location_id: locations[i % locations.length].id,
      secondary_location_id: locations[(i + 1) % locations.length].id,
      preferred_zone: skuDefs[i]?.temp ? (skuDefs[i].tmin! < -10 ? "Congelado" : "Frio") : "Seco",
      min_qty: 10, max_qty: 200, replenish_trigger_qty: 30,
    }));
    await sb.from("cd_slotting_configs").insert(slotting);

    // — Replenishment params (40 — top SKUs × stores)
    const topSkus = skus.slice(0, 6);
    const replParams: any[] = [];
    let rpIdx = 0;
    for (const sku of topSkus) {
      for (const store of stores) {
        if (rpIdx >= 40) break;
        replParams.push({
          id: uuid("rpl", rpIdx), tenant_id: TENANT_ID,
          sku_id: sku.id, store_id: store.id,
          service_level: 0.95, z_score: 1.65,
          replenishment_cycle_days: 7,
          safety_stock: 15 + (rpIdx % 10),
          reorder_point: 45 + (rpIdx % 20),
          order_qty: 120 + (rpIdx % 50),
          add_value: 18 + (rpIdx % 8),
          add_std_dev: 4.2 + (rpIdx % 3),
        });
        rpIdx++;
      }
    }
    await sb.from("cd_replenishment_params").insert(replParams);

    // ══════════════════════════════════════════════════════════════
    // LAYER 2: Receiving flow
    // ══════════════════════════════════════════════════════════════

    // — Purchase Orders (25)
    const poStatuses = ["received", "received", "received", "received", "partial_received", "open", "open"];
    const purchaseOrders = Array.from({ length: 25 }, (_, i) => ({
      id: uuid("po", i), tenant_id: TENANT_ID,
      po_number: `PO-${String(2025001 + i)}`,
      supplier_id: suppliers[i % suppliers.length].id,
      status: poStatuses[i % poStatuses.length],
      expected_date: dateStr(-30 + i * 1.2),
      total_items: 4 + (i % 3),
      total_cost: 5000 + i * 800,
      created_at: tsStr(-32 + i),
    }));
    await sb.from("cd_purchase_orders").insert(purchaseOrders);

    // — PO Items (~120)
    const poItems: any[] = [];
    let poiIdx = 0;
    for (const po of purchaseOrders) {
      const count = 4 + (poiIdx % 3);
      for (let j = 0; j < count; j++) {
        const skuIdx = (poiIdx * 3 + j) % skus.length;
        const qtyOrdered = 50 + (j * 20);
        const received = po.status === "received" ? qtyOrdered : (po.status === "partial_received" ? Math.floor(qtyOrdered * 0.7) : 0);
        poItems.push({
          id: uuid("poi", poiIdx * 10 + j), tenant_id: TENANT_ID,
          purchase_order_id: po.id, sku_id: skus[skuIdx].id,
          qty_ordered: qtyOrdered, qty_received: received,
          unit_cost: skuDefs[skuIdx].cost,
          status: received === qtyOrdered ? "received" : (received > 0 ? "partial" : "pending"),
        });
      }
      poiIdx++;
    }
    for (let i = 0; i < poItems.length; i += 50) {
      await sb.from("cd_purchase_order_items").insert(poItems.slice(i, i + 50));
    }

    // — Receiving Schedules (30)
    const docks = ["D1", "D2", "D3", "D4"];
    const schedules = Array.from({ length: 30 }, (_, i) => ({
      id: uuid("sch", i), tenant_id: TENANT_ID,
      purchase_order_id: purchaseOrders[i % purchaseOrders.length].id,
      supplier_id: suppliers[i % suppliers.length].id,
      scheduled_date: dateStr(-28 + i),
      dock: docks[i % 4],
      time_window_start: `${8 + (i % 4) * 2}:00`,
      time_window_end: `${10 + (i % 4) * 2}:00`,
      status: i < 25 ? "completed" : "scheduled",
      vehicle_plate: `ABC-${String(1000 + i)}`,
      driver_name: `Motorista ${i + 1}`,
    }));
    // Intentional dock conflicts (§2.1) — schedules 28,29 share dock/time with earlier ones
    schedules[28] = { ...schedules[28], dock: schedules[0].dock, time_window_start: schedules[0].time_window_start, time_window_end: schedules[0].time_window_end, scheduled_date: schedules[0].scheduled_date };
    schedules[29] = { ...schedules[29], dock: schedules[1].dock, time_window_start: schedules[1].time_window_start, time_window_end: schedules[1].time_window_end, scheduled_date: schedules[1].scheduled_date };
    await sb.from("cd_receiving_schedules").insert(schedules);

    // — Receiving Records (25) — RAR target ~96%
    const recResults = ["approved", "approved", "approved", "approved", "approved", "approved",
      "approved", "approved", "approved", "approved", "approved", "approved",
      "approved", "approved", "approved", "approved", "approved", "approved",
      "approved", "approved", "approved", "approved", "approved",
      "partial", "partial"]; // 23/25 = 92% but items-level will give ~96%
    const receivingRecords = Array.from({ length: 25 }, (_, i) => {
      const dstMin = 45 + Math.floor(Math.random() * 135); // 45-180min
      const startedAt = tsStr(-27 + i, 7 + (i % 4));
      return {
        id: uuid("rec", i), tenant_id: TENANT_ID,
        purchase_order_id: purchaseOrders[i].id,
        schedule_id: schedules[i].id,
        invoice_number: `NF-${30000 + i}`,
        invoice_total: 8000 + i * 1200,
        started_at: startedAt,
        completed_at: i < 23 ? tsStr(-27 + i, 7 + (i % 4) + 2) : null,
        dock_to_stock_minutes: i < 23 ? dstMin : null,
        result: i < 23 ? recResults[i] : null,
      };
    });
    await sb.from("cd_receiving_records").insert(receivingRecords);

    // — Receiving Items (~100) — with divergences for RAR ~96%
    const recItems: any[] = [];
    let riIdx = 0;
    for (let r = 0; r < 25; r++) {
      const numItems = 3 + (r % 3);
      for (let j = 0; j < numItems; j++) {
        const skuIdx = (r * 4 + j) % skus.length;
        const qtyInv = 50 + j * 15;
        // ~4% divergence rate
        const hasDivergence = riIdx % 25 === 0;
        const qtyPhys = hasDivergence ? qtyInv - 3 : qtyInv;
        const def = skuDefs[skuIdx];
        // Temperature issues for temp-controlled items
        const tempReading = def.temp ? (riIdx % 30 === 0 ? (def.tmax! + 5) : (def.tmin! + 1)) : null;
        // Expiration issues
        const expDate = def.temp
          ? dateStr(riIdx % 40 === 0 ? -5 : 60 + riIdx) // Some expired
          : dateStr(180 + riIdx);

        recItems.push({
          id: uuid("ri", riIdx), tenant_id: TENANT_ID,
          receiving_record_id: receivingRecords[r].id,
          sku_id: skus[skuIdx].id,
          qty_invoice: qtyInv, qty_physical: qtyPhys,
          qty_accepted: qtyPhys, qty_rejected: hasDivergence ? 3 : 0,
          status: hasDivergence ? "partial" : "accepted",
          batch_number: `LOT-${String(10000 + riIdx)}`,
          expiration_date: expDate,
          temperature_reading: tempReading,
        });
        riIdx++;
      }
    }
    for (let i = 0; i < recItems.length; i += 50) {
      await sb.from("cd_receiving_items").insert(recItems.slice(i, i + 50));
    }

    // — Non-conformities (12)
    const ncTypes = [
      { type: "wrong_temp", severity: "critical", description: "Temperatura acima do limite no recebimento" },
      { type: "expired", severity: "high", description: "Produto com validade inferior a 30 dias" },
      { type: "qty_divergence", severity: "medium", description: "Quantidade física difere da nota fiscal" },
      { type: "damaged", severity: "high", description: "Embalagem danificada no transporte" },
    ];
    const ncs = Array.from({ length: 12 }, (_, i) => {
      const ncType = ncTypes[i % ncTypes.length];
      return {
        id: uuid("nc", i), tenant_id: TENANT_ID,
        type: ncType.type, severity: ncType.severity,
        description: ncType.description,
        receiving_record_id: receivingRecords[i % receivingRecords.length].id,
        receiving_item_id: recItems[i].id,
        sku_id: skus[i % skus.length].id,
        supplier_id: suppliers[i % suppliers.length].id,
        qty_affected: 2 + (i % 5),
        treatment_status: i < 8 ? "resolved" : "open",
        treatment_action: i < 8 ? "Produto segregado e devolvido ao fornecedor" : null,
        resolved_at: i < 8 ? tsStr(-20 + i) : null,
      };
    });
    await sb.from("cd_non_conformities").insert(ncs);

    // — Putaway tasks (80)
    const putawayTasks = Array.from({ length: 80 }, (_, i) => ({
      id: uuid("put", i), tenant_id: TENANT_ID,
      sku_id: skus[i % skus.length].id,
      receiving_record_id: receivingRecords[i % receivingRecords.length].id,
      qty: 20 + (i % 30),
      suggested_location_id: locations[i % locations.length].id,
      actual_location_id: i < 65 ? locations[(i + (i % 3 === 0 ? 1 : 0)) % locations.length].id : null,
      status: i < 65 ? "completed" : "pending",
      started_at: i < 65 ? tsStr(-25 + Math.floor(i / 3)) : null,
      completed_at: i < 65 ? tsStr(-25 + Math.floor(i / 3), 10) : null,
    }));
    for (let i = 0; i < putawayTasks.length; i += 40) {
      await sb.from("cd_putaway_tasks").insert(putawayTasks.slice(i, i + 40));
    }

    // ══════════════════════════════════════════════════════════════
    // LAYER 3: Storage
    // ══════════════════════════════════════════════════════════════

    // — Stock Lots (~200) with FEFO distribution
    const stockLots: any[] = [];
    for (let i = 0; i < 200; i++) {
      const skuIdx = i % skus.length;
      const def = skuDefs[skuIdx];
      // Expiration distribution: 3% expired, 5% 7days, 15% 30days, 77% >90days
      let expDays: number;
      if (i % 33 === 0) expDays = -5; // expired
      else if (i % 20 === 0) expDays = 5; // 7 days
      else if (i % 7 === 0) expDays = 20; // 30 days
      else expDays = 90 + (i % 120);

      stockLots.push({
        id: uuid("lot", i), tenant_id: TENANT_ID,
        sku_id: skus[skuIdx].id,
        batch_number: `BT-${String(20000 + i)}`,
        expiration_date: dateStr(expDays),
        location_id: locations[i % locations.length].id,
        qty_available: 10 + (i % 80),
        qty_reserved: i % 10 === 0 ? 5 : 0,
        qty_blocked: i % 33 === 0 ? 10 : 0, // blocked if expired
        unit_cost: def.cost,
        status: i % 33 === 0 ? "blocked" : "available",
        origin: "receiving",
      });
    }
    for (let i = 0; i < stockLots.length; i += 50) {
      await sb.from("cd_stock_lots").insert(stockLots.slice(i, i + 50));
    }

    // — Cycle Counts (40) — IA target ~92%
    const cycleCounts: any[] = [];
    for (let i = 0; i < 40; i++) {
      const qtySys = 50 + (i % 40);
      let qtyPhys: number | null;
      let delta: number | null = null;
      let deltaPct: number | null = null;
      const status = i < 30 ? "approved" : (i < 35 ? "counted" : "pending");

      if (status !== "pending") {
        // 60% exact, 30% small delta, 10% large delta
        if (i % 10 < 6) { qtyPhys = qtySys; }
        else if (i % 10 < 9) { qtyPhys = qtySys - (1 + i % 3); }
        else { qtyPhys = qtySys - Math.floor(qtySys * 0.12); }
        delta = qtyPhys - qtySys;
        deltaPct = qtySys > 0 ? (delta / qtySys) * 100 : 0;
      } else {
        qtyPhys = null;
      }

      cycleCounts.push({
        id: uuid("cyc", i), tenant_id: TENANT_ID,
        sku_id: skus[i % skus.length].id,
        location_id: locations[i % locations.length].id,
        stock_lot_id: stockLots[i % stockLots.length].id,
        qty_system: qtySys, qty_physical: qtyPhys,
        delta, delta_pct: deltaPct,
        status,
        counted_at: status !== "pending" ? tsStr(-15 + Math.floor(i / 3)) : null,
        approved_at: status === "approved" ? tsStr(-14 + Math.floor(i / 3)) : null,
        adjustment_reason: delta && delta !== 0 ? "Divergência identificada na contagem" : null,
      });
    }
    await sb.from("cd_cycle_counts").insert(cycleCounts);

    // ══════════════════════════════════════════════════════════════
    // LAYER 4: Demand & Replenishment
    // ══════════════════════════════════════════════════════════════

    // — Consumption History (~4200 = 30 days × 7 stores × 20 SKUs)
    const consumptionBatch: any[] = [];
    const top20Skus = skus.slice(0, 20);
    for (let d = 0; d < 30; d++) {
      for (const store of stores) {
        for (const sku of top20Skus) {
          const baseQty = 8 + Math.floor(Math.random() * 25);
          // ~8% rupture
          const hadRupture = Math.random() < 0.08;
          consumptionBatch.push({
            id: uuid("con", consumptionBatch.length),
            tenant_id: TENANT_ID,
            sku_id: sku.id, store_id: store.id,
            consumption_date: dateStr(-30 + d),
            qty_sold: hadRupture ? Math.floor(baseQty * 0.3) : baseQty,
            qty_transferred: Math.floor(baseQty * 0.1),
            had_rupture: hadRupture,
          });
        }
      }
    }
    // Insert in large batches
    for (let i = 0; i < consumptionBatch.length; i += 200) {
      await sb.from("cd_consumption_history").insert(consumptionBatch.slice(i, i + 200));
    }

    // — Order Suggestions (35)
    const sugStatuses = ["pending", "pending", "approved", "approved", "approved", "rejected", "converted"];
    const suggestions = Array.from({ length: 35 }, (_, i) => ({
      id: uuid("sug", i), tenant_id: TENANT_ID,
      sku_id: top20Skus[i % 20].id,
      store_id: stores[i % 7].id,
      suggested_qty: 80 + (i % 60),
      current_stock: 15 + (i % 30),
      reorder_point: 40 + (i % 20),
      priority: i < 10 ? "high" : (i < 25 ? "normal" : "low"),
      status: sugStatuses[i % sugStatuses.length],
      projected_rupture_date: i < 15 ? dateStr(3 + i) : null,
      approved_at: sugStatuses[i % sugStatuses.length] === "approved" ? tsStr(-5 + Math.floor(i / 5)) : null,
    }));
    await sb.from("cd_order_suggestions").insert(suggestions);

    // — Rupture Projections (15)
    const ruptures = Array.from({ length: 15 }, (_, i) => ({
      id: uuid("rup", i), tenant_id: TENANT_ID,
      sku_id: classASkus[i % classASkus.length].id,
      store_id: stores[i % 7].id,
      current_stock: 5 + (i % 15),
      add_value: 18 + (i % 8),
      days_until_rupture: 1 + (i % 7),
      projected_rupture_date: dateStr(1 + (i % 7)),
      oos_cost_daily: 150 + (i % 200),
      oos_cost_gap: 450 + (i % 600),
      substitution_rate: 0.15 + (i % 3) * 0.05,
    }));
    await sb.from("cd_rupture_projections").insert(ruptures);

    // ══════════════════════════════════════════════════════════════
    // LAYER 5: Separation & Dispatch
    // ══════════════════════════════════════════════════════════════

    // — Transfer Orders (40)
    const toStatuses = ["open", "open", "picking", "picking", "picked", "shipped", "shipped", "delivered", "delivered", "delivered"];
    const transferOrders = Array.from({ length: 40 }, (_, i) => {
      const status = toStatuses[i % toStatuses.length];
      const requestedDate = dateStr(-25 + Math.floor(i / 2));
      const expectedDate = dateStr(-23 + Math.floor(i / 2));
      return {
        id: uuid("to", i), tenant_id: TENANT_ID,
        transfer_number: `TR-${String(5001 + i)}`,
        store_id: stores[i % 7].id,
        status,
        priority: i < 10 ? "high" : "normal",
        requested_date: requestedDate,
        expected_delivery_date: expectedDate,
        shipped_at: ["shipped", "delivered"].includes(status) ? tsStr(-22 + Math.floor(i / 2), 14) : null,
        delivered_at: status === "delivered" ? tsStr(-21 + Math.floor(i / 2), 10) : null,
        total_skus: 3 + (i % 3),
        total_items: 100 + (i % 80),
      };
    });
    await sb.from("cd_transfer_orders").insert(transferOrders);

    // — Transfer Order Items (~160) — Fill Rate target ~93%
    const toItems: any[] = [];
    let toiIdx = 0;
    for (const to of transferOrders) {
      const count = 3 + (toiIdx % 3);
      for (let j = 0; j < count; j++) {
        const skuIdx = (toiIdx * 3 + j) % skus.length;
        const qtyReq = 30 + (j * 10);
        // ~7% short-ship for Fill Rate ~93%
        const shortShip = toiIdx % 14 === 0;
        const qtyPicked = shortShip ? Math.floor(qtyReq * 0.85) : qtyReq;
        toItems.push({
          id: uuid("toi", toiIdx * 10 + j), tenant_id: TENANT_ID,
          transfer_order_id: to.id,
          sku_id: skus[skuIdx].id,
          qty_requested: qtyReq,
          qty_picked: ["open"].includes(to.status) ? 0 : qtyPicked,
          qty_checked: ["shipped", "delivered"].includes(to.status) ? qtyPicked : 0,
          status: to.status === "delivered" ? "shipped" : (to.status === "open" ? "pending" : "picked"),
          stock_lot_id: stockLots[(toiIdx * 3 + j) % stockLots.length].id,
          batch_number: `BT-${20000 + (toiIdx * 3 + j) % stockLots.length}`,
        });
      }
      toiIdx++;
    }
    for (let i = 0; i < toItems.length; i += 50) {
      await sb.from("cd_transfer_order_items").insert(toItems.slice(i, i + 50));
    }

    // — Picking Waves (15)
    const waveStatuses = ["completed", "completed", "completed", "completed", "completed",
      "completed", "completed", "completed", "completed", "completed",
      "in_progress", "in_progress", "planned", "planned", "planned"];
    const pickingWaves = Array.from({ length: 15 }, (_, i) => ({
      id: uuid("wav", i), tenant_id: TENANT_ID,
      wave_number: `W-${String(100 + i)}`,
      status: waveStatuses[i],
      transfer_order_ids: JSON.stringify([transferOrders[i * 2 % transferOrders.length].id, transferOrders[(i * 2 + 1) % transferOrders.length].id]),
      total_skus: 6 + (i % 4),
      total_items: 150 + (i % 100),
      started_at: i < 12 ? tsStr(-20 + i) : null,
      completed_at: i < 10 ? tsStr(-20 + i, 16) : null,
    }));
    await sb.from("cd_picking_waves").insert(pickingWaves);

    // — Picking Tasks (80) — PA target ~97%
    const pickingTasks: any[] = [];
    for (let i = 0; i < 80; i++) {
      const wave = pickingWaves[i % pickingWaves.length];
      const to = transferOrders[i % transferOrders.length];
      const itemsTotal = 5 + (i % 8);
      // ~3% error rate for PA ~97%
      const hasError = i % 33 === 0;
      const itemsPicked = hasError ? itemsTotal - 1 : itemsTotal;
      const accuracy = itemsTotal > 0 ? (itemsPicked / itemsTotal) * 100 : 100;

      pickingTasks.push({
        id: uuid("pck", i), tenant_id: TENANT_ID,
        wave_id: wave.id,
        transfer_order_id: to.id,
        status: i < 65 ? "completed" : (i < 72 ? "in_progress" : "pending"),
        items: JSON.stringify([]),
        items_total: itemsTotal,
        items_picked: i < 65 ? itemsPicked : (i < 72 ? Math.floor(itemsPicked * 0.5) : 0),
        accuracy_rate: i < 65 ? accuracy : null,
        sequence_order: i + 1,
        started_at: i < 72 ? tsStr(-18 + Math.floor(i / 4)) : null,
        completed_at: i < 65 ? tsStr(-18 + Math.floor(i / 4), 15) : null,
      });
    }
    for (let i = 0; i < pickingTasks.length; i += 40) {
      await sb.from("cd_picking_tasks").insert(pickingTasks.slice(i, i + 40));
    }

    // — Romaneios (12)
    const romStatuses = ["dispatched", "dispatched", "dispatched", "dispatched", "dispatched",
      "dispatched", "dispatched", "dispatched", "finalized", "finalized", "draft", "draft"];
    const romaneios = Array.from({ length: 12 }, (_, i) => ({
      id: uuid("rom", i), tenant_id: TENANT_ID,
      romaneio_number: `ROM-${String(800 + i)}`,
      status: romStatuses[i],
      vehicle_plate: `DEF-${String(2000 + i)}`,
      driver_name: `Carlos ${i + 1}`,
      carrier_name: "TransLog Ltda",
      total_orders: 2 + (i % 3),
      total_items: 80 + (i % 60),
      total_weight_kg: 500 + (i % 300),
      departure_at: i < 8 ? tsStr(-15 + i, 6) : null,
      arrival_at: i < 8 ? tsStr(-15 + i, 12) : null,
    }));
    await sb.from("cd_romaneios").insert(romaneios);

    // — Romaneio Orders (30)
    const romOrders: any[] = [];
    for (let i = 0; i < 30; i++) {
      romOrders.push({
        id: uuid("rmo", i), tenant_id: TENANT_ID,
        romaneio_id: romaneios[Math.floor(i / 3) % romaneios.length].id,
        transfer_order_id: transferOrders[i % transferOrders.length].id,
      });
    }
    await sb.from("cd_romaneio_orders").insert(romOrders);

    // — Shipping Manifests (8)
    const manifests = Array.from({ length: 8 }, (_, i) => ({
      id: uuid("mnf", i), tenant_id: TENANT_ID,
      manifest_number: `MNF-${String(400 + i)}`,
      status: i < 6 ? "delivered" : "in_transit",
      store_id: stores[i % 7].id,
      vehicle_plate: `GHI-${String(3000 + i)}`,
      driver_name: `Pedro ${i + 1}`,
      driver_doc: `123.456.789-${String(10 + i)}`,
      temperature_departure: i < 4 ? 2.5 : null,
      departure_at: tsStr(-12 + i, 7),
      arrival_at: i < 6 ? tsStr(-12 + i, 13) : null,
      transfer_order_ids: JSON.stringify([transferOrders[i * 3 % transferOrders.length].id]),
    }));
    await sb.from("cd_shipping_manifests").insert(manifests);

    // ══════════════════════════════════════════════════════════════
    // LAYER 6: Quality & Losses
    // ══════════════════════════════════════════════════════════════

    // — Loss Records (45) — CSR target ~0.35%
    const lossOrigins = ["receiving", "storage", "picking", "expiration", "damage"];
    const lossCauses = ["Avaria no transporte", "Validade expirada", "Erro de picking", "Dano na armazenagem", "Contaminação"];
    const lossRecords = Array.from({ length: 45 }, (_, i) => {
      const skuIdx = i % skus.length;
      const def = skuDefs[skuIdx];
      return {
        id: uuid("loss", i), tenant_id: TENANT_ID,
        sku_id: skus[skuIdx].id,
        origin: lossOrigins[i % 5],
        cause: lossCauses[i % 5],
        qty: 2 + (i % 8),
        unit_cost: def.cost,
        total_value: def.cost * (2 + (i % 8)),
        recorded_at: tsStr(-28 + Math.floor(i / 2)),
        stock_lot_id: stockLots[i % stockLots.length].id,
        supplier_id: suppliers[i % suppliers.length].id,
        store_id: i % 3 === 0 ? stores[i % 7].id : null,
        notes: `Registro de perda #${i + 1}`,
      };
    });
    await sb.from("cd_loss_records").insert(lossRecords);

    // ══════════════════════════════════════════════════════════════
    // LAYER 7: Executive Panel & Alerts
    // ══════════════════════════════════════════════════════════════

    // — KPI Snapshots (60 days of daily metrics)
    const snapshots = Array.from({ length: 60 }, (_, i) => {
      const dayOffset = -60 + i;
      // Realistic trends with slight improvement
      const trend = i / 60;
      return {
        id: uuid("snap", i), tenant_id: TENANT_ID,
        snapshot_date: dateStr(dayOffset),
        period_type: "daily",
        metrics: JSON.stringify({
          rar: 94.5 + trend * 2 + (Math.random() - 0.5) * 1.5,
          dst: 95 - trend * 10 + (Math.random() - 0.5) * 15,
          sur: 72 + trend * 4 + (Math.random() - 0.5) * 3,
          pa: 96 + trend * 2 + (Math.random() - 0.5) * 1.5,
          otd: 89 + trend * 3 + (Math.random() - 0.5) * 2,
          fill_rate: 91 + trend * 3 + (Math.random() - 0.5) * 2,
          csr: 0.45 - trend * 0.12 + (Math.random() - 0.5) * 0.05,
          cuh: 74 + trend * 2 + (Math.random() - 0.5) * 3,
        }),
      };
    });
    for (let i = 0; i < snapshots.length; i += 30) {
      await sb.from("cd_kpi_snapshots").insert(snapshots.slice(i, i + 30));
    }

    // — Alerts (20)
    const alertDefs = [
      { level: "red", category: "ruptura", title: "Ruptura iminente: Arroz Camil 5kg — Loja Beira Rio", description: "Estoque projetado para acabar em 2 dias. ADD = 22un/dia, estoque atual = 38un." },
      { level: "red", category: "qualidade", title: "PA degradado: Acuracidade de Picking abaixo de 95%", description: "Média das últimas 24h caiu para 94.2%. Verificar treinamento dos operadores." },
      { level: "red", category: "recebimento", title: "Conflito de doca: D1 — 2 agendamentos sobrepostos", description: "Nestlé e Ambev agendados no mesmo horário na Doca 1." },
      { level: "yellow", category: "separação", title: "Fill Rate abaixo da meta — Loja Canaã", description: "FR = 88.5% vs meta 95%. 4 SKUs com atendimento parcial." },
      { level: "yellow", category: "armazenagem", title: "Validade próxima: 12 lotes vencem em 7 dias", description: "Lotes de Presunto Sadia e Iogurte Nestlé exigem ação FEFO urgente." },
      { level: "yellow", category: "armazenagem", title: "SUR zona Seco acima de 85%", description: "Ocupação da zona Seco atingiu 87.3%. Avaliar remanejamento." },
      { level: "yellow", category: "recebimento", title: "Divergência recorrente — Fornecedor BRF", description: "3 divergências de quantidade nos últimos 7 dias. DAR = 91.7%." },
      { level: "yellow", category: "qualidade", title: "NC pendente: Temperatura fora — Lote BT-20033", description: "Lote de Iogurte Nestlé recebido a 8°C (max 5°C). Aguardando tratamento." },
      { level: "yellow", category: "separação", title: "Wave W-112 atrasada — 3h sem progresso", description: "Wave com 12 tasks pendentes. Verificar disponibilidade de operadores." },
      { level: "yellow", category: "ruptura", title: "Projeção de ruptura: Café 3 Corações — 4 lojas", description: "Estoque central abaixo do ROP para 4 das 7 lojas." },
      { level: "yellow", category: "qualidade", title: "Shrink Rate mensal acima da meta", description: "CSR = 0.38% vs meta 0.30%. Perdas por expiração representam 40% do total." },
      { level: "blue", category: "recebimento", title: "Recebimento concluído: PO-2025015 — Nestlé", description: "25 SKUs recebidos, 100% conforme. DST = 52min." },
      { level: "blue", category: "separação", title: "Wave W-108 concluída com 100% de acuracidade", description: "8 ordens separadas, 156 itens, sem divergências." },
      { level: "blue", category: "armazenagem", title: "Contagem cíclica aprovada — Corredor A", description: "20 posições contadas, IA = 98.5%." },
      { level: "blue", category: "expedição", title: "Entrega confirmada — Loja Carajás", description: "Romaneio ROM-802 entregue às 10:45. 3 ordens, 95 itens." },
      { level: "blue", category: "sistema", title: "Snapshot KPI diário gerado com sucesso", description: "Métricas do dia consolidadas e armazenadas." },
    ];
    const alerts = alertDefs.slice(0, 20).map((a, i) => ({
      id: uuid("alt", i), tenant_id: TENANT_ID,
      ...a,
      resolved_at: i >= 11 ? tsStr(-5 + (i % 5)) : null, // info alerts resolved
      auto_generated: i < 11,
      related_entity_type: i < 3 ? "cd_skus" : null,
      related_entity_id: i < 3 ? skus[i].id : null,
    }));
    await sb.from("cd_alerts").insert(alerts);

    // — Audit Log (30)
    const auditActions = [
      "receiving_completed", "putaway_completed", "cycle_count_approved",
      "transfer_order_created", "wave_released", "picking_completed",
      "romaneio_dispatched", "loss_recorded", "alert_resolved", "nc_resolved",
    ];
    const auditLog = Array.from({ length: 30 }, (_, i) => ({
      id: uuid("aud", i), tenant_id: TENANT_ID,
      action: auditActions[i % auditActions.length],
      entity_type: "cd_operations",
      entity_id: uuid("ent", i),
      metadata: JSON.stringify({ detail: `Ação operacional #${i + 1}`, timestamp: tsStr(-28 + i) }),
    }));
    await sb.from("cd_audit_log").insert(auditLog);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          suppliers: suppliers.length,
          stores: stores.length,
          skus: skus.length,
          locations: locations.length,
          stock_lots: stockLots.length,
          purchase_orders: purchaseOrders.length,
          receiving_records: receivingRecords.length,
          transfer_orders: transferOrders.length,
          picking_waves: pickingWaves.length,
          picking_tasks: pickingTasks.length,
          consumption_history: consumptionBatch.length,
          loss_records: lossRecords.length,
          kpi_snapshots: snapshots.length,
          alerts: alerts.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Seed error:", err);
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
