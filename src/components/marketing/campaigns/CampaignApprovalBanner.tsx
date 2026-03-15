import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Loader2,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  useApproveCampaign,
  useRejectCampaign,
  MarketingCampaign,
  campaignTypeLabels,
} from "@/hooks/useMarketingCampaigns";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CampaignApprovalBannerProps {
  campaigns: MarketingCampaign[];
  isLoading?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

export function CampaignApprovalBanner({ campaigns, isLoading }: CampaignApprovalBannerProps) {
  const navigate = useNavigate();
  const approveCampaign = useApproveCampaign();
  const rejectCampaign = useRejectCampaign();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const pendingCampaigns = campaigns.filter((c) => c.status === "pending_approval");

  if (isLoading || pendingCampaigns.length === 0) return null;

  const handleApprove = async (e: React.MouseEvent, campaign: MarketingCampaign) => {
    e.stopPropagation();
    setProcessingId(campaign.id);
    await approveCampaign.mutateAsync({
      campaignId: campaign.id,
      approvedBudget: campaign.planned_budget,
    });
    setProcessingId(null);
  };

  const handleReject = async (e: React.MouseEvent, campaign: MarketingCampaign) => {
    e.stopPropagation();
    setProcessingId(campaign.id);
    await rejectCampaign.mutateAsync({
      campaignId: campaign.id,
      reason: "Rejeitada via painel de aprovação",
    });
    setProcessingId(null);
  };

  return (
    <div className="rounded-lg border border-warning/30 bg-warning/5 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-warning/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-warning" />
          <span className="text-sm font-medium">Aguardando Aprovação</span>
          <Badge variant="secondary" className="bg-warning/20 text-warning text-xs">
            {pendingCampaigns.length}
          </Badge>
        </div>
        {collapsed ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              <ScrollArea className="w-full">
                <div className="flex gap-3">
                  {pendingCampaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="w-72 shrink-0 p-3 rounded-lg border border-border/50 bg-background/80 hover:bg-background transition-colors cursor-pointer"
                      onClick={() => navigate(`/app/marketing/campanhas/${campaign.id}`)}
                    >
                      {/* Campaign info */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <h4 className="text-xs font-medium line-clamp-1">{campaign.name}</h4>
                          <Badge variant="outline" className="text-[9px] mt-1">
                            {campaignTypeLabels[campaign.type]}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/app/marketing/campanhas/${campaign.id}`);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Info row */}
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
                        {campaign.start_date && campaign.end_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(new Date(campaign.start_date), "dd/MM", { locale: ptBR })} -{" "}
                              {format(new Date(campaign.end_date), "dd/MM", { locale: ptBR })}
                            </span>
                          </div>
                        )}
                        {campaign.planned_budget > 0 && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{formatCurrency(campaign.planned_budget)}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 h-7 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => handleReject(e, campaign)}
                          disabled={processingId === campaign.id}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Rejeitar
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 h-7 text-[10px] bg-success hover:bg-success/90"
                          onClick={(e) => handleApprove(e, campaign)}
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
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
