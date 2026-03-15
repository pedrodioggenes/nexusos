import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Instagram,
  MousePointer,
  Palette,
  PenTool,
  Video,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useTeamTasks, type TeamTask, type TaskType } from "@/hooks/useTeamTasks";
import { PageWrapper } from "@/components/marketing/PageWrapper";
import { PremiumGlassCard } from "@/components/dashboard/PremiumGlassCard";
import { BlurFade } from "@/components/ui/blur-fade";
import { StatCardWithSparkline } from "@/components/marketing/StatCardWithSparkline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const AREA_CONFIG: {
  type: TaskType;
  label: string;
  icon: React.ReactNode;
  route: string;
  color: string;
}[] = [
  { type: "social", label: "Social Media", icon: <Instagram className="h-4 w-4" />, route: "/app/marketing/equipe/social-media", color: "text-primary" },
  { type: "traffic", label: "Tráfego", icon: <MousePointer className="h-4 w-4" />, route: "/app/marketing/equipe/trafego", color: "text-amber-500" },
  { type: "design", label: "Design", icon: <Palette className="h-4 w-4" />, route: "/app/marketing/equipe/design", color: "text-module-gestao" },
  { type: "copy", label: "Copywriter", icon: <PenTool className="h-4 w-4" />, route: "/app/marketing/equipe/copywriter", color: "text-emerald-500" },
  { type: "video", label: "Videomaker", icon: <Video className="h-4 w-4" />, route: "/app/marketing/equipe/videomaker", color: "text-destructive" },
];

function getStats(tasks: TeamTask[]) {
  const now = new Date();
  return {
    total: tasks.length,
    open: tasks.filter((t) => t.status !== "done").length,
    overdue: tasks.filter((t) => {
      if (!t.deadline || t.status === "done") return false;
      return new Date(t.deadline) < now;
    }).length,
    pendingApproval: tasks.filter((t) => t.status === "review").length,
    done: tasks.filter((t) => t.status === "done").length,
  };
}

function getAreaStats(tasks: TeamTask[], type: TaskType) {
  const areaTasks = tasks.filter((t) => t.task_type === type);
  return {
    total: areaTasks.length,
    open: areaTasks.filter((t) => t.status !== "done").length,
    review: areaTasks.filter((t) => t.status === "review").length,
    done: areaTasks.filter((t) => t.status === "done").length,
    overdue: areaTasks.filter((t) => {
      if (!t.deadline || t.status === "done") return false;
      return new Date(t.deadline) < new Date();
    }).length,
  };
}

export default function VisaoGeral() {
  const navigate = useNavigate();
  const { data: allTasks = [], isLoading } = useTeamTasks();

  const stats = useMemo(() => getStats(allTasks), [allTasks]);

  const criticalTasks = useMemo(() => {
    const now = new Date();
    return allTasks
      .filter((t) => t.status !== "done")
      .filter((t) => {
        if (t.priority === "urgent" || t.priority === "high") return true;
        if (t.deadline && new Date(t.deadline) < now) return true;
        return false;
      })
      .slice(0, 5);
  }, [allTasks]);

  const areaLabel: Record<TaskType, string> = {
    social: "Social Media",
    traffic: "Tráfego",
    design: "Design",
    copy: "Copywriter",
    video: "Videomaker",
  };

  return (
    <PageWrapper
      title="Equipe — Visão Geral"
      subtitle="Dashboard consolidado de produtividade da equipe"
      icon={<Users className="h-5 w-5 text-module-gestao" />}
    >
      {/* KPI Cards */}
      <BlurFade delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCardWithSparkline
            title="Tarefas Abertas"
            value={stats.open}
            icon={<Clock className="h-4 w-4" />}
            isLoading={isLoading}
          />
          <StatCardWithSparkline
            title="Atrasadas"
            value={stats.overdue}
            icon={<AlertTriangle className="h-4 w-4" />}
            changeType={stats.overdue > 0 ? "negative" : "neutral"}
            isLoading={isLoading}
          />
          <StatCardWithSparkline
            title="Aprovação Pendente"
            value={stats.pendingApproval}
            icon={<TrendingUp className="h-4 w-4" />}
            changeType={stats.pendingApproval > 0 ? "negative" : "neutral"}
            isLoading={isLoading}
          />
          <StatCardWithSparkline
            title="Concluídas"
            value={stats.done}
            icon={<CheckCircle className="h-4 w-4" />}
            changeType="positive"
            isLoading={isLoading}
          />
        </div>
      </BlurFade>

      {/* Areas Table */}
      <BlurFade delay={0.1}>
        <PremiumGlassCard>
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold">Desempenho por Área</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase text-muted-foreground">Área</th>
                  <th className="text-center px-3 py-3 text-xs font-medium uppercase text-muted-foreground">Total</th>
                  <th className="text-center px-3 py-3 text-xs font-medium uppercase text-muted-foreground">Abertas</th>
                  <th className="text-center px-3 py-3 text-xs font-medium uppercase text-muted-foreground">Aprovação</th>
                  <th className="text-center px-3 py-3 text-xs font-medium uppercase text-muted-foreground">Atrasadas</th>
                  <th className="text-center px-3 py-3 text-xs font-medium uppercase text-muted-foreground">Concluídas</th>
                  <th className="text-right px-4 py-3 text-xs font-medium uppercase text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {AREA_CONFIG.map((area) => {
                  const areaStats = getAreaStats(allTasks, area.type);
                  return (
                    <tr key={area.type} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={area.color}>{area.icon}</span>
                          <span className="font-medium">{area.label}</span>
                        </div>
                      </td>
                      <td className="text-center px-3 py-3 font-semibold">{areaStats.total}</td>
                      <td className="text-center px-3 py-3">{areaStats.open}</td>
                      <td className="text-center px-3 py-3">
                        {areaStats.review > 0 ? (
                          <Badge variant="outline" className="text-amber-500 border-amber-500/30">{areaStats.review}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="text-center px-3 py-3">
                        {areaStats.overdue > 0 ? (
                          <Badge variant="destructive" className="text-xs">{areaStats.overdue}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="text-center px-3 py-3 text-emerald-500 font-medium">{areaStats.done}</td>
                      <td className="text-right px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(area.route)}
                          className="gap-1 text-xs"
                        >
                          Abrir
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </PremiumGlassCard>
      </BlurFade>

      {/* Critical Tasks */}
      <BlurFade delay={0.15}>
        <PremiumGlassCard>
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Tarefas Críticas
            </h3>
          </div>
          <div className="divide-y divide-border">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Carregando...</div>
            ) : criticalTasks.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-500/50" />
                <p className="text-sm text-muted-foreground">Nenhuma tarefa crítica no momento</p>
              </div>
            ) : (
              criticalTasks.map((task) => {
                const isOverdue = task.deadline && new Date(task.deadline) < new Date();
                return (
                  <div key={task.id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px]">
                          {areaLabel[task.task_type]}
                        </Badge>
                        {task.priority === "urgent" && (
                          <Badge variant="destructive" className="text-[10px]">Urgente</Badge>
                        )}
                        {task.priority === "high" && (
                          <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">Alta</Badge>
                        )}
                        {isOverdue && (
                          <span className="text-[10px] text-destructive font-medium">Atrasada</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(AREA_CONFIG.find(a => a.type === task.task_type)?.route || "#")}
                      className="text-xs shrink-0"
                    >
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </PremiumGlassCard>
      </BlurFade>
    </PageWrapper>
  );
}
