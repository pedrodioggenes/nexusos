import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BirthdayMember {
  userId: string;
  name: string;
  birthDate: string;
  daysUntil: number;
  isToday: boolean;
}

export function useHWBirthdays(tenantId?: string) {
  return useQuery({
    queryKey: ["hw-birthdays", tenantId],
    queryFn: async (): Promise<BirthdayMember[]> => {
      if (!tenantId) return [];
      
      // Get team member user IDs
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("tenant_id", tenantId);
      
      if (!roles?.length) return [];
      const userIds = roles.map(r => r.user_id);
      
      // Get profiles with birth_date
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, birth_date")
        .in("user_id", userIds)
        .not("birth_date", "is", null);
      
      if (!profiles?.length) return [];
      
      const today = new Date();
      const todayMD = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      return profiles
        .map((p: any) => {
          const bd = new Date(p.birth_date + 'T00:00:00');
          const bdMD = `${String(bd.getMonth() + 1).padStart(2, '0')}-${String(bd.getDate()).padStart(2, '0')}`;
          const isToday = bdMD === todayMD;
          
          // Calculate days until next birthday
          const nextBd = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
          if (nextBd < today && !isToday) nextBd.setFullYear(nextBd.getFullYear() + 1);
          const daysUntil = Math.ceil((nextBd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            userId: p.user_id,
            name: p.full_name || p.email?.split("@")[0] || "Membro",
            birthDate: p.birth_date,
            daysUntil: isToday ? 0 : daysUntil,
            isToday,
          };
        })
        .filter(b => b.daysUntil <= 30)
        .sort((a, b) => a.daysUntil - b.daysUntil);
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
  });
}
