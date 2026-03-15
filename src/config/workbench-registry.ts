/**
 * Workbench Registry — Declarative catalog of cross-app functionalities
 * that can be "pulled" into NexusDesk as pages, widgets, or quick actions.
 *
 * To add a new exportable feature from any app:
 *   1. Add an entry to the relevant app below
 *   2. Ensure the route exists in src/config/app-routes.tsx
 *   3. That's it — the catalog UI and permission filtering handle the rest
 */

import type { LucideIcon } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────

export interface WorkbenchPage {
  id: string;
  appId: string;
  title: string;
  icon: string;
  description: string;
  componentPath: string;
  requiredPageId?: string;
}

export interface WorkbenchWidget {
  id: string;
  appId: string;
  title: string;
  icon: string;
  description: string;
  componentPath: string;
  size: 'compact' | 'full';
}

export interface WorkbenchAction {
  id: string;
  appId: string;
  title: string;
  icon: string;
  description: string;
  target: string;
  actionType: 'navigate' | 'modal';
}

export interface WorkbenchAppExport {
  appId: string;
  appLabel: string;
  appIcon: string;
  appColor: string;
  pages: WorkbenchPage[];
  widgets: WorkbenchWidget[];
  actions: WorkbenchAction[];
}

/** @deprecated Use WorkbenchAppExport */
export type WorkbenchModuleExport = WorkbenchAppExport;

// ─── Registry ─────────────────────────────────────────────────

export const WORKBENCH_REGISTRY: Record<string, WorkbenchAppExport> = {

  // ════════════════════════════════════════════════════════════
  // Marketing (marketing)
  // ════════════════════════════════════════════════════════════
  marketing: {
    appId: 'marketing',
    appLabel: 'Marketing',
    appIcon: 'LayoutDashboard',
    appColor: '#8B5CF6',
    pages: [
      { id: 'marketing:demandas', appId: 'marketing', title: 'Demandas', icon: 'ClipboardList', description: 'Kanban completo de demandas do marketing', componentPath: 'demandas', requiredPageId: 'gestao-demandas' },
      { id: 'marketing:campanhas', appId: 'marketing', title: 'Campanhas', icon: 'Megaphone', description: 'Gestão de campanhas de marketing', componentPath: 'campanhas', requiredPageId: 'gestao-campanhas' },
      { id: 'marketing:dashboard', appId: 'marketing', title: 'Dashboard Marketing', icon: 'BarChart3', description: 'Painel de comando com KPIs e radar executivo', componentPath: 'dashboard', requiredPageId: 'gestao-dashboard' },
      { id: 'marketing:planejamento', appId: 'marketing', title: 'Planejamento', icon: 'CalendarDays', description: 'Calendário de ações e planejamento estratégico', componentPath: 'planejamento' },
      { id: 'marketing:financeiro', appId: 'marketing', title: 'Financeiro Marketing', icon: 'DollarSign', description: 'Orçamento e controle financeiro do marketing', componentPath: 'financeiro' },
      { id: 'marketing:kpis', appId: 'marketing', title: 'KPIs', icon: 'Target', description: 'Indicadores-chave de performance do marketing', componentPath: 'kpis' },
      { id: 'marketing:trade', appId: 'marketing', title: 'Trade Marketing', icon: 'Store', description: 'Gestão de trade marketing integrada', componentPath: 'trade' },
      { id: 'marketing:lojas', appId: 'marketing', title: 'Lojas', icon: 'MapPin', description: 'Visão das lojas e ativações por unidade', componentPath: 'lojas' },
      { id: 'marketing:operacao', appId: 'marketing', title: 'Operação', icon: 'Settings', description: 'Centro de operações do marketing', componentPath: 'operacao' },
      { id: 'marketing:experimentos', appId: 'marketing', title: 'Experimentos', icon: 'FlaskConical', description: 'Laboratório de testes A/B e experimentos', componentPath: 'experimentos' },
      { id: 'marketing:acoes-comerciais', appId: 'marketing', title: 'Ações Comerciais', icon: 'Zap', description: 'Gestão de ações comerciais e promoções', componentPath: 'acoes-comerciais' },
      { id: 'marketing:documentos', appId: 'marketing', title: 'Documentos', icon: 'FileText', description: 'Editor de documentos colaborativo', componentPath: 'documentos' },
    ],
    widgets: [
      { id: 'marketing:demandas-stats', appId: 'marketing', title: 'Status de Demandas', icon: 'ClipboardList', description: 'Resumo rápido de demandas por status', componentPath: 'MarketingDemandsWidget', size: 'compact' },
      { id: 'marketing:pipeline', appId: 'marketing', title: 'Pipeline Resumido', icon: 'BarChart3', description: 'Visualização compacta do pipeline de demandas', componentPath: 'MarketingPipelineWidget', size: 'compact' },
    ],
    actions: [
      { id: 'marketing:nova-demanda', appId: 'marketing', title: 'Nova Demanda', icon: 'PlusCircle', description: 'Criar uma nova demanda de marketing', target: 'workbench:marketing:demandas', actionType: 'navigate' },
      { id: 'marketing:nova-campanha', appId: 'marketing', title: 'Nova Campanha', icon: 'PlusCircle', description: 'Criar uma nova campanha', target: 'workbench:marketing:campanhas', actionType: 'navigate' },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // Tech (pmo)
  // ════════════════════════════════════════════════════════════
  pmo: {
    appId: 'pmo',
    appLabel: 'Tech',
    appIcon: 'Briefcase',
    appColor: '#22D3EE',
    pages: [
      { id: 'pmo:dashboard', appId: 'pmo', title: 'Dashboard Tech', icon: 'LayoutDashboard', description: 'Painel de controle principal com KPIs de tecnologia', componentPath: 'pmo-dashboard', requiredPageId: 'pmo-overview' },
      { id: 'pmo:roadmap', appId: 'pmo', title: 'Roadmap Estratégico', icon: 'GanttChart', description: 'PDI e cronograma de iniciativas por horizonte', componentPath: 'pdi-cronograma', requiredPageId: 'pmo-roadmap-estrategico' },
      { id: 'pmo:sprints', appId: 'pmo', title: 'Sprints', icon: 'Kanban', description: 'Gestão de sprints ativos com backlog e velocity', componentPath: 'sprints', requiredPageId: 'pmo-sprints' },
      { id: 'pmo:suporte', appId: 'pmo', title: 'Suporte & SLA', icon: 'Headset', description: 'Tickets de suporte e compliance de SLA', componentPath: 'suporte', requiredPageId: 'pmo-suporte' },
      { id: 'pmo:indicadores', appId: 'pmo', title: 'Indicadores', icon: 'TrendingUp', description: 'KPIs operacionais e métricas de performance', componentPath: 'indicadores', requiredPageId: 'pmo-indicadores' },
      { id: 'pmo:releases', appId: 'pmo', title: 'Releases', icon: 'Rocket', description: 'Entregas e versões publicadas', componentPath: 'releases', requiredPageId: 'pmo-releases' },
      { id: 'pmo:backlog', appId: 'pmo', title: 'Backlog', icon: 'ListTodo', description: 'Backlog completo de iniciativas', componentPath: 'backlog' },
      { id: 'pmo:agenda', appId: 'pmo', title: 'Agenda', icon: 'Calendar', description: 'Agenda de ritos e reuniões', componentPath: 'agenda' },
      { id: 'pmo:governanca', appId: 'pmo', title: 'Governança', icon: 'Shield', description: 'Políticas e governança de TI', componentPath: 'governanca' },
      { id: 'pmo:ritos', appId: 'pmo', title: 'Ritos', icon: 'Users', description: 'Ritos formais (WBR, MSR, Executive Gate)', componentPath: 'ritos' },
    ],
    widgets: [
      { id: 'pmo:sprint-ativo', appId: 'pmo', title: 'Sprint Ativo', icon: 'Kanban', description: 'Resumo compacto do sprint em andamento', componentPath: 'ActiveSprintWidget', size: 'compact' },
      { id: 'pmo:tickets-sla', appId: 'pmo', title: 'Tickets SLA', icon: 'Headset', description: 'Contagem de tickets por status de SLA', componentPath: 'TicketsSLAWidget', size: 'compact' },
    ],
    actions: [
      { id: 'pmo:nova-iniciativa', appId: 'pmo', title: 'Nova Iniciativa', icon: 'PlusCircle', description: 'Criar uma nova iniciativa no backlog', target: 'workbench:pmo:sprints', actionType: 'navigate' },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // Ofertas (ofertas)
  // ════════════════════════════════════════════════════════════
  ofertas: {
    appId: 'ofertas',
    appLabel: 'Ofertas',
    appIcon: 'Tag',
    appColor: '#D94048',
    pages: [
      { id: 'ofertas:dashboard', appId: 'ofertas', title: 'Dashboard Ofertas', icon: 'LayoutDashboard', description: 'Painel principal do Ofertas', componentPath: 'ofertas-dashboard' },
      { id: 'ofertas:campanhas', appId: 'ofertas', title: 'Campanhas WhatsApp', icon: 'MessageSquare', description: 'Gestão de campanhas de disparo', componentPath: 'campanhas' },
      { id: 'ofertas:templates', appId: 'ofertas', title: 'Templates', icon: 'LayoutTemplate', description: 'Templates de mensagens', componentPath: 'templates' },
      { id: 'ofertas:envios', appId: 'ofertas', title: 'Envios', icon: 'Send', description: 'Controle de envios em andamento', componentPath: 'envios' },
      { id: 'ofertas:contatos', appId: 'ofertas', title: 'Contatos', icon: 'Users', description: 'Base de contatos e segmentação', componentPath: 'contatos' },
      { id: 'ofertas:segmentos', appId: 'ofertas', title: 'Segmentos', icon: 'Filter', description: 'Segmentação avançada de público', componentPath: 'segmentos' },
    ],
    widgets: [
      { id: 'ofertas:envios-stats', appId: 'ofertas', title: 'Envios Recentes', icon: 'Send', description: 'Resumo dos últimos disparos', componentPath: 'EnviosWidget', size: 'compact' },
    ],
    actions: [
      { id: 'ofertas:nova-campanha', appId: 'ofertas', title: 'Nova Campanha', icon: 'PlusCircle', description: 'Criar nova campanha de disparo', target: 'workbench:ofertas:campanhas', actionType: 'navigate' },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // Trade (trade)
  // ════════════════════════════════════════════════════════════
  trade: {
    appId: 'trade',
    appLabel: 'Trade',
    appIcon: 'ShoppingCart',
    appColor: '#E06830',
    pages: [
      { id: 'trade:dashboard', appId: 'trade', title: 'Dashboard Trade', icon: 'LayoutDashboard', description: 'Painel principal do trade marketing', componentPath: 'trade-dashboard' },
      { id: 'trade:pacotes', appId: 'trade', title: 'Pacotes', icon: 'Package', description: 'Gestão de pacotes comerciais', componentPath: 'pacotes' },
      { id: 'trade:fornecedores', appId: 'trade', title: 'Fornecedores', icon: 'Building2', description: 'Base de fornecedores e contratos', componentPath: 'fornecedores' },
      { id: 'trade:checklists', appId: 'trade', title: 'Checklists', icon: 'ClipboardCheck', description: 'Checklists de execução em loja', componentPath: 'checklists' },
      { id: 'trade:comprovacoes', appId: 'trade', title: 'Comprovações', icon: 'Camera', description: 'Comprovações fotográficas de ações', componentPath: 'comprovacoes' },
      { id: 'trade:performance', appId: 'trade', title: 'Performance', icon: 'TrendingUp', description: 'Performance de fornecedores e ações', componentPath: 'performance' },
      { id: 'trade:roi', appId: 'trade', title: 'ROI', icon: 'PieChart', description: 'Análise de retorno sobre investimento', componentPath: 'roi' },
      { id: 'trade:contratos', appId: 'trade', title: 'Contratos', icon: 'FileSignature', description: 'Contratos e termos comerciais', componentPath: 'contratos' },
    ],
    widgets: [
      { id: 'trade:pacotes-ativos', appId: 'trade', title: 'Pacotes Ativos', icon: 'Package', description: 'Resumo de pacotes em andamento', componentPath: 'PacotesAtivosWidget', size: 'compact' },
    ],
    actions: [
      { id: 'trade:novo-pacote', appId: 'trade', title: 'Novo Pacote', icon: 'PlusCircle', description: 'Criar um novo pacote comercial', target: 'workbench:trade:pacotes', actionType: 'navigate' },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // RH (rh)
  // ════════════════════════════════════════════════════════════
  rh: {
    appId: 'rh',
    appLabel: 'RH',
    appIcon: 'Users',
    appColor: '#D06B80',
    pages: [
      { id: 'rh:dashboard', appId: 'rh', title: 'Dashboard RH', icon: 'LayoutDashboard', description: 'Painel de gestão de pessoas', componentPath: 'rh-dashboard' },
      { id: 'rh:colaboradores', appId: 'rh', title: 'Colaboradores', icon: 'Users', description: 'Cadastro e gestão de colaboradores', componentPath: 'colaboradores' },
      { id: 'rh:ponto', appId: 'rh', title: 'Ponto', icon: 'Clock', description: 'Controle de ponto e jornada', componentPath: 'ponto' },
      { id: 'rh:ferias', appId: 'rh', title: 'Férias', icon: 'Palmtree', description: 'Gestão de férias e ausências', componentPath: 'ferias' },
      { id: 'rh:avaliacoes', appId: 'rh', title: 'Avaliações', icon: 'Star', description: 'Avaliações de desempenho', componentPath: 'avaliacoes' },
      { id: 'rh:recrutamento', appId: 'rh', title: 'Recrutamento', icon: 'UserPlus', description: 'Pipeline de recrutamento e seleção', componentPath: 'recrutamento' },
      { id: 'rh:relatorios', appId: 'rh', title: 'Relatórios RH', icon: 'FileBarChart', description: 'Relatórios de gestão de pessoas', componentPath: 'relatorios' },
    ],
    widgets: [
      { id: 'rh:headcount', appId: 'rh', title: 'Headcount', icon: 'Users', description: 'Resumo de quadro de pessoal', componentPath: 'HeadcountWidget', size: 'compact' },
    ],
    actions: [],
  },

  // ════════════════════════════════════════════════════════════
  // Domínio (dominio)
  // ════════════════════════════════════════════════════════════
  dominio: {
    appId: 'dominio',
    appLabel: 'Domínio',
    appIcon: 'Crown',
    appColor: '#A16C2A',
    pages: [
      { id: 'dominio:dashboard', appId: 'dominio', title: 'Dashboard Executivo', icon: 'LayoutDashboard', description: 'Painel executivo da rede', componentPath: 'executivo/dashboard' },
      { id: 'dominio:vendas', appId: 'dominio', title: 'Vendas', icon: 'TrendingUp', description: 'Visão geral de vendas da rede', componentPath: 'vendas/visao-geral' },
      { id: 'dominio:vendas-unidade', appId: 'dominio', title: 'Vendas por Unidade', icon: 'Building', description: 'Vendas detalhadas por unidade', componentPath: 'vendas/por-unidade' },
      { id: 'dominio:financeiro', appId: 'dominio', title: 'Resultado Financeiro', icon: 'DollarSign', description: 'DRE e resultado financeiro', componentPath: 'financeiro/resultado' },
      { id: 'dominio:problemas', appId: 'dominio', title: 'Radar de Problemas', icon: 'AlertTriangle', description: 'Detecção proativa de problemas', componentPath: 'problemas/radar' },
      { id: 'dominio:unidades', appId: 'dominio', title: 'Unidades', icon: 'MapPin', description: 'Gestão e comparativo de unidades', componentPath: 'unidades/visao-geral' },
      { id: 'dominio:produtos', appId: 'dominio', title: 'Produtos', icon: 'Package', description: 'Catálogo e análise de produtos', componentPath: 'produtos/catalogo' },
      { id: 'dominio:compras', appId: 'dominio', title: 'Compras', icon: 'ShoppingBag', description: 'Análise de compras e fornecedores', componentPath: 'compras/fornecedores' },
      { id: 'dominio:pessoas', appId: 'dominio', title: 'Pessoas', icon: 'Users', description: 'Gestão de equipe e custos', componentPath: 'pessoas/equipe' },
      { id: 'dominio:inteligencia', appId: 'dominio', title: 'Inteligência', icon: 'Brain', description: 'Insights e análises com IA', componentPath: 'inteligencia/insights' },
    ],
    widgets: [
      { id: 'dominio:kpis-rede', appId: 'dominio', title: 'KPIs da Rede', icon: 'BarChart3', description: 'Indicadores executivos resumidos', componentPath: 'RedeKPIsWidget', size: 'full' },
    ],
    actions: [],
  },

  // ════════════════════════════════════════════════════════════
  // CD (cd) — WMS / Centro de Distribuição
  // ════════════════════════════════════════════════════════════
  cd: {
    appId: 'cd',
    appLabel: 'CD',
    appIcon: 'Warehouse',
    appColor: '#8A6C3B',
    pages: [
      { id: 'cd:dashboard', appId: 'cd', title: 'Dashboard CD', icon: 'LayoutDashboard', description: 'Painel de controle do centro de distribuição', componentPath: 'cd-dashboard' },
      { id: 'cd:recebimento', appId: 'cd', title: 'Agenda Recebimento', icon: 'CalendarCheck', description: 'Agenda de recebimento de mercadorias', componentPath: 'recebimento/agenda' },
      { id: 'cd:conferencia', appId: 'cd', title: 'Conferência', icon: 'ClipboardCheck', description: 'Conferência de notas e produtos', componentPath: 'recebimento/conferencia' },
      { id: 'cd:mapa', appId: 'cd', title: 'Mapa do Armazém', icon: 'Map', description: 'Visualização do layout do armazém', componentPath: 'armazenagem/mapa' },
      { id: 'cd:lotes', appId: 'cd', title: 'Lotes', icon: 'Boxes', description: 'Gestão de lotes e validades', componentPath: 'armazenagem/lotes' },
      { id: 'cd:separacao', appId: 'cd', title: 'Ordens de Separação', icon: 'ListOrdered', description: 'Ordens e waves de separação', componentPath: 'separacao/ordens' },
      { id: 'cd:picking', appId: 'cd', title: 'Picking', icon: 'ScanLine', description: 'Operação de picking', componentPath: 'separacao/picking' },
      { id: 'cd:romaneios', appId: 'cd', title: 'Romaneios', icon: 'Truck', description: 'Romaneios de expedição', componentPath: 'expedicao/romaneios' },
      { id: 'cd:perdas', appId: 'cd', title: 'Perdas', icon: 'AlertTriangle', description: 'Controle de perdas e shrink', componentPath: 'qualidade/perdas' },
      { id: 'cd:reposicao', appId: 'cd', title: 'Reposição CD', icon: 'RefreshCw', description: 'Sugestões de reposição para lojas', componentPath: 'demanda/reposicao' },
    ],
    widgets: [
      { id: 'cd:operacao-resumo', appId: 'cd', title: 'Operação CD', icon: 'Warehouse', description: 'Resumo da operação do dia', componentPath: 'CDOperacaoWidget', size: 'compact' },
    ],
    actions: [],
  },

  // ════════════════════════════════════════════════════════════
  // Compras (compras)
  // ════════════════════════════════════════════════════════════
  compras: {
    appId: 'compras',
    appLabel: 'Compras',
    appIcon: 'ShoppingBag',
    appColor: '#7FA038',
    pages: [
      { id: 'compras:dashboard', appId: 'compras', title: 'Dashboard Compras', icon: 'LayoutDashboard', description: 'Painel de controle de compras', componentPath: 'compras-dashboard' },
      { id: 'compras:scorecard', appId: 'compras', title: 'Scorecard Fornecedores', icon: 'Star', description: 'Avaliação e ranking de fornecedores', componentPath: 'fornecedores/scorecard' },
      { id: 'compras:ordens', appId: 'compras', title: 'Pipeline de Ordens', icon: 'FileText', description: 'Pipeline de ordens de compra', componentPath: 'ordens' },
      { id: 'compras:verbas', appId: 'compras', title: 'Verbas Comerciais', icon: 'BadgeDollarSign', description: 'Gestão de verbas e trade allowances', componentPath: 'verbas' },
      { id: 'compras:gmroi', appId: 'compras', title: 'GMROI Matrix', icon: 'Grid3x3', description: 'Matriz GMROI por categoria', componentPath: 'gmroi' },
      { id: 'compras:demanda', appId: 'compras', title: 'Análise de Demanda', icon: 'TrendingUp', description: 'Previsão e análise de demanda', componentPath: 'demanda' },
      { id: 'compras:financeiro', appId: 'compras', title: 'Financeiro Compras', icon: 'DollarSign', description: 'Painel financeiro de compras', componentPath: 'financeiro' },
    ],
    widgets: [
      { id: 'compras:ordens-pendentes', appId: 'compras', title: 'Ordens Pendentes', icon: 'FileText', description: 'Ordens aguardando aprovação', componentPath: 'OrdensPendentesWidget', size: 'compact' },
    ],
    actions: [
      { id: 'compras:nova-ordem', appId: 'compras', title: 'Nova Ordem', icon: 'PlusCircle', description: 'Criar nova ordem de compra', target: 'workbench:compras:ordens', actionType: 'navigate' },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // Cliente (cliente)
  // ════════════════════════════════════════════════════════════
  cliente: {
    appId: 'cliente',
    appLabel: 'Cliente',
    appIcon: 'Heart',
    appColor: '#C660A0',
    pages: [
      { id: 'cliente:dashboard', appId: 'cliente', title: 'Dashboard Cliente', icon: 'LayoutDashboard', description: 'Painel de experiência do cliente', componentPath: 'cliente-dashboard' },
      { id: 'cliente:clientes', appId: 'cliente', title: 'Base de Clientes', icon: 'Users', description: 'Cadastro e gestão de clientes', componentPath: 'clientes' },
      { id: 'cliente:segmentacao', appId: 'cliente', title: 'Segmentação', icon: 'Filter', description: 'Segmentação por perfil e comportamento', componentPath: 'segmentacao' },
      { id: 'cliente:nps', appId: 'cliente', title: 'NPS & Pesquisas', icon: 'MessageSquare', description: 'Net Promoter Score e pesquisas', componentPath: 'nps' },
      { id: 'cliente:tickets', appId: 'cliente', title: 'Tickets', icon: 'Ticket', description: 'Gestão de tickets de atendimento', componentPath: 'tickets' },
      { id: 'cliente:sac', appId: 'cliente', title: 'SAC', icon: 'Headphones', description: 'Serviço de atendimento ao consumidor', componentPath: 'sac' },
    ],
    widgets: [
      { id: 'cliente:nps-score', appId: 'cliente', title: 'NPS Score', icon: 'Heart', description: 'Net Promoter Score atual', componentPath: 'NPSScoreWidget', size: 'compact' },
    ],
    actions: [],
  },

  // ════════════════════════════════════════════════════════════
  // Financeiro (financeiro)
  // ════════════════════════════════════════════════════════════
  financeiro: {
    appId: 'financeiro',
    appLabel: 'Financeiro',
    appIcon: 'Landmark',
    appColor: '#D3A020',
    pages: [
      { id: 'financeiro:dashboard', appId: 'financeiro', title: 'Dashboard Financeiro', icon: 'LayoutDashboard', description: 'Painel financeiro da rede', componentPath: 'fin-dashboard' },
      { id: 'financeiro:dre-rede', appId: 'financeiro', title: 'DRE da Rede', icon: 'FileSpreadsheet', description: 'Demonstrativo de resultado consolidado', componentPath: 'dre/rede' },
      { id: 'financeiro:dre-loja', appId: 'financeiro', title: 'DRE por Loja', icon: 'Store', description: 'Demonstrativo por unidade', componentPath: 'dre/loja' },
      { id: 'financeiro:capital-giro', appId: 'financeiro', title: 'Capital de Giro', icon: 'RefreshCw', description: 'Análise de capital de giro', componentPath: 'capital-giro' },
      { id: 'financeiro:margem', appId: 'financeiro', title: 'Margem por Categoria', icon: 'PieChart', description: 'Análise de margens por categoria', componentPath: 'margem-categoria' },
      { id: 'financeiro:projecao', appId: 'financeiro', title: 'Projeção', icon: 'TrendingUp', description: 'Projeções financeiras', componentPath: 'projecao' },
      { id: 'financeiro:custos', appId: 'financeiro', title: 'Custos', icon: 'Receipt', description: 'Análise detalhada de custos', componentPath: 'custos' },
      { id: 'financeiro:roic', appId: 'financeiro', title: 'ROIC', icon: 'Target', description: 'Retorno sobre capital investido', componentPath: 'roic' },
    ],
    widgets: [
      { id: 'financeiro:resultado-mes', appId: 'financeiro', title: 'Resultado do Mês', icon: 'DollarSign', description: 'Resultado financeiro mensal', componentPath: 'ResultadoMesWidget', size: 'compact' },
    ],
    actions: [],
  },

  // ════════════════════════════════════════════════════════════
  // Loja (loja)
  // ════════════════════════════════════════════════════════════
  loja: {
    appId: 'loja',
    appLabel: 'Loja',
    appIcon: 'Store',
    appColor: '#31A690',
    pages: [
      { id: 'loja:dashboard', appId: 'loja', title: 'Dashboard Loja', icon: 'LayoutDashboard', description: 'Painel de performance da loja', componentPath: 'loja-dashboard' },
      { id: 'loja:rentabilidade', appId: 'loja', title: 'Rentabilidade', icon: 'TrendingUp', description: 'Análise de rentabilidade', componentPath: 'rentabilidade' },
      { id: 'loja:precificacao', appId: 'loja', title: 'Precificação', icon: 'Tag', description: 'Gestão de preços e margens', componentPath: 'precificacao' },
      { id: 'loja:perdas', appId: 'loja', title: 'Perdas', icon: 'AlertTriangle', description: 'Controle de perdas em loja', componentPath: 'perdas' },
      { id: 'loja:comparativo', appId: 'loja', title: 'Comparativo', icon: 'GitCompare', description: 'Comparativo entre lojas', componentPath: 'comparativo' },
      { id: 'loja:alertas', appId: 'loja', title: 'Alertas', icon: 'Bell', description: 'Alertas operacionais da loja', componentPath: 'alertas' },
    ],
    widgets: [
      { id: 'loja:performance', appId: 'loja', title: 'Performance Loja', icon: 'Store', description: 'KPIs da loja do dia', componentPath: 'LojaPerformanceWidget', size: 'compact' },
    ],
    actions: [],
  },

  // ════════════════════════════════════════════════════════════
  // Reposição (reposicao)
  // ════════════════════════════════════════════════════════════
  reposicao: {
    appId: 'reposicao',
    appLabel: 'Reposição',
    appIcon: 'RefreshCw',
    appColor: '#60A63F',
    pages: [
      { id: 'reposicao:dashboard', appId: 'reposicao', title: 'Dashboard Reposição', icon: 'LayoutDashboard', description: 'Painel de reposição de gondolas', componentPath: 'repo-dashboard' },
      { id: 'reposicao:gondolas', appId: 'reposicao', title: 'Gôndolas', icon: 'LayoutGrid', description: 'Mapa e status das gôndolas', componentPath: 'gondolas' },
      { id: 'reposicao:tarefas', appId: 'reposicao', title: 'Tarefas', icon: 'ListTodo', description: 'Tarefas de reposição pendentes', componentPath: 'tarefas' },
      { id: 'reposicao:rupturas', appId: 'reposicao', title: 'Rupturas', icon: 'AlertOctagon', description: 'Monitoramento de rupturas', componentPath: 'rupturas' },
      { id: 'reposicao:validades', appId: 'reposicao', title: 'Validades', icon: 'CalendarX', description: 'Controle de validades', componentPath: 'validades' },
    ],
    widgets: [
      { id: 'reposicao:rupturas-widget', appId: 'reposicao', title: 'Rupturas Ativas', icon: 'AlertOctagon', description: 'Rupturas detectadas hoje', componentPath: 'RupturasWidget', size: 'compact' },
    ],
    actions: [],
  },

  // ════════════════════════════════════════════════════════════
  // Sorteios (sorteios)
  // ════════════════════════════════════════════════════════════
  sorteios: {
    appId: 'sorteios',
    appLabel: 'Sorteios',
    appIcon: 'Dice5',
    appColor: '#E61A1A',
    pages: [
      { id: 'sorteios:dashboard', appId: 'sorteios', title: 'Dashboard Sorteios', icon: 'LayoutDashboard', description: 'Painel de campanhas de sorteio', componentPath: 'sorteios-dashboard' },
      { id: 'sorteios:campanhas', appId: 'sorteios', title: 'Campanhas', icon: 'Trophy', description: 'Gestão de campanhas ativas', componentPath: 'campanhas' },
      { id: 'sorteios:participantes', appId: 'sorteios', title: 'Participantes', icon: 'Users', description: 'Base de participantes', componentPath: 'participantes' },
      { id: 'sorteios:cupons', appId: 'sorteios', title: 'Cupons', icon: 'Ticket', description: 'Gestão de cupons emitidos', componentPath: 'cupons' },
      { id: 'sorteios:fraudes', appId: 'sorteios', title: 'Fraudes', icon: 'ShieldAlert', description: 'Logs de detecção de fraude', componentPath: 'fraudes' },
    ],
    widgets: [
      { id: 'sorteios:campanha-ativa', appId: 'sorteios', title: 'Campanha Ativa', icon: 'Trophy', description: 'Sorteio em andamento', componentPath: 'CampanhaAtivaWidget', size: 'compact' },
    ],
    actions: [],
  },

  // ════════════════════════════════════════════════════════════
  // NexusIA (ia)
  // ════════════════════════════════════════════════════════════
  ia: {
    appId: 'ia',
    appLabel: 'NexusIA',
    appIcon: 'Sparkles',
    appColor: '#E5B820',
    pages: [
      { id: 'ia:chat', appId: 'ia', title: 'Assistente IA', icon: 'MessageSquare', description: 'Chat com inteligência artificial integrada', componentPath: 'ia-chat' },
    ],
    widgets: [],
    actions: [
      { id: 'ia:nova-conversa', appId: 'ia', title: 'Nova Conversa IA', icon: 'Sparkles', description: 'Iniciar conversa com a IA', target: 'workbench:ia:chat', actionType: 'navigate' },
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────

export function getAllWorkbenchPages(): WorkbenchPage[] {
  return Object.values(WORKBENCH_REGISTRY).flatMap(m => m.pages);
}

export function getAllWorkbenchWidgets(): WorkbenchWidget[] {
  return Object.values(WORKBENCH_REGISTRY).flatMap(m => m.widgets);
}

export function getAllWorkbenchActions(): WorkbenchAction[] {
  return Object.values(WORKBENCH_REGISTRY).flatMap(m => m.actions);
}

export function getWorkbenchPageById(id: string): WorkbenchPage | undefined {
  return getAllWorkbenchPages().find(p => p.id === id);
}

export function getWorkbenchAppForPage(pageId: string): WorkbenchAppExport | undefined {
  const page = getWorkbenchPageById(pageId);
  if (!page) return undefined;
  return WORKBENCH_REGISTRY[page.appId];
}

/** @deprecated Use getWorkbenchAppForPage */
export const getWorkbenchModuleForPage = getWorkbenchAppForPage;

export function getWorkbenchApps(): WorkbenchAppExport[] {
  return Object.values(WORKBENCH_REGISTRY);
}

/** @deprecated Use getWorkbenchApps */
export const getWorkbenchModules = getWorkbenchApps;
