import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useCallback, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  Award,
  FileText,
  ShoppingCart,
  Calculator,
  Wallet,
  TrendingUp,
  BarChart3,
  DollarSign,
  Download,
  Compass,
  Briefcase,
  PieChart,
  LineChart,
  HelpCircle,
  BookOpen,
  Headphones,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "compras_sidebar_groups_state";

interface NavItem {
  title: string;
  icon: typeof LayoutDashboard;
  path: string;
}

interface NavGroup {
  title: string;
  icon: typeof Compass;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    title: "Controle",
    icon: Compass,
    items: [
      { title: "Dashboard Executivo", icon: LayoutDashboard, path: "/app/compras" },
      { title: "Alertas", icon: AlertTriangle, path: "/app/compras/alertas" },
    ],
  },
  {
    title: "Fornecedores",
    icon: Users,
    items: [
      { title: "Scorecard", icon: Award, path: "/app/compras/fornecedores/scorecard" },
      { title: "Base de Fornecedores", icon: Users, path: "/app/compras/fornecedores" },
    ],
  },
  {
    title: "Ordens de Compra",
    icon: ShoppingCart,
    items: [
      { title: "Pipeline de OCs", icon: FileText, path: "/app/compras/ordens" },
      { title: "Calculadora de OC", icon: Calculator, path: "/app/compras/ordens/nova" },
    ],
  },
  {
    title: "Verba Comercial",
    icon: Wallet,
    items: [
      { title: "Painel de Verbas", icon: Wallet, path: "/app/compras/verbas" },
    ],
  },
  {
    title: "Análise",
    icon: BarChart3,
    items: [
      { title: "GMROI (Matriz)", icon: PieChart, path: "/app/compras/gmroi" },
      { title: "Demanda & Previsão", icon: TrendingUp, path: "/app/compras/demanda" },
      { title: "CTA", icon: LineChart, path: "/app/compras/cta" },
    ],
  },
  {
    title: "Financeiro",
    icon: DollarSign,
    items: [
      { title: "Painel Financeiro", icon: DollarSign, path: "/app/compras/financeiro" },
    ],
  },
  {
    title: "Importação",
    icon: Download,
    items: [
      { title: "Importar Dados", icon: Download, path: "/app/compras/importacao" },
    ],
  },
  {
    title: "Suporte",
    icon: HelpCircle,
    items: [
      { title: "Manuais de Uso", icon: BookOpen, path: "/app/compras/manuais" },
      { title: "Suporte Técnico", icon: Headphones, path: "/app/compras/suporte-tecnico" },
    ],
  },
];

const getStoredGroupState = (): Record<string, boolean> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

interface ComprasSidebarProps {
  onNavigate?: () => void;
  onSignOut?: () => void;
  collapsed?: boolean;
  onThemeToggle?: () => void;
  currentTheme?: string;
}

export function ComprasSidebar({ onNavigate, collapsed = false }: ComprasSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { userPagesAllowed } = useAuth();

  const filteredNavigation = useMemo(() => {
    if (!userPagesAllowed || userPagesAllowed.compras === undefined || userPagesAllowed.compras === null) {
      return navigation;
    }
    const allowed = userPagesAllowed.compras;
    return navigation
      .map(group => ({ ...group, items: group.items.filter(item => allowed.includes(item.path)) }))
      .filter(group => group.items.length > 0);
  }, [userPagesAllowed]);

  const isActive = useCallback((path: string) => {
    if (path === "/app/compras") return location.pathname === path;
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  const activeGroupIndex = useMemo(() => {
    return filteredNavigation.findIndex(group =>
      group.items.some(item => isActive(item.path))
    );
  }, [filteredNavigation, isActive]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const stored = getStoredGroupState();
    if (activeGroupIndex >= 0) {
      stored[filteredNavigation[activeGroupIndex].title] = true;
    }
    return stored;
  });

  useEffect(() => {
    if (activeGroupIndex >= 0) {
      const title = filteredNavigation[activeGroupIndex].title;
      setOpenGroups(prev => ({ ...prev, [title]: true }));
    }
  }, [activeGroupIndex, filteredNavigation]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(openGroups));
  }, [openGroups]);

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  if (collapsed) {
    return (
      <div className="flex flex-col h-full">
        <nav className="flex-1 space-y-1 pt-2 px-1 overflow-y-auto overflow-x-hidden">
          {filteredNavigation.map((group) => (
            <Popover key={group.title}>
              <PopoverTrigger asChild>
                <button className="w-full flex justify-center p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                  <group.icon className="h-4.5 w-4.5 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="right" align="start" className="w-56 p-2">
                <p className="text-[10px] font-semibold uppercase tracking-tight text-muted-foreground/70 px-2 pb-1.5">{group.title}</p>
                <div className="space-y-0.5">
                  {group.items.map(item => {
                    const active = isActive(item.path);
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavigate(item.path)}
                        className={cn(
                          "w-full flex items-center gap-2 rounded-lg text-[12px] font-medium transition-all duration-150 px-3 py-1.5",
                          active ? "bg-app-compras/10 text-app-compras" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <item.icon className={cn("h-3.5 w-3.5 shrink-0", active ? "text-app-compras" : "text-muted-foreground")} />
                        <span className="flex-1 text-left truncate">{item.title}</span>
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 space-y-1 pt-2 px-2 overflow-y-auto overflow-x-hidden">
        {filteredNavigation.map((group) => (
          <Collapsible
            key={group.title}
            open={openGroups[group.title] ?? false}
            onOpenChange={() => toggleGroup(group.title)}
          >
            <CollapsibleTrigger className="w-full flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors group/trigger">
              <group.icon className="h-4.5 w-4.5 shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors" />
              <span className="text-[10px] font-semibold uppercase tracking-tight text-muted-foreground/70 group-hover/trigger:text-muted-foreground transition-colors flex-1 text-left truncate">
                {group.title}
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-0.5 mt-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={cn(
                        "relative w-full flex items-center gap-2 rounded-lg text-[12px] font-medium transition-all duration-150 px-5 py-1.5 ml-3 group",
                        active ? "bg-app-compras/10 text-app-compras" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                       {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-app-compras" />}
                      <item.icon className={cn("h-3.5 w-3.5 shrink-0 transition-colors", active ? "text-app-compras" : "text-muted-foreground group-hover:text-foreground")} />
                      <span className="flex-1 text-left truncate">{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </nav>
    </div>
  );
}
