import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  format,
  eachDayOfInterval,
  isSameDay,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PremiumGlassCard } from "@/components/dashboard/PremiumGlassCard";
import { useMarketingDemands, MarketingDemand, demandStatusConfig } from "@/hooks/useMarketingDemands";
import { cn } from "@/lib/utils";

interface SocialCalendarProps {
  onDemandClick: (demand: MarketingDemand) => void;
}

const socialBadgeColors: Record<string, string> = {
  instagram: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  facebook: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  tiktok: "bg-slate-300/20 text-foreground border-slate-400/30",
  youtube: "bg-red-500/20 text-red-400 border-red-500/30",
  linkedin: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  twitter: "bg-slate-400/20 text-slate-300 border-slate-400/30",
};

function getSocialTag(tags: string[]): string | null {
  const socials = Object.keys(socialBadgeColors);
  const found = tags.find((t) => socials.includes(t.toLowerCase()));
  return found ? found.toLowerCase() : null;
}

const statusColorMap: Record<string, string> = {
  open: "border-l-muted-foreground",
  in_progress: "border-l-blue-500",
  review: "border-l-yellow-500",
  approved: "border-l-green-500",
  completed: "border-l-indigo-500",
  cancelled: "border-l-destructive",
};

export function SocialCalendar({ onDemandClick }: SocialCalendarProps) {
  const navigate = useNavigate();
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const { data: socialDemands = [] } = useMarketingDemands({ type: "social_media" });

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });

  const demandsByDay = useMemo(() => {
    const map = new Map<string, MarketingDemand[]>();
    weekDays.forEach((day) => {
      const key = format(day, "yyyy-MM-dd");
      map.set(key, []);
    });
    socialDemands.forEach((d) => {
      if (!d.due_date) return;
      const dueDate = parseISO(d.due_date);
      const key = format(dueDate, "yyyy-MM-dd");
      if (map.has(key)) {
        map.get(key)!.push(d);
      }
    });
    return map;
  }, [socialDemands, weekDays]);

  const weekLabel = `${format(currentWeekStart, "dd MMM", { locale: ptBR })} – ${format(weekEnd, "dd MMM yyyy", { locale: ptBR })}`;

  const handleCreatePost = (date?: Date) => {
    const params = new URLSearchParams({ type: "social_media" });
    if (date) params.set("due_date", format(date, "yyyy-MM-dd"));
    navigate(`/app/marketing/demandas/nova?${params.toString()}`);
  };

  return (
    <PremiumGlassCard className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-foreground">Calendário de Postagens</h3>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8"
            onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[140px] sm:min-w-[180px] text-center capitalize">
            {weekLabel}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" className="gap-1.5 ml-2" onClick={() => handleCreatePost()}>
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Criar Post</span>
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="w-full overflow-x-auto">
      <div className="grid grid-cols-7 gap-px rounded-xl overflow-hidden border border-border bg-border min-w-[500px]">
        {/* Day Headers */}
        {weekDays.map((day) => (
          <div
            key={`header-${day.toISOString()}`}
            className="bg-muted/60 px-1 sm:px-2 py-2 text-center"
          >
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase">
              {format(day, "EEE", { locale: ptBR })}
            </p>
            <p className={cn(
              "text-xs sm:text-sm font-semibold mt-0.5",
              isSameDay(day, new Date()) ? "text-primary" : "text-foreground"
            )}>
              {format(day, "dd")}
            </p>
          </div>
        ))}

        {/* Day Cells */}
        {weekDays.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayDemands = demandsByDay.get(key) || [];
          const visibleCount = 2;
          const visible = dayDemands.slice(0, visibleCount);
          const remaining = dayDemands.length - visibleCount;

          return (
            <div
              key={key}
              className={cn(
                "bg-card min-h-[100px] p-1.5 flex flex-col gap-1 relative group",
                isSameDay(day, new Date()) && "bg-primary/5"
              )}
            >
              {visible.map((demand) => {
                const social = getSocialTag(demand.tags || []);
                return (
                  <button
                    key={demand.id}
                    onClick={() => onDemandClick(demand)}
                    className={cn(
                      "w-full text-left rounded-lg p-1.5 border-l-[3px] bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer",
                      statusColorMap[demand.status] || "border-l-muted"
                    )}
                  >
                    <p className="text-[11px] font-medium text-foreground truncate leading-tight">
                      {demand.title}
                    </p>
                    {social && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] px-1 py-0 mt-0.5 h-4 capitalize",
                          socialBadgeColors[social] || ""
                        )}
                      >
                        {social}
                      </Badge>
                    )}
                  </button>
                );
              })}
              {remaining > 0 && (
                <span className="text-[10px] text-muted-foreground text-center">
                  +{remaining} mais
                </span>
              )}

              {/* Quick add button on hover */}
              <button
                onClick={() => handleCreatePost(day)}
                className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 rounded-md bg-primary/10 hover:bg-primary/20 flex items-center justify-center"
              >
                <Plus className="h-3 w-3 text-primary" />
              </button>
            </div>
          );
        })}
      </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 text-[10px] text-muted-foreground">
        {Object.entries(demandStatusConfig)
          .filter(([k]) => !["cancelled"].includes(k))
          .map(([key, config]) => (
            <div key={key} className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", config.bgColor.replace("/10", ""))} />
              <span>{config.label}</span>
            </div>
          ))}
      </div>
    </PremiumGlassCard>
  );
}
