/**
 * App Routes Registry
 * 
 * Centralized route definitions for each app, used by the
 * EmbeddedNavigationContext to create MemoryRouter routes.
 * 
 * To add routes for a new app:
 *   1. Add a new entry to APP_ROUTE_CONFIGS with the appId as key
 *   2. Define all navigable paths relative to the app's basePath
 *   3. Each route needs a lazy loader function
 */

import React from "react";
import { APP_PATHS } from "@/config/route-paths";

export interface AppRouteDefinition {
  path: string;
  loader: () => Promise<{ default: React.ComponentType<any> }>;
}

export interface AppRouteConfig {
  basePath: string;
  routes: AppRouteDefinition[];
}

export const APP_ROUTE_CONFIGS: Record<string, AppRouteConfig> = {

  // ═══════════════════════════════════════════════════
  // Marketing (marketing)
  // ═══════════════════════════════════════════════════
  marketing: {
    basePath: APP_PATHS.marketing,
    routes: [
      { path: '', loader: () => import('@/pages/marketing/Index') },
      { path: 'dashboard', loader: () => import('@/pages/marketing/Index') },
      { path: 'demandas', loader: () => import('@/pages/marketing/Demandas') },
      { path: 'demandas/nova', loader: () => import('@/pages/marketing/NovaDemanda') },
      { path: 'demandas/:id', loader: () => import('@/pages/marketing/DemandaDetalhe') },
      { path: 'demandas/:id/responder', loader: () => import('@/pages/marketing/MinhaDemanda') },
      { path: 'demandas/editar/:id', loader: () => import('@/pages/marketing/EditarDemanda') },
      { path: 'campanhas', loader: () => import('@/pages/marketing/Campanhas') },
      { path: 'campanhas/nova', loader: () => import('@/pages/marketing/CampanhaNova') },
      { path: 'campanhas/:id', loader: () => import('@/pages/marketing/CampaignDetalhe') },
      { path: 'campanhas/:id/editar', loader: () => import('@/pages/marketing/CampanhaEditar') },
      { path: 'documentos', loader: () => import('@/pages/marketing/Documentos') },
      { path: 'documentos/:pageId', loader: () => import('@/pages/marketing/DocumentoEditor') },
      { path: 'planejamento', loader: () => import('@/pages/marketing/Planejamento') },
      { path: 'financeiro', loader: () => import('@/pages/marketing/Financeiro') },
      { path: 'financeiro/orcamento', loader: () => import('@/pages/marketing/financeiro/Orcamento') },
      { path: 'financeiro/fechamento', loader: () => import('@/pages/marketing/financeiro/Fechamento') },
      { path: 'financeiro/conciliacao', loader: () => import('@/pages/marketing/financeiro/Conciliacao') },
      { path: 'financeiro/relatorios', loader: () => import('@/pages/marketing/financeiro/RelatoriosFinanceiros') },
      { path: 'trade', loader: () => import('@/pages/marketing/Trade') },
      { path: 'kpis', loader: () => import('@/pages/marketing/KPIs') },
      { path: 'kpis/novo', loader: () => import('@/pages/marketing/NovoKPI') },
      { path: 'lojas', loader: () => import('@/pages/marketing/Lojas') },
      { path: 'agencia/entregas', loader: () => import('@/pages/marketing/agencia/Entregas') },
      { path: 'agencia/briefings', loader: () => import('@/pages/marketing/agencia/Briefings') },
      { path: 'agencia/aprovacoes', loader: () => import('@/pages/marketing/agencia/Aprovacoes') },
      { path: 'agencia/sla', loader: () => import('@/pages/marketing/agencia/SlaPerformance') },
      { path: 'agencia/financeiro', loader: () => import('@/pages/marketing/agencia/AgenciaFinanceiro') },
      { path: 'equipe/quadro', loader: () => import('@/pages/marketing/equipe/QuadroDaEquipe') },
      { path: 'equipe/desempenho', loader: () => import('@/pages/marketing/equipe/Desempenho') },
      { path: 'equipe/capacitacao', loader: () => import('@/pages/marketing/equipe/Capacitacao') },
      { path: 'equipe/alocacao', loader: () => import('@/pages/marketing/equipe/Alocacao') },
      { path: 'equipe/visao-geral', loader: () => import('@/pages/marketing/equipe/VisaoGeral') },
      { path: 'equipe/social-media', loader: () => import('@/pages/marketing/equipe/SocialMedia') },
      { path: 'equipe/trafego', loader: () => import('@/pages/marketing/equipe/Trafego') },
      { path: 'equipe/design', loader: () => import('@/pages/marketing/equipe/Design') },
      { path: 'equipe/copywriter', loader: () => import('@/pages/marketing/equipe/Copywriter') },
      { path: 'equipe/videomaker', loader: () => import('@/pages/marketing/equipe/Videomaker') },
      { path: 'analise/visao-unificada', loader: () => import('@/pages/marketing/analise/VisaoUnificada') },
      { path: 'atividade', loader: () => import('@/pages/marketing/Atividade') },
      { path: 'alertas', loader: () => import('@/pages/marketing/Alertas') },
      { path: 'operacao', loader: () => import('@/pages/marketing/Operacao') },
      { path: 'experimentos', loader: () => import('@/pages/marketing/Experimentos') },
      { path: 'experimentos/:id', loader: () => import('@/pages/marketing/ExperimentoDetalhe') },
      { path: 'experimentos/novo', loader: () => import('@/pages/marketing/NovoExperimento') },
      { path: 'acoes-comerciais', loader: () => import('@/pages/marketing/AcoesComerciais') },
      { path: 'acoes-comerciais/:id', loader: () => import('@/pages/marketing/AcaoComercialDetalhe') },
      { path: 'acoes-comerciais/nova', loader: () => import('@/pages/marketing/NovaAcaoComercial') },
      { path: 'minha-loja', loader: () => import('@/pages/marketing/MinhaLoja') },
      { path: 'execucao', loader: () => import('@/pages/marketing/execution/ExecutionHub') },
      { path: 'execucao/:retailActionId', loader: () => import('@/pages/marketing/execution/ActionExecution') },
    ],
  },

  // ═══════════════════════════════════════════════════
  // Tech (pmo)
  // ═══════════════════════════════════════════════════
  pmo: {
    basePath: APP_PATHS.pmo,
    routes: [
      { path: '', loader: () => import('@/pages/pmo/Index') },
      { path: 'pmo-dashboard', loader: () => import('@/pages/pmo/Index') },
      { path: 'pdi-cronograma', loader: () => import('@/pages/pmo/PDICronograma') },
      { path: 'cronograma', loader: () => import('@/pages/pmo/Cronograma') },
      { path: 'roadmap', loader: () => import('@/pages/pmo/Roadmap') },
      { path: 'backlog', loader: () => import('@/pages/pmo/Backlog') },
      { path: 'sprints', loader: () => import('@/pages/pmo/Sprints') },
      { path: 'relatorios', loader: () => import('@/pages/pmo/ReportsCockpit') },
      { path: 'indicadores', loader: () => import('@/pages/pmo/Indicadores') },
      { path: 'releases', loader: () => import('@/pages/pmo/Releases') },
      { path: 'capacitacao', loader: () => import('@/pages/pmo/Capacitacao') },
      { path: 'donos-internos', loader: () => import('@/pages/pmo/DonosInternos') },
      { path: 'suporte', loader: () => import('@/pages/pmo/Suporte') },
      { path: 'imersoes', loader: () => import('@/pages/pmo/Imersoes') },
      { path: 'agenda', loader: () => import('@/pages/pmo/Agenda') },
      { path: 'dashboard-semanal', loader: () => import('@/pages/pmo/DashboardSemanal') },
      { path: 'revisoes-trimestrais', loader: () => import('@/pages/pmo/RevisoesTrimestrais') },
      { path: 'ritos', loader: () => import('@/pages/pmo/Ritos') },
      { path: 'governanca', loader: () => import('@/pages/pmo/Governanca') },
      { path: 'infra', loader: () => import('@/pages/pmo/Infra') },
      { path: 'config', loader: () => import('@/pages/pmo/Config') },
    ],
  },

  // ═══════════════════════════════════════════════════
  // Ofertas (ofertas)
  // ═══════════════════════════════════════════════════
  ofertas: {
    basePath: APP_PATHS.ofertas,
    routes: [
      { path: '', loader: () => import('@/pages/ofertas/Index') },
      { path: 'ofertas-dashboard', loader: () => import('@/pages/ofertas/Index') },
      { path: 'campanhas', loader: () => import('@/pages/Campanhas') },
      { path: 'templates', loader: () => import('@/pages/homebroker/Templates') },
      { path: 'envios', loader: () => import('@/pages/homebroker/Envios') },
      { path: 'agendamentos', loader: () => import('@/pages/homebroker/Agendamentos') },
      { path: 'contatos', loader: () => import('@/pages/Contatos') },
      { path: 'unidades', loader: () => import('@/pages/Unidades') },
      { path: 'segmentos', loader: () => import('@/pages/crm/Segmentos') },
      { path: 'optouts', loader: () => import('@/pages/crm/OptOuts') },
      { path: 'relatorios/campanhas', loader: () => import('@/pages/dashboard/RelatorioCampanhas') },
      { path: 'relatorios/crm', loader: () => import('@/pages/dashboard/RelatorioCRM') },
      { path: 'relatorios/crescimento', loader: () => import('@/pages/dashboard/Crescimento') },
      { path: 'relatorios/exportacoes', loader: () => import('@/pages/Relatorios') },
    ],
  },

  // ═══════════════════════════════════════════════════
  // Trade (trade)
  // ═══════════════════════════════════════════════════
  trade: {
    basePath: APP_PATHS.trade,
    routes: [
      { path: '', loader: () => import('@/pages/trade/HomeInternal') },
      { path: 'trade-dashboard', loader: () => import('@/pages/trade/HomeInternal') },
      { path: 'pacotes', loader: () => import('@/pages/trade/Pacotes') },
      { path: 'pacotes/:packageId', loader: () => import('@/pages/trade/PacoteDetail') },
      { path: 'fornecedores', loader: () => import('@/pages/trade/Fornecedores') },
      { path: 'fornecedores/:supplierId', loader: () => import('@/pages/trade/FornecedorDetail') },
      { path: 'contratos', loader: () => import('@/pages/trade/ContratosTrade') },
      { path: 'checklists', loader: () => import('@/pages/trade/Checklists') },
      { path: 'checklists/:checklistId', loader: () => import('@/pages/trade/ChecklistDetail') },
      { path: 'comprovacoes', loader: () => import('@/pages/trade/Comprovacoes') },
      { path: 'calendario', loader: () => import('@/pages/trade/CalendarioTrade') },
      { path: 'performance', loader: () => import('@/pages/trade/PerformanceTrade') },
      { path: 'roi', loader: () => import('@/pages/trade/ROITrade') },
      { path: 'relatorios', loader: () => import('@/pages/trade/RelatoriosTrade') },
      { path: 'alertas', loader: () => import('@/pages/trade/AlertasTrade') },
    ],
  },

  // ═══════════════════════════════════════════════════
  // RH (rh)
  // ═══════════════════════════════════════════════════
  rh: {
    basePath: APP_PATHS.rh,
    routes: [
      { path: '', loader: () => import('@/pages/rh/Index') },
      { path: 'rh-dashboard', loader: () => import('@/pages/rh/Index') },
      { path: 'colaboradores', loader: () => import('@/pages/rh/Colaboradores') },
      { path: 'colaboradores/novo', loader: () => import('@/pages/rh/NovoColaborador') },
      { path: 'colaboradores/:id', loader: () => import('@/pages/rh/ColaboradorDetail') },
      { path: 'ponto', loader: () => import('@/pages/rh/Ponto') },
      { path: 'ferias', loader: () => import('@/pages/rh/Ferias') },
      { path: 'avaliacoes', loader: () => import('@/pages/rh/Avaliacoes') },
      { path: 'avaliacoes/:id', loader: () => import('@/pages/rh/AvaliacaoDetalhe') },
      { path: 'recrutamento', loader: () => import('@/pages/rh/Recrutamento') },
      { path: 'relatorios', loader: () => import('@/pages/rh/Relatorios') },
    ],
  },

  // ═══════════════════════════════════════════════════
  // Domínio (dominio)
  // ═══════════════════════════════════════════════════
  dominio: {
    basePath: APP_PATHS.dominio,
    routes: [
      { path: 'executivo/dashboard', loader: () => import('@/pages/dominio/executivo/Dashboard') },
      { path: 'executivo/unidades', loader: () => import('@/pages/dominio/executivo/Unidades') },
      { path: 'executivo/alertas', loader: () => import('@/pages/dominio/executivo/Alertas') },
      { path: 'executivo/metas', loader: () => import('@/pages/dominio/executivo/Metas') },
      { path: 'vendas/visao-geral', loader: () => import('@/pages/dominio/vendas/VisaoGeral') },
      { path: 'vendas/por-unidade', loader: () => import('@/pages/dominio/vendas/PorUnidade') },
      { path: 'vendas/por-categoria', loader: () => import('@/pages/dominio/vendas/PorCategoria') },
      { path: 'vendas/ticket-mix', loader: () => import('@/pages/dominio/vendas/TicketMix') },
      { path: 'vendas/evolucao', loader: () => import('@/pages/dominio/vendas/Evolucao') },
      { path: 'financeiro/resultado', loader: () => import('@/pages/dominio/financeiro/Resultado') },
      { path: 'financeiro/caixa', loader: () => import('@/pages/dominio/financeiro/Caixa') },
      { path: 'financeiro/apagar-areceber', loader: () => import('@/pages/dominio/financeiro/APagarAReceber') },
      { path: 'financeiro/despesas', loader: () => import('@/pages/dominio/financeiro/Despesas') },
      { path: 'financeiro/impostos', loader: () => import('@/pages/dominio/financeiro/Impostos') },
      { path: 'problemas/radar', loader: () => import('@/pages/dominio/problemas/Radar') },
      { path: 'problemas/perdas', loader: () => import('@/pages/dominio/problemas/Perdas') },
      { path: 'problemas/preco-margem', loader: () => import('@/pages/dominio/problemas/PrecoMargem') },
      { path: 'problemas/estoque-diferencas', loader: () => import('@/pages/dominio/problemas/EstoqueDiferencas') },
      { path: 'problemas/pendencias', loader: () => import('@/pages/dominio/problemas/Pendencias') },
      { path: 'unidades/visao-geral', loader: () => import('@/pages/dominio/unidades/VisaoGeral') },
      { path: 'unidades/por-unidade', loader: () => import('@/pages/dominio/unidades/PorUnidade') },
      { path: 'unidades/produtividade', loader: () => import('@/pages/dominio/unidades/Produtividade') },
      { path: 'unidades/atencoes', loader: () => import('@/pages/dominio/unidades/Atencoes') },
      { path: 'produtos/catalogo', loader: () => import('@/pages/dominio/produtos/Catalogo') },
      { path: 'produtos/ruptura', loader: () => import('@/pages/dominio/produtos/Ruptura') },
      { path: 'produtos/giro-cobertura', loader: () => import('@/pages/dominio/produtos/GiroCobertura') },
      { path: 'produtos/preco-margem', loader: () => import('@/pages/dominio/produtos/PrecoMargem') },
      { path: 'produtos/perdas', loader: () => import('@/pages/dominio/produtos/Perdas') },
      { path: 'compras/fornecedores', loader: () => import('@/pages/dominio/compras/Fornecedores') },
      { path: 'compras/periodo', loader: () => import('@/pages/dominio/compras/Periodo') },
      { path: 'compras/condicoes', loader: () => import('@/pages/dominio/compras/Condicoes') },
      { path: 'compras/entregas', loader: () => import('@/pages/dominio/compras/Entregas') },
      { path: 'compras/risco', loader: () => import('@/pages/dominio/compras/Risco') },
      { path: 'pessoas/equipe', loader: () => import('@/pages/dominio/pessoas/Equipe') },
      { path: 'pessoas/custo', loader: () => import('@/pages/dominio/pessoas/Custo') },
      { path: 'pessoas/faltas-atrasos', loader: () => import('@/pages/dominio/pessoas/FaltasAtrasos') },
      { path: 'pessoas/entradas-saidas', loader: () => import('@/pages/dominio/pessoas/EntradasSaidas') },
      { path: 'pessoas/lideres-times', loader: () => import('@/pages/dominio/pessoas/LideresTimes') },
      { path: 'inteligencia/insights', loader: () => import('@/pages/dominio/inteligencia/Insights') },
      { path: 'inteligencia/analises-ia', loader: () => import('@/pages/dominio/inteligencia/AnalisesIA') },
      { path: 'inteligencia/relatorios', loader: () => import('@/pages/dominio/inteligencia/Relatorios') },
    ],
  },

  // ═══════════════════════════════════════════════════
  // CD (cd)
  // ═══════════════════════════════════════════════════
  cd: {
    basePath: APP_PATHS.cd,
    routes: [
      { path: '', loader: () => import('@/pages/cd/Index') },
      { path: 'cd-dashboard', loader: () => import('@/pages/cd/Index') },
      { path: 'alertas', loader: () => import('@/pages/cd/Alertas') },
      { path: 'recebimento/agenda', loader: () => import('@/pages/cd/recebimento/Agenda') },
      { path: 'recebimento/conferencia', loader: () => import('@/pages/cd/recebimento/Conferencia') },
      { path: 'recebimento/nao-conformidades', loader: () => import('@/pages/cd/recebimento/NaoConformidades') },
      { path: 'recebimento/putaway', loader: () => import('@/pages/cd/recebimento/Putaway') },
      { path: 'armazenagem/mapa', loader: () => import('@/pages/cd/armazenagem/MapaArmazem') },
      { path: 'armazenagem/contagem', loader: () => import('@/pages/cd/armazenagem/ContagemCiclica') },
      { path: 'armazenagem/lotes', loader: () => import('@/pages/cd/armazenagem/Lotes') },
      { path: 'demanda/reposicao', loader: () => import('@/pages/cd/demanda/Reposicao') },
      { path: 'demanda/rupturas', loader: () => import('@/pages/cd/demanda/Rupturas') },
      { path: 'demanda/abc', loader: () => import('@/pages/cd/demanda/CurvaABC') },
      { path: 'separacao/ordens', loader: () => import('@/pages/cd/separacao/Ordens') },
      { path: 'separacao/waves', loader: () => import('@/pages/cd/separacao/Waves') },
      { path: 'separacao/picking', loader: () => import('@/pages/cd/separacao/Picking') },
      { path: 'expedicao/romaneios', loader: () => import('@/pages/cd/expedicao/Romaneios') },
      { path: 'qualidade/perdas', loader: () => import('@/pages/cd/qualidade/Perdas') },
      { path: 'qualidade/shrink', loader: () => import('@/pages/cd/qualidade/Shrink') },
      { path: 'lojas/painel', loader: () => import('@/pages/cd/lojas/PainelLoja') },
      { path: 'executivo/painel', loader: () => import('@/pages/cd/executivo/PainelCLevel') },
      { path: 'importacao', loader: () => import('@/pages/cd/importacao/Importacao') },
    ],
  },

  // ═══════════════════════════════════════════════════
  // Cliente (cliente)
  // ═══════════════════════════════════════════════════
  cliente: {
    basePath: APP_PATHS.cliente,
    routes: [
      { path: '', loader: () => import('@/pages/cliente/Index') },
      { path: 'cliente-dashboard', loader: () => import('@/pages/cliente/Index') },
      { path: 'clientes', loader: () => import('@/pages/cliente/PlaceholderPage') },
      { path: 'segmentacao', loader: () => import('@/pages/cliente/PlaceholderPage') },
      { path: 'nps', loader: () => import('@/pages/cliente/PlaceholderPage') },
      { path: 'satisfacao', loader: () => import('@/pages/cliente/PlaceholderPage') },
      { path: 'tickets', loader: () => import('@/pages/cliente/PlaceholderPage') },
      { path: 'sac', loader: () => import('@/pages/cliente/PlaceholderPage') },
      { path: 'relatorios', loader: () => import('@/pages/cliente/PlaceholderPage') },
    ],
  },

  // ═══════════════════════════════════════════════════
  // Compras (compras)
  // ═══════════════════════════════════════════════════
  compras: {
    basePath: APP_PATHS.compras,
    routes: [
      { path: '', loader: () => import('@/pages/compras/Index') },
      { path: 'compras-dashboard', loader: () => import('@/pages/compras/Index') },
      { path: 'alertas', loader: () => import('@/pages/compras/AlertsPage') },
      { path: 'fornecedores/scorecard', loader: () => import('@/pages/compras/SupplierScorecard') },
      { path: 'fornecedores', loader: () => import('@/pages/compras/PlaceholderPage') },
      { path: 'fornecedores/:id', loader: () => import('@/pages/compras/SupplierProfile') },
      { path: 'ordens', loader: () => import('@/pages/compras/POPipeline') },
      { path: 'ordens/nova', loader: () => import('@/pages/compras/POCalculator') },
      { path: 'verbas', loader: () => import('@/pages/compras/TradeAllowances') },
      { path: 'gmroi', loader: () => import('@/pages/compras/GmroiMatrix') },
      { path: 'demanda', loader: () => import('@/pages/compras/DemandAnalysis') },
      { path: 'cta', loader: () => import('@/pages/compras/CtaAnalysis') },
      { path: 'financeiro', loader: () => import('@/pages/compras/FinancialPanel') },
      { path: 'importacao', loader: () => import('@/pages/compras/ImportPage') },
    ],
  },

  // ═══════════════════════════════════════════════════
  // Financeiro (financeiro)
  // ═══════════════════════════════════════════════════
  financeiro: {
    basePath: APP_PATHS.financeiro,
    routes: [
      { path: '', loader: () => import('@/pages/financeiro/Index') },
      { path: 'fin-dashboard', loader: () => import('@/pages/financeiro/Index') },
      { path: 'dre/rede', loader: () => import('@/pages/financeiro/DRERedePage') },
      { path: 'dre/loja', loader: () => import('@/pages/financeiro/DRELojaPage') },
      { path: 'capital-giro', loader: () => import('@/pages/financeiro/CapitalGiroPage') },
      { path: 'margem-categoria', loader: () => import('@/pages/financeiro/MargemCategoriaPage') },
      { path: 'projecao', loader: () => import('@/pages/financeiro/ProjecaoPage') },
      { path: 'custos', loader: () => import('@/pages/financeiro/CustosPage') },
      { path: 'ponto-equilibrio', loader: () => import('@/pages/financeiro/PontoEquilibrioPage') },
      { path: 'roic', loader: () => import('@/pages/financeiro/ROICPage') },
      { path: 'config/despesas-metas', loader: () => import('@/pages/financeiro/ConfigDespesasMetasPage') },
      { path: 'config/geral', loader: () => import('@/pages/financeiro/ConfigGeralPage') },
    ],
  },

  // ═══════════════════════════════════════════════════
  // Loja (loja)
  // ═══════════════════════════════════════════════════
  loja: {
    basePath: APP_PATHS.loja,
    routes: [
      { path: '', loader: () => import('@/pages/loja/Index') },
      { path: 'loja-dashboard', loader: () => import('@/pages/loja/Index') },
      { path: 'rentabilidade', loader: () => import('@/pages/loja/RentabilidadePage') },
      { path: 'precificacao', loader: () => import('@/pages/loja/PrecificacaoPage') },
      { path: 'historico-preco', loader: () => import('@/pages/loja/HistoricoPrecoPage') },
      { path: 'perdas', loader: () => import('@/pages/loja/PerdasPage') },
      { path: 'perdas/registro', loader: () => import('@/pages/loja/RegistroPerdaPage') },
      { path: 'comparativo', loader: () => import('@/pages/loja/ComparativoPage') },
      { path: 'alertas', loader: () => import('@/pages/loja/AlertasPage') },
      { path: 'config/setup', loader: () => import('@/pages/loja/SetupLojaPage') },
      { path: 'config/simulador', loader: () => import('@/pages/loja/SimuladorLayoutPage') },
    ],
  },

  // ═══════════════════════════════════════════════════
  // Reposição (reposicao)
  // ═══════════════════════════════════════════════════
  reposicao: {
    basePath: APP_PATHS.reposicao,
    routes: [
      { path: '', loader: () => import('@/pages/reposicao/Index') },
      { path: 'repo-dashboard', loader: () => import('@/pages/reposicao/Index') },
      { path: 'gondolas', loader: () => import('@/pages/reposicao/Gondolas') },
      { path: 'tarefas', loader: () => import('@/pages/reposicao/Tarefas') },
      { path: 'rupturas', loader: () => import('@/pages/reposicao/Rupturas') },
      { path: 'validades', loader: () => import('@/pages/reposicao/Validades') },
      { path: 'relatorios', loader: () => import('@/pages/reposicao/Relatorios') },
    ],
  },

  // ═══════════════════════════════════════════════════
  // Sorteios (sorteios)
  // ═══════════════════════════════════════════════════
  sorteios: {
    basePath: APP_PATHS.sorteios,
    routes: [
      { path: '', loader: () => import('@/pages/sorteios/SorteiosDashboard') },
      { path: 'sorteios-dashboard', loader: () => import('@/pages/sorteios/SorteiosDashboard') },
      { path: 'campanhas', loader: () => import('@/pages/sorteios/SorteiosSweepstakes') },
      { path: 'campanhas/:id', loader: () => import('@/pages/sorteios/SorteiosSweepstakeDetail') },
      { path: 'participantes', loader: () => import('@/pages/sorteios/SorteiosParticipants') },
      { path: 'cupons', loader: () => import('@/pages/sorteios/SorteiosCoupons') },
      { path: 'fraudes', loader: () => import('@/pages/sorteios/SorteiosFraudLogs') },
    ],
  },

  // ═══════════════════════════════════════════════════
  // NexusIA (ia)
  // ═══════════════════════════════════════════════════
  ia: {
    basePath: APP_PATHS.ia,
    routes: [
      { path: '', loader: () => import('@/pages/ia/Index2') },
      { path: 'ia-chat', loader: () => import('@/pages/ia/Index2') },
    ],
  },
};

export function getAppRouteConfig(appId: string): AppRouteConfig | undefined {
  return APP_ROUTE_CONFIGS[appId];
}

/** @deprecated Use getAppRouteConfig */
export const getModuleRouteConfig = getAppRouteConfig;
