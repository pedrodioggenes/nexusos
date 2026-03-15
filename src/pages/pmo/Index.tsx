import { useState, useMemo } from "react";
import { AlertTriangle, CheckCircle2, Clock, DollarSign, Plus, FileText, ShieldAlert, Target, Layers, TrendingUp, Calendar, BarChart3, Milestone, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePMOInitiatives, usePMOSprints, usePMOWeeklyReports, usePMOReleases, usePMOMonthlyMetrics, usePDIPhases, usePDICycles } from "@/hooks/usePMO";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { format, nextMonday, startOfMonth, addMonths, startOfQuarter, addQuarters } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors: Record<string, string> = {
  healthy: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-red-500",
};

const pdiStatusConfig: Record<string, { label: string; color: string }> = {
  planejado: { label: "Planejado", color: "hsl(var(--muted-foreground))" },
  em_andamento: { label: "Em andamento", color: "hsl(210, 80%, 55%)" },
  em_risco: { label: "Em risco", color: "hsl(45, 93%, 47%)" },
  atrasado: { label: "Atrasado", color: "hsl(0, 72%, 51%)" },
  concluido: { label: "Concluído", color: "hsl(152, 69%, 41%)" },
  suspenso: { label: "Suspenso", color: "hsl(var(--muted-foreground))" },
};

const CHART_COLORS = ["#6366f1", "#3b82f6", "#f59e0b", "#ef4444", "#22c55e", "#94a3b8"];

const WORKSTREAMS = [
  { key: "A", label: "Discovery", icon: "🔍" },
  { key: "B", label: "Fundação", icon: "🏗️" },
  { key: "C", label: "Digitalização", icon: "⚡" },
  { key: "D", label: "Integrações", icon: "🔗" },
  { key: "E", label: "Governança", icon: "📋" },
];

function getNextRito() {
  const now = new Date();
  const wbr = nextMonday(now);
  const msr = startOfMonth(addMonths(now, 1));
  const gate = startOfQuarter(addQuarters(now, 1));

  const options = [
    { type: "WBR", date: wbr, label: "Weekly Business Review" },
    { type: "MSR", date: msr, label: "Monthly Strategic Review" },
    { type: "Gate", date: gate, label: "Executive Gate" },
  ];
  options.sort((a, b) => a.date.getTime() - b.date.getTime());
  return options[0];
}

function getHorizonte(phases: any[], cycles: any[]) {
  const now = new Date();
  const completedPhases = phases.filter(p => p.status === "concluido").length;
  const totalPhases = phases.length;
  const progress = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;

  if (progress < 33) return { label: "H1", title: "Horizonte 1 — Fundação", progress, color: "text-blue-500" };
  if (progress < 66) return { label: "H2", title: "Horizonte 2 — Escala", progress, color: "text-app-pmo" };
  return { label: "H3", title: "Horizonte 3 — Autonomia", progress, color: "text-emerald-500" };
}

const PMOOverview = () => {
  const { data: initiatives = [] } = usePMOInitiatives();
  const { data: sprints = [] } = usePMOSprints();
  const { data: reports = [] } = usePMOWeeklyReports();
  const { data: releases = [] } = usePMOReleases();
  const { data: metrics = [] } = usePMOMonthlyMetrics();
  const { data: phases = [] } = usePDIPhases();
  const { data: cycles = [] } = usePDICycles();
  const { tenant, user } = useAuth();
  const qc = useQueryClient();

  const [decisionOpen, setDecisionOpen] = useState(false);
  const [decTitle, setDecTitle] = useState("");
  const [decJustification, setDecJustification] = useState("");

  const blockedCount = initiatives.filter(i => i.stage === "blocked").length;
  const programStatus = blockedCount >= 3 ? "critical" : blockedCount >= 1 ? "warning" : "healthy";
  const statusLabel = programStatus === "healthy" ? "🟢 Saudável" : programStatus === "warning" ? "🟡 Atenção" : "🔴 Crítico";

  const activeSprint = sprints.find(s => s.status === "active");
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthMetrics = metrics.filter(m => m.month === currentMonth);
  const totalValue = monthMetrics.reduce((sum, m) => sum + (m.estimated_value_brl || 0), 0);
  const top10 = initiatives.filter(i => i.status !== "archived" && i.status !== "completed").slice(0, 10);
  const recentReleases = releases.slice(0, 3);
  const criticalRisks = initiatives.filter(i => i.risks && i.status !== "archived" && i.status !== "completed");

  const horizonte = useMemo(() => getHorizonte(phases, cycles), [phases, cycles]);
  const nextRito = useMemo(() => getNextRito(), []);

  const workstreamStatus = useMemo(() => {
    return WORKSTREAMS.map(ws => {
      const related = initiatives.filter(i => 
        i.area?.toLowerCase().includes(ws.label.toLowerCase()) || 
        i.title?.toLowerCase().includes(ws.label.toLowerCase())
      );
      const active = related.filter(i => i.status === "in_progress").length;
      const done = related.filter(i => i.status === "completed").length;
      return { ...ws, total: related.length, active, done };
    });
  }, [initiatives]);

  const totalPhases = phases.length;
  const avgProgress = totalPhases > 0 ? Math.round(phases.reduce((s, p) => s + (p.progress || 0), 0) / totalPhases) : 0;
  const atRiskOrLate = phases.filter(p => p.status === "em_risco" || p.status === "atrasado").length;
  const completedPhases = phases.filter(p => p.status === "concluido").length;

  const statusSummary = useMemo(() => {
    const groups: Record<string, { count: number; avgProgress: number; totalProgress: number }> = {};
    for (const key of Object.keys(pdiStatusConfig)) {
      groups[key] = { count: 0, avgProgress: 0, totalProgress: 0 };
    }
    phases.forEach(p => {
      const s = p.status || "planejado";
      if (!groups[s]) groups[s] = { count: 0, avgProgress: 0, totalProgress: 0 };
      groups[s].count++;
      groups[s].totalProgress += p.progress || 0;
    });
    Object.keys(groups).forEach(k => {
      if (groups[k].count > 0) groups[k].avgProgress = Math.round(groups[k].totalProgress / groups[k].count);
    });
    return groups;
  }, [phases]);

  const phaseChartData = phases.map(p => ({
    name: `F${p.phase_number}`,
    fullName: p.name,
    progress: p.progress || 0,
  }));

  const pieData = Object.entries(statusSummary)
    .filter(([, v]) => v.count > 0)
    .map(([key, val], i) => ({
      name: pdiStatusConfig[key]?.label || key,
      value: val.count,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));

  const handleCreateDecision = async () => {
    if (!decTitle || !tenant?.id || !user?.id) return;
    const { error } = await supabase.from("pmo_decisions").insert({
      tenant_id: tenant.id,
      created_by: user.id,
      title: decTitle,
      justification: decJustification,
    } as any);
    if (error) { toast.error("Erro ao criar decisão"); return; }
    toast.success("Decisão registrada");
    setDecisionOpen(false);
    setDecTitle("");
    setDecJustification("");
    qc.invalidateQueries({ queryKey: ["pmo-decisions"] });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão consolidada do programa — Horizontes, Workstreams e Ritos"
      />

      <div className="flex gap-2 justify-end -mt-2">
        <Button size="sm" variant="outline" onClick={() => setDecisionOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Decisão
        </Button>
        <Button size="sm" variant="outline" onClick={() => window.print()}>
          <FileText className="h-4 w-4 mr-1" /> Resumo Executivo
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className={`h-3 w-3 rounded-full ${statusColors[programStatus]}`} />
              <p className="text-xs text-muted-foreground">Status do Programa</p>
            </div>
            <p className="text-lg font-semibold text-foreground">{statusLabel}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{blockedCount} bloqueio(s) ativo(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Layers className={`h-3.5 w-3.5 ${horizonte.color}`} />
              <p className="text-xs text-muted-foreground">Horizonte Atual</p>
            </div>
            <p className="text-lg font-semibold text-foreground">{horizonte.label}</p>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={horizonte.progress} className="flex-1 h-1.5" />
              <span className="text-xs text-muted-foreground">{horizonte.progress}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Milestone className="h-3.5 w-3.5 text-app-pmo" />
              <p className="text-xs text-muted-foreground">Próximo Rito</p>
            </div>
            <p className="text-lg font-semibold text-foreground">{nextRito.type}</p>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
              {format(nextRito.date, "EEEE, dd MMM", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-app-pmo" />
              <p className="text-xs text-muted-foreground">Sprint Ativa</p>
            </div>
            <p className="text-lg font-semibold text-foreground">{activeSprint?.name || "Nenhuma"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{activeSprint?.status || "—"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-app-pmo" /> Workstreams (SOW)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {workstreamStatus.map(ws => (
                <div key={ws.key} className="p-3 rounded-xl border border-border/50 bg-card/50 text-center">
                  <span className="text-lg">{ws.icon}</span>
                  <p className="text-xs font-bold text-app-pmo mt-1">WS-{ws.key}</p>
                  <p className="text-[10px] text-muted-foreground">{ws.label}</p>
                  <div className="mt-2 space-y-0.5">
                    <p className="text-[10px] text-muted-foreground">{ws.active} ativas</p>
                    <p className="text-[10px] text-emerald-500">{ws.done} concluídas</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
              <p className="text-xs text-muted-foreground">Valor Entregue</p>
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">
              R$ {totalValue > 0 ? (totalValue / 1000).toFixed(1) + "k" : "0"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Economia estimada no mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="h-4 w-4 text-app-pmo" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Fases PDI</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalPhases}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Média Conclusão</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{avgProgress}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Risco + Atraso</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{atRiskOrLate}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Concluídas</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{completedPhases}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-app-pmo" /> Progresso por Fase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={phaseChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.[0]) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border rounded-lg p-2 text-xs shadow-lg">
                          <p className="font-medium">{d.fullName}</p>
                          <p className="text-muted-foreground">{d.progress}%</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="progress" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {phaseChartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} opacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-app-pmo" /> Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado disponível</p>
            ) : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4 text-app-pmo" /> Ciclos de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {cycles.map(cycle => {
              const st = pdiStatusConfig[cycle.status] || pdiStatusConfig.planejado;
              return (
                <div key={cycle.id} className="p-3 rounded-xl border border-border/50 bg-card/50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-app-pmo/10 text-app-pmo border-app-pmo/30 text-xs font-bold">{cycle.cycle_code}</Badge>
                    <Badge variant="outline" className="text-[9px]" style={{ borderColor: st.color, color: st.color }}>{st.label}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-1">{cycle.period}</p>
                  <div className="flex items-center gap-2">
                    <Progress value={cycle.progress} className="flex-1 h-1.5" />
                    <span className="text-xs font-semibold">{cycle.progress}%</span>
                  </div>
                  {cycle.owner && <p className="text-[10px] text-muted-foreground mt-1">Dono: {cycle.owner}</p>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Backlog Prioritário (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            {top10.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhuma iniciativa cadastrada.</p>
            ) : (
              <div className="space-y-2">
                {top10.map((ini, i) => (
                  <div key={ini.id} className="flex items-center gap-3 py-1.5 border-b border-border last:border-0">
                    <span className="text-xs text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{ini.title}</p>
                      <p className="text-xs text-muted-foreground">{ini.area || "Sem área"} · Score {ini.calculated_score ?? "—"}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {ini.priority === "now" ? "Agora" : ini.priority === "later" ? "Depois" : ini.priority === "never" ? "Nunca" : "—"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Releases Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentReleases.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma release registrada.</p>
              ) : (
                <div className="space-y-2">
                  {recentReleases.map(r => (
                    <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{r.version}</p>
                        <p className="text-xs text-muted-foreground">{r.release_date || "Sem data"}</p>
                      </div>
                      <Badge variant={r.status === "published" ? "default" : "outline"} className="text-[10px]">
                        {r.status === "published" ? "Publicada" : r.status === "draft" ? "Rascunho" : r.status || "—"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-500" /> Riscos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {criticalRisks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum risco crítico — ótimo sinal.</p>
              ) : (
                <div className="space-y-2">
                  {criticalRisks.slice(0, 5).map(r => (
                    <div key={r.id} className="flex items-start gap-2 py-1.5 border-b border-border last:border-0">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm text-foreground">{r.title}</p>
                        <p className="text-xs text-muted-foreground">{r.risks}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Resumo PDI por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="text-center py-2 text-xs font-medium text-muted-foreground uppercase">Qtd (Fases)</th>
                  <th className="text-center py-2 text-xs font-medium text-muted-foreground uppercase">Média % Conclusão</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(pdiStatusConfig).map(([key, cfg]) => {
                  const s = statusSummary[key];
                  return (
                    <tr key={key} className="border-b border-border/50 last:border-0">
                      <td className="py-2">
                        <Badge variant="outline" className="text-[10px]" style={{ borderColor: cfg.color, color: cfg.color }}>
                          {cfg.label}
                        </Badge>
                      </td>
                      <td className="text-center py-2 font-medium">{s?.count || 0}</td>
                      <td className="text-center py-2">
                        <div className="flex items-center justify-center gap-2">
                          <Progress value={s?.avgProgress || 0} className="w-16 h-1.5" />
                          <span className="text-xs">{s?.avgProgress || 0}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-border font-semibold">
                  <td className="py-2 text-xs uppercase">Total</td>
                  <td className="text-center py-2">{totalPhases}</td>
                  <td className="text-center py-2">{avgProgress}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={decisionOpen} onOpenChange={setDecisionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Decisão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input value={decTitle} onChange={e => setDecTitle(e.target.value)} placeholder="Decisão tomada..." />
            </div>
            <div>
              <Label>Justificativa</Label>
              <Textarea value={decJustification} onChange={e => setDecJustification(e.target.value)} placeholder="Por quê..." />
            </div>
            <Button onClick={handleCreateDecision} disabled={!decTitle} className="w-full bg-app-pmo hover:bg-app-pmo/90 text-white">
              Registrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PMOOverview;
