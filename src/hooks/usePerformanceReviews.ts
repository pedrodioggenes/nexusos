import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePerformanceReviews(employeeId?: string, tenantId?: string) {
  return useQuery({
    queryKey: ["performanceReviews", employeeId, tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      let query = supabase
        .from("performance_reviews")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });
      
      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantId,
  });
}

export function useCreatePerformanceReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (review: any) => {
      const { data, error } = await supabase
        .from("performance_reviews")
        .insert([review])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["performanceReviews", variables.employee_id, variables.tenant_id] 
      });
    },
  });
}

export function useUpdatePerformanceReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (review: any) => {
      const { id, ...data } = review;
      const { data: updated, error } = await supabase
        .from("performance_reviews")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return updated;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["performanceReviews", variables.employee_id, variables.tenant_id] 
      });
    },
  });
}

export function useSubmitPerformanceReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      tenantId,
      employeeId 
    }: { 
      id: string; 
      tenantId: string;
      employeeId: string;
    }) => {
      const { data, error } = await supabase
        .from("performance_reviews")
        .update({
          status: "submitted",
          submitted_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["performanceReviews", variables.employeeId, variables.tenantId] 
      });
    },
  });
}
