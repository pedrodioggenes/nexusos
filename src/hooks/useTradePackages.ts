import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type TradePackage = Tables<'trade_packages'>;
export type TradePackageInsert = TablesInsert<'trade_packages'>;
export type TradePackageUpdate = TablesUpdate<'trade_packages'>;

export interface TradePackageWithStats extends TradePackage {
  supplier_name?: string;
  totalItems: number;
  completedItems: number;
}

export function useTradePackages() {
  return useQuery({
    queryKey: ['trade-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trade_packages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TradePackage[];
    },
  });
}

export function useTradePackagesWithStats() {
  return useQuery({
    queryKey: ['trade-packages-with-stats'],
    queryFn: async () => {
      // Get packages with supplier info
      const { data: packages, error: packagesError } = await supabase
        .from('trade_packages')
        .select(`
          *,
          suppliers!trade_packages_supplier_id_fkey (name)
        `)
        .order('created_at', { ascending: false });
      
      if (packagesError) throw packagesError;

      // Get checklist items for progress calculation
      const { data: checklistItems, error: checklistError } = await supabase
        .from('trade_checklist_items')
        .select('package_id, status');
      
      if (checklistError) throw checklistError;

      // Map stats to packages
      return (packages || []).map(pkg => {
        const packageItems = (checklistItems || []).filter(item => item.package_id === pkg.id);
        const completedItems = packageItems.filter(item => 
          item.status === 'approved' || item.status === 'completed'
        ).length;

        return {
          ...pkg,
          supplier_name: (pkg.suppliers as any)?.name || 'Desconhecido',
          totalItems: packageItems.length,
          completedItems,
        } as TradePackageWithStats;
      });
    },
  });
}

export function useCreateTradePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TradePackageInsert) => {
      const { data: result, error } = await supabase
        .from('trade_packages')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-packages'] });
      queryClient.invalidateQueries({ queryKey: ['trade-packages-with-stats'] });
      toast.success('Pacote criado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar pacote: ' + error.message);
    },
  });
}

export function useUpdateTradePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TradePackageUpdate }) => {
      const { data: result, error } = await supabase
        .from('trade_packages')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-packages'] });
      queryClient.invalidateQueries({ queryKey: ['trade-packages-with-stats'] });
      toast.success('Pacote atualizado');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar pacote: ' + error.message);
    },
  });
}

export function useDeleteTradePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('trade_packages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-packages'] });
      queryClient.invalidateQueries({ queryKey: ['trade-packages-with-stats'] });
      toast.success('Pacote excluído');
    },
    onError: (error) => {
      toast.error('Erro ao excluir pacote: ' + error.message);
    },
  });
}
