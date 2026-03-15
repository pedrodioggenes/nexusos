import { useState, useCallback, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  AlertTriangle,
  Building2,
  Package,
  Truck,
  Users,
  Brain,
  HelpCircle,
  BookOpen,
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  CreditCard,
  Receipt,
  Banknote,
  Store,
  Gauge,
  Clock,
  Scale,
  Search,
  LineChart,
  Zap,
  DollarSign,
  Layers,
  Shield,
  Boxes,
  RefreshCw,
  FileText,
  Lightbulb,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProfileFooter } from "@/components/marketing/UserProfileFooter";
import { useAuth } from "@/contexts/AuthContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const STORAGE_KEY = 'dominio_sidebar_groups_state';

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  basePath: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    label: "Visão Executiva",
    icon: LayoutDashboard,
    basePath: "/app/dominio/executivo",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, path: "/app/dominio/executivo/dashboard" },
      { title: "Unidades (Resumo)", icon: Building2, path: "/app/dominio/executivo/unidades" },
      { title: "Alertas do Negócio", icon: AlertTriangle, path: "/app/dominio/executivo/alertas" },
      { title: "Metas", icon: Target, path: "/app/dominio/executivo/metas" },
    ],
  },
  {
    label: "Vendas",
    icon: ShoppingCart,
    basePath: "/app/dominio/vendas",
    items: [
      { title: "Visão Geral", icon: BarChart3, path: "/app/dominio/vendas/visao-geral" },
      { title: "Por Unidade", icon: Store, path: "/app/dominio/vendas/por-unidade" },
      { title: "Por Categoria", icon: Layers, path: "/app/dominio/vendas/por-categoria" },
      { title: "Ticket Médio & Mix", icon: PieChart, path: "/app/dominio/vendas/ticket-mix" },
      { title: "Evolução & Comparativos", icon: TrendingUp, path: "/app/dominio/vendas/evolucao" },
    ],
  },
  {
    label: "Financeiro",
    icon: Wallet,
    basePath: "/app/dominio/financeiro",
    items: [
      { title: "Resultado", icon: DollarSign, path: "/app/dominio/financeiro/resultado" },
      { title: "Caixa", icon: Banknote, path: "/app/dominio/financeiro/caixa" },
      { title: "A Pagar / A Receber", icon: CreditCard, path: "/app/dominio/financeiro/apagar-areceber" },
      { title: "Despesas", icon: Receipt, path: "/app/dominio/financeiro/despesas" },
      { title: "Impostos", icon: Scale, path: "/app/dominio/financeiro/impostos" },
    ],
  },
  {
    label: "Problemas",
    icon: AlertTriangle,
    basePath: "/app/dominio/problemas",
    items: [
      { title: "Radar", icon: Search, path: "/app/dominio/problemas/radar" },
      { title: "Perdas", icon: AlertTriangle, path: "/app/dominio/problemas/perdas" },
      { title: "Preço & Margem", icon: LineChart, path: "/app/dominio/problemas/preco-margem" },
      { title: "Estoque (Diferenças)", icon: Boxes, path: "/app/dominio/problemas/estoque-diferencas" },
      { title: "Pendências", icon: Clock, path: "/app/dominio/problemas/pendencias" },
    ],
  },
  {
    label: "Unidades",
    icon: Building2,
    basePath: "/app/dominio/unidades",
    items: [
      { title: "Visão Geral", icon: BarChart3, path: "/app/dominio/unidades/visao-geral" },
      { title: "Visão por Unidade", icon: Store, path: "/app/dominio/unidades/por-unidade" },
      { title: "Produtividade", icon: Gauge, path: "/app/dominio/unidades/produtividade" },
      { title: "Atenções da Loja", icon: Shield, path: "/app/dominio/unidades/atencoes" },
    ],
  },
  {
    label: "Produtos",
    icon: Package,
    basePath: "/app/dominio/produtos",
    items: [
      { title: "Catálogo (SKU)", icon: Package, path: "/app/dominio/produtos/catalogo" },
      { title: "Ruptura", icon: Zap, path: "/app/dominio/produtos/ruptura" },
      { title: "Giro & Cobertura", icon: RefreshCw, path: "/app/dominio/produtos/giro-cobertura" },
      { title: "Preço & Margem", icon: LineChart, path: "/app/dominio/produtos/preco-margem" },
      { title: "Perdas", icon: AlertTriangle, path: "/app/dominio/produtos/perdas" },
    ],
  },
  {
    label: "Compras & Fornecedores",
    icon: Truck,
    basePath: "/app/dominio/compras",
    items: [
      { title: "Fornecedores", icon: Truck, path: "/app/dominio/compras/fornecedores" },
      { title: "Compras do Período", icon: ShoppingCart, path: "/app/dominio/compras/periodo" },
      { title: "Condições Comerciais", icon: FileText, path: "/app/dominio/compras/condicoes" },
      { title: "Entregas (Performance)", icon: TrendingUp, path: "/app/dominio/compras/entregas" },
      { title: "Risco de Abastecimento", icon: AlertTriangle, path: "/app/dominio/compras/risco" },
    ],
  },
  {
    label: "Pessoas",
    icon: Users,
    basePath: "/app/dominio/pessoas",
    items: [
      { title: "Equipe (Quantidade)", icon: Users, path: "/app/dominio/pessoas/equipe" },
      { title: "Custo de Pessoal", icon: DollarSign, path: "/app/dominio/pessoas/custo" },
      { title: "Faltas & Atrasos", icon: Clock, path: "/app/dominio/pessoas/faltas-atrasos" },
      { title: "Entradas & Saídas", icon: RefreshCw, path: "/app/dominio/pessoas/entradas-saidas" },
      { title: "Líderes & Times", icon: Users, path: "/app/dominio/pessoas/lideres-times" },
    ],
  },
  {
    label: "Inteligência",
    icon: Brain,
    basePath: "/app/dominio/inteligencia",
    items: [
      { title: "Insights", icon: Lightbulb, path: "/app/dominio/inteligencia/insights" },
      { title: "Análises IA", icon: Brain, path: "/app/dominio/inteligencia/analises-ia" },
      { title: "Relatórios", icon: FileText, path: "/app/dominio/inteligencia/relatorios" },
    ],
  },
  {
    label: "Suporte",
    icon: HelpCircle,
    basePath: "/app/dominio/suporte",
    items: [
      { title: "Manuais de Uso", icon: BookOpen, path: "/app/dominio/manuais" },
      { title: "Suporte Técnico", icon: Headphones, path: "/app/dominio/suporte-tecnico" },
    ],
  },
];

const loadGroupStates = (): Record<string, boolean> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

interface DominioSidebarProps {
  onNavigate?: () => void;
  onSignOut?: () => void;
  collapsed?: boolean;
  onThemeToggle?: () => void;
  currentTheme?: string;
}

export function DominioSidebar({ onNavigate, onSignOut, collapsed = false, onThemeToggle, currentTheme }: DominioSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleNavigate = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const handleSignOut = async () => {
    if (onSignOut) {
      onSignOut();
    } else {
      await signOut();
      navigate("/");
    }
  };

  const isGroupActive = useCallback((basePath: string) => location.pathname.startsWith(basePath), [location.pathname]);
  const isItemActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  const activeGroupLabel = useMemo(() => {
    for (const group of navigation) {
      if (isGroupActive(group.basePath)) {
        return group.label;
      }
    }
    return null;
  }, [isGroupActive]);

  const [groupStates, setGroupStates] = useState<Record<string, boolean>>(() => {
    const saved = loadGroupStates();
    if (activeGroupLabel) {
      saved[activeGroupLabel] = true;
    }
    return saved;
  });

  useEffect(() => {
    if (activeGroupLabel && !groupStates[activeGroupLabel]) {
      setGroupStates(prev => {
        const next = { ...prev, [activeGroupLabel]: true };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
  }, [activeGroupLabel]);

  const toggleGroup = useCallback((label: string) => {
    setGroupStates(prev => {
      const next = { ...prev, [label]: !prev[label] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const displayName = user?.email?.split('@')[0] || 'Usuário';

  const renderNavItem = (item: NavItem) => {
    const active = isItemActive(item.path);
    const buttonContent = (
      <button
        onClick={() => handleNavigate(item.path)}
        className={cn(
          "relative w-full flex items-center rounded-lg text-[12px] font-medium transition-all duration-150 group",
          collapsed ? "justify-center p-2" : "gap-2 px-5 py-1.5 ml-3",
          active ? "bg-app-dominio/10 text-app-dominio" : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {active && (
          <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-app-dominio", collapsed && "left-0.5")} />
        )}
        <item.icon className={cn("h-3.5 w-3.5 shrink-0 transition-colors", active ? "text-app-dominio" : "text-muted-foreground group-hover:text-foreground")} />
        {!collapsed && <span className="flex-1 text-left truncate">{item.title}</span>}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.path}>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">{item.title}</TooltipContent>
        </Tooltip>
      );
    }
    return <div key={item.path}>{buttonContent}</div>;
  };

  return (
    <div className="flex flex-col h-full">
      <nav className={cn("flex-1 space-y-1 pt-2 transition-all duration-300 overflow-y-auto overflow-x-hidden", collapsed ? "px-1" : "px-2")}>
        {navigation.map((group) => {
          const isOpen = groupStates[group.label] ?? false;

          if (collapsed) {
            return (
              <Popover key={group.label}>
                <PopoverTrigger asChild>
                  <button className="w-full flex justify-center p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                    <group.icon className="h-4.5 w-4.5 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="right" align="start" className="w-56 p-2">
                  <p className="text-[10px] font-semibold uppercase tracking-tight text-muted-foreground/70 px-2 pb-1.5">{group.label}</p>
                  <div className="space-y-0.5">{group.items.map(renderNavItem)}</div>
                </PopoverContent>
              </Popover>
            );
          }

          return (
            <Collapsible key={group.label} open={isOpen} onOpenChange={() => toggleGroup(group.label)}>
              <CollapsibleTrigger className="w-full flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors group/trigger">
                <group.icon className="h-4.5 w-4.5 shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors" />
                <span className="text-[10px] font-semibold uppercase tracking-tight text-muted-foreground/70 group-hover/trigger:text-muted-foreground transition-colors flex-1 text-left truncate">
                  {group.label}
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-0.5 mt-0.5">{group.items.map(renderNavItem)}</div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>

      <div className={cn("mt-auto pt-4 border-t border-border/50 transition-all duration-300", collapsed ? "px-1" : "px-2")}>
        <UserProfileFooter
          name={displayName}
          email={user?.email}
          role="Diretor Executivo"
          onSignOut={handleSignOut}
          collapsed={collapsed}
          onThemeToggle={onThemeToggle}
          currentTheme={currentTheme}
        />
      </div>
    </div>
  );
}
