import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { usePerfMark } from "@/hooks/usePerfMark";
import { useNavigate } from "react-router-dom";
import {
  Inbox,
  Plus,
  Search,
  LayoutGrid,
  List,
  CalendarRange,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Circle,
  Eye,
  Zap,
  PackageOpen,
  Package,
  ClipboardList,
  ArrowUpDown,
  ChevronDown,
  X,
  CalendarDays,
} from "lucide-react";
import { PageWrapper } from "@/components/marketing/PageWrapper";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PremiumGlassCard } from "@/components/dashboard/PremiumGlassCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DemandaKanban,
  DemandaList,
  DemandaTimeline,
  MyDemandsView,
} from "@/components/marketing/demands";
import { DemandProgrammingSection, type CalendarSelection } from "@/components/marketing/demands/DemandProgrammingSection";
import { SocialCalendar } from "@/components/marketing/demands/SocialCalendar";
import { BulkActionsBar } from "@/components/marketing/demands/BulkActionsBar";
import { SavedViewsDropdown } from "@/components/marketing/demands/SavedViewsDropdown";
import { TemplatePickerDialog } from "@/components/marketing/demands/TemplatePickerDialog";
import { ProductionPackageDialog } from "@/components/marketing/demands/ProductionPackageDialog";
import {
  useMarketingDemands,
  useDemandStats,
  MarketingDemand,
  DemandPriority,
  DemandStatus,
  DemandType,
  demandPriorityConfig,
  demandTypeConfig,
} from "@/hooks/useMarketingDemands";
import {
  useFlatServerDemands,
  useServerDemandStats,
  type DemandSortOption,
} from "@/hooks/useServerDemands";
import { useDemandUrlState, type ViewMode, type StatusQuickFilter } from "@/hooks/useDemandUrlState";
import { useUserDepartmentRole, isGestor, isAgencia } from "@/hooks/useUserDepartmentRole";
import { isFeatureEnabled } from "@/config/features";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: { value: DemandSortOption; label: string }[] = [
  { value: "created_desc", label: "Mais recentes" },
  { value: "due_asc", label: "Prazo próximo" },
  { value: "overdue_first", label: "Atrasadas primeiro" },
  { value: "priority_then_due", label: "Prioridade + Prazo" },
  { value: "updated_desc", label: "Atualizadas" },
];

const VIEW_TABS: { value: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { value: "kanban", label: "Kanban", icon: LayoutGrid },
  { value: "list", label: "Lista", icon: List },
  { value: "timeline", label: "Timeline", icon: CalendarRange },
];

// ─── Manager View ─────────────────────────────────────────────

function ManagerDemandsView() {
  usePerfMark("ManagerDemandsView");
  const navigate = useNavigate();
  const { data: currentRole } = useUserDepartmentRole();
  const agencyMode = isAgencia(currentRole);
  const searchRef = useRef<HTMLInputElement>(null);
  const useServerFilters = isFeatureEnabled("DEMANDS_SERVER_FILTERS_V1");

  // URL-synced state
  const urlState = useDemandUrlState();

  // Local UI state
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [calendarSelection, setCalendarSelection] = useState<CalendarSelection | null>(null);

  // ─── Keyboard shortcuts ────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return;

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        navigate("/app/marketing/demandas/nova");
      }
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  // Compute status filter from quick filter
  // "in_progress" quick filter now covers both in_progress and review statuses
  const statusFilter = urlState.statusQuick === "in_progress"
    ? (["in_progress", "review"] as DemandStatus[])
    : undefined;

  // ─── Data fetching (flag-gated) ────────────────────────────

  const legacyQuery = useMarketingDemands(
    useServerFilters ? undefined : {
      search: urlState.search || undefined,
      priority: urlState.priority !== "all" ? (urlState.priority as DemandPriority) : undefined,
      type: urlState.type !== "all" ? (urlState.type as DemandType) : undefined,
      status: statusFilter,
    }
  );

  const serverQuery = useFlatServerDemands(
    useServerFilters ? {
      search: urlState.search || undefined,
      priority: urlState.priority !== "all" ? (urlState.priority as DemandPriority) : undefined,
      type: urlState.type !== "all" ? (urlState.type as DemandType) : undefined,
      status: statusFilter,
      overdue: urlState.statusQuick === "overdue" ? true : undefined,
      sort: urlState.sort,
    } : {}
  );

  // Stats
  const legacyStats = useDemandStats();
  const serverStats = useServerDemandStats();
  const stats = useServerFilters ? serverStats.data : legacyStats.data;
  const statsLoading = useServerFilters ? serverStats.isLoading : legacyStats.isLoading;

  // Unified demands list
  const rawDemands = useServerFilters
    ? serverQuery.demands
    : (legacyQuery.data || []);
  const isLoading = useServerFilters ? serverQuery.isLoading : legacyQuery.isLoading;

  // Client-side overdue filter (legacy path only) + calendar selection
  const filteredDemands = useMemo(() => {
    let result = rawDemands;
    if (!useServerFilters && urlState.statusQuick === "overdue") {
      result = result.filter(d =>
        d.due_date &&
        new Date(d.due_date) < new Date() &&
        !["completed", "cancelled"].includes(d.status)
      );
    }
    // Apply calendar date/week filter
    if (calendarSelection) {
      if (calendarSelection.type === "day" && calendarSelection.dateStr) {
        result = result.filter(d => d.due_date?.split("T")[0] === calendarSelection.dateStr);
      } else if (calendarSelection.type === "week" && calendarSelection.weekStart && calendarSelection.weekEnd) {
        result = result.filter(d => {
          const dateStr = d.due_date?.split("T")[0];
          return dateStr && dateStr >= calendarSelection.weekStart! && dateStr <= calendarSelection.weekEnd!;
        });
      }
    }
    return result;
  }, [rawDemands, urlState.statusQuick, useServerFilters, calendarSelection]);

  // Status map for bulk actions governance
  const demandStatuses = useMemo(() => {
    const map: Record<string, DemandStatus> = {};
    filteredDemands.forEach(d => { map[d.id] = d.status; });
    return map;
  }, [filteredDemands]);

  const handleDemandClick = useCallback((demand: MarketingDemand) => {
    navigate(`/app/marketing/demandas/${demand.id}`);
  }, [navigate]);

  const handleCreateClick = useCallback(() => {
    setTemplatePickerOpen(true);
  }, []);

  const handleApplySavedView = useCallback((filters: {
    priority: string;
    type: string;
    statusQuick: StatusQuickFilter;
    sort: DemandSortOption;
    search?: string;
  }) => {
    urlState.setPriority(filters.priority);
    urlState.setType(filters.type);
    urlState.setStatusQuick(filters.statusQuick);
    urlState.setSort(filters.sort);
    if (filters.search) urlState.setSearch(filters.search);
  }, [urlState]);

  // ─── Check active filters ──────────────────────────────────
  const hasActiveFilters =
    urlState.search !== "" ||
    urlState.priority !== "all" ||
    urlState.type !== "all" ||
    urlState.statusQuick !== "all" ||
    urlState.sort !== "created_desc" ||
    calendarSelection !== null;

  const clearFilters = useCallback(() => {
    urlState.setSearch("");
    urlState.setPriority("all");
    urlState.setType("all");
    urlState.setStatusQuick("all");
    urlState.setSort("created_desc");
    setCalendarSelection(null);
  }, [urlState]);

  // ─── Clickable stat cards ──────────────────────────────────

  const statCards: {
    label: string;
    value: number;
    icon: typeof Inbox;
    color: string;
    bgColor: string;
    onClick?: () => void;
    active?: boolean;
  }[] = [
    {
      label: "Total",
      value: stats?.total || 0,
      icon: Inbox,
      color: "text-foreground",
      bgColor: "bg-muted/50",
      onClick: () => { urlState.setStatusQuick("all"); urlState.setPriority("all"); },
      active: urlState.statusQuick === "all" && urlState.priority === "all",
    },
    {
      label: "Revisão",
      value: (stats?.inProgress || 0) + (stats?.review || 0),
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      onClick: () => {
        if (urlState.statusQuick === "in_progress") {
          urlState.setStatusQuick("all");
        } else {
          urlState.setStatusQuick("in_progress");
          urlState.setPriority("all");
        }
      },
      active: urlState.statusQuick === "in_progress",
    },
    {
      label: "Atrasadas",
      value: stats?.overdue || 0,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      onClick: () => {
        if (urlState.statusQuick === "overdue") {
          urlState.setStatusQuick("all");
        } else {
          urlState.setStatusQuick("overdue");
          urlState.setPriority("all");
        }
      },
      active: urlState.statusQuick === "overdue",
    },
    {
      label: "Urgentes",
      value: stats?.urgent || 0,
      icon: Zap,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      onClick: () => {
        if (urlState.priority === "urgent") {
          urlState.setPriority("all");
        } else {
          urlState.setPriority("urgent");
          urlState.setStatusQuick("all");
        }
      },
      active: urlState.priority === "urgent",
    },
    {
      label: "Concluídas",
      value: stats?.completed || 0,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  // ─── Render content ──────────────────────────────────────────

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-gestao" />
        </div>
      );
    }

    if (filteredDemands.length === 0 && urlState.view !== "kanban") {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted/50 p-5 mb-5">
            <PackageOpen className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1.5">
            Nenhuma demanda encontrada
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mb-5">
            {hasActiveFilters
              ? "Tente ajustar os filtros ou fazer uma busca diferente."
              : "Comece criando sua primeira demanda para organizar as tarefas da equipe."}
          </p>
          {hasActiveFilters ? (
            <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
              <X className="h-3.5 w-3.5" />
              Limpar filtros
            </Button>
          ) : (
            <Button onClick={handleCreateClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeira Demanda
            </Button>
          )}
        </div>
      );
    }

    switch (urlState.view) {
      case "kanban":
        return (
          <DemandaKanban
            demands={filteredDemands}
            onDemandClick={handleDemandClick}
            onCreateClick={handleCreateClick}
          />
        );
      case "list":
        return (
          <DemandaList
            demands={filteredDemands}
            onDemandClick={handleDemandClick}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        );
      case "timeline":
        return (
          <DemandaTimeline
            demands={filteredDemands}
            onDemandClick={handleDemandClick}
          />
        );
    }
  };

  const activeFilterCount = [
    urlState.search !== "",
    urlState.priority !== "all",
    urlState.type !== "all",
    urlState.statusQuick !== "all",
    urlState.sort !== "created_desc",
  ].filter(Boolean).length;

  return (
    <PageWrapper
      title="Demandas"
      subtitle="Painel de controle da equipe de marketing"
      icon={<Inbox className="h-6 w-6 text-app-gestao" />}
      contentOverflow="visible"
      actions={
        <div className="flex items-center gap-2">
          {!agencyMode && (
            <Button variant="outline" size="sm" onClick={() => setPackageDialogOpen(true)} className="gap-1.5 hidden sm:flex">
              <Package className="h-3.5 w-3.5" />
              Pacote
            </Button>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleCreateClick} className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Nova Demanda</span>
                  <span className="sm:hidden">Nova</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Criar nova demanda <kbd className="ml-1.5 px-1 py-0.5 bg-muted rounded text-[10px]">N</kbd></p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      }
    >
      {/* ═══ BAND A: Stats Row (compact, clickable) ═══ */}
      <BlurFade delay={0.05}>
        <div className="space-y-2 w-full min-w-0 overflow-hidden">
        <ScrollArea orientation="horizontal" className="w-full">
          <div className="flex gap-2 px-0.5 pb-1 w-max">
            {statsLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-24 sm:w-28 rounded-lg flex-shrink-0" />
                ))
              : statCards.map((stat) => (
                  <button
                    key={stat.label}
                    onClick={stat.onClick}
                    disabled={!stat.onClick}
                    className={cn(
                      "flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-lg border transition-all min-w-[95px] sm:min-w-[110px] flex-shrink-0",
                      "hover:bg-accent/50 disabled:cursor-default disabled:opacity-80",
                      stat.active
                        ? "border-app-gestao/40 bg-app-gestao/5 ring-1 ring-app-gestao/20"
                        : "border-border/50 bg-card/60"
                    )}
                  >
                    <div className={cn("p-1.5 rounded-md", stat.bgColor)}>
                      <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-muted-foreground leading-tight">{stat.label}</p>
                      <p className={cn("text-lg font-bold leading-tight", stat.color)}>{stat.value}</p>
                    </div>
                  </button>
                ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

      {/* ═══ BAND B: Filters + View Toggle ═══ */}
        <div className="flex flex-col gap-2 w-full min-w-0">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 w-full min-w-0">
            {/* Left: Search + Filters */}
            <ScrollArea orientation="horizontal" className="w-full">
              <div className="flex items-center gap-2 w-max sm:w-auto sm:flex-wrap pb-1">
              <div className="relative min-w-[150px] sm:min-w-[180px] flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  placeholder="Buscar… ( / )"
                  value={urlState.search}
                  onChange={(e) => urlState.setSearch(e.target.value)}
                  className="pl-8 h-8 text-sm w-full lg:w-56"
                />
              </div>

              <Select value={urlState.priority} onValueChange={urlState.setPriority}>
                <SelectTrigger className="h-8 w-auto min-w-[90px] text-xs">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {(Object.entries(demandPriorityConfig) as [DemandPriority, { label: string }][]).map(
                    ([value, config]) => (
                      <SelectItem key={value} value={value}>{config.label}</SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              <Select value={urlState.type} onValueChange={urlState.setType}>
                <SelectTrigger className="h-8 w-auto min-w-[90px] text-xs">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {(Object.entries(demandTypeConfig) as [DemandType, { label: string; icon: string }][]).map(
                    ([value, config]) => (
                      <SelectItem key={value} value={value}>{config.icon} {config.label}</SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              {useServerFilters && (
                <Select value={urlState.sort} onValueChange={urlState.setSort}>
                  <SelectTrigger className="h-8 w-auto min-w-[100px] text-xs">
                    <ArrowUpDown className="h-3 w-3 mr-1" />
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <SavedViewsDropdown
                currentFilters={{
                  priority: urlState.priority,
                  type: urlState.type,
                  statusQuick: urlState.statusQuick,
                  sort: urlState.sort,
                  search: urlState.search || undefined,
                }}
                onApply={handleApplySavedView}
              />

              {/* Active filter indicator + clear */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                  <Badge variant="secondary" className="h-4 w-4 p-0 flex items-center justify-center text-[9px] rounded-full">
                    {activeFilterCount}
                  </Badge>
                  <X className="h-3 w-3" />
                  Limpar
                </Button>
              )}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Right: View tabs + count */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {useServerFilters && serverQuery.total > 0 && (
                <span className="text-[11px] text-muted-foreground mr-1">
                  {serverQuery.total} demanda{serverQuery.total !== 1 ? "s" : ""}
                </span>
              )}
              {!useServerFilters && filteredDemands.length > 0 && (
                <span className="text-[11px] text-muted-foreground mr-1">
                  {filteredDemands.length} demanda{filteredDemands.length !== 1 ? "s" : ""}
                </span>
              )}

              <Tabs value={urlState.view} onValueChange={(v) => urlState.setView(v as ViewMode)}>
                <TabsList className="h-8 p-0.5 bg-muted/80">
                  {VIEW_TABS.map(({ value, label, icon: Icon }) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className="gap-1.5 px-3 text-xs data-[state=active]:bg-background h-7"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
        </div>
      </BlurFade>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <BulkActionsBar
          selectedIds={selectedIds}
          onClear={() => setSelectedIds([])}
          demandStatuses={demandStatuses}
        />
      )}

      {/* ═══ BAND C: Content ═══ */}
      <BlurFade delay={0.15}>
        <div className="flex-1 min-h-0">
          {renderContent()}

          {/* Load More (server pagination) */}
          {useServerFilters && serverQuery.hasMore && (
            <div className="flex justify-center py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => serverQuery.loadMore()}
                disabled={serverQuery.isLoadingMore}
              >
                {serverQuery.isLoadingMore ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground mr-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-2" />
                )}
                Carregar mais
              </Button>
            </div>
          )}
        </div>
      </BlurFade>

      {/* Separador + Programação */}
      <BlurFade delay={0.2}>
        <div className="border-t border-border pt-4 mt-2">
          <DemandProgrammingSection
            demands={rawDemands}
            onCreateDemand={(date, type) => {
              const params = new URLSearchParams();
              params.set("due_date", date);
              if (type) params.set("type", type);
              navigate(`/app/marketing/demandas/nova?${params.toString()}`);
            }}
            onDemandClick={(d) => handleDemandClick(d as MarketingDemand)}
            selection={calendarSelection}
            onSelectionChange={setCalendarSelection}
            loading={isLoading}
          />
        </div>
      </BlurFade>

      {/* Calendário de Postagens */}
      {calendarOpen && (
        <BlurFade delay={0.1}>
          <SocialCalendar onDemandClick={handleDemandClick} />
        </BlurFade>
      )}


      <TemplatePickerDialog
        open={templatePickerOpen}
        onOpenChange={setTemplatePickerOpen}
        onStartBlank={() => navigate("/app/marketing/demandas/nova")}
        onSelectTemplate={(t) => {
          const params = new URLSearchParams();
          if (t.default_type) params.set("type", t.default_type);
          navigate(`/app/marketing/demandas/nova?${params.toString()}`);
        }}
      />

      <ProductionPackageDialog
        open={packageDialogOpen}
        onOpenChange={setPackageDialogOpen}
      />
    </PageWrapper>
  );
}

// ─── Main component with role-based rendering ────────────────

export default function Demandas() {
  const { data: departmentRole, isLoading } = useUserDepartmentRole();

  if (isLoading) {
    return (
      <PageWrapper
        title="Demandas"
        subtitle="Carregando..."
        icon={<Inbox className="h-6 w-6 text-app-gestao" />}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-gestao" />
        </div>
      </PageWrapper>
    );
  }

  if (isGestor(departmentRole) || isAgencia(departmentRole)) {
    return <ManagerDemandsView />;
  }

  // Only 'colaborador' sees MyDemandsView
  return (
    <PageWrapper
      title="Minhas Demandas"
      subtitle="Visualize e responda às demandas atribuídas a você"
      icon={<ClipboardList className="h-6 w-6 text-app-gestao" />}
    >
      <MyDemandsView />
    </PageWrapper>
  );
}
