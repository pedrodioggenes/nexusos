import { useState } from "react";
import { TrendingUp, Plus, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ReportButton } from "@/components/pmo/ReportGeneratorDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePMOMonthlyMetrics, useCreateMonthlyMetric } from "@/hooks/usePMO";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PMOIndicadores = () => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const { data: metrics = [] } = usePMOMonthlyMetrics(selectedMonth);
  const { data: allMetrics = [] } = usePMOMonthlyMetrics();
  const createMetric = useCreateMonthlyMetric();

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ solution: "", kpi_name: "", baseline: "", current_value: "", estimated_value_brl: "", data_source: "", month: currentMonth });

  const handleCreate = async () => {
    if (!form.solution || !form.kpi_name) return;
    await createMetric.mutateAsync({ ...form, baseline: Number(form.baseline), current_value: Number(form.current_value), estimated_value_brl: Number(form.estimated_value_brl) || null });
    setCreateOpen(false);
    setForm({ solution: "", kpi_name: "", baseline: "", current_value: "", estimated_value_brl: "", data_source: "", month: currentMonth });
  };

  const totalSaved = metrics.reduce((s, m) => s + (m.estimated_value_brl || 0), 0);
  const avgDelta = metrics.length > 0 ? metrics.reduce((s, m) => s + (m.delta || 0), 0) / metrics.length : 0;

  const months = Array.from(new Set(allMetrics.map(m => m.month))).sort().slice(-6);
  const chartData = months.map(m => {
    const mMetrics = allMetrics.filter(me => me.month === m);
    return { month: m.slice(5), value: mMetrics.reduce((s, me) => s + (me.estimated_value_brl || 0), 0) / 1000 };
  });

  const availableMonths = Array.from(new Set(allMetrics.map(m => m.month))).sort().reverse();
  if (!availableMonths.includes(currentMonth)) availableMonths.unshift(currentMonth);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-app-pmo/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-app-pmo" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Indicadores & ROI</h1>
            <p className="text-sm text-muted-foreground">Métricas mensais de eficiência e resultado financeiro</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>{availableMonths.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
          <ReportButton reportType="indicadores" label="Relatório" />
          <Button size="sm" onClick={() => setCreateOpen(true)} className="bg-app-pmo hover:bg-app-pmo/90 text-white">
            <Plus className="h-4 w-4 mr-1" /> Registrar Métrica
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
              <p className="text-xs text-muted-foreground">Valor Estimado no Mês</p>
            </div>
            <p className="text-lg font-semibold text-foreground">R$ {(totalSaved / 1000).toFixed(1)}k</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              {avgDelta >= 0 ? <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" /> : <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />}
              <p className="text-xs text-muted-foreground">Delta Médio</p>
            </div>
            <p className="text-lg font-semibold text-foreground">{avgDelta.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Métricas Registradas</p>
            <p className="text-lg font-semibold text-foreground">{metrics.length}</p>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Valor Estimado por Mês (R$ mil)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(210 55% 52%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Métricas por Solução — {selectedMonth}</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Solução</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">KPI</th>
                  <th className="text-center p-3 text-xs font-medium text-muted-foreground">Baseline</th>
                  <th className="text-center p-3 text-xs font-medium text-muted-foreground">Atual</th>
                  <th className="text-center p-3 text-xs font-medium text-muted-foreground">Delta</th>
                  <th className="text-center p-3 text-xs font-medium text-muted-foreground">R$ Estimado</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Fonte</th>
                </tr>
              </thead>
              <tbody>
                {metrics.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma métrica registrada para {selectedMonth}.</td></tr>
                ) : metrics.map(m => (
                  <tr key={m.id} className="border-b border-border">
                    <td className="p-3 font-medium text-foreground">{m.solution}</td>
                    <td className="p-3 text-muted-foreground">{m.kpi_name}</td>
                    <td className="p-3 text-center">{m.baseline ?? "—"}</td>
                    <td className="p-3 text-center">{m.current_value ?? "—"}</td>
                    <td className="p-3 text-center">
                      <Badge className={m.delta && m.delta > 0 ? "bg-emerald-500/20 text-emerald-700 text-[10px]" : "bg-red-500/20 text-red-700 text-[10px]"}>
                        {m.delta != null ? (m.delta > 0 ? "+" : "") + m.delta : "—"}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">{m.estimated_value_brl ? `R$ ${m.estimated_value_brl.toLocaleString()}` : "—"}</td>
                    <td className="p-3 text-muted-foreground text-xs">{m.data_source || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Métrica</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Solução *</Label><Input value={form.solution} onChange={e => setForm(p => ({ ...p, solution: e.target.value }))} placeholder="Ex: Automação Trade" /></div>
              <div><Label>KPI *</Label><Input value={form.kpi_name} onChange={e => setForm(p => ({ ...p, kpi_name: e.target.value }))} placeholder="Ex: Horas salvas" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Baseline</Label><Input type="number" value={form.baseline} onChange={e => setForm(p => ({ ...p, baseline: e.target.value }))} /></div>
              <div><Label>Atual</Label><Input type="number" value={form.current_value} onChange={e => setForm(p => ({ ...p, current_value: e.target.value }))} /></div>
              <div><Label>R$ Estimado</Label><Input type="number" value={form.estimated_value_brl} onChange={e => setForm(p => ({ ...p, estimated_value_brl: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Mês</Label><Input type="month" value={form.month} onChange={e => setForm(p => ({ ...p, month: e.target.value }))} /></div>
              <div><Label>Fonte</Label><Input value={form.data_source} onChange={e => setForm(p => ({ ...p, data_source: e.target.value }))} placeholder="Ex: Sistema interno" /></div>
            </div>
            <Button onClick={handleCreate} disabled={!form.solution || !form.kpi_name || createMetric.isPending} className="w-full bg-app-pmo hover:bg-app-pmo/90 text-white">Registrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PMOIndicadores;