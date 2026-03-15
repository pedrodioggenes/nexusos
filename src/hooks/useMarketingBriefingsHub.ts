import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ============================================================
// TYPES
// ============================================================

export type BriefingStatus = 'draft' | 'review' | 'approved' | 'in_production' | 'executing' | 'completed' | 'cancelled';
export type BriefingPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface MarketingBriefing {
  id: string;
  tenant_id: string;
  title: string;
  objective: string | null;
  target_audience: string | null;
  channels: any;
  stores: any;
  due_date: string | null;
  priority: BriefingPriority;
  status: BriefingStatus;
  context: string | null;
  constraints: string | null;
  reference_urls: any;
  kpi_target: any;
  kpi_baseline: string | null;
  assigned_to: string | null;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketingTemplate {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  type: string;
  category: string | null;
  icon: string;
  definition: any;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateDefinition {
  demands?: TemplateDemand[];
  campaign?: TemplateCampaignDefaults;
  calendar_events?: TemplateCalendarEvent[];
  checklist?: string[];
}

export interface TemplateDemand {
  title: string;
  type: string;
  priority: string;
  days_offset: number; // days before due_date
  description?: string;
}

export interface TemplateCampaignDefaults {
  type?: string;
  priority?: string;
  description?: string;
}

export interface TemplateCalendarEvent {
  title: string;
  type: string;
  days_offset: number;
  color?: string;
}

export interface BriefingLink {
  id: string;
  tenant_id: string;
  briefing_id: string;
  linked_type: 'demand' | 'campaign' | 'plan' | 'document';
  linked_id: string;
  created_at: string;
}

// ============================================================
// STATUS CONFIG
// ============================================================

export const briefingStatusConfig: Record<BriefingStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: "Rascunho", color: "text-muted-foreground", bgColor: "bg-muted" },
  review: { label: "Em Revisão", color: "text-amber-500", bgColor: "bg-amber-500/10" },
  approved: { label: "Aprovado", color: "text-green-500", bgColor: "bg-green-500/10" },
  in_production: { label: "Em Produção", color: "text-blue-500", bgColor: "bg-blue-500/10" },
  executing: { label: "Em Execução", color: "text-purple-500", bgColor: "bg-purple-500/10" },
  completed: { label: "Concluído", color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
  cancelled: { label: "Cancelado", color: "text-destructive", bgColor: "bg-destructive/10" },
};

export const briefingPriorityConfig: Record<BriefingPriority, { label: string; color: string; bgColor: string }> = {
  urgent: { label: "Urgente", color: "text-red-500", bgColor: "bg-red-500/10" },
  high: { label: "Alta", color: "text-orange-500", bgColor: "bg-orange-500/10" },
  medium: { label: "Média", color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  low: { label: "Baixa", color: "text-slate-400", bgColor: "bg-slate-500/10" },
};

export const templateTypeLabels: Record<string, string> = {
  brief: 'Brief',
  campaign: 'Campanha',
  channel: 'Canal',
  objective: 'Objetivo',
};

export const BRIEFING_STATUS_ORDER: BriefingStatus[] = [
  'draft', 'review', 'approved', 'in_production', 'executing', 'completed', 'cancelled'
];

export const CHANNEL_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'tv_interna', label: 'TV Interna' },
  { value: 'encartes', label: 'Encartes' },
  { value: 'email', label: 'E-mail' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'pdv', label: 'PDV' },
  { value: 'outro', label: 'Outro' },
];

export const KPI_OPTIONS = [
  { value: 'reach', label: 'Alcance' },
  { value: 'engagement', label: 'Engajamento' },
  { value: 'conversions', label: 'Conversões' },
  { value: 'traffic', label: 'Tráfego na Loja' },
  { value: 'sales', label: 'Vendas' },
  { value: 'brand', label: 'Branding' },
  { value: 'leads', label: 'Leads' },
  { value: 'other', label: 'Outro' },
];

// ============================================================
// BRIEFING HOOKS
// ============================================================

export function useMarketingBriefings(filters?: { status?: string; search?: string }) {
  const { tenant } = useAuth();

  return useQuery({
    queryKey: ["marketing-briefings", tenant?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from("marketing_briefings")
        .select("*")
        .order("updated_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as MarketingBriefing[];
    },
    enabled: !!tenant?.id,
  });
}

export function useBriefingById(id: string | undefined) {
  return useQuery({
    queryKey: ["marketing-briefing", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("marketing_briefings")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as MarketingBriefing | null;
    },
    enabled: !!id,
  });
}

export function useCreateBriefing() {
  const qc = useQueryClient();
  const { user, tenant } = useAuth();

  return useMutation({
    mutationFn: async (input: Partial<MarketingBriefing>) => {
      if (!tenant?.id || !user?.id) throw new Error("Não autenticado");
      const { data, error } = await supabase
        .from("marketing_briefings")
        .insert({
          title: input.title || 'Novo Briefing',
          tenant_id: tenant.id,
          created_by: user.id,
          objective: input.objective,
          target_audience: input.target_audience,
          channels: input.channels || [],
          stores: input.stores || [],
          due_date: input.due_date,
          priority: input.priority || 'medium',
          status: input.status || 'draft',
          context: input.context,
          constraints: input.constraints,
          reference_urls: input.reference_urls || [],
          kpi_target: input.kpi_target || {},
          kpi_baseline: input.kpi_baseline,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data as MarketingBriefing;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketing-briefings"] });
      toast.success("Briefing criado!");
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
}

export function useUpdateBriefing() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<MarketingBriefing> & { id: string }) => {
      const { data, error } = await supabase
        .from("marketing_briefings")
        .update(input as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as MarketingBriefing;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["marketing-briefings"] });
      qc.invalidateQueries({ queryKey: ["marketing-briefing", data.id] });
      toast.success("Briefing atualizado!");
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
}

export function useDeleteBriefing() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("marketing_briefings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketing-briefings"] });
      toast.success("Briefing excluído!");
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
}

// ============================================================
// BRIEFING LINKS HOOKS
// ============================================================

export function useBriefingLinks(briefingId: string | undefined) {
  return useQuery({
    queryKey: ["briefing-links", briefingId],
    queryFn: async () => {
      if (!briefingId) return [];
      const { data, error } = await supabase
        .from("marketing_briefing_links")
        .select("*")
        .eq("briefing_id", briefingId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as BriefingLink[];
    },
    enabled: !!briefingId,
  });
}

// ============================================================
// TEMPLATE HOOKS
// ============================================================

export function useMarketingTemplatesHub(filters?: { type?: string }) {
  const { tenant } = useAuth();

  return useQuery({
    queryKey: ["marketing-templates-hub", tenant?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from("marketing_templates")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (filters?.type) {
        query = query.eq("type", filters.type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as MarketingTemplate[];
    },
    enabled: !!tenant?.id,
  });
}

export function useTemplateById(id: string | undefined) {
  return useQuery({
    queryKey: ["marketing-template", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("marketing_templates")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as MarketingTemplate | null;
    },
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  const { user, tenant } = useAuth();

  return useMutation({
    mutationFn: async (input: Partial<MarketingTemplate>) => {
      if (!tenant?.id) throw new Error("Não autenticado");
      const { data, error } = await supabase
        .from("marketing_templates")
        .insert({
          name: input.name || 'Novo Template',
          tenant_id: tenant.id,
          created_by: user?.id,
          description: input.description,
          type: input.type || 'brief',
          category: input.category,
          icon: input.icon || '📋',
          definition: input.definition || {},
          is_active: input.is_active ?? true,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data as MarketingTemplate;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketing-templates-hub"] });
      toast.success("Template criado!");
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<MarketingTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from("marketing_templates")
        .update(input as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as MarketingTemplate;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["marketing-templates-hub"] });
      qc.invalidateQueries({ queryKey: ["marketing-template", data.id] });
      toast.success("Template atualizado!");
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("marketing_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketing-templates-hub"] });
      toast.success("Template excluído!");
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
}

// ============================================================
// APPLY TEMPLATE (transactional-ish)
// ============================================================

export function useApplyTemplate() {
  const qc = useQueryClient();
  const { user, tenant } = useAuth();

  return useMutation({
    mutationFn: async ({ briefing, template }: { briefing: MarketingBriefing; template: MarketingTemplate }) => {
      if (!tenant?.id || !user?.id) throw new Error("Não autenticado");

      const def = template.definition;
      const createdLinks: Array<{ type: string; id: string }> = [];
      const errors: string[] = [];
      const dueDate = briefing.due_date ? new Date(briefing.due_date) : new Date();

      // 1) Create campaign if defined
      if (def.campaign) {
        try {
          const { data: campaign, error } = await supabase
            .from("marketing_campaigns")
            .insert({
              tenant_id: tenant.id,
              name: briefing.title,
              description: def.campaign.description || briefing.objective || '',
              type: (def.campaign.type as any) || 'promotional',
              status: 'draft',
              priority: (def.campaign.priority as any) || briefing.priority || 'medium',
              planned_budget: 0,
              approved_budget: 0,
              spent_amount: 0,
              assets: [],
              created_by: user.id,
              briefing: briefing.objective || '',
            })
            .select()
            .single();

          if (error) throw error;
          createdLinks.push({ type: 'campaign', id: campaign.id });
        } catch (e: any) {
          errors.push(`Campanha: ${e.message}`);
        }
      }

      // 2) Create demands
      if (def.demands?.length) {
        for (const demandDef of def.demands) {
          try {
            const demandDueDate = new Date(dueDate);
            demandDueDate.setDate(demandDueDate.getDate() - (demandDef.days_offset || 0));

            const description = [
              demandDef.description || '',
              briefing.context ? `\n\n**Contexto:** ${briefing.context}` : '',
              briefing.constraints ? `\n**Restrições:** ${briefing.constraints}` : '',
            ].join('');

            const { data: demand, error } = await supabase
              .from("marketing_demands")
              .insert({
                tenant_id: tenant.id,
                title: `${demandDef.title} — ${briefing.title}`,
                description,
                type: (demandDef.type as any) || 'general',
                priority: (demandDef.priority as any) || briefing.priority || 'medium',
                status: 'open',
                due_date: demandDueDate.toISOString().split('T')[0],
                created_by: user.id,
                tags: [],
                attachments: [],
                comments_count: 0,
                activity_log: [],
              })
              .select()
              .single();

            if (error) throw error;
            createdLinks.push({ type: 'demand', id: demand.id });
          } catch (e: any) {
            errors.push(`Demanda "${demandDef.title}": ${e.message}`);
          }
        }
      }

      // 3) Create calendar events
      if (def.calendar_events?.length) {
        for (const evt of def.calendar_events) {
          try {
            const evtDate = new Date(dueDate);
            evtDate.setDate(evtDate.getDate() - (evt.days_offset || 0));
            const dateStr = evtDate.toISOString().split('T')[0];

            const { data: plan, error } = await supabase
              .from("marketing_plans")
              .insert({
                tenant_id: tenant.id,
                title: `${evt.title} — ${briefing.title}`,
                type: evt.type || 'task',
                status: 'active',
                start_date: dateStr,
                end_date: dateStr,
                color: evt.color || '#6366f1',
                created_by: user.id,
              })
              .select()
              .single();

            if (error) throw error;
            createdLinks.push({ type: 'plan', id: plan.id });
          } catch (e: any) {
            errors.push(`Evento "${evt.title}": ${e.message}`);
          }
        }
      }

      // 4) Save links
      if (createdLinks.length > 0) {
        const linkRows = createdLinks.map(l => ({
          tenant_id: tenant.id,
          briefing_id: briefing.id,
          linked_type: l.type,
          linked_id: l.id,
        }));

        await supabase.from("marketing_briefing_links").insert(linkRows);
      }

      // 5) Update briefing status to in_production
      await supabase
        .from("marketing_briefings")
        .update({ status: 'in_production' })
        .eq("id", briefing.id);

      return { createdLinks, errors };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["marketing-briefings"] });
      qc.invalidateQueries({ queryKey: ["marketing-demands"] });
      qc.invalidateQueries({ queryKey: ["marketing-campaigns"] });
      qc.invalidateQueries({ queryKey: ["marketing-plans"] });
      qc.invalidateQueries({ queryKey: ["briefing-links"] });

      if (result.errors.length > 0) {
        toast.warning(`Template aplicado com ${result.errors.length} erro(s). ${result.createdLinks.length} itens criados.`);
      } else {
        toast.success(`Template aplicado! ${result.createdLinks.length} itens criados.`);
      }
    },
    onError: (e: Error) => toast.error(`Erro ao aplicar template: ${e.message}`),
  });
}
