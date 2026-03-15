import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useComprasTradeAllowances, useComprasSuppliers, formatBRL, formatPct } from "@/hooks/useComprasData";
import { Wallet, AlertTriangle, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useMemo } from "react";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Ativa", variant: "default" },
  expired: { label: "Encerrada", variant: "secondary" },
  pending: { label: "Pendente", variant: "outline" },
};

export default function TradeAllowances() {
  const { data: allowances = [], isLoading } = useComprasTradeAllowances();
  const { data: suppliers = [] } = useComprasSuppliers();

  const supplierMap = useMemo(() => {
    const m: Record<string, string> = {};
    suppliers.forEach((s: any) => { m[s.id] = s.name; });
    return m;
  }, [suppliers]);

  const summary = useMemo(() => {
    const active = allowances.filter((a: any) => a.status === "active");
    const totalPlanned = active.reduce((s: number, a: any) => s + (a.planned_value || 0), 0);
    const totalRealized = active.reduce((s: number, a: any) => s + (a.realized_value || 0), 0);
    const adherence = totalPlanned > 0 ? (totalRealized / totalPlanned) * 100 : 0;
    const expiringSoon = active.filter((a: any) => {
      if (!a.end_date) return false;
      const d = new Date(a.end_date);
      const now = new Date();
      const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 30;
    });
    return { totalPlanned, totalRealized, adherence, activeCount: active.length, expiringSoon: expiringSoon.length, total: allowances.length };
  }, [allowances]);

  // Trade Spend ROI by supplier
  const roiBySupplier = useMemo(() => {
    const map: Record<string, { name: string; planned: number; realized: number }> = {};
    allowances.filter((a: any) => a.status === "active").forEach((a: any) => {
      const sid = a.supplier_id;
      if (!map[sid]) map[sid] = { name: supplierMap[sid] || "—", planned: 0, realized: 0 };
      map[sid].planned += a.planned_value || 0;
      map[sid].realized += a.realized_value || 0;
    });
    return Object.values(map).map(v => ({
      ...v,
      roi: v.planned > 0 ? ((v.realized / v.planned) * 100) : 0,
    })).sort((a, b) => b.planned - a.planned).slice(0, 8);
  }, [allowances, supplierMap]);

  if (isLoading) return <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Carregando verbas...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Painel de Verbas Comerciais</h1>
        <p className="text-sm text-muted-foreground">Rebates, bonificações e aderência de verbas negociadas</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Verbas Ativas", value: summary.activeCount.toString(), icon: Wallet, accent: "text-app-compras" },
          { label: "Previsto", value: formatBRL(summary.totalPlanned), icon: TrendingUp, accent: "text-app-compras" },
          { label: "Realizado", value: formatBRL(summary.totalRealized), icon: CheckCircle, accent: "text-success" },
          { label: "Vencendo (30d)", value: summary.expiringSoon.toString(), icon: Clock, accent: summary.expiringSoon > 0 ? "text-warning" : "text-muted-foreground" },
        ].map(k => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <k.icon className={`h-4 w-4 ${k.accent}`} />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{k.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Adherence Gauge */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Aderência Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={Math.min(summary.adherence, 100)} className="flex-1 h-3" />
            <span className={`text-lg font-bold ${summary.adherence >= 80 ? "text-success" : summary.adherence >= 50 ? "text-warning" : "text-destructive"}`}>
              {formatPct(summary.adherence)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Realizado / Previsto das verbas ativas</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ROI by Supplier Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Trade Spend ROI por Fornecedor</CardTitle>
          </CardHeader>
          <CardContent>
            {roiBySupplier.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={roiBySupplier} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tickFormatter={v => `${v.toFixed(0)}%`} className="text-[10px]" />
                  <YAxis type="category" dataKey="name" width={100} className="text-[10px]" />
                  <Tooltip formatter={(v: number) => formatPct(v)} />
                  <Bar dataKey="roi" radius={[0, 4, 4, 0]}>
                    {roiBySupplier.map((e, i) => (
                      <Cell key={i} className={e.roi >= 80 ? "fill-success" : e.roi >= 50 ? "fill-warning" : "fill-destructive"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-10">Sem verbas ativas para exibir</p>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />Alertas de Verbas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allowances.filter((a: any) => {
              if (a.status !== "active" || !a.end_date) return false;
              const diff = (new Date(a.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
              return diff >= 0 && diff <= 30;
            }).length > 0 ? (
              <div className="space-y-2">
                {allowances.filter((a: any) => {
                  if (a.status !== "active" || !a.end_date) return false;
                  const diff = (new Date(a.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
                  return diff >= 0 && diff <= 30;
                }).map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-2 rounded-lg bg-warning/5 border border-warning/20">
                    <div>
                      <p className="text-xs font-medium text-foreground">{a.allowance_type} — {supplierMap[a.supplier_id] || "—"}</p>
                      <p className="text-[10px] text-muted-foreground">Vence em {new Date(a.end_date).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <span className="text-xs font-bold text-warning">{formatBRL(a.planned_value - (a.realized_value || 0))} pendente</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-10">Nenhuma verba vencendo nos próximos 30 dias</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Allowances Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Todas as Verbas ({allowances.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 px-2 font-medium">Fornecedor</th>
                  <th className="text-left py-2 px-2 font-medium">Tipo</th>
                  <th className="text-right py-2 px-2 font-medium">Previsto</th>
                  <th className="text-right py-2 px-2 font-medium">Realizado</th>
                  <th className="text-right py-2 px-2 font-medium">Aderência</th>
                  <th className="text-left py-2 px-2 font-medium">Vigência</th>
                  <th className="text-left py-2 px-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {allowances.map((a: any) => {
                  const adh = a.planned_value > 0 ? ((a.realized_value || 0) / a.planned_value) * 100 : 0;
                  const st = statusMap[a.status] || statusMap.pending;
                  return (
                    <tr key={a.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 px-2 font-medium text-foreground">{supplierMap[a.supplier_id] || "—"}</td>
                      <td className="py-2 px-2 capitalize">{a.allowance_type}</td>
                      <td className="py-2 px-2 text-right">{formatBRL(a.planned_value || 0)}</td>
                      <td className="py-2 px-2 text-right">{formatBRL(a.realized_value || 0)}</td>
                      <td className="py-2 px-2 text-right">
                        <span className={adh >= 80 ? "text-success" : adh >= 50 ? "text-warning" : "text-destructive"}>{formatPct(adh)}</span>
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">
                        {a.start_date ? new Date(a.start_date).toLocaleDateString("pt-BR") : "—"} — {a.end_date ? new Date(a.end_date).toLocaleDateString("pt-BR") : "—"}
                      </td>
                      <td className="py-2 px-2"><Badge variant={st.variant} className="text-[10px]">{st.label}</Badge></td>
                    </tr>
                  );
                })}
                {allowances.length === 0 && (
                  <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">Nenhuma verba registrada</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
