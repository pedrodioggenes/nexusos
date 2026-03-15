import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Percent, TrendingDown, DollarSign, Package, BarChart3 } from "lucide-react";
import { useLossRecords } from "@/hooks/cd/useQualityData";
import { useReceivingRecords } from "@/hooks/cd/useReceivingData";
import {
  calcCDShrinkRate,
  calcShrinkByOrigin,
  calcVendorShrinkRate,
  calcLossValue,
  formatKpiValue,
} from "@/hooks/cd/useKpiCalculations";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const originLabels: Record<string, string> = {
  receiving: "Recebimento", storage: "Armazenagem", picking: "Manuseio",
  expedition: "Expedição", expiration: "Vencimento", damage: "Avaria",
  theft: "Furto", other: "Outro",
};

export default function ShrinkPage() {
  const { data: losses = [], isLoading: loadingLosses } = useLossRecords();
  const { data: records = [], isLoading: loadingRecords } = useReceivingRecords();
  const isLoading = loadingLosses || loadingRecords;

  // §6.2 — V_rec(P) = total value of goods received in the period
  const totalReceivedValue = useMemo(() => {
    return records
      .filter((r: any) => r.completed_at && r.invoice_total)
      .reduce((s: number, r: any) => s + (r.invoice_total || 0), 0);
  }, [records]);

  // §6.2 — CD Shrink Rate = Σ V_k / V_rec × 100
  const cdShrinkRate = useMemo(
    () => calcCDShrinkRate(losses, totalReceivedValue),
    [losses, totalReceivedValue]
  );

  // §6.2 — Breakdown by origin
  const shrinkByOrigin = useMemo(() => {
    const data = calcShrinkByOrigin(losses, totalReceivedValue);
    return data.map((d) => ({
      name: originLabels[d.origin] || d.origin,
      value: d.value,
      rate: d.rate,
    }));
  }, [losses, totalReceivedValue]);

  // §6.3 — Vendor Shrink Rate
  // Build received value by supplier from receiving records (proxy)
  const vendorShrinkData = useMemo(() => {
    // For now, we approximate V_rec(f,P) from losses with receiving origin
    // Full implementation would join receiving_items with supplier
    const receivedBySupplier: Record<string, number> = {};
    // Approximate: use total received value distributed equally if supplier data unavailable
    return calcVendorShrinkRate(losses, receivedBySupplier);
  }, [losses]);

  // Stats
  const stats = useMemo(() => {
    const totalLossValue = losses.reduce((s: number, l: any) => s + calcLossValue(l), 0);
    const totalLossQty = losses.reduce((s: number, l: any) => s + (l.qty || 0), 0);
    return { totalLossValue, totalLossQty };
  }, [losses]);

  const chartColors = ["hsl(var(--destructive))", "hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--muted-foreground))", "#f59e0b", "#8b5cf6", "#06b6d4", "#10b981"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Shrink Rate</h1>
        <p className="text-muted-foreground text-sm">§6.2 CSR = Σ V_k / V_rec × 100 · §6.3 VSR por fornecedor</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "CD Shrink Rate", value: formatKpiValue(cdShrinkRate, "percent", 2), icon: Percent, color: "text-destructive" },
          { label: "Valor Perdido", value: formatKpiValue(stats.totalLossValue, "currency"), icon: DollarSign, color: "text-destructive" },
          { label: "Unidades Perdidas", value: stats.totalLossQty.toLocaleString("pt-BR"), icon: Package, color: "text-yellow-500" },
          { label: "V_rec (Base)", value: totalReceivedValue > 0 ? formatKpiValue(totalReceivedValue, "currency") : "sem dados", icon: TrendingDown, color: "text-orange-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* §6.2 — Shrink by Origin */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Perdas por Origem (CSR_origem)</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <p className="text-muted-foreground text-sm">Carregando...</p> : shrinkByOrigin.length === 0 ? <p className="text-muted-foreground text-sm">Sem dados</p> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={shrinkByOrigin} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v: number, name: string) => [
                      `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                      "Valor"
                    ]}
                    labelFormatter={(label) => {
                      const item = shrinkByOrigin.find((d) => d.name === label);
                      return `${label}${item?.rate != null ? ` · ${item.rate.toFixed(3)}% do V_rec` : ""}`;
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {shrinkByOrigin.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* §6.3 — Vendor Shrink Rate */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Vendor Shrink (VSR por Fornecedor)</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoading ? <p className="text-muted-foreground text-sm p-6">Carregando...</p> : vendorShrinkData.length === 0 ? <p className="text-muted-foreground text-sm p-6">Sem dados de perdas vinculadas a fornecedores</p> : (
              <Table>
                <TableHeader><TableRow><TableHead>Fornecedor</TableHead><TableHead>Perda (R$)</TableHead><TableHead>VSR (%)</TableHead></TableRow></TableHeader>
                <TableBody>
                  {vendorShrinkData.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell><p className="text-sm font-medium truncate max-w-[180px]">{s.supplierName}</p></TableCell>
                      <TableCell className="font-mono text-destructive">R$ {s.lossValue.toFixed(2)}</TableCell>
                      <TableCell className="font-mono">{s.rate != null ? `${s.rate.toFixed(2)}%` : "sem dados"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
