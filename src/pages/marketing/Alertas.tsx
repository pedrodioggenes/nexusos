import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  Check, 
  AlertCircle, 
  AlertTriangle, 
  Info,
  Search,
  CheckCheck,
  Plus,
  Shield,
  ExternalLink,
  Sparkles,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMarketingAlerts, useResolveAlert, useMarkAlertAsRead, type MarketingAlert } from "@/hooks/useMarketingAlerts";
import { useAlertEvaluation } from "@/hooks/useAlertEvaluation";
import { CreateAlertDialog } from "@/components/marketing/CreateAlertDialog";
import { AlertRulesPanel } from "@/components/marketing/AlertRulesPanel";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/ui/blur-fade";
import { StatCardWithSparkline } from "@/components/marketing/StatCardWithSparkline";
import { Empty } from "@/components/ui/empty";
import { PageWrapper } from "@/components/marketing/PageWrapper";

const severityConfig = {
  critical: {
    icon: AlertCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    label: "Crítico",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    label: "Atenção",
  },
  info: {
    icon: Info,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Info",
  },
};

const typeLabels: Record<string, string> = {
  budget: "Orçamento",
  roi: "ROI",
  execution: "Execução",
  supplier: "Fornecedor",
  goal: "Meta",
  anomaly: "Anomalia",
  sla: "SLA/Processo",
};

export default function Alertas() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [mainTab, setMainTab] = useState("alerts");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const { data: alerts = [], isLoading } = useMarketingAlerts();
  const resolveAlert = useResolveAlert();
  const markAsRead = useMarkAlertAsRead();

  // Run evaluation engine on page load
  useAlertEvaluation();

  const filteredAlerts = alerts.filter(alert => {
    if (activeTab === "unread" && alert.is_read) return false;
    if (activeTab === "resolved" && !alert.is_resolved) return false;
    if (activeTab === "pending" && alert.is_resolved) return false;
    if (selectedTypes.length > 0 && !selectedTypes.includes(alert.type)) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        alert.title.toLowerCase().includes(query) ||
        alert.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const unreadCount = alerts.filter(a => !a.is_read).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.is_resolved).length;

  const handleMarkAllRead = () => {
    alerts.filter(a => !a.is_read).forEach(alert => {
      markAsRead.mutate(alert.id);
    });
  };

  return (
    <PageWrapper
      title="Centro de Alertas"
      subtitle="Monitoramento inteligente de orçamento, metas e execução"
      actions={
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreateDialog(true)} size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Criar Alerta
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs gap-1.5"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Marcar todos como lidos
            </Button>
          )}
        </div>
      }
    >
      {/* Main Tabs: Alertas | Regras */}
      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList className="h-9">
          <TabsTrigger value="alerts" className="text-xs gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            Alertas
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-4 px-1 text-[10px]">{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rules" className="text-xs gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Regras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="mt-4">
          <AlertRulesPanel />
        </TabsContent>

        <TabsContent value="alerts" className="mt-4 space-y-6">
          {/* Stats Cards */}
          <BlurFade delay={0.05}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCardWithSparkline
                title="Total de Alertas"
                value={alerts.length}
                icon={<Bell className="h-4 w-4" />}
              />
              <StatCardWithSparkline
                title="Não Lidos"
                value={unreadCount}
                change={unreadCount > 0 ? "Requer atenção" : undefined}
                changeType={unreadCount > 0 ? "negative" : "neutral"}
                icon={<div className="h-2 w-2 rounded-full bg-app-gestao animate-pulse" />}
              />
              <StatCardWithSparkline
                title="Críticos"
                value={criticalCount}
                changeType={criticalCount > 0 ? "negative" : "neutral"}
                icon={<AlertCircle className="h-4 w-4" />}
              />
              <StatCardWithSparkline
                title="Resolvidos"
                value={alerts.filter(a => a.is_resolved).length}
                changeType="positive"
                icon={<Check className="h-4 w-4" />}
              />
            </div>
          </BlurFade>

          {/* Filters */}
          <BlurFade delay={0.1}>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar alertas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    Tipo
                    {selectedTypes.length > 0 && (
                      <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                        {selectedTypes.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {Object.entries(typeLabels).map(([type, label]) => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTypes([...selectedTypes, type]);
                        } else {
                          setSelectedTypes(selectedTypes.filter(t => t !== type));
                        }
                      }}
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </BlurFade>

          {/* Sub-Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-xs">Todos</TabsTrigger>
              <TabsTrigger value="unread" className="text-xs gap-1.5">
                Não Lidos
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="h-4 px-1 text-[10px]">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs">Pendentes</TabsTrigger>
              <TabsTrigger value="resolved" className="text-xs">Resolvidos</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="h-5 w-5 border-2 border-app-gestao/30 border-t-app-gestao rounded-full animate-spin" />
                </div>
              ) : filteredAlerts.length === 0 ? (
                <Empty
                  icon={<Check className="h-8 w-8" />}
                  title="Nenhum alerta encontrado"
                  description={searchQuery || selectedTypes.length > 0 
                    ? "Tente ajustar os filtros" 
                    : "Tudo está funcionando normalmente"}
                />
              ) : (
                <div className="space-y-2">
                  {filteredAlerts.map((alert, index) => {
                    const config = severityConfig[alert.severity];
                    const Icon = config.icon;
                    

                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={cn(
                          "rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm",
                          !alert.is_read && "ring-1 ring-app-gestao/30"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                            config.bgColor
                          )}>
                            <Icon className={cn("h-5 w-5", config.color)} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Badge variant="outline" className="text-[10px]">
                                {typeLabels[alert.type]}
                              </Badge>
                              <Badge variant="outline" className={cn("text-[10px]", config.color)}>
                                {config.label}
                              </Badge>
                              {alert.rule_key && (
                                <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                                  {alert.rule_key}
                                </Badge>
                              )}
                              {!alert.is_read && (
                                <span className="h-2 w-2 rounded-full bg-app-gestao" />
                              )}
                              {alert.is_resolved && (
                                <Badge className="h-4 px-1.5 text-[10px] bg-emerald-500/20 text-emerald-500">
                                  Resolvido
                                </Badge>
                              )}
                            </div>

                            <h3 className="font-medium text-sm">{alert.title}</h3>
                            {alert.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {alert.description}
                              </p>
                            )}

                            {/* Evidence & Impact */}
                            {(alert.evidence || alert.impact) && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {alert.evidence && (
                                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-[11px]">
                                    <Target className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">Evidência:</span>
                                    <span className="font-medium text-foreground">{alert.evidence}</span>
                                  </div>
                                )}
                                {alert.impact && (
                                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-[11px]">
                                    <Sparkles className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">Impacto:</span>
                                    <span className="font-medium text-foreground">{alert.impact}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* AI Suggestion */}
                            {alert.ai_suggestion && (
                              <div className="mt-2 p-2 rounded-lg bg-app-gestao/5 border border-app-gestao/20">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Sparkles className="h-3 w-3 text-app-gestao" />
                                  <span className="text-[10px] font-medium text-app-gestao">Sugestão da IA</span>
                                </div>
                                <p className="text-xs text-muted-foreground">{alert.ai_suggestion}</p>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-3">
                              <span className="text-[10px] text-muted-foreground">
                                {formatDistanceToNow(new Date(alert.created_at), { 
                                  addSuffix: true, 
                                  locale: ptBR 
                                })}
                              </span>

                              <div className="flex items-center gap-2">
                                {/* Action Link Button */}
                                {alert.action_link && !alert.is_resolved && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs gap-1"
                                    onClick={() => navigate(alert.action_link!)}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    O que fazer
                                  </Button>
                                )}
                                {!alert.is_read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => markAsRead.mutate(alert.id)}
                                  >
                                    Marcar como lido
                                  </Button>
                                )}
                                {!alert.is_resolved && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs gap-1 text-emerald-500 hover:text-emerald-600"
                                    onClick={() => resolveAlert.mutate(alert.id)}
                                  >
                                    <Check className="h-3 w-3" />
                                    Resolver
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      <CreateAlertDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </PageWrapper>
  );
}
