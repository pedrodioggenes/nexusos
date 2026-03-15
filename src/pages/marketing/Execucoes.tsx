import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { PageWrapper } from "@/components/marketing/PageWrapper";
import { BlurFade } from "@/components/ui/blur-fade";
import { StatCardWithSparkline } from "@/components/marketing/StatCardWithSparkline";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  useExecutableDemands,
  demandPriorityConfig,
  demandTypeConfig,
  type MarketingDemand,
} from "@/hooks/useMarketingDemands";
import { useMarketingExecutions, executionCategoryConfig } from "@/hooks/useMarketingExecutions";

type ExecutionStatus = "all" | "pending" | "partial" | "complete";

function getDemandExecutionStatus(
  demand: MarketingDemand,
  executionsByDemand: Map<string, string[]>
): ExecutionStatus {
  const plannedChannels = demand.channels || [];
  const executedChannels = executionsByDemand.get(demand.id) || [];

  if (executedChannels.length === 0) return "pending";
  if (plannedChannels.length === 0) return executedChannels.length > 0 ? "complete" : "pending";
  const allCovered = plannedChannels.every((ch) => executedChannels.includes(ch));
  return allCovered ? "complete" : "partial";
}

export default function Execucoes() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExecutionStatus>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: demands = [], isLoading: demandsLoading } = useExecutableDemands();
  const { data: executions = [], isLoading: execLoading } = useMarketingExecutions({
    entity_type: "demand",
  });

  const isLoading = demandsLoading || execLoading;

  // Build a map: demandId -> executed channel names
  const executionsByDemand = useMemo(() => {
    const map = new Map<string, string[]>();
    executions.forEach((ex) => {
      const existing = map.get(ex.entity_id) || [];
      if (!existing.includes(ex.channel)) existing.push(ex.channel);
      map.set(ex.entity_id, existing);
    });
    return map;
  }, [executions]);

  // Execution count per demand
  const executionCountByDemand = useMemo(() => {
    const map = new Map<string, number>();
    executions.forEach((ex) => {
      map.set(ex.entity_id, (map.get(ex.entity_id) || 0) + 1);
    });
    return map;
  }, [executions]);

  // Filter demands
  const filtered = useMemo(() => {
    let result = demands;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((d) => d.title.toLowerCase().includes(q));
    }

    if (typeFilter !== "all") {
      result = result.filter((d) => d.type === typeFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (d) => getDemandExecutionStatus(d, executionsByDemand) === statusFilter
      );
    }

    return result;
  }, [demands, searchQuery, typeFilter, statusFilter, executionsByDemand]);

  // Stats
  const stats = useMemo(() => {
    const total = demands.length;
    const pending = demands.filter(
      (d) => getDemandExecutionStatus(d, executionsByDemand) === "pending"
    ).length;
    const complete = demands.filter(
      (d) => getDemandExecutionStatus(d, executionsByDemand) === "complete"
    ).length;
    const partial = total - pending - complete;
    const completionRate = total > 0 ? Math.round((complete / total) * 100) : 0;
    return { total, pending, complete, partial, completionRate };
  }, [demands, executionsByDemand]);

  return (
    <PageWrapper
      title="Execuções"
      subtitle="Gerencie a execução de demandas aprovadas nos canais planejados"
      icon={<FileCheck className="h-6 w-6 text-app-gestao" />}
    >
      {/* Stats */}
      <BlurFade delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCardWithSparkline
            title="Para Executar"
            value={stats.total}
            icon={<FileCheck className="h-4 w-4" />}
            isLoading={isLoading}
          />
          <StatCardWithSparkline
            title="Pendentes"
            value={stats.pending}
            changeType={stats.pending > 0 ? "negative" : "neutral"}
            icon={<AlertCircle className="h-4 w-4" />}
            isLoading={isLoading}
          />
          <StatCardWithSparkline
            title="Parciais"
            value={stats.partial}
            changeType="neutral"
            icon={<Clock className="h-4 w-4" />}
            isLoading={isLoading}
          />
          <StatCardWithSparkline
            title="Completas"
            value={`${stats.completionRate}%`}
            changeType="positive"
            icon={<CheckCircle2 className="h-4 w-4" />}
            isLoading={isLoading}
          />
        </div>
      </BlurFade>

      {/* Filters */}
      <BlurFade delay={0.1}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar demanda por título..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ExecutionStatus)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="partial">Parcial</SelectItem>
              <SelectItem value="complete">Completas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Tipos</SelectItem>
              {Object.entries(demandTypeConfig).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.icon} {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </BlurFade>

      {/* Demand List */}
      <BlurFade delay={0.15}>
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="h-5 w-5 border-2 border-app-gestao/30 border-t-app-gestao rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Empty
            icon={<FileCheck className="h-8 w-8" />}
            title="Nenhuma demanda para executar"
            description={
              searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "Ajuste os filtros"
                : "Demandas aprovadas aparecerão aqui automaticamente"
            }
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((demand) => {
              const status = getDemandExecutionStatus(demand, executionsByDemand);
              const plannedChannels = demand.channels || [];
              const executedChannels = executionsByDemand.get(demand.id) || [];
              const execCount = executionCountByDemand.get(demand.id) || 0;
              const progress =
                plannedChannels.length > 0
                  ? Math.round(
                      (plannedChannels.filter((ch) => executedChannels.includes(ch)).length /
                        plannedChannels.length) *
                        100
                    )
                  : execCount > 0
                  ? 100
                  : 0;
              const priorityCfg = demandPriorityConfig[demand.priority];
              const typeCfg = demandTypeConfig[demand.type];

              return (
                <button
                  key={demand.id}
                  onClick={() => navigate(`/app/marketing/execucoes/${demand.id}`)}
                  className="w-full text-left rounded-xl border border-border bg-card p-4 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground truncate">
                          {demand.title}
                        </span>
                        <Badge variant="secondary" className="text-[10px] h-5">
                          {typeCfg.icon} {typeCfg.label}
                        </Badge>
                        <Badge
                          className={cn(
                            "text-[10px] h-5 border-0",
                            priorityCfg.bgColor,
                            priorityCfg.color
                          )}
                        >
                          {priorityCfg.label}
                        </Badge>
                      </div>

                      {/* Channel progress */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[200px]">
                          <Progress value={progress} className="h-1.5" />
                        </div>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {execCount} execuç{execCount === 1 ? "ão" : "ões"}
                      {plannedChannels.length > 0 &&
                            ` · ${executedChannels.length}/${plannedChannels.length} categorias`}
                        </span>
                      </div>

                      {/* Channel badges */}
                      {plannedChannels.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {plannedChannels.map((ch) => {
                            const executed = executedChannels.includes(ch);
                            const cfg = executionCategoryConfig[ch];
                            return (
                              <Badge
                                key={ch}
                                variant="outline"
                                className={cn(
                                  "text-[10px] h-5",
                                  executed
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                    : "text-muted-foreground"
                                )}
                              >
                                {executed && <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />}
                                {cfg?.icon || "📋"} {cfg?.label || ch}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Right: Status + arrow */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] h-5 border-0",
                          status === "complete" &&
                            "bg-emerald-500/10 text-emerald-600",
                          status === "partial" &&
                            "bg-yellow-500/10 text-yellow-600",
                          status === "pending" &&
                            "bg-muted text-muted-foreground"
                        )}
                      >
                        {status === "complete" && "Completa"}
                        {status === "partial" && "Parcial"}
                        {status === "pending" && "Pendente"}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </BlurFade>
    </PageWrapper>
  );
}
