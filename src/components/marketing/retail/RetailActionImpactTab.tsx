import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp, TrendingDown, Minus, Plus, AlertTriangle, Info, BarChart3, Trash2, Save, Loader2
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import {
  useRetailActionMetrics,
  METRIC_KEYS,
  calcDelta,
  generateAlerts,
  type RetailActionMetric,
} from "@/hooks/useRetailActionMetrics";
import { cn } from "@/lib/utils";

interface Props {
  actionId: string;
  executionScore?: number | null;
}

function DeltaValue({ baseline, compare }: { baseline: number | null; compare: number | null }) {
  const delta = calcDelta(baseline, compare);
  if (delta == null) return <span className="text-muted-foreground text-[10px]">—</span>;
  const isPositive = delta > 0;
  const isNeutral = Math.abs(delta) < 1;
  return (
    <span className={cn(
      "flex items-center gap-0.5 text-xs font-semibold",
      isNeutral ? "text-muted-foreground" : isPositive ? "text-primary" : "text-destructive"
    )}>
      {isNeutral ? <Minus className="h-3 w-3" /> : isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
    </span>
  );
}

function MetricCard({ metric, onUpdate, onDelete }: {
  metric: RetailActionMetric;
  onUpdate: (id: string, updates: Partial<RetailActionMetric>) => void;
  onDelete: (id: string) => void;
}) {
  const label = METRIC_KEYS.find(k => k.value === metric.metric_key)?.label || metric.metric_key;
  const duringDelta = calcDelta(metric.baseline_value, metric.during_value);
  const postDelta = calcDelta(metric.baseline_value, metric.post_value);

  return (
    <Card className="relative group">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 text-destructive"
            onClick={() => onDelete(metric.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-[9px] text-muted-foreground mb-0.5">Antes</p>
            <Input
              type="number"
              className="h-6 text-xs px-1.5"
              value={metric.baseline_value ?? ''}
              onChange={e => onUpdate(metric.id, { baseline_value: e.target.value ? Number(e.target.value) : null })}
              placeholder="—"
            />
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground mb-0.5 flex items-center gap-1">
              Durante <DeltaValue baseline={metric.baseline_value} compare={metric.during_value} />
            </p>
            <Input
              type="number"
              className="h-6 text-xs px-1.5"
              value={metric.during_value ?? ''}
              onChange={e => onUpdate(metric.id, { during_value: e.target.value ? Number(e.target.value) : null })}
              placeholder="—"
            />
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground mb-0.5 flex items-center gap-1">
              Depois <DeltaValue baseline={metric.baseline_value} compare={metric.post_value} />
            </p>
            <Input
              type="number"
              className="h-6 text-xs px-1.5"
              value={metric.post_value ?? ''}
              onChange={e => onUpdate(metric.id, { post_value: e.target.value ? Number(e.target.value) : null })}
              placeholder="—"
            />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          <Badge variant="secondary" className="text-[9px]">{metric.source}</Badge>
          {metric.store_id && <Badge variant="outline" className="text-[9px]">Loja</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}

export function RetailActionImpactTab({ actionId, executionScore }: Props) {
  const { metrics, createMetric, updateMetric, deleteMetric, isLoading } = useRetailActionMetrics(actionId);
  const [newMetricKey, setNewMetricKey] = useState("receita");
  const [hypothesis, setHypothesis] = useState("");
  const [observations, setObservations] = useState("");
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, Partial<RetailActionMetric>>>({});

  const alerts = generateAlerts(metrics, executionScore);

  // Aggregate network-level metrics for chart
  const networkMetrics = metrics.filter(m => !m.store_id);
  const chartData = networkMetrics.map(m => ({
    name: METRIC_KEYS.find(k => k.value === m.metric_key)?.label || m.metric_key,
    Antes: m.baseline_value ?? 0,
    Durante: m.during_value ?? 0,
    Depois: m.post_value ?? 0,
  }));

  const handleLocalUpdate = (id: string, updates: Partial<RetailActionMetric>) => {
    setPendingUpdates(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }));
  };

  const handleSaveAll = async () => {
    for (const [id, updates] of Object.entries(pendingUpdates)) {
      await updateMetric.mutateAsync({ id, ...updates });
    }
    setPendingUpdates({});
  };

  const handleAddMetric = () => {
    createMetric.mutate({
      retail_action_id: actionId,
      metric_key: newMetricKey,
    });
  };

  // Merge pending updates with server data for display
  const displayMetrics = metrics.map(m => ({
    ...m,
    ...pendingUpdates[m.id],
  }));

  if (isLoading) {
    return <div className="py-6 text-center text-xs text-muted-foreground">Carregando métricas…</div>;
  }

  return (
    <div className="space-y-3">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-1">
          {alerts.map((alert, i) => (
            <div key={i} className={cn(
              "flex items-start gap-2 p-2 rounded-lg text-xs",
              alert.type === 'warning' ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
            )}>
              {alert.type === 'warning' ? <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> : <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />}
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Delta Summary Cards */}
      {networkMetrics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {networkMetrics.slice(0, 4).map(m => {
            const label = METRIC_KEYS.find(k => k.value === m.metric_key)?.label || m.metric_key;
            const pendingM = { ...m, ...pendingUpdates[m.id] };
            return (
              <Card key={m.id} className="p-2">
                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">{label} Δ</p>
                <DeltaValue baseline={pendingM.baseline_value} compare={pendingM.during_value} />
              </Card>
            );
          })}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader className="p-2 pb-0">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" /> Antes / Durante / Depois
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-1">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Antes" fill="hsl(var(--muted-foreground))" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Durante" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Depois" fill="hsl(var(--accent-foreground))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metric Inputs */}
      <div className="space-y-2">
        {displayMetrics.map(m => (
          <MetricCard
            key={m.id}
            metric={m as RetailActionMetric}
            onUpdate={handleLocalUpdate}
            onDelete={(id) => deleteMetric.mutate(id)}
          />
        ))}
      </div>

      {/* Add Metric + Save */}
      <div className="flex items-center gap-2">
        <Select value={newMetricKey} onValueChange={setNewMetricKey}>
          <SelectTrigger className="h-7 w-[140px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {METRIC_KEYS.map(k => (
              <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={handleAddMetric} disabled={createMetric.isPending}>
          {createMetric.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3 mr-1" />}
          Adicionar
        </Button>
        {Object.keys(pendingUpdates).length > 0 && (
          <Button size="sm" className="h-7 text-[11px] ml-auto" onClick={handleSaveAll} disabled={updateMetric.isPending}>
            {updateMetric.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
            Salvar ({Object.keys(pendingUpdates).length})
          </Button>
        )}
      </div>

      {/* Hypothesis & Observations */}
      <Card>
        <CardHeader className="p-2 pb-1">
          <CardTitle className="text-xs">Hipótese & Aprendizados</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0 space-y-2">
          <div>
            <p className="text-[10px] text-muted-foreground mb-0.5">Hipótese</p>
            <Textarea
              className="text-xs min-h-[40px]"
              placeholder="Ex: Desconto agressivo deve gerar aumento de giro em 15%"
              value={hypothesis}
              onChange={e => setHypothesis(e.target.value)}
            />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-0.5">Observações</p>
            <Textarea
              className="text-xs min-h-[40px]"
              placeholder="Aprendizados após análise dos resultados…"
              value={observations}
              onChange={e => setObservations(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {metrics.length === 0 && (
        <div className="py-4 text-center text-xs text-muted-foreground">
          Adicione métricas para analisar o impacto desta ação comercial.
        </div>
      )}
    </div>
  );
}
