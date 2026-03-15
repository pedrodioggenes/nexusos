import { useNavigate } from "react-router-dom";
import { AlertTriangle, Clock, CheckCircle, ArrowRight, Inbox, Zap, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TodayItem {
  icon: typeof AlertTriangle;
  label: string;
  count: number;
  severity: "critical" | "warning" | "info";
  path: string;
  cta: string;
}

interface Props {
  demands: { overdue: number; urgent: number; pending: number };
  campaigns: { pendingApproval: number; overdueApprovals: number };
  tasks: { overdue: number; inReview: number };
  alerts: { critical: number; warning: number };
}

const severityStyles = {
  critical: "border-destructive/30 bg-destructive/5",
  warning: "border-orange-500/30 bg-orange-500/5",
  info: "border-primary/20 bg-primary/5",
};

export function TodayActionCards({ demands, campaigns, tasks, alerts }: Props) {
  const navigate = useNavigate();

  const items: TodayItem[] = [];

  if (alerts.critical > 0) {
    items.push({
      icon: AlertTriangle,
      label: "Alertas críticos",
      count: alerts.critical,
      severity: "critical",
      path: "/app/marketing/alertas",
      cta: "Resolver",
    });
  }

  if (demands.overdue > 0) {
    items.push({
      icon: Clock,
      label: "Demandas atrasadas",
      count: demands.overdue,
      severity: "critical",
      path: "/app/marketing/demandas",
      cta: "Ver",
    });
  }

  if (campaigns.overdueApprovals > 0) {
    items.push({
      icon: FileText,
      label: "Aprovações vencidas",
      count: campaigns.overdueApprovals,
      severity: "critical",
      path: "/app/marketing/campanhas",
      cta: "Aprovar",
    });
  }

  if (tasks.overdue > 0) {
    items.push({
      icon: Inbox,
      label: "Tarefas atrasadas",
      count: tasks.overdue,
      severity: "warning",
      path: "/app/marketing/equipe/social",
      cta: "Ver",
    });
  }

  if (demands.urgent > 0) {
    items.push({
      icon: Zap,
      label: "Demandas urgentes",
      count: demands.urgent,
      severity: "warning",
      path: "/app/marketing/demandas",
      cta: "Priorizar",
    });
  }

  if (tasks.inReview > 0) {
    items.push({
      icon: CheckCircle,
      label: "Aguardando revisão",
      count: tasks.inReview,
      severity: "info",
      path: "/app/marketing/equipe/social",
      cta: "Revisar",
    });
  }

  if (campaigns.pendingApproval > 0) {
    items.push({
      icon: Calendar,
      label: "Campanhas p/ aprovar",
      count: campaigns.pendingApproval,
      severity: "info",
      path: "/app/marketing/campanhas",
      cta: "Aprovar",
    });
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
        <CheckCircle className="h-4 w-4 text-primary" />
        <span className="text-sm text-foreground/80">Sem pendências críticas agora</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {items.slice(0, 8).map((item, i) => {
        const Icon = item.icon;
        return (
          <button
            key={i}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col gap-1.5 p-3 rounded-xl border transition-all hover:scale-[1.02] text-left",
              severityStyles[item.severity]
            )}
          >
            <div className="flex items-center gap-1.5">
              <Icon className={cn(
                "h-3.5 w-3.5",
                item.severity === "critical" ? "text-destructive" :
                item.severity === "warning" ? "text-orange-500" : "text-primary"
              )} />
              <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-bold">{item.count}</Badge>
            </div>
            <span className="text-[11px] text-foreground/80 leading-tight">{item.label}</span>
            <span className={cn(
              "text-[10px] font-medium flex items-center gap-0.5",
              item.severity === "critical" ? "text-destructive" :
              item.severity === "warning" ? "text-orange-500" : "text-primary"
            )}>
              {item.cta} <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </button>
        );
      })}
    </div>
  );
}
