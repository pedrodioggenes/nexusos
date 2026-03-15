import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useComprasPriceHistory, useComprasSkus, useComprasSuppliers, useComprasDivergences, formatBRL, formatPct } from "@/hooks/useComprasData";
import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { LineChart as LineIcon, AlertTriangle, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CtaAnalysis() {
  const { data: priceHistory = [], isLoading: loadingPrices } = useComprasPriceHistory();
  const { data: skus = [] } = useComprasSkus();
  const { data: suppliers = [] } = useComprasSuppliers();
  const { data: divergences = [] } = useComprasDivergences();

  const supplierMap = useMemo(() => {
    const m: Record<string, string> = {};
    suppliers.forEach((s: any) => { m[s.id] = s.name; });
    return m;
  }, [suppliers]);

  const skuMap = useMemo(() => {
    const m: Record<string, any> = {};
    skus.forEach((s: any) => { m[s.id] = s; });
    return m;
  }, [skus]);

  // CTA analysis per SKU
  const ctaBySku = useMemo(() => {
    const grouped: Record<string, { prices: number[]; dates: string[]; sku: any; supplierId: string }> = {};
    priceHistory.forEach((ph: any) => {
      const key = ph.sku_id;
      if (!grouped[key]) grouped[key] = { prices: [], dates: [], sku: ph.compras_skus || skuMap[key], supplierId: ph.supplier_id };
      grouped[key].prices.push(ph.price);
      grouped[key].dates.push(ph.effective_date);
    });

    return Object.entries(grouped).map(([skuId, data]) => {
      const avg = data.prices.reduce((a, b) => a + b, 0) / data.prices.length;
      const last = data.prices[data.prices.length - 1] || 0;
      const tabela = last * (0.95 + Math.random() * 0.1); // simulated table price
      const deviation = tabela > 0 ? ((last - tabela) / tabela) * 100 : 0;
      const series = data.prices.map((p, i) => ({
        date: new Date(data.dates[i]).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
        real: p,
        tabela: +(tabela * (0.98 + Math.random() * 0.04)).toFixed(2),
      }));

      return {
        id: skuId,
        name: data.sku?.name || data.sku?.code || skuId.slice(0, 8),
        supplier: supplierMap[data.supplierId] || "—",
        avgCta: +avg.toFixed(2),
        lastPrice: last,
        tabelaPrice: +tabela.toFixed(2),
        deviation: +deviation.toFixed(1),
        series,
        priceCount: data.prices.length,
      };
    }).sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
  }, [priceHistory, skuMap, supplierMap]);

  // CNC (Custo de Não-Conformidade) by supplier
  const cncBySupplier = useMemo(() => {
    const map: Record<string, { name: string; totalValue: number; count: number }> = {};
    divergences.forEach((d: any) => {
      const sid = d.supplier_id;
      if (!map[sid]) map[sid] = { name: supplierMap[sid] || "—", totalValue: 0, count: 0 };
      map[sid].totalValue += Math.abs(d.value_impact || 0);
      map[sid].count++;
    });
    return Object.values(map).sort((a, b) => b.totalValue - a.totalValue);
  }, [divergences, supplierMap]);

  // Summary KPIs
  const avgDeviation = useMemo(() => {
    if (ctaBySku.length === 0) return 0;
    return ctaBySku.reduce((s, d) => s + Math.abs(d.deviation), 0) / ctaBySku.length;
  }, [ctaBySku]);

  const totalCnc = useMemo(() => cncBySupplier.reduce((s, d) => s + d.totalValue, 0), [cncBySupplier]);
  const highDeviationCount = useMemo(() => ctaBySku.filter(s => Math.abs(s.deviation) > 5).length, [ctaBySku]);

  if (loadingPrices) return <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Carregando CTA...</div>;

  const topSku = ctaBySku[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><LineIcon className="h-6 w-6 text-app-compras" />Análise CTA</h1>
        <p className="text-sm text-muted-foreground">Custo Total de Aquisição: real vs. tabela, CNC por fornecedor e desvios</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Desvio Médio CTA", value: formatPct(avgDeviation), accent: avgDeviation > 5 ? "text-destructive" : avgDeviation > 2 ? "text-warning" : "text-success" },
          { label: "SKUs com Desvio >5%", value: highDeviationCount.toString(), accent: highDeviationCount > 0 ? "text-warning" : "text-success" },
          { label: "CNC Total", value: formatBRL(totalCnc), accent: totalCnc > 0 ? "text-destructive" : "text-success" },
          { label: "Divergências", value: divergences.length.toString(), accent: "text-muted-foreground" },
        ].map(k => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">{k.label}</p>
              <p className={`text-xl font-bold ${k.accent}`}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CTA Real vs Tabela chart for top SKU */}
        {topSku && topSku.series.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">CTA Real vs. Tabela — {topSku.name}</CardTitle>
              <CardDescription className="text-xs">Maior desvio: {formatPct(Math.abs(topSku.deviation))}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={topSku.series}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-[10px]" />
                  <YAxis className="text-[10px]" />
                  <Tooltip formatter={(v: number) => formatBRL(v)} />
                  <Line type="monotone" dataKey="real" stroke="hsl(var(--app-compras))" strokeWidth={2} name="CTA Real" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="tabela" stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="4 4" name="Tabela" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* CNC by Supplier */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-destructive" />CNC por Fornecedor</CardTitle>
            <CardDescription className="text-xs">Custo de Não-Conformidade acumulado</CardDescription>
          </CardHeader>
          <CardContent>
            {cncBySupplier.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={cncBySupplier.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tickFormatter={v => formatBRL(v)} className="text-[10px]" />
                  <YAxis type="category" dataKey="name" width={100} className="text-[10px]" />
                  <Tooltip formatter={(v: number) => formatBRL(v)} />
                  <Bar dataKey="totalValue" radius={[0, 4, 4, 0]} className="fill-destructive/70" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-10">Nenhuma divergência registrada</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deviation Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Desvio CTA por SKU</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 px-2 font-medium">SKU</th>
                  <th className="text-left py-2 px-2 font-medium">Fornecedor</th>
                  <th className="text-right py-2 px-2 font-medium">CTA Médio</th>
                  <th className="text-right py-2 px-2 font-medium">Último Preço</th>
                  <th className="text-right py-2 px-2 font-medium">Tabela</th>
                  <th className="text-right py-2 px-2 font-medium">Desvio</th>
                  <th className="text-left py-2 px-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {ctaBySku.slice(0, 20).map(d => (
                  <tr key={d.id} className="border-b border-border/50">
                    <td className="py-2 px-2 font-medium text-foreground">{d.name}</td>
                    <td className="py-2 px-2">{d.supplier}</td>
                    <td className="py-2 px-2 text-right">{formatBRL(d.avgCta)}</td>
                    <td className="py-2 px-2 text-right">{formatBRL(d.lastPrice)}</td>
                    <td className="py-2 px-2 text-right text-muted-foreground">{formatBRL(d.tabelaPrice)}</td>
                    <td className="py-2 px-2 text-right">
                      <span className={Math.abs(d.deviation) > 5 ? "text-destructive font-bold" : Math.abs(d.deviation) > 2 ? "text-warning" : "text-success"}>
                        {d.deviation > 0 ? "+" : ""}{formatPct(d.deviation)}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <Badge variant={Math.abs(d.deviation) > 5 ? "destructive" : Math.abs(d.deviation) > 2 ? "outline" : "secondary"} className="text-[10px]">
                        {Math.abs(d.deviation) > 5 ? "Crítico" : Math.abs(d.deviation) > 2 ? "Atenção" : "OK"}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {ctaBySku.length === 0 && (
                  <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">Sem histórico de preços</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
