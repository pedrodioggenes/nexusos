import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useComprasSkus, useComprasSuppliers, formatBRL } from "@/hooks/useComprasData";
import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { TrendingUp, AlertTriangle, Package, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Generate simulated demand data for SKUs
function generateDemandSeries(skuName: string, months: number = 12) {
  const base = 20 + Math.random() * 80;
  const seasonality = [0.8, 0.85, 0.9, 1.0, 1.05, 1.15, 1.1, 1.0, 0.95, 1.1, 1.2, 1.3];
  return Array.from({ length: months }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (months - 1 - i));
    const seasonal = seasonality[date.getMonth()] || 1.0;
    const noise = 0.9 + Math.random() * 0.2;
    return {
      month: date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      add: +(base * seasonal * noise).toFixed(1),
      seasonal,
    };
  });
}

export default function DemandAnalysis() {
  const { data: skus = [], isLoading } = useComprasSkus();
  const { data: suppliers = [] } = useComprasSuppliers();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const supplierMap = useMemo(() => {
    const m: Record<string, string> = {};
    suppliers.forEach((s: any) => { m[s.id] = s.name; });
    return m;
  }, [suppliers]);

  const categories = useMemo(() => {
    const cats = new Set(skus.map((s: any) => s.category || "Outros"));
    return ["all", ...Array.from(cats)];
  }, [skus]);

  const filteredSkus = useMemo(() => {
    if (selectedCategory === "all") return skus;
    return skus.filter((s: any) => (s.category || "Outros") === selectedCategory);
  }, [skus, selectedCategory]);

  const demandData = useMemo(() => filteredSkus.map((s: any) => {
    const series = generateDemandSeries(s.name);
    const lastMonth = series[series.length - 1]?.add || 0;
    const avgAdd = series.reduce((sum, d) => sum + d.add, 0) / series.length;
    const coverage = s.coverage_min || 15;
    const qpe = +(avgAdd * coverage).toFixed(0);
    const currentStock = Math.round(avgAdd * (5 + Math.random() * 20));
    const daysOfStock = avgAdd > 0 ? +(currentStock / avgAdd).toFixed(1) : 0;
    const needsOrder = daysOfStock < coverage;

    return {
      id: s.id,
      name: s.name || s.code,
      category: s.category || "Outros",
      supplier: supplierMap[s.primary_supplier_id] || "—",
      avgAdd: +avgAdd.toFixed(1),
      lastMonthAdd: lastMonth,
      qpe,
      currentStock,
      daysOfStock,
      needsOrder,
      series,
      seasonalPeak: Math.max(...series.map(d => d.seasonal)),
    };
  }), [filteredSkus, supplierMap]);

  const projection30 = useMemo(() => demandData.reduce((s, d) => s + d.avgAdd * 30, 0), [demandData]);
  const projection60 = useMemo(() => demandData.reduce((s, d) => s + d.avgAdd * 60, 0), [demandData]);
  const needingOrder = useMemo(() => demandData.filter(d => d.needsOrder), [demandData]);

  const seasonalityChart = useMemo(() => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const indices = [0.8, 0.85, 0.9, 1.0, 1.05, 1.15, 1.1, 1.0, 0.95, 1.1, 1.2, 1.3];
    return months.map((m, i) => ({ month: m, index: indices[i] }));
  }, []);

  if (isLoading) return <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Carregando análise de demanda...</div>;

  const trendSku = demandData[0];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><TrendingUp className="h-6 w-6 text-app-compras" />Demanda & Previsão</h1>
          <p className="text-sm text-muted-foreground">ADD ponderada, sazonalidade, QPE e projeções de necessidade</p>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {categories.map(c => <SelectItem key={c} value={c}>{c === "all" ? "Todas as Categorias" : c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "SKUs Analisados", value: demandData.length.toString(), icon: Package, accent: "text-app-compras" },
          { label: "Projeção 30d (un.)", value: projection30.toLocaleString("pt-BR", { maximumFractionDigits: 0 }), icon: Calendar, accent: "text-app-compras" },
          { label: "Projeção 60d (un.)", value: projection60.toLocaleString("pt-BR", { maximumFractionDigits: 0 }), icon: Calendar, accent: "text-muted-foreground" },
          { label: "Abaixo do QPE", value: needingOrder.length.toString(), icon: AlertTriangle, accent: needingOrder.length > 0 ? "text-destructive" : "text-success" },
        ].map(k => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <k.icon className={`h-4 w-4 ${k.accent}`} />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{k.label}</span>
              </div>
              <p className={`text-xl font-bold ${k.accent}`}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Índice Sazonal Médio (12 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={seasonalityChart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-[10px]" />
                <YAxis domain={[0.5, 1.5]} className="text-[10px]" />
                <Tooltip formatter={(v: number) => v.toFixed(2) + "x"} />
                <Bar dataKey="index" radius={[4, 4, 0, 0]}>
                  {seasonalityChart.map((e, i) => (
                    <Cell key={i} className={e.index >= 1.1 ? "fill-warning" : "fill-app-compras/60"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {trendSku && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">ADD Histórico — {trendSku.name}</CardTitle>
              <CardDescription className="text-xs">Demanda diária média ponderada por mês</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendSku.series}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-[10px]" />
                  <YAxis className="text-[10px]" />
                  <Tooltip />
                  <Line type="monotone" dataKey="add" stroke="hsl(var(--app-compras))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className={needingOrder.length > 0 ? "border-destructive/30" : ""}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            {needingOrder.length > 0 && <AlertTriangle className="h-4 w-4 text-destructive" />}
            SKUs Abaixo do QPE ({needingOrder.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 px-2 font-medium">SKU</th>
                  <th className="text-left py-2 px-2 font-medium">Categoria</th>
                  <th className="text-right py-2 px-2 font-medium">ADD</th>
                  <th className="text-right py-2 px-2 font-medium">Estoque Atual</th>
                  <th className="text-right py-2 px-2 font-medium">Cobertura (dias)</th>
                  <th className="text-right py-2 px-2 font-medium">QPE</th>
                  <th className="text-left py-2 px-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {(needingOrder.length > 0 ? needingOrder : demandData).slice(0, 15).map(d => (
                  <tr key={d.id} className="border-b border-border/50">
                    <td className="py-2 px-2 font-medium text-foreground">{d.name}</td>
                    <td className="py-2 px-2">{d.category}</td>
                    <td className="py-2 px-2 text-right">{d.avgAdd}</td>
                    <td className="py-2 px-2 text-right">{d.currentStock}</td>
                    <td className="py-2 px-2 text-right">
                      <span className={d.daysOfStock < 7 ? "text-destructive font-bold" : d.daysOfStock < 15 ? "text-warning" : "text-foreground"}>
                        {d.daysOfStock}d
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right">{d.qpe}</td>
                    <td className="py-2 px-2">
                      <Badge variant={d.needsOrder ? "destructive" : "secondary"} className="text-[10px]">
                        {d.needsOrder ? "Reordenar" : "OK"}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {demandData.length === 0 && (
                  <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">Nenhum SKU cadastrado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
