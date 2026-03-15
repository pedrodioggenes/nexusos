import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type TradeChecklistItem = Tables<'trade_checklist_items'>;
export type TradeChecklistItemInsert = TablesInsert<'trade_checklist_items'>;
export type TradeChecklistItemUpdate = TablesUpdate<'trade_checklist_items'>;

export interface ChecklistItemWithPackage extends TradeChecklistItem {
  package_name?: string;
  supplier_name?: string;
}

export interface PackageWithChecklists {
  id: string;
  name: string;
  supplier_name: string;
  items: TradeChecklistItem[];
}

export function useTradeChecklists() {
  return useQuery({
    queryKey: ['trade-checklist-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trade_checklist_items')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      return data as TradeChecklistItem[];
    },
  });
}

export function useTradeChecklistsGroupedByPackage() {
  return useQuery({
    queryKey: ['trade-checklists-grouped'],
    queryFn: async () => {
      // Get all checklist items with package and supplier info
      const { data: items, error: itemsError } = await supabase
        .from('trade_checklist_items')
        .select(`
          *,
          trade_packages!trade_checklist_items_package_id_fkey (
            id,
            name,
            suppliers!trade_packages_supplier_id_fkey (name)
          )
        `)
        .order('order_index');
      
      if (itemsError) throw itemsError;

      // Group by package
      const packagesMap = new Map<string, PackageWithChecklists>();

      (items || []).forEach(item => {
        const pkg = item.trade_packages as any;
        if (!pkg) return;

        const packageId = pkg.id;
        if (!packagesMap.has(packageId)) {
          packagesMap.set(packageId, {
            id: packageId,
            name: pkg.name,
            supplier_name: pkg.suppliers?.name || 'Desconhecido',
            items: [],
          });
        }

        const { trade_packages, ...cleanItem } = item;
        packagesMap.get(packageId)!.items.push(cleanItem as TradeChecklistItem);
      });

      return Array.from(packagesMap.values());
    },
  });
}

export function useCreateChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TradeChecklistItemInsert) => {
      const { data: result, error } = await supabase
        .from('trade_checklist_items')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-checklist-items'] });
      queryClient.invalidateQueries({ queryKey: ['trade-checklists-grouped'] });
      queryClient.invalidateQueries({ queryKey: ['trade-packages-with-stats'] });
      toast.success('Item de checklist criado');
    },
    onError: (error) => {
      toast.error('Erro ao criar item: ' + error.message);
    },
  });
}

export function useUpdateChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TradeChecklistItemUpdate }) => {
      const { data: result, error } = await supabase
        .from('trade_checklist_items')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-checklist-items'] });
      queryClient.invalidateQueries({ queryKey: ['trade-checklists-grouped'] });
      queryClient.invalidateQueries({ queryKey: ['trade-packages-with-stats'] });
      toast.success('Item atualizado');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar item: ' + error.message);
    },
  });
}

export function useDeleteChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('trade_checklist_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-checklist-items'] });
      queryClient.invalidateQueries({ queryKey: ['trade-checklists-grouped'] });
      queryClient.invalidateQueries({ queryKey: ['trade-packages-with-stats'] });
      toast.success('Item excluído');
    },
    onError: (error) => {
      toast.error('Erro ao excluir item: ' + error.message);
    },
  });
}
