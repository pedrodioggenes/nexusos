import { BlurFade } from "@/components/ui/blur-fade";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Card } from "@/components/ui/card";
import { Users, Clock, TreePine, UserPlus, TrendingUp, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployees } from "@/hooks/useEmployees";
import { useLeaveRequests } from "@/hooks/useVacations";
import { useJobCandidates } from "@/hooks/useRecruitment";

/**
 * RH Dashboard
 * Visão geral de RH com métricas e alertas
 */
export default function RHHome() {
  const { tenant } = useAuth();
  const tenantId = tenant?.id;

  const { data: allEmployees = [] } = useEmployees(tenantId);
  const employees = allEmployees.filter((e) => e.status !== "inactive" && e.status !== "terminated");
  const { data: leaveRequests = [] } = useLeaveRequests(undefined, tenantId);
  const { data: candidates = [] } = useJobCandidates(tenantId);

  const today = new Date().toISOString().split("T")[0];
  const onLeaveToday = leaveRequests.filter(
    (r) => r.status === "approved" && r.start_date <= today && r.end_date >= today
  ).length;

  const pendingLeave = leaveRequests.filter((r) => r.status === "pending").length;
  const activeCandidates = candidates.filter((c) => c.status && c.status !== "hired" && c.status !== "rejected").length;

  return (
    <div className="space-y-6">
      <BlurFade delay={0}>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard RH</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão geral de pessoas e indicadores
          </p>
        </div>
      </BlurFade>

      {/* KPI Cards */}
      <BlurFade delay={0.1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card border-border hover:scale-[1.01]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-module-rh/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-module-rh" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground"><AnimatedCounter value={employees.length} color="text-foreground" duration={1.2} /></p>
                <p className="text-xs text-muted-foreground">Colaboradores</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border hover:scale-[1.01]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground"><AnimatedCounter value={employees.length - onLeaveToday} color="text-foreground" duration={1.2} /></p>
                <p className="text-xs text-muted-foreground">Presentes Hoje</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border hover:scale-[1.01]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TreePine className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground"><AnimatedCounter value={onLeaveToday} color="text-foreground" duration={1.2} /></p>
                <p className="text-xs text-muted-foreground">Em Férias/Licença</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border hover:scale-[1.01]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground"><AnimatedCounter value={activeCandidates} color="text-foreground" duration={1.2} /></p>
                <p className="text-xs text-muted-foreground">Candidatos Ativos</p>
              </div>
            </div>
          </Card>
        </div>
      </BlurFade>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <BlurFade delay={0.2}>
          <Card className="p-6 bg-card border-border">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Alertas
            </h3>
            {pendingLeave === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">Nenhum alerta pendente</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-center gap-2">
                    <TreePine className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-foreground">Solicitações de férias/licença pendentes</span>
                  </div>
                  <span className="text-sm font-bold text-amber-500">{pendingLeave}</span>
                </div>
              </div>
            )}
          </Card>
        </BlurFade>

        <BlurFade delay={0.3}>
          <Card className="p-6 bg-card border-border">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-module-rh" />
              Recrutamento
            </h3>
            {candidates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">Nenhum candidato em processo</p>
              </div>
            ) : (
              <div className="space-y-2">
                {candidates.slice(0, 4).map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.position_applied}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-module-rh/10 text-module-rh font-medium capitalize">
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </BlurFade>
      </div>

      {employees.length === 0 && (
        <BlurFade delay={0.4}>
          <Card className="p-6 bg-module-rh/5 border-module-rh/20">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-module-rh/10 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 text-module-rh" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Bem-vindo ao RH</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Gerencie colaboradores, controle ponto, férias e avaliações de desempenho em um só lugar.
                  Comece cadastrando seus colaboradores para desbloquear todas as funcionalidades.
                </p>
              </div>
            </div>
          </Card>
        </BlurFade>
      )}
    </div>
  );
}
