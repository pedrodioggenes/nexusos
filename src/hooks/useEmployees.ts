import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEmployees(tenantId?: string) {
  return useQuery({
    queryKey: ["employees", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("full_name");
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantId,
  });
}

export function useEmployee(employeeId?: string) {
  return useQuery({
    queryKey: ["employee", employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("id", employeeId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (employee: any) => {
      const { data, error } = await supabase
        .from("employees")
        .insert([employee])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["employees", variables.tenant_id] 
      });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (employee: any) => {
      const { id, ...data } = employee;
      const { data: updated, error } = await supabase
        .from("employees")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return updated;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["employee", variables.id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["employees", variables.tenant_id] 
      });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, tenantId }: { id: string; tenantId: string }) => {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["employees", variables.tenantId] 
      });
    },
  });
}
