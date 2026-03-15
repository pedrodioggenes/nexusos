import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Store, AlertTriangle, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { useRetailActions, RETAIL_ACTION_STATUSES } from "@/hooks/useRetailActions";
import { useExecutionRuns, EXECUTION_STATUSES } from "@/hooks/useRetailExecution";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ExecutionHub() {
  const navigate = useNavigate();
  const { actions } = useRetailActions();
  const { runs } = useExecutionRuns();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Group runs by action
  const actionSummaries = useMemo(() => {
    const activeActions = actions.filter(a =>
      ['planned', 'in_production', 'ready', 'running'].includes(a.status)
    );

    return activeActions
      .filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()))
      .map(action => {
        const actionRuns = runs.filter(r => r.retail_action_id === action.id);
        const completed = actionRuns.filter(r => r.status === 'completed').length;
        const blocked = actionRuns.filter(r => r.status === 'blocked').length;
        const inProgress = actionRuns.filter(r => r.status === 'in_progress').length;
        const avgScore = actionRuns.length > 0
          ? Math.round(actionRuns.reduce((s, r) => s + (r.compliance_score || 0), 0) / actionRuns.length)
          : 0;
        const totalIssues = actionRuns.reduce((s, r) => s + (r.issues_count || 0), 0);

        return { action, runs: actionRuns, completed, blocked, inProgress, total: actionRuns.length, avgScore, totalIssues };
      })
      .filter(s => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'at_risk') return s.blocked > 0 || s.totalIssues > 0;
        return true;
      });
  }, [actions, runs, search, statusFilter]);

  const totalRuns = runs.length;
  const totalCompleted = runs.filter(r => r.status === 'completed').length;
  const totalBlocked = runs.filter(r => r.status === 'blocked').length;
  const totalIssues = runs.reduce((s, r) => s + (r.issues_count || 0), 0);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Execução em Loja"
        description="Acompanhe a execução de ações comerciais por loja"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MiniCard icon={<Store className="h-4 w-4" />} label="Total Execuções" value={totalRuns} />
        <MiniCard icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} label="Concluídas" value={totalCompleted} />
        <MiniCard icon={<AlertTriangle className="h-4 w-4 text-destructive" />} label="Bloqueadas" value={totalBlocked} />
        <MiniCard icon={<Clock className="h-4 w-4 text-amber-500" />} label="Issues Abertas" value={totalIssues} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Buscar ação..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <Filter className="h-3 w-3 mr-1" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="at_risk">Em Risco</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Action list */}
      {actionSummaries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Nenhuma ação comercial ativa com execuções
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {actionSummaries.map(({ action, completed, blocked, inProgress, total, avgScore, totalIssues }) => {
            const si = RETAIL_ACTION_STATUSES.find(s => s.value === action.status);
            return (
              <Card
                key={action.id}
                className="cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => navigate(`/app/marketing/execucao/${action.id}`)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">{action.title}</span>
                        {si && <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", si.color)}>{si.label}</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        {action.period_start && (
                          <span>{format(new Date(action.period_start), "dd MMM", { locale: ptBR })}
                            {action.period_end && ` – ${format(new Date(action.period_end), "dd MMM", { locale: ptBR })}`}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Store className="h-3 w-3" /> {total} lojas
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-600" /> {completed}
                        </span>
                        {blocked > 0 && (
                          <span className="flex items-center gap-1 text-destructive">
                            <AlertTriangle className="h-3 w-3" /> {blocked}
                          </span>
                        )}
                        {totalIssues > 0 && (
                          <span className="text-amber-500">{totalIssues} issues</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {total > 0 && (
                        <div className="text-right">
                          <div className="text-lg font-bold">{avgScore}%</div>
                          <div className="text-[10px] text-muted-foreground">compliance</div>
                        </div>
                      )}
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
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

function MiniCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-2">
        {icon}
        <div>
          <div className="text-lg font-bold">{value}</div>
          <div className="text-[10px] text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
