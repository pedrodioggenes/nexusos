import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  demandStatusConfig,
  demandTypeConfig,
  type DemandStatus,
} from '@/hooks/useMarketingDemands';

interface CampaignCalendarOverviewProps {
  campaignId: string;
}

const statusBorderColors: Record<string, string> = {
  open: 'border-l-muted-foreground',
  in_progress: 'border-l-blue-500',
  review: 'border-l-yellow-500',
  approved: 'border-l-green-500',
  completed: 'border-l-indigo-500',
  cancelled: 'border-l-destructive',
};

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export function CampaignCalendarOverview({ campaignId }: CampaignCalendarOverviewProps) {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: demands = [] } = useQuery({
    queryKey: ['campaign-calendar-demands', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_demands')
        .select('id, title, status, type, priority, due_date, assigned_to')
        .eq('campaign_id', campaignId)
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!campaignId,
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const demandsByDate = useMemo(() => {
    const map = new Map<string, typeof demands>();
    demands.forEach((d) => {
      if (!d.due_date) return;
      const key = format(parseISO(d.due_date), 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    });
    return map;
  }, [demands]);

  const today = new Date();

  if (demands.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendário de Demandas
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-[10px] font-medium text-muted-foreground uppercase py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 border border-border rounded-lg overflow-hidden">
          {calendarDays.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayDemands = demandsByDate.get(key) || [];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, today);
            const maxVisible = 2;
            const visible = dayDemands.slice(0, maxVisible);
            const remaining = dayDemands.length - maxVisible;

            return (
              <div
                key={key}
                className={cn(
                  'min-h-[80px] sm:min-h-[90px] border-b border-r border-border p-1 flex flex-col',
                  !isCurrentMonth && 'bg-muted/30',
                  isToday && 'bg-primary/5',
                )}
              >
                <span
                  className={cn(
                    'text-[11px] font-medium mb-0.5 w-5 h-5 flex items-center justify-center rounded-full',
                    !isCurrentMonth && 'text-muted-foreground/40',
                    isToday && 'bg-primary text-primary-foreground',
                    isCurrentMonth && !isToday && 'text-foreground',
                  )}
                >
                  {format(day, 'd')}
                </span>

                <div className="flex flex-col gap-0.5 flex-1">
                  {visible.map((demand) => {
                    const statusCfg = demandStatusConfig[demand.status as DemandStatus];
                    return (
                      <TooltipProvider key={demand.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => navigate(`/app/marketing/demandas/${demand.id}`)}
                              className={cn(
                                'w-full text-left rounded px-1 py-0.5 border-l-2 bg-muted/50 hover:bg-muted transition-colors cursor-pointer truncate',
                                statusBorderColors[demand.status] || 'border-l-muted',
                              )}
                            >
                              <span className="text-[10px] font-medium text-foreground leading-tight truncate block">
                                {demand.title}
                              </span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px]">
                            <p className="font-medium text-xs">{demand.title}</p>
                            <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                              {statusCfg && (
                                <span className={cn('px-1.5 py-0.5 rounded-full', statusCfg.bgColor, statusCfg.color)}>
                                  {statusCfg.label}
                                </span>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                  {remaining > 0 && (
                    <span className="text-[9px] text-muted-foreground text-center">+{remaining} mais</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3 text-[10px] text-muted-foreground">
          {(['open', 'in_progress', 'review', 'approved', 'completed'] as DemandStatus[]).map((status) => {
            const cfg = demandStatusConfig[status];
            return (
              <div key={status} className="flex items-center gap-1">
                <div className={cn('w-2 h-2 rounded-full', cfg.bgColor.replace('/10', ''))} />
                <span>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
