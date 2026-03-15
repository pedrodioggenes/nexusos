import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const EXECUTION_STATUSES = [
  { value: 'not_started', label: 'Não Iniciada', color: 'bg-muted text-muted-foreground' },
  { value: 'in_progress', label: 'Em Andamento', color: 'bg-amber-500/10 text-amber-500' },
  { value: 'completed', label: 'Concluída', color: 'bg-green-600/10 text-green-600' },
  { value: 'blocked', label: 'Bloqueada', color: 'bg-destructive/10 text-destructive' },
] as const;

export const ITEM_CATEGORIES = [
  { value: 'precificacao', label: 'Precificação' },
  { value: 'gondola', label: 'Gôndola' },
  { value: 'ponta', label: 'Ponta de Gôndola' },
  { value: 'degustacao', label: 'Degustação' },
  { value: 'tv', label: 'TV Interna' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'encarte', label: 'Encarte' },
  { value: 'promotor', label: 'Promotor' },
  { value: 'outro', label: 'Outro' },
] as const;

export const ITEM_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendente', color: 'bg-muted text-muted-foreground' },
  { value: 'ok', label: 'OK', color: 'bg-green-600/10 text-green-600' },
  { value: 'not_ok', label: 'Não OK', color: 'bg-destructive/10 text-destructive' },
  { value: 'na', label: 'N/A', color: 'bg-muted text-muted-foreground/60' },
] as const;

export const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Baixa', color: 'bg-blue-500/10 text-blue-500' },
  { value: 'medium', label: 'Média', color: 'bg-amber-500/10 text-amber-500' },
  { value: 'high', label: 'Alta', color: 'bg-orange-500/10 text-orange-500' },
  { value: 'critical', label: 'Crítica', color: 'bg-destructive/10 text-destructive' },
] as const;

export const ISSUE_TYPES = [
  { value: 'falta_material', label: 'Falta de Material' },
  { value: 'preco_errado', label: 'Preço Errado' },
  { value: 'exposicao_errada', label: 'Exposição Errada' },
  { value: 'sem_produto', label: 'Sem Produto' },
  { value: 'sem_promotor', label: 'Sem Promotor' },
  { value: 'outro', label: 'Outro' },
] as const;

export interface ExecutionRun {
  id: string;
  tenant_id: string;
  retail_action_id: string;
  store_id: string;
  status: string;
  compliance_score: number;
  issues_count: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExecutionItem {
  id: string;
  tenant_id: string;
  execution_run_id: string;
  item_key: string;
  title: string;
  category: string;
  required: boolean;
  status: string;
  notes: string | null;
  evidence_urls: any;
  updated_at: string;
}

export interface ExecutionIssue {
  id: string;
  tenant_id: string;
  execution_run_id: string;
  severity: string;
  issue_type: string;
  description: string;
  evidence_urls: any;
  resolved: boolean;
  created_at: string;
}

// Default checklist template for a retail action
const DEFAULT_CHECKLIST: { title: string; category: string; required: boolean }[] = [
  { title: 'Preços atualizados no sistema', category: 'precificacao', required: true },
  { title: 'Etiquetas de preço na gôndola', category: 'precificacao', required: true },
  { title: 'Produto abastecido na gôndola', category: 'gondola', required: true },
  { title: 'Ponta de gôndola montada', category: 'ponta', required: false },
  { title: 'Material de comunicação instalado', category: 'encarte', required: true },
  { title: 'Degustação preparada', category: 'degustacao', required: false },
  { title: 'TV interna com conteúdo atualizado', category: 'tv', required: false },
  { title: 'WhatsApp disparado para clientes', category: 'whatsapp', required: false },
  { title: 'Promotor presente na loja', category: 'promotor', required: false },
];

export function useExecutionRuns(retailActionId?: string) {
  const { tenant } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = tenant?.id;

  const runsQuery = useQuery({
    queryKey: ['execution-runs', tenantId, retailActionId],
    queryFn: async () => {
      if (!tenantId) return [];
      let query = supabase.from('retail_execution_runs').select('*').eq('tenant_id', tenantId);
      if (retailActionId) query = query.eq('retail_action_id', retailActionId);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as ExecutionRun[];
    },
    enabled: !!tenantId,
  });

  const createRun = useMutation({
    mutationFn: async ({ retailActionId, storeId }: { retailActionId: string; storeId: string }) => {
      if (!tenantId) throw new Error('No tenant');
      // Create the run
      const { data: run, error } = await supabase
        .from('retail_execution_runs')
        .insert({ tenant_id: tenantId, retail_action_id: retailActionId, store_id: storeId })
        .select()
        .single();
      if (error) throw error;

      // Seed default checklist items
      const items = DEFAULT_CHECKLIST.map((item, idx) => ({
        tenant_id: tenantId,
        execution_run_id: run.id,
        item_key: `item_${idx}`,
        title: item.title,
        category: item.category,
        required: item.required,
      }));
      const { error: itemsError } = await supabase.from('retail_execution_items').insert(items);
      if (itemsError) console.error('Error seeding items:', itemsError);

      return run;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['execution-runs'] });
      toast.success('Execução criada com checklist padrão');
    },
    onError: (e: any) => {
      if (e?.code === '23505') toast.error('Execução já existe para esta loja');
      else toast.error('Erro ao criar execução');
    },
  });

  const updateRun = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ExecutionRun> & { id: string }) => {
      const { data, error } = await supabase
        .from('retail_execution_runs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['execution-runs'] }),
  });

  return { ...runsQuery, runs: runsQuery.data || [], createRun, updateRun };
}

export function useExecutionItems(runId: string | null) {
  const queryClient = useQueryClient();

  const itemsQuery = useQuery({
    queryKey: ['execution-items', runId],
    queryFn: async () => {
      if (!runId) return [];
      const { data, error } = await supabase
        .from('retail_execution_items')
        .select('*')
        .eq('execution_run_id', runId)
        .order('category', { ascending: true });
      if (error) throw error;
      return data as ExecutionItem[];
    },
    enabled: !!runId,
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ExecutionItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('retail_execution_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['execution-items', runId] }),
  });

  const addItem = useMutation({
    mutationFn: async (item: Omit<ExecutionItem, 'id' | 'updated_at'>) => {
      const { data, error } = await supabase.from('retail_execution_items').insert(item).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['execution-items', runId] }),
  });

  return { ...itemsQuery, items: itemsQuery.data || [], updateItem, addItem };
}

export function useExecutionIssues(runId: string | null) {
  const queryClient = useQueryClient();

  const issuesQuery = useQuery({
    queryKey: ['execution-issues', runId],
    queryFn: async () => {
      if (!runId) return [];
      const { data, error } = await supabase
        .from('retail_execution_issues')
        .select('*')
        .eq('execution_run_id', runId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ExecutionIssue[];
    },
    enabled: !!runId,
  });

  const createIssue = useMutation({
    mutationFn: async (issue: Omit<ExecutionIssue, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('retail_execution_issues').insert(issue).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['execution-issues', runId] });
      toast.success('Issue registrada');
    },
    onError: () => toast.error('Erro ao registrar issue'),
  });

  const updateIssue = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ExecutionIssue> & { id: string }) => {
      const { data, error } = await supabase
        .from('retail_execution_issues')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['execution-issues', runId] }),
  });

  return { ...issuesQuery, issues: issuesQuery.data || [], createIssue, updateIssue };
}

export function useRecalculateCompliance(runId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!runId) return;
      // Fetch items
      const { data: items } = await supabase
        .from('retail_execution_items')
        .select('status, required')
        .eq('execution_run_id', runId);
      const { data: issues } = await supabase
        .from('retail_execution_issues')
        .select('id, resolved')
        .eq('execution_run_id', runId);

      const total = items?.filter(i => i.status !== 'na').length || 0;
      const ok = items?.filter(i => i.status === 'ok').length || 0;
      const score = total > 0 ? Math.round((ok / total) * 100) : 0;
      const issuesCount = issues?.filter(i => !i.resolved).length || 0;

      await supabase
        .from('retail_execution_runs')
        .update({ compliance_score: score, issues_count: issuesCount })
        .eq('id', runId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['execution-runs'] }),
  });
}
