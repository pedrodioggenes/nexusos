import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AgencyPartner {
  id: string;
  tenant_id: string | null;
  name: string;
  cnpj: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  monthly_fee: number;
  contract_start: string | null;
  contract_end: string | null;
  status: 'active' | 'paused' | 'ended';
  notes: string | null;
  logo_url: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgencyScore {
  id: string;
  agency_id: string;
  tenant_id: string | null;
  period: string;
  communication_score: number | null;
  quality_score: number | null;
  punctuality_score: number | null;
  strategy_score: number | null;
  cost_benefit_score: number | null;
  overall_score: number | null;
  notes: string | null;
  evaluated_by: string | null;
  created_at: string;
}

export interface AgencySLAMetrics {
  id: string;
  agency_id: string;
  tenant_id: string | null;
  period: string;
  response_time_avg_hours: number | null;
  response_time_target_hours: number;
  on_time_delivery_rate: number | null;
  on_time_target_rate: number;
  avg_revision_rounds: number | null;
  max_revision_target: number;
  deliveries_count: number;
  deliveries_approved: number;
  deliveries_rejected: number;
  created_at: string;
  updated_at: string;
}

export interface AgencyInvoice {
  id: string;
  agency_id: string;
  tenant_id: string | null;
  invoice_number: string | null;
  reference_month: string;
  base_fee: number;
  extras: Array<{ description: string; amount: number }>;
  total_amount: number;
  status: 'pending' | 'approved' | 'paid' | 'disputed';
  due_date: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgencyCommunication {
  id: string;
  agency_id: string;
  tenant_id: string | null;
  type: 'meeting' | 'call' | 'email' | 'decision' | 'escalation' | 'scope_change' | 'note';
  title: string;
  content: string | null;
  attachments: Array<{ name: string; url: string }>;
  participants: string[];
  meeting_date: string | null;
  created_by: string | null;
  created_at: string;
}

export function useAgencyPartner() {
  const { tenant, user } = useAuth();
  const tenantId = tenant?.id;
  const queryClient = useQueryClient();

  // Fetch current agency partner
  const { data: agency, isLoading, error } = useQuery({
    queryKey: ['agency-partner', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      
      const { data, error } = await supabase
        .from('agency_partners')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data as AgencyPartner | null;
    },
    enabled: !!tenantId,
  });

  // Fetch agency scores
  const { data: scores = [] } = useQuery({
    queryKey: ['agency-scores', agency?.id],
    queryFn: async () => {
      if (!agency?.id) return [];
      
      const { data, error } = await supabase
        .from('agency_scores')
        .select('*')
        .eq('agency_id', agency.id)
        .order('period', { ascending: false })
        .limit(12);

      if (error) throw error;
      return data as AgencyScore[];
    },
    enabled: !!agency?.id,
  });

  // Fetch latest SLA metrics
  const { data: slaMetrics } = useQuery({
    queryKey: ['agency-sla-metrics', agency?.id],
    queryFn: async () => {
      if (!agency?.id) return null;
      
      const { data, error } = await supabase
        .from('agency_sla_metrics')
        .select('*')
        .eq('agency_id', agency.id)
        .order('period', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as AgencySLAMetrics | null;
    },
    enabled: !!agency?.id,
  });

  // Fetch invoices
  const { data: invoices = [] } = useQuery({
    queryKey: ['agency-invoices', agency?.id],
    queryFn: async () => {
      if (!agency?.id) return [];
      
      const { data, error } = await supabase
        .from('agency_invoices')
        .select('*')
        .eq('agency_id', agency.id)
        .order('reference_month', { ascending: false })
        .limit(12);

      if (error) throw error;
      return (data || []).map(inv => ({
        ...inv,
        extras: Array.isArray(inv.extras) ? inv.extras : []
      })) as AgencyInvoice[];
    },
    enabled: !!agency?.id,
  });

  // Fetch communications
  const { data: communications = [] } = useQuery({
    queryKey: ['agency-communications', agency?.id],
    queryFn: async () => {
      if (!agency?.id) return [];
      
      const { data, error } = await supabase
        .from('agency_communications')
        .select('*')
        .eq('agency_id', agency.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []).map(comm => ({
        ...comm,
        attachments: Array.isArray(comm.attachments) ? comm.attachments : [],
        participants: Array.isArray(comm.participants) ? comm.participants : []
      })) as AgencyCommunication[];
    },
    enabled: !!agency?.id,
  });

  // Create agency partner
  const createAgency = useMutation({
    mutationFn: async (agencyData: Omit<Partial<AgencyPartner>, 'tenant_id'>) => {
      if (!tenantId) throw new Error('Tenant not found');
      const { data, error } = await supabase
        .from('agency_partners')
        .insert({ 
          name: agencyData.name || 'Nova Agência',
          tenant_id: tenantId,
          cnpj: agencyData.cnpj,
          contact_name: agencyData.contact_name,
          contact_email: agencyData.contact_email,
          contact_phone: agencyData.contact_phone,
          monthly_fee: agencyData.monthly_fee,
          contract_start: agencyData.contract_start,
          contract_end: agencyData.contract_end,
          status: agencyData.status || 'active',
          notes: agencyData.notes,
          logo_url: agencyData.logo_url,
          website: agencyData.website,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency-partner'] });
      toast.success('Agência cadastrada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao cadastrar agência: ' + error.message);
    },
  });

  // Update agency partner
  const updateAgency = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AgencyPartner> & { id: string }) => {
      const { data, error } = await supabase
        .from('agency_partners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency-partner'] });
      toast.success('Agência atualizada!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar agência: ' + error.message);
    },
  });

  // Add score
  const addScore = useMutation({
    mutationFn: async (scoreData: Omit<Partial<AgencyScore>, 'tenant_id' | 'evaluated_by'>) => {
      if (!tenantId || !scoreData.agency_id || !scoreData.period) {
        throw new Error('Missing required fields');
      }
      const { data, error } = await supabase
        .from('agency_scores')
        .insert({
          agency_id: scoreData.agency_id,
          period: scoreData.period,
          tenant_id: tenantId,
          communication_score: scoreData.communication_score,
          quality_score: scoreData.quality_score,
          punctuality_score: scoreData.punctuality_score,
          strategy_score: scoreData.strategy_score,
          cost_benefit_score: scoreData.cost_benefit_score,
          notes: scoreData.notes,
          evaluated_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency-scores'] });
      toast.success('Avaliação registrada!');
    },
    onError: (error) => {
      toast.error('Erro ao registrar avaliação: ' + error.message);
    },
  });

  // Add communication
  const addCommunication = useMutation({
    mutationFn: async (commData: Omit<Partial<AgencyCommunication>, 'tenant_id' | 'created_by'>) => {
      if (!tenantId || !commData.agency_id || !commData.title || !commData.type) {
        throw new Error('Missing required fields');
      }
      const { data, error } = await supabase
        .from('agency_communications')
        .insert({
          agency_id: commData.agency_id,
          type: commData.type,
          title: commData.title,
          tenant_id: tenantId,
          content: commData.content,
          attachments: commData.attachments || [],
          participants: commData.participants || [],
          meeting_date: commData.meeting_date,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency-communications'] });
      toast.success('Comunicação registrada!');
    },
    onError: (error) => {
      toast.error('Erro ao registrar comunicação: ' + error.message);
    },
  });

  // Calculate average score from latest
  const latestScore = scores[0];
  const averageScore = latestScore?.overall_score ?? null;

  return {
    agency,
    isLoading,
    error,
    scores,
    latestScore,
    averageScore,
    slaMetrics,
    invoices,
    communications,
    createAgency,
    updateAgency,
    addScore,
    addCommunication,
  };
}
