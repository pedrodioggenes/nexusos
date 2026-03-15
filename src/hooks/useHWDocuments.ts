import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useHWDocuments(tenantId?: string) {
  return useQuery({
    queryKey: ["hw-documents", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("hw_documents")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data?.length) return [];

      // Get uploader profiles
      const uploaderIds = [...new Set(data.map(d => d.uploaded_by))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", uploaderIds);
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      return data.map(doc => {
        const uploader = profileMap.get(doc.uploaded_by);
        return {
          id: doc.id,
          name: doc.name,
          fileType: doc.file_type || 'file',
          contextType: doc.context_type as 'personal' | 'team' | 'department' | 'rh',
          contextLabel: doc.context_type === 'personal' ? 'Pessoal' :
                        doc.context_type === 'team' ? 'Equipe' :
                        doc.context_type === 'department' ? 'Departamento' :
                        doc.context_type === 'rh' ? 'RH' : doc.context_type,
          uploadedBy: uploader?.full_name || uploader?.email?.split("@")[0] || 'Usuário',
          uploadedAt: new Date(doc.created_at).toLocaleDateString('pt-BR'),
          size: '-',
          filePath: doc.file_path,
        };
      });
    },
    enabled: !!tenantId,
    staleTime: 60_000,
  });
}

export function useUploadHWDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doc: {
      tenant_id: string;
      name: string;
      file_path: string;
      file_type?: string;
      context_type: string;
      context_id?: string;
      uploaded_by: string;
    }) => {
      const { data, error } = await supabase
        .from("hw_documents")
        .insert([doc])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hw-documents", variables.tenant_id] });
    },
  });
}
