import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ClipboardList, Megaphone, BarChart3, PlusCircle,
  Pin, PinOff, Search, Package, Zap, Layers, ChevronRight,
  Briefcase, Kanban, Headset, TrendingUp, Rocket, GanttChart,
  // Module icons
  Tag, ShoppingCart, Users, Crown, Warehouse, ShoppingBag, Heart,
  Landmark, Store, RefreshCw, Dice5, Sparkles,
  // Page/widget/action icons
  CalendarDays, DollarSign, Target, MapPin, Settings, FlaskConical,
  FileText, Trophy, ShieldAlert, Ticket, PieChart, Sliders,
  BookOpen, HelpCircle, Calculator, Compass,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useHWWorkbench } from "@/hooks/useHWWorkbench";
import { WORKBENCH_REGISTRY, type WorkbenchAppExport } from "@/config/workbench-registry";
import { toast } from "sonner";

// ─── Icon map ─────────────────────────────────────────────────

const ICON_MAP: Record<string, typeof LayoutDashboard> = {
  LayoutDashboard, ClipboardList, Megaphone, BarChart3, PlusCircle,
  Package, Zap, Layers,
  Briefcase, Kanban, Headset, TrendingUp, Rocket, GanttChart,
  Tag, ShoppingCart, Users, Crown, Warehouse, ShoppingBag, Heart,
  Landmark, Store, RefreshCw, Dice5, Sparkles,
  CalendarDays, DollarSign, Target, MapPin, Settings, FlaskConical,
  FileText, Trophy, ShieldAlert, Ticket, PieChart, Sliders,
  BookOpen, HelpCircle, Calculator, Compass,
};

function getIcon(name: string) {
  return ICON_MAP[name] || Package;
}

// ─── Props ────────────────────────────────────────────────────

interface HWWorkbenchCatalogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────

export function HWWorkbenchCatalog({ open, onOpenChange }: HWWorkbenchCatalogProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"pages" | "widgets" | "actions">("pages");
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);

  const toggleModule = useCallback((moduleId: string) => {
    setExpandedModuleId(prev => prev === moduleId ? null : moduleId);
  }, []);
  const {
    availableApps,
    availablePages,
    availableWidgets,
    availableActions,
    isPagePinned,
    pinPage,
    unpinPage,
    isWidgetPinned,
    pinWidget,
    unpinWidget,
    isActionPinned,
    pinAction,
    unpinAction,
  } = useHWWorkbench();

  const filteredPages = useMemo(() => {
    if (!search.trim()) return availablePages;
    const q = search.toLowerCase();
    return availablePages.filter(p =>
      p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [availablePages, search]);

  const filteredWidgets = useMemo(() => {
    if (!search.trim()) return availableWidgets;
    const q = search.toLowerCase();
    return availableWidgets.filter(w =>
      w.title.toLowerCase().includes(q) || w.description.toLowerCase().includes(q)
    );
  }, [availableWidgets, search]);

  const filteredActions = useMemo(() => {
    if (!search.trim()) return availableActions;
    const q = search.toLowerCase();
    return availableActions.filter(a =>
      a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
    );
  }, [availableActions, search]);

  // Group items by app
  const groupByApp = <T extends { appId: string }>(items: T[]) => {
    const groups: Record<string, { module: WorkbenchAppExport; items: T[] }> = {};
    for (const item of items) {
      const mod = WORKBENCH_REGISTRY[item.appId];
      if (!mod) continue;
      if (!groups[item.appId]) {
        groups[item.appId] = { module: mod, items: [] };
      }
      groups[item.appId].items.push(item);
    }
    return Object.values(groups);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        hideClose
        className="w-[90vw] max-w-[420px] p-0 flex flex-col"
        style={{ backgroundColor: '#0f0f10', borderColor: '#27272A' }}
      >
        <SheetTitle className="sr-only">Catálogo de Funcionalidades</SheetTitle>

        {/* Header */}
        <div className="px-5 pt-5 pb-3 shrink-0">
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#EA580C20' }}
            >
              <Layers className="h-4 w-4" style={{ color: '#EA580C' }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>
                Mesa de Trabalho
              </h2>
              <p className="text-[10px]" style={{ color: '#52525B' }}>
                Traga funcionalidades dos apps para o seu workspace
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: '#52525B' }} />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar funcionalidade..."
              className="h-8 text-xs pl-8 rounded-lg"
              style={{ backgroundColor: '#18181B', borderColor: '#27272A', color: '#FAFAFA' }}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-5 mb-2 h-8" style={{ backgroundColor: '#18181B' }}>
            <TabsTrigger value="pages" className="text-[11px] gap-1 data-[state=active]:text-orange-500">
              <Layers className="h-3 w-3" /> Páginas
            </TabsTrigger>
            <TabsTrigger value="widgets" className="text-[11px] gap-1 data-[state=active]:text-orange-500">
              <Package className="h-3 w-3" /> Widgets
            </TabsTrigger>
            <TabsTrigger value="actions" className="text-[11px] gap-1 data-[state=active]:text-orange-500">
              <Zap className="h-3 w-3" /> Ações
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            {/* Pages Tab */}
            <TabsContent value="pages" className="h-full mt-0">
              <ScrollArea className="h-full px-5 pb-5">
                {filteredPages.length === 0 ? (
                  <EmptyState text="Nenhuma página disponível" />
                ) : (
                  groupByApp(filteredPages).map(({ module, items }) => (
                    <ModuleGroup
                      key={module.appId}
                      module={module}
                      itemCount={items.length}
                      expanded={expandedModuleId === module.appId}
                      onToggle={() => toggleModule(module.appId)}
                    >
                      {items.map(page => {
                        const Icon = getIcon(page.icon);
                        const pinned = isPagePinned(page.id);
                        return (
                          <CatalogItem
                            key={page.id}
                            icon={<Icon className="h-4 w-4" />}
                            title={page.title}
                            description={page.description}
                            pinned={pinned}
                            accentColor={module.appColor}
                            onToggle={() => {
                              if (pinned) {
                                unpinPage(page.id);
                                toast.success(`"${page.title}" removida da sidebar`);
                              } else {
                                pinPage(page.id);
                                toast.success(`"${page.title}" adicionada à sidebar`);
                              }
                            }}
                          />
                        );
                      })}
                    </ModuleGroup>
                  ))
                )}
              </ScrollArea>
            </TabsContent>

            {/* Widgets Tab */}
            <TabsContent value="widgets" className="h-full mt-0">
              <ScrollArea className="h-full px-5 pb-5">
                {filteredWidgets.length === 0 ? (
                  <EmptyState text="Nenhum widget disponível" />
                ) : (
                  groupByApp(filteredWidgets).map(({ module, items }) => (
                    <ModuleGroup
                      key={module.appId}
                      module={module}
                      itemCount={items.length}
                      expanded={expandedModuleId === module.appId}
                      onToggle={() => toggleModule(module.appId)}
                    >
                      {items.map(widget => {
                        const Icon = getIcon(widget.icon);
                        const pinned = isWidgetPinned(widget.id);
                        return (
                          <CatalogItem
                            key={widget.id}
                            icon={<Icon className="h-4 w-4" />}
                            title={widget.title}
                            description={widget.description}
                            pinned={pinned}
                            accentColor={module.appColor}
                            badge={widget.size === 'full' ? 'Largura total' : undefined}
                            onToggle={() => {
                              if (pinned) {
                                unpinWidget(widget.id);
                                toast.success(`"${widget.title}" removido`);
                              } else {
                                pinWidget(widget.id);
                                toast.success(`"${widget.title}" adicionado à Home`);
                              }
                            }}
                          />
                        );
                      })}
                    </ModuleGroup>
                  ))
                )}
              </ScrollArea>
            </TabsContent>

            {/* Actions Tab */}
            <TabsContent value="actions" className="h-full mt-0">
              <ScrollArea className="h-full px-5 pb-5">
                {filteredActions.length === 0 ? (
                  <EmptyState text="Nenhuma ação disponível" />
                ) : (
                  groupByApp(filteredActions).map(({ module, items }) => (
                    <ModuleGroup
                      key={module.appId}
                      module={module}
                      itemCount={items.length}
                      expanded={expandedModuleId === module.appId}
                      onToggle={() => toggleModule(module.appId)}
                    >
                      {items.map(action => {
                        const Icon = getIcon(action.icon);
                        const pinned = isActionPinned(action.id);
                        return (
                          <CatalogItem
                            key={action.id}
                            icon={<Icon className="h-4 w-4" />}
                            title={action.title}
                            description={action.description}
                            pinned={pinned}
                            accentColor={module.appColor}
                            onToggle={() => {
                              if (pinned) {
                                unpinAction(action.id);
                                toast.success(`"${action.title}" removida`);
                              } else {
                                pinAction(action.id);
                                toast.success(`"${action.title}" adicionada aos atalhos`);
                              }
                            }}
                          />
                        );
                      })}
                    </ModuleGroup>
                  ))
                )}
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// ─── Sub-components ───────────────────────────────────────────

function ModuleGroup({
  module, children, itemCount, expanded, onToggle,
}: {
  module: WorkbenchAppExport;
  children: React.ReactNode;
  itemCount: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const ModIcon = getIcon(module.appIcon);
  return (
    <div className="mb-1.5">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-2 py-2.5 rounded-lg transition-colors hover:bg-zinc-900/60"
      >
        <div
          className="h-6 w-6 rounded flex items-center justify-center shrink-0"
          style={{ backgroundColor: module.appColor + '20' }}
        >
          <ModIcon className="h-3.5 w-3.5" style={{ color: module.appColor }} />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wider flex-1 text-left" style={{ color: module.appColor }}>
          {module.appLabel}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#27272A', color: '#71717A' }}>
          {itemCount}
        </span>
        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-3.5 w-3.5" style={{ color: '#52525B' }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-1 pt-1 pb-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CatalogItem({
  icon, title, description, pinned, accentColor, badge, onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  pinned: boolean;
  accentColor: string;
  badge?: string;
  onToggle: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg transition-colors"
      style={{
        backgroundColor: pinned ? '#18181B' : 'transparent',
        border: pinned ? `1px solid ${accentColor}30` : '1px solid transparent',
      }}
    >
      <div
        className="h-8 w-8 rounded-lg shrink-0 flex items-center justify-center"
        style={{ backgroundColor: '#27272A', color: pinned ? accentColor : '#71717A' }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium" style={{ color: '#D4D4D8' }}>{title}</span>
          {badge && (
            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#27272A', color: '#71717A' }}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-[10px] mt-0.5 line-clamp-1" style={{ color: '#52525B' }}>{description}</p>
      </div>
      <Switch
        checked={pinned}
        onCheckedChange={onToggle}
        className="shrink-0"
        style={{
          backgroundColor: pinned ? accentColor : '#3F3F46',
        }}
      />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Package className="h-8 w-8 mb-3" style={{ color: '#27272A' }} />
      <p className="text-xs" style={{ color: '#52525B' }}>{text}</p>
    </div>
  );
}
