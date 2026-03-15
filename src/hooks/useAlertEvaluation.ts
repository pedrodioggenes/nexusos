import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAlertRules } from "./useAlertRules";
import type { Json } from "@/integrations/supabase/types";

/**
 * Client-side alert evaluation engine.
 * Runs enabled rules against live data and creates alerts when conditions are met.
 * Deduplicates by rule_key to avoid spamming.
 */
export function useAlertEvaluation() {
  const { data: rules = [] } = useAlertRules();
  const hasRun = useRef(false);

  const { data: evaluationResult } = useQuery({
    queryKey: ['alert-evaluation', rules.map(r => r.id + r.enabled).join(',')],
    queryFn: async () => {
      const enabledRules = rules.filter(r => r.enabled);
      if (enabledRules.length === 0) return { evaluated: 0, created: 0 };

      let created = 0;

      for (const rule of enabledRules) {
        try {
          const alerts = await evaluateRule(rule.rule_key);
          for (const alert of alerts) {
            // Check if alert already exists (dedup by rule_key)
            const { data: existing } = await supabase
              .from('marketing_alerts')
              .select('id')
              .eq('rule_key', rule.rule_key)
              .eq('is_resolved', false)
              .maybeSingle();

            if (!existing) {
              const { error } = await supabase
                .from('marketing_alerts')
                .insert([{
                  type: alert.type as 'budget' | 'roi' | 'execution' | 'supplier' | 'goal' | 'anomaly',
                  severity: rule.severity,
                  title: alert.title,
                  description: alert.description,
                  rule_key: rule.rule_key,
                  evidence: alert.evidence,
                  action_link: rule.action_link,
                  impact: alert.impact,
                  data: {} as Json,
                }]);
              if (!error) created++;
            }
          }
        } catch (err) {
          console.warn(`Rule evaluation failed for ${rule.rule_key}:`, err);
        }
      }

      return { evaluated: enabledRules.length, created };
    },
    enabled: rules.length > 0 && !hasRun.current,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (evaluationResult) hasRun.current = true;
  }, [evaluationResult]);

  return evaluationResult;
}

interface GeneratedAlert {
  type: string;
  title: string;
  description: string;
  evidence: string;
  impact: string;
}

async function evaluateRule(ruleKey: string): Promise<GeneratedAlert[]> {
  switch (ruleKey) {
    case 'no_budget_in_period':
      return evaluateNoBudget();
    case 'campaign_no_execution':
      return evaluateCampaignNoExecution();
    case 'campaign_spend_no_kpi':
    case 'spend_without_kpi':
      return evaluateCampaignSpendNoKpi();
    case 'sla_overdue_demands':
      return evaluateSlaOverdueDemands();
    case 'calendar_no_demand':
      return evaluateCalendarNoDemand();
    case 'uncategorized_transaction':
      return evaluateUncategorizedTransactions();
    case 'budget_overrun':
      return evaluateBudgetOverrun();
    case 'campaign_no_allocation':
      return evaluateCampaignNoAllocation();
    case 'store_performance_drop':
      return [];
    case 'kpi_missing_period':
      return evaluateKpiMissingPeriod();
    default:
      return [];
  }
}

async function evaluateNoBudget(): Promise<GeneratedAlert[]> {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { count } = await supabase
    .from('marketing_budgets')
    .select('*', { count: 'exact', head: true })
    .gte('period_start', `${currentMonth}-01`);

  if (count === 0) {
    return [{
      type: 'budget',
      title: 'Sem orçamento cadastrado no período atual',
      description: `Nenhum orçamento foi encontrado para ${currentMonth}. Cadastre o budget para manter o controle financeiro.`,
      evidence: `0 budgets para ${currentMonth}`,
      impact: 'Impossibilidade de controlar gastos e medir desvios orçamentários',
    }];
  }
  return [];
}

async function evaluateCampaignNoExecution(): Promise<GeneratedAlert[]> {
  const { data: campaigns } = await supabase
    .from('marketing_campaigns')
    .select('id, name, status')
    .eq('status', 'active')
    .limit(10) as { data: Array<{ id: string; name: string; status: string }> | null };

  if (!campaigns || campaigns.length === 0) return [];

  const alerts: GeneratedAlert[] = [];
  for (const c of campaigns) {
    const query1: any = supabase
      .from('marketing_plans')
      .select('*', { count: 'exact', head: true });
    const { count } = await query1.eq('campaign_id', c.id).eq('status', 'executed');

    if (count === 0) {
      alerts.push({
        type: 'execution',
        title: `Campanha "${c.name}" sem execução registrada`,
        description: 'Campanha ativa sem nenhum registro de execução. Verifique se as ações foram realizadas.',
        evidence: `Campanha ativa, 0 execuções registradas`,
        impact: 'Sem visibilidade sobre andamento da campanha',
      });
      if (alerts.length >= 3) break;
    }
  }
  return alerts;
}

async function evaluateCampaignSpendNoKpi(): Promise<GeneratedAlert[]> {
  const { data: campaigns } = await supabase
    .from('marketing_campaigns')
    .select('id, name, status')
    .eq('status', 'active')
    .limit(10) as { data: Array<{ id: string; name: string; status: string }> | null };

  if (!campaigns) return [];

  const alerts: GeneratedAlert[] = [];
  for (const c of campaigns) {
    const txQuery: any = supabase
      .from('financial_transactions')
      .select('*', { count: 'exact', head: true });
    const { count: txCount } = await txQuery.eq('reference_type', 'campaign').eq('reference_id', c.id);

    if (txCount && txCount > 0) {
      const kpiQuery: any = supabase
        .from('marketing_kpis')
        .select('*', { count: 'exact', head: true });
      const { count: kpiCount } = await kpiQuery.eq('campaign_id', c.id);

      if (kpiCount === 0) {
        alerts.push({
          type: 'roi',
          title: `Campanha "${c.name}" com gasto mas sem KPI`,
          description: 'Há transações financeiras registradas mas nenhum KPI vinculado. Impossível calcular ROI.',
          evidence: `${txCount} transação(ões), 0 KPIs`,
          impact: 'ROI não pode ser calculado, decisão financeira comprometida',
        });
        if (alerts.length >= 3) break;
      }
    }
  }
  return alerts;
}

async function evaluateSlaOverdueDemands(): Promise<GeneratedAlert[]> {
  const { data: overdue } = await supabase
    .from('marketing_demands')
    .select('id, title, due_date')
    .not('status', 'in', '("completed","cancelled")')
    .lt('due_date', new Date().toISOString())
    .limit(5);

  if (!overdue || overdue.length === 0) return [];

  return [{
    type: 'execution',
    title: `${overdue.length} demanda(s) com prazo estourado`,
    description: `Demandas atrasadas: ${overdue.slice(0, 3).map(d => `"${d.title}"`).join(', ')}`,
    evidence: `${overdue.length} demandas vencidas`,
    impact: 'SLA comprometido, risco de atraso em cascata',
  }];
}

async function evaluateCalendarNoDemand(): Promise<GeneratedAlert[]> {
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const { data: plans } = await supabase
    .from('marketing_plans')
    .select('id, title, start_date')
    .gte('start_date', now.toISOString())
    .lte('start_date', nextWeek.toISOString())
    .is('demand_id', null)
    .limit(10);

  if (!plans || plans.length === 0) return [];

  if (plans.length > 0) {
    return [{
      type: 'execution',
      title: `${plans.length} ação(ões) no calendário sem demanda vinculada`,
      description: 'Ações próximas no calendário sem demanda vinculada podem ficar sem responsável.',
      evidence: `${plans.length} ações nos próximos 7 dias sem demanda`,
      impact: 'Risco de ações não serem executadas por falta de atribuição',
    }];
  }
  return [];
}

async function evaluateUncategorizedTransactions(): Promise<GeneratedAlert[]> {
  const { count } = await supabase
    .from('financial_transactions')
    .select('*', { count: 'exact', head: true })
    .or('subcategory.is.null,subcategory.eq.');

  if (count && count > 0) {
    return [{
      type: 'budget',
      title: `${count} transação(ões) sem subcategorização`,
      description: 'Transações financeiras sem subcategoria dificultam a análise orçamentária e relatórios.',
      evidence: `${count} transações sem subcategoria`,
      impact: 'Relatórios financeiros imprecisos',
    }];
  }
  return [];
}

async function evaluateBudgetOverrun(): Promise<GeneratedAlert[]> {
  // Check budget categories where spent > allocated
  const { data: categories } = await supabase
    .from('marketing_budget_categories')
    .select('id, name, allocated_amount, spent_amount');

  if (!categories) return [];

  const overrun = categories.filter(c => (c.spent_amount || 0) > (c.allocated_amount || 0));
  if (overrun.length === 0) return [];

  return overrun.slice(0, 3).map(c => {
    const excess = (c.spent_amount || 0) - (c.allocated_amount || 0);
    return {
      type: 'budget',
      title: `Orçamento estourado: "${c.name}"`,
      description: `A categoria "${c.name}" ultrapassou o orçamento alocado em R$${excess.toLocaleString('pt-BR')}.`,
      evidence: `Alocado: R$${(c.allocated_amount || 0).toLocaleString('pt-BR')}, Gasto: R$${(c.spent_amount || 0).toLocaleString('pt-BR')}`,
      impact: 'Desvio orçamentário requer ação imediata de realocação ou corte',
    };
  });
}

async function evaluateCampaignNoAllocation(): Promise<GeneratedAlert[]> {
  const { data: campaigns } = await supabase
    .from('marketing_campaigns')
    .select('id, name')
    .eq('status', 'active')
    .is('planned_budget', null)
    .limit(5);

  if (!campaigns || campaigns.length === 0) return [];

  return [{
    type: 'budget',
    title: `${campaigns.length} campanha(s) ativa(s) sem alocação orçamentária`,
    description: `Campanhas sem orçamento planejado: ${campaigns.slice(0, 3).map(c => `"${c.name}"`).join(', ')}`,
    evidence: `${campaigns.length} campanhas sem planned_budget`,
    impact: 'Impossível controlar gastos e rastrear desvios para essas campanhas',
  }];
}

async function evaluateKpiMissingPeriod(): Promise<GeneratedAlert[]> {
  const now = new Date();
  const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  const [catalogRes, recordsRes] = await Promise.all([
    supabase.from('metrics_catalog').select('id, display_name_pt').eq('is_active', true),
    supabase.from('metric_records').select('catalog_id').eq('period_start', currentPeriodStart),
  ]);

  const catalog = catalogRes.data || [];
  const recordedIds = new Set((recordsRes.data || []).map(r => r.catalog_id));
  const missing = catalog.filter(c => !recordedIds.has(c.id));

  if (missing.length === 0) return [];

  return [{
    type: 'roi',
    title: `${missing.length} KPI(s) sem registro no período atual`,
    description: `Métricas faltando: ${missing.slice(0, 5).map(m => m.display_name_pt).join(', ')}${missing.length > 5 ? '...' : ''}`,
    evidence: `${missing.length} de ${catalog.length} métricas sem valor em ${currentPeriodStart}`,
    impact: 'Dados incompletos comprometem análise e tomada de decisão',
  }];
}
