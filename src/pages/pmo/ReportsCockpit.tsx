/**
 * ReportsCockpit — Executive cockpit view aggregating all report types.
 * Designed to impress the board with technology & data density.
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/page-header";
import {
  FileText, Target, Layers, Zap, Rocket, TrendingUp, Headset,
  BarChart3, PieChart as PieChartIcon, ArrowRight, Download, Settings2,
  CheckCircle2, AlertTriangle, Clock, Shield, Activity,
} from "lucide-react";
import { usePDIPhases, usePDICycles, usePMOInitiatives, usePMOSprints, usePMOReleases, usePMOMonthlyMetrics } from "@/hooks/usePMO";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, AreaChart, Area } from "recharts";
import { ReportGeneratorDialog, type ReportType } from "@/components/pmo/ReportGeneratorDialog";
import { useNavigate } from "react-router-dom";

const CHART_COLORS = ["#6366f1", "#3b82f6", "#f59e0b", "#ef4444", "#22c55e", "#94a3b8"];

const statusConfig: Record<string, { label: string; color: string }> = {
  planejado: { label: "Planejado", color: "hsl(var(--muted-foreground))" },
  em_andamento: { label: "Em andamento", color: "hsl(210, 80%, 55%)" },
  em_risco: { label: "Em risco", color: "hsl(45, 93%, 47%)" },
  atrasado: { label: "Atrasado", color: "hsl(0, 72%, 51%)" },
  concluido: { label: "Concluído", color: "hsl(152, 69%, 41%)" },
  suspenso: { label: "Suspenso", color: "hsl(var(--muted-foreground))" },
};

interface ReportCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  reportType: ReportType;
  pagePath?: string;
  accentColor?: string;
}

function ReportCard({ title, icon, children, reportType, pagePath, accentColor }: ReportCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <Card className="group hover:shadow-md transition-all duration-200 overflow-hidden">
        <div className="h-1 w-full" style={{ background: accentColor || "hsl(var(--app-pmo))" }} />
        <CardHeader className="pb-2 pt-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              {icon}
              {title}
            </CardTitle>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {pagePath && (
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => navigate(pagePath)}>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setDialogOpen(true)}>
                <Download className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4">{children}</CardContent>
      </Card>
      <ReportGeneratorDialog open={dialogOpen} onOpenChange={setDialogOpen} reportType={reportType} />
    </>
  );
}

export default function ReportsCockpit() {
  const { data: phases = [] } = usePDIPhases();
  const { data: cycles = [] } = usePDICycles();
  const { data: initiatives = [] } = usePMOInitiatives();
  const { data: sprints = [] } = usePMOSprints();
  const { data: releases = [] } = usePMOReleases();
  const { data: allMetrics = [] } = usePMOMonthlyMetrics();

  const [generalOpen, setGeneralOpen] = useState(false);

  // PDI summary
  const avgProgress = phases.length > 0 ? Math.round(phases.reduce((s, p) => s + (p.progress || 0), 0) / phases.length) : 0;
  const atRiskPhases = phases.filter(p => p.status === "em_risco" || p.status === "atrasado").length;
  const completedPhases = phases.filter(p => p.status === "concluido").length;

  // Phase chart data
  const phaseChartData = phases.map(p => ({
    name: `F${p.phase_number}`,
    progress: p.progress || 0,
  }));

  // Initiatives summary
  const stageGroups = useMemo(() => {
    const g: Record<string, number> = { backlog: 0, planejado: 0, em_andamento: 0, bloqueado: 0, em_validacao: 0, concluido: 0 };
    initiatives.forEach(i => { g[i.stage] = (g[i.stage] || 0) + 1; });
    return g;
  }, [initiatives]);

  const initiativePieData = Object.entries(stageGroups)
    .filter(([, v]) => v > 0)
    .map(([k, v], i) => ({
      name: k === "em_andamento" ? "Em Andamento" : k === "em_validacao" ? "Validação" : k.charAt(0).toUpperCase() + k.slice(1),
      value: v,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));

  // Sprint
  const activeSprint = sprints.find(s => s.status === "active");
  const completedSprints = sprints.filter(s => s.status === "completed").length;

  // Releases
  const publishedReleases = releases.filter(r => r.status === "published").length;
  const recentReleases = releases.slice(0, 3);

  // Metrics trend
  const months = Array.from(new Set(allMetrics.map(m => m.month))).sort().slice(-6);
  const trendData = months.map(m => {
    const mMetrics = allMetrics.filter(me => me.month === m);
    return {
      month: m.slice(5),
      valor: mMetrics.reduce((s, me) => s + (me.estimated_value_brl || 0), 0) / 1000,
      kpis: mMetrics.length,
    };
  });
  const totalValueDelivered = allMetrics.reduce((s, m) => s + (m.estimated_value_brl || 0), 0);

  // Status distribution for PDI pie
  const pdiStatusPie = useMemo(() => {
    const groups: Record<string, number> = {};
    phases.forEach(p => {
      const s = p.status || "planejado";
      groups[s] = (groups[s] || 0) + 1;
    });
    return Object.entries(groups)
      .filter(([, v]) => v > 0)
      .map(([k, v], i) => ({
        name: statusConfig[k]?.label || k,
        value: v,
        fill: CHART_COLORS[i % CHART_COLORS.length],
      }));
  }, [phases]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cockpit de Relatórios"
        description="Visão consolidada de todos os relatórios — configure, gere e exporte"
        actions={
          <Button
            size="sm"
            onClick={() => setGeneralOpen(true)}
            className="bg-app-pmo hover:bg-app-pmo/90 text-white gap-2"
          >
            <Settings2 className="h-4 w-4" />
            Relatório Geral
          </Button>
        }
      />

      {/* Executive KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Fases PDI", value: phases.length, sub: `${completedPhases} concluídas`, icon: <Layers className="h-3.5 w-3.5 text-app-pmo" /> },
          { label: "Progresso Médio", value: `${avgProgress}%`, sub: atRiskPhases > 0 ? `${atRiskPhases} em risco` : "No prazo", icon: <Target className="h-3.5 w-3.5 text-blue-500" /> },
          { label: "Iniciativas", value: initiatives.length, sub: `${stageGroups.em_andamento || 0} ativas`, icon: <Activity className="h-3.5 w-3.5 text-indigo-500" /> },
          { label: "Sprints", value: sprints.length, sub: activeSprint?.name || "Nenhuma ativa", icon: <Zap className="h-3.5 w-3.5 text-amber-500" /> },
          { label: "Releases", value: releases.length, sub: `${publishedReleases} publicadas`, icon: <Rocket className="h-3.5 w-3.5 text-emerald-500" /> },
          { label: "Valor Entregue", value: `R$${(totalValueDelivered / 1000).toFixed(0)}k`, sub: `${allMetrics.length} indicadores`, icon: <TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> },
        ].map((kpi, i) => (
          <Card key={i} className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-app-pmo/50 to-transparent" />
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                {kpi.icon}
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">{kpi.label}</p>
              </div>
              <p className="text-xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* PDI Status */}
        <ReportCard
          title="Status PDI"
          icon={<Layers className="h-4 w-4 text-app-pmo" />}
          reportType="pdi_status"
          pagePath="/app/tech/pdi-cronograma"
          accentColor="hsl(var(--app-pmo))"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Progresso geral</span>
                  <span className="text-xs font-semibold">{avgProgress}%</span>
                </div>
                <Progress value={avgProgress} className="h-2" />
              </div>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={phaseChartData} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.[0]) return null;
                      return (
                        <div className="bg-popover border border-border rounded-lg p-1.5 text-xs shadow">
                          <span>{payload[0].payload.name}: {payload[0].value}%</span>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="progress" radius={[3, 3, 0, 0]} maxBarSize={28}>
                    {phaseChartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} opacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-2 flex-wrap">
              {phases.slice(0, 4).map(p => {
                const st = statusConfig[p.status] || statusConfig.planejado;
                return (
                  <Badge key={p.id} variant="outline" className="text-[10px] gap-1">
                    F{p.phase_number}: {st.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        </ReportCard>

        {/* Initiatives Pipeline */}
        <ReportCard
          title="Pipeline de Iniciativas"
          icon={<BarChart3 className="h-4 w-4 text-indigo-500" />}
          reportType="iniciativas"
          pagePath="/app/tech/backlog"
          accentColor="#6366f1"
        >
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Backlog", value: stageGroups.backlog, color: "text-muted-foreground" },
                { label: "Em Andamento", value: stageGroups.em_andamento, color: "text-blue-500" },
                { label: "Concluídas", value: stageGroups.concluido, color: "text-emerald-500" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            {initiativePieData.length > 0 && (
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={initiativePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} innerRadius={25}>
                      {initiativePieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {stageGroups.bloqueado > 0 && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/5 border border-destructive/10">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                <span className="text-xs text-destructive">{stageGroups.bloqueado} iniciativa(s) bloqueada(s)</span>
              </div>
            )}
          </div>
        </ReportCard>

        {/* Sprint Review */}
        <ReportCard
          title="Sprint Review"
          icon={<Zap className="h-4 w-4 text-amber-500" />}
          reportType="sprint_review"
          pagePath="/app/tech/sprints"
          accentColor="#f59e0b"
        >
          <div className="space-y-3">
            {activeSprint ? (
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-foreground">{activeSprint.name}</span>
                  <Badge className="bg-emerald-500/20 text-emerald-700 text-[10px]">Ativa</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {activeSprint.start_date || "—"} → {activeSprint.end_date || "—"}
                </p>
                {activeSprint.goals && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{activeSprint.goals}</p>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <p className="text-xs text-muted-foreground">Nenhuma sprint ativa</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 rounded-lg bg-muted/20">
                <p className="text-lg font-bold text-foreground">{completedSprints}</p>
                <p className="text-[10px] text-muted-foreground">Sprints Concluídas</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/20">
                <p className="text-lg font-bold text-foreground">{sprints.length}</p>
                <p className="text-[10px] text-muted-foreground">Total de Sprints</p>
              </div>
            </div>
          </div>
        </ReportCard>

        {/* Releases */}
        <ReportCard
          title="Release Notes"
          icon={<Rocket className="h-4 w-4 text-emerald-500" />}
          reportType="releases"
          pagePath="/app/tech/releases"
          accentColor="#22c55e"
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 rounded-lg bg-muted/20">
                <p className="text-lg font-bold text-foreground">{releases.length}</p>
                <p className="text-[10px] text-muted-foreground">Total Releases</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/20">
                <p className="text-lg font-bold text-emerald-500">{publishedReleases}</p>
                <p className="text-[10px] text-muted-foreground">Publicadas</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {recentReleases.map(r => (
                <div key={r.id} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                  <span className="text-xs font-medium text-foreground">{r.version}</span>
                  <Badge variant="outline" className="text-[9px]">
                    {r.status === "published" ? "Publicada" : r.status === "draft" ? "Rascunho" : r.status}
                  </Badge>
                </div>
              ))}
              {recentReleases.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">Nenhuma release</p>
              )}
            </div>
          </div>
        </ReportCard>

        {/* Indicadores / Value */}
        <ReportCard
          title="Indicadores & Valor"
          icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
          reportType="indicadores"
          pagePath="/app/tech/indicadores"
          accentColor="#059669"
        >
          <div className="space-y-3">
            <div className="text-center p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <p className="text-2xl font-bold text-emerald-600">R$ {(totalValueDelivered / 1000).toFixed(1)}k</p>
              <p className="text-[10px] text-muted-foreground">Valor Total Entregue</p>
            </div>
            {trendData.length > 0 && (
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.[0]) return null;
                        return (
                          <div className="bg-popover border border-border rounded-lg p-1.5 text-xs shadow">
                            <span>R$ {payload[0].value}k</span>
                          </div>
                        );
                      }}
                    />
                    <Area type="monotone" dataKey="valor" stroke="#059669" fill="#059669" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </ReportCard>

        {/* PDI Status Distribution */}
        <ReportCard
          title="Distribuição PDI"
          icon={<PieChartIcon className="h-4 w-4 text-app-pmo" />}
          reportType="pdi_status"
          accentColor="hsl(var(--app-pmo))"
        >
          <div className="space-y-3">
            {pdiStatusPie.length > 0 ? (
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pdiStatusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} innerRadius={30}>
                      {pdiStatusPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-8">Sem dados PDI</p>
            )}
            <div className="flex gap-2 flex-wrap justify-center">
              {cycles.slice(0, 4).map(c => (
                <Badge key={c.id} variant="outline" className="text-[10px]">
                  {c.cycle_code}: {c.progress}%
                </Badge>
              ))}
            </div>
          </div>
        </ReportCard>
      </div>

      {/* General Report Dialog */}
      <ReportGeneratorDialog open={generalOpen} onOpenChange={setGeneralOpen} reportType="geral" />
    </div>
  );
}
