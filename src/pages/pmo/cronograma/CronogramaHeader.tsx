import { ChevronLeft, ChevronRight, Search, GanttChartSquare, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export type CronogramaViewMode = "gantt" | "calendar" | "list";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  backlog: { label: "Backlog", color: "text-muted-foreground", bg: "bg-muted" },
  planejado: { label: "Planejado", color: "text-blue-400", bg: "bg-blue-500/20" },
  em_andamento: { label: "Em andamento", color: "text-amber-400", bg: "bg-amber-500/20" },
  concluido: { label: "Concluído", color: "text-emerald-400", bg: "bg-emerald-500/20" },
  cancelado: { label: "Cancelado", color: "text-destructive", bg: "bg-destructive/20" },
  pausado: { label: "Pausado", color: "text-orange-400", bg: "bg-orange-500/20" },
};

export const STATUS_COLORS: Record<string, string> = {
  backlog: "hsl(var(--muted-foreground))",
  planejado: "#60a5fa",
  em_andamento: "#fbbf24",
  concluido: "#34d399",
  cancelado: "#ef4444",
  pausado: "#fb923c",
};

interface CronogramaHeaderProps {
  currentMonth: number;
  currentYear: number;
  viewMode: CronogramaViewMode;
  statusFilter: string;
  areaFilter: string;
  searchQuery: string;
  areas: string[];
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onViewModeChange: (mode: CronogramaViewMode) => void;
  onStatusFilterChange: (value: string) => void;
  onAreaFilterChange: (value: string) => void;
  onSearchChange: (query: string) => void;
}

export function CronogramaHeader({
  currentMonth,
  currentYear,
  viewMode,
  statusFilter,
  areaFilter,
  searchQuery,
  areas,
  onPreviousMonth,
  onNextMonth,
  onToday,
  onViewModeChange,
  onStatusFilterChange,
  onAreaFilterChange,
  onSearchChange,
}: CronogramaHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-semibold whitespace-nowrap">
          {MONTHS[currentMonth]} de {currentYear}
        </h2>

        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar iniciativa..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 w-32 lg:w-48 h-7 text-xs"
            />
          </div>

          <div className="flex items-center border border-border/50 rounded-md">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-r-none" onClick={onPreviousMonth}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs px-2 rounded-none border-x border-border/50" onClick={onToday}>
              Hoje
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-l-none" onClick={onNextMonth}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Tabs value={viewMode} onValueChange={(v) => onViewModeChange(v as CronogramaViewMode)}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="gantt" className="gap-1.5">
              <GanttChartSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Gantt</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-1.5">
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">Calendário</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-1.5">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Lista</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[140px] h-7 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {areas.length > 0 && (
            <Select value={areaFilter} onValueChange={onAreaFilterChange}>
              <SelectTrigger className="w-[140px] h-7 text-xs">
                <SelectValue placeholder="Área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as áreas</SelectItem>
                {areas.map(a => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
}
