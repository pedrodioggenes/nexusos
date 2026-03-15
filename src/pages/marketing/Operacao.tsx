import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, startOfWeek, isToday, isPast, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Calendar, AlertTriangle, CheckCircle2, Clock, Megaphone,
  ExternalLink, Plus, Trash2, FileCheck, Eye, ArrowRight,
  ClipboardCheck, ShieldAlert, Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Hooks
import { useMarketingPlans } from "@/hooks/useMarketingPlans";
import { useMarketingDemands } from "@/hooks/useMarketingDemands";
import { usePendingApprovals } from "@/hooks/useDemandWorkflow";
import { useMarketingExecutions } from "@/hooks/useMarketingExecutions";
import { useWeeklyChecklist, useAddChecklistItem, useToggleChecklistItem, useDeleteChecklistItem, getWeekStart } from "@/hooks/useWeeklyChecklist";

// ─── Block 1: Próximos 7 dias ───
function Next7DaysBlock() {
  const navigate = useNavigate();
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);

  const { data: plans = [] } = useMarketingPlans({
    startDate: today,
    endDate: weekEnd,
  });

  const { data: executions = [] } = useMarketingExecutions();

  const executedPlanIds = new Set(
    executions.filter(e => e.entity_type === "plan").map(e => e.entity_id)
  );

  // Group by day
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  const plansByDay = useMemo(() => {
    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayPlans = plans.filter(p => {
        const start = p.start_date?.split("T")[0];
        const end = p.end_date?.split("T")[0];
        return start && start <= dayStr && (!end || end >= dayStr);
      });
      return { day, plans: dayPlans };
    });
  }, [plans, days]);

  const getStatus = (plan: typeof plans[0]) => {
    if (executedPlanIds.has(plan.id)) return "executed";
    if (plan.status === "in_progress") return "in_progress";
    return "planned";
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "executed":
        return <Badge className="bg-green-500/10 text-green-500 border-0 text-[10px]">Executado</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500/10 text-blue-500 border-0 text-[10px]">Em andamento</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground border-0 text-[10px]">Planejado</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4 text-app-gestao" />
          Próximos 7 dias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[320px] overflow-y-auto">
        {plansByDay.map(({ day, plans: dayPlans }) => (
          <div key={day.toISOString()}>
            <p className={cn(
              "text-[11px] font-semibold uppercase tracking-wider mb-1",
              isToday(day) ? "text-app-gestao" : "text-muted-foreground"
            )}>
              {isToday(day) ? "Hoje" : format(day, "EEE, dd/MM", { locale: ptBR })}
            </p>
            {dayPlans.length === 0 ? (
              <p className="text-[11px] text-muted-foreground/50 mb-2">Sem ações</p>
            ) : (
              dayPlans.map(plan => (
                <div key={plan.id} className="flex items-center gap-2 py-1 pl-2 border-l-2 border-border mb-1">
                  <span className="text-[12px] flex-1 truncate">{plan.title}</span>
                  {statusBadge(getStatus(plan))}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => navigate("/app/marketing/planejamento")}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  {!executedPlanIds.has(plan.id) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => navigate("/app/marketing/execucoes")}
                    >
                      <FileCheck className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Block 2: Demandas Críticas ───
function CriticalDemandsBlock() {
  const navigate = useNavigate();
  const { data: demands = [] } = useMarketingDemands();

  const critical = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return demands.filter(d => {
      if (["completed", "cancelled"].includes(d.status)) return false;
      const isOverdue = d.due_date && d.due_date < today;
      const isUrgent = d.priority === "urgent" || d.priority === "high";
      const inApproval = d.status === "review";
      return isOverdue || isUrgent || inApproval;
    }).slice(0, 8);
  }, [demands]);

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "urgent": return "text-red-500";
      case "high": return "text-orange-500";
      default: return "text-yellow-500";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Demandas Críticas
          {critical.length > 0 && (
            <Badge variant="destructive" className="text-[10px] h-5">{critical.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 max-h-[320px] overflow-y-auto">
        {critical.length === 0 ? (
          <p className="text-[12px] text-muted-foreground text-center py-4">Nenhuma demanda crítica 🎉</p>
        ) : (
          critical.map(d => {
            const today = new Date().toISOString().split("T")[0];
            const isOverdue = d.due_date && d.due_date < today;
            return (
              <button
                key={d.id}
                onClick={() => navigate(`/app/marketing/demandas/${d.id}`)}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
              >
                <AlertTriangle className={cn("h-3.5 w-3.5 shrink-0", getPriorityColor(d.priority))} />
                <span className="text-[12px] flex-1 truncate">{d.title}</span>
                {isOverdue && <Badge className="bg-red-500/10 text-red-500 border-0 text-[10px]">Atrasada</Badge>}
                {d.status === "review" && <Badge className="bg-yellow-500/10 text-yellow-500 border-0 text-[10px]">Aprovação</Badge>}
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </button>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

// ─── Block 3: Aprovações Pendentes ───
function PendingApprovalsBlock() {
  const navigate = useNavigate();
  const { data: approvals = [] } = usePendingApprovals();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-yellow-500" />
          Aprovações Pendentes
          {approvals.length > 0 && (
            <Badge className="bg-yellow-500/10 text-yellow-500 border-0 text-[10px] h-5">{approvals.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 max-h-[320px] overflow-y-auto">
        {approvals.length === 0 ? (
          <p className="text-[12px] text-muted-foreground text-center py-4">Nenhuma aprovação pendente</p>
        ) : (
          approvals.map(a => (
            <button
              key={a.id}
              onClick={() => {
                if (a.marketing_demands?.id) {
                  navigate(`/app/marketing/demandas/${a.marketing_demands.id}`);
                }
              }}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <Clock className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
              <span className="text-[12px] flex-1 truncate">
                {a.marketing_demands?.title || "Demanda"}
              </span>
              <Badge className="bg-muted text-muted-foreground border-0 text-[10px]">
                {a.approver_role || "gestor"}
              </Badge>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ─── Block 4: Campanhas em Risco ───
function AtRiskCampaignsBlock() {
  const navigate = useNavigate();
  const { data: plans = [] } = useMarketingPlans();
  const { data: executions = [] } = useMarketingExecutions();

  const atRisk = useMemo(() => {
    const campaignPlans = plans.filter(p => p.type === "campaign" && p.status !== "completed");
    const executedIds = new Set(executions.filter(e => e.entity_type === "plan").map(e => e.entity_id));

    return campaignPlans.filter(p => {
      const noExecution = !executedIds.has(p.id);
      const noBudget = !p.budget || p.budget === 0;
      return noExecution || noBudget;
    }).slice(0, 6);
  }, [plans, executions]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-orange-500" />
          Campanhas em Risco
          {atRisk.length > 0 && (
            <Badge className="bg-orange-500/10 text-orange-500 border-0 text-[10px] h-5">{atRisk.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 max-h-[320px] overflow-y-auto">
        {atRisk.length === 0 ? (
          <p className="text-[12px] text-muted-foreground text-center py-4">Todas as campanhas estão em dia</p>
        ) : (
          atRisk.map(p => (
            <button
              key={p.id}
              onClick={() => navigate("/app/marketing/campanhas")}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <Megaphone className="h-3.5 w-3.5 text-orange-500 shrink-0" />
              <span className="text-[12px] flex-1 truncate">{p.title}</span>
              {(!p.budget || p.budget === 0) && (
                <Badge className="bg-red-500/10 text-red-500 border-0 text-[10px]">Sem verba</Badge>
              )}
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ─── Block 5: Checklist Semanal ───
function WeeklyChecklistBlock() {
  const [newItem, setNewItem] = useState("");
  const weekStart = getWeekStart();
  const { data: items = [] } = useWeeklyChecklist(weekStart);
  const addItem = useAddChecklistItem();
  const toggleItem = useToggleChecklistItem();
  const deleteItem = useDeleteChecklistItem();

  const handleAdd = () => {
    const label = newItem.trim();
    if (!label) return;
    addItem.mutate({ label, weekStart });
    setNewItem("");
  };

  const checked = items.filter(i => i.is_checked).length;
  const total = items.length;

  return (
    <Card className="md:col-span-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Checklist Semanal
          </CardTitle>
          {total > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {checked}/{total} concluídos
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Add item */}
        <div className="flex gap-2">
          <Input
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="Adicionar item..."
            className="h-8 text-[12px]"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={!newItem.trim() || addItem.isPending}
            className="h-8 px-3"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Items */}
        <div className="space-y-1 max-h-[240px] overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-[12px] text-muted-foreground text-center py-3">
              Nenhum item adicionado
            </p>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/30 group"
              >
                <Checkbox
                  checked={item.is_checked}
                  onCheckedChange={(checked) =>
                    toggleItem.mutate({ id: item.id, is_checked: !!checked })
                  }
                />
                <span className={cn(
                  "text-[12px] flex-1",
                  item.is_checked && "line-through text-muted-foreground"
                )}>
                  {item.label}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteItem.mutate(item.id)}
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Progress */}
        {total > 0 && (
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-300"
              style={{ width: `${(checked / total) * 100}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───
export default function Operacao() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <PageHeader
        title="Centro de Operação"
        description="Tudo que precisa acontecer esta semana — em uma visão só."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Next7DaysBlock />
        <CriticalDemandsBlock />
        <PendingApprovalsBlock />
        <AtRiskCampaignsBlock />
        <WeeklyChecklistBlock />
      </div>
    </div>
  );
}
