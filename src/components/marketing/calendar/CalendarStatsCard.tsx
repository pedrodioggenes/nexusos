import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarEvent, SOURCE_FILTER_OPTIONS } from "@/hooks/useUnifiedCalendarEvents";

interface CalendarStatsCardProps {
  events: CalendarEvent[];
  currentMonth: number;
  currentYear: number;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function CalendarStatsCard({ events, currentMonth }: CalendarStatsCardProps) {
  const stats = useMemo(() => {
    const bySource: Record<string, number> = {};
    SOURCE_FILTER_OPTIONS.forEach(s => { bySource[s.value] = 0; });
    events.forEach(e => { bySource[e.source] = (bySource[e.source] || 0) + 1; });

    const completed = events.filter(e => e.status === 'completed').length;
    const completionRate = events.length > 0 ? Math.round((completed / events.length) * 100) : 0;

    const inProgress = events.filter(e => e.status === 'in_progress').length;
    const planned = events.filter(e => e.status === 'planned').length;

    return { total: events.length, bySource, completionRate, completed, inProgress, planned };
  }, [events]);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-app-gestao" />
          Resumo de {MONTHS[currentMonth]}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-border/30">
          <span className="text-sm text-muted-foreground">Total de Eventos</span>
          <span className="text-2xl font-bold">{stats.total}</span>
        </div>

        {/* By Source */}
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Por Fonte</span>
          {SOURCE_FILTER_OPTIONS.map((source, index) => {
            const count = stats.bySource[source.value] || 0;
            if (count === 0) return null;
            const SourceIcon = source.icon;
            return (
              <motion.div
                key={source.value}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded" style={{ backgroundColor: `${source.color}20` }}>
                    <SourceIcon className="h-3 w-3" style={{ color: source.color }} />
                  </div>
                  <span className="text-sm">{source.label}</span>
                </div>
                <span className="text-sm font-medium">{count}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Completion Rate */}
        <div className="space-y-2 pt-2 border-t border-border/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Taxa de Conclusão</span>
            <span className="text-sm font-medium">{stats.completionRate}%</span>
          </div>
          <Progress value={stats.completionRate} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3 text-blue-400" />
            <span className="font-medium">{stats.planned}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <TrendingUp className="h-3 w-3 text-amber-400" />
            <span className="font-medium">{stats.inProgress}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span className="font-medium">{stats.completed}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
