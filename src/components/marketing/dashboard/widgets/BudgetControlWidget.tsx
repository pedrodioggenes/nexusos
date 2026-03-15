import { useNavigate } from "react-router-dom";
import { DollarSign, ArrowRight, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GlassBentoCard, GlassBentoContent, GlassBentoHeader, GlassBentoTitle } from "@/components/ui/glass-bento";
import { cn } from "@/lib/utils";

interface Props {
  total: number;
  spent: number;
  percent: number;
  className?: string;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

export function BudgetControlWidget({ total, spent, percent, className }: Props) {
  const navigate = useNavigate();
  const remaining = total - spent;
  const isOverBudget = percent > 100;
  const isWarning = percent > 80;

  return (
    <GlassBentoCard className={cn("h-full", className)} glowColor={isOverBudget ? "rgba(239,68,68,0.15)" : "rgba(var(--app-gestao-rgb, 200,170,80), 0.1)"}>
      <GlassBentoContent>
        <GlassBentoHeader
          icon={<DollarSign className="h-4 w-4 text-app-gestao" />}
          action={
            <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={() => navigate('/app/marketing/financeiro')}>
              Detalhes <ArrowRight className="h-3 w-3" />
            </Button>
          }
        >
          <GlassBentoTitle>Controle de Budget</GlassBentoTitle>
        </GlassBentoHeader>

        {total === 0 ? (
          <div className="py-6 text-center">
            <DollarSign className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Sem budget configurado</p>
            <Button variant="outline" size="sm" className="mt-2 h-7 text-[11px]" onClick={() => navigate('/app/marketing/financeiro')}>
              Configurar budget
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(spent)}</p>
                <p className="text-[11px] text-muted-foreground">de {formatCurrency(total)}</p>
              </div>
              <Badge variant={isOverBudget ? "destructive" : isWarning ? "secondary" : "outline"} className="text-[11px]">
                {percent}%
              </Badge>
            </div>

            <Progress
              value={Math.min(percent, 100)}
              className={cn("h-2", isOverBudget && "[&>div]:bg-destructive", isWarning && !isOverBudget && "[&>div]:bg-orange-500")}
            />

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Saldo restante</span>
              <span className={cn("font-medium", remaining < 0 ? "text-destructive" : "text-foreground")}>
                {formatCurrency(remaining)}
              </span>
            </div>

            {isOverBudget && (
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                <AlertCircle className="h-3 w-3 text-destructive" />
                <span className="text-[10px] text-destructive">Budget estourado — atenção imediata necessária</span>
              </div>
            )}
          </div>
        )}
      </GlassBentoContent>
    </GlassBentoCard>
  );
}
