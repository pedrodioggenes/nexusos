import { useState, forwardRef, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, Lightbulb, Clock, TrendingUp, ChevronRight, RefreshCw, Trash2, Filter, FileDown, FileText, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAllInsights, useDismissInsight, useRestoreInsight, type AIInsight } from "@/hooks/useAIInsights";
import { INSIGHT_CONFIGS, type InsightType } from "@/lib/insight-config";
import { formatDistanceToNow, isToday, isThisWeek, isThisMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { exportInsightsToCSV, exportInsightsToPDF } from "@/lib/insight-export";
import { useToast } from "@/hooks/use-toast";

type PeriodFilter = 'all' | 'today' | 'week' | 'month';

interface InsightHistoryDialogProps {
  type?: InsightType;
  onSelectInsight?: (insight: AIInsight) => void;
  className?: string;
}

export const InsightHistoryDialog = forwardRef<HTMLButtonElement, InsightHistoryDialogProps>(
  function InsightHistoryDialog({ type: initialType, onSelectInsight, className }, ref) {
    const [open, setOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
    const [typeFilter, setTypeFilter] = useState<string>(initialType || 'all');
    const { toast } = useToast();
    
    // Fetch ALL insights including dismissed ones for history
    const { data: allInsights, isLoading, refetch } = useAllInsights();
    const dismissInsight = useDismissInsight();
    const restoreInsight = useRestoreInsight();

    // Filter insights based on selected filters
    const filteredInsights = useMemo(() => {
      if (!allInsights) return [];
      
      return allInsights.filter(insight => {
        // Type filter
        if (typeFilter !== 'all' && insight.insight_type !== typeFilter) {
          return false;
        }
        
        // Period filter
        const createdAt = new Date(insight.created_at);
        switch (periodFilter) {
          case 'today':
            return isToday(createdAt);
          case 'week':
            return isThisWeek(createdAt, { locale: ptBR });
          case 'month':
            return isThisMonth(createdAt);
          default:
            return true;
        }
      });
    }, [allInsights, periodFilter, typeFilter]);

    const handleSelect = (insight: AIInsight) => {
      setSelectedId(insight.id);
      onSelectInsight?.(insight);
      setOpen(false);
    };

    const handleDismiss = (e: React.MouseEvent, insightId: string) => {
      e.stopPropagation();
      dismissInsight.mutate(insightId, {
        onSuccess: () => {
          toast({
            title: "Insight arquivado",
            description: "O insight foi movido para arquivados",
          });
        },
      });
    };

    const handleRestore = (e: React.MouseEvent, insightId: string) => {
      e.stopPropagation();
      restoreInsight.mutate(insightId, {
        onSuccess: () => {
          toast({
            title: "Insight restaurado",
            description: "O insight foi restaurado para ativos",
          });
        },
      });
    };

    const handleExportCSV = () => {
      if (filteredInsights.length === 0) return;
      exportInsightsToCSV(filteredInsights, 'insights-historico');
      toast({
        title: "Exportação concluída",
        description: `${filteredInsights.length} insight(s) exportado(s) para CSV`,
      });
    };

    const handleExportPDF = async () => {
      if (filteredInsights.length === 0) return;
      await exportInsightsToPDF(filteredInsights, { period: periodFilter, type: typeFilter });
      toast({
        title: "Relatório gerado",
        description: `PDF com ${filteredInsights.length} insight(s) baixado com sucesso`,
      });
    };

    const groupedInsights = filteredInsights.reduce((acc, insight) => {
      const date = new Date(insight.created_at).toLocaleDateString('pt-BR');
      if (!acc[date]) acc[date] = [];
      acc[date].push(insight);
      return acc;
    }, {} as Record<string, AIInsight[]>);

    const insightTypes = Object.entries(INSIGHT_CONFIGS).map(([key, config]) => ({
      value: key,
      label: config.label,
    }));

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button ref={ref} variant="ghost" size="sm" className={cn("gap-2", className)}>
            <History className="h-4 w-4" />
            Histórico
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-app-gestao" />
              Histórico de Insights
            </DialogTitle>
            <DialogDescription>
              Visualize e reutilize insights gerados anteriormente pela NexusIA.
            </DialogDescription>
          </DialogHeader>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 pb-2 border-b">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Filtros:</span>
            </div>
            
            <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
              <SelectTrigger className="h-8 w-[120px] text-xs">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mês</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {insightTypes.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex-1" />
            
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportCSV}
                disabled={filteredInsights.length === 0}
                className="h-8 gap-1.5 text-xs"
              >
                <FileDown className="h-3 w-3" />
                CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportPDF}
                disabled={filteredInsights.length === 0}
                className="h-8 gap-1.5 text-xs"
              >
                <FileText className="h-3 w-3" />
                PDF
              </Button>
              <Button variant="ghost" size="sm" onClick={() => refetch()} className="h-8 gap-1.5 text-xs">
                <RefreshCw className="h-3 w-3" />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {filteredInsights.length} insight{filteredInsights.length !== 1 ? 's' : ''} encontrado{filteredInsights.length !== 1 ? 's' : ''}
              {(periodFilter !== 'all' || typeFilter !== 'all') && (
                <span className="ml-1">
                  (filtrado de {allInsights?.length || 0})
                </span>
              )}
            </p>
            {(periodFilter !== 'all' || typeFilter !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs text-muted-foreground"
                onClick={() => {
                  setPeriodFilter('all');
                  setTypeFilter('all');
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>

          <ScrollArea className="h-[380px] pr-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                ))}
              </div>
            ) : Object.keys(groupedInsights).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <History className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-sm text-muted-foreground">
                  {periodFilter !== 'all' || typeFilter !== 'all' 
                    ? 'Nenhum insight corresponde aos filtros'
                    : 'Nenhum insight encontrado'
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {periodFilter !== 'all' || typeFilter !== 'all'
                    ? 'Tente ajustar os filtros ou limpar a seleção'
                    : 'Gere novos insights no dashboard para vê-los aqui'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedInsights).map(([date, dateInsights]) => (
                  <div key={date}>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">{date}</span>
                      <Badge variant="secondary" className="text-[10px] h-4">
                        {dateInsights.length}
                      </Badge>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    <div className="space-y-2">
                      {dateInsights.map((insight) => {
                        const config = INSIGHT_CONFIGS[insight.insight_type];
                        const isSelected = selectedId === insight.id;

                        return (
                          <div
                            key={insight.id}
                            onClick={() => handleSelect(insight)}
                            className={cn(
                              "p-4 border rounded-lg cursor-pointer transition-all",
                              "hover:border-app-gestao/50 hover:bg-muted/50",
                              isSelected && "border-app-gestao bg-app-gestao/5"
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="text-[10px]">
                                    {config?.label || insight.insight_type}
                                  </Badge>
                                  {insight.is_dismissed && (
                                    <Badge variant="secondary" className="text-[10px] bg-muted">
                                      Arquivado
                                    </Badge>
                                  )}
                                  {insight.confidence_score && (
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                      <TrendingUp className="h-3 w-3" />
                                      {insight.confidence_score}%
                                    </span>
                                  )}
                                </div>

                                <p className="text-sm text-foreground/90 line-clamp-2">
                                  {insight.insight_text}
                                </p>

                                <p className="text-[10px] text-muted-foreground mt-2">
                                  {formatDistanceToNow(new Date(insight.created_at), {
                                    addSuffix: true,
                                    locale: ptBR,
                                  })}
                                </p>
                              </div>

                              <div className="flex items-center gap-1">
                                {insight.is_dismissed ? (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-app-gestao"
                                    onClick={(e) => handleRestore(e, insight.id)}
                                    title="Restaurar insight"
                                  >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={(e) => handleDismiss(e, insight.id)}
                                    title="Arquivar insight"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }
);
