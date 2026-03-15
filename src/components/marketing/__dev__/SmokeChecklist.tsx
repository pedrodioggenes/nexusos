/**
 * Smoke Checklist - Guardrail de navegação para o Marketing
 * 
 * Este arquivo documenta as rotas críticas que devem ser verificadas
 * após qualquer refatoração ou migração de componentes.
 * 
 * Para teste manual: navegue por cada rota e confirme que renderiza sem erro.
 */

export const MARKETING_SMOKE_ROUTES = [
  { path: '/app/marketing', component: 'Index', critical: true, description: 'Dashboard principal' },
  { path: '/app/marketing/demandas', component: 'Demandas', critical: true, description: 'Gestão de demandas' },
  { path: '/app/marketing/planejamento', component: 'Planejamento', critical: true, description: 'Calendário de marketing' },
  { path: '/app/marketing/financeiro', component: 'Financeiro', critical: true, description: 'Gestão financeira' },
  { path: '/app/marketing/documentos', component: 'Documentos', critical: true, description: 'Documentos e wikis' },
  { path: '/app/marketing/campanhas', component: 'Campanhas', critical: true, description: 'Campanhas de marketing' },
  { path: '/app/marketing/alertas', component: 'Alertas', critical: true, description: 'Central de alertas' },
] as const;

export const MARKETING_SECONDARY_ROUTES = [
  { path: '/app/marketing/kpis', component: 'KPIs', critical: false },
  { path: '/app/marketing/lojas', component: 'Lojas', critical: false },
  { path: '/app/marketing/orcamento', component: 'Orcamento', critical: false },
  { path: '/app/marketing/relatorios', component: 'Relatorios', critical: false },
  { path: '/app/marketing/trade', component: 'Trade', critical: false },
  { path: '/app/marketing/redes-sociais', component: 'RedesSociais', critical: false },
  { path: '/app/marketing/equipe/social', component: 'SocialMedia', critical: false },
  { path: '/app/marketing/equipe/trafego', component: 'Trafego', critical: false },
  { path: '/app/marketing/equipe/design', component: 'Design', critical: false },
  { path: '/app/marketing/equipe/copy', component: 'Copywriter', critical: false },
  { path: '/app/marketing/equipe/video', component: 'Videomaker', critical: false },
] as const;

export type SmokeRoute = typeof MARKETING_SMOKE_ROUTES[number];
