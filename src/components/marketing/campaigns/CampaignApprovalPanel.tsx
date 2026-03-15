import { useState } from "react";
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  DollarSign,
  Loader2,
  Eye 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  useApproveCampaign, 
  useRejectCampaign,
  MarketingCampaign,
  campaignTypeLabels 
} from "@/hooks/useMarketingCampaigns";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CampaignApprovalPanelProps {
  campaigns: MarketingCampaign[];
  onViewCampaign?: (campaign: MarketingCampaign) => void;
  isLoading?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

export function CampaignApprovalPanel({ campaigns, onViewCampaign, isLoading }: CampaignApprovalPanelProps) {
  const approveCampaign = useApproveCampaign();
  const rejectCampaign = useRejectCampaign();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingCampaigns = campaigns.filter((c) => c.status === "pending_approval");

  const handleApprove = async (campaign: MarketingCampaign) => {
    setProcessingId(campaign.id);
    await approveCampaign.mutateAsync({ 
      campaignId: campaign.id, 
      approvedBudget: campaign.planned_budget 
    });
    setProcessingId(null);
  };

  const handleReject = async (campaign: MarketingCampaign) => {
    setProcessingId(campaign.id);
    await rejectCampaign.mutateAsync({ 
      campaignId: campaign.id, 
      reason: "Rejeitada via painel de aprovação" 
    });
    setProcessingId(null);
  };

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <div className="h-5 bg-muted rounded animate-pulse w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-warning" />
            Aguardando Aprovação
          </CardTitle>
          <Badge variant="secondary" className="bg-warning/20 text-warning text-xs">
            {pendingCampaigns.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {pendingCampaigns.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="h-8 w-8 text-success/50 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              Nenhuma campanha pendente
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[320px]">
            <div className="space-y-3 pr-2">
              {pendingCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-medium line-clamp-2">
                        {campaign.name}
                      </h4>
                      <Badge variant="outline" className="text-[9px] mt-1">
                        {campaignTypeLabels[campaign.type]}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => onViewCampaign?.(campaign)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Info */}
                  <div className="space-y-1 text-[10px] text-muted-foreground mb-3">
                    {campaign.start_date && campaign.end_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(campaign.start_date), "dd/MM", { locale: ptBR })} - {format(new Date(campaign.end_date), "dd/MM", { locale: ptBR })}
                        </span>
                      </div>
                    )}
                    {campaign.planned_budget > 0 && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>{formatCurrency(campaign.planned_budget)}</span>
                      </div>
                    )}
                    {campaign.approval_deadline && (
                      <div className="flex items-center gap-1 text-warning">
                        <AlertCircle className="h-3 w-3" />
                        <span>Prazo: {format(new Date(campaign.approval_deadline), "dd/MM", { locale: ptBR })}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 h-7 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleReject(campaign)}
                      disabled={processingId === campaign.id}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Rejeitar
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-7 text-[10px] bg-success hover:bg-success/90"
                      onClick={() => handleApprove(campaign)}
                      disabled={processingId === campaign.id}
                    >
                      {processingId === campaign.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Aprovar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
