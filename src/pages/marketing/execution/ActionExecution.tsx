import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, Plus, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { useRetailActions } from "@/hooks/useRetailActions";
import { useExecutionRuns, EXECUTION_STATUSES } from "@/hooks/useRetailExecution";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function ActionExecution() {
  const { retailActionId } = useParams<{ retailActionId: string }>();
  const navigate = useNavigate();
  const { tenant } = useAuth();
  const { actions } = useRetailActions();
  const { runs, createRun } = useExecutionRuns(retailActionId);
  const [selectedStore, setSelectedStore] = useState("");

  const action = actions.find(a => a.id === retailActionId);

  // Fetch units/stores for this tenant
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    if (!tenant?.id) return;
    (async () => {
      const table: any = supabase.from('units');
      const result = await table.select('id, name').eq('tenant_id', tenant.id).order('name');
      if (!result.error && result.data) setStores(result.data);
    })();
  }, [tenant?.id]);

  const storesWithRuns = useMemo(() => {
    return stores.map(store => {
      const run = runs.find(r => r.store_id === store.id);
      return { ...store, run };
    });
  }, [stores, runs]);

  const availableStores = stores.filter(s => !runs.some(r => r.store_id === s.id));

  const sortedStores = useMemo(() => {
    return [...storesWithRuns].sort((a, b) => {
      if (a.run && !b.run) return -1;
      if (!a.run && b.run) return 1;
      if (a.run && b.run) return (a.run.compliance_score || 0) - (b.run.compliance_score || 0);
      return a.name.localeCompare(b.name);
    });
  }, [storesWithRuns]);

  const handleCreateRun = async () => {
    if (!selectedStore || !retailActionId) return;
    await createRun.mutateAsync({ retailActionId, storeId: selectedStore });
    setSelectedStore("");
  };

  if (!action) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Ação não encontrada</div>;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Execução: ${action.title}`}
        description="Visão por loja — compliance e checklist"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/app/marketing/execucao')}>
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Voltar
          </Button>
        }
      />

      {/* Add store */}
      <Card>
        <CardContent className="p-3 flex items-center gap-2">
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="h-8 flex-1 text-xs">
              <SelectValue placeholder="Selecionar loja para iniciar execução..." />
            </SelectTrigger>
            <SelectContent>
              {availableStores.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
              {availableStores.length === 0 && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">Todas as lojas já possuem execução</div>
              )}
            </SelectContent>
          </Select>
          <Button size="sm" className="h-8" onClick={handleCreateRun} disabled={!selectedStore || createRun.isPending}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Iniciar
          </Button>
        </CardContent>
      </Card>

      {/* Store matrix */}
      {sortedStores.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Nenhuma loja cadastrada</CardContent></Card>
      ) : (
        <div className="grid gap-2">
          {sortedStores.map(store => {
            const run = store.run;
            const si = run ? EXECUTION_STATUSES.find(s => s.value === run.status) : null;

            return (
              <Card
                key={store.id}
                className={cn(
                  "transition-colors",
                  run ? "cursor-pointer hover:border-primary/30" : "opacity-60"
                )}
                onClick={() => run && navigate(`/app/marketing/execucao/${retailActionId}/loja/${store.id}`)}
              >
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Store className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate">{store.name}</span>
                    {si && <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", si.color)}>{si.label}</Badge>}
                  </div>
                  {run ? (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={cn("text-lg font-bold", run.compliance_score >= 80 ? "text-green-600" : run.compliance_score >= 50 ? "text-amber-500" : "text-destructive")}>
                          {run.compliance_score}%
                        </div>
                      </div>
                      {run.issues_count > 0 && (
                        <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive">
                          <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> {run.issues_count}
                        </Badge>
                      )}
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">Sem execução</span>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
