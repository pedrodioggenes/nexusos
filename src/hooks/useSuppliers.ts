import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type Supplier = Tables<'suppliers'>;
export type SupplierInsert = TablesInsert<'suppliers'>;
export type SupplierUpdate = TablesUpdate<'suppliers'>;

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Supplier[];
    },
  });
}

export function useSuppliersWithStats() {
  return useQuery({
    queryKey: ['suppliers-with-stats'],
    queryFn: async () => {
      // Get suppliers
      const { data: suppliers, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      
      if (suppliersError) throw suppliersError;

      // Get package counts per supplier
      const { data: packages, error: packagesError } = await supabase
        .from('trade_packages')
        .select('supplier_id, status');
      
      if (packagesError) throw packagesError;

      // Get user counts per supplier
      const { data: userSuppliers, error: usersError } = await supabase
        .from('user_suppliers')
        .select('supplier_id');
      
      if (usersError) throw usersError;

      // Map stats to suppliers
      return (suppliers || []).map(supplier => {
        const supplierPackages = (packages || []).filter(p => p.supplier_id === supplier.id);
        const activePackages = supplierPackages.filter(p => p.status === 'active').length;
        const usersCount = (userSuppliers || []).filter(us => us.supplier_id === supplier.id).length;

        return {
          ...supplier,
          packagesActive: activePackages,
          packagesTotal: supplierPackages.length,
          usersCount,
        };
      });
    },
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SupplierInsert) => {
      const { data: result, error } = await supabase
        .from('suppliers')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers-with-stats'] });
      toast.success('Fornecedor criado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar fornecedor: ' + error.message);
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SupplierUpdate }) => {
      const { data: result, error } = await supabase
        .from('suppliers')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers-with-stats'] });
      toast.success('Fornecedor atualizado');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar fornecedor: ' + error.message);
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers-with-stats'] });
      toast.success('Fornecedor excluído');
    },
    onError: (error) => {
      toast.error('Erro ao excluir fornecedor: ' + error.message);
    },
  });
}
