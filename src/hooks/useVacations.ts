import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useLeaveRequests(employeeId?: string, tenantId?: string) {
  return useQuery({
    queryKey: ["leaveRequests", employeeId, tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      let query = supabase
        .from("leave_requests")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("start_date", { ascending: false });
      
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

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (leaveRequest: any) => {
      const { data, error } = await supabase
        .from("leave_requests")
        .insert([leaveRequest])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["leaveRequests", variables.employee_id, variables.tenant_id] 
      });
    },
  });
}

export function useApproveLeaveRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      approvedBy, 
      tenantId,
      employeeId 
    }: { 
      id: string; 
      approvedBy: string; 
      tenantId: string;
      employeeId: string;
    }) => {
      const { data, error } = await supabase
        .from("leave_requests")
        .update({
          status: "approved",
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["leaveRequests", variables.employeeId, variables.tenantId] 
      });
    },
  });
}

export function useRejectLeaveRequest() {
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
        .from("leave_requests")
        .update({
          status: "rejected",
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["leaveRequests", variables.employeeId, variables.tenantId] 
      });
    },
  });
}
