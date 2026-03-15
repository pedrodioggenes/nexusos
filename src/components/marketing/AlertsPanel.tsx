import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  Info,
  Check,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  useMarketingAlerts, 
  useMarkAlertAsRead, 
  useResolveAlert,
  type MarketingAlert 
} from "@/hooks/useMarketingAlerts";
import { GlassBentoCard, GlassBentoContent, GlassBentoHeader, GlassBentoTitle } from "@/components/ui/glass-bento";

interface AlertsPanelProps {
  className?: string;
  limit?: number;
  showHeader?: boolean;
  onViewAll?: () => void;
}

const severityConfig = {
  critical: {
    icon: AlertCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30",
    label: "Crítico",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/30",
    label: "Atenção",
  },
  info: {
    icon: Info,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
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
};

function AlertItem({ 
  alert, 
  onResolve 
}: { 
  alert: MarketingAlert; 
  onResolve: (id: string) => void;
}) {
  const config = severityConfig[alert.severity];
  const Icon = config.icon;
  const markAsRead = useMarkAlertAsRead();

  const handleClick = () => {
    if (!alert.is_read) {
      markAsRead.mutate(alert.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "p-3 rounded-xl border transition-all cursor-pointer",
        "bg-muted/30 dark:bg-muted/20 backdrop-blur-sm",
        config.borderColor,
        !alert.is_read && "ring-1 ring-offset-1 ring-offset-background",
        !alert.is_read && alert.severity === 'critical' && "ring-destructive/50",
        !alert.is_read && alert.severity === 'warning' && "ring-warning/50",
        !alert.is_read && alert.severity === 'info' && "ring-blue-500/50",
        "hover:bg-muted/50 dark:hover:bg-muted/30"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
          config.bgColor,
          "backdrop-blur-sm"
        )}>
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-background/50">
              {typeLabels[alert.type] || alert.type}
            </Badge>
            {!alert.is_read && (
              <span className="h-1.5 w-1.5 rounded-full bg-app-gestao animate-pulse" />
            )}
          </div>

          <h4 className="font-medium text-sm line-clamp-1 text-foreground/90">{alert.title}</h4>
          
          {alert.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
              {alert.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(alert.created_at), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>

            {!alert.is_resolved && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs gap-1 text-muted-foreground hover:text-success"
                onClick={(e) => {
                  e.stopPropagation();
                  onResolve(alert.id);
                }}
              >
                <Check className="h-3 w-3" />
                Resolver
              </Button>
            )}
          </div>

          {/* AI Suggestion */}
          {alert.ai_suggestion && (
            <div className="mt-2 p-2 rounded-lg bg-app-gestao/5 border border-app-gestao/20 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="h-3 w-3 text-app-gestao" />
                <span className="text-[10px] font-medium text-app-gestao">Sugestão da IA</span>
              </div>
              <p className="text-xs text-muted-foreground">{alert.ai_suggestion}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function AlertsPanel({
  className,
  limit = 5,
  showHeader = true,
  onViewAll,
}: AlertsPanelProps) {
  const { data: alerts = [], isLoading } = useMarketingAlerts({ unreadOnly: false });
  const resolveAlert = useResolveAlert();

  const displayAlerts = alerts.slice(0, limit);
  const unreadCount = alerts.filter(a => !a.is_read).length;

  if (isLoading) {
    return (
      <GlassBentoCard className={className}>
        <GlassBentoContent>
          <div className="flex items-center justify-center h-32">
            <div className="h-5 w-5 border-2 border-app-gestao/30 border-t-app-gestao rounded-full animate-spin" />
          </div>
        </GlassBentoContent>
      </GlassBentoCard>
    );
  }

  return (
    <GlassBentoCard className={cn("h-full", className)} glowColor="rgba(239, 68, 68, 0.2)">
      <GlassBentoContent>
        {showHeader && (
          <GlassBentoHeader
            icon={<Bell className="h-4 w-4 text-muted-foreground" />}
            action={
              onViewAll && alerts.length > limit ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground h-7"
                  onClick={onViewAll}
                >
                  Ver todos
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              ) : null
            }
          >
            <div className="flex items-center gap-2">
              <GlassBentoTitle>Alertas</GlassBentoTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                  {unreadCount}
                </Badge>
              )}
            </div>
          </GlassBentoHeader>
        )}

        {displayAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-3 backdrop-blur-sm">
              <Check className="h-6 w-6 text-success" />
            </div>
            <p className="text-sm font-medium text-foreground/90">Tudo certo!</p>
            <p className="text-xs text-muted-foreground">
              Nenhum alerta pendente no momento
            </p>
          </div>
        ) : (
          <ScrollArea className="h-auto max-h-[400px]">
            <div className="space-y-2">
              {displayAlerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onResolve={(id) => resolveAlert.mutate(id)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </GlassBentoContent>
    </GlassBentoCard>
  );
}
