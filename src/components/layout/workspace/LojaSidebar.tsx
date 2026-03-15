import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useCallback, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Grid3X3,
  DollarSign,
  TrendingDown,
  Store,
  Bell,
  Settings,
  Sliders,
  HelpCircle,
  BookOpen,
  Headphones,
  Compass,
  BarChart3,
  FileText,
  ClipboardList,
  Trophy,
  Move,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "loja_sidebar_groups_state";

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
    title: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { title: "Painel Executivo da Loja", icon: LayoutDashboard, path: "/app/loja" },
    ],
  },
  {
    title: "Rentabilidade por Espaço",
    icon: Grid3X3,
    items: [
      { title: "Mapa de Calor / IPE", icon: BarChart3, path: "/app/loja/rentabilidade" },
    ],
  },
  {
    title: "Precificação",
    icon: DollarSign,
    items: [
      { title: "Painel de Markup & IAP", icon: DollarSign, path: "/app/loja/precificacao" },
      { title: "Histórico de Preço", icon: FileText, path: "/app/loja/historico-preco" },
    ],
  },
  {
    title: "Perdas Operacionais",
    icon: TrendingDown,
    items: [
      { title: "Painel de Perdas", icon: TrendingDown, path: "/app/loja/perdas" },
      { title: "Registro de Perda", icon: ClipboardList, path: "/app/loja/perdas/registro" },
    ],
  },
  {
    title: "Comparativo entre Lojas",
    icon: Store,
    items: [
      { title: "Ranking & IPC", icon: Trophy, path: "/app/loja/comparativo" },
    ],
  },
  {
    title: "Alertas",
    icon: Bell,
    items: [
      { title: "Central de Alertas", icon: Bell, path: "/app/loja/alertas" },
    ],
  },
  {
    title: "Configuração",
    icon: Settings,
    items: [
      { title: "Setup de Loja", icon: Sliders, path: "/app/loja/config/setup" },
      { title: "Simulador de Layout", icon: Move, path: "/app/loja/config/simulador" },
    ],
  },
  {
    title: "Suporte",
    icon: HelpCircle,
    items: [
      { title: "Manuais de Uso", icon: BookOpen, path: "/app/loja/manuais" },
      { title: "Suporte Técnico", icon: Headphones, path: "/app/loja/suporte-tecnico" },
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

interface LojaSidebarProps {
  onNavigate?: () => void;
  onSignOut?: () => void;
  collapsed?: boolean;
  onThemeToggle?: () => void;
  currentTheme?: string;
}

export function LojaSidebar({ onNavigate, collapsed = false }: LojaSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { userPagesAllowed } = useAuth();

  const filteredNavigation = useMemo(() => {
    if (!userPagesAllowed || userPagesAllowed.loja === undefined || userPagesAllowed.loja === null) {
      return navigation;
    }
    const allowed = userPagesAllowed.loja;
    return navigation
      .map(group => ({ ...group, items: group.items.filter(item => (allowed as string[]).includes(item.path)) }))
      .filter(group => group.items.length > 0);
  }, [userPagesAllowed]);

  const isActive = useCallback((path: string) => {
    if (path === "/app/loja") return location.pathname === path;
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
                          active ? "bg-app-loja/10 text-app-loja" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <item.icon className={cn("h-3.5 w-3.5 shrink-0", active ? "text-app-loja" : "text-muted-foreground")} />
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
                        active ? "bg-app-loja/10 text-app-loja" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                       {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-app-loja" />}
                      <item.icon className={cn("h-3.5 w-3.5 shrink-0 transition-colors", active ? "text-app-loja" : "text-muted-foreground group-hover:text-foreground")} />
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
