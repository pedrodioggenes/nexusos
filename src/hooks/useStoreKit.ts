import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { RetailAction } from "./useRetailActions";
import type { ExecutionItem } from "./useRetailExecution";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface StoreKit {
  id: string;
  tenant_id: string;
  retail_action_id: string;
  kit_document_page_id: string | null;
  generated_at: string;
  created_at: string;
  updated_at: string;
}

export function useStoreKit(retailActionId: string | null) {
  const { tenant, user } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = tenant?.id;

  const kitQuery = useQuery({
    queryKey: ["store-kit", retailActionId],
    queryFn: async () => {
      if (!retailActionId || !tenantId) return null;
      const { data, error } = await supabase
        .from("retail_store_kits")
        .select("*")
        .eq("retail_action_id", retailActionId)
        .eq("tenant_id", tenantId)
        .maybeSingle();
      if (error) throw error;
      return data as StoreKit | null;
    },
    enabled: !!retailActionId && !!tenantId,
  });

  const generateKit = useMutation({
    mutationFn: async (action: RetailAction) => {
      if (!tenantId || !user) throw new Error("No tenant/user");

      // Fetch execution items for the action to build checklist section
      const { data: runs } = await supabase
        .from("retail_execution_runs")
        .select("id")
        .eq("retail_action_id", action.id)
        .eq("tenant_id", tenantId)
        .limit(1);

      let checklistItems: ExecutionItem[] = [];
      if (runs && runs.length > 0) {
        const { data: items } = await supabase
          .from("retail_execution_items")
          .select("*")
          .eq("execution_run_id", runs[0].id)
          .eq("tenant_id", tenantId)
          .order("category");
        checklistItems = (items || []) as ExecutionItem[];
      }

      // Build kit content as BlockNote-compatible JSON
      const content = buildKitContent(action, checklistItems);

      // Check if kit already exists
      const existing = kitQuery.data;

      let pageId: string;

      if (existing?.kit_document_page_id) {
        // Update existing page
        const { error: updateError } = await supabase
          .from("workspace_pages")
          .update({
            title: `📦 Kit de Loja — ${action.title}`,
            content: content as any,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.kit_document_page_id);
        if (updateError) throw updateError;
        pageId = existing.kit_document_page_id;

        // Update kit timestamp
        await supabase
          .from("retail_store_kits")
          .update({ generated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        // Create new workspace page
        const { data: page, error: pageError } = await supabase
          .from("workspace_pages")
          .insert({
            tenant_id: tenantId,
            title: `📦 Kit de Loja — ${action.title}`,
            icon: "📦",
            content: content as any,
            created_by: user.id,
          })
          .select()
          .single();
        if (pageError) throw pageError;
        pageId = page.id;

        // Upsert kit record
        if (existing) {
          await supabase
            .from("retail_store_kits")
            .update({ kit_document_page_id: pageId, generated_at: new Date().toISOString() })
            .eq("id", existing.id);
        } else {
          await supabase
            .from("retail_store_kits")
            .insert({
              tenant_id: tenantId,
              retail_action_id: action.id,
              kit_document_page_id: pageId,
            });
        }
      }

      // Also add a link in retail_action_links
      const { data: existingLinks } = await supabase
        .from("retail_action_links")
        .select("id")
        .eq("retail_action_id", action.id)
        .eq("linked_type", "document")
        .eq("linked_id", pageId);

      if (!existingLinks || existingLinks.length === 0) {
        await supabase.from("retail_action_links").insert({
          tenant_id: tenantId,
          retail_action_id: action.id,
          linked_type: "document",
          linked_id: pageId,
        });
      }

      return pageId;
    },
    onSuccess: (pageId) => {
      queryClient.invalidateQueries({ queryKey: ["store-kit"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-pages"] });
      queryClient.invalidateQueries({ queryKey: ["retail-action-links"] });
      toast.success("Kit de Loja gerado com sucesso!");
      return pageId;
    },
    onError: () => toast.error("Erro ao gerar Kit de Loja"),
  });

  return { kit: kitQuery.data, isLoading: kitQuery.isLoading, generateKit };
}

function buildKitContent(action: RetailAction, checklistItems: ExecutionItem[]): any[] {
  const channels = Array.isArray(action.channels) ? (action.channels as string[]) : [];
  const stores = Array.isArray(action.stores_scope) ? action.stores_scope : [];
  const period = action.period_start
    ? `${format(new Date(action.period_start), "dd/MM/yyyy", { locale: ptBR })}${action.period_end ? ` a ${format(new Date(action.period_end), "dd/MM/yyyy", { locale: ptBR })}` : ""}`
    : "A definir";

  const blocks: any[] = [];

  // Helper to create a paragraph block
  const p = (text: string, props?: any) => ({
    type: "paragraph",
    content: [{ type: "text", text, styles: props || {} }],
  });

  const h = (text: string, level: number = 2) => ({
    type: "heading",
    props: { level },
    content: [{ type: "text", text, styles: {} }],
  });

  const bullet = (text: string) => ({
    type: "bulletListItem",
    content: [{ type: "text", text, styles: {} }],
  });

  // 1. O que é a ação
  blocks.push(h("1. O que é esta Ação", 2));
  blocks.push(p(`Título: ${action.title}`));
  blocks.push(p(`Tipo: ${action.type}`));
  if (action.notes) blocks.push(p(`Descrição: ${action.notes}`));
  blocks.push(p(""));

  // 2. Prazo e lojas
  blocks.push(h("2. Prazo e Lojas", 2));
  blocks.push(p(`Período: ${period}`));
  blocks.push(p(`Lojas: ${stores.length > 0 ? `${stores.length} unidade(s) selecionada(s)` : "Todas as unidades"}`));
  blocks.push(p(""));

  // 3. Mecânica e produtos
  blocks.push(h("3. Mecânica e Produtos", 2));
  blocks.push(p(action.mechanics || "Sem mecânica definida."));
  blocks.push(p(""));

  // 4. Materiais
  blocks.push(h("4. Materiais e Canais", 2));
  if (channels.length > 0) {
    channels.forEach((ch) => blocks.push(bullet(`Canal: ${ch.replace("_", " ")}`)));
  } else {
    blocks.push(p("Nenhum canal definido. Adicione links de artes, PDFs e vídeos aqui."));
  }
  blocks.push(p("➡️ Insira links dos materiais abaixo:"));
  blocks.push(bullet("Arte principal: [link]"));
  blocks.push(bullet("Encarte/PDF: [link]"));
  blocks.push(bullet("Vídeo instrucional: [link]"));
  blocks.push(p(""));

  // 5. Checklist
  blocks.push(h("5. Checklist de Execução", 2));
  if (checklistItems.length > 0) {
    const grouped = checklistItems.reduce((acc, item) => {
      const cat = item.category || "outro";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<string, ExecutionItem[]>);

    Object.entries(grouped).forEach(([category, items]) => {
      blocks.push(p(`📋 ${category.charAt(0).toUpperCase() + category.slice(1)}`, { bold: true }));
      items.forEach((item) => {
        blocks.push(bullet(`${item.required ? "⚠️ [OBRIGATÓRIO]" : "○"} ${item.title}`));
      });
    });
  } else {
    blocks.push(p("Checklist será gerado quando a execução for iniciada."));
    blocks.push(bullet("⚠️ Preços atualizados no sistema"));
    blocks.push(bullet("⚠️ Etiquetas de preço na gôndola"));
    blocks.push(bullet("⚠️ Produto abastecido na gôndola"));
    blocks.push(bullet("○ Ponta de gôndola montada"));
    blocks.push(bullet("⚠️ Material de comunicação instalado"));
    blocks.push(bullet("○ Degustação preparada"));
    blocks.push(bullet("○ TV interna com conteúdo atualizado"));
    blocks.push(bullet("○ WhatsApp disparado para clientes"));
    blocks.push(bullet("○ Promotor presente na loja"));
  }
  blocks.push(p(""));

  // 6. Como tirar evidência
  blocks.push(h("6. Como Tirar Evidência", 2));
  blocks.push(bullet("Fotografe o ponto de execução de frente, mostrando o produto e a etiqueta de preço."));
  blocks.push(bullet("Fotografe a ponta de gôndola de corpo inteiro."));
  blocks.push(bullet("Para degustação: foto do promotor com a mesa montada."));
  blocks.push(bullet("Print do WhatsApp enviado."));
  blocks.push(bullet("Foto da TV com o conteúdo em exibição."));
  blocks.push(p("⚠️ Todas as fotos devem ter boa iluminação e mostrar claramente o produto/material."));
  blocks.push(p(""));

  // 7. O que fazer se faltar produto/material
  blocks.push(h("7. Contingências", 2));
  blocks.push(bullet("Produto em falta: notificar gerente imediatamente e registrar no sistema (issue: sem_produto)."));
  blocks.push(bullet("Material de comunicação não chegou: abrir issue como falta_material e notificar marketing."));
  blocks.push(bullet("Promotor ausente: registrar issue sem_promotor e contactar supervisão de trade."));
  blocks.push(bullet("Preço divergente: não executar até correção. Registrar como preco_errado."));
  blocks.push(p(""));

  blocks.push(p(`📅 Kit gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, { italic: true }));

  return blocks;
}
