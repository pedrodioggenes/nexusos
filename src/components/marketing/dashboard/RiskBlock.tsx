import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowRight, AlertTriangle, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GlassBentoCard, GlassBentoContent, GlassBentoHeader, GlassBentoTitle } from "@/components/ui/glass-bento";
import { useMarketingAlerts } from "@/hooks/useMarketingAlerts";
import { useDemandStats } from "@/hooks/useMarketingDemands";
import { useMarketingBudgets } from "@/hooks/useMarketingBudgets";

interface RiskItem {
  severity: "critical" | "warning" | "info";
  text: string;
  path: string;
  actionLabel: string;
}

const severityIcon = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Clock,
};

const severityColor = {
  critical: "text-red-500",
  warning: "text-orange-500",
  info: "text-yellow-500",
};

const severityBg = {
  critical: "bg-red-500/10 border-red-500/20",
  warning: "bg-orange-500/10 border-orange-500/20",
  info: "bg-yellow-500/10 border-yellow-500/20",
};

export function RiskBlock({ className }: { className?: string }) {
  const navigate = useNavigate();
  const { data: alerts = [] } = useMarketingAlerts({ unreadOnly: false });
  const { data: demandStats } = useDemandStats();
  const { data: budget } = useMarketingBudgets();

  const risks = useMemo(() => {
    const items: RiskItem[] = [];

    // From alerts — unresolved critical/warning
    const unresolvedAlerts = alerts.filter(a => !a.is_resolved);
    const criticalAlerts = unresolvedAlerts.filter(a => a.severity === "critical");
    const warningAlerts = unresolvedAlerts.filter(a => a.severity === "warning");

    if (criticalAlerts.length > 0) {
      items.push({
        severity: "critical",
        text: `${criticalAlerts.length} alerta(s) crítico(s) não resolvido(s)`,
        path: "/app/marketing/alertas",
        actionLabel: "Resolver agora",
      });
    }

    if (warningAlerts.length > 0) {
      items.push({
        severity: "warning",
        text: `${warningAlerts.length} alerta(s) de atenção pendente(s)`,
        path: "/app/marketing/alertas",
        actionLabel: "Ver alertas",
      });
    }

    // Overdue demands
    if (demandStats && demandStats.overdue > 0) {
      items.push({
        severity: demandStats.overdue >= 3 ? "critical" : "warning",
        text: `${demandStats.overdue} demanda(s) atrasada(s)`,
        path: "/app/marketing/demandas",
        actionLabel: "Ver atrasadas",
      });
    }

    // Urgent demands
    if (demandStats && demandStats.urgent > 0) {
      items.push({
        severity: "warning",
        text: `${demandStats.urgent} demanda(s) urgente(s) ativa(s)`,
        path: "/app/marketing/demandas",
        actionLabel: "Ver urgentes",
      });
    }

    // Budget overspend
    if (budget) {
      const categories = budget.marketing_budget_categories || [];
      const totalBudget = budget.total_budget || 0;
      const totalSpent = categories.reduce((sum, c) => sum + Number(c.spent_amount || 0), 0);
      if (totalBudget > 0 && totalSpent > totalBudget * 0.9) {
        items.push({
          severity: totalSpent > totalBudget ? "critical" : "warning",
          text: totalSpent > totalBudget
            ? `Budget estourado: ${((totalSpent / totalBudget) * 100).toFixed(0)}% utilizado`
            : `Budget em ${((totalSpent / totalBudget) * 100).toFixed(0)}% — atenção ao limite`,
          path: "/app/marketing/financeiro",
          actionLabel: "Ver financeiro",
        });
      }
    }

    // Sort by severity
    const order = { critical: 0, warning: 1, info: 2 };
    return items.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 5);
  }, [alerts, demandStats, budget]);

  return (
    <GlassBentoCard className={cn("h-full", className)} glowColor="rgba(239, 68, 68, 0.15)">
      <GlassBentoContent>
        <GlassBentoHeader
          icon={<ShieldAlert className="h-4 w-4 text-destructive" />}
          action={
            risks.length > 0 ? (
              <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                {risks.length}
              </Badge>
            ) : null
          }
        >
          <GlassBentoTitle>Riscos do Período</GlassBentoTitle>
        </GlassBentoHeader>

        {risks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <ShieldAlert className="h-8 w-8 text-green-500/40 mb-2" />
            <p className="text-sm font-medium text-foreground/80">Sem riscos ativos</p>
            <p className="text-[11px] text-muted-foreground">
              Nenhum risco identificado no período
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {risks.map((risk, i) => {
              const Icon = severityIcon[risk.severity];
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-2.5 p-2.5 rounded-xl border",
                    severityBg[risk.severity]
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", severityColor[risk.severity])} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-foreground/90">{risk.text}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-6 text-[10px] px-1.5 gap-1 mt-1",
                        severityColor[risk.severity]
                      )}
                      onClick={() => navigate(risk.path)}
                    >
                      {risk.actionLabel}
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassBentoContent>
    </GlassBentoCard>
  );
}
