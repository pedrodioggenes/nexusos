import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HWDocumentSignature {
  id: string;
  tenant_id: string;
  document_id: string;
  document_title: string;
  signer_id: string;
  requested_by: string | null;
  status: string;
  signed_at: string | null;
  ip_address: string | null;
  signature_hash: string | null;
  created_at: string;
}

export function useHWDocumentSignatures(tenantId?: string, signerId?: string) {
  return useQuery({
    queryKey: ["hw-document-signatures", tenantId, signerId],
    queryFn: async (): Promise<HWDocumentSignature[]> => {
      if (!tenantId) return [];
      let q = supabase
        .from("hw_document_signatures" as any)
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });
      if (signerId) q = q.eq("signer_id", signerId);
      const { data, error } = await q.limit(50);
      if (error) throw error;
      return (data || []) as unknown as HWDocumentSignature[];
    },
    enabled: !!tenantId,
    staleTime: 60_000,
  });
}

export function useRequestSignature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { tenant_id: string; document_id: string; document_title: string; signer_id: string; requested_by: string }) => {
      const { error } = await supabase.from("hw_document_signatures" as any).insert(params);
      if (error) throw error;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["hw-document-signatures", v.tenant_id] }),
  });
}

export function useSignDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ip_address }: { id: string; ip_address?: string }) => {
      const hash = crypto.randomUUID();
      const { error } = await supabase
        .from("hw_document_signatures" as any)
        .update({
          status: "signed",
          signed_at: new Date().toISOString(),
          ip_address: ip_address || null,
          signature_hash: hash,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hw-document-signatures"] }),
  });
}
