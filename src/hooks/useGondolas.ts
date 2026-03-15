import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useGondolas(tenantId?: string, unitId?: string) {
  return useQuery({
    queryKey: ["gondolas", tenantId, unitId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      let query = supabase
        .from("gondolas")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("code");
      
      if (unitId) {
        query = query.eq("unit_id", unitId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantId,
  });
}

export function useCreateGondola() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (gondola: any) => {
      const { data, error } = await supabase
        .from("gondolas")
        .insert([gondola])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gondolas", variables.tenant_id] });
    },
  });
}

export function useUpdateGondola() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (gondola: any) => {
      const { id, ...data } = gondola;
      const { data: updated, error } = await supabase
        .from("gondolas")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return updated;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gondolas", variables.tenant_id] });
    },
  });
}
