import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  AlertTriangle,
  CalendarCheck,
  ClipboardCheck,
  ShieldAlert,
  Map,
  RefreshCw,
  Layers,
  TrendingUp,
  BarChart3,
  Package,
  Waves,
  Hand,
  Truck,
  Skull,
  Percent,
  Store,
  Crown,
  Upload,
  Compass,
  Inbox,
  Grid3X3,
  Activity,
  Target,
  FileBarChart,
  MapPin,
  HelpCircle,
  BookOpen,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProfileFooter } from "@/components/marketing/UserProfileFooter";
import { useAuth } from "@/contexts/AuthContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const STORAGE_KEY = "cd_sidebar_groups_state";

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const navigation: NavGroup[] = [
  {
    label: "Controle",
    icon: Compass,
    items: [
      { title: "Dashboard", icon: LayoutDashboard, path: "/app/cd" },
      { title: "Alertas", icon: AlertTriangle, path: "/app/cd/alertas" },
    ],
  },
  {
    label: "Recebimento",
    icon: Inbox,
    items: [
      { title: "Agenda", icon: CalendarCheck, path: "/app/cd/recebimento/agenda" },
      { title: "Conferência", icon: ClipboardCheck, path: "/app/cd/recebimento/conferencia" },
      { title: "Não Conformidades", icon: ShieldAlert, path: "/app/cd/recebimento/nao-conformidades" },
      { title: "Endereçamento", icon: MapPin, path: "/app/cd/recebimento/putaway" },
    ],
  },
  {
    label: "Armazenagem",
    icon: Grid3X3,
    items: [
      { title: "Mapa do Armazém", icon: Map, path: "/app/cd/armazenagem/mapa" },
      { title: "Contagem Cíclica", icon: RefreshCw, path: "/app/cd/armazenagem/contagem" },
      { title: "Lotes", icon: Layers, path: "/app/cd/armazenagem/lotes" },
    ],
  },
  {
    label: "Demanda",
    icon: Activity,
    items: [
      { title: "Reposição", icon: TrendingUp, path: "/app/cd/demanda/reposicao" },
      { title: "Projeção de Rupturas", icon: BarChart3, path: "/app/cd/demanda/rupturas" },
      { title: "Curva ABC", icon: Target, path: "/app/cd/demanda/abc" },
    ],
  },
  {
    label: "Separação",
    icon: Package,
    items: [
      { title: "Ordens", icon: Package, path: "/app/cd/separacao/ordens" },
      { title: "Waves", icon: Waves, path: "/app/cd/separacao/waves" },
      { title: "Picking", icon: Hand, path: "/app/cd/separacao/picking" },
    ],
  },
  {
    label: "Expedição",
    icon: Truck,
    items: [
      { title: "Romaneios", icon: Truck, path: "/app/cd/expedicao/romaneios" },
    ],
  },
  {
    label: "Qualidade",
    icon: ShieldAlert,
    items: [
      { title: "Perdas", icon: Skull, path: "/app/cd/qualidade/perdas" },
      { title: "Shrink Rate", icon: Percent, path: "/app/cd/qualidade/shrink" },
    ],
  },
  {
    label: "Lojas",
    icon: Store,
    items: [
      { title: "Painel da Loja", icon: Store, path: "/app/cd/lojas/painel" },
    ],
  },
  {
    label: "Executivo",
    icon: Crown,
    items: [
      { title: "Painel C-Level", icon: Crown, path: "/app/cd/executivo/painel" },
    ],
  },
  {
    label: "Importação",
    icon: Upload,
    items: [
      { title: "Importar Dados", icon: Upload, path: "/app/cd/importacao" },
    ],
  },
  {
    label: "Suporte",
    icon: HelpCircle,
  items: [
      { title: "Manuais de Uso", icon: BookOpen, path: "/app/cd/manuais" },
      { title: "Suporte Técnico", icon: Headphones, path: "/app/cd/suporte-tecnico" },
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

interface CDSidebarProps {
  onNavigate?: () => void;
  onSignOut?: () => void;
  collapsed?: boolean;
  onThemeToggle?: () => void;
  currentTheme?: string;
}

export function CDSidebar({ onNavigate, onSignOut, collapsed = false, onThemeToggle, currentTheme }: CDSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, userPagesAllowed } = useAuth();

  const filteredNavigation = useMemo(() => {
    if (!userPagesAllowed || userPagesAllowed.cd === undefined || userPagesAllowed.cd === null) {
      return navigation;
    }
    const allowed = userPagesAllowed.cd;
    return navigation
      .map(group => ({ ...group, items: group.items.filter(item => allowed.includes(item.path)) }))
      .filter(group => group.items.length > 0);
  }, [userPagesAllowed]);

  const isActive = useCallback((path: string) => {
    if (path === "/app/cd") return location.pathname === path;
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  const activeGroupLabel = useMemo(() => {
    for (const group of filteredNavigation) {
      if (group.items.some(item => isActive(item.path))) return group.label;
    }
    return null;
  }, [filteredNavigation, isActive]);

  const [groupStates, setGroupStates] = useState<Record<string, boolean>>(() => {
    const saved = loadGroupStates();
    if (activeGroupLabel) saved[activeGroupLabel] = true;
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

  const handleNavigate = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const handleSignOut = async () => {
    if (onSignOut) onSignOut();
    else { await signOut(); navigate("/"); }
  };

  const displayName = user?.email?.split("@")[0] || "Usuário";

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.path);
    const buttonContent = (
      <button
        onClick={() => handleNavigate(item.path)}
        className={cn(
          "relative w-full flex items-center rounded-lg text-[12px] font-medium transition-all duration-150 group",
          collapsed ? "justify-center p-2" : "gap-2 px-5 py-1.5 ml-3",
          active
            ? "bg-app-cd/10 text-app-cd"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {active && (
          <div className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-app-cd",
            collapsed && "left-0.5"
          )} />
        )}
        <item.icon className={cn(
          "h-3.5 w-3.5 shrink-0 transition-colors",
          active ? "text-app-cd" : "text-muted-foreground group-hover:text-foreground"
        )} />
        {!collapsed && <span className="flex-1 text-left truncate">{item.title}</span>}
      </button>
    );

    if (collapsed) return <div key={item.path} className="w-full">{buttonContent}</div>;
    return <div key={item.path}>{buttonContent}</div>;
  };

  return (
    <div className="flex flex-col h-full">
      <nav className={cn(
        "flex-1 space-y-1 pt-2 transition-all duration-300 overflow-y-auto overflow-x-hidden",
        collapsed ? "px-1" : "px-2"
      )}>
        {filteredNavigation.map((group) => {
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
          role="CD Manager"
          onSignOut={handleSignOut}
          collapsed={collapsed}
          onThemeToggle={onThemeToggle}
          currentTheme={currentTheme}
        />
      </div>
    </div>
  );
}
