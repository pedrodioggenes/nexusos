import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useTimeEntries(employeeId?: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["timeEntries", employeeId, startDate, endDate],
    queryFn: async () => {
      if (!employeeId) return [];
      
      let query = supabase
        .from("time_entries")
        .select("*")
        .eq("employee_id", employeeId)
        .order("timestamp", { ascending: false });
      
      if (startDate) {
        query = query.gte("timestamp", startDate);
      }
      if (endDate) {
        query = query.lte("timestamp", endDate);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });
}

export function useClockIn() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ employeeId, tenantId }: { employeeId: string; tenantId: string }) => {
      const { data, error } = await supabase
        .from("time_entries")
        .insert([
          {
            employee_id: employeeId,
            tenant_id: tenantId,
            entry_type: "clock_in",
            timestamp: new Date().toISOString(),
          },
        ])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["timeEntries", variables.employeeId] 
      });
    },
  });
}

export function useClockOut() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ employeeId, tenantId }: { employeeId: string; tenantId: string }) => {
      const { data, error } = await supabase
        .from("time_entries")
        .insert([
          {
            employee_id: employeeId,
            tenant_id: tenantId,
            entry_type: "clock_out",
            timestamp: new Date().toISOString(),
          },
        ])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["timeEntries", variables.employeeId] 
      });
    },
  });
}

export function useTodayTimeEntries(employeeId?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = today.toISOString();
  
  return useQuery({
    queryKey: ["todayTimeEntries", employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from("time_entries")
        .select("*")
        .eq("employee_id", employeeId)
        .gte("timestamp", startOfDay)
        .order("timestamp", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
