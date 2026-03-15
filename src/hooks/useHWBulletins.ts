import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HWBulletin {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  pinned: boolean;
  expires_at: string | null;
  created_at: string;
  author_name?: string;
}

export function useHWBulletins(tenantId?: string) {
  return useQuery({
    queryKey: ["hw-bulletins", tenantId],
    queryFn: async (): Promise<HWBulletin[]> => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("hw_bulletins" as any)
        .select("*")
        .eq("tenant_id", tenantId)
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;

      const authorIds = [...new Set((data || []).map((b: any) => b.author_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, email").in("user_id", authorIds);
      const nameMap = new Map<string, string>();
      (profiles || []).forEach((p: any) => nameMap.set(p.user_id, p.full_name || p.email?.split("@")[0] || "Usuário"));

      return (data || []).map((b: any) => ({
        ...b,
        author_name: nameMap.get(b.author_id) || "Usuário",
      }));
    },
    enabled: !!tenantId,
  });
}

export function useCreateBulletin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { tenant_id: string; author_id: string; title: string; content: string; category?: string; priority?: string; pinned?: boolean }) => {
      const { error } = await supabase.from("hw_bulletins" as any).insert({
        tenant_id: params.tenant_id,
        author_id: params.author_id,
        title: params.title,
        content: params.content,
        category: params.category || "general",
        priority: params.priority || "normal",
        pinned: params.pinned || false,
      });
      if (error) throw error;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["hw-bulletins", v.tenant_id] }),
  });
}
