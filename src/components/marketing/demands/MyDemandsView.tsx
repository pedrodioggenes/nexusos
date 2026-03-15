import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  Circle,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { BlurFade } from "@/components/ui/blur-fade";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PremiumGlassCard } from "@/components/dashboard/PremiumGlassCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  useMarketingDemands,
  MarketingDemand,
  demandPriorityConfig,
  demandStatusConfig,
  demandTypeConfig,
} from "@/hooks/useMarketingDemands";

type TabValue = "pending" | "in_progress" | "completed";

export function MyDemandsView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabValue>("pending");

  // Fetch demands assigned to current user
  const { data: allDemands = [], isLoading } = useMarketingDemands({
    assigned_to: user?.id,
  });

  // Filter demands by tab
  const pendingDemands = allDemands.filter(d => d.status === 'open');
  const inProgressDemands = allDemands.filter(d => ['in_progress', 'review'].includes(d.status));
  const completedDemands = allDemands.filter(d => ['completed', 'approved'].includes(d.status));

  const getDemandsForTab = (tab: TabValue) => {
    switch (tab) {
      case "pending": return pendingDemands;
      case "in_progress": return inProgressDemands;
      case "completed": return completedDemands;
    }
  };

  const handleDemandClick = (demand: MarketingDemand) => {
    navigate(`/app/marketing/demandas/${demand.id}`);
  };

  const statCards = [
    {
      label: "Pendentes",
      value: pendingDemands.length,
      icon: Circle,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "Em Andamento",
      value: inProgressDemands.length,
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Concluídas",
      value: completedDemands.length,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  const renderDemandCard = (demand: MarketingDemand) => {
    const priorityConfig = demandPriorityConfig[demand.priority];
    const statusConfig = demandStatusConfig[demand.status];
    const typeConfig = demandTypeConfig[demand.type];
    const isOverdue = demand.due_date && 
      new Date(demand.due_date) < new Date() && 
      !['completed', 'cancelled', 'approved'].includes(demand.status);

    return (
      <PremiumGlassCard
        key={demand.id}
        className="p-4 cursor-pointer hover:border-app-gestao/50 transition-colors group"
        onClick={() => handleDemandClick(demand)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="h-4 w-4 text-app-gestao shrink-0" />
              <h3 className="font-medium truncate">{demand.title}</h3>
            </div>
            
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {typeof demand.description === 'string' 
                ? demand.description 
                : 'Clique para ver detalhes'}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn("text-xs", priorityConfig.bgColor, priorityConfig.color)}>
                {priorityConfig.label}
              </Badge>
              <Badge variant="outline" className={cn("text-xs", statusConfig.bgColor, statusConfig.color)}>
                {statusConfig.label}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Atrasado
                </Badge>
              )}
            </div>

            {demand.due_date && (
              <p className={cn(
                "text-xs mt-2",
                isOverdue ? "text-destructive" : "text-muted-foreground"
              )}>
                Prazo: {format(new Date(demand.due_date), "dd 'de' MMM", { locale: ptBR })}
              </p>
            )}
          </div>

          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
        </div>
      </PremiumGlassCard>
    );
  };

  const renderEmptyState = (tab: TabValue) => {
    const messages = {
      pending: "Nenhuma demanda pendente",
      in_progress: "Nenhuma demanda em andamento",
      completed: "Nenhuma demanda concluída",
    };

    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted/50 p-4 mb-4">
          <ClipboardList className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-muted-foreground">{messages[tab]}</p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-gestao" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <BlurFade delay={0.1}>
        <ScrollArea className="w-full pb-2">
          <div className="flex gap-3 min-w-max px-1">
            {statCards.map((stat) => (
              <PremiumGlassCard key={stat.label} className="p-4 min-w-[140px] shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                </div>
              </PremiumGlassCard>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </BlurFade>

      {/* Tabs */}
      <BlurFade delay={0.2}>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="pending" className="gap-2">
              <Circle className="h-4 w-4" />
              Pendentes
              {pendingDemands.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {pendingDemands.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="gap-2">
              <Clock className="h-4 w-4" />
              Em Andamento
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Concluídas
            </TabsTrigger>
          </TabsList>

          {(['pending', 'in_progress', 'completed'] as TabValue[]).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
              <div className="space-y-3">
                {getDemandsForTab(tab).length === 0 
                  ? renderEmptyState(tab)
                  : getDemandsForTab(tab).map(renderDemandCard)
                }
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </BlurFade>
    </div>
  );
}
