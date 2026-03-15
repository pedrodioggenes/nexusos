import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { 
  Megaphone, 
  Plus, 
  Search,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  LayoutGrid,
  List,
  DollarSign
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  useMarketingCampaigns, 
  useCampaignStats,
  useDeleteCampaign,
  useUpdateCampaign,
  campaignTypeLabels,
  campaignStatusLabels,
  type MarketingCampaign 
} from "@/hooks/useMarketingCampaigns";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CampaignTimeline } from "@/components/marketing/CampaignTimeline";
import { CampaignKanban } from "@/components/marketing/campaigns";
import { CampaignApprovalBanner } from "@/components/marketing/campaigns/CampaignApprovalBanner";
import { StatCard } from "@/components/ui/stat-card";
import { PageWrapper } from "@/components/marketing/PageWrapper";
import { Empty } from "@/components/ui/empty";
import { PeriodFilter, usePeriodFilter } from "@/components/ui/period-filter";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const statusIcons = {
  draft: Clock,
  pending_approval: AlertCircle,
  approved: CheckCircle,
  in_production: Clock,
  active: Play,
  completed: CheckCircle,
  cancelled: Pause,
};

const typeColors: Record<string, string> = {
  seasonal: "bg-orange-500",
  promotional: "bg-green-500",
  institutional: "bg-blue-500",
  trade: "bg-purple-500",
  digital: "bg-cyan-500",
  event: "bg-pink-500",
};

export default function Campanhas() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const { period, setPeriod, getDateRange, customRange, setCustomRange } = usePeriodFilter('all');

  const { data: campaigns = [], isLoading } = useMarketingCampaigns();
  const { data: stats } = useCampaignStats();
  const deleteCampaign = useDeleteCampaign();
  const updateCampaign = useUpdateCampaign();

  const filteredCampaigns = campaigns.filter(campaign => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!campaign.name.toLowerCase().includes(query)) return false;
    }
    if (period !== 'all') {
      const { start, end } = getDateRange();
      const campaignStart = campaign.start_date ? new Date(campaign.start_date) : null;
      const campaignEnd = campaign.end_date ? new Date(campaign.end_date) : null;
      if (campaignStart && campaignEnd) {
        if (campaignEnd < start || campaignStart > end) return false;
      } else if (campaignStart) {
        if (campaignStart > end || campaignStart < start) return false;
      } else {
        return false;
      }
    }
    return true;
  });

  const handleCreateCampaign = () => {
    navigate('/app/marketing/campanhas/nova');
  };

  const handleViewCampaign = (campaign: MarketingCampaign) => {
    navigate(`/app/marketing/campanhas/${campaign.id}`);
  };

  const handleEditCampaign = (campaign: MarketingCampaign) => {
    navigate(`/app/marketing/campanhas/${campaign.id}/editar`);
  };

  const handleStatusChange = (campaign: MarketingCampaign, newStatus: string) => {
    updateCampaign.mutate({
      id: campaign.id,
      status: newStatus as MarketingCampaign['status'],
    });
  };

  return (
    <PageWrapper
      title="Campanhas de Marketing"
      subtitle="Gestão completa do ciclo de campanhas"
      icon={<Megaphone className="h-5 w-5 text-app-gestao" />}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'kanban' | 'list')}>
            <TabsList className="h-8">
              <TabsTrigger value="kanban" className="text-xs gap-1 px-2">
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Kanban</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="text-xs gap-1 px-2">
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Lista</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            size="sm"
            onClick={handleCreateCampaign}
            className="gap-1.5 bg-app-gestao hover:bg-app-gestao/90"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Nova</span> Campanha
          </Button>
        </div>
      }
    >

      {/* Stats Cards */}
      <div className="flex gap-2 md:gap-3 overflow-x-auto pb-1 -mx-1 px-1 md:grid md:grid-cols-5 md:overflow-visible md:pb-0">
        <StatCard title="Total" value={stats?.total || 0} icon={<Megaphone className="h-4 w-4" />} className="min-w-[130px] md:min-w-0" />
        <StatCard title="Rascunhos" value={stats?.draft || 0} icon={<Clock className="h-4 w-4" />} className="min-w-[130px] md:min-w-0" />
        <StatCard title="Aprovação" value={stats?.pending || 0} icon={<AlertCircle className="h-4 w-4" />} variant="warning" className="min-w-[130px] md:min-w-0" />
        <StatCard title="Ativas" value={stats?.active || 0} icon={<Play className="h-4 w-4" />} variant="success" className="min-w-[130px] md:min-w-0" />
        <StatCard title="Orçamento" value={formatCurrency(stats?.totalBudget || 0)} icon={<DollarSign className="h-4 w-4" />} variant="accent" className="min-w-[130px] md:min-w-0" />
      </div>

      {/* Timeline */}
      <CampaignTimeline onAddCampaign={handleCreateCampaign} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar campanha..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <PeriodFilter
          value={period}
          onChange={setPeriod}
          options={['today', 'week', '7d', '30d', '90d', 'month', 'quarter', 'semester', 'year', 'all', 'custom']}
          customRange={customRange}
          onCustomRangeChange={setCustomRange}
        />
      </div>

      {/* Approval Banner */}
      <CampaignApprovalBanner campaigns={campaigns} isLoading={isLoading} />

      {/* Main Content */}
      {viewMode === 'kanban' ? (
        <CampaignKanban
          campaigns={filteredCampaigns}
          onCampaignClick={handleViewCampaign}
          isLoading={isLoading}
        />
      ) : (
        /* List View */
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="h-5 w-5 border-2 border-app-gestao/30 border-t-app-gestao rounded-full animate-spin" />
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <Empty
              icon={<Megaphone className="h-12 w-12" />}
              title="Nenhuma campanha encontrada"
              description="Crie sua primeira campanha de marketing"
              action={
                <Button size="sm" onClick={handleCreateCampaign} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Nova Campanha
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCampaigns.map((campaign, index) => {
                const StatusIcon = statusIcons[campaign.status];

                return (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className={cn(
                        "border-border/50 hover:shadow-md transition-all cursor-pointer",
                        campaign.status === 'active' && "ring-1 ring-success/30"
                      )}
                      onClick={() => handleViewCampaign(campaign)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={cn("h-2 w-2 rounded-full", typeColors[campaign.type])} />
                            <Badge variant="outline" className="text-[10px]">
                              {campaignTypeLabels[campaign.type]}
                            </Badge>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewCampaign(campaign)}>
                                <Eye className="h-3.5 w-3.5 mr-2" />Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditCampaign(campaign)}>
                                <Edit className="h-3.5 w-3.5 mr-2" />Editar
                              </DropdownMenuItem>
                              {campaign.status === 'draft' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(campaign, 'pending_approval')}>
                                  <AlertCircle className="h-3.5 w-3.5 mr-2" />Enviar para Aprovação
                                </DropdownMenuItem>
                              )}
                              {campaign.status === 'pending_approval' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(campaign, 'approved')}>
                                  <CheckCircle className="h-3.5 w-3.5 mr-2" />Aprovar
                                </DropdownMenuItem>
                              )}
                              {campaign.status === 'approved' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(campaign, 'active')}>
                                  <Play className="h-3.5 w-3.5 mr-2" />Iniciar
                                </DropdownMenuItem>
                              )}
                              {campaign.status === 'active' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(campaign, 'completed')}>
                                  <CheckCircle className="h-3.5 w-3.5 mr-2" />Concluir
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-destructive" onClick={() => deleteCampaign.mutate(campaign.id)}>
                                <Trash2 className="h-3.5 w-3.5 mr-2" />Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <h3 className="font-medium text-sm line-clamp-2 mb-2">{campaign.name}</h3>

                        {campaign.start_date && campaign.end_date && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(new Date(campaign.start_date), "dd MMM", { locale: ptBR })} - {format(new Date(campaign.end_date), "dd MMM", { locale: ptBR })}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <StatusIcon className={cn(
                              "h-3.5 w-3.5",
                              campaign.status === 'active' && "text-success",
                              campaign.status === 'draft' && "text-muted-foreground",
                              campaign.status === 'pending_approval' && "text-warning",
                              campaign.status === 'completed' && "text-primary"
                            )} />
                            <span className="text-xs text-muted-foreground">
                              {campaignStatusLabels[campaign.status]}
                            </span>
                          </div>
                          {campaign.planned_budget > 0 && (
                            <span className="text-xs font-medium">{formatCurrency(campaign.planned_budget)}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
}
