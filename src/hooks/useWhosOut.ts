import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WhosOutEntry {
  id: string;
  employee_id: string;
  employee_name: string;
  initials: string;
  leave_type: string;
  start_date: string;
  end_date: string;
}

export function useWhosOut(tenantId?: string) {
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["whos-out", tenantId, today],
    queryFn: async (): Promise<WhosOutEntry[]> => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("leave_requests")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("status", "approved")
        .lte("start_date", today)
        .gte("end_date", today);

      if (error) throw error;
      if (!data?.length) return [];

      // Enrich with names
      const employeeIds = [...new Set(data.map((r: any) => r.employee_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", employeeIds);

      const nameMap = new Map<string, string>();
      (profiles || []).forEach((p: any) =>
        nameMap.set(p.user_id, p.full_name || p.email?.split("@")[0] || "Usuário")
      );

      return data.map((r: any) => {
        const name = nameMap.get(r.employee_id) || "Colaborador";
        return {
          id: r.id,
          employee_id: r.employee_id,
          employee_name: name,
          initials: name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
          leave_type: r.leave_type || "vacation",
          start_date: r.start_date,
          end_date: r.end_date,
        };
      });
    },
    enabled: !!tenantId,
    staleTime: 5 * 60_000,
  });
}
