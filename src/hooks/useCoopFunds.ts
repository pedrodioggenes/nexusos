import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CoopFund {
  id: string;
  tenant_id: string | null;
  supplier_id: string;
  year: number;
  quarter: number | null;
  negotiated_amount: number;
  executed_amount: number;
  proven_amount: number;
  pending_proof_amount: number;
  utilization_rate: number;
  status: 'negotiating' | 'active' | 'closed' | 'cancelled';
  contract_reference: string | null;
  notes: string | null;
  negotiated_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  supplier?: {
    id: string;
    name: string;
    cnpj: string | null;
    contact_email: string | null;
  };
}

export function useCoopFunds(year?: number) {
  const currentYear = new Date().getFullYear();
  
  return useQuery({
    queryKey: ['coop-funds', year || currentYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_coop_funds')
        .select(`
          *,
          supplier:suppliers(id, name, cnpj, contact_email)
        `)
        .eq('year', year || currentYear)
        .order('negotiated_amount', { ascending: false });

      if (error) throw error;
      return data as CoopFund[];
    },
  });
}

export function useCoopFundsBySupplier(supplierId: string) {
  return useQuery({
    queryKey: ['coop-funds-supplier', supplierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_coop_funds')
        .select(`
          *,
          supplier:suppliers(id, name, cnpj, contact_email)
        `)
        .eq('supplier_id', supplierId)
        .order('year', { ascending: false });

      if (error) throw error;
      return data as CoopFund[];
    },
    enabled: !!supplierId,
  });
}

export function useCoopFundsStats(year?: number) {
  const currentYear = new Date().getFullYear();

  return useQuery({
    queryKey: ['coop-funds-stats', year || currentYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_coop_funds')
        .select('negotiated_amount, executed_amount, proven_amount, status')
        .eq('year', year || currentYear);

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          totalNegotiated: 0,
          totalExecuted: 0,
          totalProven: 0,
          pendingProof: 0,
          utilizationRate: 0,
          activeCount: 0,
          negotiatingCount: 0,
        };
      }

      const totalNegotiated = data.reduce((sum, f) => sum + (f.negotiated_amount || 0), 0);
      const totalExecuted = data.reduce((sum, f) => sum + (f.executed_amount || 0), 0);
      const totalProven = data.reduce((sum, f) => sum + (f.proven_amount || 0), 0);
      const activeCount = data.filter(f => f.status === 'active').length;
      const negotiatingCount = data.filter(f => f.status === 'negotiating').length;

      return {
        totalNegotiated,
        totalExecuted,
        totalProven,
        pendingProof: totalExecuted - totalProven,
        utilizationRate: totalNegotiated > 0 ? (totalExecuted / totalNegotiated) * 100 : 0,
        activeCount,
        negotiatingCount,
      };
    },
  });
}

export function useCreateCoopFund() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (fund: Omit<CoopFund, 'id' | 'created_at' | 'updated_at' | 'pending_proof_amount' | 'utilization_rate' | 'supplier'>) => {
      const { data, error } = await supabase
        .from('marketing_coop_funds')
        .insert(fund)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coop-funds'] });
      toast({
        title: "Verba criada",
        description: "A verba cooperada foi registrada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível registrar a verba",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCoopFund() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CoopFund> & { id: string }) => {
      const { data, error } = await supabase
        .from('marketing_coop_funds')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coop-funds'] });
      toast({
        title: "Verba atualizada",
        description: "A verba cooperada foi atualizada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a verba",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCoopFund() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (fundId: string) => {
      const { error } = await supabase
        .from('marketing_coop_funds')
        .delete()
        .eq('id', fundId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coop-funds'] });
      toast({
        title: "Verba excluída",
        description: "A verba cooperada foi excluída com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a verba",
        variant: "destructive",
      });
    },
  });
}

// Top suppliers by ROI (calculated from coop funds + packages)
export function useTopSuppliersByROI(limit: number = 5) {
  return useQuery({
    queryKey: ['top-suppliers-roi', limit],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      
      const { data, error } = await supabase
        .from('marketing_coop_funds')
        .select(`
          *,
          supplier:suppliers(id, name)
        `)
        .eq('year', currentYear)
        .eq('status', 'active')
        .gt('executed_amount', 0)
        .order('executed_amount', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      // Estimate ROI from proven vs negotiated amounts (proxy until sales data is connected)
      return (data as CoopFund[]).map((fund) => {
        const proven = fund.proven_amount || 0;
        const negotiated = fund.negotiated_amount || 1;
        const utilizationBonus = (fund.utilization_rate || 0) * 2;
        const calculatedRoi = negotiated > 0 ? (proven / negotiated) * 100 + utilizationBonus : 0;
        return { ...fund, calculatedRoi };
      });
    },
  });
}
