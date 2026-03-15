import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb, ArrowRight, AlertCircle, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GlassBentoCard, GlassBentoContent, GlassBentoHeader, GlassBentoTitle } from "@/components/ui/glass-bento";
import { useLatestMarketingKPI, type MarketingKPIByChannel } from "@/hooks/useMarketingKPIs";
import { useMarketingBudgets } from "@/hooks/useMarketingBudgets";
import { useMarketingExecutions } from "@/hooks/useMarketingExecutions";
import { useDemandStats } from "@/hooks/useMarketingDemands";

interface DriverItem {
  icon: typeof TrendingUp;
  iconColor: string;
  text: string;
  severity: "positive" | "negative" | "neutral";
  action?: { label: string; path: string };
}

interface MissingDataItem {
  text: string;
  ctaLabel: string;
  ctaPath: string;
}

export function DriverAnalysisPanel({ className }: { className?: string }) {
  const navigate = useNavigate();
  const { data: kpi } = useLatestMarketingKPI("monthly");
  const { data: budget } = useMarketingBudgets();
  const { data: executions = [] } = useMarketingExecutions();
  const { data: demandStats } = useDemandStats();

  const channelData = kpi?.marketing_kpis_by_channel || [];
  const categories = budget?.marketing_budget_categories || [];
  const totalBudget = budget?.total_budget || 0;
  const totalSpent = categories.reduce((sum, c) => sum + Number(c.spent_amount || 0), 0);

  const { drivers, missingData } = useMemo(() => {
    const drivers: DriverItem[] = [];
    const missingData: MissingDataItem[] = [];

    // 1. Channel analysis — find top and bottom performers
    if (channelData.length > 0) {
      const sorted = [...channelData].sort((a, b) => (b.roi || 0) - (a.roi || 0));
      const best = sorted[0];
      const worst = sorted[sorted.length - 1];

      if (best?.roi && best.roi > 0) {
        drivers.push({
          icon: TrendingUp,
          iconColor: "text-green-500",
          text: `${best.channel} é o canal com melhor ROI (${best.roi.toFixed(0)}%)`,
          severity: "positive",
          action: { label: "Ver KPIs por canal", path: "/app/marketing/kpis" },
        });
      }

      if (worst?.roi !== undefined && sorted.length > 1 && worst.roi < (best?.roi || 0) * 0.3) {
        drivers.push({
          icon: TrendingDown,
          iconColor: "text-red-500",
          text: `${worst.channel} tem ROI baixo (${worst.roi?.toFixed(0) || 0}%) — considere rever investimento`,
          severity: "negative",
          action: { label: "Analisar canal", path: "/app/marketing/kpis" },
        });
      }
    } else {
      missingData.push({
        text: "Sem KPIs por canal registrados",
        ctaLabel: "Registrar KPI",
        ctaPath: "/app/marketing/kpis",
      });
    }

    // 2. Budget deviations
    if (totalBudget > 0) {
      const usage = (totalSpent / totalBudget) * 100;
      const overSpent = categories.filter(c => Number(c.spent_amount) > Number(c.allocated_amount));

      if (overSpent.length > 0) {
        drivers.push({
          icon: AlertCircle,
          iconColor: "text-orange-500",
          text: `${overSpent.length} categoria(s) acima do orçado — ${overSpent.map(c => c.name).join(", ")}`,
          severity: "negative",
          action: { label: "Ver desvios", path: "/app/marketing/financeiro" },
        });
      } else if (usage < 50) {
        drivers.push({
          icon: BarChart3,
          iconColor: "text-blue-500",
          text: `Budget com ${usage.toFixed(0)}% utilizado — ritmo abaixo do esperado`,
          severity: "neutral",
          action: { label: "Ver budget", path: "/app/marketing/financeiro" },
        });
      }
    } else {
      missingData.push({
        text: "Sem budget configurado para o ano",
        ctaLabel: "Configurar budget",
        ctaPath: "/app/marketing/financeiro",
      });
    }

    // 3. Execution gap
    if (executions.length === 0) {
      missingData.push({
        text: "Nenhuma execução registrada no período",
        ctaLabel: "Registrar execução",
        ctaPath: "/app/marketing/execucoes",
      });
    } else {
      const withEvidence = executions.filter(e => (e.evidence_urls?.length || 0) > 0).length;
      const rate = Math.round((withEvidence / executions.length) * 100);
      if (rate < 60) {
        drivers.push({
          icon: AlertCircle,
          iconColor: "text-yellow-500",
          text: `Apenas ${rate}% das execuções têm evidência — dificulta auditoria`,
          severity: "neutral",
          action: { label: "Ver execuções", path: "/app/marketing/execucoes" },
        });
      }
    }

    // 4. Demand bottlenecks
    if (demandStats && demandStats.overdue > 0) {
      drivers.push({
        icon: AlertCircle,
        iconColor: "text-red-500",
        text: `${demandStats.overdue} demanda(s) atrasada(s) — pode afetar entregas`,
        severity: "negative",
        action: { label: "Ver atrasadas", path: "/app/marketing/demandas" },
      });
    }

    return { drivers: drivers.slice(0, 3), missingData: missingData.slice(0, 3) };
  }, [channelData, categories, totalBudget, totalSpent, executions, demandStats]);

  const isEmpty = drivers.length === 0 && missingData.length === 0;

  return (
    <GlassBentoCard className={cn("h-full", className)} glowColor="rgba(var(--app-gestao-rgb, 200,170,80), 0.15)">
      <GlassBentoContent>
        <GlassBentoHeader
          icon={<Lightbulb className="h-4 w-4 text-app-gestao" />}
        >
          <GlassBentoTitle>O que mudou</GlassBentoTitle>
        </GlassBentoHeader>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Lightbulb className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">
              Registre KPIs, execuções e transações para gerar insights automáticos.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Drivers */}
            {drivers.map((d, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-muted/30 border border-border/50"
              >
                <d.icon className={cn("h-4 w-4 shrink-0 mt-0.5", d.iconColor)} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-foreground/90 leading-relaxed">{d.text}</p>
                  {d.action && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] px-1.5 gap-1 text-app-gestao hover:text-app-gestao mt-1"
                      onClick={() => navigate(d.action!.path)}
                    >
                      {d.action.label}
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Missing data CTAs */}
            {missingData.map((m, i) => (
              <div
                key={`missing-${i}`}
                className="flex items-center gap-2 p-2 rounded-lg border border-dashed border-border/60"
              >
                <AlertCircle className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                <span className="text-[11px] text-muted-foreground flex-1">{m.text}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] px-2 shrink-0"
                  onClick={() => navigate(m.ctaPath)}
                >
                  {m.ctaLabel}
                </Button>
              </div>
            ))}
          </div>
        )}
      </GlassBentoContent>
    </GlassBentoCard>
  );
}
