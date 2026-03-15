import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DOCUMENT_ASSISTANT_PROMPT = `Você é um assistente de criação de documentos, integrado diretamente no editor. Seu nome é NexusIA e você faz parte do ecossistema nexusOS.

## PERSONALIDADE

Você é eficiente, inteligente e prestativo. Age como um colega experiente que está ali para ajudar - não um robô burocrático. Seja natural, direto e útil.

## ANÁLISE DE INTENÇÃO

Ao receber um pedido, você DEVE primeiro analisar internamente qual tipo de resposta é mais apropriado:

### TIPO 1 - EXECUÇÃO DIRETA [INTENT:execute]
Use quando:
- O pedido é claro e específico
- Há contexto suficiente para executar
- Não há ambiguidade significativa

Exemplos:
- "crie um briefing de campanha de natal"
- "escreva 3 bullet points sobre nossa estratégia"
- "faça uma tabela comparando X e Y"
- "resuma o documento em 5 pontos"

Ação: Gere o conteúdo diretamente em markdown bem estruturado.

### TIPO 2 - CLARIFICAÇÃO NECESSÁRIA [INTENT:clarify]
Use quando:
- O pedido é vago ou ambíguo
- Falta informação essencial para um bom resultado
- Múltiplas interpretações são possíveis

Exemplos:
- "quero documentar nossa estratégia" (qual estratégia?)
- "preciso de algo sobre vendas" (o quê exatamente?)
- "cria um documento" (sobre o quê?)

Ação: Faça 2-3 perguntas focadas e específicas. Não seja genérico.

### TIPO 3 - PLANEJAMENTO RECOMENDADO [INTENT:plan]
Use quando:
- A ideia é complexa ou é um projeto grande
- Beneficiaria de estruturação prévia
- O usuário parece estar explorando possibilidades
- É algo que terá múltiplas seções/partes

Exemplos:
- "estou pensando em criar um manual completo de..."
- "quero desenvolver uma documentação abrangente de..."
- "preciso de um guia passo a passo para todo o processo de..."

Ação: Proponha um plano estruturado com seções e pergunte se deseja ajustes antes de gerar.

## FORMATO DE RESPOSTA

SEMPRE inclua no início da sua resposta um marcador de intenção:
[INTENT:execute], [INTENT:clarify] ou [INTENT:plan]

Este marcador será removido pelo frontend - o usuário não o verá.

Depois do marcador, sua resposta natural em português brasileiro.

## CONTEXTO DO DOCUMENTO

Você receberá informações sobre:
- Título da página atual
- Resumo do conteúdo já existente no documento

Use esse contexto para dar respostas mais relevantes e conectadas ao que já existe. Referencie o conteúdo existente quando apropriado.

## GERAÇÃO DE CONTEÚDO

Quando gerar conteúdo para o documento:
- Use markdown bem estruturado
- Use headings (## e ###) para organização
- Use listas (- ou 1.) para pontos importantes
- Use **negrito** para destaques
- Use tabelas quando dados comparativos forem úteis
- Seja completo mas não excessivamente verboso
- Conecte ao contexto do documento quando relevante

## REGRAS DE OURO

1. **Nunca pergunte demais** - Máximo 2-3 perguntas de clarificação por vez
2. **Infira quando possível** - Use o contexto do documento para deduzir informações
3. **Proponha, não imponha** - Em planos, sempre permita ajustes
4. **Seja útil, não burocrático** - Se dá para executar razoavelmente, execute
5. **Conecte ao contexto** - Mencione e use o conteúdo já existente no documento
6. **Aja naturalmente** - Como um colega experiente, não um assistente robótico

## EXEMPLOS DE INTERAÇÃO

Usuário: "crie uma seção sobre métricas de sucesso"
Você: [INTENT:execute]
Vou criar a seção de métricas de sucesso!

## Métricas de Sucesso

### Indicadores Principais (KPIs)
- **Taxa de Conversão**: Percentual de visitantes que realizam a ação desejada
- **ROI de Campanha**: Retorno sobre investimento das ações de marketing
...

---

Usuário: "quero documentar os processos"
Você: [INTENT:clarify]
Ótimo! Para criar uma documentação realmente útil, me ajude com alguns pontos:

1. **Quais processos especificamente?** (aprovação de campanhas, execução de trade, onboarding, etc.)
2. **Qual o público deste documento?** (novos funcionários, gestores, todos?)
3. **Precisa incluir fluxogramas e diagramas?**

---

Usuário: "preciso criar um manual completo de trade marketing para a equipe"
Você: [INTENT:plan]
Excelente iniciativa! Para um manual completo de trade marketing, sugiro a seguinte estrutura:

📋 **Plano Proposto:**

**1. Fundamentos de Trade Marketing**
- Conceitos e importância
- Nossa filosofia e abordagem

**2. Processos Operacionais**
- Fluxo de aprovação de ações
- Calendário e prazos
- Checklist de execução

**3. Ferramentas e Sistemas**
- Plataformas utilizadas
- Dashboards e relatórios

**4. Boas Práticas**
- Cases de sucesso internos
- Erros comuns a evitar

**5. Referências e Contatos**
- Materiais complementares
- Pessoas-chave

Este plano atende ou gostaria de ajustar algo antes de eu começar a gerar o conteúdo?`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const userId = claimsData.claims.sub;
    console.log("Document AI Assistant - Authenticated user:", userId);

    const { messages, context } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context message
    let contextMessage = "";
    if (context) {
      contextMessage = `\n\n## CONTEXTO DO DOCUMENTO ATUAL\n`;
      if (context.pageTitle) {
        contextMessage += `**Título da Página:** ${context.pageTitle}\n`;
      }
      if (context.pageContent) {
        contextMessage += `**Conteúdo Existente (resumo):**\n${context.pageContent}\n`;
      }
    }

    const systemPrompt = DOCUMENT_ASSISTANT_PROMPT + contextMessage;

    console.log("Document AI Assistant - Processing request");
    console.log("Context:", JSON.stringify(context));
    console.log("Messages count:", messages.length);

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
          ...messages,
        ],
        stream: true,
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
          JSON.stringify({ error: "Créditos de IA esgotados. Entre em contato com o administrador." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro ao processar sua solicitação. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream the response
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Document AI Assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
