import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface DemandDocumentLink {
  id: string;
  demand_id: string;
  page_id: string;
  created_by: string;
  created_at: string;
  tenant_id: string;
  // Joined fields
  page_title?: string;
  page_icon?: string;
  demand_title?: string;
}

// Fetch documents linked to a demand
export function useDemandDocuments(demandId: string | undefined) {
  return useQuery({
    queryKey: ["demand-documents", demandId],
    queryFn: async () => {
      if (!demandId) return [];
      const { data, error } = await supabase
        .from("demand_document_links")
        .select("*, workspace_pages!inner(title, icon)")
        .eq("demand_id", demandId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((link: any) => ({
        id: link.id,
        demand_id: link.demand_id,
        page_id: link.page_id,
        created_by: link.created_by,
        created_at: link.created_at,
        tenant_id: link.tenant_id,
        page_title: link.workspace_pages?.title,
        page_icon: link.workspace_pages?.icon,
      })) as DemandDocumentLink[];
    },
    enabled: !!demandId,
  });
}

// Fetch demands linked to a document/page
export function useDocumentDemands(pageId: string | undefined) {
  return useQuery({
    queryKey: ["document-demands", pageId],
    queryFn: async () => {
      if (!pageId) return [];
      const { data, error } = await supabase
        .from("demand_document_links")
        .select("*, marketing_demands!inner(title)")
        .eq("page_id", pageId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((link: any) => ({
        id: link.id,
        demand_id: link.demand_id,
        page_id: link.page_id,
        created_by: link.created_by,
        created_at: link.created_at,
        tenant_id: link.tenant_id,
        demand_title: link.marketing_demands?.title,
      })) as DemandDocumentLink[];
    },
    enabled: !!pageId,
  });
}

// Link a document to a demand
export function useLinkDocument() {
  const queryClient = useQueryClient();
  const { user, tenant } = useAuth();

  return useMutation({
    mutationFn: async ({ demandId, pageId }: { demandId: string; pageId: string }) => {
      if (!user?.id || !tenant?.id) throw new Error("Sessão inválida");

      const { data, error } = await supabase
        .from("demand_document_links")
        .insert({
          demand_id: demandId,
          page_id: pageId,
          created_by: user.id,
          tenant_id: tenant.id,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") throw new Error("Documento já vinculado a esta demanda");
        throw error;
      }
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["demand-documents", vars.demandId] });
      queryClient.invalidateQueries({ queryKey: ["document-demands", vars.pageId] });
      toast.success("Documento vinculado com sucesso");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erro ao vincular documento");
    },
  });
}

// Unlink a document from a demand
export function useUnlinkDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId, demandId, pageId }: { linkId: string; demandId: string; pageId: string }) => {
      const { error } = await supabase
        .from("demand_document_links")
        .delete()
        .eq("id", linkId);

      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["demand-documents", vars.demandId] });
      queryClient.invalidateQueries({ queryKey: ["document-demands", vars.pageId] });
      toast.success("Vínculo removido");
    },
    onError: () => {
      toast.error("Erro ao remover vínculo");
    },
  });
}

// Create a new document and link it to a demand
export function useCreateAndLinkDocument() {
  const queryClient = useQueryClient();
  const { user, tenant } = useAuth();

  return useMutation({
    mutationFn: async ({ demandId, title }: { demandId: string; title: string }) => {
      if (!user?.id || !tenant?.id) throw new Error("Sessão inválida");

      // 1. Create workspace page
      const { data: page, error: pageError } = await supabase
        .from("workspace_pages")
        .insert({
          title,
          icon: "📄",
          content: [],
          tenant_id: tenant.id,
          created_by: user.id,
        })
        .select()
        .single();

      if (pageError) throw pageError;

      // 2. Create link
      const { error: linkError } = await supabase
        .from("demand_document_links")
        .insert({
          demand_id: demandId,
          page_id: page.id,
          created_by: user.id,
          tenant_id: tenant.id,
        });

      if (linkError) throw linkError;

      return page;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["demand-documents", vars.demandId] });
      queryClient.invalidateQueries({ queryKey: ["workspace-pages"] });
      toast.success("Documento criado e vinculado");
    },
    onError: () => {
      toast.error("Erro ao criar documento");
    },
  });
}
