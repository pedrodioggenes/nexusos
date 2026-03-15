import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart, AlertTriangle, Users, TrendingUp, TrendingDown,
  DollarSign, Package, Clock, FileText, ArrowRight, CircleDot, Download, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { cn } from "@/lib/utils";
import {
  useComprasSuppliers,
  useComprasPurchaseOrders,
  useComprasAlerts,
  useComprasKpiSnapshots,
  formatBRL,
  formatPct,
} from "@/hooks/useComprasData";

// Semáforo component
function Semaforo({ label, level }: { label: string; level: "green" | "yellow" | "red" | "grey" }) {
  const colors = {
    green: "bg-success shadow-[0_0_8px_hsl(var(--success)/0.5)]",
    yellow: "bg-warning shadow-[0_0_8px_hsl(var(--warning)/0.5)]",
    red: "bg-destructive shadow-[0_0_8px_hsl(var(--destructive)/0.5)]",
    grey: "bg-muted-foreground/30",
  };
  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-3 w-3 rounded-full shrink-0", colors[level])} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export default function ComprasDashboard() {
  const [pdfLoading, setPdfLoading] = useState(false);
  const navigate = useNavigate();
  const { data: suppliers = [] } = useComprasSuppliers();
  const { data: orders = [] } = useComprasPurchaseOrders();
  const { data: alerts = [] } = useComprasAlerts();
  const { data: kpiSnapshot } = useComprasKpiSnapshots();

  const metrics = useMemo(() => {
    const kpis = (kpiSnapshot?.metrics ?? {}) as Record<string, number>;
    const activeSuppliers = suppliers.filter((s: any) => s.status === "active").length;
    const totalOCs = orders.length;
    const pendingOCs = orders.filter((o: any) => ["draft", "pending_approval"].includes(o.status)).length;
    const totalVolume = orders.reduce((sum: number, o: any) => sum + (o.total_value || 0), 0);

    return {
      totalVolume,
      totalOCs,
      pendingOCs,
      activeSuppliers,
      dpo: kpis.dpo ?? 0,
      saving: kpis.saving_pct ?? 0,
      ppv: kpis.ppv_accumulated ?? 0,
      otif: kpis.otif_avg ?? 0,
      gmroi: kpis.gmroi_avg ?? 0,
      ccc: kpis.ccc_days ?? 0,
    };
  }, [suppliers, orders, kpiSnapshot]);

  // Determine semáforo levels from KPIs
  const semaforoLevels = useMemo(() => ({
    custo: metrics.ppv > 0 ? "green" as const : metrics.ppv > -5000 ? "yellow" as const : "red" as const,
    fornecedor: metrics.otif >= 95 ? "green" as const : metrics.otif >= 85 ? "yellow" as const : metrics.otif > 0 ? "red" as const : "grey" as const,
    demanda: metrics.gmroi >= 2 ? "green" as const : metrics.gmroi >= 1 ? "yellow" as const : metrics.gmroi > 0 ? "red" as const : "grey" as const,
    financeiro: metrics.dpo >= 30 ? "green" as const : metrics.dpo >= 20 ? "yellow" as const : metrics.dpo > 0 ? "red" as const : "grey" as const,
  }), [metrics]);

  const topSuppliers = useMemo(() => {
    return [...suppliers]
      .sort((a: any, b: any) => (b.composite_score ?? 0) - (a.composite_score ?? 0))
      .slice(0, 8);
  }, [suppliers]);

  const criticalAlerts = alerts.filter((a: any) => a.level === "red");
  const warningAlerts = alerts.filter((a: any) => a.level === "yellow");

  const hasData = suppliers.length > 0 || orders.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Executivo</h1>
          <p className="text-sm text-muted-foreground">Visão consolidada de compras e abastecimento</p>
        </div>
        {hasData && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pdfLoading}
              onClick={async () => {
                setPdfLoading(true);
                try {
                  const { ComprasReportDocument } = await import("@/lib/pdf/templates/compras-report-template");
                  const { generateAndDownloadPDF } = await import("@/lib/pdf/generate-report");
                  const React = await import("react");
                  const now = new Date();
                  const period = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
                  const sMap: Record<string, string> = { green: "green", yellow: "yellow", red: "red", grey: "yellow" };
                  const reportData = {
                    period,
                    companyName: "Empresa",
                    semaphore: [
                      { label: "Custo (PPV)", status: sMap[semaforoLevels.custo] as any, detail: `PPV: ${formatBRL(metrics.ppv)}` },
                      { label: "Fornecedor (OTIF)", status: sMap[semaforoLevels.fornecedor] as any, detail: `OTIF: ${formatPct(metrics.otif)}` },
                      { label: "Demanda (GMROI)", status: sMap[semaforoLevels.demanda] as any, detail: `GMROI: ${metrics.gmroi.toFixed(2)}x` },
                      { label: "Financeiro (DPO)", status: sMap[semaforoLevels.financeiro] as any, detail: `DPO: ${metrics.dpo}d` },
                    ],
                    kpis: {
                      totalVolume: metrics.totalVolume,
                      activePOs: metrics.totalOCs,
                      activeSuppliers: metrics.activeSuppliers,
                      avgDPO: metrics.dpo,
                      savingPct: metrics.saving,
                      ppvAccumulated: metrics.ppv,
                      otifAvg: metrics.otif,
                      gmroiAvg: metrics.gmroi,
                    },
                    topSuppliers: topSuppliers.map((s: any) => ({ name: s.name, score: s.composite_score || 0, volume: 0 })),
                    pipelineSummary: ["draft", "pending_approval", "approved", "sent", "received", "divergent"].map(st => ({
                      status: st, count: orders.filter((o: any) => o.status === st).length, value: orders.filter((o: any) => o.status === st).reduce((s: number, o: any) => s + (o.total_value || 0), 0),
                    })).filter(p => p.count > 0),
                    tradeAllowances: [],
                    activeAlerts: alerts.map((a: any) => ({ title: a.title, level: a.level, type: a.alert_type || "" })),
                  };
                  await generateAndDownloadPDF(
                    React.createElement(ComprasReportDocument, { data: reportData }),
                    `relatorio-compras-${now.toISOString().slice(0, 10)}.pdf`
                  );
                } catch (err) {
                  console.error("PDF error:", err);
                } finally {
                  setPdfLoading(false);
                }
              }}
            >
              {pdfLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
              Exportar PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/app/compras/fornecedores/scorecard")}
            >
              <Users className="h-4 w-4 mr-1" /> Scorecard
            </Button>
          </div>
        )}
      </div>

      {/* Critical alerts banner */}
      {criticalAlerts.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-semibold text-destructive">
                {criticalAlerts.length} alerta{criticalAlerts.length > 1 ? "s" : ""} crítico{criticalAlerts.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-1">
              {criticalAlerts.slice(0, 3).map((a: any) => (
                <p key={a.id} className="text-xs text-destructive/80">• {a.title}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!hasData ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-app-compras/10 flex items-center justify-center mb-4">
            <ShoppingCart className="h-8 w-8 text-app-compras" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Compras</h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            Nenhum dado encontrado. Importe dados ou execute o seed para começar.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate("/app/compras/importacao")}
          >
            Importar Dados
          </Button>
        </div>
      ) : (
        <>
          {/* KPI Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard
              title="Volume de Compras"
              value={formatBRL(metrics.totalVolume)}
              icon={<DollarSign className="h-4 w-4" />}
              variant="primary"
            />
            <StatCard
              title="OCs Emitidas"
              value={metrics.totalOCs}
              icon={<FileText className="h-4 w-4" />}
              variant="default"
              trendLabel={`${metrics.pendingOCs} pendente${metrics.pendingOCs !== 1 ? "s" : ""}`}
            />
            <StatCard
              title="Fornecedores Ativos"
              value={metrics.activeSuppliers}
              icon={<Users className="h-4 w-4" />}
              variant="accent"
            />
            <StatCard
              title="DPO Médio"
              value={`${metrics.dpo}d`}
              icon={<Clock className="h-4 w-4" />}
              variant={metrics.dpo >= 30 ? "success" : metrics.dpo > 0 ? "warning" : "default"}
            />
            <StatCard
              title="Saving"
              value={formatPct(metrics.saving)}
              icon={<TrendingDown className="h-4 w-4" />}
              variant={metrics.saving >= 1 ? "success" : metrics.saving > 0 ? "warning" : "default"}
            />
            <StatCard
              title="PPV Acumulado"
              value={formatBRL(metrics.ppv)}
              icon={metrics.ppv >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              variant={metrics.ppv >= 0 ? "success" : "destructive"}
            />
          </div>

          {/* Semáforo + Alerts + Top Fornecedores */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Semáforo Geral */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Semáforo Geral</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Semaforo label="Custo (PPV)" level={semaforoLevels.custo} />
                <Semaforo label="Fornecedor (OTIF)" level={semaforoLevels.fornecedor} />
                <Semaforo label="Demanda (GMROI)" level={semaforoLevels.demanda} />
                <Semaforo label="Financeiro (DPO)" level={semaforoLevels.financeiro} />
              </CardContent>
            </Card>

            {/* Alertas Ativos */}
            <Card>
              <CardHeader className="pb-3 flex-row items-center justify-between">
                <CardTitle className="text-sm">Alertas Ativos</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate("/app/compras/alertas")}>
                  Ver todos <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Nenhum alerta ativo</p>
                ) : (
                  <div className="space-y-2">
                    {alerts.slice(0, 5).map((a: any) => (
                      <div key={a.id} className="flex items-start gap-2">
                        <CircleDot className={cn("h-3 w-3 mt-0.5 shrink-0", {
                          "text-destructive": a.level === "red",
                          "text-warning": a.level === "yellow",
                          "text-app-compras": a.level === "blue",
                        })} />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{a.title}</p>
                          {a.description && <p className="text-[10px] text-muted-foreground truncate">{a.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Fornecedores */}
            <Card>
              <CardHeader className="pb-3 flex-row items-center justify-between">
                <CardTitle className="text-sm">Top Fornecedores</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate("/app/compras/fornecedores/scorecard")}>
                  Scorecard <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {topSuppliers.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Nenhum fornecedor cadastrado</p>
                ) : (
                  <div className="space-y-2">
                    {topSuppliers.map((s: any, i: number) => (
                      <button
                        key={s.id}
                        onClick={() => navigate(`/app/compras/fornecedores/${s.id}`)}
                        className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors text-left"
                      >
                        <span className="text-[10px] font-mono text-muted-foreground w-4">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{s.name}</p>
                        </div>
                        <span className={cn("text-xs font-semibold", {
                          "text-success": (s.composite_score ?? 0) >= 85,
                          "text-app-compras": (s.composite_score ?? 0) >= 70 && (s.composite_score ?? 0) < 85,
                          "text-warning": (s.composite_score ?? 0) >= 50 && (s.composite_score ?? 0) < 70,
                          "text-destructive": (s.composite_score ?? 0) < 50 && (s.composite_score ?? 0) > 0,
                          "text-muted-foreground": !s.composite_score,
                        })}>
                          {s.composite_score ? `${s.composite_score}pts` : "—"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pipeline Summary */}
          <Card>
            <CardHeader className="pb-3 flex-row items-center justify-between">
              <CardTitle className="text-sm">Pipeline de OCs</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate("/app/compras/ordens")}>
                Ver pipeline <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <PipelineSummary orders={orders} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function PipelineSummary({ orders }: { orders: any[] }) {
  const statusMap: Record<string, { label: string; color: string }> = {
    draft: { label: "Rascunho", color: "bg-muted-foreground/30" },
    pending_approval: { label: "Aprovação", color: "bg-warning" },
    approved: { label: "Aprovada", color: "bg-app-compras" },
    sent: { label: "Enviada", color: "bg-accent" },
    received: { label: "Recebida", color: "bg-success" },
    divergent: { label: "Divergência", color: "bg-destructive" },
    cancelled: { label: "Cancelada", color: "bg-muted-foreground/20" },
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    orders.forEach((o: any) => { c[o.status] = (c[o.status] || 0) + 1; });
    return c;
  }, [orders]);

  const statuses = ["draft", "pending_approval", "approved", "sent", "received", "divergent"];

  return (
    <div className="flex flex-wrap gap-3">
      {statuses.map((s) => {
        const cfg = statusMap[s];
        const count = counts[s] || 0;
        return (
          <div key={s} className="flex items-center gap-2 bg-card-elevated rounded-lg px-3 py-2 border border-border">
            <div className={cn("h-2.5 w-2.5 rounded-full", cfg.color)} />
            <span className="text-xs text-muted-foreground">{cfg.label}</span>
            <span className="text-sm font-semibold text-foreground">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
