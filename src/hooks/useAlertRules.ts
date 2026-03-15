import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

export interface AlertRule {
  id: string;
  tenant_id: string | null;
  rule_key: string;
  name: string;
  description: string | null;
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  evaluation_config: Json;
  action_link: string | null;
  created_at: string;
  updated_at: string;
}

export function useAlertRules() {
  return useQuery({
    queryKey: ['alert-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alert_rules')
        .select('*')
        .order('severity', { ascending: true })
        .order('name');
      if (error) throw error;
      return data as AlertRule[];
    },
  });
}

export function useToggleAlertRule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('alert_rules')
        .update({ enabled })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
      toast({ title: "Regra atualizada" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar regra", variant: "destructive" });
    },
  });
}

export function useCreateAlertRule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (rule: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('alert_rules')
        .insert([rule])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
      toast({ title: "Regra criada" });
    },
    onError: () => {
      toast({ title: "Erro ao criar regra", variant: "destructive" });
    },
  });
}

export function useUpdateAlertRule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AlertRule> & { id: string }) => {
      const { error } = await supabase
        .from('alert_rules')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
      toast({ title: "Regra atualizada" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar regra", variant: "destructive" });
    },
  });
}

export function useDeleteAlertRule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('alert_rules')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
      toast({ title: "Regra removida" });
    },
    onError: () => {
      toast({ title: "Erro ao remover regra", variant: "destructive" });
    },
  });
}
