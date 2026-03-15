import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { resolveEventColor } from '@/components/marketing/calendar/calendarUtils';
import {
  Calendar,
  ClipboardList,
  ShoppingCart,
  Megaphone,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export type CalendarEventSource =
  | 'marketing_plan'
  | 'demand'
  | 'retail_action'
  | 'campaign'
  | 'briefing'
  | 'execution';

export interface CalendarEvent {
  id: string;
  source: CalendarEventSource;
  title: string;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
  color: string;
  status: string;
  type: string;
  sourceLabel: string;
  sourceIcon: React.ElementType;
  originalData: any;
  // Keep compat fields for existing components
  budget?: number | null;
  responsible?: string | null;
  priority?: string | null;
}

const SOURCE_DEFAULTS: Record<CalendarEventSource, { color: string; label: string; icon: React.ElementType }> = {
  marketing_plan: { color: '#8B5CF6', label: 'Plano de Marketing', icon: Calendar },
  demand: { color: '#3B82F6', label: 'Demanda', icon: ClipboardList },
  retail_action: { color: '#10B981', label: 'Ação Comercial', icon: ShoppingCart },
  campaign: { color: '#F59E0B', label: 'Campanha', icon: Megaphone },
  briefing: { color: '#EC4899', label: 'Briefing', icon: FileText },
  execution: { color: '#06B6D4', label: 'Execução', icon: CheckCircle2 },
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#3B82F6',
};

export const CAMPAIGN_TYPE_COLORS: Record<string, string> = {
  seasonal: '#F97316',    // orange
  promotional: '#22C55E', // green
  institutional: '#3B82F6', // blue
  trade: '#8B5CF6',       // purple
  digital: '#06B6D4',     // cyan
  event: '#EC4899',       // pink
};

export const CAMPAIGN_TYPE_LABELS: Record<string, string> = {
  seasonal: 'Sazonal',
  promotional: 'Promocional',
  institutional: 'Institucional',
  trade: 'Trade Marketing',
  digital: 'Digital',
  event: 'Evento',
};

export function useUnifiedCalendarEvents() {
  return useQuery({
    queryKey: ['unified-calendar-events'],
    queryFn: async () => {
      const [plans, demands, retailActions, campaigns, briefings, executions, profiles] = await Promise.all([
        supabase.from('marketing_plans').select('*').order('start_date', { ascending: true }),
        supabase.from('marketing_demands').select('id, title, description, due_date, status, type, priority, assigned_to, created_at, updated_at'),
        supabase.from('retail_actions').select('id, title, type, status, period_start, period_end, mechanics, notes, created_at, updated_at'),
        supabase.from('marketing_campaigns').select('id, name, description, start_date, end_date, status, type, planned_budget, priority, created_at, updated_at'),
        supabase.from('marketing_briefings').select('id, title, objective, due_date, status, priority, assigned_to, created_at, updated_at'),
        supabase.from('marketing_executions').select('id, entity_type, entity_id, channel, execution_date, notes, link_url, created_at'),
        supabase.from('profiles').select('user_id, full_name, email'),
      ]);

      // Build name lookup map
      const nameMap = new Map<string, string>();
      (profiles.data || []).forEach((p) => {
        const name = p.full_name || p.email?.split('@')[0] || p.user_id;
        nameMap.set(p.user_id, name);
      });

      const resolveName = (userId: string | null | undefined): string | null => {
        if (!userId) return null;
        return nameMap.get(userId) || null;
      };

      const events: CalendarEvent[] = [];

      // Marketing Plans
      (plans.data || []).forEach((p) => {
        if (!p.start_date) return;
        events.push({
          id: p.id,
          source: 'marketing_plan',
          title: p.title,
          description: p.description,
          start_date: p.start_date,
          end_date: p.end_date,
          color: resolveEventColor(p.color) || SOURCE_DEFAULTS.marketing_plan.color,
          status: p.status,
          type: p.type,
          sourceLabel: SOURCE_DEFAULTS.marketing_plan.label,
          sourceIcon: SOURCE_DEFAULTS.marketing_plan.icon,
          originalData: p,
          budget: p.budget,
          responsible: resolveName(p.responsible) || p.responsible,
        });
      });

      // Demands — always use source blue, priority shown as badge only
      (demands.data || []).forEach((d) => {
        if (!d.due_date) return;
        events.push({
          id: d.id,
          source: 'demand',
          title: d.title,
          description: d.description,
          start_date: d.due_date,
          end_date: null,
          color: SOURCE_DEFAULTS.demand.color,
          status: d.status,
          type: d.type,
          sourceLabel: SOURCE_DEFAULTS.demand.label,
          sourceIcon: SOURCE_DEFAULTS.demand.icon,
          originalData: d,
          responsible: resolveName(d.assigned_to),
          priority: d.priority,
        });
      });

      // Retail Actions
      (retailActions.data || []).forEach((r) => {
        if (!r.period_start) return;
        events.push({
          id: r.id,
          source: 'retail_action',
          title: r.title,
          description: r.notes,
          start_date: r.period_start,
          end_date: r.period_end,
          color: SOURCE_DEFAULTS.retail_action.color,
          status: r.status,
          type: r.type,
          sourceLabel: SOURCE_DEFAULTS.retail_action.label,
          sourceIcon: SOURCE_DEFAULTS.retail_action.icon,
          originalData: r,
        });
      });

      // Campaigns
      (campaigns.data || []).forEach((c) => {
        if (!c.start_date) return;
        const typeColor = CAMPAIGN_TYPE_COLORS[c.type];
        events.push({
          id: c.id,
          source: 'campaign',
          title: c.name,
          description: c.description,
          start_date: c.start_date,
          end_date: c.end_date,
          color: typeColor || SOURCE_DEFAULTS.campaign.color,
          status: c.status || 'planned',
          type: c.type,
          sourceLabel: SOURCE_DEFAULTS.campaign.label,
          sourceIcon: SOURCE_DEFAULTS.campaign.icon,
          originalData: c,
          budget: c.planned_budget,
          priority: c.priority,
        });
      });

      // Briefings
      (briefings.data || []).forEach((b) => {
        if (!b.due_date) return;
        events.push({
          id: b.id,
          source: 'briefing',
          title: b.title,
          description: b.objective,
          start_date: b.due_date,
          end_date: null,
          color: SOURCE_DEFAULTS.briefing.color,
          status: b.status,
          type: 'briefing',
          sourceLabel: SOURCE_DEFAULTS.briefing.label,
          sourceIcon: SOURCE_DEFAULTS.briefing.icon,
          originalData: b,
          responsible: resolveName(b.assigned_to),
          priority: b.priority,
        });
      });

      // Executions
      (executions.data || []).forEach((e) => {
        events.push({
          id: e.id,
          source: 'execution',
          title: `${e.channel} – ${e.entity_type}`,
          description: e.notes,
          start_date: e.execution_date,
          end_date: null,
          color: SOURCE_DEFAULTS.execution.color,
          status: 'completed',
          type: 'execution',
          sourceLabel: SOURCE_DEFAULTS.execution.label,
          sourceIcon: SOURCE_DEFAULTS.execution.icon,
          originalData: e,
        });
      });

      return events;
    },
  });
}

export const SOURCE_FILTER_OPTIONS = Object.entries(SOURCE_DEFAULTS).map(([key, val]) => ({
  value: key as CalendarEventSource,
  label: val.label,
  color: val.color,
  icon: val.icon,
}));
