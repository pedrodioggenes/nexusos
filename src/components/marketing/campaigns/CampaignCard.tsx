import { motion } from "framer-motion";
import { Calendar, DollarSign, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  MarketingCampaign, 
  campaignTypeLabels, 
  campaignPriorityLabels 
} from "@/hooks/useMarketingCampaigns";
import { InlineEdit, InlineEditNumber } from "@/components/ui/inline-edit";

interface CampaignCardProps {
  campaign: MarketingCampaign;
  onClick?: () => void;
  isDragging?: boolean;
  onUpdate?: (id: string, data: Partial<MarketingCampaign>) => void;
}

const typeColors: Record<string, string> = {
  seasonal: "bg-orange-500",
  promotional: "bg-green-500",
  institutional: "bg-blue-500",
  trade: "bg-purple-500",
  digital: "bg-cyan-500",
  event: "bg-pink-500",
};

const priorityColors: Record<string, string> = {
  low: "text-muted-foreground border-muted",
  medium: "text-blue-500 border-blue-500/30",
  high: "text-warning border-warning/30",
  urgent: "text-destructive border-destructive/30",
};

function formatCurrency(value: number): string {
  if (!value) return "R$ 0";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

export function CampaignCard({ campaign, onClick, isDragging, onUpdate }: CampaignCardProps) {
  const isOverdue = campaign.end_date && new Date(campaign.end_date) < new Date() && campaign.status !== 'completed';
  const isActive = campaign.status === 'active';

  const handleNameUpdate = (newName: string) => {
    onUpdate?.(campaign.id, { name: newName });
  };

  const handleBudgetUpdate = (newBudget: number) => {
    onUpdate?.(campaign.id, { planned_budget: newBudget });
  };

  const handleReachUpdate = (newReach: number) => {
    onUpdate?.(campaign.id, { expected_reach: newReach });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ 
        opacity: isDragging ? 0.5 : 1
      }}
      exit={{ opacity: 0, y: 8 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      style={{ willChange: 'transform' }}
    >
      <Card
        className={cn(
          "cursor-pointer transition-all hover:border-app-gestao/30",
          isDragging && "shadow-lg ring-2 ring-app-gestao/20",
          isActive && "ring-1 ring-success/30",
          isOverdue && "border-destructive/30"
        )}
        onClick={onClick}
      >
        <CardContent className="p-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className={cn(
                "h-2 w-2 rounded-full shrink-0",
                typeColors[campaign.type]
              )} />
              <Badge variant="outline" className="text-[9px]">
                {campaignTypeLabels[campaign.type]}
              </Badge>
            </div>
            <Badge 
              variant="outline" 
              className={cn("text-[9px] shrink-0", priorityColors[campaign.priority])}
            >
              {campaignPriorityLabels[campaign.priority]}
            </Badge>
          </div>

          {/* Title - Editable */}
          {onUpdate ? (
            <InlineEdit
              value={campaign.name}
              onSave={handleNameUpdate}
              className="text-xs font-medium mb-2"
              maxLength={150}
            />
          ) : (
            <h3 className="text-xs font-medium line-clamp-2 mb-2">{campaign.name}</h3>
          )}

          {/* Dates */}
          {campaign.start_date && campaign.end_date && (
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-2">
              <Calendar className="h-3 w-3" />
              <span className={cn(isOverdue && "text-destructive")}>
                {format(new Date(campaign.start_date), "dd MMM", { locale: ptBR })} - {format(new Date(campaign.end_date), "dd MMM", { locale: ptBR })}
              </span>
              {isOverdue && (
                <Badge variant="destructive" className="text-[8px] px-1 h-4">
                  Atrasado
                </Badge>
              )}
            </div>
          )}

          {/* Budget & Reach - Only show when values exist */}
          {(campaign.planned_budget > 0 || campaign.expected_reach > 0 || onUpdate) && (
            <div className="pt-2 border-t border-border/50 space-y-1">
              {(campaign.planned_budget > 0 || onUpdate) && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    <span>Orçamento</span>
                  </div>
                  {onUpdate ? (
                    <InlineEditNumber
                      value={campaign.planned_budget || 0}
                      onSave={handleBudgetUpdate}
                      className="text-xs font-medium text-app-gestao"
                      formatDisplay={formatCurrency}
                      min={0}
                      step={1000}
                    />
                  ) : (
                    <span className="text-xs font-medium text-app-gestao">
                      {formatCurrency(campaign.planned_budget)}
                    </span>
                  )}
                </div>
              )}

              {(campaign.expected_reach > 0 || onUpdate) && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Target className="h-3 w-3" />
                    <span>Alcance esperado</span>
                  </div>
                  {onUpdate ? (
                    <InlineEditNumber
                      value={campaign.expected_reach || 0}
                      onSave={handleReachUpdate}
                      className="text-[10px] font-medium"
                      formatDisplay={(v) => v.toLocaleString('pt-BR')}
                      min={0}
                      step={1000}
                    />
                  ) : (
                    <span className="text-[10px] font-medium">
                      {(campaign.expected_reach || 0).toLocaleString('pt-BR')}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
