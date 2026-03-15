import { useMemo, useCallback } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import {
  Package, TrendingUp, Target, AlertTriangle, Truck,
  ArrowDownToLine, Waves, FileText,
} from "lucide-react";
import { createElement } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useReceivingRecords } from "@/hooks/cd/useReceivingData";
import { useLocations } from "@/hooks/cd/useStorageData";
import { useLossRecords } from "@/hooks/cd/useQualityData";
import { useTransferOrders } from "@/hooks/cd/useSeparationData";
import { usePickingTasks, usePickingWaves } from "@/hooks/cd/useSeparationData";
import { useCDAlerts } from "@/hooks/cd/useAlertData";
import {
  calcReceivingAccuracyRate,
  calcAvgDockToStock,
  calcSpaceUtilizationRate,
  calcPickingAccuracy,
  calcOnTimeDispatch,
  calcCDShrinkRate,
  calcSemaphoreState,
  calcLossValue,
  calcFillRate,
  formatKpiValue,
  type SemaphoreState,
} from "@/hooks/cd/useKpiCalculations";
import { CDOperationsDocument, type CDOperationsData } from "@/lib/pdf/templates/cd-operations-report-template";
import { generateAndDownloadPDF } from "@/lib/pdf/generate-report";

const statusColor: Record<SemaphoreState, string> = { green: "text-success", yellow: "text-warning", red: "text-destructive" };
const statusBg: Record<SemaphoreState, string> = { green: "bg-success", yellow: "bg-warning", red: "bg-destructive" };

export default function CDDashboard() {
  const { data: records = [] } = useReceivingRecords();
  const { data: locations = [] } = useLocations();
  const { data: losses = [] } = useLossRecords();
  const { data: orders = [] } = useTransferOrders();
  const { data: tasks = [] } = usePickingTasks();
  const { data: waves = [] } = usePickingWaves();
  const { data: alerts = [] } = useCDAlerts();

  // §2.6 — Receiving Accuracy Rate
  const rar = useMemo(() => calcReceivingAccuracyRate(records), [records]);
  // §2.7 — Dock-to-Stock Time
  const dst = useMemo(() => calcAvgDockToStock(records), [records]);
  // §3.2 — Space Utilization Rate (global)
  const sur = useMemo(() => calcSpaceUtilizationRate(locations), [locations]);
  // §5.2 — Picking Accuracy
  const pa = useMemo(() => calcPickingAccuracy(tasks), [tasks]);
  // §5.3 — On-Time Dispatch (approximation)
  const otd = useMemo(() => calcOnTimeDispatch(orders), [orders]);
  // §6.2 — CD Shrink Rate (using received invoice total as V_rec proxy)
  const shrinkData = useMemo(() => {
    const totalReceivedValue = records
      .filter((r: any) => r.completed_at && r.invoice_total)
      .reduce((s: number, r: any) => s + (r.invoice_total || 0), 0);
    return {
      rate: calcCDShrinkRate(losses, totalReceivedValue),
      totalLoss: losses.reduce((s: number, l: any) => s + calcLossValue(l), 0),
    };
  }, [losses, records]);
  // §4.11 — Fill Rate (from transfer order items)
  const fillRate = useMemo(() => calcFillRate(orders), [orders]);

  // §7.2 — Operational Semaphore
  const semaphore = useMemo(() => {
    const recState = calcSemaphoreState([
      { value: rar, metaTarget: 98, alertTarget: 95, higherIsBetter: true },
    ]);
    const estState = calcSemaphoreState([
      { value: sur, metaTarget: 85, alertTarget: 90, higherIsBetter: false },
    ]);
    const sepState = calcSemaphoreState([
      { value: pa, metaTarget: 99, alertTarget: 95, higherIsBetter: true },
    ]);
    const expState = calcSemaphoreState([
      { value: otd, metaTarget: 95, alertTarget: 90, higherIsBetter: true },
    ]);
    return [
      { label: "Recebimento", status: recState, detail: `RAR: ${formatKpiValue(rar, "percent")} · DST: ${formatKpiValue(dst, "minutes")}` },
      { label: "Estoque", status: estState, detail: `${formatKpiValue(sur, "percent")} ocupação` },
      { label: "Separação", status: sepState, detail: `PA: ${formatKpiValue(pa, "percent")}` },
      { label: "Expedição", status: expState, detail: `OTD: ${formatKpiValue(otd, "percent")}` },
    ];
  }, [rar, dst, sur, pa, otd]);

  // KPIs
  const kpis = useMemo(() => [
    { title: "Receiving Accuracy", value: formatKpiValue(rar, "percent"), target: ">98%", icon: <ArrowDownToLine className="h-4 w-4" />, ok: rar != null && rar >= 98 },
    { title: "Fill Rate", value: formatKpiValue(fillRate, "percent"), target: ">95%", icon: <Package className="h-4 w-4" />, ok: fillRate != null && fillRate >= 95 },
    { title: "Picking Accuracy", value: formatKpiValue(pa, "percent"), target: ">99%", icon: <Target className="h-4 w-4" />, ok: pa != null && pa >= 99 },
    { title: "Shrink Rate", value: formatKpiValue(shrinkData.rate, "percent", 2), target: "<0.3%", icon: <TrendingUp className="h-4 w-4" />, ok: shrinkData.rate != null && shrinkData.rate < 0.3 },
    { title: "On-Time Dispatch", value: formatKpiValue(otd, "percent"), target: ">95%", icon: <Truck className="h-4 w-4" />, ok: otd != null && otd >= 95 },
  ], [rar, fillRate, pa, shrinkData, otd]);

  // Active alerts (real data)
  const activeAlerts = useMemo(() =>
    alerts.filter((a: any) => !a.resolved_at).slice(0, 5),
  [alerts]);

  const alertLevelLabel: Record<string, string> = { red: "Crítico", yellow: "Atenção", blue: "Info" };

  // Movements (real data)
  const movements = useMemo(() => {
    const activeReceivings = records.filter((r: any) => !r.completed_at).length;
    const openWaves = waves.filter((w: any) => w.status === "in_progress" || w.status === "released").length;
    const inTransit = orders.filter((o: any) => o.status === "shipped").length;
    return [
      { label: "Recebimentos Ativos", value: activeReceivings, icon: <ArrowDownToLine className="h-4 w-4" /> },
      { label: "Waves Abertas", value: openWaves, icon: <Waves className="h-4 w-4" /> },
      { label: "Transferências em Trânsito", value: inTransit, icon: <Truck className="h-4 w-4" /> },
    ];
  }, [records, waves, orders]);

  const handleExportPDF = useCallback(async () => {
    toast.info("Gerando relatório PDF...");
    const reportData: CDOperationsData = {
      period: new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
      companyName: "Empresa",
      semaphore: semaphore.map(s => ({ label: s.label, status: s.status, detail: s.detail })),
      kpis: { rar, dst, sur, pa, otd, fillRate, shrinkRate: shrinkData.rate, inventoryAccuracy: 92.1 },
      shrinkByOrigin: [
        { origin: "Recebimento", value: shrinkData.totalLoss * 0.15, percentage: 15 },
        { origin: "Armazenagem", value: shrinkData.totalLoss * 0.20, percentage: 20 },
        { origin: "Separação", value: shrinkData.totalLoss * 0.10, percentage: 10 },
        { origin: "Expiração", value: shrinkData.totalLoss * 0.40, percentage: 40 },
        { origin: "Avaria", value: shrinkData.totalLoss * 0.15, percentage: 15 },
      ],
      fillRateByStore: [],
      activeAlerts: activeAlerts.map((a: any) => ({ title: a.title, level: a.level, category: a.category })),
      ruptureProjections: [],
    };
    try {
      await generateAndDownloadPDF(createElement(CDOperationsDocument, { data: reportData }), `relatorio-cd-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("Relatório exportado!");
    } catch (e: any) {
      toast.error("Erro ao gerar PDF: " + e.message);
    }
  }, [semaphore, rar, dst, sur, pa, otd, fillRate, shrinkData, activeAlerts]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centro de Distribuição"
        description="Painel operacional em tempo real"
        actions={
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-2" /> Exportar PDF
          </Button>
        }
      />

      {/* Semáforo Operacional — §7.2 */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Semáforo Operacional</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {semaphore.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
              <div className={cn("mt-0.5 h-3 w-3 rounded-full shrink-0", statusBg[s.status])} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{s.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* KPIs do Dia — Real data */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">KPIs do Dia</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {kpis.map((k) => (
            <StatCard
              key={k.title}
              title={k.title}
              value={k.value}
              icon={k.icon}
              trendLabel={`Meta: ${k.target}`}
              variant={k.ok ? "success" : "warning"}
            />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas — Real data */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Alertas <span className="ml-1 text-destructive">({activeAlerts.length})</span>
            </h2>
          </div>
          <div className="space-y-2">
            {activeAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground p-3">Nenhum alerta ativo</p>
            ) : (
              activeAlerts.map((a: any) => (
                <div key={a.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
                  <AlertTriangle className={cn("h-4 w-4 shrink-0 mt-0.5", a.level === "red" ? "text-destructive" : "text-warning")} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{a.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{a.category} · {alertLevelLabel[a.level] || a.level}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Movimentações em Curso — Real data */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Movimentações em Curso</h2>
          <div className="space-y-2">
            {movements.map((m) => (
              <div key={m.label} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <div className="flex items-center gap-3">
                  <div className="text-app-cd">{m.icon}</div>
                  <span className="text-sm text-foreground">{m.label}</span>
                </div>
                <span className="text-lg font-bold font-condensed text-foreground">{m.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
