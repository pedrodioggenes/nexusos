import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Module-specific system prompts
const MODULE_PROMPTS: Record<string, string> = {
  dashboard: `Você é um analista de marketing sênior focado em visão executiva.
Analise os KPIs gerais, uso de orçamento e performance por canal.
Foque em: anomalias de ROI, alertas de budget, oportunidades de otimização cross-channel.`,

  budget: `Você é um especialista em gestão de orçamento de marketing.
Analise alocações, gastos por categoria e tendências de consumo.
Foque em: categorias com baixa execução, riscos de estouro, oportunidades de realocação.`,

  kpi: `Você é um analista de performance de marketing.
Analise métricas de conversão, ROI por canal, CTR e engajamento.
Foque em: canais com queda de performance, comparativos com período anterior, metas não atingidas.`,

  campaign: `Você é um estrategista de campanhas de marketing.
Analise status de campanhas, taxas de sucesso e cronogramas.
Foque em: campanhas em risco, oportunidades de escala, padrões de sucesso.`,

  store: `Você é um analista de performance de lojas/PDV.
Analise vendas por região, performance de displays e execução de ações.
Foque em: lojas com baixa conversão, melhores práticas de PDV, disparidades regionais.`,

  trade: `Você é um especialista em Trade Marketing.
Analise pacotes de fornecedores, comprovações e checklists.
Foque em: gargalos no processo, fornecedores com pendências críticas, ROI de ativações.`,

  supplier: `Você é um consultor de gestão para fornecedores de trade marketing.
Ajude o fornecedor a priorizar suas entregas e melhorar aprovação.
Foque em: itens com prazo crítico, dicas para aprovação rápida, otimização de entregas.`,
};

// Module-specific action templates
const MODULE_ACTIONS: Record<string, Array<{ id: string; text: string; action_type: string; route?: string }>> = {
  dashboard: [
    { id: 'view_kpis', text: 'Ver KPIs Detalhados', action_type: 'navigate', route: '/app/marketing/kpis' },
    { id: 'view_budget', text: 'Analisar Orçamento', action_type: 'navigate', route: '/app/marketing/orcamento' },
    { id: 'view_alerts', text: 'Ver Alertas', action_type: 'navigate', route: '/app/marketing/alertas' },
    { id: 'generate_report', text: 'Gerar Relatório', action_type: 'action' },
  ],
  budget: [
    { id: 'reallocate', text: 'Realocar Budget', action_type: 'action' },
    { id: 'view_categories', text: 'Ver por Categoria', action_type: 'navigate', route: '/app/marketing/orcamento' },
    { id: 'add_extra', text: 'Solicitar Extra', action_type: 'action' },
    { id: 'view_history', text: 'Histórico de Gastos', action_type: 'action' },
  ],
  kpi: [
    { id: 'view_channel', text: 'Detalhar por Canal', action_type: 'navigate', route: '/app/marketing/kpis' },
    { id: 'compare_period', text: 'Comparar Períodos', action_type: 'action' },
    { id: 'set_goal', text: 'Definir Meta', action_type: 'action' },
    { id: 'export_report', text: 'Exportar Relatório', action_type: 'action' },
  ],
  campaign: [
    { id: 'view_at_risk', text: 'Ver Campanhas em Risco', action_type: 'navigate', route: '/app/marketing/campanhas' },
    { id: 'create_campaign', text: 'Nova Campanha', action_type: 'action' },
    { id: 'view_timeline', text: 'Ver Timeline', action_type: 'navigate', route: '/app/marketing/planejamento' },
    { id: 'duplicate_success', text: 'Replicar Sucesso', action_type: 'action' },
  ],
  store: [
    { id: 'view_ranking', text: 'Ver Ranking Lojas', action_type: 'navigate', route: '/app/marketing/lojas' },
    { id: 'compare_regions', text: 'Comparar Regiões', action_type: 'action' },
    { id: 'view_low_perf', text: 'Lojas Críticas', action_type: 'action' },
    { id: 'send_alert', text: 'Enviar Alerta', action_type: 'action' },
  ],
  trade: [
    { id: 'view_pending', text: 'Ver Pendências', action_type: 'navigate', route: '/app/trade/comprovacoes' },
    { id: 'contact_supplier', text: 'Contatar Fornecedor', action_type: 'action' },
    { id: 'view_packages', text: 'Ver Pacotes', action_type: 'navigate', route: '/app/trade/pacotes' },
    { id: 'approve_batch', text: 'Aprovar em Lote', action_type: 'action' },
  ],
  supplier: [
    { id: 'view_checklist', text: 'Ver Checklist', action_type: 'navigate', route: '/app/trade/fornecedor/checklist' },
    { id: 'upload_proof', text: 'Enviar Comprovação', action_type: 'navigate', route: '/app/trade/fornecedor/comprovacoes' },
    { id: 'view_packages', text: 'Meus Pacotes', action_type: 'navigate', route: '/app/trade/fornecedor/pacotes' },
    { id: 'contact_support', text: 'Falar com Suporte', action_type: 'action' },
  ],
};

// Base system prompt
const BASE_SYSTEM_PROMPT = `Você é um assistente de inteligência de negócios especializado em análise de dados de marketing e trade marketing para redes de varejo.

## REGRAS DE FORMATAÇÃO:
1. Máximo de 2-3 frases curtas e diretas
2. Comece com a descoberta principal (dado mais impactante)
3. Termine com uma recomendação acionável específica
4. NÃO use emojis, markdown, bullets ou formatação especial
5. Seja direto, objetivo e use dados concretos quando disponíveis

## EXEMPLO DE INSIGHT BOM:
"O ROI do canal digital caiu 15% este mês enquanto o investimento aumentou 20%. Considere redistribuir R$ 25.000 para Trade Marketing que apresenta ROI 3x maior."

## EXEMPLO RUIM (evite):
"📈 **Análise** Observei uma variação interessante nos indicadores que merece atenção..."

Responda APENAS com o texto do insight, sem introduções.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Serviço de IA não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { type, contextData, prompt } = await req.json();
    const insightType = type || 'dashboard';

    console.log(`Generating insight for type: ${insightType}`);

    // Get module-specific prompt
    const modulePrompt = MODULE_PROMPTS[insightType] || MODULE_PROMPTS.dashboard;
    const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\n## CONTEXTO DO MÓDULO:\n${modulePrompt}`;

    // Build context summary
    const contextSummary = contextData && Object.keys(contextData).length > 0 
      ? JSON.stringify(contextData, null, 2) 
      : "Dados não disponíveis - forneça uma análise geral baseada em boas práticas de marketing";
    
    const userMessage = `
${prompt || 'Analise os dados e forneça insights estratégicos.'}

## DADOS DE CONTEXTO:
${contextSummary}

Gere um insight conciso (2-3 frases) com uma recomendação acionável.
`;

    // Call Lovable AI Gateway with tool calling for structured suggestions
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 400,
        temperature: 0.7,
        tools: [
          {
            type: "function",
            function: {
              name: "generate_insight_with_actions",
              description: "Generate a business insight with recommended actions",
              parameters: {
                type: "object",
                properties: {
                  insight: {
                    type: "string",
                    description: "The concise insight text (2-3 sentences)"
                  },
                  confidence: {
                    type: "number",
                    description: "Confidence score from 70 to 95"
                  },
                  priority_actions: {
                    type: "array",
                    description: "Top 2-3 recommended action IDs from the available actions",
                    items: { type: "string" }
                  }
                },
                required: ["insight", "confidence", "priority_actions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_insight_with_actions" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos para continuar." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro ao gerar insight" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    
    let insightText = "Não foi possível gerar o insight.";
    let confidenceScore = 85;
    let priorityActionIds: string[] = [];

    // Parse tool call response
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        insightText = parsed.insight || insightText;
        confidenceScore = parsed.confidence || confidenceScore;
        priorityActionIds = parsed.priority_actions || [];
      } catch (e) {
        console.error("Error parsing tool response:", e);
        // Fallback to content if tool parsing fails
        insightText = result.choices?.[0]?.message?.content || insightText;
      }
    } else {
      // Fallback if no tool call
      insightText = result.choices?.[0]?.message?.content || insightText;
    }

    // Get available actions for this module and filter by AI recommendations
    const availableActions = MODULE_ACTIONS[insightType] || MODULE_ACTIONS.dashboard;
    let suggestions = availableActions;
    
    // If AI recommended specific actions, prioritize those
    if (priorityActionIds.length > 0) {
      const prioritized = priorityActionIds
        .map(id => availableActions.find(a => a.id === id))
        .filter((a): a is { id: string; text: string; action_type: string; route?: string } => a !== undefined);
      
      // Add remaining actions that weren't prioritized
      const remaining = availableActions.filter(a => !priorityActionIds.includes(a.id));
      suggestions = [...prioritized, ...remaining].slice(0, 3);
    } else {
      suggestions = availableActions.slice(0, 3);
    }

    console.log("Insight generated successfully with", suggestions.length, "suggestions");

    return new Response(
      JSON.stringify({ 
        insight: insightText.trim(),
        type: insightType,
        confidence_score: Math.min(95, Math.max(70, confidenceScore)),
        suggestions,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating insight:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
