import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Waves, Play, CheckCircle2, Clock } from "lucide-react";
import { usePickingWaves, useUpdateWaveStatus } from "@/hooks/cd/useSeparationData";
import { format } from "date-fns";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Rascunho", variant: "secondary" },
  released: { label: "Liberada", variant: "outline" },
  in_progress: { label: "Em Andamento", variant: "default" },
  completed: { label: "Concluída", variant: "default" },
};

export default function WavesPage() {
  const { data: waves = [], isLoading } = usePickingWaves();
  const updateWave = useUpdateWaveStatus();
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return waves;
    return waves.filter((w: any) => w.status === statusFilter);
  }, [waves, statusFilter]);

  const stats = useMemo(() => ({
    draft: waves.filter((w: any) => w.status === "draft").length,
    released: waves.filter((w: any) => w.status === "released").length,
    in_progress: waves.filter((w: any) => w.status === "in_progress").length,
    completed: waves.filter((w: any) => w.status === "completed").length,
  }), [waves]);

  const handleAdvance = (id: string, current: string) => {
    const flow: Record<string, string> = { draft: "released", released: "in_progress", in_progress: "completed" };
    const next = flow[current];
    if (!next) return;
    const extra: Record<string, any> = {};
    if (next === "in_progress") extra.started_at = new Date().toISOString();
    if (next === "completed") extra.completed_at = new Date().toISOString();
    updateWave.mutate({ id, status: next, extra });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Waves de Picking</h1>
        <p className="text-muted-foreground text-sm">Agrupamento de ordens para separação em onda</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Rascunho", value: stats.draft, icon: Clock, color: "text-muted-foreground" },
          { label: "Liberadas", value: stats.released, icon: Play, color: "text-blue-500" },
          { label: "Em Andamento", value: stats.in_progress, icon: Waves, color: "text-yellow-500" },
          { label: "Concluídas", value: stats.completed, icon: CheckCircle2, color: "text-green-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Waves ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="text-muted-foreground text-sm p-6">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm p-6">Nenhuma wave encontrada</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Wave</TableHead>
                  <TableHead>SKUs</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Ordens</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Conclusão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((w: any) => {
                  const cfg = statusConfig[w.status] || statusConfig.draft;
                  const canAdvance = ["draft", "released", "in_progress"].includes(w.status);
                  const orderIds = Array.isArray(w.transfer_order_ids) ? w.transfer_order_ids : [];
                  return (
                    <TableRow key={w.id}>
                      <TableCell className="font-mono text-xs">{w.wave_number}</TableCell>
                      <TableCell>{w.total_skus ?? "—"}</TableCell>
                      <TableCell>{w.total_items ?? "—"}</TableCell>
                      <TableCell>{orderIds.length}</TableCell>
                      <TableCell className="text-xs">{w.started_at ? format(new Date(w.started_at), "dd/MM HH:mm") : "—"}</TableCell>
                      <TableCell className="text-xs">{w.completed_at ? format(new Date(w.completed_at), "dd/MM HH:mm") : "—"}</TableCell>
                      <TableCell><Badge variant={cfg.variant}>{cfg.label}</Badge></TableCell>
                      <TableCell>
                        {canAdvance && (
                          <Button size="sm" variant="outline" onClick={() => handleAdvance(w.id, w.status)} disabled={updateWave.isPending}>
                            {w.status === "draft" ? "Liberar" : w.status === "released" ? "Iniciar" : "Concluir"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
