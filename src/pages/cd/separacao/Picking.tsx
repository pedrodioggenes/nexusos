import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Hand, Clock, Play, CheckCircle2, Target } from "lucide-react";
import { usePickingTasks, useUpdatePickingTask } from "@/hooks/cd/useSeparationData";
import { format } from "date-fns";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  in_progress: { label: "Em Progresso", variant: "outline" },
  completed: { label: "Concluída", variant: "default" },
};

export default function PickingPage() {
  const { data: tasks = [], isLoading } = usePickingTasks();
  const updateTask = useUpdatePickingTask();
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return tasks;
    return tasks.filter((t: any) => t.status === statusFilter);
  }, [tasks, statusFilter]);

  const stats = useMemo(() => {
    const pending = tasks.filter((t: any) => t.status === "pending").length;
    const inProgress = tasks.filter((t: any) => t.status === "in_progress").length;
    const completed = tasks.filter((t: any) => t.status === "completed").length;
    const avgAccuracy = tasks.filter((t: any) => t.accuracy_rate != null).reduce((s: number, t: any) => s + (t.accuracy_rate || 0), 0) / (tasks.filter((t: any) => t.accuracy_rate != null).length || 1);
    return { pending, inProgress, completed, avgAccuracy: avgAccuracy.toFixed(1) };
  }, [tasks]);

  const handleAdvance = (id: string, current: string) => {
    const flow: Record<string, string> = { pending: "in_progress", in_progress: "completed" };
    const next = flow[current];
    if (!next) return;
    updateTask.mutate({ id, status: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Picking</h1>
        <p className="text-muted-foreground text-sm">Tasks de separação serpentina</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pendentes", value: stats.pending, icon: Clock, color: "text-yellow-500" },
          { label: "Em Progresso", value: stats.inProgress, icon: Play, color: "text-blue-500" },
          { label: "Concluídas", value: stats.completed, icon: CheckCircle2, color: "text-green-500" },
          { label: "Acurácia Média", value: `${stats.avgAccuracy}%`, icon: Target, color: "text-primary" },
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
          <CardTitle className="text-base">Tasks ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="text-muted-foreground text-sm p-6">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm p-6">Nenhuma task encontrada</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seq.</TableHead>
                  <TableHead>Itens Total</TableHead>
                  <TableHead>Itens Separados</TableHead>
                  <TableHead>Acurácia</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Conclusão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t: any) => {
                  const cfg = statusConfig[t.status] || statusConfig.pending;
                  const canAdvance = ["pending", "in_progress"].includes(t.status);
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono">{t.sequence_order ?? "—"}</TableCell>
                      <TableCell>{t.items_total ?? "—"}</TableCell>
                      <TableCell>{t.items_picked ?? 0}</TableCell>
                      <TableCell>{t.accuracy_rate != null ? `${t.accuracy_rate}%` : "—"}</TableCell>
                      <TableCell className="text-xs">{t.started_at ? format(new Date(t.started_at), "dd/MM HH:mm") : "—"}</TableCell>
                      <TableCell className="text-xs">{t.completed_at ? format(new Date(t.completed_at), "dd/MM HH:mm") : "—"}</TableCell>
                      <TableCell><Badge variant={cfg.variant}>{cfg.label}</Badge></TableCell>
                      <TableCell>
                        {canAdvance && (
                          <Button size="sm" variant="outline" onClick={() => handleAdvance(t.id, t.status)} disabled={updateTask.isPending}>
                            {t.status === "pending" ? "Iniciar" : "Concluir"}
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
