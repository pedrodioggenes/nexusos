import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useComprasSkus, useComprasSuppliers, formatBRL, formatPct } from "@/hooks/useComprasData";
import { useMemo, useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, AlertTriangle, TrendingUp } from "lucide-react";

function classifyQuadrant(gmroi: number, turnover: number): { label: string; color: string } {
  if (gmroi >= 1.5 && turnover >= 6) return { label: "Estrela", color: "hsl(var(--success))" };
  if (gmroi >= 1.5 && turnover < 6) return { label: "Margem Alta / Giro Baixo", color: "hsl(var(--warning))" };
  if (gmroi < 1.5 && turnover >= 6) return { label: "Giro Alto / Margem Baixa", color: "hsl(var(--app-compras))" };
  return { label: "Destruidor de Valor", color: "hsl(var(--destructive))" };
}

export default function GmroiMatrix() {
  const { data: skus = [], isLoading } = useComprasSkus();
  const { data: suppliers = [] } = useComprasSuppliers();
  const [view, setView] = useState<"sku" | "category" | "supplier">("sku");

  const supplierMap = useMemo(() => {
    const m: Record<string, string> = {};
    suppliers.forEach((s: any) => { m[s.id] = s.name; });
    return m;
  }, [suppliers]);

  // Simulate GMROI and turnover from SKU data
  const skuData = useMemo(() => skus.map((s: any) => {
    const avgCost = s.avg_cta || s.last_price || 10;
    const margin = 0.15 + Math.random() * 0.35; // 15-50% simulated
    const turnover = 2 + Math.random() * 14; // 2-16x
    const gmroi = margin * turnover;
    return {
      id: s.id,
      name: s.name || s.code,
      code: s.code,
      category: s.category || "Outros",
      supplierId: s.primary_supplier_id,
      supplier: supplierMap[s.primary_supplier_id] || "—",
      avgCost,
      margin: margin * 100,
      turnover: +turnover.toFixed(1),
      gmroi: +gmroi.toFixed(2),
    };
  }), [skus, supplierMap]);

  const aggregatedData = useMemo(() => {
    if (view === "sku") return skuData;
    const map: Record<string, { name: string; margins: number[]; turnovers: number[]; count: number }> = {};
    skuData.forEach(s => {
      const key = view === "category" ? s.category : s.supplierId;
      const name = view === "category" ? s.category : s.supplier;
      if (!map[key]) map[key] = { name, margins: [], turnovers: [], count: 0 };
      map[key].margins.push(s.margin);
      map[key].turnovers.push(s.turnover);
      map[key].count++;
    });
    return Object.entries(map).map(([, v]) => {
      const avgMargin = v.margins.reduce((a, b) => a + b, 0) / v.margins.length;
      const avgTurnover = v.turnovers.reduce((a, b) => a + b, 0) / v.turnovers.length;
      return {
        name: v.name,
        margin: +avgMargin.toFixed(1),
        turnover: +avgTurnover.toFixed(1),
        gmroi: +((avgMargin / 100) * avgTurnover).toFixed(2),
        count: v.count,
      };
    });
  }, [skuData, view]);

  const destroyers = useMemo(() => skuData.filter(s => s.gmroi < 1.0).sort((a, b) => a.gmroi - b.gmroi), [skuData]);

  const avgGmroi = useMemo(() => {
    if (skuData.length === 0) return 0;
    return skuData.reduce((s, d) => s + d.gmroi, 0) / skuData.length;
  }, [skuData]);

  if (isLoading) return <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Carregando dados GMROI...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><PieChart className="h-6 w-6 text-app-compras" />Matriz GMROI × Giro</h1>
          <p className="text-sm text-muted-foreground">Análise de retorno sobre investimento em estoque por categoria, fornecedor e SKU</p>
        </div>
        <Select value={view} onValueChange={v => setView(v as any)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="sku">Por SKU</SelectItem>
            <SelectItem value="category">Por Categoria</SelectItem>
            <SelectItem value="supplier">Por Fornecedor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "GMROI Médio", value: avgGmroi.toFixed(2) + "x", accent: avgGmroi >= 2 ? "text-success" : avgGmroi >= 1.5 ? "text-module-compras" : "text-warning" },
          { label: "SKUs Analisados", value: skuData.length.toString(), accent: "text-module-compras" },
          { label: "Destruidores (GMROI<1)", value: destroyers.length.toString(), accent: destroyers.length > 0 ? "text-destructive" : "text-success" },
          { label: "Estrelas (GMROI≥1.5 + Giro≥6)", value: skuData.filter(s => s.gmroi >= 1.5 && s.turnover >= 6).length.toString(), accent: "text-success" },
        ].map(k => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">{k.label}</p>
              <p className={`text-xl font-bold ${k.accent}`}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scatter Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Matriz 4 Quadrantes</CardTitle>
          <CardDescription className="text-xs">Eixo X = Giro de Estoque | Eixo Y = GMROI | Referências: Giro = 6, GMROI = 1.5</CardDescription>
        </CardHeader>
        <CardContent>
          {aggregatedData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" dataKey="turnover" name="Giro" label={{ value: "Giro", position: "bottom", offset: 0 }} className="text-[10px]" />
                <YAxis type="number" dataKey="gmroi" name="GMROI" label={{ value: "GMROI", angle: -90, position: "insideLeft" }} className="text-[10px]" />
                <ReferenceLine y={1.5} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
                <ReferenceLine x={6} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    const q = classifyQuadrant(d.gmroi, d.turnover);
                    return (
                      <div className="bg-popover border border-border rounded-lg p-2 text-xs shadow-lg">
                        <p className="font-medium text-foreground">{d.name}</p>
                        <p className="text-muted-foreground">GMROI: {d.gmroi.toFixed(2)}x | Giro: {d.turnover.toFixed(1)}x</p>
                        <p style={{ color: q.color }} className="font-medium">{q.label}</p>
                      </div>
                    );
                  }}
                />
                <Scatter data={aggregatedData}>
                  {aggregatedData.map((d: any, i: number) => (
                    <Cell key={i} fill={classifyQuadrant(d.gmroi, d.turnover).color} fillOpacity={0.7} r={view === "sku" ? 5 : 8} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-10">Sem dados para exibir</p>
          )}
        </CardContent>
      </Card>

      {/* Value Destroyers */}
      {destroyers.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />SKUs Destruidores de Valor (GMROI &lt; 1.0)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 px-2 font-medium">SKU</th>
                    <th className="text-left py-2 px-2 font-medium">Categoria</th>
                    <th className="text-left py-2 px-2 font-medium">Fornecedor</th>
                    <th className="text-right py-2 px-2 font-medium">GMROI</th>
                    <th className="text-right py-2 px-2 font-medium">Giro</th>
                    <th className="text-right py-2 px-2 font-medium">Margem</th>
                  </tr>
                </thead>
                <tbody>
                  {destroyers.slice(0, 10).map(d => (
                    <tr key={d.id} className="border-b border-border/50">
                      <td className="py-2 px-2 font-medium text-foreground">{d.name}</td>
                      <td className="py-2 px-2">{d.category}</td>
                      <td className="py-2 px-2">{d.supplier}</td>
                      <td className="py-2 px-2 text-right text-destructive font-bold">{d.gmroi.toFixed(2)}x</td>
                      <td className="py-2 px-2 text-right">{d.turnover.toFixed(1)}x</td>
                      <td className="py-2 px-2 text-right">{formatPct(d.margin)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
