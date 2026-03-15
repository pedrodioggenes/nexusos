/**
 * Centralized registry of all pages per app.
 * Used by AppPageAccessSelector and sidebar filtering.
 */

export interface AppPage {
  id: string;
  title: string;
  path: string;
  group: string;
}

/** @deprecated Use AppPage */
export type ModulePage = AppPage;

export interface AppPageGroup {
  group: string;
  pages: AppPage[];
}

/** @deprecated Use AppPageGroup */
export type ModulePageGroup = AppPageGroup;

export interface AppDefinition {
  id: string;
  label: string;
  groups: AppPageGroup[];
}

/** @deprecated Use AppDefinition */
export type ModuleDefinition = AppDefinition;

const marketing: ModuleDefinition = {
  id: "marketing",
  label: "Marketing",
  groups: [
    {
      group: "Principal",
      pages: [
        { id: "gestao-dashboard", title: "Dashboard", path: "/app/marketing", group: "Principal" },
        { id: "gestao-operacao", title: "Operação", path: "/app/marketing/operacao", group: "Principal" },
        { id: "gestao-alertas", title: "Alertas", path: "/app/marketing/alertas", group: "Principal" },
        { id: "gestao-calendario", title: "Calendário", path: "/app/marketing/planejamento", group: "Principal" },
      ],
    },
    {
      group: "Planejamento",
      pages: [
        { id: "gestao-demandas", title: "Demandas", path: "/app/marketing/demandas", group: "Planejamento" },
        { id: "gestao-templates", title: "Templates", path: "/app/marketing/templates", group: "Planejamento" },
        { id: "gestao-acoes", title: "Ações Comerciais", path: "/app/marketing/acoes-comerciais", group: "Planejamento" },
        { id: "gestao-campanhas", title: "Campanhas", path: "/app/marketing/campanhas", group: "Planejamento" },
        { id: "gestao-trade", title: "Trade Marketing", path: "/app/marketing/trade", group: "Planejamento" },
      ],
    },
    {
      group: "Financeiro",
      pages: [
        { id: "gestao-financeiro", title: "Movimentações", path: "/app/marketing/financeiro", group: "Financeiro" },
        { id: "gestao-orcamento", title: "Orçamento", path: "/app/marketing/financeiro/orcamento", group: "Financeiro" },
        { id: "gestao-fechamento", title: "Fechamento", path: "/app/marketing/financeiro/fechamento", group: "Financeiro" },
        { id: "gestao-conciliacao", title: "Conciliação", path: "/app/marketing/financeiro/conciliacao", group: "Financeiro" },
        { id: "gestao-fin-relatorios", title: "Relatórios", path: "/app/marketing/financeiro/relatorios", group: "Financeiro" },
      ],
    },
    {
      group: "Documentos",
      pages: [
        { id: "gestao-documentos", title: "Documentos", path: "/app/marketing/documentos", group: "Documentos" },
      ],
    },
    {
      group: "Canais",
      pages: [
        { id: "gestao-redes", title: "Redes Sociais", path: "/app/marketing/redes-sociais", group: "Canais" },
      ],
    },
    {
      group: "Pessoas",
      pages: [
        { id: "gestao-quadro-equipe", title: "Quadro da Equipe", path: "/app/marketing/equipe/quadro", group: "Pessoas" },
        { id: "gestao-desempenho", title: "Desempenho", path: "/app/marketing/equipe/desempenho", group: "Pessoas" },
        { id: "gestao-capacitacao", title: "Capacitação", path: "/app/marketing/equipe/capacitacao", group: "Pessoas" },
        { id: "gestao-alocacao", title: "Alocação", path: "/app/marketing/equipe/alocacao", group: "Pessoas" },
        { id: "gestao-equipe", title: "Visão Geral", path: "/app/marketing/equipe/visao-geral", group: "Pessoas" },
        { id: "gestao-social", title: "Social Media", path: "/app/marketing/equipe/social-media", group: "Pessoas" },
        { id: "gestao-trafego", title: "Tráfego", path: "/app/marketing/equipe/trafego", group: "Pessoas" },
        { id: "gestao-design", title: "Design", path: "/app/marketing/equipe/design", group: "Pessoas" },
        { id: "gestao-copy", title: "Copywriter", path: "/app/marketing/equipe/copywriter", group: "Pessoas" },
        { id: "gestao-video", title: "Videomaker", path: "/app/marketing/equipe/videomaker", group: "Pessoas" },
      ],
    },
    {
      group: "Agência",
      pages: [
        { id: "gestao-ag-entregas", title: "Entregas", path: "/app/marketing/agencia/entregas", group: "Agência" },
        { id: "gestao-ag-briefings", title: "Briefings", path: "/app/marketing/agencia/briefings", group: "Agência" },
        { id: "gestao-ag-aprovacoes", title: "Aprovações", path: "/app/marketing/agencia/aprovacoes", group: "Agência" },
        { id: "gestao-ag-sla", title: "SLA & Performance", path: "/app/marketing/agencia/sla", group: "Agência" },
        { id: "gestao-ag-financeiro", title: "Financeiro", path: "/app/marketing/agencia/financeiro", group: "Agência" },
      ],
    },
    {
      group: "Análise",
      pages: [
        { id: "gestao-kpis", title: "KPIs", path: "/app/marketing/kpis", group: "Análise" },
        { id: "gestao-experimentos", title: "Experimentos", path: "/app/marketing/experimentos", group: "Análise" },
        { id: "gestao-lojas", title: "Lojas", path: "/app/marketing/lojas", group: "Análise" },
        { id: "gestao-relatorios", title: "Relatórios", path: "/app/marketing/relatorios", group: "Análise" },
        { id: "gestao-visao-unificada", title: "Visão Unificada", path: "/app/marketing/analise/visao-unificada", group: "Análise" },
      ],
    },
    {
      group: "Atividade",
      pages: [
        { id: "gestao-historico", title: "Histórico", path: "/app/marketing/atividade", group: "Atividade" },
      ],
    },
  ],
};

const trade: ModuleDefinition = {
  id: "trade",
  label: "Trade",
  groups: [
    {
      group: "Principal",
      pages: [
        { id: "trade-dashboard", title: "Dashboard", path: "/app/trade", group: "Principal" },
        { id: "trade-alertas", title: "Alertas", path: "/app/trade/alertas", group: "Principal" },
      ],
    },
    {
      group: "Gestão",
      pages: [
        { id: "trade-pacotes", title: "Pacotes", path: "/app/trade/pacotes", group: "Gestão" },
        { id: "trade-fornecedores", title: "Fornecedores", path: "/app/trade/fornecedores", group: "Gestão" },
        { id: "trade-contratos", title: "Contratos", path: "/app/trade/contratos", group: "Gestão" },
      ],
    },
    {
      group: "Execução",
      pages: [
        { id: "trade-checklists", title: "Checklists", path: "/app/trade/checklists", group: "Execução" },
        { id: "trade-comprovacoes", title: "Comprovações", path: "/app/trade/comprovacoes", group: "Execução" },
        { id: "trade-calendario", title: "Calendário", path: "/app/trade/calendario", group: "Execução" },
      ],
    },
    {
      group: "Análise",
      pages: [
        { id: "trade-performance", title: "Performance", path: "/app/trade/performance", group: "Análise" },
        { id: "trade-roi", title: "ROI Trade", path: "/app/trade/roi", group: "Análise" },
        { id: "trade-relatorios", title: "Relatórios", path: "/app/trade/relatorios", group: "Análise" },
      ],
    },
  ],
};

const ofertas: ModuleDefinition = {
  id: "ofertas",
  label: "Ofertas",
  groups: [
    {
      group: "Principal",
      pages: [
        { id: "ofertas-dashboard", title: "Dashboard", path: "/app/ofertas", group: "Principal" },
      ],
    },
    {
      group: "Campanhas",
      pages: [
        { id: "ofertas-campanhas", title: "Campanhas", path: "/app/ofertas/campanhas", group: "Campanhas" },
        { id: "ofertas-templates", title: "Templates", path: "/app/ofertas/templates", group: "Campanhas" },
        { id: "ofertas-envios", title: "Envios", path: "/app/ofertas/envios", group: "Campanhas" },
        { id: "ofertas-agendamentos", title: "Agendamentos", path: "/app/ofertas/agendamentos", group: "Campanhas" },
      ],
    },
    {
      group: "CRM",
      pages: [
        { id: "ofertas-contatos", title: "Contatos", path: "/app/ofertas/contatos", group: "CRM" },
        { id: "ofertas-unidades", title: "Unidades", path: "/app/ofertas/unidades", group: "CRM" },
        { id: "ofertas-segmentos", title: "Segmentos", path: "/app/ofertas/segmentos", group: "CRM" },
        { id: "ofertas-optouts", title: "Opt-outs", path: "/app/ofertas/optouts", group: "CRM" },
      ],
    },
    {
      group: "Relatórios",
      pages: [
        { id: "ofertas-rel-campanhas", title: "Campanhas", path: "/app/ofertas/relatorios/campanhas", group: "Relatórios" },
        { id: "ofertas-rel-crm", title: "CRM", path: "/app/ofertas/relatorios/crm", group: "Relatórios" },
        { id: "ofertas-rel-crescimento", title: "Crescimento", path: "/app/ofertas/relatorios/crescimento", group: "Relatórios" },
        { id: "ofertas-rel-exportacoes", title: "Exportações", path: "/app/ofertas/relatorios/exportacoes", group: "Relatórios" },
      ],
    },
    {
      group: "Sistema",
      pages: [
        { id: "ofertas-usuarios", title: "Usuários", path: "/app/ofertas/usuarios", group: "Sistema" },
        { id: "ofertas-config", title: "Configurações", path: "/app/ofertas/configuracoes", group: "Sistema" },
      ],
    },
  ],
};

const pmo: ModuleDefinition = {
  id: "pmo",
  label: "Tech / PMO",
  groups: [
    {
      group: "Controle",
      pages: [
        { id: "pmo-overview", title: "Dashboard", path: "/app/tech", group: "Controle" },
        { id: "pmo-roadmap-estrategico", title: "Roadmap Estratégico", path: "/app/tech/pdi-cronograma", group: "Controle" },
      ],
    },
    {
      group: "Backlog",
      pages: [
        { id: "pmo-backlog", title: "Iniciativas", path: "/app/tech/backlog", group: "Backlog" },
        { id: "pmo-sprints", title: "Sprints", path: "/app/tech/sprints", group: "Backlog" },
      ],
    },
    {
      group: "Operação",
      pages: [
        { id: "pmo-suporte", title: "Suporte & SLA", path: "/app/tech/suporte", group: "Operação" },
        { id: "pmo-imersoes", title: "Imersões", path: "/app/tech/imersoes", group: "Operação" },
        { id: "pmo-agenda", title: "Agenda", path: "/app/tech/agenda", group: "Operação" },
      ],
    },
    {
      group: "Entregas",
      pages: [
        { id: "pmo-releases", title: "Releases", path: "/app/tech/releases", group: "Entregas" },
        { id: "pmo-indicadores", title: "Indicadores", path: "/app/tech/indicadores", group: "Entregas" },
        { id: "pmo-wbr", title: "Dashboard Semanal", path: "/app/tech/dashboard-semanal", group: "Entregas" },
      ],
    },
    {
      group: "Governança",
      pages: [
        { id: "pmo-ritos", title: "Ritos", path: "/app/tech/ritos", group: "Governança" },
        { id: "pmo-governanca", title: "Aprovações & Decisões", path: "/app/tech/governanca", group: "Governança" },
        { id: "pmo-qbr", title: "Revisões Trimestrais", path: "/app/tech/revisoes-trimestrais", group: "Governança" },
      ],
    },
    {
      group: "Pessoas",
      pages: [
        { id: "pmo-donos", title: "BPOs & Responsáveis", path: "/app/tech/donos-internos", group: "Pessoas" },
        { id: "pmo-capacitacao", title: "Capacitação", path: "/app/tech/capacitacao", group: "Pessoas" },
      ],
    },
    {
      group: "Admin",
      pages: [
        { id: "pmo-infra", title: "Infra & Custos", path: "/app/tech/infra", group: "Admin" },
        { id: "pmo-config", title: "Configurações", path: "/app/tech/config", group: "Admin" },
      ],
    },
  ],
};

const cd: ModuleDefinition = {
  id: "cd",
  label: "CD",
  groups: [
    {
      group: "Controle",
      pages: [
        { id: "cd-dashboard", title: "Dashboard", path: "/app/cd", group: "Controle" },
        { id: "cd-alertas", title: "Alertas", path: "/app/cd/alertas", group: "Controle" },
      ],
    },
    {
      group: "Recebimento",
      pages: [
        { id: "cd-agenda", title: "Agenda", path: "/app/cd/recebimento/agenda", group: "Recebimento" },
        { id: "cd-conferencia", title: "Conferência", path: "/app/cd/recebimento/conferencia", group: "Recebimento" },
        { id: "cd-nao-conformidades", title: "Não Conformidades", path: "/app/cd/recebimento/nao-conformidades", group: "Recebimento" },
      ],
    },
    {
      group: "Armazenagem",
      pages: [
        { id: "cd-mapa", title: "Mapa do Armazém", path: "/app/cd/armazenagem/mapa", group: "Armazenagem" },
        { id: "cd-contagem", title: "Contagem Cíclica", path: "/app/cd/armazenagem/contagem", group: "Armazenagem" },
        { id: "cd-lotes", title: "Lotes", path: "/app/cd/armazenagem/lotes", group: "Armazenagem" },
      ],
    },
    {
      group: "Demanda",
      pages: [
        { id: "cd-reposicao", title: "Reposição", path: "/app/cd/demanda/reposicao", group: "Demanda" },
        { id: "cd-rupturas", title: "Projeção de Rupturas", path: "/app/cd/demanda/rupturas", group: "Demanda" },
        { id: "cd-abc", title: "Curva ABC", path: "/app/cd/demanda/abc", group: "Demanda" },
      ],
    },
    {
      group: "Separação",
      pages: [
        { id: "cd-ordens", title: "Ordens", path: "/app/cd/separacao/ordens", group: "Separação" },
        { id: "cd-waves", title: "Waves", path: "/app/cd/separacao/waves", group: "Separação" },
        { id: "cd-picking", title: "Picking", path: "/app/cd/separacao/picking", group: "Separação" },
      ],
    },
    {
      group: "Expedição",
      pages: [
        { id: "cd-romaneios", title: "Romaneios", path: "/app/cd/expedicao/romaneios", group: "Expedição" },
      ],
    },
    {
      group: "Qualidade",
      pages: [
        { id: "cd-perdas", title: "Perdas", path: "/app/cd/qualidade/perdas", group: "Qualidade" },
        { id: "cd-shrink", title: "Shrink Rate", path: "/app/cd/qualidade/shrink", group: "Qualidade" },
      ],
    },
    {
      group: "Lojas",
      pages: [
        { id: "cd-painel-loja", title: "Painel da Loja", path: "/app/cd/lojas/painel", group: "Lojas" },
      ],
    },
    {
      group: "Executivo",
      pages: [
        { id: "cd-clevel", title: "Painel C-Level", path: "/app/cd/executivo/painel", group: "Executivo" },
      ],
    },
    {
      group: "Importação",
      pages: [
        { id: "cd-importar", title: "Importar Dados", path: "/app/cd/importacao", group: "Importação" },
      ],
    },
  ],
};

const cliente: ModuleDefinition = {
  id: "cliente",
  label: "Cliente",
  groups: [
    {
      group: "Controle",
      pages: [
        { id: "cli-dashboard", title: "Dashboard", path: "/app/cliente", group: "Controle" },
      ],
    },
    {
      group: "Clientes",
      pages: [
        { id: "cli-base", title: "Base de Clientes", path: "/app/cliente/clientes", group: "Clientes" },
        { id: "cli-segmentacao", title: "Segmentação", path: "/app/cliente/segmentacao", group: "Clientes" },
      ],
    },
    {
      group: "Experiência",
      pages: [
        { id: "cli-nps", title: "NPS & Pesquisas", path: "/app/cliente/nps", group: "Experiência" },
        { id: "cli-satisfacao", title: "Satisfação", path: "/app/cliente/satisfacao", group: "Experiência" },
      ],
    },
    {
      group: "Atendimento",
      pages: [
        { id: "cli-tickets", title: "Tickets", path: "/app/cliente/tickets", group: "Atendimento" },
        { id: "cli-sac", title: "SAC", path: "/app/cliente/sac", group: "Atendimento" },
      ],
    },
    {
      group: "Relatórios",
      pages: [
        { id: "cli-relatorios", title: "Relatórios", path: "/app/cliente/relatorios", group: "Relatórios" },
      ],
    },
  ],
};

const compras: ModuleDefinition = {
  id: "compras",
  label: "Compras",
  groups: [
    {
      group: "Controle",
      pages: [
        { id: "compras-dashboard", title: "Dashboard Executivo", path: "/app/compras", group: "Controle" },
        { id: "compras-alertas", title: "Alertas", path: "/app/compras/alertas", group: "Controle" },
      ],
    },
    {
      group: "Fornecedores",
      pages: [
        { id: "compras-scorecard", title: "Scorecard", path: "/app/compras/fornecedores/scorecard", group: "Fornecedores" },
        { id: "compras-base", title: "Base de Fornecedores", path: "/app/compras/fornecedores", group: "Fornecedores" },
      ],
    },
    {
      group: "Ordens de Compra",
      pages: [
        { id: "compras-pipeline", title: "Pipeline de OCs", path: "/app/compras/ordens", group: "Ordens de Compra" },
        { id: "compras-calculadora", title: "Calculadora de OC", path: "/app/compras/ordens/nova", group: "Ordens de Compra" },
      ],
    },
    {
      group: "Verba Comercial",
      pages: [
        { id: "compras-verbas", title: "Painel de Verbas", path: "/app/compras/verbas", group: "Verba Comercial" },
      ],
    },
    {
      group: "Análise",
      pages: [
        { id: "compras-gmroi", title: "GMROI (Matriz)", path: "/app/compras/gmroi", group: "Análise" },
        { id: "compras-demanda", title: "Demanda & Previsão", path: "/app/compras/demanda", group: "Análise" },
        { id: "compras-cta", title: "CTA", path: "/app/compras/cta", group: "Análise" },
      ],
    },
    {
      group: "Financeiro",
      pages: [
        { id: "compras-financeiro", title: "Painel Financeiro", path: "/app/compras/financeiro", group: "Financeiro" },
      ],
    },
    {
      group: "Importação",
      pages: [
        { id: "compras-importar", title: "Importar Dados", path: "/app/compras/importacao", group: "Importação" },
      ],
    },
  ],
};

const financeiro: ModuleDefinition = {
  id: "financeiro",
  label: "Financeiro",
  groups: [
    {
      group: "Dashboard",
      pages: [
        { id: "fin-dashboard", title: "Painel Executivo C-Level", path: "/app/financeiro", group: "Dashboard" },
      ],
    },
    {
      group: "DRE Gerencial",
      pages: [
        { id: "fin-dre-rede", title: "DRE Rede", path: "/app/financeiro/dre/rede", group: "DRE Gerencial" },
        { id: "fin-dre-loja", title: "DRE Loja", path: "/app/financeiro/dre/loja", group: "DRE Gerencial" },
      ],
    },
    {
      group: "Capital de Giro",
      pages: [
        { id: "fin-capital-giro", title: "Painel CCC/NCG", path: "/app/financeiro/capital-giro", group: "Capital de Giro" },
      ],
    },
    {
      group: "Margem por Categoria",
      pages: [
        { id: "fin-margem", title: "Ranking IMC", path: "/app/financeiro/margem-categoria", group: "Margem por Categoria" },
      ],
    },
    {
      group: "Projeção",
      pages: [
        { id: "fin-projecao", title: "Resultado 30/60/90d", path: "/app/financeiro/projecao", group: "Projeção" },
      ],
    },
    {
      group: "Custos Operacionais",
      pages: [
        { id: "fin-custos", title: "Análise de Custos", path: "/app/financeiro/custos", group: "Custos Operacionais" },
        { id: "fin-pe", title: "Ponto de Equilíbrio", path: "/app/financeiro/ponto-equilibrio", group: "Custos Operacionais" },
      ],
    },
    {
      group: "ROIC",
      pages: [
        { id: "fin-roic", title: "Retorno sobre Capital", path: "/app/financeiro/roic", group: "ROIC" },
      ],
    },
    {
      group: "Configuração",
      pages: [
        { id: "fin-despesas-metas", title: "Despesas & Metas", path: "/app/financeiro/config/despesas-metas", group: "Configuração" },
        { id: "fin-config", title: "Config. Financeira", path: "/app/financeiro/config/geral", group: "Configuração" },
      ],
    },
  ],
};

const loja: ModuleDefinition = {
  id: "loja",
  label: "Loja",
  groups: [
    {
      group: "Dashboard",
      pages: [
        { id: "loja-dashboard", title: "Painel Executivo da Loja", path: "/app/loja", group: "Dashboard" },
      ],
    },
    {
      group: "Rentabilidade por Espaço",
      pages: [
        { id: "loja-rentabilidade", title: "Mapa de Calor / IPE", path: "/app/loja/rentabilidade", group: "Rentabilidade por Espaço" },
      ],
    },
    {
      group: "Precificação",
      pages: [
        { id: "loja-precificacao", title: "Painel de Markup & IAP", path: "/app/loja/precificacao", group: "Precificação" },
        { id: "loja-historico-preco", title: "Histórico de Preço", path: "/app/loja/historico-preco", group: "Precificação" },
      ],
    },
    {
      group: "Perdas Operacionais",
      pages: [
        { id: "loja-perdas", title: "Painel de Perdas", path: "/app/loja/perdas", group: "Perdas Operacionais" },
        { id: "loja-registro-perda", title: "Registro de Perda", path: "/app/loja/perdas/registro", group: "Perdas Operacionais" },
      ],
    },
    {
      group: "Comparativo entre Lojas",
      pages: [
        { id: "loja-comparativo", title: "Ranking & IPC", path: "/app/loja/comparativo", group: "Comparativo entre Lojas" },
      ],
    },
    {
      group: "Alertas",
      pages: [
        { id: "loja-alertas", title: "Central de Alertas", path: "/app/loja/alertas", group: "Alertas" },
      ],
    },
    {
      group: "Configuração",
      pages: [
        { id: "loja-setup", title: "Setup de Loja", path: "/app/loja/config/setup", group: "Configuração" },
        { id: "loja-simulador", title: "Simulador de Layout", path: "/app/loja/config/simulador", group: "Configuração" },
      ],
    },
  ],
};

const sorteios: ModuleDefinition = {
  id: "sorteios",
  label: "Sorteios",
  groups: [
    {
      group: "Principal",
      pages: [
        { id: "sorteios-dashboard", title: "Dashboard", path: "/app/sorteios", group: "Principal" },
      ],
    },
    {
      group: "Gestão",
      pages: [
        { id: "sorteios-campanhas", title: "Campanhas", path: "/app/sorteios/campanhas", group: "Gestão" },
        { id: "sorteios-participantes", title: "Participantes", path: "/app/sorteios/participantes", group: "Gestão" },
        { id: "sorteios-cupons", title: "Cupons", path: "/app/sorteios/cupons", group: "Gestão" },
      ],
    },
    {
      group: "Segurança",
      pages: [
        { id: "sorteios-fraudes", title: "Logs de Fraude", path: "/app/sorteios/fraudes", group: "Segurança" },
      ],
    },
  ],
};

export const APP_PAGES_REGISTRY: Record<string, AppDefinition> = {
  marketing: marketing,
  trade: trade,
  ofertas: ofertas,
  pmo: pmo,
  cd: cd,
  cliente: cliente,
  compras: compras,
  financeiro: financeiro,
  loja: loja,
  sorteios: sorteios,
};

/** @deprecated Use APP_PAGES_REGISTRY */
export const MODULE_PAGES_REGISTRY = APP_PAGES_REGISTRY;

/** Get all paths for an app */
export function getAllPathsForApp(appId: string): string[] {
  const def = APP_PAGES_REGISTRY[appId];
  if (!def) return [];
  return def.groups.flatMap(g => g.pages.map(p => p.path));
}

/** @deprecated Use getAllPathsForApp */
export const getAllPathsForModule = getAllPathsForApp;

/** Check if a path is allowed given a pages_allowed config */
export function isPathAllowed(
  pagesAllowed: Record<string, string[] | null> | null,
  appId: string,
  path: string
): boolean {
  if (!pagesAllowed) return true;
  const appPaths = pagesAllowed[appId];
  if (appPaths === undefined || appPaths === null) return true;
  if (appPaths.length === 0) return false;
  return appPaths.includes(path);
}
