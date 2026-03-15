import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LinkToContext } from "./LinkToContext";
import { AlertTriangle, AlertCircle, Info, Lightbulb, ExternalLink } from "lucide-react";
import type { InsightFeedItem } from "@/data/dominio/inteligencia-mock";

const severityConfig = {
  critical: { icon: AlertTriangle, badge: "destructive" as const, border: "border-red-500/30", bg: "bg-red-500/5" },
  warning: { icon: AlertCircle, badge: "secondary" as const, border: "border-yellow-500/30", bg: "bg-yellow-500/5" },
  info: { icon: Info, badge: "outline" as const, border: "border-blue-500/30", bg: "bg-blue-500/5" },
};

const domainLabels: Record<string, string> = {
  produtos: "Produtos",
  vendas: "Vendas",
  financeiro: "Financeiro",
  compras: "Compras",
  pessoas: "Pessoas",
};

interface InsightCardProps {
  insight: InsightFeedItem;
}

export function InsightCard({ insight }: InsightCardProps) {
  const config = severityConfig[insight.severity];
  const Icon = config.icon;

  return (
    <Card className={`p-5 ${config.border} ${config.bg}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm leading-tight">{insight.title}</h3>
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge variant={config.badge} className="text-[10px] h-5">
                {insight.severity === "critical" ? "Crítico" : insight.severity === "warning" ? "Atenção" : "Info"}
              </Badge>
              <Badge variant="outline" className="text-[10px] h-5">
                {domainLabels[insight.domain] || insight.domain}
              </Badge>
            </div>
          </div>

          {/* O que está acontecendo */}
          <p className="text-sm text-foreground/90">{insight.what}</p>

          {/* Evidência */}
          <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-1.5 mb-1">
              <Lightbulb className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Evidência</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{insight.evidence}</p>
          </div>

          {/* Ação sugerida */}
          <div className="flex items-start gap-2">
            <span className="text-xs font-medium text-muted-foreground mt-0.5 shrink-0">Ação:</span>
            <p className="text-xs text-foreground/80">{insight.action}</p>
          </div>

          {/* Link para página relacionada */}
          <div className="pt-1">
            <LinkToContext
              label={insight.link_label}
              to={insight.link_to}
              state={insight.link_state}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
