import { useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { format, differenceInDays, startOfDay, addDays, differenceInCalendarDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MarketingDemand,
  demandStatusConfig,
  demandPriorityConfig,
  demandTypeConfig,
} from "@/hooks/useMarketingDemands";
import { useTenantProfiles } from "@/hooks/useTenantProfiles";
import { Virtuoso } from "react-virtuoso";

interface DemandaTimelineProps {
  demands: MarketingDemand[];
  onDemandClick: (demand: MarketingDemand) => void;
}

type RangeOption = "14d" | "30d" | "60d";

const RANGE_DAYS: Record<RangeOption, number> = { "14d": 14, "30d": 30, "60d": 60 };
const RANGE_LABELS: Record<RangeOption, string> = { "14d": "14 dias", "30d": "30 dias", "60d": "60 dias" };
const DAY_WIDTH = 36;

export function DemandaTimeline({ demands, onDemandClick }: DemandaTimelineProps) {
  const { resolveName, resolveInitials } = useTenantProfiles();
  const [range, setRange] = useState<RangeOption>("30d");
  const [offset, setOffset] = useState(0); // days offset from today

  const today = startOfDay(new Date());
  const totalDays = RANGE_DAYS[range];
  const windowStart = addDays(today, offset);
  const windowEnd = addDays(windowStart, totalDays);

  // Group demands by assigned_to, filter to those visible in window
  const timelineRows = useMemo(() => {
    const grouped: Record<string, MarketingDemand[]> = {};
    demands.forEach((d) => {
      const barStart = startOfDay(new Date(d.created_at));
      const barEnd = d.due_date ? startOfDay(new Date(d.due_date)) : addDays(barStart, 7);
      // Check overlap with window
      if (barEnd >= windowStart && barStart <= windowEnd) {
        const key = d.assigned_to || "__unassigned__";
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(d);
      }
    });
    return Object.entries(grouped)
      .map(([userId, userDemands]) => ({ userId, demands: userDemands }))
      .sort((a, b) => {
        if (a.userId === "__unassigned__") return 1;
        if (b.userId === "__unassigned__") return -1;
        return resolveName(a.userId).localeCompare(resolveName(b.userId));
      });
  }, [demands, windowStart, windowEnd, resolveName]);

  // Week markers within the window
  const weekMarkers = useMemo(() => {
    const markers = [];
    for (let i = 0; i < totalDays; i += 7) {
      markers.push({ day: i, date: addDays(windowStart, i) });
    }
    return markers;
  }, [totalDays, windowStart]);

  const todayOffset = differenceInDays(today, windowStart);

  const handlePrev = useCallback(() => setOffset((o) => o - Math.floor(totalDays / 2)), [totalDays]);
  const handleNext = useCallback(() => setOffset((o) => o + Math.floor(totalDays / 2)), [totalDays]);
  const handleToday = useCallback(() => setOffset(0), []);

  if (demands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Sem demandas para visualizar</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Crie demandas com datas de vencimento para visualizar a timeline
        </p>
      </div>
    );
  }

  const ROW_HEIGHT = 64;
  const SIDEBAR_WIDTH = 180;

  const renderRow = (index: number) => {
    const row = timelineRows[index];
    return (
      <div className="flex border-b border-border/30" style={{ height: ROW_HEIGHT }}>
        {/* User sidebar */}
        <div
          className="shrink-0 px-3 border-r bg-muted/30 flex items-center gap-2"
          style={{ width: SIDEBAR_WIDTH }}
        >
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px] bg-app-gestao/20 text-app-gestao">
              {resolveInitials(row.userId === "__unassigned__" ? null : row.userId)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-foreground truncate">
            {row.userId === "__unassigned__"
              ? "Sem responsável"
              : resolveName(row.userId)}
          </span>
        </div>

        {/* Timeline bars */}
        <div className="relative flex-1" style={{ width: totalDays * DAY_WIDTH, minWidth: totalDays * DAY_WIDTH }}>
          {weekMarkers.map((m, i) => (
            <div
              key={i}
              className="absolute top-0 h-full border-l border-border/20"
              style={{ left: m.day * DAY_WIDTH }}
            />
          ))}
          {row.demands.map((demand) => (
            <TimelineBar
              key={demand.id}
              demand={demand}
              windowStart={windowStart}
              totalDays={totalDays}
              today={today}
              onDemandClick={onDemandClick}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-lg border bg-card/50 overflow-hidden flex flex-col">
      {/* Controls */}
      <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleToday}>
          Hoje
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Select value={range} onValueChange={(v) => setRange(v as RangeOption)}>
          <SelectTrigger className="h-7 w-24 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(RANGE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-[10px] text-muted-foreground ml-auto">
          {format(windowStart, "dd MMM", { locale: ptBR })} — {format(windowEnd, "dd MMM yyyy", { locale: ptBR })}
        </span>
      </div>

      <ScrollArea className="w-full flex-1">
        <div className="min-w-max">
          {/* Date header */}
          <div className="sticky top-0 z-10 bg-card border-b flex">
            <div className="shrink-0 p-2 border-r bg-muted/50" style={{ width: SIDEBAR_WIDTH }}>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Responsável
              </span>
            </div>
            <div className="relative" style={{ width: totalDays * DAY_WIDTH }}>
              {weekMarkers.map((m, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full border-l border-border/40"
                  style={{ left: m.day * DAY_WIDTH }}
                >
                  <span className="absolute top-1.5 left-1.5 text-[10px] text-muted-foreground whitespace-nowrap">
                    {format(m.date, "dd MMM", { locale: ptBR })}
                  </span>
                </div>
              ))}
              {todayOffset >= 0 && todayOffset <= totalDays && (
                <div
                  className="absolute top-0 h-full w-0.5 bg-app-gestao z-20"
                  style={{ left: todayOffset * DAY_WIDTH }}
                >
                  <span className="absolute -top-0 -left-3 px-1.5 py-0.5 bg-app-gestao text-white text-[10px] rounded-b font-medium">
                    Hoje
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Virtualized rows */}
          {timelineRows.length <= 15 ? (
            <div>{timelineRows.map((_, i) => <div key={timelineRows[i].userId}>{renderRow(i)}</div>)}</div>
          ) : (
            <Virtuoso
              style={{ height: Math.min(timelineRows.length * ROW_HEIGHT, 600) }}
              totalCount={timelineRows.length}
              fixedItemHeight={ROW_HEIGHT}
              itemContent={renderRow}
            />
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

/* ─── Individual bar ─── */

function TimelineBar({
  demand,
  windowStart,
  totalDays,
  today,
  onDemandClick,
}: {
  demand: MarketingDemand;
  windowStart: Date;
  totalDays: number;
  today: Date;
  onDemandClick: (d: MarketingDemand) => void;
}) {
  const barStartDate = startOfDay(new Date(demand.created_at));
  const barEndDate = demand.due_date ? startOfDay(new Date(demand.due_date)) : addDays(barStartDate, 7);

  const startDay = Math.max(differenceInDays(barStartDate, windowStart), 0);
  const endDay = Math.min(differenceInDays(barEndDate, windowStart), totalDays);
  const duration = Math.max(endDay - startDay, 1);

  const isOverdue =
    demand.due_date &&
    new Date(demand.due_date) < today &&
    !["completed", "cancelled", "approved"].includes(demand.status);

  const statusCfg = demandStatusConfig[demand.status];
  const priorityCfg = demandPriorityConfig[demand.priority];
  const typeCfg = demandTypeConfig[demand.type];

  const daysRemaining = demand.due_date
    ? differenceInCalendarDays(new Date(demand.due_date), today)
    : null;

  const daysLabel =
    daysRemaining === null
      ? null
      : isOverdue
        ? `${Math.abs(daysRemaining)}d atrasado`
        : daysRemaining === 0
          ? "Vence hoje"
          : daysRemaining < 0
            ? null
            : `${daysRemaining}d restantes`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className={cn(
              "absolute top-3 h-9 rounded cursor-pointer transition-all",
              "hover:brightness-110 hover:shadow-md",
              isOverdue ? "bg-destructive/80 border-destructive" : statusCfg.bgColor,
              "border",
              !isOverdue && "border-transparent"
            )}
            style={{
              left: startDay * DAY_WIDTH,
              width: duration * DAY_WIDTH - 4,
              transformOrigin: "left",
            }}
            onClick={() => onDemandClick(demand)}
          >
            <div className="px-1.5 py-0.5 flex items-center gap-1 h-full overflow-hidden">
              <span className={cn("text-[10px] font-medium truncate", isOverdue ? "text-destructive-foreground" : statusCfg.color)}>
                {demand.title}
              </span>
              {isOverdue && <Clock className="h-3 w-3 text-destructive-foreground shrink-0" />}
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs p-3">
          <div className="space-y-1.5">
            <p className="font-medium text-sm">{demand.title}</p>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span>{typeCfg.icon} {typeCfg.label}</span>
              <span className="text-muted-foreground">•</span>
              <span className={priorityCfg.color}>{priorityCfg.label}</span>
              <span className="text-muted-foreground">•</span>
              <span className={statusCfg.color}>{statusCfg.label}</span>
            </div>
            {demand.due_date && (
              <p className="text-[11px] text-muted-foreground">
                Prazo: {format(new Date(demand.due_date), "dd/MM/yyyy")}
                {daysLabel && (
                  <span className={cn("ml-1.5 font-medium", isOverdue ? "text-destructive" : "text-foreground")}>
                    ({daysLabel})
                  </span>
                )}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
