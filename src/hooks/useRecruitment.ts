import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useJobCandidates(tenantId?: string) {
  return useQuery({
    queryKey: ["jobCandidates", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from("job_candidates")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantId,
  });
}

export function useCreateJobCandidate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (candidate: any) => {
      const { data, error } = await supabase
        .from("job_candidates")
        .insert([candidate])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["jobCandidates", variables.tenant_id] 
      });
    },
  });
}

export function useUpdateJobCandidateStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      status,
      tenantId 
    }: { 
      id: string; 
      status: string;
      tenantId: string;
    }) => {
      const { data, error } = await supabase
        .from("job_candidates")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["jobCandidates", variables.tenantId] 
      });
    },
  });
}

export function useDeleteJobCandidate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, tenantId }: { id: string; tenantId: string }) => {
      const { error } = await supabase
        .from("job_candidates")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["jobCandidates", variables.tenantId] 
      });
    },
  });
}
