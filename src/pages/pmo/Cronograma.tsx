import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { usePMOInitiatives } from "@/hooks/usePMO";
import { CalendarClock, TrendingUp, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { parseISO, isAfter } from "date-fns";
import { CronogramaHeader, CronogramaViewMode } from "./cronograma/CronogramaHeader";
import { CronogramaGanttView } from "./cronograma/CronogramaGanttView";
import { CronogramaCalendarView } from "./cronograma/CronogramaCalendarView";
import { CronogramaListView } from "./cronograma/CronogramaListView";

export default function PMOCronograma() {
  const { data: initiatives = [], isLoading } = usePMOInitiatives();
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [viewMode, setViewMode] = useState<CronogramaViewMode>("gantt");
  const [statusFilter, setStatusFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const datedInitiatives = useMemo(() => {
    return initiatives.filter((i: any) => i.start_date && i.target_date);
  }, [initiatives]);

  const filteredInitiatives = useMemo(() => {
    return datedInitiatives.filter((i: any) => {
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (areaFilter !== "all" && i.area !== areaFilter) return false;
      if (searchQuery && !i.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [datedInitiatives, statusFilter, areaFilter, searchQuery]);

  const areas = useMemo(() => {
    const set = new Set(datedInitiatives.map((i: any) => i.area).filter(Boolean));
    return Array.from(set) as string[];
  }, [datedInitiatives]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredInitiatives.length;
    const completed = filteredInitiatives.filter((i: any) => i.status === "concluido").length;
    const inProgress = filteredInitiatives.filter((i: any) => i.status === "em_andamento").length;
    const overdue = filteredInitiatives.filter((i: any) =>
      isAfter(new Date(), parseISO(i.target_date)) && i.status !== "concluido"
    ).length;
    const avgProgress = total > 0
      ? Math.round(filteredInitiatives.reduce((acc: number, i: any) => acc + (i.progress ?? 0), 0) / total)
      : 0;
    return { total, completed, inProgress, overdue, avgProgress };
  }, [filteredInitiatives]);

  const handlePreviousMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };
  const handleToday = () => { setCurrentMonth(now.getMonth()); setCurrentYear(now.getFullYear()); };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-pmo" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <PageHeader
          title="Cronograma"
          description="Timeline e calendário das iniciativas do programa"
        />

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2.5 bg-card/50 border border-border/30 rounded-lg px-3 py-2">
            <TrendingUp className="h-4 w-4 text-app-pmo" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</p>
              <p className="text-sm font-semibold">{stats.total}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-card/50 border border-border/30 rounded-lg px-3 py-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Em andamento</p>
              <p className="text-sm font-semibold">{stats.inProgress}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-card/50 border border-border/30 rounded-lg px-3 py-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Concluídas</p>
              <p className="text-sm font-semibold">{stats.completed}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-card/50 border border-border/30 rounded-lg px-3 py-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Atrasadas</p>
              <p className="text-sm font-semibold text-destructive">{stats.overdue}</p>
            </div>
          </div>
        </div>

        {/* Header with navigation, tabs, filters */}
        <CronogramaHeader
          currentMonth={currentMonth}
          currentYear={currentYear}
          viewMode={viewMode}
          statusFilter={statusFilter}
          areaFilter={areaFilter}
          searchQuery={searchQuery}
          areas={areas}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
          onViewModeChange={setViewMode}
          onStatusFilterChange={setStatusFilter}
          onAreaFilterChange={setAreaFilter}
          onSearchChange={setSearchQuery}
        />

        {/* Content */}
        {filteredInitiatives.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarClock className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                {datedInitiatives.length === 0
                  ? "Nenhuma iniciativa com datas definidas."
                  : "Nenhuma iniciativa corresponde aos filtros selecionados."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === "gantt" && <CronogramaGanttView initiatives={filteredInitiatives} />}
            {viewMode === "calendar" && (
              <CronogramaCalendarView
                currentMonth={currentMonth}
                currentYear={currentYear}
                initiatives={filteredInitiatives}
              />
            )}
            {viewMode === "list" && <CronogramaListView initiatives={filteredInitiatives} />}
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
