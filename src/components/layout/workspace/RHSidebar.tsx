import { useState, useCallback, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users,
  Clock,
  Calendar,
  Star,
  UserPlus,
  TreePine,
  BarChart3,
  Network,
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

const STORAGE_KEY = 'rh_sidebar_groups_state';

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

const navigation: NavGroup[] = [
  {
    label: "Principal",
    icon: Compass,
    items: [
      { title: "Dashboard", icon: LayoutDashboard, path: "/app/rh" },
      { title: "Colaboradores", icon: Users, path: "/app/rh/colaboradores" },
      { title: "Organograma", icon: Network, path: "/app/rh/organograma" },
    ],
  },
  {
    label: "Gestão",
    icon: Layers,
    items: [
      { title: "Ponto", icon: Clock, path: "/app/rh/ponto" },
      { title: "Férias", icon: TreePine, path: "/app/rh/ferias" },
      { title: "Avaliações", icon: Star, path: "/app/rh/avaliacoes" },
      { title: "Treinamentos", icon: Calendar, path: "/app/rh/treinamentos" },
    ],
  },
  {
    label: "Recrutamento",
    icon: UserPlus,
    items: [
      { title: "Candidatos", icon: UserPlus, path: "/app/rh/recrutamento" },
    ],
  },
  {
    label: "Análise",
    icon: BarChart3,
    items: [
      { title: "Relatórios", icon: BarChart3, path: "/app/rh/relatorios" },
    ],
  },
  {
    label: "Suporte",
    icon: HelpCircle,
  items: [
      { title: "Manuais de Uso", icon: BookOpen, path: "/app/rh/manuais" },
      { title: "Suporte Técnico", icon: Headphones, path: "/app/rh/suporte-tecnico" },
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

interface RHSidebarProps {
  onNavigate?: () => void;
  onSignOut?: () => void;
  collapsed?: boolean;
  onThemeToggle?: () => void;
  currentTheme?: string;
}

export function RHSidebar({ onNavigate, onSignOut, collapsed = false, onThemeToggle, currentTheme }: RHSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const isActive = useCallback((path: string) => {
    if (path === "/app/rh") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  const activeGroupLabel = useMemo(() => {
    for (const group of navigation) {
      if (group.items.some(item => isActive(item.path))) {
        return group.label;
      }
    }
    return null;
  }, [isActive]);

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
          collapsed ? "justify-center p-2" : "gap-2 px-5 py-1.5 ml-3",
          active 
            ? "bg-app-rh/10 text-app-rh" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {active && (
          <div className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-app-rh",
            collapsed && "left-0.5"
          )} />
        )}
        
        <div className="relative">
          <item.icon className={cn(
            "h-3.5 w-3.5 shrink-0 transition-colors",
            active ? "text-app-rh" : "text-muted-foreground group-hover:text-foreground"
          )} />
          
          {collapsed && item.badge && item.badge > 0 && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
          )}
        </div>
        
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{item.title}</span>
            {item.badge && item.badge > 0 && (
              <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 text-[10px] font-bold">
                {item.badge > 99 ? "99+" : item.badge}
              </Badge>
            )}
          </>
        )}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.path}>
          <TooltipTrigger asChild>
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.title}
          </TooltipContent>
        </Tooltip>
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
                  <div className="space-y-0.5">
                    {group.items.map(renderNavItem)}
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
                  {group.items.map(renderNavItem)}
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
          role="RH Manager"
          onSignOut={handleSignOut}
          collapsed={collapsed}
          onThemeToggle={onThemeToggle}
          currentTheme={currentTheme}
        />
      </div>
    </div>
  );
}
