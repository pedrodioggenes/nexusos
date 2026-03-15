import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Package, AlertTriangle, Percent, DollarSign, BarChart3, TrendingUp, Target, Truck } from "lucide-react";
import { useTransferOrders } from "@/hooks/cd/useSeparationData";
import { useLossRecords } from "@/hooks/cd/useQualityData";
import { useReceivingRecords } from "@/hooks/cd/useReceivingData";
import { useCDAlerts } from "@/hooks/cd/useAlertData";
import { usePickingTasks } from "@/hooks/cd/useSeparationData";
import {
  calcCDShrinkRate,
  calcShrinkByOrigin,
  calcLossValue,
  calcPickingAccuracy,
  calcOnTimeDispatch,
  calcReceivingAccuracyRate,
  calcFillRate,
  formatKpiValue,
} from "@/hooks/cd/useKpiCalculations";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const originLabels: Record<string, string> = {
  receiving: "Receb.", storage: "Armaz.", picking: "Manuseio",
  expedition: "Exped.", expiration: "Validade", damage: "Avaria",
  theft: "Furto", other: "Outro",
};

export default function PainelCLevelPage() {
  const { data: orders = [] } = useTransferOrders();
  const { data: losses = [] } = useLossRecords();
  const { data: records = [] } = useReceivingRecords();
  const { data: alerts = [] } = useCDAlerts();
  const { data: tasks = [] } = usePickingTasks();

  // §6.2 — V_rec from actual receiving records
  const totalReceivedValue = useMemo(() =>
    records
      .filter((r: any) => r.completed_at && r.invoice_total)
      .reduce((s: number, r: any) => s + (r.invoice_total || 0), 0),
  [records]);

  // KPIs — all real data
  const stats = useMemo(() => {
    const pendingOrders = orders.filter((o: any) => !["delivered", "cancelled"].includes(o.status)).length;
    const totalLossValue = losses.reduce((s: number, l: any) => s + calcLossValue(l), 0);
    const activeAlerts = alerts.filter((a: any) => !a.resolved_at).length;
    const criticalAlerts = alerts.filter((a: any) => a.level === "critical" && !a.resolved_at).length;

    // §6.2 — Correct shrink rate using V_rec
    const shrinkRate = calcCDShrinkRate(losses, totalReceivedValue);

    // §2.6 — RAR
    const rar = calcReceivingAccuracyRate(records);
    // §5.2 — PA
    const pa = calcPickingAccuracy(tasks);
    // §5.3 — OTD
    const otd = calcOnTimeDispatch(orders);
    // §4.11 — FR
    const fr = calcFillRate(orders);

    return { pendingOrders, totalLossValue, activeAlerts, criticalAlerts, shrinkRate, rar, pa, otd, fr, totalOrders: orders.length };
  }, [orders, losses, alerts, records, tasks, totalReceivedValue]);

  const orderStatusDist = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o: any) => { map[o.status] = (map[o.status] || 0) + 1; });
    const labels: Record<string, string> = { pending: "Pendente", approved: "Aprovada", picking: "Separação", packed: "Embalada", shipped: "Expedida", delivered: "Entregue", cancelled: "Cancelada" };
    return Object.entries(map).map(([k, v]) => ({ name: labels[k] || k, value: v }));
  }, [orders]);

  const lossByOrigin = useMemo(() => {
    const data = calcShrinkByOrigin(losses, totalReceivedValue);
    return data.map((d) => ({ name: originLabels[d.origin] || d.origin, value: d.value }));
  }, [losses, totalReceivedValue]);

  const chartColors = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--destructive))", "hsl(var(--muted-foreground))", "#f59e0b", "#8b5cf6", "#06b6d4", "#10b981"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Crown className="h-6 w-6" /> Painel Executivo</h1>
        <p className="text-muted-foreground text-sm">Dashboard consolidado — KPIs calculados conforme auditoria técnica</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Ordens Ativas", value: String(stats.pendingOrders), icon: Package, color: "text-primary" },
          { label: "Alertas Críticos", value: String(stats.criticalAlerts), icon: AlertTriangle, color: "text-destructive" },
          { label: "CD Shrink Rate", value: formatKpiValue(stats.shrinkRate, "percent", 2), icon: Percent, color: "text-yellow-500" },
          { label: "Valor Perdido", value: formatKpiValue(stats.totalLossValue, "currency"), icon: DollarSign, color: "text-destructive" },
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

      {/* Operational KPIs — §2.6, §4.11, §5.2, §5.3 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "RAR (§2.6)", value: formatKpiValue(stats.rar, "percent"), target: ">98%", icon: Target },
          { label: "Fill Rate (§4.11)", value: formatKpiValue(stats.fr, "percent"), target: ">95%", icon: Package },
          { label: "Picking Accuracy (§5.2)", value: formatKpiValue(stats.pa, "percent"), target: ">99%", icon: Target },
          { label: "On-Time Dispatch (§5.3)", value: formatKpiValue(stats.otd, "percent"), target: ">95%", icon: Truck },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">Meta: {s.target}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Distribuição de Ordens</CardTitle>
          </CardHeader>
          <CardContent>
            {orderStatusDist.length === 0 ? (
              <p className="text-muted-foreground text-sm">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={orderStatusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                    {orderStatusDist.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Perdas por Origem</CardTitle>
          </CardHeader>
          <CardContent>
            {lossByOrigin.length === 0 ? (
              <p className="text-muted-foreground text-sm">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={lossByOrigin}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
                  <Bar dataKey="value" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-foreground">{stats.totalOrders}</p><p className="text-xs text-muted-foreground">Total Ordens</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-foreground">{stats.activeAlerts}</p><p className="text-xs text-muted-foreground">Alertas Ativos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-foreground">{totalReceivedValue > 0 ? formatKpiValue(totalReceivedValue, "currency") : "sem dados"}</p><p className="text-xs text-muted-foreground">V_rec (Base de Cálculo)</p></CardContent></Card>
      </div>
    </div>
  );
}
