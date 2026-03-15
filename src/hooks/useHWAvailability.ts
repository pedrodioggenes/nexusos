import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type AvailabilityStatus = 'disponivel' | 'nao_perturbe';

export const AVAILABILITY_CONFIG: Record<AvailabilityStatus, { label: string; color: string; bg: string }> = {
  disponivel: { label: 'Disponível', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.15)' },
  nao_perturbe: { label: 'Não Perturbe', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' },
};

export function useHWAvailability() {
  const { user, tenant } = useAuth();
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: ['hw-availability', user?.id] as const,
    queryFn: async () => {
      if (!user?.id || !tenant?.id) return 'disponivel';
      const { data } = await (supabase.from('hw_team_members') as any)
        .select('availability_status')
        .eq('user_id', user.id)
        .eq('tenant_id', tenant.id)
        .maybeSingle();
      const raw = (data?.availability_status as string) || 'disponivel';
      // Normalize legacy statuses to 'disponivel'
      if (raw !== 'nao_perturbe') return 'disponivel';
      return raw;
    },
    enabled: !!user?.id && !!tenant?.id,
    staleTime: 60_000,
  });

  const status = (queryResult.data || 'disponivel') as AvailabilityStatus;
  const isLoading = queryResult.isLoading;

  const updateStatus = useMutation({
    mutationFn: async (newStatus: AvailabilityStatus) => {
      if (!user?.id || !tenant?.id) throw new Error('Not authenticated');
      const { error } = await (supabase.from('hw_team_members') as any)
        .update({ availability_status: newStatus })
        .eq('user_id', user.id)
        .eq('tenant_id', tenant.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hw-availability', user?.id] });
    },
  });

  const isDoNotDisturb = status === 'nao_perturbe';

  return { status, isLoading, updateStatus, isDoNotDisturb };
}
