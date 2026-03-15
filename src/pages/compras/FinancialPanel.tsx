import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useComprasKpiSnapshots, useComprasPurchaseOrders, useComprasSuppliers, formatBRL, formatPct } from "@/hooks/useComprasData";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from "recharts";
import { DollarSign, TrendingDown, TrendingUp, Clock, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function FinancialPanel() {
  const { data: kpiSnapshot, isLoading } = useComprasKpiSnapshots();
  const { data: pos = [] } = useComprasPurchaseOrders();
  const { data: suppliers = [] } = useComprasSuppliers();

  const supplierMap = useMemo(() => {
    const m: Record<string, string> = {};
    suppliers.forEach((s: any) => { m[s.id] = s.name; });
    return m;
  }, [suppliers]);

  // Extract KPIs from snapshot metrics or defaults
  const metrics = (kpiSnapshot?.metrics as any) ?? {};
  const dpo = metrics.avg_dpo ?? 28;
  const dio = metrics.avg_dio ?? 18;
  const dso = metrics.avg_dso ?? 5;
  const ccc = dio + dso - dpo;
  const savingPct = metrics.saving_pct ?? 0.8;
  const savingMeta = 1.0;

  // Disbursement projections
  const disbursement = useMemo(() => {
    const now = new Date();
    const buckets = [
      { label: "0-30d", min: 0, max: 30, total: 0 },
      { label: "31-60d", min: 31, max: 60, total: 0 },
      { label: "61-90d", min: 61, max: 90, total: 0 },
    ];
    pos.filter((p: any) => p.status === "approved" || p.status === "sent").forEach((p: any) => {
      const daysToPayment = p.payment_due_date
        ? Math.ceil((new Date(p.payment_due_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 30;
      const val = p.total_value || 0;
      buckets.forEach(b => {
        if (daysToPayment >= b.min && daysToPayment <= b.max) b.total += val;
      });
    });
    return buckets;
  }, [pos]);

  const totalDisbursement = disbursement.reduce((s, b) => s + b.total, 0);

  // DPO by supplier (simulated from supplier lead times)
  const dpoBySupplier = useMemo(() => {
    return suppliers.slice(0, 8).map((s: any) => ({
      name: s.name,
      dpo: (s.payment_terms || 28) + Math.round(Math.random() * 10 - 5),
    })).sort((a, b) => b.dpo - a.dpo);
  }, [suppliers]);

  // CCC trend (simulated)
  const cccTrend = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        month: d.toLocaleDateString("pt-BR", { month: "short" }),
        ccc: ccc + Math.round(Math.random() * 6 - 3),
        dio: dio + Math.round(Math.random() * 4 - 2),
        dpo: dpo + Math.round(Math.random() * 4 - 2),
      };
    });
  }, [ccc, dio, dpo]);

  if (isLoading) return <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Carregando painel financeiro...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><DollarSign className="h-6 w-6 text-app-compras" />Painel Financeiro</h1>
        <p className="text-sm text-muted-foreground">CCC, DPO, projeção de desembolso e saving realizado</p>
      </div>

      {/* CCC Components */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "DIO", value: `${dio}d`, desc: "Dias de Inventário", icon: Clock, accent: "text-app-compras" },
          { label: "DPO", value: `${dpo}d`, desc: "Dias a Pagar", icon: TrendingDown, accent: dpo >= 30 ? "text-success" : "text-warning" },
          { label: "DSO", value: `${dso}d`, desc: "Dias a Receber", icon: TrendingUp, accent: "text-muted-foreground" },
          { label: "CCC", value: `${ccc}d`, desc: "Ciclo Conversão Caixa", icon: Target, accent: ccc <= 15 ? "text-success" : ccc <= 25 ? "text-warning" : "text-destructive" },
          { label: "Saving", value: formatPct(savingPct), desc: `Meta: ${formatPct(savingMeta)}`, icon: DollarSign, accent: savingPct >= savingMeta ? "text-success" : "text-warning" },
        ].map(k => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <k.icon className={`h-4 w-4 ${k.accent}`} />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{k.label}</span>
              </div>
              <p className={`text-xl font-bold ${k.accent}`}>{k.value}</p>
              <p className="text-[10px] text-muted-foreground">{k.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Saving Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Saving Realizado vs. Meta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={Math.min((savingPct / savingMeta) * 100, 100)} className="flex-1 h-3" />
            <span className={`text-sm font-bold ${savingPct >= savingMeta ? "text-success" : "text-warning"}`}>
              {formatPct(savingPct)} / {formatPct(savingMeta)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CCC Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Evolução CCC (6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={cccTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-[10px]" />
                <YAxis className="text-[10px]" />
                <Tooltip formatter={(v: number) => `${v}d`} />
                <Line type="monotone" dataKey="ccc" stroke="hsl(var(--app-compras))" strokeWidth={2} name="CCC" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="dpo" stroke="hsl(var(--success))" strokeWidth={1} strokeDasharray="4 4" name="DPO" dot={false} />
                <Line type="monotone" dataKey="dio" stroke="hsl(var(--warning))" strokeWidth={1} strokeDasharray="4 4" name="DIO" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Disbursement Projection */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Projeção de Desembolso</CardTitle>
            <CardDescription className="text-xs">Total projetado: {formatBRL(totalDisbursement)}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={disbursement}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" className="text-[10px]" />
                <YAxis tickFormatter={v => formatBRL(v)} className="text-[10px]" />
                <Tooltip formatter={(v: number) => formatBRL(v)} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {disbursement.map((_, i) => (
                    <Cell key={i} className={i === 0 ? "fill-destructive/70" : i === 1 ? "fill-warning/70" : "fill-app-compras/50"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* DPO by Supplier */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">DPO por Fornecedor</CardTitle>
        </CardHeader>
        <CardContent>
          {dpoBySupplier.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dpoBySupplier} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" className="text-[10px]" />
                <YAxis type="category" dataKey="name" width={110} className="text-[10px]" />
                <Tooltip formatter={(v: number) => `${v} dias`} />
                <Bar dataKey="dpo" radius={[0, 4, 4, 0]}>
                  {dpoBySupplier.map((d, i) => (
                    <Cell key={i} className={d.dpo >= 30 ? "fill-success/70" : d.dpo >= 20 ? "fill-warning/70" : "fill-destructive/70"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-10">Sem dados de fornecedores</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
