import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { APP_PATHS } from "@/config/route-paths";
import { Megaphone, ShoppingCart, Bot, LayoutDashboard, Users, GraduationCap, Package, Crown, Briefcase, Warehouse, Heart, ShoppingBag, DollarSign, Store } from "lucide-react";
import { useEffect, useMemo } from "react";

import { WorkspacePortalAurora3 } from "@/components/workspace/WorkspacePortalAurora3";

const WorkspacePortal = () => {
  const navigate = useNavigate();
  const { user, loading, signOut, userType, tenant, isNosAdmin, userModulesAllowed, isAgency } = useAuth();


  useEffect(() => {
    if (!loading && user) {
      if (isNosAdmin()) {
        signOut();
      } else if (isAgency()) {
        navigate('/app/marketing', { replace: true });
      } else if (userType !== 'supplier') {
        // Smart redirect: single allowed module → go direct
        if (userModulesAllowed && userModulesAllowed.length === 1) {
          const target = APP_PATHS[userModulesAllowed[0]] || `/app/${userModulesAllowed[0]}`;
          navigate(target, { replace: true });
        }
        // Otherwise stay on portal (multiple modules hub)
      }
    }
  }, [loading, user, isNosAdmin, userType, userModulesAllowed, navigate]);

  const userHasApp = (appId: string) => {
    // null => user inherits all tenant apps
    if (!userModulesAllowed) return true;
    return userModulesAllowed.includes(appId);
  };

  // Filter modules based on tenant's enabled modules + user-specific allowed modules
  const modules = useMemo(
    () => [
      // 1 - NexusIA
      {
        id: "ia",
        name: "NexusIA",
        description: "Inteligência artificial para insights estratégicos instantâneos",
        category: "AI ASSISTANT",
        icon: Bot,
        path: "/app/ia",
        available: Boolean(tenant?.modules_enabled?.includes("ia")) && userHasApp("ia"),
        tone: "ia" as const,
      },
      // 2 - Domínio
      {
        id: "dominio",
        name: "Domínio",
        description: "Dashboard executivo com visão consolidada para diretores",
        category: "EXECUTIVE BI",
        icon: Crown,
        path: "/app/dominio",
        available: Boolean(tenant?.modules_enabled?.includes("dominio")) && userHasApp("dominio"),
        tone: "dominio" as const,
      },
      // 3 - Financeiro
      {
        id: "financeiro",
        name: "Financeiro",
        description: "Inteligência financeira operacional: DRE, capital de giro e ROIC",
        category: "FINANCIAL INTELLIGENCE",
        icon: DollarSign,
        path: "/app/financeiro",
        available: Boolean(tenant?.modules_enabled?.includes("financeiro")) && userHasApp("financeiro"),
        tone: "financeiro" as const,
      },
      // 4 - Loja
      {
        id: "loja",
        name: "Loja",
        description: "Inteligência econômica do ponto de venda: R$/m², precificação e perdas",
        category: "STORE INTELLIGENCE",
        icon: Store,
        path: "/app/loja",
        available: Boolean(tenant?.modules_enabled?.includes("loja")) && userHasApp("loja"),
        tone: "loja" as const,
      },
      // 5 - RH
      {
        id: "rh",
        name: "RH",
        description: "Gestão de pessoas, ponto, férias e avaliações de desempenho",
        category: "HUMAN RESOURCES",
        icon: Users,
        path: "/app/rh",
        available: Boolean(tenant?.modules_enabled?.includes("rh")) && userHasApp("rh"),
        tone: "rh" as const,
      },
      // 4 - Marketing
      {
        id: "marketing",
        name: "Marketing",
        description: "Planejamento, orçamentos e KPIs de marketing em tempo real",
        category: "MARKETING STRATEGY",
        icon: LayoutDashboard,
        path: "/app/marketing",
        available: Boolean(tenant?.modules_enabled?.includes("marketing")) && userHasApp("marketing"),
        tone: "gestao" as const,
      },
      // 5 - Trade
      {
        id: "trade",
        name: "Trade",
        description: "Gestão de acordos, execução e resultados de trade",
        category: "TRADE MARKETING",
        icon: ShoppingCart,
        path: "/app/trade",
        available: Boolean(tenant?.modules_enabled?.includes("trade")) && userHasApp("trade"),
        tone: "trade" as const,
      },
      // 6 - Cliente
      {
        id: "cliente",
        name: "Cliente",
        description: "Gestão de relacionamento e experiência do cliente",
        category: "CUSTOMER EXPERIENCE",
        icon: Heart,
        path: "/app/cliente",
        available: Boolean(tenant?.modules_enabled?.includes("cliente")) && userHasApp("cliente"),
        tone: "cliente" as const,
      },
      // 7 - Ofertas
      {
        id: "ofertas",
        name: "Ofertas",
        description: "Criação, contatos e disparo de ofertas por WhatsApp",
        category: "OFFER CAMPAIGNS",
        icon: Megaphone,
        path: "/app/ofertas",
        available: Boolean(tenant?.modules_enabled?.includes("ofertas")) && userHasApp("ofertas"),
        tone: "ofertas" as const,
      },
      // 8 - Tech / PMO
      {
        id: "pmo",
        name: "Tech / PMO",
        description: "Roadmap • Sprints • Governança • Indicadores • Releases",
        category: "SERVICE DELIVERY",
        icon: Briefcase,
        path: "/app/tech",
        available: Boolean(tenant?.modules_enabled?.includes("pmo")) && userHasApp("pmo"),
        tone: "pmo" as const,
      },
      // 9 - Nexus Desk
      {
        id: "hyperworks",
        name: "Nexus Desk",
        description: "Área de trabalho integrada para comunicação e produtividade da equipe",
        category: "WORKSPACE",
        icon: Users,
        path: "/app/desk",
        available: true,
        tone: "comunidade" as const,
      },
      // 10 - Academy
      {
        id: "academy",
        name: "Academy",
        description: "Treinamentos internos, onboarding e playbooks para todas as equipes",
        category: "INTERNAL TRAINING HUB",
        icon: GraduationCap,
        path: "/app/academy",
        available: Boolean(tenant?.modules_enabled?.includes("academy")) && userHasApp("academy"),
        tone: "academy" as const,
      },
      // 11 - CD
      {
        id: "cd",
        name: "CD",
        description: "WMS completo: recebimento, armazenagem, separação e expedição",
        category: "DISTRIBUTION CENTER",
        icon: Warehouse,
        path: "/app/cd",
        available: Boolean(tenant?.modules_enabled?.includes("cd")) && userHasApp("cd"),
        tone: "cd" as const,
      },
      // 12 - Reposição
      {
        id: "reposicao",
        name: "Reposição",
        description: "Controle de gôndolas, reposição e monitoramento de rupturas",
        category: "REPLENISHMENT OPS",
        icon: Package,
        path: "/app/reposicao",
        available: Boolean(tenant?.modules_enabled?.includes("reposicao")) && userHasApp("reposicao"),
        tone: "reposicao" as const,
      },
      // 13 - Compras
      {
        id: "compras",
        name: "Compras",
        description: "Inteligência de compras, fornecedores e abastecimento",
        category: "PURCHASING INTELLIGENCE",
        icon: ShoppingBag,
        path: "/app/compras",
        available: Boolean(tenant?.modules_enabled?.includes("compras")) && userHasApp("compras"),
        tone: "compras" as const,
      },
    ].sort((a, b) => {
      // NexusDesk always first
      if (a.id === 'hyperworks') return -1;
      if (b.id === 'hyperworks') return 1;
      return 0;
    }).filter((m) => m.available),
    [tenant?.modules_enabled, userModulesAllowed]
  );

  const displayName = useMemo(() => {
    // Prefer full_name from user metadata, fallback to email prefix
    const fullName = user?.user_metadata?.full_name;
    if (fullName) return fullName;
    if (!user?.email) return "";
    const [name] = user.email.split("@");
    return name || user.email;
  }, [user?.user_metadata?.full_name, user?.email]);

  // Redirect suppliers to their dedicated portal
  if (!loading && user && userType === 'supplier') {
    return <Navigate to="/fornecedor" replace />;
  }

  // Non-blocking redirects - only when loading is complete
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Wait for tenant data to be loaded before rendering modules
  // This prevents the flash of "unauthorized" error when clicking modules
  if (loading || !tenant) {
    return (
      <div className="min-h-screen w-full bg-surface-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Carregando aplicativos...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-surface-base">
      <WorkspacePortalAurora3
        displayName={displayName}
        onSignOut={handleSignOut}
        modules={modules}
        className="w-full"
      />
    </div>
  );
};

export default WorkspacePortal;
