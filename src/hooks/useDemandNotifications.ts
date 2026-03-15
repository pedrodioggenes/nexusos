/**
 * Hook for demand-specific notifications with acknowledge action.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications, Notification } from './useNotifications';
import { toast } from 'sonner';

export function useDemandNotifications() {
  const { notifications, markAsRead, refetch } = useNotifications();
  const queryClient = useQueryClient();

  // Filter demand notifications
  const demandNotifications = notifications.filter(
    (n) => n.type === 'demand' || n.resource_type === 'marketing_demands'
  );

  const unreadDemandCount = demandNotifications.filter((n) => !n.read).length;

  // Acknowledge demand receipt
  const acknowledgeMutation = useMutation({
    mutationFn: async (demandId: string) => {
      const { data, error } = await supabase.rpc('rpc_acknowledge_demand', {
        p_demand_id: demandId,
      });
      if (error) throw error;
      const result = data as { success: boolean; error?: string };
      if (!result.success) throw new Error(result.error || 'Erro ao acusar recebimento');
      return result;
    },
    onSuccess: (_, demandId) => {
      toast.success('Recebimento confirmado! Demanda movida para "Fazendo".');
      // Mark related notification as read
      const relatedNotification = demandNotifications.find(
        (n) => n.resource_id === demandId && !n.read
      );
      if (relatedNotification) {
        markAsRead(relatedNotification.id);
      }
      // Invalidate demands queries
      queryClient.invalidateQueries({ queryKey: ['marketing-demands'] });
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao acusar recebimento');
    },
  });

  return {
    demandNotifications,
    unreadDemandCount,
    acknowledgeDemand: acknowledgeMutation.mutate,
    isAcknowledging: acknowledgeMutation.isPending,
  };
}
