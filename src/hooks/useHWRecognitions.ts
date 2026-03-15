import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HWRecognition {
  id: string;
  from_user_id: string;
  to_user_id: string;
  category: string;
  message: string;
  emoji: string;
  created_at: string;
  from_name?: string;
  to_name?: string;
}

export function useHWRecognitions(tenantId?: string) {
  return useQuery({
    queryKey: ["hw-recognitions", tenantId],
    queryFn: async (): Promise<HWRecognition[]> => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("hw_recognitions" as any)
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      
      // Enrich with names
      const userIds = new Set<string>();
      (data || []).forEach((r: any) => { userIds.add(r.from_user_id); userIds.add(r.to_user_id); });
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", Array.from(userIds));
      
      const nameMap = new Map<string, string>();
      (profiles || []).forEach((p: any) => nameMap.set(p.user_id, p.full_name || p.email?.split("@")[0] || "Usuário"));
      
      return (data || []).map((r: any) => ({
        ...r,
        from_name: nameMap.get(r.from_user_id) || "Usuário",
        to_name: nameMap.get(r.to_user_id) || "Usuário",
      }));
    },
    enabled: !!tenantId,
  });
}

export function useCreateRecognition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { tenant_id: string; from_user_id: string; to_user_id: string; message: string; emoji?: string; category?: string }) => {
      const { error } = await supabase.from("hw_recognitions" as any).insert({
        tenant_id: params.tenant_id,
        from_user_id: params.from_user_id,
        to_user_id: params.to_user_id,
        message: params.message,
        emoji: params.emoji || "⭐",
        category: params.category || "kudos",
      });
      if (error) throw error;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["hw-recognitions", v.tenant_id] }),
  });
}
