import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isPathAllowed } from "@/config/app-pages-registry";
import { 
  LayoutDashboard, 
  Calendar, 
  Wallet,
  BarChart3,
  Target,
  Bell,
  Megaphone,
  Store,
  Instagram,
  MousePointer,
  Palette,
  PenTool,
  FileText,
  Video,
  Building2,
  Inbox,
  ChevronRight,
  Users,
  History,
  Eye,
  ShoppingBag,
  ClipboardList,
  LayoutTemplate,
  FileCheck,
  Command,
  FlaskConical,
  Rocket,
  ClipboardCheck,
  Compass,
  FolderOpen,
  Hash,
  Activity,
  Layers,
  HelpCircle,
  BookOpen,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { UserProfileFooter } from "@/components/marketing/UserProfileFooter";
import { useAuth } from "@/contexts/AuthContext";
import { useMarketingAlerts } from "@/hooks/useMarketingAlerts";
import { useUserDepartmentRole, isAgencia, isGestor } from "@/hooks/useUserDepartmentRole";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const STORAGE_KEY = 'marketing_sidebar_groups_state';

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

const baseNavigation: NavGroup[] = [
  {
    label: "Principal",
    icon: Compass,
    items: [
      { title: "Dashboard", icon: LayoutDashboard, path: "/app/marketing" },
      { title: "Operação", icon: Command, path: "/app/marketing/operacao" },
      { title: "Alertas", icon: Bell, path: "/app/marketing/alertas" },
      { title: "Calendário", icon: Calendar, path: "/app/marketing/planejamento" },
    ],
  },
  {
    label: "Planejamento",
    icon: Layers,
    items: [
      { title: "Demandas", icon: Inbox, path: "/app/marketing/demandas" },
      { title: "Templates", icon: LayoutTemplate, path: "/app/marketing/templates" },
      { title: "Ações Comerciais", icon: Rocket, path: "/app/marketing/acoes-comerciais" },
      { title: "Campanhas", icon: Megaphone, path: "/app/marketing/campanhas" },
      { title: "Trade Marketing", icon: ShoppingBag, path: "/app/marketing/trade" },
    ],
  },
  {
    label: "Financeiro",
    icon: Wallet,
    items: [
      { title: "Movimentações", icon: Wallet, path: "/app/marketing/financeiro" },
      { title: "Orçamento", icon: BarChart3, path: "/app/marketing/financeiro/orcamento" },
      { title: "Fechamento do Mês", icon: FileCheck, path: "/app/marketing/financeiro/fechamento" },
      { title: "Conciliação", icon: ClipboardCheck, path: "/app/marketing/financeiro/conciliacao" },
      { title: "Relatórios", icon: FileText, path: "/app/marketing/financeiro/relatorios" },
    ],
  },
  {
    label: "Documentos",
    icon: FolderOpen,
    items: [
      { title: "Documentos", icon: FileText, path: "/app/marketing/documentos" },
    ],
  },
  {
    label: "Canais",
    icon: Hash,
    items: [
      { title: "Redes Sociais", icon: Instagram, path: "/app/marketing/redes-sociais" },
    ],
  },
];

const pessoasManagementItems: NavItem[] = [
  { title: "Quadro da Equipe", icon: Users, path: "/app/marketing/equipe/quadro" },
  { title: "Desempenho", icon: Target, path: "/app/marketing/equipe/desempenho" },
  { title: "Capacitação", icon: ClipboardList, path: "/app/marketing/equipe/capacitacao" },
  { title: "Alocação", icon: Layers, path: "/app/marketing/equipe/alocacao" },
];

const pessoasTeamItems: NavItem[] = [
  { title: "Visão Geral", icon: Eye, path: "/app/marketing/equipe/visao-geral" },
  { title: "Social Media", icon: Instagram, path: "/app/marketing/equipe/social-media" },
  { title: "Tráfego", icon: MousePointer, path: "/app/marketing/equipe/trafego" },
  { title: "Design", icon: Palette, path: "/app/marketing/equipe/design" },
  { title: "Copywriter", icon: PenTool, path: "/app/marketing/equipe/copywriter" },
  { title: "Videomaker", icon: Video, path: "/app/marketing/equipe/videomaker" },
];

const agencyWorkSection: NavGroup = {
  label: "Agência",
  icon: Building2,
  items: [
    { title: "Entregas", icon: Inbox, path: "/app/marketing/agencia/entregas" },
    { title: "Briefings", icon: FileText, path: "/app/marketing/agencia/briefings" },
    { title: "Aprovações", icon: FileCheck, path: "/app/marketing/agencia/aprovacoes" },
    { title: "SLA & Performance", icon: Target, path: "/app/marketing/agencia/sla" },
    { title: "Financeiro", icon: Wallet, path: "/app/marketing/agencia/financeiro" },
  ],
};

const analysisSection: NavGroup = {
  label: "Análise",
  icon: BarChart3,
  items: [
    { title: "KPIs", icon: Target, path: "/app/marketing/kpis" },
    { title: "Experimentos", icon: FlaskConical, path: "/app/marketing/experimentos" },
    { title: "Lojas", icon: Store, path: "/app/marketing/lojas" },
    { title: "Relatórios", icon: BarChart3, path: "/app/marketing/relatorios" },
    { title: "Visão Unificada", icon: Eye, path: "/app/marketing/analise/visao-unificada" },
  ],
};

const activitySection: NavGroup = {
  label: "Atividade",
  icon: Activity,
  items: [
    { title: "Histórico", icon: History, path: "/app/marketing/atividade" },
  ],
};

const supportSection: NavGroup = {
  label: "Suporte",
  icon: HelpCircle,
  items: [
    { title: "Manuais de Uso", icon: BookOpen, path: "/app/marketing/manuais" },
    { title: "Suporte Técnico", icon: Headphones, path: "/app/marketing/suporte-tecnico" },
  ],
};

// --- Persistence helpers ---
const loadGroupStates = (): Record<string, boolean> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

interface MarketingSidebarProps {
  onNavigate?: () => void;
  onSignOut?: () => void;
  collapsed?: boolean;
  onThemeToggle?: () => void;
  currentTheme?: string;
}

export function MarketingSidebar({ onNavigate, onSignOut, collapsed = false, onThemeToggle, currentTheme }: MarketingSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, tenant, userPagesAllowed } = useAuth();
  const { data: alerts = [] } = useMarketingAlerts();
  const { data: departmentRole } = useUserDepartmentRole();
  
  const unreadAlerts = alerts.filter(a => !a.is_read).length;

  // Allowed paths for agency users
  const AGENCY_ALLOWED_PATHS = useMemo(() => new Set([
    "/app/marketing/demandas",
    "/app/marketing/planejamento",
    "/app/marketing/agencia/entregas",
    "/app/marketing/agencia/briefings",
    "/app/marketing/agencia/aprovacoes",
    "/app/marketing/agencia/sla",
    "/app/marketing/agencia/financeiro",
  ]), []);

  // Build navigation dynamically based on workforce model and department role
  const navigation = useMemo(() => {
    const isAgencyModel = tenant?.marketing_workforce_model === 'agency';
    
    // Pessoas section: management pages always, team pages only for internal model
    const pessoasSection: NavGroup = {
      label: "Pessoas",
      icon: Users,
      items: isAgencyModel 
        ? [...pessoasManagementItems] 
        : [...pessoasManagementItems, ...pessoasTeamItems],
    };
    
    let nav = [...baseNavigation, pessoasSection, agencyWorkSection, analysisSection, activitySection, supportSection];

    const isGerenteLoja = departmentRole === 'gerente_loja';

    if (isGerenteLoja) {
      nav = nav.map(group => {
        if (group.label === "Planejamento") {
          return {
            ...group,
            items: [...group.items, { title: "Minha Loja", icon: Store, path: "/app/marketing/minha-loja" }],
          };
        }
        return group;
      });
    }

    // Agency users see a reduced sidebar
    if (isAgencia(departmentRole)) {
      nav = nav
        .map(group => ({
          ...group,
          items: group.items.filter(item => AGENCY_ALLOWED_PATHS.has(item.path)),
        }))
        .filter(group => group.items.length > 0);
    }

    // Filter by pages_allowed
    if (userPagesAllowed && userPagesAllowed.marketing !== undefined && userPagesAllowed.marketing !== null) {
      const allowed = userPagesAllowed.marketing;
      nav = nav
        .map(group => ({
          ...group,
          items: group.items.filter(item => allowed.includes(item.path)),
        }))
        .filter(group => group.items.length > 0);
    }

    return nav;
  }, [tenant?.marketing_workforce_model, departmentRole, AGENCY_ALLOWED_PATHS, userPagesAllowed]);

  const isActive = useCallback((path: string) => {
    if (path === "/app/marketing") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  // Find which group contains the active route
  const activeGroupLabel = useMemo(() => {
    for (const group of navigation) {
      if (group.items.some(item => isActive(item.path))) {
        return group.label;
      }
    }
    return null;
  }, [navigation, isActive]);

  // Group open/closed state with localStorage persistence
  const [groupStates, setGroupStates] = useState<Record<string, boolean>>(() => {
    const saved = loadGroupStates();
    // Auto-expand the group containing the active route
    if (activeGroupLabel) {
      saved[activeGroupLabel] = true;
    }
    return saved;
  });

  // When active route changes, auto-expand its group
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

  // Inject badge count for alerts
  const getNavWithBadges = () => {
    return navigation.map(group => ({
      ...group,
      items: group.items.map(item => {
        if (item.path.includes("/alertas")) {
          return { ...item, badge: unreadAlerts > 0 ? unreadAlerts : undefined };
        }
        return item;
      }),
    }));
  };

  const displayName = user?.email?.split('@')[0] || 'Usuário';
  const navWithBadges = getNavWithBadges();

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
            ? "bg-app-gestao/10 text-app-gestao" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {/* Active indicator bar */}
        {active && (
          <div className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-app-gestao",
            collapsed && "left-0.5"
          )} />
        )}
        
        <div className="relative">
          <item.icon className={cn(
            "h-3.5 w-3.5 shrink-0 transition-colors",
            active ? "text-app-gestao" : "text-muted-foreground group-hover:text-foreground"
          )} />
          
          {/* Badge dot for collapsed mode */}
          {collapsed && item.badge && item.badge > 0 && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
          )}
        </div>
        
        {/* Text and badge for expanded mode */}
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

    // Wrap with tooltip when collapsed
    if (collapsed) {
      return (
        <Tooltip key={item.path}>
          <TooltipTrigger asChild>
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.title}
            {item.badge && item.badge > 0 && (
              <Badge variant="destructive" className="h-4 min-w-[16px] px-1 text-[10px]">
                {item.badge}
              </Badge>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <div key={item.path}>{buttonContent}</div>;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Navigation */}
      <nav className={cn(
        "flex-1 space-y-1 pt-2 transition-all duration-300 overflow-y-auto overflow-x-hidden",
        collapsed ? "px-1" : "px-2"
      )}>
        {navWithBadges.map((group) => {
           const isOpen = groupStates[group.label] ?? false;

           // Collapsed mode: show group icons with flyout menu
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
                     {group.items.map((item) => {
                       const active = isActive(item.path);
                       return (
                         <button
                           key={item.path}
                           onClick={() => handleNavigate(item.path)}
                           className={cn(
                             "w-full flex items-center gap-2 rounded-lg text-[12px] font-medium transition-all duration-150 px-3 py-1.5",
                             active
                               ? "bg-app-gestao/10 text-app-gestao"
                               : "text-muted-foreground hover:bg-muted hover:text-foreground"
                           )}
                         >
                           <item.icon className={cn(
                             "h-3.5 w-3.5 shrink-0",
                             active ? "text-app-gestao" : "text-muted-foreground"
                           )} />
                           <span className="flex-1 text-left truncate">{item.title}</span>
                           {item.badge && item.badge > 0 && (
                             <Badge variant="destructive" className="h-4 min-w-[16px] px-1 text-[10px]">
                               {item.badge > 99 ? "99+" : item.badge}
                             </Badge>
                           )}
                         </button>
                       );
                     })}
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

      {/* User Profile Footer */}
      <div className={cn(
        "mt-auto pt-4 border-t border-border/50 transition-all duration-300",
        collapsed ? "px-1" : "px-2"
      )}>
        <UserProfileFooter
          name={displayName}
          email={user?.email}
          role="Marketing Manager"
          onSignOut={handleSignOut}
          collapsed={collapsed}
          onThemeToggle={onThemeToggle}
          currentTheme={currentTheme}
        />
      </div>
    </div>
  );
}
