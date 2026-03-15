import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Store, Clock, CheckCircle2, AlertCircle, 
  Plus, Eye, Camera, Calendar 
} from "lucide-react";
import { useGerenteDemands, useGerenteExecutions } from "@/hooks/useGerenteDemands";
import { executionCategoryConfig } from "@/hooks/useMarketingExecutions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const priorityConfig: Record<string, { label: string; class: string }> = {
  critical: { label: "Crítica", class: "bg-destructive text-destructive-foreground" },
  high: { label: "Alta", class: "bg-orange-500/20 text-orange-700 dark:text-orange-400" },
  medium: { label: "Média", class: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" },
  low: { label: "Baixa", class: "bg-muted text-muted-foreground" },
};

export default function MinhaLoja() {
  const navigate = useNavigate();
  const { data: demands = [], isLoading } = useGerenteDemands();
  const demandIds = useMemo(() => demands.map((d) => d.id), [demands]);
  const { data: executions = [] } = useGerenteExecutions(demandIds);

  // Group executions by demand
  const executionsByDemand = useMemo(() => {
    const map: Record<string, typeof executions> = {};
    executions.forEach((e) => {
      const key = e.entity_id;
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [executions]);

  // Stats
  const stats = useMemo(() => {
    const pending = demands.filter((d) => {
      const execs = executionsByDemand[d.id] || [];
      return execs.length === 0;
    }).length;

    const inProgress = demands.filter((d) => {
      const execs = executionsByDemand[d.id] || [];
      const planned = d.channels.length || 1;
      const uniqueDone = new Set(execs.map((e) => e.channel)).size;
      return execs.length > 0 && uniqueDone < planned;
    }).length;

    const completed = demands.filter((d) => {
      const execs = executionsByDemand[d.id] || [];
      const planned = d.channels.length || 1;
      const uniqueDone = new Set(execs.map((e) => e.channel)).size;
      return execs.length > 0 && uniqueDone >= planned;
    }).length;

    return { pending, inProgress, completed };
  }, [demands, executionsByDemand]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <PageHeader title="Minha Loja" description="Carregando..." />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <PageHeader
        title="🏬 Minha Loja"
        description="Demandas para executar na sua unidade"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <div>
              <p className="text-[11px] text-muted-foreground">Pendentes</p>
              <p className="text-lg font-bold">{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="text-[11px] text-muted-foreground">Em andamento</p>
              <p className="text-lg font-bold">{stats.inProgress}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <div>
              <p className="text-[11px] text-muted-foreground">Concluídas</p>
              <p className="text-lg font-bold">{stats.completed}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Demands list */}
      {demands.length === 0 ? (
        <Card className="p-8 text-center">
          <Store className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            Nenhuma demanda atribuída a você no momento.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {demands.map((demand) => {
            const myExecs = executionsByDemand[demand.id] || [];
            const planned = demand.channels.length || 1;
            const uniqueDone = new Set(myExecs.map((e) => e.channel)).size;
            const progressPct = Math.min(Math.round((uniqueDone / planned) * 100), 100);
            const prio = priorityConfig[demand.priority] || priorityConfig.medium;

            return (
              <Card key={demand.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold leading-tight">
                      {demand.title}
                    </CardTitle>
                    <Badge className={prio.class} variant="secondary">
                      {prio.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                    {demand.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(demand.due_date), "dd/MM/yy", { locale: ptBR })}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Store className="h-3 w-3" />
                      {demand.type}
                    </span>
                    <Badge variant="outline" className="text-[10px] h-4">
                      {demand.status === "approved" ? "Aprovada" : "Concluída"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3">
                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground">
                        Progresso: {uniqueDone}/{planned} categorias
                      </span>
                      <span className="font-medium">{progressPct}%</span>
                    </div>
                    <Progress value={progressPct} className="h-1.5" />
                  </div>

                  {/* My executions */}
                  {myExecs.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                        Minhas Execuções
                      </p>
                      {myExecs.slice(0, 3).map((exec) => {
                        const cat = executionCategoryConfig[exec.channel];
                        const hasEvidence = exec.evidence_urls.length > 0;
                        return (
                          <div
                            key={exec.id}
                            className="flex items-center gap-2 text-[11px] py-0.5"
                          >
                            <span>{cat?.icon || "📋"}</span>
                            <span className="flex-1 truncate">
                              {cat?.label || exec.channel}
                            </span>
                            <span className="text-muted-foreground">
                              {format(new Date(exec.execution_date), "dd/MM", { locale: ptBR })}
                            </span>
                            {hasEvidence && (
                              <span className="flex items-center gap-0.5 text-primary">
                                <Camera className="h-3 w-3" />
                                {exec.evidence_urls.length}
                              </span>
                            )}
                          </div>
                        );
                      })}
                      {myExecs.length > 3 && (
                        <p className="text-[10px] text-muted-foreground">
                          +{myExecs.length - 3} mais...
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      className="gap-1.5 text-xs flex-1"
                      onClick={() =>
                        navigate(
                          `/app/marketing/execucoes/${demand.id}/nova`
                        )
                      }
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Registrar Execução
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                      onClick={() =>
                        navigate(
                          `/app/marketing/execucoes/${demand.id}`
                        )
                      }
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
