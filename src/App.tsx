import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalErrorHandler } from "@/components/GlobalErrorHandler";
import { AccessGate } from "@/components/guards/AccessGate";
import { ThemeProvider } from "next-themes";
import { RouteFallback } from "@/components/ui/loading-skeleton";
import { ForcePasswordChangeGuard } from "@/components/auth/ForcePasswordChangeGuard";
import { AgencyRouteGuard } from "@/components/guards/AgencyRouteGuard";
import { MaintenanceGate } from "@/components/guards/MaintenanceGate";

// Layouts (kept synchronous — they are the shell, must render instantly)
import { OfertasLayout } from "@/components/layout/workspace/OfertasLayout";
import { TradeInternalLayout } from "@/components/layout/workspace/TradeInternalLayout";
import { TradeSupplierLayout } from "@/components/layout/workspace/TradeSupplierLayout";
import { IALayout2 } from "@/components/layout/workspace/IALayout2";
import { IAEmbedLayout } from "@/components/layout/workspace/IAEmbedLayout";
import { MarketingLayout } from "@/components/layout/workspace/MarketingLayout";
import { RHLayout } from "@/components/layout/workspace/RHLayout";
import { ReposicaoLayout } from "@/components/layout/workspace/ReposicaoLayout";
import { DominioLayout } from "@/components/layout/workspace/DominioLayout";
import { PMOLayout } from "@/components/layout/workspace/PMOLayout";
import { CDLayout } from "@/components/layout/workspace/CDLayout";
import { ClienteLayout } from "@/components/layout/workspace/ClienteLayout";
import { ComprasLayout } from "@/components/layout/workspace/ComprasLayout";
import { FinanceiroLayout } from "@/components/layout/workspace/FinanceiroLayout";
import { LojaLayout } from "@/components/layout/workspace/LojaLayout";
import { SorteiosLayout } from "@/components/layout/workspace/SorteiosLayout";

// ===== LAZY-LOADED PAGES — ordered by hierarchy =====

// ── 3. Auth ──
const WorkspaceAuth = lazy(() => import("./pages/auth/WorkspaceAuth"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));

// ── 4. Landing Pages ──
const LandingPage = lazy(() => import("./pages/LandingPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// ── 5. Portal / Fornecedor ──
const WorkspacePortal = lazy(() => import("./pages/workspace/Portal"));
const SupplierPortal = lazy(() => import("./pages/workspace/SupplierPortal"));

// ── 6. NexusDesk — Engajamento ──
const NexusDeskPage = lazy(() => import("./pages/nexusdesk/Index"));
const PublicApplicationPage = lazy(() => import("./pages/nexusdesk/PublicApplication"));

// ── 7. NexusIA — Estratégico ──
const IAHome = lazy(() => import("./pages/ia/Index2"));
const SharedConversation = lazy(() => import("./pages/ia/SharedConversation"));

// ── 8. Domínio — Estratégico ──
const DashboardExecutivo = lazy(() => import("./pages/dominio/executivo/Dashboard"));
const UnidadesResumo = lazy(() => import("./pages/dominio/executivo/Unidades"));
const AlertasNegocio = lazy(() => import("./pages/dominio/executivo/Alertas"));
const MetasExecutivo = lazy(() => import("./pages/dominio/executivo/Metas"));
const VendasVisaoGeral = lazy(() => import("./pages/dominio/vendas/VisaoGeral"));
const VendasPorUnidade = lazy(() => import("./pages/dominio/vendas/PorUnidade"));
const VendasPorCategoria = lazy(() => import("./pages/dominio/vendas/PorCategoria"));
const VendasTicketMix = lazy(() => import("./pages/dominio/vendas/TicketMix"));
const VendasEvolucao = lazy(() => import("./pages/dominio/vendas/Evolucao"));
const FinanceiroResultado = lazy(() => import("./pages/dominio/financeiro/Resultado"));
const FinanceiroCaixa = lazy(() => import("./pages/dominio/financeiro/Caixa"));
const FinanceiroAPagarAReceber = lazy(() => import("./pages/dominio/financeiro/APagarAReceber"));
const FinanceiroDespesas = lazy(() => import("./pages/dominio/financeiro/Despesas"));
const FinanceiroImpostos = lazy(() => import("./pages/dominio/financeiro/Impostos"));
const ProblemasRadar = lazy(() => import("./pages/dominio/problemas/Radar"));
const ProblemasPerdas = lazy(() => import("./pages/dominio/problemas/Perdas"));
const ProblemasPrecoMargem = lazy(() => import("./pages/dominio/problemas/PrecoMargem"));
const ProblemasEstoque = lazy(() => import("./pages/dominio/problemas/EstoqueDiferencas"));
const ProblemasPendencias = lazy(() => import("./pages/dominio/problemas/Pendencias"));
const UnidadesVisaoGeral = lazy(() => import("./pages/dominio/unidades/VisaoGeral"));
const UnidadesPorUnidade = lazy(() => import("./pages/dominio/unidades/PorUnidade"));
const UnidadesProdutividade = lazy(() => import("./pages/dominio/unidades/Produtividade"));
const UnidadesAtencoes = lazy(() => import("./pages/dominio/unidades/Atencoes"));
const ProdutosCatalogo = lazy(() => import("./pages/dominio/produtos/Catalogo"));
const ProdutosRuptura = lazy(() => import("./pages/dominio/produtos/Ruptura"));
const ProdutosGiroCobertura = lazy(() => import("./pages/dominio/produtos/GiroCobertura"));
const ProdutosPrecoMargem = lazy(() => import("./pages/dominio/produtos/PrecoMargem"));
const ProdutosPerdas = lazy(() => import("./pages/dominio/produtos/Perdas"));
const ComprasFornecedores = lazy(() => import("./pages/dominio/compras/Fornecedores"));
const ComprasPeriodo = lazy(() => import("./pages/dominio/compras/Periodo"));
const ComprasCondicoes = lazy(() => import("./pages/dominio/compras/Condicoes"));
const ComprasEntregas = lazy(() => import("./pages/dominio/compras/Entregas"));
const ComprasRisco = lazy(() => import("./pages/dominio/compras/Risco"));
const PessoasEquipe = lazy(() => import("./pages/dominio/pessoas/Equipe"));
const PessoasCusto = lazy(() => import("./pages/dominio/pessoas/Custo"));
const PessoasFaltasAtrasos = lazy(() => import("./pages/dominio/pessoas/FaltasAtrasos"));
const PessoasEntradasSaidas = lazy(() => import("./pages/dominio/pessoas/EntradasSaidas"));
const PessoasLideresTimes = lazy(() => import("./pages/dominio/pessoas/LideresTimes"));
const InteligenciaInsights = lazy(() => import("./pages/dominio/inteligencia/Insights"));
const InteligenciaAnalisesIA = lazy(() => import("./pages/dominio/inteligencia/AnalisesIA"));
const InteligenciaRelatorios = lazy(() => import("./pages/dominio/inteligencia/Relatorios"));

// ── 9. Financeiro — Estratégico ──
const FinanceiroDashboard = lazy(() => import("./pages/financeiro/Index"));
const DRERedePage = lazy(() => import("./pages/financeiro/DRERedePage"));
const DRELojaPage = lazy(() => import("./pages/financeiro/DRELojaPage"));
const CapitalGiroPage = lazy(() => import("./pages/financeiro/CapitalGiroPage"));
const MargemCategoriaPage = lazy(() => import("./pages/financeiro/MargemCategoriaPage"));
const ProjecaoPage = lazy(() => import("./pages/financeiro/ProjecaoPage"));
const CustosPage = lazy(() => import("./pages/financeiro/CustosPage"));
const PontoEquilibrioPage = lazy(() => import("./pages/financeiro/PontoEquilibrioPage"));
const ROICPage = lazy(() => import("./pages/financeiro/ROICPage"));
const ConfigDespesasMetasPage = lazy(() => import("./pages/financeiro/ConfigDespesasMetasPage"));
const ConfigGeralPage = lazy(() => import("./pages/financeiro/ConfigGeralPage"));
const ManuaisFinanceiro = lazy(() => import("./pages/financeiro/ManuaisPage"));

// ── 10. Loja — Estratégico ──
const LojaDashboard = lazy(() => import("./pages/loja/Index"));
const LojaPlaceholder = lazy(() => import("./pages/loja/PlaceholderPage"));
const RentabilidadePage = lazy(() => import("./pages/loja/RentabilidadePage"));
const PrecificacaoPage = lazy(() => import("./pages/loja/PrecificacaoPage"));
const HistoricoPrecoPage = lazy(() => import("./pages/loja/HistoricoPrecoPage"));
const LojaPerdasPage = lazy(() => import("./pages/loja/PerdasPage"));
const RegistroPerdaPage = lazy(() => import("./pages/loja/RegistroPerdaPage"));
const ComparativoPage = lazy(() => import("./pages/loja/ComparativoPage"));
const AlertasPage = lazy(() => import("./pages/loja/AlertasPage"));
const SetupLojaPage = lazy(() => import("./pages/loja/SetupLojaPage"));
const SimuladorLayoutPage = lazy(() => import("./pages/loja/SimuladorLayoutPage"));

// ── 11. RH — Tático ──
const RHHome = lazy(() => import("./pages/rh/Index"));
const Colaboradores = lazy(() => import("./pages/rh/Colaboradores"));
const ColaboradorDetail = lazy(() => import("./pages/rh/ColaboradorDetail"));
const Ponto = lazy(() => import("./pages/rh/Ponto"));
const Ferias = lazy(() => import("./pages/rh/Ferias"));
const Avaliacoes = lazy(() => import("./pages/rh/Avaliacoes"));
const Recrutamento = lazy(() => import("./pages/rh/Recrutamento"));
const RelatoriosRH = lazy(() => import("./pages/rh/Relatorios"));

// ── 12. Marketing — Tático ──
const MarketingHome = lazy(() => import("./pages/marketing/Index"));
const Planejamento = lazy(() => import("./pages/marketing/Planejamento"));
const Documentos = lazy(() => import("./pages/marketing/Documentos"));
const DocumentoEditor = lazy(() => import("./pages/marketing/DocumentoEditor"));
const Financeiro = lazy(() => import("./pages/marketing/Financeiro"));
const OrcamentoFinanceiro = lazy(() => import("./pages/marketing/financeiro/Orcamento"));
const FechamentoMes = lazy(() => import("./pages/marketing/financeiro/Fechamento"));
const Conciliacao = lazy(() => import("./pages/marketing/financeiro/Conciliacao"));
const RelatoriosFinanceiros = lazy(() => import("./pages/marketing/financeiro/RelatoriosFinanceiros"));
const KPIs = lazy(() => import("./pages/marketing/KPIs"));
const RelatoriosGestao = lazy(() => import("./pages/marketing/Relatorios"));
const AlertasGestao = lazy(() => import("./pages/marketing/Alertas"));
const NovaDemanda = lazy(() => import("./pages/marketing/NovaDemanda"));
const EditarDemanda = lazy(() => import("./pages/marketing/EditarDemanda"));
const MinhaDemanda = lazy(() => import("./pages/marketing/MinhaDemanda"));
const DemandaDetalhe = lazy(() => import("./pages/marketing/DemandaDetalhe"));
const TradeGestao = lazy(() => import("./pages/marketing/Trade"));
const CampanhasGestao = lazy(() => import("./pages/marketing/Campanhas"));
const CampanhaNova = lazy(() => import("./pages/marketing/CampanhaNova"));
const CampaignDetalhe = lazy(() => import("./pages/marketing/CampaignDetalhe"));
const CampanhaEditar = lazy(() => import("./pages/marketing/CampanhaEditar"));
const LojasGestao = lazy(() => import("./pages/marketing/Lojas"));
const DemandasGestao = lazy(() => import("./pages/marketing/Demandas"));
const AgenciaGestao = lazy(() => import("./pages/marketing/Agencia"));
const AgenciaEntregas = lazy(() => import("./pages/marketing/agencia/Entregas"));
const AgenciaBriefings = lazy(() => import("./pages/marketing/agencia/Briefings"));
const AgenciaAprovacoes = lazy(() => import("./pages/marketing/agencia/Aprovacoes"));
const AgenciaSlaPerformance = lazy(() => import("./pages/marketing/agencia/SlaPerformance"));
const AgenciaFinanceiro = lazy(() => import("./pages/marketing/agencia/AgenciaFinanceiro"));
const RedesSociaisGestao = lazy(() => import("./pages/marketing/RedesSociais"));
const EquipeSocialMedia = lazy(() => import("./pages/marketing/equipe/SocialMedia"));
const EquipeTrafego = lazy(() => import("./pages/marketing/equipe/Trafego"));
const EquipeDesign = lazy(() => import("./pages/marketing/equipe/Design"));
const EquipeCopywriter = lazy(() => import("./pages/marketing/equipe/Copywriter"));
const EquipeVideomaker = lazy(() => import("./pages/marketing/equipe/Videomaker"));
const EquipeVisaoGeral = lazy(() => import("./pages/marketing/equipe/VisaoGeral"));
const EquipeQuadro = lazy(() => import("./pages/marketing/equipe/QuadroDaEquipe"));
const EquipeDesempenho = lazy(() => import("./pages/marketing/equipe/Desempenho"));
const EquipeCapacitacao = lazy(() => import("./pages/marketing/equipe/Capacitacao"));
const EquipeAlocacao = lazy(() => import("./pages/marketing/equipe/Alocacao"));
const VisaoUnificada = lazy(() => import("./pages/marketing/analise/VisaoUnificada"));
const AtividadeGestao = lazy(() => import("./pages/marketing/Atividade"));
const TemplatesHubGestao = lazy(() => import("./pages/marketing/TemplatesHub"));
const ExecucoesGestao = lazy(() => import("./pages/marketing/Execucoes"));
const ExecucaoDetalheGestao = lazy(() => import("./pages/marketing/ExecucaoDetalhe"));
const NovaExecucaoGestao = lazy(() => import("./pages/marketing/NovaExecucao"));
const OperacaoGestao = lazy(() => import("./pages/marketing/Operacao"));
const ExperimentosGestao = lazy(() => import("./pages/marketing/Experimentos"));
const ExperimentoDetalhe = lazy(() => import("./pages/marketing/ExperimentoDetalhe"));
const NovoExperimento = lazy(() => import("./pages/marketing/NovoExperimento"));
const ReportBuilderGestao = lazy(() => import("./pages/marketing/ReportBuilder"));
const GerarRelatorio = lazy(() => import("./pages/marketing/GerarRelatorio"));
const ReportPDFExport = lazy(() => import("./pages/marketing/ReportPDFExport"));
const AcoesComerciais = lazy(() => import("./pages/marketing/AcoesComerciais"));
const AcaoComercialDetalhe = lazy(() => import("./pages/marketing/AcaoComercialDetalhe"));
const NovaAcaoComercial = lazy(() => import("./pages/marketing/NovaAcaoComercial"));
const NovoKPI = lazy(() => import("./pages/marketing/NovoKPI"));
const NovaAcaoMarketing = lazy(() => import("./pages/marketing/NovaAcaoMarketing"));
const MinhaLojaGestao = lazy(() => import("./pages/marketing/MinhaLoja"));
const ExecutionHub = lazy(() => import("./pages/marketing/execution/ExecutionHub"));
const ActionExecution = lazy(() => import("./pages/marketing/execution/ActionExecution"));
const StoreChecklist = lazy(() => import("./pages/marketing/execution/StoreChecklist"));

// ── 13. Trade — Operacional ──
const TradeHomeInternal = lazy(() => import("./pages/trade/HomeInternal"));
const Pacotes = lazy(() => import("./pages/trade/Pacotes"));
const Fornecedores = lazy(() => import("./pages/trade/Fornecedores"));
const Checklists = lazy(() => import("./pages/trade/Checklists"));
const ChecklistDetail = lazy(() => import("./pages/trade/ChecklistDetail"));
const Comprovacoes = lazy(() => import("./pages/trade/Comprovacoes"));
const AlertasTrade = lazy(() => import("./pages/trade/AlertasTrade"));
const ContratosTrade = lazy(() => import("./pages/trade/ContratosTrade"));
const CalendarioTrade = lazy(() => import("./pages/trade/CalendarioTrade"));
const PerformanceTrade = lazy(() => import("./pages/trade/PerformanceTrade"));
const ROITrade = lazy(() => import("./pages/trade/ROITrade"));
const RelatoriosTrade = lazy(() => import("./pages/trade/RelatoriosTrade"));
const FornecedorDetail = lazy(() => import("./pages/trade/FornecedorDetail"));
const PacoteDetail = lazy(() => import("./pages/trade/PacoteDetail"));
const FornecedorHome = lazy(() => import("./pages/trade/fornecedor/Index"));
const FornecedorPacotes = lazy(() => import("./pages/trade/fornecedor/Pacotes"));
const FornecedorChecklist = lazy(() => import("./pages/trade/fornecedor/Checklist"));
const FornecedorComprovacoes = lazy(() => import("./pages/trade/fornecedor/Comprovacoes"));
const FornecedorRelatorios = lazy(() => import("./pages/trade/fornecedor/Relatorios"));
const FornecedorAjuda = lazy(() => import("./pages/trade/fornecedor/Ajuda"));

// ── 14. Cliente — Operacional ──
const ClienteHome = lazy(() => import("./pages/cliente/Index"));
const ClientePlaceholder = lazy(() => import("./pages/cliente/PlaceholderPage"));

// ── 15. Ofertas — Operacional ──
const OfertasHome = lazy(() => import("./pages/ofertas/Index"));
const Campanhas = lazy(() => import("./pages/Campanhas"));
const Templates = lazy(() => import("./pages/homebroker/Templates"));
const Envios = lazy(() => import("./pages/homebroker/Envios"));
const Agendamentos = lazy(() => import("./pages/homebroker/Agendamentos"));
const Contatos = lazy(() => import("./pages/Contatos"));
const Unidades = lazy(() => import("./pages/Unidades"));
const Segmentos = lazy(() => import("./pages/crm/Segmentos"));
const OptOuts = lazy(() => import("./pages/crm/OptOuts"));
const RelatorioCampanhas = lazy(() => import("./pages/dashboard/RelatorioCampanhas"));
const RelatorioCRM = lazy(() => import("./pages/dashboard/RelatorioCRM"));
const Crescimento = lazy(() => import("./pages/dashboard/Crescimento"));
const Relatorios = lazy(() => import("./pages/Relatorios"));
const Usuarios = lazy(() => import("./pages/Usuarios"));
const Configuracoes = lazy(() => import("./pages/admin/Configuracoes"));

// ── 16. Tech — Operacional ──
const PMOOverview = lazy(() => import("./pages/pmo/Index"));
const PMORoadmap = lazy(() => import("./pages/pmo/Roadmap"));
const PMOBacklog = lazy(() => import("./pages/pmo/Backlog"));
const PMOSprints = lazy(() => import("./pages/pmo/Sprints"));
const ReportsCockpit = lazy(() => import("./pages/pmo/ReportsCockpit"));
const PMOIndicadores = lazy(() => import("./pages/pmo/Indicadores"));
const PMOReleases = lazy(() => import("./pages/pmo/Releases"));
const PMOCapacitacao = lazy(() => import("./pages/pmo/Capacitacao"));
const PMODonosInternos = lazy(() => import("./pages/pmo/DonosInternos"));
const PMOSuporte = lazy(() => import("./pages/pmo/Suporte"));
const PMOImersoes = lazy(() => import("./pages/pmo/Imersoes"));
const PMOAgenda = lazy(() => import("./pages/pmo/Agenda"));
const PMODashboardSemanal = lazy(() => import("./pages/pmo/DashboardSemanal"));
const PMORevisoesTrimestrais = lazy(() => import("./pages/pmo/RevisoesTrimestrais"));
const PMORitos = lazy(() => import("./pages/pmo/Ritos"));
const PMOGovernanca = lazy(() => import("./pages/pmo/Governanca"));
const PMOInfra = lazy(() => import("./pages/pmo/Infra"));
const PMOConfig = lazy(() => import("./pages/pmo/Config"));
const PMOCronograma = lazy(() => import("./pages/pmo/Cronograma"));
const PDICronograma = lazy(() => import("./pages/pmo/PDICronograma"));

// ── 17. Academy — Operacional ──
const AcademyPage = lazy(() => import("./pages/academy/Index"));

// ── 18. Sorteios — Operacional ──
const SorteiosDashboard = lazy(() => import("./pages/sorteios/SorteiosDashboard"));
const SorteiosSweepstakes = lazy(() => import("./pages/sorteios/SorteiosSweepstakes"));
const SorteiosSweepstakeDetail = lazy(() => import("./pages/sorteios/SorteiosSweepstakeDetail"));
const SorteiosParticipants = lazy(() => import("./pages/sorteios/SorteiosParticipants"));
const SorteiosCoupons = lazy(() => import("./pages/sorteios/SorteiosCoupons"));
const SorteiosFraudLogs = lazy(() => import("./pages/sorteios/SorteiosFraudLogs"));
const SorteioLanding = lazy(() => import("./pages/sorteios/SorteioLanding"));

// ── 19. CD — Operacional ──
const CDDashboard = lazy(() => import("./pages/cd/Index"));
const AgendaRecebimento = lazy(() => import("./pages/cd/recebimento/Agenda"));
const ConferenciaPage = lazy(() => import("./pages/cd/recebimento/Conferencia"));
const NaoConformidadesPage = lazy(() => import("./pages/cd/recebimento/NaoConformidades"));
const PutawayPage = lazy(() => import("./pages/cd/recebimento/Putaway"));
const MapaArmazem = lazy(() => import("./pages/cd/armazenagem/MapaArmazem"));
const LotesPage = lazy(() => import("./pages/cd/armazenagem/Lotes"));
const ContagemCiclicaPage = lazy(() => import("./pages/cd/armazenagem/ContagemCiclica"));
const ReposicaoPage = lazy(() => import("./pages/cd/demanda/Reposicao"));
const CDRupturasPage = lazy(() => import("./pages/cd/demanda/Rupturas"));
const CurvaABCPage = lazy(() => import("./pages/cd/demanda/CurvaABC"));
const OrdensPage = lazy(() => import("./pages/cd/separacao/Ordens"));
const WavesPage = lazy(() => import("./pages/cd/separacao/Waves"));
const PickingPage = lazy(() => import("./pages/cd/separacao/Picking"));
const RomaneiosPage = lazy(() => import("./pages/cd/expedicao/Romaneios"));
const PerdasPage = lazy(() => import("./pages/cd/qualidade/Perdas"));
const ShrinkPage = lazy(() => import("./pages/cd/qualidade/Shrink"));
const AlertasCDPage = lazy(() => import("./pages/cd/Alertas"));
const PainelLojaPage = lazy(() => import("./pages/cd/lojas/PainelLoja"));
const PainelCLevelPage = lazy(() => import("./pages/cd/executivo/PainelCLevel"));
const ImportacaoPage = lazy(() => import("./pages/cd/importacao/Importacao"));

// ── 20. Reposição — Operacional ──
const ReposicaoHome = lazy(() => import("./pages/reposicao/Index"));
const GondolasPage = lazy(() => import("./pages/reposicao/Gondolas"));
const TarefasReposicao = lazy(() => import("./pages/reposicao/Tarefas"));
const RupturasPage = lazy(() => import("./pages/reposicao/Rupturas"));
const ValidadesPage = lazy(() => import("./pages/reposicao/Validades"));
const RelatoriosReposicao = lazy(() => import("./pages/reposicao/Relatorios"));

// ── 21. Compras — Operacional ──
const ComprasDashboard = lazy(() => import("./pages/compras/Index"));
const ComprasPlaceholder = lazy(() => import("./pages/compras/PlaceholderPage"));
const SupplierScorecard = lazy(() => import("./pages/compras/SupplierScorecard"));
const SupplierProfile = lazy(() => import("./pages/compras/SupplierProfile"));
const POPipeline = lazy(() => import("./pages/compras/POPipeline"));
const POCalculator = lazy(() => import("./pages/compras/POCalculator"));
const TradeAllowances = lazy(() => import("./pages/compras/TradeAllowances"));
const GmroiMatrix = lazy(() => import("./pages/compras/GmroiMatrix"));
const DemandAnalysis = lazy(() => import("./pages/compras/DemandAnalysis"));
const CtaAnalysis = lazy(() => import("./pages/compras/CtaAnalysis"));
const FinancialPanel = lazy(() => import("./pages/compras/FinancialPanel"));
const AlertsPage = lazy(() => import("./pages/compras/AlertsPage"));
const ImportPage = lazy(() => import("./pages/compras/ImportPage"));
const ManuaisPage = lazy(() => import("./pages/compras/ManuaisPage"));
const GlossarioPage = lazy(() => import("./pages/compras/GlossarioPage"));

// ── Module Manuais & Glossário (cross-module) ──
const ManuaisGestao = lazy(() => import("./pages/marketing/ManuaisPage"));
const GlossarioGestao = lazy(() => import("./pages/marketing/GlossarioPage"));
const ManuaisOfertas = lazy(() => import("./pages/ofertas/ManuaisPage"));
const GlossarioOfertas = lazy(() => import("./pages/ofertas/GlossarioPage"));
const ManuaisTrade = lazy(() => import("./pages/trade/ManuaisPage"));
const GlossarioTrade = lazy(() => import("./pages/trade/GlossarioPage"));
const ManuaisCD = lazy(() => import("./pages/cd/ManuaisPage"));
const GlossarioCD = lazy(() => import("./pages/cd/GlossarioPage"));
const ManuaisDominio = lazy(() => import("./pages/dominio/ManuaisPage"));
const GlossarioDominio = lazy(() => import("./pages/dominio/GlossarioPage"));
const ManuaisRH = lazy(() => import("./pages/rh/ManuaisPage"));
const GlossarioRH = lazy(() => import("./pages/rh/GlossarioPage"));
const ManuaisReposicao = lazy(() => import("./pages/reposicao/ManuaisPage"));
const GlossarioReposicao = lazy(() => import("./pages/reposicao/GlossarioPage"));
const ManuaisCliente = lazy(() => import("./pages/cliente/ManuaisPage"));
const GlossarioCliente = lazy(() => import("./pages/cliente/GlossarioPage"));

// ── Shared ──
const SuporteTecnicoPage = lazy(() => import("./pages/shared/SuporteTecnicoPage"));

// Enterprise QueryClient config with optimized caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5 minutes - data considered fresh
      gcTime: 1000 * 60 * 30,         // 30 minutes - keep in cache
      refetchOnWindowFocus: false,    // Disable auto-refetch on focus
      retry: 2,                       // Retry failed requests twice
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <GlobalErrorHandler>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <MaintenanceGate>
              <AuthProvider>
                <ForcePasswordChangeGuard />
                <AgencyRouteGuard />
                <Suspense fallback={<RouteFallback />}>
                <Routes>

                {/* NOS Console removed — redirect to auth */}
                <Route path="/nos/*" element={<Navigate to="/auth" replace />} />
                <Route path="/nos" element={<Navigate to="/auth" replace />} />
                <Route path="/console/*" element={<Navigate to="/auth" replace />} />
                <Route path="/console" element={<Navigate to="/auth" replace />} />

                {/* ═══════════════════════════════════════════════════════════════
                    3. AUTH — Authentication
                    ═══════════════════════════════════════════════════════════════ */}
                <Route path="/auth" element={<WorkspaceAuth />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />

                {/* ═══════════════════════════════════════════════════════════════
                    4. LANDING & REDIRECTS
                    ═══════════════════════════════════════════════════════════════ */}
                <Route path="/" element={<Navigate to="/auth" replace />} />
                <Route path="/nexus/*" element={<Navigate to="/auth" replace />} />
                <Route path="/cliente/hipersenna" element={<LandingPage />} />

                {/* ═══════════════════════════════════════════════════════════════
                    5. PORTAL — Workspace & Supplier Portals
                    ═══════════════════════════════════════════════════════════════ */}
                <Route path="/portal" element={<WorkspacePortal />} />
                <Route path="/fornecedor" element={<SupplierPortal />} />

                {/* Legacy redirects */}
                <Route path="/hipersenna" element={<Navigate to="/portal" replace />} />
                <Route path="/hipersenna/*" element={<Navigate to="/portal" replace />} />

                {/* ═══════════════════════════════════════════════════════════════
                    6. NEXUSDESK — Engajamento (Mesa de Trabalho)
                    ═══════════════════════════════════════════════════════════════ */}
                <Route path="/app/desk" element={<NexusDeskPage />} />
                <Route path="/community" element={<Navigate to="/app/desk" replace />} />
                <Route path="/trabalhe-conosco" element={<PublicApplicationPage />} />

                {/* ═══════════════════════════════════════════════════════════════
                    7. IA — Estratégico
                    ═══════════════════════════════════════════════════════════════ */}
                <Route
                  element={
                    <AccessGate
                      requireAuth
                      allowedUserTypes={["internal"]}
                      allowedRoles={["admin", "operador", "leitura"]}
                      requireModule="ia"
                    >
                      <IALayout2 />
                    </AccessGate>
                  }
                >
                  <Route path="/app/ia" element={<IAHome />} />
                </Route>
                <Route path="/ia/shared/:token" element={<SharedConversation />} />
                <Route element={<IAEmbedLayout />}>
                  <Route path="/embed/ia" element={<IAHome />} />
                </Route>

                {/* ═══════════════════════════════════════════════════════════════
                    8. DOMÍNIO — Estratégico (BI)
                    ═══════════════════════════════════════════════════════════════ */}
                <Route
                  element={
                    <AccessGate
                      requireAuth
                      allowedUserTypes={["internal"]}
                      allowedRoles={["admin"]}
                      requireModule="dominio"
                    >
                      <DominioLayout />
                    </AccessGate>
                  }
                >
                  <Route path="/app/dominio" element={<Navigate to="/app/dominio/executivo/dashboard" replace />} />
                  {/* Visão Executiva */}
                  <Route path="/app/dominio/executivo/dashboard" element={<DashboardExecutivo />} />
                  <Route path="/app/dominio/executivo/unidades" element={<UnidadesResumo />} />
                  <Route path="/app/dominio/executivo/alertas" element={<AlertasNegocio />} />
                  <Route path="/app/dominio/executivo/metas" element={<MetasExecutivo />} />
                  {/* Vendas */}
                  <Route path="/app/dominio/vendas/visao-geral" element={<VendasVisaoGeral />} />
                  <Route path="/app/dominio/vendas/por-unidade" element={<VendasPorUnidade />} />
                  <Route path="/app/dominio/vendas/por-categoria" element={<VendasPorCategoria />} />
                  <Route path="/app/dominio/vendas/ticket-mix" element={<VendasTicketMix />} />
                  <Route path="/app/dominio/vendas/evolucao" element={<VendasEvolucao />} />
                  {/* Financeiro */}
                  <Route path="/app/dominio/financeiro/resultado" element={<FinanceiroResultado />} />
                  <Route path="/app/dominio/financeiro/caixa" element={<FinanceiroCaixa />} />
                  <Route path="/app/dominio/financeiro/apagar-areceber" element={<FinanceiroAPagarAReceber />} />
                  <Route path="/app/dominio/financeiro/despesas" element={<FinanceiroDespesas />} />
                  <Route path="/app/dominio/financeiro/impostos" element={<FinanceiroImpostos />} />
                  {/* Problemas */}
                  <Route path="/app/dominio/problemas/radar" element={<ProblemasRadar />} />
                  <Route path="/app/dominio/problemas/perdas" element={<ProblemasPerdas />} />
                  <Route path="/app/dominio/problemas/preco-margem" element={<ProblemasPrecoMargem />} />
                  <Route path="/app/dominio/problemas/estoque-diferencas" element={<ProblemasEstoque />} />
                  <Route path="/app/dominio/problemas/pendencias" element={<ProblemasPendencias />} />
                  {/* Unidades */}
                  <Route path="/app/dominio/unidades/visao-geral" element={<UnidadesVisaoGeral />} />
                  <Route path="/app/dominio/unidades/por-unidade" element={<UnidadesPorUnidade />} />
                  <Route path="/app/dominio/unidades/produtividade" element={<UnidadesProdutividade />} />
                  <Route path="/app/dominio/unidades/atencoes" element={<UnidadesAtencoes />} />
                  {/* Produtos */}
                  <Route path="/app/dominio/produtos/catalogo" element={<ProdutosCatalogo />} />
                  <Route path="/app/dominio/produtos/ruptura" element={<ProdutosRuptura />} />
                  <Route path="/app/dominio/produtos/giro-cobertura" element={<ProdutosGiroCobertura />} />
                  <Route path="/app/dominio/produtos/preco-margem" element={<ProdutosPrecoMargem />} />
                  <Route path="/app/dominio/produtos/perdas" element={<ProdutosPerdas />} />
                  {/* Compras & Fornecedores */}
                  <Route path="/app/dominio/compras/fornecedores" element={<ComprasFornecedores />} />
                  <Route path="/app/dominio/compras/periodo" element={<ComprasPeriodo />} />
                  <Route path="/app/dominio/compras/condicoes" element={<ComprasCondicoes />} />
                  <Route path="/app/dominio/compras/entregas" element={<ComprasEntregas />} />
                  <Route path="/app/dominio/compras/risco" element={<ComprasRisco />} />
                  {/* Pessoas */}
                  <Route path="/app/dominio/pessoas/equipe" element={<PessoasEquipe />} />
                  <Route path="/app/dominio/pessoas/custo" element={<PessoasCusto />} />
                  <Route path="/app/dominio/pessoas/faltas-atrasos" element={<PessoasFaltasAtrasos />} />
                  <Route path="/app/dominio/pessoas/entradas-saidas" element={<PessoasEntradasSaidas />} />
                  <Route path="/app/dominio/pessoas/lideres-times" element={<PessoasLideresTimes />} />
                  {/* Inteligência */}
                  <Route path="/app/dominio/inteligencia/insights" element={<InteligenciaInsights />} />
                  <Route path="/app/dominio/inteligencia/analises-ia" element={<InteligenciaAnalisesIA />} />
                  <Route path="/app/dominio/inteligencia/relatorios" element={<InteligenciaRelatorios />} />
                  <Route path="/app/dominio/manuais" element={<ManuaisDominio />} />
                  <Route path="/app/dominio/manuais/glossario" element={<GlossarioDominio />} />
                  <Route path="/app/dominio/suporte-tecnico" element={<Suspense fallback={<RouteFallback />}><SuporteTecnicoPage moduleName="Domínio" moduleColor="module-dominio" /></Suspense>} />
                </Route>

                {/* ═══════════════════════════════════════════════════════════════
                    9. FINANCEIRO — Estratégico
                    ═══════════════════════════════════════════════════════════════ */}
                <Route
                  element={
                    <AccessGate
                      requireAuth
                      allowedUserTypes={["internal"]}
                      allowedRoles={["admin", "operador", "leitura"]}
                      requireModule="financeiro"
                    >
                      <FinanceiroLayout />
                    </AccessGate>
                  }
                >
                  <Route path="/app/financeiro" element={<FinanceiroDashboard />} />
                  <Route path="/app/financeiro/dre/rede" element={<DRERedePage />} />
                  <Route path="/app/financeiro/dre/loja" element={<DRELojaPage />} />
                  <Route path="/app/financeiro/capital-giro" element={<CapitalGiroPage />} />
                  <Route path="/app/financeiro/margem-categoria" element={<MargemCategoriaPage />} />
                  <Route path="/app/financeiro/projecao" element={<ProjecaoPage />} />
                  <Route path="/app/financeiro/custos" element={<CustosPage />} />
                  <Route path="/app/financeiro/ponto-equilibrio" element={<PontoEquilibrioPage />} />
                  <Route path="/app/financeiro/roic" element={<ROICPage />} />
                  <Route path="/app/financeiro/config/despesas-metas" element={<ConfigDespesasMetasPage />} />
                  <Route path="/app/financeiro/config/geral" element={<ConfigGeralPage />} />
                  <Route path="/app/financeiro/manuais" element={<ManuaisFinanceiro />} />
                  <Route path="/app/financeiro/suporte-tecnico" element={<Suspense fallback={<RouteFallback />}><SuporteTecnicoPage moduleName="Financeiro" moduleColor="module-financeiro" /></Suspense>} />
                </Route>

                {/* ═══════════════════════════════════════════════════════════════
                    10. LOJA — Estratégico (PDV)
                    ═══════════════════════════════════════════════════════════════ */}
                <Route
                  element={
                    <AccessGate
                      requireAuth
                      allowedUserTypes={["internal"]}
                      allowedRoles={["admin", "operador", "leitura"]}
                      requireModule="loja"
                    >
                      <LojaLayout />
                    </AccessGate>
                  }
                >
                  <Route path="/app/loja" element={<LojaDashboard />} />
                  <Route path="/app/loja/rentabilidade" element={<RentabilidadePage />} />
                  <Route path="/app/loja/precificacao" element={<PrecificacaoPage />} />
                  <Route path="/app/loja/historico-preco" element={<HistoricoPrecoPage />} />
                  <Route path="/app/loja/perdas" element={<LojaPerdasPage />} />
                  <Route path="/app/loja/perdas/registro" element={<RegistroPerdaPage />} />
                  <Route path="/app/loja/comparativo" element={<ComparativoPage />} />
                  <Route path="/app/loja/alertas" element={<AlertasPage />} />
                  <Route path="/app/loja/config/setup" element={<SetupLojaPage />} />
                  <Route path="/app/loja/config/simulador" element={<SimuladorLayoutPage />} />
                  <Route path="/app/loja/manuais" element={<Suspense fallback={<RouteFallback />}><LojaPlaceholder title="Manuais de Uso" description="Documentação e glossário do Loja" /></Suspense>} />
                  <Route path="/app/loja/suporte-tecnico" element={<Suspense fallback={<RouteFallback />}><SuporteTecnicoPage moduleName="Loja" moduleColor="module-loja" /></Suspense>} />
                </Route>

                {/* ═══════════════════════════════════════════════════════════════
                    11. RH — Tático
                    ═══════════════════════════════════════════════════════════════ */}
                <Route
                  element={
                    <AccessGate
                      requireAuth
                      allowedUserTypes={["internal"]}
                      allowedRoles={["admin", "operador", "leitura"]}
                      requireModule="rh"
                    >
                      <RHLayout />
                    </AccessGate>
                  }
                >
                  <Route path="/app/rh" element={<RHHome />} />
                  <Route path="/app/rh/colaboradores" element={<Colaboradores />} />
                  <Route path="/app/rh/colaboradores/:id" element={<ColaboradorDetail />} />
                  <Route path="/app/rh/ponto" element={<Ponto />} />
                  <Route path="/app/rh/ferias" element={<Ferias />} />
                  <Route path="/app/rh/avaliacoes" element={<Avaliacoes />} />
                  <Route path="/app/rh/recrutamento" element={<Recrutamento />} />
                  <Route path="/app/rh/relatorios" element={<RelatoriosRH />} />
                  <Route path="/app/rh/manuais" element={<ManuaisRH />} />
                  <Route path="/app/rh/manuais/glossario" element={<GlossarioRH />} />
                  <Route path="/app/rh/suporte-tecnico" element={<Suspense fallback={<RouteFallback />}><SuporteTecnicoPage moduleName="RH" moduleColor="module-rh" /></Suspense>} />
                </Route>

                {/* ═══════════════════════════════════════════════════════════════
                    12. MARKETING — Tático
                    ═══════════════════════════════════════════════════════════════ */}
                <Route
                  element={
                    <AccessGate
                      requireAuth
                      allowedUserTypes={["internal"]}
                      allowedRoles={["admin", "operador", "leitura"]}
                      requireModule="marketing"
                    >
                      <MarketingLayout />
                    </AccessGate>
                  }
                >
                  <Route path="/app/marketing" element={<MarketingHome />} />
                  <Route path="/app/marketing/alertas" element={<AlertasGestao />} />
                  <Route path="/app/marketing/planejamento" element={<Planejamento />} />
                  <Route path="/app/marketing/demandas" element={<DemandasGestao />} />
                  <Route path="/app/marketing/demandas/nova" element={<NovaDemanda />} />
                  <Route path="/app/marketing/demandas/:id" element={<DemandaDetalhe />} />
                  <Route path="/app/marketing/demandas/:id/responder" element={<MinhaDemanda />} />
                  <Route path="/app/marketing/demandas/editar/:id" element={<EditarDemanda />} />
                  <Route path="/app/marketing/documentos" element={<Documentos />} />
                  <Route path="/app/marketing/documentos/:pageId" element={<DocumentoEditor />} />
                  <Route path="/app/marketing/financeiro" element={<Financeiro />} />
                  <Route path="/app/marketing/financeiro/orcamento" element={<OrcamentoFinanceiro />} />
                  <Route path="/app/marketing/financeiro/fechamento" element={<FechamentoMes />} />
                  <Route path="/app/marketing/financeiro/conciliacao" element={<Conciliacao />} />
                  <Route path="/app/marketing/financeiro/relatorios" element={<RelatoriosFinanceiros />} />
                  <Route path="/app/marketing/trade" element={<TradeGestao />} />
                  <Route path="/app/marketing/kpis" element={<KPIs />} />
                  <Route path="/app/marketing/kpis/novo" element={<NovoKPI />} />
                  <Route path="/app/marketing/campanhas" element={<CampanhasGestao />} />
                  <Route path="/app/marketing/campanhas/nova" element={<CampanhaNova />} />
                  <Route path="/app/marketing/campanhas/:id" element={<CampaignDetalhe />} />
                  <Route path="/app/marketing/campanhas/:id/editar" element={<CampanhaEditar />} />
                  <Route path="/app/marketing/lojas" element={<LojasGestao />} />
                  <Route path="/app/marketing/relatorios" element={<RelatoriosGestao />} />
                  {/* Agência */}
                  <Route path="/app/marketing/agencia" element={<AgenciaGestao />} />
                  <Route path="/app/marketing/agencia/entregas" element={<AgenciaEntregas />} />
                  <Route path="/app/marketing/agencia/briefings" element={<AgenciaBriefings />} />
                  <Route path="/app/marketing/agencia/aprovacoes" element={<AgenciaAprovacoes />} />
                  <Route path="/app/marketing/agencia/sla" element={<AgenciaSlaPerformance />} />
                  <Route path="/app/marketing/agencia/financeiro" element={<AgenciaFinanceiro />} />
                  {/* Redes Sociais */}
                  <Route path="/app/marketing/redes-sociais" element={<RedesSociaisGestao />} />
                  {/* Equipe */}
                  <Route path="/app/marketing/equipe/quadro" element={<EquipeQuadro />} />
                  <Route path="/app/marketing/equipe/desempenho" element={<EquipeDesempenho />} />
                  <Route path="/app/marketing/equipe/capacitacao" element={<EquipeCapacitacao />} />
                  <Route path="/app/marketing/equipe/alocacao" element={<EquipeAlocacao />} />
                  <Route path="/app/marketing/equipe/visao-geral" element={<EquipeVisaoGeral />} />
                  <Route path="/app/marketing/equipe/social-media" element={<EquipeSocialMedia />} />
                  <Route path="/app/marketing/equipe/trafego" element={<EquipeTrafego />} />
                  <Route path="/app/marketing/equipe/design" element={<EquipeDesign />} />
                  <Route path="/app/marketing/equipe/copywriter" element={<EquipeCopywriter />} />
                  <Route path="/app/marketing/equipe/videomaker" element={<EquipeVideomaker />} />
                  {/* Análise */}
                  <Route path="/app/marketing/analise/visao-unificada" element={<VisaoUnificada />} />
                  {/* Atividade */}
                  <Route path="/app/marketing/atividade" element={<AtividadeGestao />} />
                  {/* Templates Hub */}
                  <Route path="/app/marketing/templates" element={<TemplatesHubGestao />} />
                  {/* Execuções redirect to Demandas */}
                  <Route path="/app/marketing/execucoes" element={<Navigate to="/app/marketing/demandas" replace />} />
                  <Route path="/app/marketing/execucoes/:demandId" element={<Navigate to="/app/marketing/demandas" replace />} />
                  <Route path="/app/marketing/execucoes/:demandId/nova" element={<Navigate to="/app/marketing/demandas" replace />} />
                  <Route path="/app/marketing/operacao" element={<OperacaoGestao />} />
                  <Route path="/app/marketing/experimentos" element={<ExperimentosGestao />} />
                  <Route path="/app/marketing/experimentos/novo" element={<NovoExperimento />} />
                  <Route path="/app/marketing/experimentos/:id" element={<ExperimentoDetalhe />} />
                  <Route path="/app/marketing/relatorios/builder" element={<ReportBuilderGestao />} />
                  <Route path="/app/marketing/relatorios/pdf" element={<ReportPDFExport />} />
                  <Route path="/app/marketing/acoes-comerciais" element={<AcoesComerciais />} />
                  <Route path="/app/marketing/acoes-comerciais/nova" element={<NovaAcaoComercial />} />
                  <Route path="/app/marketing/acoes-comerciais/:id" element={<AcaoComercialDetalhe />} />
                  <Route path="/app/marketing/planejamento/nova" element={<NovaAcaoMarketing />} />
                  <Route path="/app/marketing/minha-loja" element={<MinhaLojaGestao />} />
                  <Route path="/app/marketing/execucao" element={<ExecutionHub />} />
                  <Route path="/app/marketing/execucao/:retailActionId" element={<ActionExecution />} />
                  <Route path="/app/marketing/execucao/:retailActionId/loja/:storeId" element={<StoreChecklist />} />
                  <Route path="/app/marketing/manuais" element={<ManuaisGestao />} />
                  <Route path="/app/marketing/manuais/glossario" element={<GlossarioGestao />} />
                  <Route path="/app/marketing/suporte-tecnico" element={<Suspense fallback={<RouteFallback />}><SuporteTecnicoPage moduleName="Marketing" moduleColor="module-gestao" /></Suspense>} />
                </Route>

                {/* ═══════════════════════════════════════════════════════════════
                    13. TRADE — Operacional
                    ═══════════════════════════════════════════════════════════════ */}
                <Route
                  element={
                    <AccessGate
                      requireAuth
                      allowedUserTypes={["internal"]}
                      allowedRoles={["admin", "operador", "leitura"]}
                      requireModule="trade"
                    >
                      <TradeInternalLayout />
                    </AccessGate>
                  }
                >
                  <Route path="/app/trade" element={<TradeHomeInternal />} />
                  <Route path="/app/trade/alertas" element={<AlertasTrade />} />
                  <Route path="/app/trade/pacotes" element={<Pacotes />} />
                  <Route path="/app/trade/pacotes/:packageId" element={<PacoteDetail />} />
                  <Route path="/app/trade/fornecedores" element={<Fornecedores />} />
                  <Route path="/app/trade/fornecedores/:supplierId" element={<FornecedorDetail />} />
                  <Route path="/app/trade/contratos" element={<ContratosTrade />} />
                  <Route path="/app/trade/checklists" element={<Checklists />} />
                  <Route path="/app/trade/checklists/:checklistId" element={<ChecklistDetail />} />
                  <Route path="/app/trade/comprovacoes" element={<Comprovacoes />} />
                  <Route path="/app/trade/calendario" element={<CalendarioTrade />} />
                  <Route path="/app/trade/performance" element={<PerformanceTrade />} />
                  <Route path="/app/trade/roi" element={<ROITrade />} />
                  <Route path="/app/trade/relatorios" element={<RelatoriosTrade />} />
                  <Route path="/app/trade/manuais" element={<ManuaisTrade />} />
                  <Route path="/app/trade/manuais/glossario" element={<GlossarioTrade />} />
                  <Route path="/app/trade/suporte-tecnico" element={<Suspense fallback={<RouteFallback />}><SuporteTecnicoPage moduleName="Trade" moduleColor="module-trade" /></Suspense>} />
                </Route>

                {/* Trade — Supplier Portal */}
                <Route
                  element={
                    <AccessGate
                      requireAuth
                      allowedUserTypes={["supplier"]}
                      requireModule="trade"
                    >
                      <TradeSupplierLayout />
                    </AccessGate>
                  }
                >
                  <Route path="/app/trade/fornecedor" element={<FornecedorHome />} />
                  <Route path="/app/trade/fornecedor/pacotes" element={<FornecedorPacotes />} />
                  <Route path="/app/trade/fornecedor/checklist" element={<FornecedorChecklist />} />
                  <Route path="/app/trade/fornecedor/comprovacoes" element={<FornecedorComprovacoes />} />
                  <Route path="/app/trade/fornecedor/relatorios" element={<FornecedorRelatorios />} />
                  <Route path="/app/trade/fornecedor/ajuda" element={<FornecedorAjuda />} />
                </Route>

                {/* ═══════════════════════════════════════════════════════════════
                    14. CLIENTE — Operacional
                    ═══════════════════════════════════════════════════════════════ */}
                <Route
                  element={
                    <AccessGate
                      requireAuth
                      allowedUserTypes={["internal"]}
                      allowedRoles={["admin", "operador", "leitura"]}
                      requireModule="cliente"
                    >
                      <ClienteLayout />
                    </AccessGate>
                  }
                >
                  <Route path="/app/cliente" element={<ClienteHome />} />
                  <Route path="/app/cliente/clientes" element={<Suspense fallback={<RouteFallback />}><ClientePlaceholder title="Base de Clientes" description="Cadastro e gestão de clientes" /></Suspense>} />
                  <Route path="/app/cliente/segmentacao" element={<Suspense fallback={<RouteFallback />}><ClientePlaceholder title="Segmentação" description="Segmentação de clientes por perfil e comportamento" /></Suspense>} />
                  <Route path="/app/cliente/nps" element={<Suspense fallback={<RouteFallback />}><ClientePlaceholder title="NPS & Pesquisas" description="Net Promoter Score e pesquisas de satisfação" /></Suspense>} />
                  <Route path="/app/cliente/satisfacao" element={<Suspense fallback={<RouteFallback />}><ClientePlaceholder title="Satisfação" description="Indicadores de satisfação do cliente" /></Suspense>} />
                  <Route path="/app/cliente/tickets" element={<Suspense fallback={<RouteFallback />}><ClientePlaceholder title="Tickets" description="Gestão de tickets de atendimento" /></Suspense>} />
                  <Route path="/app/cliente/sac" element={<Suspense fallback={<RouteFallback />}><ClientePlaceholder title="SAC" description="Serviço de Atendimento ao Consumidor" /></Suspense>} />
                  <Route path="/app/cliente/relatorios" element={<Suspense fallback={<RouteFallback />}><ClientePlaceholder title="Relatórios" description="Relatórios de experiência do cliente" /></Suspense>} />
                  <Route path="/app/cliente/manuais" element={<ManuaisCliente />} />
                  <Route path="/app/cliente/manuais/glossario" element={<GlossarioCliente />} />
                  <Route path="/app/cliente/suporte-tecnico" element={<Suspense fallback={<RouteFallback />}><SuporteTecnicoPage moduleName="Cliente" moduleColor="module-cliente" /></Suspense>} />
                </Route>

                {/* ═══════════════════════════════════════════════════════════════
                    15. OFERTAS — Operacional
                    ═══════════════════════════════════════════════════════════════ */}
                <Route
                  element={
                    <AccessGate
                      requireAuth
                      allowedUserTypes={["internal"]}
                      allowedRoles={["admin", "operador", "leitura"]}
                      requireModule="ofertas"
                    >
                      <OfertasLayout />
                    </AccessGate>
                  }
                >
                  <Route path="/app/ofertas" element={<OfertasHome />} />
                  <Route path="/app/ofertas/campanhas" element={<Campanhas />} />
                  <Route path="/app/ofertas/templates" element={<Templates />} />
                  <Route path="/app/ofertas/envios" element={<Envios />} />
                  <Route path="/app/ofertas/agendamentos" element={<Agendamentos />} />
                  <Route path="/app/ofertas/contatos" element={<Contatos />} />
                  <Route path="/app/ofertas/unidades" element={<Unidades />} />
                  <Route path="/app/ofertas/segmentos" element={<Segmentos />} />
                  <Route path="/app/ofertas/optouts" element={<OptOuts />} />
                  <Route path="/app/ofertas/relatorios/campanhas" element={<RelatorioCampanhas />} />
                  <Route path="/app/ofertas/relatorios/crm" element={<RelatorioCRM />} />
                  <Route path="/app/ofertas/relatorios/crescimento" element={<Crescimento />} />
                  <Route path="/app/ofertas/relatorios/exportacoes" element={<Relatorios />} />
                  <Route path="/app/ofertas/usuarios" element={<Usuarios />} />
                  <Route path="/app/ofertas/configuracoes" element={<Configuracoes />} />
                  <Route path="/app/ofertas/manuais" element={<ManuaisOfertas />} />
                  <Route path="/app/ofertas/manuais/glossario" element={<GlossarioOfertas />} />
                  <Route path="/app/ofertas/suporte-tecnico" element={<Suspense fallback={<RouteFallback />}><SuporteTecnicoPage moduleName="Ofertas" moduleColor="module-ofertas" /></Suspense>} />
                </Route>

                {/* ═══════════════════════════════════════════════════════════════
                    16. TECH — Operacional (PMO/TI)
                    ═══════════════════════════════════════════════════════════════ */}
                <Route
                  element={
                    <AccessGate
                      requireAuth
                      allowedUserTypes={["internal"]}
                      allowedRoles={["admin", "operador", "leitura"]}
                      requireModule="pmo"
                    >
                      <PMOLayout />
                    </AccessGate>
                  }
                >
                  <Route path="/app/tech" element={<PMOOverview />} />
                  <Route path="/app/tech/pdi-cronograma" element={<PDICronograma />} />
                  <Route path="/app/tech/cronograma" element={<PMOCronograma />} />
                  <Route path="/app/tech/roadmap" element={<PMORoadmap />} />
                  <Route path="/app/tech/backlog" element={<PMOBacklog />} />
                  <Route path="/app/tech/sprints" element={<PMOSprints />} />
                  <Route path="/app/tech/relatorios" element={<ReportsCockpit />} />
                  <Route path="/app/tech/indicadores" element={<PMOIndicadores />} />
                  <Route path="/app/tech/releases" element={<PMOReleases />} />
                  <Route path="/app/tech/capacitacao" element={<PMOCapacitacao />} />
                  <Route path="/app/tech/donos-internos" element={<PMODonosInternos />} />
                  <Route path="/app/tech/suporte" element={<PMOSuporte />} />
                  <Route path="/app/tech/imersoes" element={<PMOImersoes />} />
                  <Route path="/app/tech/agenda" element={<PMOAgenda />} />
                  <Route path="/app/tech/dashboard-semanal" element={<PMODashboardSemanal />} />
                  <Route path="/app/tech/revisoes-trimestrais" element={<PMORevisoesTrimestrais />} />
                  <Route path="/app/tech/ritos" element={<PMORitos />} />
                  <Route path="/app/tech/governanca" element={<PMOGovernanca />} />
                  <Route path="/app/tech/infra" element={<PMOInfra />} />
                  <Route path="/app/tech/config" element={<PMOConfig />} />
                </Route>

                {/* ═══════════════════════════════════════════════════════════════
                    17. ACADEMY — Operacional (LMS)
                    ═══════════════════════════════════════════════════════════════ */}
                <Route path="/app/academy" element={<AcademyPage />} />

                {/* ═══════════════════════════════════════════════════════════════
                    18. SORTEIOS — Operacional
                    ═══════════════════════════════════════════════════════════════ */}
                <Route
                  element={
                    <AccessGate
                      requireAuth
                      allowedUserTypes={["internal"]}
                      allowedRoles={["admin", "operador", "leitura"]}
                      requireModule="sorteios"
                    >
                      <SorteiosLayout />
                    </AccessGate>
                  }
                >
                  <Route path="/app/sorteios" element={<SorteiosDashboard />} />
                  <Route path="/app/sorteios/campanhas" element={<SorteiosSweepstakes />} />
                  <Route path="/app/sorteios/campanhas/:id" element={<SorteiosSweepstakeDetail />} />
                  <Route path="/app/sorteios/participantes" element={<SorteiosParticipants />} />
                  <Route path="/app/sorteios/cupons" element={<SorteiosCoupons />} />
                  <Route path="/app/sorteios/fraudes" element={<SorteiosFraudLogs />} />
                </Route>
                <Route path="/sorteio/:slug" element={<SorteioLanding />} />

                {/* ═══════════════════════════════════════════════════════════════
                    19. CD — Operacional (WMS)
                    ═══════════════════════════════════════════════════════════════ */}
                <Route
                  element={
                    <AccessGate
                      requireAuth
                      allowedUserTypes={["internal"]}
                      allowedRoles={["admin", "operador", "leitura"]}
                      requireModule="cd"
                    >
                      <CDLayout />
                    </AccessGate>
                  }
                >
                  <Route path="/app/cd" element={<CDDashboard />} />
                  <Route path="/app/cd/alertas" element={<AlertasCDPage />} />
                  <Route path="/app/cd/recebimento/agenda" element={<AgendaRecebimento />} />
                  <Route path="/app/cd/recebimento/conferencia" element={<ConferenciaPage />} />
                  <Route path="/app/cd/recebimento/nao-conformidades" element={<NaoConformidadesPage />} />
                  <Route path="/app/cd/recebimento/putaway" element={<PutawayPage />} />
                  <Route path="/app/cd/armazenagem/mapa" element={<MapaArmazem />} />
                  <Route path="/app/cd/armazenagem/contagem" element={<ContagemCiclicaPage />} />
                  <Route path="/app/cd/armazenagem/lotes" element={<LotesPage />} />
                  <Route path="/app/cd/demanda/reposicao" element={<ReposicaoPage />} />
                  <Route path="/app/cd/demanda/rupturas" element={<CDRupturasPage />} />
                  <Route path="/app/cd/demanda/abc" element={<CurvaABCPage />} />
                  <Route path="/app/cd/separacao/ordens" element={<OrdensPage />} />
                  <Route path="/app/cd/separacao/waves" element={<WavesPage />} />
                  <Route path="/app/cd/separacao/picking" element={<PickingPage />} />
                  <Route path="/app/cd/expedicao/romaneios" element={<RomaneiosPage />} />
                  <Route path="/app/cd/qualidade/perdas" element={<PerdasPage />} />
                  <Route path="/app/cd/qualidade/shrink" element={<ShrinkPage />} />
                  <Route path="/app/cd/lojas/painel" element={<PainelLojaPage />} />
                  <Route path="/app/cd/executivo/painel" element={<PainelCLevelPage />} />
                  <Route path="/app/cd/importacao" element={<ImportacaoPage />} />
                  <Route path="/app/cd/manuais" element={<ManuaisCD />} />
                  <Route path="/app/cd/manuais/glossario" element={<GlossarioCD />} />
                  <Route path="/app/cd/suporte-tecnico" element={<Suspense fallback={<RouteFallback />}><SuporteTecnicoPage moduleName="CD" moduleColor="module-cd" /></Suspense>} />
                </Route>

                {/* ═══════════════════════════════════════════════════════════════
                    20. REPOSIÇÃO — Operacional
                    ═══════════════════════════════════════════════════════════════ */}
                <Route
                  element={
                    <AccessGate
                      requireAuth
                      allowedUserTypes={["internal"]}
                      allowedRoles={["admin", "operador", "leitura"]}
                      requireModule="reposicao"
                    >
                      <ReposicaoLayout />
                    </AccessGate>
                  }
                >
                  <Route path="/app/reposicao" element={<ReposicaoHome />} />
                  <Route path="/app/reposicao/gondolas" element={<GondolasPage />} />
                  <Route path="/app/reposicao/tarefas" element={<TarefasReposicao />} />
                  <Route path="/app/reposicao/rupturas" element={<RupturasPage />} />
                  <Route path="/app/reposicao/validades" element={<ValidadesPage />} />
                  <Route path="/app/reposicao/relatorios" element={<RelatoriosReposicao />} />
                  <Route path="/app/reposicao/manuais" element={<ManuaisReposicao />} />
                  <Route path="/app/reposicao/manuais/glossario" element={<GlossarioReposicao />} />
                  <Route path="/app/reposicao/suporte-tecnico" element={<Suspense fallback={<RouteFallback />}><SuporteTecnicoPage moduleName="Reposição" moduleColor="module-reposicao" /></Suspense>} />
                </Route>

                {/* ═══════════════════════════════════════════════════════════════
                    21. COMPRAS — Operacional
                    ═══════════════════════════════════════════════════════════════ */}
                <Route
                  element={
                    <AccessGate
                      requireAuth
                      allowedUserTypes={["internal"]}
                      allowedRoles={["admin", "operador", "leitura"]}
                      requireModule="compras"
                    >
                      <ComprasLayout />
                    </AccessGate>
                  }
                >
                  <Route path="/app/compras" element={<ComprasDashboard />} />
                  <Route path="/app/compras/alertas" element={<AlertsPage />} />
                  <Route path="/app/compras/fornecedores/scorecard" element={<SupplierScorecard />} />
                  <Route path="/app/compras/fornecedores" element={<Suspense fallback={<RouteFallback />}><ComprasPlaceholder title="Base de Fornecedores" description="Cadastro e gestão de fornecedores" /></Suspense>} />
                  <Route path="/app/compras/fornecedores/:id" element={<SupplierProfile />} />
                  <Route path="/app/compras/ordens" element={<POPipeline />} />
                  <Route path="/app/compras/ordens/nova" element={<POCalculator />} />
                  <Route path="/app/compras/verbas" element={<TradeAllowances />} />
                  <Route path="/app/compras/gmroi" element={<GmroiMatrix />} />
                  <Route path="/app/compras/demanda" element={<DemandAnalysis />} />
                  <Route path="/app/compras/cta" element={<CtaAnalysis />} />
                  <Route path="/app/compras/financeiro" element={<FinancialPanel />} />
                  <Route path="/app/compras/importacao" element={<ImportPage />} />
                  <Route path="/app/compras/manuais" element={<ManuaisPage />} />
                  <Route path="/app/compras/manuais/glossario" element={<GlossarioPage />} />
                  <Route path="/app/compras/suporte-tecnico" element={<Suspense fallback={<RouteFallback />}><SuporteTecnicoPage moduleName="Compras" moduleColor="module-compras" /></Suspense>} />
                </Route>

                {/* ═══════════════════════════════════════════════════════════════
                    404
                    ═══════════════════════════════════════════════════════════════ */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </AuthProvider>
              </MaintenanceGate>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </GlobalErrorHandler>
  </ErrorBoundary>
);

export default App;
