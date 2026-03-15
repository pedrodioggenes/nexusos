import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  ChevronRight,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format, differenceInDays, isWithinInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  useMarketingCampaigns, 
  campaignTypeLabels, 
  campaignStatusLabels,
  type MarketingCampaign 
} from "@/hooks/useMarketingCampaigns";

interface CampaignTimelineProps {
  className?: string;
  showHeader?: boolean;
  onAddCampaign?: () => void;
  onViewAll?: () => void;
  onCampaignClick?: (campaign: MarketingCampaign) => void;
}

const statusConfig = {
  draft: { color: "bg-muted", textColor: "text-muted-foreground", icon: Clock },
  pending_approval: { color: "bg-yellow-500/20", textColor: "text-yellow-500", icon: AlertCircle },
  approved: { color: "bg-blue-500/20", textColor: "text-blue-500", icon: CheckCircle },
  in_production: { color: "bg-purple-500/20", textColor: "text-purple-500", icon: Clock },
  active: { color: "bg-green-500/20", textColor: "text-green-500", icon: CheckCircle },
  completed: { color: "bg-muted", textColor: "text-muted-foreground", icon: CheckCircle },
  cancelled: { color: "bg-destructive/20", textColor: "text-destructive", icon: XCircle },
};

const typeColors: Record<string, string> = {
  seasonal: "bg-orange-500",
  promotional: "bg-green-500",
  institutional: "bg-blue-500",
  trade: "bg-purple-500",
  digital: "bg-cyan-500",
  event: "bg-pink-500",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function CampaignCard({ 
  campaign, 
  onClick 
}: { 
  campaign: MarketingCampaign; 
  onClick?: () => void;
}) {
  const config = statusConfig[campaign.status];
  const StatusIcon = config.icon;
  
  const today = new Date();
  const startDate = campaign.start_date ? parseISO(campaign.start_date) : null;
  const endDate = campaign.end_date ? parseISO(campaign.end_date) : null;
  
  const isActive = startDate && endDate && isWithinInterval(today, { start: startDate, end: endDate });
  const daysUntilStart = startDate ? differenceInDays(startDate, today) : null;
  const daysRemaining = endDate ? differenceInDays(endDate, today) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "w-64 shrink-0 p-3 rounded-lg border border-border/50 bg-card cursor-pointer transition-all hover:shadow-md",
        isActive && "ring-1 ring-green-500/50"
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", typeColors[campaign.type])} />
          <Badge variant="outline" className="text-[10px] h-4 px-1.5">
            {campaignTypeLabels[campaign.type]}
          </Badge>
        </div>
        <div className={cn("flex items-center gap-1 text-[10px]", config.textColor)}>
          <StatusIcon className="h-3 w-3" />
          <span>{campaignStatusLabels[campaign.status]}</span>
        </div>
      </div>

      {/* Title */}
      <h4 className="font-medium text-sm line-clamp-2 mb-2">{campaign.name}</h4>

      {/* Dates */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <Calendar className="h-3 w-3" />
        {startDate && endDate ? (
          <span>
            {format(startDate, "dd MMM", { locale: ptBR })} - {format(endDate, "dd MMM", { locale: ptBR })}
          </span>
        ) : (
          <span>Datas não definidas</span>
        )}
      </div>

      {/* Status indicator */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {campaign.planned_budget > 0 && formatCurrency(campaign.planned_budget)}
        </span>
        {daysUntilStart !== null && daysUntilStart > 0 && (
          <span className="text-blue-500">Inicia em {daysUntilStart}d</span>
        )}
        {isActive && daysRemaining !== null && (
          <span className="text-green-500">{daysRemaining}d restantes</span>
        )}
        {daysRemaining !== null && daysRemaining < 0 && campaign.status !== 'completed' && (
          <span className="text-destructive">Encerrada</span>
        )}
      </div>

      {/* Progress bar for active campaigns */}
      {isActive && startDate && endDate && (
        <div className="mt-2">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all"
              style={{ 
                width: `${Math.min(100, ((differenceInDays(today, startDate) / differenceInDays(endDate, startDate)) * 100))}%` 
              }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function CampaignTimeline({
  className,
  showHeader = true,
  onAddCampaign,
  onViewAll,
  onCampaignClick,
}: CampaignTimelineProps) {
  const navigate = useNavigate();
  const { data: campaigns = [], isLoading } = useMarketingCampaigns();
  
  // Sort by start date, with active campaigns first
  const sortedCampaigns = [...campaigns].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    if (!a.start_date) return 1;
    if (!b.start_date) return -1;
    return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
  });

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

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
              <Calendar className="h-4 w-4 text-module-gestao" />
              <CardTitle className="text-sm font-medium">Campanhas</CardTitle>
              {activeCampaigns > 0 && (
                <Badge className="h-5 px-1.5 text-[10px] bg-green-500/20 text-green-500 hover:bg-green-500/30">
                  {activeCampaigns} ativas
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {onAddCampaign && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onAddCampaign}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              )}
              {onViewAll && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={onViewAll}
                >
                  Ver todas
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className={cn(showHeader ? "pt-0" : "p-4")}>
        {sortedCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Nenhuma campanha</p>
            <p className="text-xs text-muted-foreground mb-3">
              Crie sua primeira campanha de marketing
            </p>
            {onAddCampaign && (
              <Button size="sm" onClick={onAddCampaign} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Nova Campanha
              </Button>
            )}
          </div>
        ) : (
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-2">
              {sortedCampaigns.slice(0, 10).map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onClick={() => {
                    if (onCampaignClick) {
                      onCampaignClick(campaign);
                    } else {
                      navigate(`/app/marketing/campanhas/${campaign.id}`);
                    }
                  }}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
