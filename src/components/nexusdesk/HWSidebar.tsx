import { useState } from "react";
import { NotificationBadge } from "./NotificationBadge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHWUserDisplay } from "@/hooks/useHWUserDisplay";
import { useHWProfile, getHWProfileLabel } from "@/hooks/useHWProfile";
import { useHWFavorites } from "@/hooks/useHWFavorites";
import { useHWRecentViews } from "@/hooks/useHWRecentViews";
import { useHWWorkbench } from "@/hooks/useHWWorkbench";
import { useHWAppBadges } from "@/hooks/useHWAppBadges";
import { useHWUnreadCount } from "@/hooks/useHWUnreadCount";
import { useHWAvailability, AVAILABILITY_CONFIG, type AvailabilityStatus } from "@/hooks/useHWAvailability";
import { useIsMobile } from "@/hooks/use-mobile";
import { getWorkbenchAppForPage } from "@/config/workbench-registry";
import {
  Home,
  MessageSquare,
  Users,
  FileText,
  User,
  ChevronLeft,
  Settings,
  LogOut,
  Megaphone,
  GraduationCap,
  Briefcase,
  Menu,
  Bell,
  Star,
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
  Target,
  CheckSquare,
  Layers,
  ClipboardList,
  BarChart3,
  Package,
  LayoutDashboard,
  Plus,
  Kanban,
  Headset,
  TrendingUp,
  Rocket,
  GanttChart,
  LayoutGrid } from
"lucide-react";
import { HWAppLauncher } from "./HWModuleLauncher";
import { HWDraggableSidebar } from "./HWDraggableSidebar";

import { HWSettingsPanel } from "./HWSettingsPanel";
import { HWWorkbenchCatalog } from "./HWWorkbenchCatalog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";

export type HWView = 'home' | 'mural' | 'messages' | 'team' | 'documents' | 'profile' | 'recruitment' | 'trainings' | 'goals' | 'approvals' | string;

interface HWSidebarProps {
  currentView: HWView;
  onViewChange: (view: HWView) => void;
  sidebarOrder: string[];
  onSidebarOrderChange: (order: string[]) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

function SidebarContent({
  currentView, onViewChange, sidebarOrder, onSidebarOrderChange,
  onClose, collapsed = false, onToggleCollapse
}: HWSidebarProps & {onClose?: () => void;}) {
  const [showSettings, setShowSettings] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showLauncher, setShowLauncher] = useState(false);
  const navigate = useNavigate();
  const { displayName, email, initials, user } = useHWUserDisplay();
  const { signOut } = useAuth();
  const { profile, profileLabel, permissions } = useHWProfile();
  const { favorites } = useHWFavorites();
  const { recents } = useHWRecentViews();
  const { resolvedPinnedPages } = useHWWorkbench();
  const pinnedPageIds = resolvedPinnedPages.map((p) => p.id);
  const appBadges = useHWAppBadges(pinnedPageIds);
  const unreadMessageCount = useHWUnreadCount();
  const { status: availabilityStatus, updateStatus } = useHWAvailability();
  const isMobileSidebar = useIsMobile();
  const availConfig = AVAILABILITY_CONFIG[availabilityStatus];

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleNav = (view: HWView) => {
    onViewChange(view);
    onClose?.();
  };

  const NAV_ITEMS: {view: HWView;label: string;icon: typeof Home;show: boolean;}[] = [
  { view: 'home', label: 'Home', icon: Home, show: true },
  { view: 'mural', label: 'Mural', icon: Megaphone, show: true },
  { view: 'messages', label: 'Mensagens', icon: MessageSquare, show: true },
  { view: 'team', label: 'Equipe', icon: Users, show: true },
  { view: 'documents', label: 'Documentos', icon: FileText, show: true },
  { view: 'trainings', label: 'Treinamentos', icon: GraduationCap, show: true },
  { view: 'recruitment', label: 'Recrutamento', icon: Briefcase, show: permissions.canAccessRecruitment },
  { view: 'goals', label: 'Metas', icon: Target, show: true },
  { view: 'approvals', label: 'Aprovações', icon: CheckSquare, show: permissions.canAccessApprovals },
  { view: 'profile', label: 'Meu Perfil', icon: User, show: true }];


  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-full flex flex-col overflow-hidden bg-festval-graphite">
        {/* Header */}
        <div className="h-12 flex items-center shrink-0" style={{ padding: collapsed ? '0 8px' : '0 16px', transition: 'padding 400ms cubic-bezier(0.32, 0.72, 0, 1)' }}>
          {collapsed ?
          <Tooltip>
              <TooltipTrigger asChild>
                <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-zinc-800 mx-auto"
                onClick={onToggleCollapse}
                style={{ color: 'hsl(var(--festval-stone-muted))' }}>
                
                  <PanelLeftOpen className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Expandir sidebar</p></TooltipContent>
            </Tooltip> :

          <>
                <span
              className="text-sm font-semibold tracking-tight whitespace-nowrap overflow-hidden"
              style={{ color: 'hsl(var(--festval-ivory))' }}>
              
                NexusDesk
              </span>
              {onToggleCollapse &&
            <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg hover:bg-zinc-800 shrink-0 ml-auto"
                  onClick={onToggleCollapse}
                  style={{ color: 'hsl(var(--festval-stone-muted))' }}>
                  
                      <PanelLeftClose className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right"><p>Colapsar sidebar</p></TooltipContent>
                </Tooltip>
            }
            </>
          }
        </div>

        {/* Mobile Profile Card */}
        {isMobileSidebar &&
        <div className="px-4 py-3 shrink-0 border-b border-festval-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback
                className="text-xs font-bold"
                style={{ backgroundColor: 'hsl(var(--festval-border))', color: 'hsl(var(--festval-copper))' }}>
                
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-festval-ivory">
                  {displayName}
                </p>
                <p className="text-[10px] truncate" style={{ color: 'hsl(var(--festval-stone))' }}>
                  {profileLabel}
                </p>
              </div>
            </div>
            {/* Availability status chips */}
            <div className="flex gap-1.5 mt-3">
              {(Object.entries(AVAILABILITY_CONFIG) as [AvailabilityStatus, typeof availConfig][]).map(([key, cfg]) =>
            <button
              key={key}
              onClick={() => updateStatus.mutate(key)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all"
              style={{
                backgroundColor: availabilityStatus === key ? cfg.bg : 'transparent',
                color: availabilityStatus === key ? cfg.color : 'hsl(var(--festval-stone-muted))',
                border: `1px solid ${availabilityStatus === key ? cfg.color + '40' : 'hsl(var(--festval-border))'}`
              }}>
              
                  <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: availabilityStatus === key ? cfg.color : 'hsl(var(--festval-stone-muted))' }} />
              
                  {cfg.label}
                </button>
            )}
            </div>
          </div>
        }

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ padding: collapsed ? '12px 4px' : '12px 8px', transition: 'padding 400ms cubic-bezier(0.32, 0.72, 0, 1)' }}>
          <HWDraggableSidebar
            navItems={NAV_ITEMS}
            currentView={currentView}
            onNav={handleNav}
            sidebarOrder={sidebarOrder}
            onOrderChange={onSidebarOrderChange}
            conversationCount={unreadMessageCount}
            collapsed={collapsed} />
          

          {/* Workbench Pinned Pages — "Meus Aplicativos" */}
          <AnimatePresence>
            {resolvedPinnedPages.length > 0 &&
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden">
              
                <div className="mt-5 pt-3 border-t border-festval-border">
                  <div className="flex items-center mb-2" style={{ padding: collapsed ? '0 15px' : '0 10px', transition: 'padding 400ms cubic-bezier(0.32, 0.72, 0, 1)' }}>
                    <Layers className="h-3 w-3 shrink-0" style={{ color: 'hsl(var(--festval-stone-muted))' }} />
                    <span
                    className="text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap overflow-hidden"
                    style={{
                      color: 'hsl(var(--festval-stone-muted))',
                      opacity: collapsed ? 0 : 1,
                      maxWidth: collapsed ? 0 : 200,
                      marginLeft: collapsed ? 0 : 6,
                      transition: 'opacity 300ms cubic-bezier(0.32, 0.72, 0, 1), max-width 400ms cubic-bezier(0.32, 0.72, 0, 1), margin-left 400ms cubic-bezier(0.32, 0.72, 0, 1)',
                      pointerEvents: collapsed ? 'none' : 'auto'
                    }}>
                    
                      Meus Aplicativos
                      <span className="ml-1 opacity-60">({resolvedPinnedPages.length})</span>
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-lg hover:bg-zinc-800 shrink-0"
                        onClick={() => setShowCatalog(true)}
                        style={{
                          color: 'hsl(var(--festval-stone))',
                          opacity: collapsed ? 0 : 1,
                          maxWidth: collapsed ? 0 : 24,
                          overflow: 'hidden',
                          marginLeft: collapsed ? 0 : 'auto',
                          transition: 'opacity 300ms cubic-bezier(0.32, 0.72, 0, 1), max-width 400ms cubic-bezier(0.32, 0.72, 0, 1), margin-left 400ms cubic-bezier(0.32, 0.72, 0, 1)',
                          pointerEvents: collapsed ? 'none' : 'auto'
                        }}>
                        
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right"><p>Adicionar aplicativo</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-0.5">
                    {resolvedPinnedPages.map((page) => {
                    const PINNED_ICON_MAP: Record<string, typeof Home> = {
                      ClipboardList, BarChart3, Megaphone, LayoutDashboard, Package,
                      Kanban, Headset, TrendingUp, Rocket, GanttChart
                    };
                    const PageIcon = PINNED_ICON_MAP[page.icon] || Package;
                    const viewId = `workbench:${page.id}`;
                    const isActive = currentView === viewId;
                    const module = getWorkbenchAppForPage(page.id);
                    const accentColor = module?.appColor || 'hsl(var(--festval-copper))';
                    const badgeCount = appBadges[page.id] || 0;
                    const easing = 'cubic-bezier(0.32, 0.72, 0, 1)';

                    return (
                      <Tooltip key={page.id} open={collapsed ? undefined : false}>
                          <TooltipTrigger asChild>
                            <button
                            draggable
                            onDragStart={(e) => {
                              const data = JSON.stringify({
                                sourceType: 'pinned-page',
                                id: page.id,
                                label: page.title,
                                icon: page.icon,
                                accentColor,
                                appLabel: module?.appLabel
                              });
                              e.dataTransfer.setData('application/hw-desk-item', data);
                              e.dataTransfer.effectAllowed = 'copy';
                            }}
                            onClick={() => handleNav(viewId as HWView)}
                            className="w-full flex items-center rounded-lg text-xs font-medium select-none relative overflow-hidden"
                            style={{
                              padding: collapsed ? '8px 15px' : '8px 10px',
                              justifyContent: 'flex-start',
                              transition: `padding 400ms ${easing}, background-color 150ms ease`,
                              backgroundColor: isActive ? 'hsl(var(--festval-border))' : 'transparent'
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive) e.currentTarget.style.backgroundColor = `${accentColor}14`;
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) e.currentTarget.style.backgroundColor = isActive ? 'hsl(var(--festval-border))' : 'transparent';
                            }}>
                            
                              {/* Active dot */}
                              {isActive &&
                            <div
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full"
                              style={{ backgroundColor: accentColor }} />

                            }
                              <PageIcon className="h-[18px] w-[18px] shrink-0" style={{ color: isActive ? accentColor : 'hsl(var(--festval-stone))' }} />
                              <div
                              className="flex flex-col items-start min-w-0 whitespace-nowrap overflow-hidden"
                              style={{
                                opacity: collapsed ? 0 : 1,
                                maxWidth: collapsed ? 0 : 200,
                                marginLeft: collapsed ? 0 : 10,
                                transition: `opacity 300ms ${easing}, max-width 400ms ${easing}, margin-left 400ms ${easing}`,
                                pointerEvents: collapsed ? 'none' : 'auto'
                              }}>
                              
                                <span className="truncate" style={{ color: isActive ? accentColor : 'hsl(var(--festval-stone))' }}>
                                  {page.title}
                                </span>
                                {module &&
                              <span
                                className="text-[9px] leading-tight truncate"
                                style={{ color: accentColor, opacity: 0.6 }}>
                                
                                    {module.appLabel}
                                  </span>
                              }
                              </div>
                              {/* Badge count (expanded) */}
                              <NotificationBadge
                              count={badgeCount}
                              variant="inline"
                              color="#EF4444"
                              visible={!collapsed && badgeCount > 0}
                              easing={easing} />
                            
                              {/* Badge dot (collapsed) */}
                              <NotificationBadge
                              count={badgeCount}
                              variant="dot"
                              color="#EF4444"
                              visible={!!collapsed && badgeCount > 0}
                              maxCount={9}
                              easing={easing} />
                            
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{page.title}{badgeCount > 0 ? ` (${badgeCount})` : ''}</p>
                          </TooltipContent>
                        </Tooltip>);

                  })}
                  </div>
                </div>
              </motion.div>
            }
          </AnimatePresence>

          {/* Add to Workbench button when no pinned pages */}
          <AnimatePresence>
            {!collapsed && resolvedPinnedPages.length === 0 &&
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden">
              
                <div className="mt-5 pt-3 border-t border-festval-border">
                  <button
                  onClick={() => setShowCatalog(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-colors hover:bg-zinc-800"
                  style={{ color: 'hsl(var(--festval-stone-muted))' }}>
                  
                    <Layers className="h-4 w-4" />
                    <span>Personalizar mesa...</span>
                  </button>
                </div>
              </motion.div>
            }
          </AnimatePresence>


          {/* Favorites — hidden when collapsed */}
          <AnimatePresence>
            {!collapsed && favorites.length > 0 &&
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden">
              
                <div className="mt-6 pt-4 border-t border-festval-border">
                  <p className="px-3 text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--festval-stone-muted))' }}>
                    <Star className="inline h-3 w-3 mr-1" />Favoritos
                  </p>
                  <div className="space-y-0.5">
                    {favorites.slice(0, 5).map((fav) =>
                  <button
                    key={fav.id}
                    onClick={() => {onViewChange('home');onClose?.();}}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors hover:bg-zinc-800 truncate"
                    style={{ color: 'hsl(var(--festval-stone))' }}>
                    
                        <Star className="h-3 w-3 shrink-0" style={{ color: '#F59E0B' }} />
                        <span className="truncate capitalize">{fav.entity_type}</span>
                      </button>
                  )}
                  </div>
                </div>
              </motion.div>
            }
          </AnimatePresence>

          {/* Recents — hidden when collapsed */}
          <AnimatePresence>
            {!collapsed && recents.length > 0 &&
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden">
              
                <div className="mt-6 pt-4 border-t border-festval-border">
                  <p className="px-3 text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--festval-stone-muted))' }}>
                    <Clock className="inline h-3 w-3 mr-1" />Recentes
                  </p>
                  <div className="space-y-0.5">
                    {recents.slice(0, 5).map((rv) =>
                  <button
                    key={rv.id}
                    onClick={() => {onViewChange('home');onClose?.();}}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors hover:bg-zinc-800 truncate"
                    style={{ color: 'hsl(var(--festval-stone))' }}>
                    
                        <Clock className="h-3 w-3 shrink-0" style={{ color: 'hsl(var(--festval-stone))' }} />
                        <span className="truncate capitalize">{rv.entity_type}</span>
                      </button>
                  )}
                  </div>
                </div>
              </motion.div>
            }
          </AnimatePresence>

        </div>

        {/* Module Launcher */}
        <div className="shrink-0 border-t border-festval-border" style={{ padding: collapsed ? '8px 4px' : '8px 8px', transition: 'padding 400ms cubic-bezier(0.32, 0.72, 0, 1)' }}>
          <button
            onClick={() => setShowLauncher(true)}
            className="w-full flex items-center rounded-lg text-xs font-medium transition-colors hover:bg-zinc-800 cursor-pointer"
            style={{
              padding: collapsed ? '8px 15px' : '8px 10px',
              justifyContent: 'flex-start',
              transition: 'padding 400ms cubic-bezier(0.32, 0.72, 0, 1)',
              color: 'hsl(var(--festval-stone))'
            }}>
            
            <LayoutGrid className="h-[18px] w-[18px] shrink-0" />
            <span
              className="whitespace-nowrap overflow-hidden"
              style={{
                opacity: collapsed ? 0 : 1,
                maxWidth: collapsed ? 0 : 120,
                marginLeft: collapsed ? 0 : 10,
                transition: 'opacity 300ms cubic-bezier(0.32, 0.72, 0, 1), max-width 400ms cubic-bezier(0.32, 0.72, 0, 1), margin-left 400ms cubic-bezier(0.32, 0.72, 0, 1)',
                pointerEvents: collapsed ? 'none' : 'auto'
              }}>
              
              Aplicativos
            </span>
          </button>
          <HWAppLauncher externalOpen={showLauncher} onExternalOpenChange={setShowLauncher} />
        </div>

        {/* User Footer */}
        <div className="shrink-0 border-t border-festval-border/50" style={{ padding: collapsed ? '8px 4px' : '8px 8px', transition: 'padding 400ms cubic-bezier(0.32, 0.72, 0, 1)' }}>
          <div className="space-y-0.5">
            <button
              className="w-full flex items-center rounded-lg text-xs font-medium transition-colors hover:bg-zinc-800"
              style={{
                padding: collapsed ? '8px 15px' : '8px 10px',
                justifyContent: 'flex-start',
                transition: 'padding 400ms cubic-bezier(0.32, 0.72, 0, 1)',
                color: 'hsl(var(--festval-stone))'
              }}
              onClick={() => setShowSettings(true)}>
              
              <Settings className="h-[18px] w-[18px] shrink-0" />
              <span
                className="whitespace-nowrap overflow-hidden"
                style={{
                  opacity: collapsed ? 0 : 1,
                  maxWidth: collapsed ? 0 : 120,
                  marginLeft: collapsed ? 0 : 10,
                  transition: 'opacity 300ms cubic-bezier(0.32, 0.72, 0, 1), max-width 400ms cubic-bezier(0.32, 0.72, 0, 1), margin-left 400ms cubic-bezier(0.32, 0.72, 0, 1)'
                }}>
                
                Configurações
              </span>
            </button>
            <button
              className="w-full flex items-center rounded-lg text-xs font-medium transition-colors hover:bg-zinc-800"
              style={{
                padding: collapsed ? '8px 15px' : '8px 10px',
                justifyContent: 'flex-start',
                transition: 'padding 400ms cubic-bezier(0.32, 0.72, 0, 1)',
                color: 'hsl(var(--festval-stone))'
              }}
              onClick={handleLogout}>
              
              <LogOut className="h-[18px] w-[18px] shrink-0" />
              <span
                className="whitespace-nowrap overflow-hidden"
                style={{
                  opacity: collapsed ? 0 : 1,
                  maxWidth: collapsed ? 0 : 120,
                  marginLeft: collapsed ? 0 : 10,
                  transition: 'opacity 300ms cubic-bezier(0.32, 0.72, 0, 1), max-width 400ms cubic-bezier(0.32, 0.72, 0, 1), margin-left 400ms cubic-bezier(0.32, 0.72, 0, 1)'
                }}>
                
                Sair
              </span>
            </button>
          </div>
        </div>

        <HWSettingsPanel open={showSettings} onOpenChange={setShowSettings} />
        <HWWorkbenchCatalog open={showCatalog} onOpenChange={setShowCatalog} />
      </div>
    </TooltipProvider>);

}

export function HWSidebar(props: HWSidebarProps & {mobileOpen?: boolean;onMobileOpenChange?: (open: boolean) => void;}) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Allow external control of mobile sidebar
  const mobileControlled = props.mobileOpen !== undefined;
  const effectiveOpen = mobileControlled ? props.mobileOpen! : isOpen;
  const setEffectiveOpen = mobileControlled ? props.onMobileOpenChange! : setIsOpen;

  if (isMobile) {
    return (
      <Sheet open={effectiveOpen} onOpenChange={setEffectiveOpen}>
        <SheetContent side="left" hideClose className="w-[85vw] max-w-[320px] p-0 bg-festval-graphite border-festval-border">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <SidebarContent {...props} collapsed={false} onToggleCollapse={undefined} onClose={() => setEffectiveOpen(false)} />
        </SheetContent>
      </Sheet>);

  }

  return (
    <aside
      className="shrink-0 h-full hidden lg:block overflow-hidden"
      style={{
        width: props.collapsed ? 56 : 240,
        backgroundColor: 'hsl(var(--festval-graphite))',
        borderRight: '1px solid hsl(var(--festval-border))',
        transition: 'width 400ms cubic-bezier(0.32, 0.72, 0, 1)'
      }}>
      
      <SidebarContent {...props} />
    </aside>);

}