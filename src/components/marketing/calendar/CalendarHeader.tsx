import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search,
  CalendarDays,
  Grid3X3,
  List,
  GanttChartSquare,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SOURCE_FILTER_OPTIONS } from "@/hooks/useUnifiedCalendarEvents";

export type CalendarViewMode = "month" | "week" | "agenda" | "timeline";

export interface CalendarFilters {
  types: string[];
  statuses: string[];
  sources?: string[];
}

interface CalendarHeaderProps {
  currentMonth: number;
  currentYear: number;
  viewMode: CalendarViewMode;
  searchQuery: string;
  filters: CalendarFilters;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onSearchChange: (query: string) => void;
  onFiltersChange: (filters: CalendarFilters) => void;
  onNewAction: () => void;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const TYPE_OPTIONS = [
  { value: "campaign", label: "Campanhas", color: "#10B981" },
  { value: "goal", label: "Metas", color: "#8B5CF6" },
  { value: "event", label: "Eventos", color: "#F59E0B" },
  { value: "meeting", label: "Reuniões", color: "#3B82F6" },
  { value: "deadline", label: "Prazos", color: "#EF4444" },
];

const STATUS_OPTIONS = [
  { value: "planned", label: "Planejado" },
  { value: "in_progress", label: "Em Andamento" },
  { value: "completed", label: "Concluído" },
  { value: "cancelled", label: "Cancelado" },
];

export function CalendarHeader({
  currentMonth,
  currentYear,
  viewMode,
  searchQuery,
  filters,
  onPreviousMonth,
  onNextMonth,
  onToday,
  onViewModeChange,
  onSearchChange,
  onFiltersChange,
  onNewAction,
}: CalendarHeaderProps) {
  const toggleTypeFilter = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    onFiltersChange({ ...filters, types: newTypes });
  };

  const toggleStatusFilter = (status: string) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  const toggleSourceFilter = (source: string) => {
    const current = filters.sources || [];
    const newSources = current.includes(source)
      ? current.filter(s => s !== source)
      : [...current, source];
    onFiltersChange({ ...filters, sources: newSources });
  };

  const activeFiltersCount = filters.types.length + filters.statuses.length + (filters.sources?.length || 0);

  return (
    <div className="space-y-3">
      {/* Top Row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-semibold whitespace-nowrap">
          {MONTHS[currentMonth]} de {currentYear}
        </h2>

        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
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
          
          <Button size="sm" onClick={onNewAction} className="h-7 bg-app-gestao hover:bg-app-gestao/90 text-xs gap-1">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Nova Ação</span>
          </Button>
        </div>
      </div>

      {/* Second Row - View Tabs, Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Tabs value={viewMode} onValueChange={(v) => onViewModeChange(v as CalendarViewMode)}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="month" className="gap-1.5">
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">Mês</span>
            </TabsTrigger>
            <TabsTrigger value="week" className="gap-1.5">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Semana</span>
            </TabsTrigger>
            <TabsTrigger value="agenda" className="gap-1.5">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-1.5">
              <GanttChartSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Source Filters */}
          <div className="hidden lg:flex items-center gap-1.5">
            {SOURCE_FILTER_OPTIONS.map((source) => (
              <Badge
                key={source.value}
                variant={(filters.sources || []).includes(source.value) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all hover:scale-105",
                  (filters.sources || []).includes(source.value) && "ring-1 ring-offset-1 ring-offset-background"
                )}
                style={{
                  backgroundColor: (filters.sources || []).includes(source.value) ? `${source.color}30` : undefined,
                  borderColor: source.color,
                  color: (filters.sources || []).includes(source.value) ? source.color : undefined,
                }}
                onClick={() => toggleSourceFilter(source.value)}
              >
                <div className="h-2 w-2 rounded-full mr-1.5" style={{ backgroundColor: source.color }} />
                {source.label}
              </Badge>
            ))}
          </div>

          {/* Advanced Filters Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Filter className="h-4 w-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="h-5 w-5 p-0 justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Tipos</h4>
                  <div className="space-y-2">
                    {TYPE_OPTIONS.map((type) => (
                      <div key={type.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`type-${type.value}`}
                          checked={filters.types.includes(type.value)}
                          onCheckedChange={() => toggleTypeFilter(type.value)}
                        />
                        <Label 
                          htmlFor={`type-${type.value}`}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <div 
                            className="h-2.5 w-2.5 rounded-full" 
                            style={{ backgroundColor: type.color }}
                          />
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Status</h4>
                  <div className="space-y-2">
                    {STATUS_OPTIONS.map((status) => (
                      <div key={status.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`status-${status.value}`}
                          checked={filters.statuses.includes(status.value)}
                          onCheckedChange={() => toggleStatusFilter(status.value)}
                        />
                        <Label 
                          htmlFor={`status-${status.value}`}
                          className="text-sm cursor-pointer"
                        >
                          {status.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={() => onFiltersChange({ types: [], statuses: [], sources: [] })}
                  >
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
