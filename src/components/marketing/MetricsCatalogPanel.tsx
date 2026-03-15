import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BookOpen,
  Search,
  Info,
  DollarSign,
  Percent,
  Hash,
  Activity,
  Star,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  useMetricsCatalog,
  useUpdateMetricCatalog,
  getUnitLabel,
  type MetricCatalogEntry,
} from '@/hooks/useMetricsCatalog';

const unitIcons: Record<string, React.ReactNode> = {
  currency: <DollarSign className="h-3.5 w-3.5" />,
  percent: <Percent className="h-3.5 w-3.5" />,
  count: <Hash className="h-3.5 w-3.5" />,
  ratio: <Activity className="h-3.5 w-3.5" />,
  score: <Star className="h-3.5 w-3.5" />,
};

const frequencyLabels: Record<string, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
};

export function MetricsCatalogPanel() {
  const [search, setSearch] = useState('');
  const { data: catalog = [], isLoading } = useMetricsCatalog();
  const updateMetric = useUpdateMetricCatalog();

  const filtered = catalog.filter(m => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.display_name_pt.toLowerCase().includes(q) ||
      m.metric_key.toLowerCase().includes(q) ||
      m.description?.toLowerCase().includes(q)
    );
  });

  const systemMetrics = filtered.filter(m => m.is_system);
  const customMetrics = filtered.filter(m => !m.is_system);

  const handleToggle = (metric: MetricCatalogEntry) => {
    updateMetric.mutate({ id: metric.id, is_active: !metric.is_active });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="h-5 w-5 border-2 border-app-gestao/30 border-t-app-gestao rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar métrica..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* System Metrics */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5" />
          Métricas do Sistema ({systemMetrics.length})
        </h3>
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2">
            {systemMetrics.map((metric) => (
              <MetricCatalogItem
                key={metric.id}
                metric={metric}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Custom Metrics */}
      {customMetrics.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Métricas Personalizadas ({customMetrics.length})
          </h3>
          <div className="space-y-2">
            {customMetrics.map((metric) => (
              <MetricCatalogItem
                key={metric.id}
                metric={metric}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCatalogItem({
  metric,
  onToggle,
}: {
  metric: MetricCatalogEntry;
  onToggle: (m: MetricCatalogEntry) => void;
}) {
  return (
    <Card className={cn(
      'border-border/50 transition-opacity',
      !metric.is_active && 'opacity-50'
    )}>
      <CardContent className="p-3 flex items-center gap-3">
        {/* Icon */}
        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
          {unitIcons[metric.unit] || <Hash className="h-3.5 w-3.5" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{metric.display_name_pt}</span>
            <Badge variant="outline" className="text-[9px] shrink-0">
              {getUnitLabel(metric.unit)}
            </Badge>
            <Badge variant="secondary" className="text-[9px] shrink-0">
              {frequencyLabels[metric.frequency]}
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
            {metric.description}
          </p>
          {metric.formula_hint && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground/70 mt-0.5 cursor-help">
                    <Info className="h-2.5 w-2.5" />
                    Fórmula
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-xs font-mono">{metric.formula_hint}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Toggle */}
        <Switch
          checked={metric.is_active}
          onCheckedChange={() => onToggle(metric)}
          className="shrink-0"
        />
      </CardContent>
    </Card>
  );
}
