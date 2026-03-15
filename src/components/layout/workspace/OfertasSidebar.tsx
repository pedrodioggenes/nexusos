import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Megaphone, 
  FileText, 
  Send, 
  Calendar, 
  Users, 
  Building2, 
  Tags, 
  UserX, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  FileSpreadsheet, 
  UserCog, 
  Settings,
  Compass,
  Layers,
  HelpCircle,
  BookOpen,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { UserProfileFooter } from "@/components/marketing/UserProfileFooter";
import { useAuth } from "@/contexts/AuthContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const STORAGE_KEY = 'ofertas_sidebar_groups_state';

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  adminOnly?: boolean;
  badge?: number;
}

const navigation: NavGroup[] = [
  {
    label: "Principal",
    icon: Compass,
    items: [
      { title: "Dashboard", icon: LayoutDashboard, path: "/app/ofertas" },
    ],
  },
  {
    label: "Campanhas",
    icon: Megaphone,
    items: [
      { title: "Campanhas", icon: Megaphone, path: "/app/ofertas/campanhas" },
      { title: "Templates", icon: FileText, path: "/app/ofertas/templates" },
      { title: "Envios", icon: Send, path: "/app/ofertas/envios" },
      { title: "Agendamentos", icon: Calendar, path: "/app/ofertas/agendamentos" },
    ],
  },
  {
    label: "CRM",
    icon: Users,
    items: [
      { title: "Contatos", icon: Users, path: "/app/ofertas/contatos" },
      { title: "Unidades", icon: Building2, path: "/app/ofertas/unidades" },
      { title: "Segmentos", icon: Tags, path: "/app/ofertas/segmentos" },
      { title: "Opt-outs", icon: UserX, path: "/app/ofertas/optouts" },
    ],
  },
  {
    label: "Relatórios",
    icon: BarChart3,
    items: [
      { title: "Campanhas", icon: BarChart3, path: "/app/ofertas/relatorios/campanhas" },
      { title: "CRM", icon: PieChart, path: "/app/ofertas/relatorios/crm" },
      { title: "Crescimento", icon: TrendingUp, path: "/app/ofertas/relatorios/crescimento" },
      { title: "Exportações", icon: FileSpreadsheet, path: "/app/ofertas/relatorios/exportacoes" },
    ],
  },
  {
    label: "Sistema",
    icon: Settings,
    items: [
      { title: "Usuários", icon: UserCog, path: "/app/ofertas/usuarios", adminOnly: true },
      { title: "Configurações", icon: Settings, path: "/app/ofertas/configuracoes", adminOnly: true },
    ],
  },
  {
    label: "Suporte",
    icon: HelpCircle,
  items: [
      { title: "Manuais de Uso", icon: BookOpen, path: "/app/ofertas/manuais" },
      { title: "Suporte Técnico", icon: Headphones, path: "/app/ofertas/suporte-tecnico" },
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

interface OfertasSidebarProps {
  onNavigate?: () => void;
  onSignOut?: () => void;
  collapsed?: boolean;
  onThemeToggle?: () => void;
  currentTheme?: string;
}

export function OfertasSidebar({ onNavigate, onSignOut, collapsed = false, onThemeToggle, currentTheme }: OfertasSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, role, userPagesAllowed } = useAuth();
  const isAdmin = role === "admin";

  const filteredNavigation = useMemo(() => {
    if (!userPagesAllowed || userPagesAllowed.ofertas === undefined || userPagesAllowed.ofertas === null) {
      return navigation;
    }
    const allowed = userPagesAllowed.ofertas;
    return navigation
      .map(group => ({ ...group, items: group.items.filter(item => allowed.includes(item.path)) }))
      .filter(group => group.items.length > 0);
  }, [userPagesAllowed]);

  const isActive = useCallback((path: string) => {
    if (path === "/app/ofertas") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  const activeGroupLabel = useMemo(() => {
    for (const group of filteredNavigation) {
      const visibleItems = group.items.filter(item => !item.adminOnly || isAdmin);
      if (visibleItems.some(item => isActive(item.path))) {
        return group.label;
      }
    }
    return null;
  }, [filteredNavigation, isActive, isAdmin]);

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

  const displayName = user?.email?.split('@')[0] || 'Usuário';

  const renderNavItem = (item: NavItem & { badge?: number }) => {
    const active = isActive(item.path);
    
    const buttonContent = (
      <button
        onClick={() => handleNavigate(item.path)}
        className={cn(
          "relative w-full flex items-center rounded-lg text-[12px] font-medium transition-all duration-150 group",
          collapsed 
            ? "justify-center p-2" 
            : "gap-2 px-5 py-1.5 ml-3",
          active 
            ? "bg-app-ofertas/10 text-app-ofertas" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {active && (
          <div className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-app-ofertas",
            collapsed && "left-0.5"
          )} />
        )}
        
        <div className="relative">
          <item.icon className={cn(
            "h-3.5 w-3.5 shrink-0 transition-colors",
            active ? "text-app-ofertas" : "text-muted-foreground group-hover:text-foreground"
          )} />
          
          {collapsed && item.badge && item.badge > 0 && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
          )}
        </div>
        
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{item.title}</span>
            {item.badge && item.badge > 0 && (
              <Badge 
                variant="destructive" 
                className="h-5 min-w-[20px] px-1.5 text-[10px] font-bold"
              >
                {item.badge > 99 ? "99+" : item.badge}
              </Badge>
            )}
          </>
        )}
      </button>
    );

    if (collapsed) {
      return (
        <div key={item.path} className="w-full">
          {buttonContent}
        </div>
      );
    }

    return <div key={item.path}>{buttonContent}</div>;
  };

  return (
    <div className="flex flex-col h-full">
       <nav className={cn(
        "flex-1 space-y-1 pt-2 transition-all duration-300 overflow-y-auto overflow-x-hidden",
        collapsed ? "px-1" : "px-2"
      )}>
        {filteredNavigation.map((group) => {
          const visibleItems = group.items.filter(item => !item.adminOnly || isAdmin);
          if (visibleItems.length === 0) return null;
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
                  <div className="space-y-0.5">
                    {visibleItems.map(renderNavItem)}
                  </div>
                </PopoverContent>
              </Popover>
            );
          }

          return (
            <Collapsible
              key={group.label}
              open={isOpen}
              onOpenChange={() => toggleGroup(group.label)}
            >
              <CollapsibleTrigger className="w-full flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors group/trigger">
                <group.icon className="h-4.5 w-4.5 shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors" />
                <span className="text-[10px] font-semibold uppercase tracking-tight text-muted-foreground/70 group-hover/trigger:text-muted-foreground transition-colors flex-1 text-left truncate">
                  {group.label}
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-0.5 mt-0.5">
                  {visibleItems.map(renderNavItem)}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>

      <div className={cn(
        "mt-auto pt-4 border-t border-border/50 transition-all duration-300",
        collapsed ? "px-1" : "px-2"
      )}>
        <UserProfileFooter
          name={displayName}
          email={user?.email}
          role="Marketing Analyst"
          onSignOut={handleSignOut}
          collapsed={collapsed}
          onThemeToggle={onThemeToggle}
          currentTheme={currentTheme}
        />
      </div>
    </div>
  );
}
