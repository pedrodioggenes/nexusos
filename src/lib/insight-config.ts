import type { AIInsight } from "@/hooks/useAIInsights";

export type InsightType = AIInsight['insight_type'];
export type ModuleColor = 'gestao' | 'ofertas' | 'trade' | 'ia';

export interface InsightConfig {
  type: InsightType;
  label: string;
  moduleColor: ModuleColor;
  defaultPrompt: string;
  description: string;
}

export const INSIGHT_CONFIGS: Record<InsightType, InsightConfig> = {
  dashboard: {
    type: 'dashboard',
    label: 'Visão Geral',
    moduleColor: 'gestao',
    description: 'Análise executiva de KPIs, orçamento e performance',
    defaultPrompt: 'Analise os KPIs de marketing, o uso do orçamento e a performance por canal. Identifique oportunidades de otimização, alerte sobre riscos de budget e sugira ações estratégicas para melhorar o ROI.',
  },
  budget: {
    type: 'budget',
    label: 'Orçamento',
    moduleColor: 'gestao',
    description: 'Análise de alocação e consumo de budget',
    defaultPrompt: 'Analise a distribuição do orçamento por categoria, identifique categorias com baixa execução ou risco de estouro, e sugira realocações estratégicas.',
  },
  kpi: {
    type: 'kpi',
    label: 'KPIs',
    moduleColor: 'gestao',
    description: 'Performance de métricas e metas',
    defaultPrompt: 'Analise os KPIs de marketing comparando com períodos anteriores e metas definidas. Identifique canais com queda de performance e oportunidades de melhoria.',
  },
  campaign: {
    type: 'campaign',
    label: 'Campanhas',
    moduleColor: 'ofertas',
    description: 'Status e performance de campanhas',
    defaultPrompt: 'Analise o status das campanhas ativas, identifique aquelas em risco de atraso ou baixa performance, e sugira ações para otimização.',
  },
  store: {
    type: 'store',
    label: 'Lojas',
    moduleColor: 'gestao',
    description: 'Performance por loja e região',
    defaultPrompt: 'Analise a performance das lojas por região, identifique disparidades de conversão e sugira ações para lojas com baixo desempenho.',
  },
  trade: {
    type: 'trade',
    label: 'Trade Marketing',
    moduleColor: 'trade',
    description: 'Pacotes, comprovações e fornecedores',
    defaultPrompt: 'Analise o status dos pacotes de trade marketing, identifique gargalos no processo de comprovações e fornecedores com pendências críticas.',
  },
};

export function getInsightConfig(type: InsightType): InsightConfig {
  return INSIGHT_CONFIGS[type] || INSIGHT_CONFIGS.dashboard;
}

export function getModuleColorFromType(type: InsightType): ModuleColor {
  return INSIGHT_CONFIGS[type]?.moduleColor || 'gestao';
}
