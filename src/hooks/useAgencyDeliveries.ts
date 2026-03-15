import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface AgencyDelivery {
  id: string;
  tenant_id: string | null;
  briefing_id: string | null;
  title: string;
  type: string;
  status: 'requested' | 'in_production' | 'internal_review' | 'adjustments' | 'approved' | 'rejected';
  deadline: string | null;
  delivered_at: string | null;
  revision_count: number;
  max_revisions: number;
  files: Array<{ name: string; url: string; type?: string }>;
  notes: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgencyApproval {
  id: string;
  delivery_id: string;
  version: number;
  file_url: string;
  file_type: string | null;
  thumbnail_url: string | null;
  status: 'pending' | 'approved' | 'adjustments' | 'rejected';
  feedback: string | null;
  markup_data: Json | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export type DeliveryStatus = AgencyDelivery['status'];

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  requested: 'Solicitado',
  in_production: 'Em Produção',
  internal_review: 'Revisão Interna',
  adjustments: 'Ajustes',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

export const DELIVERY_STATUS_COLORS: Record<DeliveryStatus, string> = {
  requested: 'bg-muted text-muted-foreground',
  in_production: 'bg-blue-500/20 text-blue-400',
  internal_review: 'bg-amber-500/20 text-amber-400',
  adjustments: 'bg-orange-500/20 text-orange-400',
  approved: 'bg-emerald-500/20 text-emerald-400',
  rejected: 'bg-red-500/20 text-red-400',
};

export function useAgencyDeliveries(briefingId?: string) {
  const { tenant, user } = useAuth();
  const tenantId = tenant?.id;
  const queryClient = useQueryClient();

  // Fetch all deliveries
  const { data: deliveries = [], isLoading, error } = useQuery({
    queryKey: ['agency-deliveries', tenantId, briefingId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      let query = supabase
        .from('agency_deliveries')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (briefingId) {
        query = query.eq('briefing_id', briefingId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(d => ({
        ...d,
        files: Array.isArray(d.files) ? d.files : []
      })) as AgencyDelivery[];
    },
    enabled: !!tenantId,
  });

  // Group by status for Kanban
  const deliveriesByStatus = {
    requested: deliveries.filter(d => d.status === 'requested'),
    in_production: deliveries.filter(d => d.status === 'in_production'),
    internal_review: deliveries.filter(d => d.status === 'internal_review'),
    adjustments: deliveries.filter(d => d.status === 'adjustments'),
    approved: deliveries.filter(d => d.status === 'approved'),
    rejected: deliveries.filter(d => d.status === 'rejected'),
  };

  // Stats
  const stats = {
    total: deliveries.length,
    pending: deliveries.filter(d => !['approved', 'rejected'].includes(d.status)).length,
    approved: deliveries.filter(d => d.status === 'approved').length,
    rejected: deliveries.filter(d => d.status === 'rejected').length,
    overdue: deliveries.filter(d => {
      if (!d.deadline) return false;
      return new Date(d.deadline) < new Date() && !['approved', 'rejected'].includes(d.status);
    }).length,
  };

  // Fetch approvals for a delivery
  const useDeliveryApprovals = (deliveryId: string) => {
    return useQuery({
      queryKey: ['agency-approvals', deliveryId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('agency_approvals')
          .select('*')
          .eq('delivery_id', deliveryId)
          .order('version', { ascending: false });

        if (error) throw error;
        return (data || []) as AgencyApproval[];
      },
      enabled: !!deliveryId,
    });
  };

  // Create delivery
  const createDelivery = useMutation({
    mutationFn: async (deliveryData: Omit<Partial<AgencyDelivery>, 'tenant_id'>) => {
      if (!tenantId || !deliveryData.title || !deliveryData.type) {
        throw new Error('Missing required fields');
      }
      const { data, error } = await supabase
        .from('agency_deliveries')
        .insert({
          title: deliveryData.title,
          type: deliveryData.type,
          tenant_id: tenantId,
          briefing_id: deliveryData.briefing_id,
          status: deliveryData.status || 'requested',
          deadline: deliveryData.deadline,
          files: deliveryData.files || [],
          notes: deliveryData.notes,
          assigned_to: deliveryData.assigned_to,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency-deliveries'] });
      toast.success('Entrega criada!');
    },
    onError: (error) => {
      toast.error('Erro ao criar entrega: ' + error.message);
    },
  });

  // Update delivery status
  const updateDeliveryStatus = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: DeliveryStatus; notes?: string }) => {
      const updateData: Record<string, unknown> = { status };
      
      if (status === 'adjustments') {
        // Increment revision count when requesting adjustments
        const delivery = deliveries.find(d => d.id === id);
        if (delivery) {
          updateData.revision_count = delivery.revision_count + 1;
        }
      }
      
      if (notes) {
        updateData.notes = notes;
      }

      if (status === 'approved') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('agency_deliveries')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency-deliveries'] });
      toast.success('Status atualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar status: ' + error.message);
    },
  });

  // Add approval (new version of creative)
  const addApproval = useMutation({
    mutationFn: async (approvalData: { delivery_id: string; file_url: string; file_type?: string; version?: number }) => {
      const { data, error } = await supabase
        .from('agency_approvals')
        .insert({
          delivery_id: approvalData.delivery_id,
          file_url: approvalData.file_url,
          file_type: approvalData.file_type,
          version: approvalData.version || 1,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency-approvals'] });
      toast.success('Versão adicionada!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar versão: ' + error.message);
    },
  });

  // Update approval status
  const updateApprovalStatus = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      feedback,
    }: { 
      id: string; 
      status: AgencyApproval['status']; 
      feedback?: string;
    }) => {
      const updateData: Record<string, unknown> = { status, feedback };
      
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = user?.id;
      }

      const { data, error } = await supabase
        .from('agency_approvals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency-approvals'] });
      toast.success('Aprovação atualizada!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar aprovação: ' + error.message);
    },
  });

  return {
    deliveries,
    isLoading,
    error,
    deliveriesByStatus,
    stats,
    useDeliveryApprovals,
    createDelivery,
    updateDeliveryStatus,
    addApproval,
    updateApprovalStatus,
  };
}
