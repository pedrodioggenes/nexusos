import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Unit {
  id: string;
  name: string;
  city: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUnitData {
  name: string;
  city: string;
  is_active?: boolean;
}

export function useUnits() {
  return useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Unit[];
    },
  });
}

export function useActiveUnits() {
  return useQuery({
    queryKey: ['units', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Unit[];
    },
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUnitData) => {
      const { data: result, error } = await supabase
        .from('units')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast.success('Unidade criada com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar unidade: ' + error.message);
    },
  });
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<CreateUnitData>) => {
      const { data: result, error } = await supabase
        .from('units')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast.success('Unidade atualizada com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar unidade: ' + error.message);
    },
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast.success('Unidade excluída com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir unidade: ' + error.message);
    },
  });
}
