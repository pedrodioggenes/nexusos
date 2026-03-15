import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { usePDIPhases, usePDICycles, useUpdatePDIPhase, useUpdatePDICycle } from "@/hooks/usePMO";
import {
  Target, Calendar, Clock, CheckCircle, AlertTriangle, Shield,
  ChevronDown, ChevronUp, Pencil, Save, X, Milestone,
  ChevronLeft, ChevronRight, LayoutGrid,
} from "lucide-react";
import { ReportButton } from "@/components/pmo/ReportGeneratorDialog";
import { format, parseISO, differenceInDays, isAfter, isBefore, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth, isWithinInterval, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  planejado: { label: "Planejado", color: "bg-muted text-muted-foreground", icon: <Clock className="h-3 w-3" /> },
  em_andamento: { label: "Em andamento", color: "bg-blue-500/10 text-blue-500 border-blue-500/30", icon: <Target className="h-3 w-3" /> },
  em_risco: { label: "Em risco", color: "bg-amber-500/10 text-amber-500 border-amber-500/30", icon: <AlertTriangle className="h-3 w-3" /> },
  atrasado: { label: "Atrasado", color: "bg-destructive/10 text-destructive border-destructive/30", icon: <AlertTriangle className="h-3 w-3" /> },
  concluido: { label: "Concluído", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30", icon: <CheckCircle className="h-3 w-3" /> },
  suspenso: { label: "Suspenso", color: "bg-muted text-muted-foreground", icon: <Shield className="h-3 w-3" /> },
};


const priorityLabels: Record<string, string> = { alta: "Alta", media: "Média", baixa: "Baixa" };

const PHASE_HEX_COLORS = [
  "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B",
  "#EC4899", "#EF4444", "#06B6D4", "#F97316",
];

const WEEKDAYS_LABEL = ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."];

function PhaseCalendarView({ phases, statusConfig, onPhaseClick }: {
  phases: any[];
  statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }>;
  onPhaseClick: (id: string) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredPhase, setHoveredPhase] = useState<string | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startPad = getDay(monthStart);
  const paddedDays: (Date | null)[] = [
    ...Array(startPad).fill(null),
    ...days,
  ];
  while (paddedDays.length % 7 !== 0) paddedDays.push(null);

  const phasesWithDates = phases.filter(p => p.start_date && p.end_date).map((p, i) => ({
    ...p,
    _start: startOfDay(parseISO(p.start_date)),
    _end: startOfDay(parseISO(p.end_date)),
    _hex: PHASE_HEX_COLORS[i % PHASE_HEX_COLORS.length],
  }));

  const getPhaseForDay = (day: Date) =>
    phasesWithDates.filter(p => isWithinInterval(day, { start: p._start, end: p._end }));

  const today = startOfDay(new Date());

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-app-pmo" />
          <span className="text-sm font-semibold capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-xl border border-border/40 overflow-hidden bg-card/30">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-border/40 bg-muted/20">
          {WEEKDAYS_LABEL.map((day, i) => (
            <div key={day} className={cn(
              "py-2.5 text-center text-[11px] font-medium uppercase tracking-wider",
              i === 0 || i === 6 ? "text-muted-foreground/50" : "text-muted-foreground/70"
            )}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {Array.from({ length: paddedDays.length / 7 }, (_, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 border-b border-border/20 last:border-b-0">
            {paddedDays.slice(weekIdx * 7, weekIdx * 7 + 7).map((day, dayIdx) => {
              const cellIdx = weekIdx * 7 + dayIdx;
              if (!day) {
                return <div key={`pad-${cellIdx}`} className="min-h-[100px] bg-muted/5 border-r border-border/15 last:border-r-0" />;
              }

              const isToday = day.getTime() === today.getTime();
              const dayPhases = getPhaseForDay(day);

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "relative min-h-[100px] border-r border-border/15 last:border-r-0 p-1 transition-colors",
                    !isSameMonth(day, currentMonth) && "bg-muted/5",
                    isToday && "bg-primary/[0.03]"
                  )}
                >
                  {/* Day number */}
                  <div className="flex items-center justify-between px-0.5 pt-0.5 pb-1">
                    <span className={cn(
                      "text-xs h-6 w-6 flex items-center justify-center rounded-full transition-colors",
                      isToday && "bg-app-pmo text-white font-bold",
                      !isToday && isSameMonth(day, currentMonth) && "text-foreground/80",
                      !isToday && !isSameMonth(day, currentMonth) && "text-muted-foreground/30"
                    )}>
                      {day.getDate() === 1 ? format(day, "d MMM", { locale: ptBR }) : day.getDate()}
                    </span>
                  </div>

                  {/* Phase bars */}
                  <div className="space-y-0.5">
                    {dayPhases.slice(0, 3).map(phase => {
                      const isStart = day.getTime() === phase._start.getTime();
                      const isEnd = day.getTime() === phase._end.getTime();
                      const isHovered = hoveredPhase === phase.id;
                      return (
                        <Tooltip key={phase.id}>
                          <TooltipTrigger asChild>
                            <div
                              onClick={() => onPhaseClick(phase.id)}
                              onMouseEnter={() => setHoveredPhase(phase.id)}
                              onMouseLeave={() => setHoveredPhase(null)}
                              className={cn(
                                "flex items-center gap-1 px-1 py-0.5 text-[10px] font-medium truncate cursor-pointer transition-all",
                                isStart ? "rounded-l" : "",
                                isEnd ? "rounded-r" : "",
                                isHovered && "ring-1 ring-white/30 brightness-110"
                              )}
                              style={{
                                backgroundColor: `${phase._hex}25`,
                                color: phase._hex,
                                borderLeft: isStart ? `3px solid ${phase._hex}` : undefined,
                              }}
                            >
                              <span className="truncate">
                                {isStart ? `F${phase.phase_number} ${phase.name}` : ""}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[220px]">
                            <div className="space-y-1.5">
                              <p className="font-semibold text-xs">Fase {phase.phase_number}: {phase.name}</p>
                              <div className="flex items-center gap-2">
                                <Progress value={phase.progress} className="h-1 flex-1" />
                                <span className="text-[10px] font-medium">{phase.progress}%</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground">
                                {(statusConfig[phase.status] || statusConfig.planejado).label}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {format(phase._start, "dd/MM/yyyy")} → {format(phase._end, "dd/MM/yyyy")}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                    {dayPhases.length > 3 && (
                      <span className="text-[9px] text-muted-foreground px-1">+{dayPhases.length - 3} mais</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-1">
        {phasesWithDates.map(phase => (
          <div
            key={phase.id}
            className={cn(
              "flex items-center gap-2 cursor-pointer rounded-md px-2 py-1 transition-all",
              hoveredPhase === phase.id ? "bg-muted" : "hover:bg-muted/50"
            )}
            onClick={() => onPhaseClick(phase.id)}
            onMouseEnter={() => setHoveredPhase(phase.id)}
            onMouseLeave={() => setHoveredPhase(null)}
          >
            <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: phase._hex }} />
            <span className="text-[11px] text-muted-foreground font-medium">F{phase.phase_number}: {phase.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}



export default function PDICronograma() {
  const { data: phases = [], isLoading: pLoading } = usePDIPhases();
  const { data: cycles = [], isLoading: cLoading } = usePDICycles();
  const updatePhase = useUpdatePDIPhase();
  const updateCycle = useUpdatePDICycle();

  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [editingPhase, setEditingPhase] = useState<string | null>(null);
  const [editingCycle, setEditingCycle] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});

  const isLoading = pLoading || cLoading;

  const togglePhase = (id: string) => setExpandedPhase(prev => prev === id ? null : id);

  const startEditPhase = (phase: any) => {
    setEditingPhase(phase.id);
    setEditForm({ ...phase });
  };

  const savePhase = () => {
    if (!editingPhase) return;
    const { id, created_at, updated_at, tenant_id, ...values } = editForm;
    updatePhase.mutate({ id: editingPhase, ...values });
    setEditingPhase(null);
  };

  const startEditCycle = (cycle: any) => {
    setEditingCycle(cycle.id);
    setEditForm({ ...cycle });
  };

  const saveCycle = () => {
    if (!editingCycle) return;
    const { id, created_at, updated_at, tenant_id, ...values } = editForm;
    updateCycle.mutate({ id: editingCycle, ...values });
    setEditingCycle(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-pmo" />
      </div>
    );
  }

  // Timeline visual
  const allDates = phases.filter(p => p.start_date && p.end_date);
  const minDate = allDates.length > 0 ? new Date(Math.min(...allDates.map(p => new Date(p.start_date!).getTime()))) : new Date();
  const maxDate = allDates.length > 0 ? new Date(Math.max(...allDates.map(p => new Date(p.end_date!).getTime()))) : new Date();
  const totalDays = Math.max(differenceInDays(maxDate, minDate), 1);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <PageHeader
          title="Cronograma Executivo — PDI"
          description="Fases, marcos (Gates) e ciclos de entrega do Plano Diretor de Implantação"
          actions={<ReportButton reportType="pdi_status" label="Relatório PDI" />}
        />

        {/* Phase Timeline / Calendar Overview */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Milestone className="h-4 w-4 text-app-pmo" />
                Timeline de Fases
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="mb-3 h-8">
                <TabsTrigger value="timeline" className="text-xs gap-1.5"><Milestone className="h-3 w-3" />Timeline</TabsTrigger>
                <TabsTrigger value="calendar" className="text-xs gap-1.5"><LayoutGrid className="h-3 w-3" />Calendário</TabsTrigger>
              </TabsList>

              {/* Timeline View - Gantt style */}
              <TabsContent value="timeline" className="mt-0">
                <div className="rounded-xl border border-border/40 overflow-hidden bg-card/30">
                  {/* Timeline header with month markers */}
                  <div className="h-9 border-b border-border/40 bg-muted/20 px-3 py-1.5">
                    <div className="relative h-full pl-[180px]">
                      {(() => {
                        const months: { label: string; leftPct: number }[] = [];
                        let d = new Date(minDate);
                        while (d <= maxDate) {
                          const leftPct = (differenceInDays(d, minDate) / totalDays) * 100;
                          months.push({ label: format(d, "MMM yy", { locale: ptBR }), leftPct });
                          d = addMonths(startOfMonth(d), 1);
                        }
                        return months.map((m, idx) => (
                          <span
                            key={idx}
                            className="absolute top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
                            style={{ left: `calc(${m.leftPct}% + 2px)` }}
                          >
                            {m.label}
                          </span>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Phase bars */}
                  <div className="divide-y divide-border/20">
                    {phases.map((phase, idx) => {
                      if (!phase.start_date || !phase.end_date) return null;
                      const start = new Date(phase.start_date);
                      const end = new Date(phase.end_date);
                      const leftPct = (differenceInDays(start, minDate) / totalDays) * 100;
                      const widthPct = Math.max((differenceInDays(end, start) / totalDays) * 100, 3);
                      const st = statusConfig[phase.status] || statusConfig.planejado;
                      const todayDate = new Date();
                      const isActive = !isBefore(todayDate, start) && !isAfter(todayDate, end);
                      const hex = PHASE_HEX_COLORS[idx % PHASE_HEX_COLORS.length];

                      return (
                        <Tooltip key={phase.id}>
                          <TooltipTrigger asChild>
                            <div className="relative h-12 cursor-pointer hover:bg-muted/20 transition-colors group px-3" onClick={() => togglePhase(phase.id)}>
                              {/* Phase label on the left */}
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10 w-[170px]">
                                <div className="flex items-center justify-center h-6 w-6 rounded-md text-[10px] font-bold text-white shrink-0" style={{ backgroundColor: hex }}>
                                  F{phase.phase_number}
                                </div>
                                <span className="text-[11px] font-medium text-foreground truncate">{phase.name}</span>
                              </div>

                              {/* Timeline track area */}
                              <div className="absolute left-[183px] right-3 top-2.5 h-7">
                                {/* Bar */}
                                <div
                                  className="absolute h-full rounded-md transition-all group-hover:brightness-110 overflow-hidden"
                                  style={{
                                    left: `${Math.max(leftPct, 0)}%`,
                                    width: `${widthPct}%`,
                                    backgroundColor: `${hex}30`,
                                    borderLeft: `3px solid ${hex}`,
                                  }}
                                >
                                  {/* Progress fill */}
                                  <div
                                    className="absolute inset-y-0 left-0 rounded-r-md transition-all"
                                    style={{ width: `${phase.progress}%`, backgroundColor: `${hex}50` }}
                                  />
                                  {/* Progress label */}
                                  {widthPct > 8 && (
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold z-10" style={{ color: hex }}>
                                      {phase.progress}%
                                    </span>
                                  )}
                                </div>

                                {/* Today marker */}
                                {isActive && (() => {
                                  const todayPct = (differenceInDays(todayDate, minDate) / totalDays) * 100;
                                  return (
                    <div className="absolute top-0 bottom-0 w-0.5 bg-app-pmo z-20" style={{ left: `${todayPct}%` }}>
                      <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-app-pmo" />
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[220px]">
                            <div className="space-y-1.5">
                              <p className="font-semibold text-xs">Fase {phase.phase_number}: {phase.name}</p>
                              <div className="flex items-center gap-2">
                                <Progress value={phase.progress} className="h-1 flex-1" />
                                <span className="text-[10px] font-medium">{phase.progress}%</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground">{st.label}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {format(start, "dd/MM/yyyy")} → {format(end, "dd/MM/yyyy")}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* Calendar View */}
              <TabsContent value="calendar" className="mt-0">
                <PhaseCalendarView phases={phases} statusConfig={statusConfig} onPhaseClick={togglePhase} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Phases List */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
            <Target className="h-4 w-4 text-app-pmo" /> Fases do PDI
          </h2>
          {phases.map(phase => {
            const st = statusConfig[phase.status] || statusConfig.planejado;
            const isExpanded = expandedPhase === phase.id;
            const isEditing = editingPhase === phase.id;

            return (
              <Card key={phase.id} className={`transition-all ${isExpanded ? "ring-1 ring-app-pmo/20" : ""}`}>
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-secondary/20 transition-colors"
                  onClick={() => !isEditing && togglePhase(phase.id)}
                >
                  <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-app-pmo/10 text-app-pmo font-bold text-sm shrink-0">
                    F{phase.phase_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">{phase.name}</p>
                      <Badge variant="outline" className={`text-[10px] ${st.color} shrink-0`}>
                        {st.icon} <span className="ml-1">{st.label}</span>
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{phase.objective}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">Progresso</p>
                      <div className="flex items-center gap-2">
                        <Progress value={phase.progress} className="w-20 h-1.5" />
                        <span className="text-xs font-medium text-foreground">{phase.progress}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">Período</p>
                      <p className="text-xs text-foreground">
                        {phase.start_date ? format(parseISO(phase.start_date), "dd/MM", { locale: ptBR }) : "—"} →{" "}
                        {phase.end_date ? format(parseISO(phase.end_date), "dd/MM/yy", { locale: ptBR }) : "—"}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); startEditPhase(phase); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>

                {isExpanded && !isEditing && (
                  <CardContent className="pt-0 pb-4 px-4 border-t border-border/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Marco (Gate)</p>
                        <p className="text-sm text-foreground">{phase.gate_name || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Entregáveis</p>
                        <div className="flex flex-wrap gap-1">
                          {(phase.deliverables || "").split(";").filter(Boolean).map((d: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">{d.trim()}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Cadência</p>
                        <p className="text-sm text-foreground">{phase.cadence || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Sponsor</p>
                        <p className="text-sm text-foreground">{phase.sponsor || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Dono Operacional</p>
                        <p className="text-sm text-foreground">{phase.operational_owner || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Duração</p>
                        <p className="text-sm text-foreground">{phase.duration_days || "—"} dias</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Prioridade</p>
                        <p className="text-sm text-foreground">{priorityLabels[phase.priority] || phase.priority || "—"}</p>
                      </div>
                      {phase.observations && (
                        <div className="md:col-span-2">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Observações</p>
                          <p className="text-sm text-foreground">{phase.observations}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex justify-end sm:hidden">
                      <Button size="sm" variant="outline" onClick={() => startEditPhase(phase)}>
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                      </Button>
                    </div>
                  </CardContent>
                )}

                {isEditing && (
                  <CardContent className="pt-0 pb-4 px-4 border-t border-border/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                      <div>
                        <Label className="text-[10px]">Nome</Label>
                        <Input size="sm" value={editForm.name || ""} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-[10px]">Objetivo</Label>
                        <Input size="sm" value={editForm.objective || ""} onChange={e => setEditForm(f => ({ ...f, objective: e.target.value }))} />
                      </div>
                      <div>
                        <Label className="text-[10px]">Início</Label>
                        <Input size="sm" type="date" value={editForm.start_date || ""} onChange={e => setEditForm(f => ({ ...f, start_date: e.target.value }))} />
                      </div>
                      <div>
                        <Label className="text-[10px]">Fim</Label>
                        <Input size="sm" type="date" value={editForm.end_date || ""} onChange={e => setEditForm(f => ({ ...f, end_date: e.target.value }))} />
                      </div>
                      <div>
                        <Label className="text-[10px]">Duração (dias)</Label>
                        <Input size="sm" type="number" value={editForm.duration_days || ""} onChange={e => setEditForm(f => ({ ...f, duration_days: parseInt(e.target.value) || 0 }))} />
                      </div>
                      <div>
                        <Label className="text-[10px]">Marco (Gate)</Label>
                        <Input size="sm" value={editForm.gate_name || ""} onChange={e => setEditForm(f => ({ ...f, gate_name: e.target.value }))} />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-[10px]">Entregáveis (separados por ;)</Label>
                        <Textarea value={editForm.deliverables || ""} onChange={e => setEditForm(f => ({ ...f, deliverables: e.target.value }))} className="min-h-[60px]" />
                      </div>
                      <div>
                        <Label className="text-[10px]">Cadência</Label>
                        <Input size="sm" value={editForm.cadence || ""} onChange={e => setEditForm(f => ({ ...f, cadence: e.target.value }))} />
                      </div>
                      <div>
                        <Label className="text-[10px]">Sponsor</Label>
                        <Input size="sm" value={editForm.sponsor || ""} onChange={e => setEditForm(f => ({ ...f, sponsor: e.target.value }))} />
                      </div>
                      <div>
                        <Label className="text-[10px]">Dono Operacional</Label>
                        <Input size="sm" value={editForm.operational_owner || ""} onChange={e => setEditForm(f => ({ ...f, operational_owner: e.target.value }))} />
                      </div>
                      <div>
                        <Label className="text-[10px]">Status</Label>
                        <Select value={editForm.status || "planejado"} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusConfig).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[10px]">% Conclusão</Label>
                        <Input size="sm" type="number" min={0} max={100} value={editForm.progress ?? 0} onChange={e => setEditForm(f => ({ ...f, progress: parseInt(e.target.value) || 0 }))} />
                      </div>
                      <div>
                        <Label className="text-[10px]">Prioridade</Label>
                        <Select value={editForm.priority || "alta"} onValueChange={v => setEditForm(f => ({ ...f, priority: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alta">Alta</SelectItem>
                            <SelectItem value="media">Média</SelectItem>
                            <SelectItem value="baixa">Baixa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-[10px]">Observações</Label>
                        <Textarea value={editForm.observations || ""} onChange={e => setEditForm(f => ({ ...f, observations: e.target.value }))} className="min-h-[50px]" />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-[10px]">Links/Evidências</Label>
                        <Input size="sm" value={editForm.evidence_links || ""} onChange={e => setEditForm(f => ({ ...f, evidence_links: e.target.value }))} />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end mt-4">
                      <Button size="sm" variant="ghost" onClick={() => setEditingPhase(null)}>
                        <X className="h-3.5 w-3.5 mr-1" /> Cancelar
                      </Button>
                      <Button size="sm" className="bg-app-pmo hover:bg-app-pmo/90 text-white" onClick={savePhase}>
                        <Save className="h-3.5 w-3.5 mr-1" /> Salvar
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Cycles */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
            <Calendar className="h-4 w-4 text-app-pmo" /> Ciclos de Entrega (90 dias)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cycles.map(cycle => {
              const st = statusConfig[cycle.status] || statusConfig.planejado;
              const isEditing = editingCycle === cycle.id;

              if (isEditing) {
                return (
                  <Card key={cycle.id} className="ring-1 ring-app-pmo/20">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-app-pmo/10 text-app-pmo border-app-pmo/30 text-xs font-bold">{editForm.cycle_code}</Badge>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setEditingCycle(null)}><X className="h-3.5 w-3.5" /></Button>
                          <Button size="sm" className="bg-app-pmo hover:bg-app-pmo/90 text-white" onClick={saveCycle}><Save className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <Label className="text-[10px]">Período</Label>
                          <Input size="sm" value={editForm.period || ""} onChange={e => setEditForm(f => ({ ...f, period: e.target.value }))} />
                        </div>
                        <div>
                          <Label className="text-[10px]">Top Iniciativas</Label>
                          <Textarea value={editForm.top_initiatives || ""} onChange={e => setEditForm(f => ({ ...f, top_initiatives: e.target.value }))} className="min-h-[50px]" />
                        </div>
                        <div>
                          <Label className="text-[10px]">Por que agora</Label>
                          <Input size="sm" value={editForm.why_now || ""} onChange={e => setEditForm(f => ({ ...f, why_now: e.target.value }))} />
                        </div>
                        <div>
                          <Label className="text-[10px]">Resultado esperado</Label>
                          <Input size="sm" value={editForm.expected_result || ""} onChange={e => setEditForm(f => ({ ...f, expected_result: e.target.value }))} />
                        </div>
                        <div>
                          <Label className="text-[10px]">Critério de Pronto</Label>
                          <Input size="sm" value={editForm.done_criteria || ""} onChange={e => setEditForm(f => ({ ...f, done_criteria: e.target.value }))} />
                        </div>
                        <div>
                          <Label className="text-[10px]">Dono</Label>
                          <Input size="sm" value={editForm.owner || ""} onChange={e => setEditForm(f => ({ ...f, owner: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[10px]">Status</Label>
                            <Select value={editForm.status || "planejado"} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {Object.entries(statusConfig).map(([k, v]) => (
                                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-[10px]">% Conclusão</Label>
                            <Input size="sm" type="number" min={0} max={100} value={editForm.progress ?? 0} onChange={e => setEditForm(f => ({ ...f, progress: parseInt(e.target.value) || 0 }))} />
                          </div>
                        </div>
                        <div>
                          <Label className="text-[10px]">Observações</Label>
                          <Textarea value={editForm.observations || ""} onChange={e => setEditForm(f => ({ ...f, observations: e.target.value }))} className="min-h-[40px]" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <Card key={cycle.id} className="hover:border-app-pmo/20 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-app-pmo/10 text-app-pmo border-app-pmo/30 text-xs font-bold">{cycle.cycle_code}</Badge>
                        <span className="text-xs text-muted-foreground">{cycle.period}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className={`text-[10px] ${st.color}`}>
                          {st.icon} <span className="ml-1">{st.label}</span>
                        </Badge>
                        <Button size="sm" variant="ghost" onClick={() => startEditCycle(cycle)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {cycle.top_initiatives && (
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase">Top Iniciativas</p>
                          <p className="text-xs text-foreground">{cycle.top_initiatives}</p>
                        </div>
                      )}
                      {cycle.why_now && (
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase">Por que agora</p>
                          <p className="text-xs text-foreground">{cycle.why_now}</p>
                        </div>
                      )}
                      {cycle.expected_result && (
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase">Resultado esperado</p>
                          <p className="text-xs text-foreground">{cycle.expected_result}</p>
                        </div>
                      )}
                      {cycle.done_criteria && (
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase">Critério de Pronto</p>
                          <p className="text-xs text-foreground">{cycle.done_criteria}</p>
                        </div>
                      )}
                      {cycle.owner && (
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase">Dono</p>
                          <p className="text-xs text-foreground">{cycle.owner}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Progress value={cycle.progress} className="flex-1 h-1.5" />
                      <span className="text-xs font-medium text-foreground">{cycle.progress}%</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
