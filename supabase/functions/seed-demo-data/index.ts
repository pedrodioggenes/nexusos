import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🚀 Iniciando seed de dados de demonstração...');

    // ============================================================================
    // 1. CRIAR/ATUALIZAR UNIDADES (LOJAS)
    // ============================================================================
    console.log('📍 Criando unidades...');
    
    const stores = [
      { name: 'Cidade Jardim', city: 'Parauapebas', is_active: true },
      { name: 'VS10', city: 'Parauapebas', is_active: true },
      { name: 'Beira-Rio', city: 'Parauapebas', is_active: true },
      { name: 'Faruk', city: 'Parauapebas', is_active: true },
      { name: 'Canaã dos Carajás', city: 'Canaã dos Carajás', is_active: true },
      { name: 'Núcleo Urbano', city: 'Parauapebas', is_active: true },
      { name: 'Xinguara', city: 'Xinguara', is_active: true },
    ];

    const unitIds: Record<string, string> = {};
    
    for (const store of stores) {
      // Check if exists
      const { data: existing } = await supabase
        .from('units')
        .select('id')
        .eq('name', store.name)
        .single();
      
      if (existing) {
        unitIds[store.name] = existing.id;
      } else {
        const { data: inserted, error } = await supabase
          .from('units')
          .insert(store)
          .select('id')
          .single();
        
        if (error) {
          console.error(`Erro ao criar unidade ${store.name}:`, error);
        } else {
          unitIds[store.name] = inserted.id;
        }
      }
    }

    console.log('✅ Unidades criadas:', Object.keys(unitIds).length);

    // ============================================================================
    // 2. CRIAR FORNECEDOR NESTLÉ
    // ============================================================================
    console.log('🏭 Criando fornecedor Nestlé...');
    
    let nestleSupplierId: string;
    
    const { data: existingNestle } = await supabase
      .from('suppliers')
      .select('id')
      .ilike('name', '%nestl%')
      .single();
    
    if (existingNestle) {
      nestleSupplierId = existingNestle.id;
    } else {
      const { data: newNestle, error } = await supabase
        .from('suppliers')
        .insert({
          name: 'Nestlé Brasil Ltda',
          cnpj: '60.409.075/0001-52',
          contact_email: 'trade@nestle.com.br',
          contact_phone: '(11) 3324-4000',
          is_active: true
        })
        .select('id')
        .single();
      
      if (error) throw new Error(`Erro ao criar Nestlé: ${error.message}`);
      nestleSupplierId = newNestle.id;
    }

    console.log('✅ Fornecedor Nestlé:', nestleSupplierId);

    // ============================================================================
    // 3. CRIAR PACOTE DE TRADE
    // ============================================================================
    console.log('📦 Criando pacote de trade...');
    
    // Delete existing Nestlé packages to avoid duplicates
    await supabase
      .from('trade_packages')
      .delete()
      .eq('supplier_id', nestleSupplierId);
    
    const { data: tradePackage, error: packageError } = await supabase
      .from('trade_packages')
      .insert({
        name: 'Parceria Pontas de Gôndola - Nestlé Q4/2025',
        supplier_id: nestleSupplierId,
        period_start: '2025-10-27',
        period_end: '2026-01-27',
        total_value: 126000,
        status: 'completed',
        description: 'Parceria de trade marketing com 3 pontas de gôndola por loja (21 espaços total) para exposição de 15 produtos Nestlé durante 3 meses.'
      })
      .select('id')
      .single();
    
    if (packageError) throw new Error(`Erro ao criar pacote: ${packageError.message}`);
    const packageId = tradePackage.id;

    console.log('✅ Pacote de trade criado:', packageId);

    // ============================================================================
    // 4. CRIAR CHECKLIST ITEMS (21 itens - 3 por loja)
    // ============================================================================
    console.log('✅ Criando itens de checklist...');
    
    // Delete existing items for this package
    await supabase
      .from('trade_checklist_items')
      .delete()
      .eq('package_id', packageId);
    
    const checklistItems = [];
    let orderIndex = 0;
    
    for (const storeName of Object.keys(unitIds)) {
      for (let i = 1; i <= 3; i++) {
        checklistItems.push({
          package_id: packageId,
          title: `Montagem Ponta de Gôndola ${i} - ${storeName}`,
          description: `Instalação e abastecimento da ponta de gôndola ${i} com produtos Nestlé na loja ${storeName}`,
          status: 'approved',
          order_index: orderIndex++,
          due_date: '2025-10-30'
        });
      }
    }
    
    const { error: checklistError } = await supabase
      .from('trade_checklist_items')
      .insert(checklistItems);
    
    if (checklistError) throw new Error(`Erro ao criar checklist: ${checklistError.message}`);

    console.log('✅ Checklist items criados:', checklistItems.length);

    // ============================================================================
    // 5. CRIAR COMPROVAÇÕES (PROOFS) COM IMAGENS
    // ============================================================================
    console.log('📸 Criando comprovações...');
    
    // Get checklist item IDs
    const { data: checklistItemsData } = await supabase
      .from('trade_checklist_items')
      .select('id, title')
      .eq('package_id', packageId);
    
    if (checklistItemsData) {
      // Delete existing proofs
      for (const item of checklistItemsData) {
        await supabase
          .from('trade_proofs')
          .delete()
          .eq('checklist_item_id', item.id);
      }
      
      // Create new proofs
      const proofs = checklistItemsData.map((item, index) => ({
        checklist_item_id: item.id,
        image_url: `https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=600&fit=crop&q=80&sig=${index}`,
        description: `Comprovação fotográfica: ${item.title}`,
        status: 'approved',
        review_notes: 'Execução conforme briefing. Produtos bem organizados e precificados.',
        reviewed_at: '2025-11-01T10:00:00Z'
      }));
      
      const { error: proofsError } = await supabase
        .from('trade_proofs')
        .insert(proofs);
      
      if (proofsError) console.error('Erro ao criar proofs:', proofsError);
      else console.log('✅ Comprovações criadas:', proofs.length);
    }

    // ============================================================================
    // 6. CRIAR ORÇAMENTO E CATEGORIAS
    // ============================================================================
    console.log('💰 Criando orçamento...');
    
    // Delete existing budgets for 2025/2026
    await supabase
      .from('marketing_budgets')
      .delete()
      .in('year', [2025, 2026]);
    
    const { data: budget, error: budgetError } = await supabase
      .from('marketing_budgets')
      .insert({
        year: 2025,
        total_budget: 1200000
      })
      .select('id')
      .single();
    
    if (budgetError) throw new Error(`Erro ao criar orçamento: ${budgetError.message}`);
    
    const categories = [
      { name: 'Trade Marketing', allocated_amount: 480000, spent_amount: 385000, color: '#E30613' },
      { name: 'Digital', allocated_amount: 240000, spent_amount: 198000, color: '#FFCC00' },
      { name: 'PDV', allocated_amount: 180000, spent_amount: 156000, color: '#22c55e' },
      { name: 'Eventos', allocated_amount: 180000, spent_amount: 92000, color: '#3b82f6' },
      { name: 'Institucional', allocated_amount: 120000, spent_amount: 78000, color: '#8b5cf6' },
    ];
    
    for (const cat of categories) {
      await supabase
        .from('marketing_budget_categories')
        .insert({
          ...cat,
          budget_id: budget.id
        });
    }

    console.log('✅ Orçamento e categorias criados');

    // ============================================================================
    // 7. CRIAR VERBA COOPERADA (COOP FUND)
    // ============================================================================
    console.log('🤝 Criando verba cooperada...');
    
    await supabase
      .from('marketing_coop_funds')
      .delete()
      .eq('supplier_id', nestleSupplierId);
    
    await supabase
      .from('marketing_coop_funds')
      .insert({
        supplier_id: nestleSupplierId,
        year: 2025,
        quarter: 4,
        negotiated_amount: 126000,
        executed_amount: 126000,
        proven_amount: 126000,
        pending_proof_amount: 0,
        utilization_rate: 100,
        status: 'completed',
        contract_reference: 'NESTLE-TRADE-2025-Q4',
        notes: 'Parceria de pontas de gôndola executada com sucesso. ROI de 285%.'
      });

    console.log('✅ Verba cooperada criada');

    // ============================================================================
    // 8. CRIAR KPIs MENSAIS
    // ============================================================================
    console.log('📊 Criando KPIs...');
    
    await supabase
      .from('marketing_kpis')
      .delete()
      .gte('period_start', '2025-10-01');
    
    const kpis = [
      { period_type: 'monthly', period_start: '2025-10-01', period_end: '2025-10-31', roi: 2.8, cac: 48.50, ltv: 780, conversion_rate: 3.8, nps: 68, revenue: 118000, leads: 4200, conversions: 160 },
      { period_type: 'monthly', period_start: '2025-11-01', period_end: '2025-11-30', roi: 3.1, cac: 46.20, ltv: 820, conversion_rate: 4.2, nps: 70, revenue: 128500, leads: 4800, conversions: 202 },
      { period_type: 'monthly', period_start: '2025-12-01', period_end: '2025-12-31', roi: 3.5, cac: 44.80, ltv: 890, conversion_rate: 4.8, nps: 73, revenue: 145000, leads: 5200, conversions: 250 },
      { period_type: 'monthly', period_start: '2026-01-01', period_end: '2026-01-31', roi: 3.3, cac: 45.80, ltv: 865, conversion_rate: 4.5, nps: 72, revenue: 89500, leads: 3800, conversions: 171 },
    ];
    
    for (const kpi of kpis) {
      const { data: kpiData, error: kpiError } = await supabase
        .from('marketing_kpis')
        .insert(kpi)
        .select('id')
        .single();
      
      if (kpiError) {
        console.error('Erro ao criar KPI:', kpiError);
        continue;
      }
      
      // Add channel breakdown
      await supabase
        .from('marketing_kpis_by_channel')
        .insert([
          { kpi_id: kpiData.id, channel: 'Trade Marketing', investment: 42000, revenue: kpi.revenue * 0.65, roi: kpi.roi * 1.2, leads: Math.floor(kpi.leads * 0.4), conversions: Math.floor(kpi.conversions * 0.45), conversion_rate: 42, cac: 38.10 },
          { kpi_id: kpiData.id, channel: 'Digital', investment: 15000, revenue: kpi.revenue * 0.20, roi: kpi.roi * 0.8, leads: Math.floor(kpi.leads * 0.35), conversions: Math.floor(kpi.conversions * 0.25), conversion_rate: 6, cac: 85.00 },
          { kpi_id: kpiData.id, channel: 'CRM/WhatsApp', investment: 8000, revenue: kpi.revenue * 0.15, roi: kpi.roi * 1.3, leads: Math.floor(kpi.leads * 0.25), conversions: Math.floor(kpi.conversions * 0.30), conversion_rate: 14, cac: 52.00 },
        ]);
    }

    console.log('✅ KPIs criados');

    // ============================================================================
    // 9. CRIAR PERFORMANCE POR LOJA
    // ============================================================================
    console.log('🏪 Criando performance por loja...');
    
    const storePerformance = [
      { name: 'Cidade Jardim', revenue: 89500, roi: 315, investment: 18000 },
      { name: 'VS10', revenue: 78200, roi: 298, investment: 18000 },
      { name: 'Beira-Rio', revenue: 65400, roi: 275, investment: 18000 },
      { name: 'Faruk', revenue: 58900, roi: 262, investment: 18000 },
      { name: 'Canaã dos Carajás', revenue: 42300, roi: 248, investment: 18000 },
      { name: 'Núcleo Urbano', revenue: 28100, roi: 235, investment: 18000 },
      { name: 'Xinguara', revenue: 18600, roi: 198, investment: 18000 },
    ];
    
    for (const store of storePerformance) {
      const unitId = unitIds[store.name];
      if (!unitId) continue;
      
      // Delete existing
      await supabase
        .from('marketing_store_performance')
        .delete()
        .eq('unit_id', unitId)
        .gte('period_start', '2025-10-01');
      
      await supabase
        .from('marketing_store_performance')
        .insert({
          unit_id: unitId,
          period_type: 'quarterly',
          period_start: '2025-10-01',
          period_end: '2026-01-31',
          revenue: store.revenue,
          roi: store.roi / 100,
          investment: store.investment,
          conversion_rate: 4.2,
          foot_traffic: Math.floor(Math.random() * 5000) + 15000,
          impressions: Math.floor(Math.random() * 50000) + 100000,
          clicks: Math.floor(Math.random() * 5000) + 10000
        });
    }

    console.log('✅ Performance por loja criada');

    // ============================================================================
    // 10. CRIAR METAS
    // ============================================================================
    console.log('🎯 Criando metas...');
    
    await supabase
      .from('marketing_goals')
      .delete()
      .gte('period_start', '2025-10-01');
    
    const goals = [
      { name: 'Aumentar vendas Nestlé em 30%', kpi_type: 'revenue', period_type: 'quarterly', target_value: 30, current_value: 37, baseline_value: 0, status: 'achieved' },
      { name: 'ROI mínimo de 250%', kpi_type: 'roi', period_type: 'quarterly', target_value: 250, current_value: 285, baseline_value: 180, status: 'achieved' },
      { name: '100% comprovações enviadas', kpi_type: 'conversion_rate', period_type: 'quarterly', target_value: 100, current_value: 100, baseline_value: 0, status: 'achieved' },
      { name: 'Crescimento categoria Chocolates', kpi_type: 'revenue', period_type: 'quarterly', target_value: 40, current_value: 52, baseline_value: 0, status: 'achieved' },
    ];
    
    for (const goal of goals) {
      await supabase
        .from('marketing_goals')
        .insert({
          ...goal,
          period_start: '2025-10-01',
          period_end: '2026-01-31',
          notes: 'Meta da parceria Nestlé Q4/2025'
        });
    }

    console.log('✅ Metas criadas');

    // ============================================================================
    // 11. CRIAR ALERTAS HISTÓRICOS
    // ============================================================================
    console.log('🚨 Criando alertas...');
    
    await supabase
      .from('marketing_alerts')
      .delete()
      .gte('created_at', '2025-10-01');
    
    const alerts = [
      { title: 'Baixo estoque NESCAU na loja Faruk', type: 'stock', severity: 'high', description: 'Estoque de NESCAU 800g abaixo do mínimo na loja Faruk', is_resolved: true, resolved_at: '2025-11-11T10:00:00Z', ai_suggestion: 'Transferir estoque da loja VS10 que possui excedente', created_at: '2025-11-10T08:00:00Z' },
      { title: 'Comprovação pendente - Canaã', type: 'proof', severity: 'medium', description: 'Comprovação da ponta de gôndola 2 ainda não enviada', is_resolved: true, resolved_at: '2025-11-29T14:00:00Z', ai_suggestion: 'Entrar em contato com gerente da loja para envio da foto', created_at: '2025-11-28T09:00:00Z' },
      { title: 'Performance acima da meta - VS10', type: 'performance', severity: 'info', description: 'Loja VS10 atingiu 142% da meta de vendas Nestlé', is_resolved: false, ai_suggestion: 'Considerar VS10 como modelo para replicar práticas em outras lojas', created_at: '2025-12-18T11:00:00Z' },
      { title: 'KITKAT abaixo do giro ideal - Xinguara', type: 'stock', severity: 'medium', description: 'Giro de KITKAT 45g abaixo do esperado na loja Xinguara', is_resolved: true, resolved_at: '2026-01-04T16:00:00Z', ai_suggestion: 'Reposicionar produto para local de maior visibilidade', created_at: '2026-01-02T10:00:00Z' },
    ];
    
    for (const alert of alerts) {
      await supabase
        .from('marketing_alerts')
        .insert(alert);
    }

    console.log('✅ Alertas criados');

    // ============================================================================
    // 12. CRIAR INSIGHTS DE IA
    // ============================================================================
    console.log('🧠 Criando insights de IA...');
    
    await supabase
      .from('marketing_ai_insights')
      .delete()
      .gte('created_at', '2025-10-01');
    
    const insights = [
      { insight_type: 'performance', insight_text: 'Produtos de chocolate (+52%) superam significativamente achocolatados (+28%) em crescimento durante a exposição em ponta de gôndola', confidence_score: 92, suggestions: ['Para renovação, priorizar categoria Chocolates que demonstrou maior elasticidade à exposição'], context_data: { category: 'chocolates', growth: 52 } },
      { insight_type: 'store', insight_text: 'Loja VS10 tem a melhor conversão por m² de exposição (R$ 8.200/m²), seguida por Cidade Jardim (R$ 7.450/m²)', confidence_score: 88, suggestions: ['Considerar aumento de espaço em VS10 para próximas parcerias'], context_data: { store: 'VS10', conversionPerSqm: 8200 } },
      { insight_type: 'recommendation', insight_text: 'ROI de 285% supera benchmark do setor (180%) e meta interna (250%)', confidence_score: 95, suggestions: ['Recomendação: renovar parceria com Nestlé focando em chocolates e cafés especiais'], context_data: { roi: 285, benchmark: 180 } },
      { insight_type: 'opportunity', insight_text: 'Loja Xinguara teve performance 20% abaixo da média da rede', confidence_score: 85, suggestions: ['Avaliar posicionamento e visibilidade das pontas de gôndola nesta unidade'], context_data: { store: 'Xinguara', underperformance: 20 } },
      { insight_type: 'trend', insight_text: 'Dezembro apresentou pico de vendas (+23% vs média), correlacionado com período festivo', confidence_score: 90, suggestions: ['Planejar campanhas sazonais para maximizar retorno em datas comemorativas'], context_data: { month: 'dezembro', growth: 23 } },
    ];
    
    for (const insight of insights) {
      await supabase
        .from('marketing_ai_insights')
        .insert({
          ...insight,
          created_at: '2026-01-27T10:00:00Z'
        });
    }

    console.log('✅ Insights criados');

    // ============================================================================
    // 13. CRIAR CAMPANHA DE MARKETING
    // ============================================================================
    console.log('📢 Criando campanha de marketing...');
    
    await supabase
      .from('marketing_campaigns')
      .delete()
      .ilike('name', '%nestl%');
    
    await supabase
      .from('marketing_campaigns')
      .insert({
        name: 'Festival Nestlé - Pontas de Gôndola',
        type: 'trade_marketing',
        description: 'Campanha de apoio à parceria de pontas de gôndola com Nestlé, incluindo material de PDV e comunicação visual',
        status: 'completed',
        start_date: '2025-10-27',
        end_date: '2026-01-27',
        planned_budget: 15000,
        approved_budget: 15000,
        spent_amount: 14850,
        expected_roi: 250,
        actual_roi: 285,
        expected_reach: 50000,
        actual_reach: 68000,
        supplier_id: nestleSupplierId,
        priority: 'high',
        learnings: 'Exposição em ponta de gôndola mostrou ROI excepcional. Categoria chocolates teve melhor performance. VS10 foi a loja destaque.',
        briefing: 'Criar materiais de PDV para destacar os 15 produtos Nestlé nas 21 pontas de gôndola da rede.'
      });

    console.log('✅ Campanha de marketing criada');

    // ============================================================================
    // 14. CRIAR CAMPANHAS DE WHATSAPP
    // ============================================================================
    console.log('📱 Criando campanhas de WhatsApp...');
    
    await supabase
      .from('campaigns')
      .delete()
      .ilike('title', '%nestl%');
    
    await supabase
      .from('campaigns')
      .delete()
      .ilike('title', '%nescau%');
    
    const whatsappCampaigns = [
      { title: 'Promoção Nestlé - Semana 1', content_text: '🍫 PROMOÇÃO NESTLÉ! Aproveite ofertas especiais em chocolates e achocolatados. Venha conferir!', status: 'sent', message_type: 'promotional', scheduled_at: '2025-10-28T10:00:00Z', sent_at: '2025-10-28T10:00:00Z' },
      { title: 'Festival de Chocolate Nestlé', content_text: '🎉 FESTIVAL DO CHOCOLATE! KITKAT, Alpino, Crunch e muito mais com preços imperdíveis. Venha conferir!', status: 'sent', message_type: 'promotional', scheduled_at: '2025-11-15T10:00:00Z', sent_at: '2025-11-15T10:00:00Z' },
      { title: 'Ofertas NESCAU - Black Friday', content_text: '🖤 BLACK FRIDAY NESCAU! O achocolatado mais amado do Brasil com desconto especial. Corra que é só hoje!', status: 'sent', message_type: 'promotional', scheduled_at: '2025-11-29T08:00:00Z', sent_at: '2025-11-29T08:00:00Z' },
      { title: 'Natal Nestlé - Chocolates', content_text: '🎄 NATAL NESTLÉ! Monte sua cesta de chocolates com os melhores preços. Presenteie quem você ama!', status: 'sent', message_type: 'promotional', scheduled_at: '2025-12-20T09:00:00Z', sent_at: '2025-12-20T09:00:00Z' },
    ];
    
    for (const campaign of whatsappCampaigns) {
      await supabase
        .from('campaigns')
        .insert(campaign);
    }

    console.log('✅ Campanhas de WhatsApp criadas');

    // ============================================================================
    // RESULTADO FINAL
    // ============================================================================
    console.log('🎉 Seed de demonstração concluído com sucesso!');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Dados de demonstração inseridos com sucesso!',
        summary: {
          unidades: Object.keys(unitIds).length,
          fornecedor: 'Nestlé Brasil Ltda',
          pacoteTrade: packageId,
          checklistItems: 21,
          comprovacoes: 21,
          kpisMensais: 4,
          metas: 4,
          alertas: 4,
          insights: 5,
          campanhasWhatsApp: 4
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro no seed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
