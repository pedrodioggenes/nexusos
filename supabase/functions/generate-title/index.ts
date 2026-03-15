import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ title: "Nova conversa" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
       // Fallback to simple truncation
       const fallbackTitle = message.slice(0, 30).replace(/\n/g, ' ').trim();
      return new Response(
        JSON.stringify({ title: fallbackTitle || "Nova conversa" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating smart title for message:", message.slice(0, 50) + "...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Gere um título curto (2-4 palavras) que resuma o tema da mensagem.

REGRAS:
1. Use palavras completas e naturais (NÃO abrevie)
2. Máximo 30 caracteres
3. Sem artigos (o, a, os, as, de, do, da)
4. Responda APENAS o título, sem aspas ou pontuação

Exemplos:
- "qual o ROI da campanha Nestlé?" → ROI Campanha Nestlé
- "quais itens tiveram venda zero?" → Itens Venda Zero
- "compare as lojas do último trimestre" → Lojas Trimestre
- "preciso de um relatório de marketing" → Relatório Marketing
- "me mostre os alertas do dia" → Alertas do Dia
- "performance das lojas em janeiro" → Performance Lojas
- "quanto gastamos com a P&G?" → Gastos P&G
- "status do orçamento de marketing" → Status Orçamento`
          },
          { role: "user", content: message }
        ],
        max_tokens: 20,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
       // Fallback to simple truncation
       const fallbackTitle = message.slice(0, 30).replace(/\n/g, ' ').trim();
      return new Response(
        JSON.stringify({ title: fallbackTitle || "Nova conversa" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    let title = data.choices?.[0]?.message?.content?.trim() || "Nova conversa";
    
    // Clean up the title - remove quotes, periods, and limit length
    title = title.replace(/^["']|["']$/g, '').replace(/\.+$/, '').trim();
    
     // Ensure it's not too long
     if (title.length > 30) {
       title = title.slice(0, 27) + "...";
    }

    console.log("Generated title:", title);

    return new Response(
      JSON.stringify({ title }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating title:", error);
    
    return new Response(
      JSON.stringify({ title: "Nova conversa" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
