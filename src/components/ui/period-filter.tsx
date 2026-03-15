import { memo, useState } from 'react';
import { ChevronDown, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export type PeriodOption = 
  | 'today'
  | 'week'
  | '7d' 
  | '30d' 
  | '90d' 
  | 'month' 
  | 'quarter' 
  | 'semester'
  | 'year' 
  | 'all'
  | 'custom';

interface PeriodFilterProps {
  value: PeriodOption;
  onChange: (value: PeriodOption) => void;
  className?: string;
  options?: PeriodOption[];
  customRange?: { start: Date; end: Date } | null;
  onCustomRangeChange?: (range: { start: Date; end: Date }) => void;
}

const PERIOD_LABELS: Record<PeriodOption, string> = {
  'today': 'Hoje',
  'week': 'Esta semana',
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  '90d': 'Últimos 90 dias',
  'month': 'Este mês',
  'quarter': 'Este trimestre',
  'semester': 'Este semestre',
  'year': 'Este ano',
  'all': 'Todo período',
  'custom': 'Personalizado',
};

const PERIOD_SHORT_LABELS: Record<PeriodOption, string> = {
  'today': 'Hoje',
  'week': 'Semana',
  '7d': '7 dias',
  '30d': '30 dias',
  '90d': '90 dias',
  'month': 'Mês',
  'quarter': 'Trimestre',
  'semester': 'Semestre',
  'year': 'Ano',
  'all': 'Tudo',
  'custom': 'Personalizado',
};

export const PeriodFilter = memo(function PeriodFilter({
  value,
  onChange,
  className,
  options = ['7d', '30d', '90d', 'month', 'quarter', 'year'],
  customRange,
  onCustomRangeChange,
}: PeriodFilterProps) {
  const [customPopoverOpen, setCustomPopoverOpen] = useState(false);
  const [tempStart, setTempStart] = useState<Date | undefined>(customRange?.start);
  const [tempEnd, setTempEnd] = useState<Date | undefined>(customRange?.end);

  const hasCustomOption = options.includes('custom');

  const handleCustomApply = () => {
    if (tempStart && tempEnd && onCustomRangeChange) {
      onCustomRangeChange({ start: tempStart, end: tempEnd });
      onChange('custom');
      setCustomPopoverOpen(false);
    }
  };

  const displayLabel = value === 'custom' && customRange
    ? `${format(customRange.start, 'dd/MM', { locale: ptBR })} - ${format(customRange.end, 'dd/MM', { locale: ptBR })}`
    : PERIOD_SHORT_LABELS[value];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-7 text-[11px] gap-1.5 font-normal border-border",
            className
          )}
        >
          {displayLabel}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {options.filter(o => o !== 'custom').map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "text-xs cursor-pointer",
              value === option && "bg-accent text-accent-foreground"
            )}
          >
            {PERIOD_LABELS[option]}
          </DropdownMenuItem>
        ))}
        {hasCustomOption && (
          <>
            <DropdownMenuSeparator />
            <Popover open={customPopoverOpen} onOpenChange={setCustomPopoverOpen}>
              <PopoverTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setCustomPopoverOpen(true);
                  }}
                  className={cn(
                    "text-xs cursor-pointer gap-2",
                    value === 'custom' && "bg-accent text-accent-foreground"
                  )}
                >
                  <CalendarIcon className="h-3 w-3" />
                  {PERIOD_LABELS['custom']}
                </DropdownMenuItem>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="end" side="left">
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">Período personalizado</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1">Início</p>
                      <Calendar
                        mode="single"
                        selected={tempStart}
                        onSelect={setTempStart}
                        className="p-0 pointer-events-auto"
                        locale={ptBR}
                      />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1">Fim</p>
                      <Calendar
                        mode="single"
                        selected={tempEnd}
                        onSelect={setTempEnd}
                        disabled={(date) => tempStart ? date < tempStart : false}
                        className="p-0 pointer-events-auto"
                        locale={ptBR}
                      />
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full text-xs" 
                    disabled={!tempStart || !tempEnd}
                    onClick={handleCustomApply}
                  >
                    Aplicar
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

/**
 * Hook para gerenciar estado do período selecionado
 */
export function usePeriodFilter(defaultValue: PeriodOption = '30d') {
  const [period, setPeriod] = useState<PeriodOption>(defaultValue);
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | null>(null);
  
  const getDateRange = (): { start: Date; end: Date } => {
    if (period === 'custom' && customRange) {
      return customRange;
    }

    const now = new Date();
    const end = new Date();
    const start = new Date();
    
    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week': {
        const day = start.getDay();
        const diff = day === 0 ? 6 : day - 1; // Monday start
        start.setDate(start.getDate() - diff);
        start.setHours(0, 0, 0, 0);
        // End of week (Sunday)
        end.setDate(start.getDate() + 6);
        break;
      }
      case '7d':
        start.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        break;
      case 'month':
        start.setDate(1);
        // End of current month
        end.setMonth(end.getMonth() + 1, 0);
        break;
      case 'quarter': {
        const quarter = Math.floor(now.getMonth() / 3);
        start.setMonth(quarter * 3, 1);
        // End of quarter
        end.setMonth(quarter * 3 + 3, 0);
        break;
      }
      case 'semester': {
        const sem = now.getMonth() < 6 ? 0 : 6;
        start.setMonth(sem, 1);
        // End of semester
        end.setMonth(sem + 6, 0);
        break;
      }
      case 'year':
        start.setMonth(0, 1);
        // End of year
        end.setMonth(11, 31);
        break;
      case 'all':
        start.setFullYear(2020, 0, 1);
        end.setFullYear(2030, 11, 31);
        break;
    }
    
    return { start, end };
  };
  
  return {
    period,
    setPeriod,
    getDateRange,
    periodLabel: PERIOD_LABELS[period],
    periodShortLabel: PERIOD_SHORT_LABELS[period],
    customRange,
    setCustomRange,
  };
}

export default PeriodFilter;
