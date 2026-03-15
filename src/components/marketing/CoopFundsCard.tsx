import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Handshake, 
  ChevronRight,
  Plus,
  TrendingUp,
  Building2
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCoopFunds, useCoopFundsStats, type CoopFund } from "@/hooks/useCoopFunds";

interface CoopFundsCardProps {
  className?: string;
  showHeader?: boolean;
  limit?: number;
  onAddFund?: () => void;
  onViewAll?: () => void;
  onFundClick?: (fund: CoopFund) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function FundItem({ 
  fund, 
  onClick 
}: { 
  fund: CoopFund; 
  onClick?: () => void;
}) {
  const utilizationRate = fund.utilization_rate || 0;
  const isHighUtilization = utilizationRate >= 80;
  const isLowUtilization = utilizationRate < 30;

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-muted/30 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-module-gestao/10 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-module-gestao" />
          </div>
          <div className="min-w-0">
            <h4 className="font-medium text-sm truncate">
              {fund.supplier?.name || "Fornecedor"}
            </h4>
            <span className="text-[10px] text-muted-foreground">
              {fund.quarter ? `Q${fund.quarter}/${fund.year}` : fund.year}
            </span>
          </div>
        </div>
        <Badge 
          variant="outline" 
          className={cn(
            "text-[10px] h-4 px-1.5",
            fund.status === 'active' && "border-green-500/50 text-green-500",
            fund.status === 'negotiating' && "border-yellow-500/50 text-yellow-500",
            fund.status === 'closed' && "border-muted-foreground/50 text-muted-foreground"
          )}
        >
          {fund.status === 'active' && 'Ativo'}
          {fund.status === 'negotiating' && 'Negociando'}
          {fund.status === 'closed' && 'Encerrado'}
          {fund.status === 'cancelled' && 'Cancelado'}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Negociado</span>
          <span className="font-medium">{formatCurrency(fund.negotiated_amount)}</span>
        </div>

        <Progress 
          value={utilizationRate} 
          className={cn(
            "h-1.5",
            isHighUtilization && "[&>div]:bg-green-500",
            isLowUtilization && "[&>div]:bg-yellow-500",
            !isHighUtilization && !isLowUtilization && "[&>div]:bg-module-gestao"
          )}
        />

        <div className="flex items-center justify-between text-[10px]">
          <span className={cn(
            "font-medium",
            isHighUtilization && "text-green-500",
            isLowUtilization && "text-yellow-500"
          )}>
            {utilizationRate.toFixed(0)}% utilizado
          </span>
          <span className="text-muted-foreground">
            {formatCurrency(fund.executed_amount)} / {formatCurrency(fund.negotiated_amount)}
          </span>
        </div>

        {fund.pending_proof_amount > 0 && (
          <div className="text-[10px] text-yellow-500">
            {formatCurrency(fund.pending_proof_amount)} aguardando comprovação
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function CoopFundsCard({
  className,
  showHeader = true,
  limit = 4,
  onAddFund,
  onViewAll,
  onFundClick,
}: CoopFundsCardProps) {
  const { data: funds = [], isLoading } = useCoopFunds();
  const { data: stats } = useCoopFundsStats();
  
  const displayFunds = funds.slice(0, limit);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="h-5 w-5 border-2 border-module-gestao/30 border-t-module-gestao rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border/50", className)}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Handshake className="h-4 w-4 text-module-gestao" />
              <CardTitle className="text-sm font-medium">Verbas Cooperadas</CardTitle>
              {stats && stats.activeCount > 0 && (
                <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                  {stats.activeCount} ativos
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {onAddFund && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onAddFund}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              )}
              {onViewAll && funds.length > limit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={onViewAll}
                >
                  Ver todos
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className={cn(showHeader ? "pt-0" : "p-4")}>
        {/* Stats Summary */}
        {stats && stats.totalNegotiated > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4 p-2 rounded-lg bg-muted/30">
            <div className="text-center">
              <p className="text-lg font-semibold text-module-gestao">
                {formatCurrency(stats.totalNegotiated)}
              </p>
              <p className="text-[10px] text-muted-foreground">Total Negociado</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-green-500">
                {stats.utilizationRate.toFixed(0)}%
              </p>
              <p className="text-[10px] text-muted-foreground">Utilização</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-yellow-500">
                {formatCurrency(stats.pendingProof)}
              </p>
              <p className="text-[10px] text-muted-foreground">A Comprovar</p>
            </div>
          </div>
        )}

        {displayFunds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Handshake className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Nenhuma verba cooperada</p>
            <p className="text-xs text-muted-foreground mb-3">
              Registre verbas negociadas com fornecedores
            </p>
            {onAddFund && (
              <Button size="sm" onClick={onAddFund} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Adicionar Verba
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {displayFunds.map((fund) => (
              <FundItem
                key={fund.id}
                fund={fund}
                onClick={() => onFundClick?.(fund)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
