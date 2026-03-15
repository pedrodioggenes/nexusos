import { useNavigate } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassBentoCard, GlassBentoContent, GlassBentoHeader, GlassBentoTitle } from "@/components/ui/glass-bento";
import type { MarketingPlan } from "@/hooks/useMarketingPlans";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Props {
  plans: MarketingPlan[];
  className?: string;
}

export function WeekTimeline({ plans, className }: Props) {
  const navigate = useNavigate();

  // Group plans by day within next 7 days
  const now = new Date();
  const days: { date: Date; label: string; plans: MarketingPlan[] }[] = [];

  for (let i = 0; i < 7; i++) {
    const d = addDays(now, i);
    const dateStr = format(d, "yyyy-MM-dd");
    const dayPlans = plans.filter(p => p.start_date && p.start_date.startsWith(dateStr));
    const label = isToday(d) ? "Hoje" : isTomorrow(d) ? "Amanhã" : format(d, "EEE dd", { locale: ptBR });
    days.push({ date: d, label, plans: dayPlans });
  }

  const totalWeek = plans.length;

  return (
    <GlassBentoCard className={cn("h-full", className)} glowColor="rgba(var(--app-gestao-rgb, 200,170,80), 0.1)">
      <GlassBentoContent>
        <GlassBentoHeader
          icon={<Calendar className="h-4 w-4 text-app-gestao" />}
          action={
            <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={() => navigate('/app/marketing/planejamento')}>
              Ver tudo <ArrowRight className="h-3 w-3" />
            </Button>
          }
        >
          <GlassBentoTitle>Semana ({totalWeek})</GlassBentoTitle>
        </GlassBentoHeader>

        {totalWeek === 0 ? (
          <div className="py-6 text-center">
            <Calendar className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Nenhum evento nos próximos 7 dias</p>
            <Button variant="outline" size="sm" className="mt-2 h-7 text-[11px]" onClick={() => navigate('/app/marketing/planejamento')}>
              Planejar semana
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {days.map((day, i) => (
              <div key={i} className={cn(
                "flex items-start gap-2 py-1.5",
                i < days.length - 1 && "border-b border-border/30"
              )}>
                <div className={cn(
                  "w-12 shrink-0 text-[10px] font-medium",
                  isToday(day.date) ? "text-primary" : "text-muted-foreground"
                )}>
                  {day.label}
                </div>
                <div className="flex-1 min-w-0">
                  {day.plans.length === 0 ? (
                    <span className="text-[10px] text-muted-foreground/50">—</span>
                  ) : (
                    <div className="space-y-0.5">
                      {day.plans.slice(0, 2).map(p => (
                        <div key={p.id} className="flex items-center gap-1">
                          <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: p.color || 'hsl(var(--primary))' }} />
                          <span className="text-[11px] text-foreground/80 truncate">{p.title}</span>
                          <Badge variant="secondary" className="text-[8px] px-1 h-3.5 shrink-0">
                            {p.status === 'in_progress' ? 'Ativa' : p.status === 'planned' ? 'Planejada' : p.status}
                          </Badge>
                        </div>
                      ))}
                      {day.plans.length > 2 && (
                        <span className="text-[9px] text-muted-foreground">+{day.plans.length - 2} mais</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassBentoContent>
    </GlassBentoCard>
  );
}
