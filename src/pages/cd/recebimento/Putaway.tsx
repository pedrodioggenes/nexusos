import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, MapPin, CheckCircle2, Clock, Loader2, Play, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pendente", color: "bg-muted text-muted-foreground border-border", icon: <Clock className="h-3 w-3" /> },
  in_progress: { label: "Em Curso", color: "bg-warning/10 text-warning border-warning/20", icon: <Play className="h-3 w-3" /> },
  completed: { label: "Concluído", color: "bg-success/10 text-success border-success/20", icon: <CheckCircle2 className="h-3 w-3" /> },
};

const statusTransitions: Record<string, string[]> = {
  pending: ["in_progress"],
  in_progress: ["completed"],
  completed: [],
};

// ==================== Hooks ====================

function usePutawayTasks() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["cd-putaway-tasks", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("cd_putaway_tasks")
        .select(`
          *,
          cd_skus(name, code),
          suggested:cd_locations!cd_putaway_tasks_suggested_location_id_fkey(code, zone),
          actual:cd_locations!cd_putaway_tasks_actual_location_id_fkey(code, zone)
        `)
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []).map((r: any) => ({
        ...r,
        sku_name: r.cd_skus?.name,
        sku_code: r.cd_skus?.code,
        suggested_location_code: r.suggested?.code,
        suggested_zone: r.suggested?.zone,
        actual_location_code: r.actual?.code,
        actual_zone: r.actual?.zone,
      }));
    },
    enabled: !!tenant?.id,
  });
}

function useUpdatePutawayStatus() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const update: any = { status };
      if (status === "in_progress") {
        update.started_at = new Date().toISOString();
        update.operator_id = user?.id || null;
      }
      if (status === "completed") {
        update.completed_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from("cd_putaway_tasks")
        .update(update)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cd-putaway-tasks"] });
      toast.success("Status atualizado");
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

// ==================== Component ====================

export default function PutawayPage() {
  const { data: tasks = [], isLoading } = usePutawayTasks();
  const updateStatus = useUpdatePutawayStatus();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return tasks.filter((t: any) => {
      const matchSearch =
        !search ||
        t.sku_name?.toLowerCase().includes(search.toLowerCase()) ||
        t.sku_code?.toLowerCase().includes(search.toLowerCase()) ||
        t.suggested_location_code?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tasks, search, statusFilter]);

  const stats = useMemo(() => ({
    pending: tasks.filter((t: any) => t.status === "pending").length,
    in_progress: tasks.filter((t: any) => t.status === "in_progress").length,
    completed: tasks.filter((t: any) => t.status === "completed").length,
    total_qty: tasks.reduce((s: number, t: any) => s + (t.qty || 0), 0),
  }), [tasks]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Endereçamento (Put-away)"
        description="Direcionamento de mercadoria conferida para endereço de estoque"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Pendentes</p>
          <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Em Curso</p>
          <p className="text-2xl font-bold text-warning">{stats.in_progress}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Concluídos</p>
          <p className="text-2xl font-bold text-success">{stats.completed}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Itens Total</p>
          <p className="text-2xl font-bold text-foreground">{stats.total_qty}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar SKU ou endereço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="in_progress">Em Curso</SelectItem>
            <SelectItem value="completed">Concluídos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <MapPin className="h-10 w-10 mb-2 opacity-40" />
          <p className="text-sm">Nenhuma tarefa de endereçamento encontrada</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Qtde</TableHead>
              <TableHead>Endereço Sugerido</TableHead>
              <TableHead>Endereço Real</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t: any) => {
              const st = statusConfig[t.status] || statusConfig.pending;
              const transitions = statusTransitions[t.status] || [];
              return (
                <TableRow key={t.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground text-sm">{t.sku_name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{t.sku_code}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{t.qty}</TableCell>
                  <TableCell>
                    {t.suggested_location_code ? (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <span className="text-sm">{t.suggested_location_code}</span>
                        {t.suggested_zone && (
                          <Badge variant="outline" className="text-[10px] px-1.5">{t.suggested_zone}</Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sem sugestão</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {t.actual_location_code ? (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        <span className="text-sm">{t.actual_location_code}</span>
                        {t.actual_zone && (
                          <Badge variant="outline" className="text-[10px] px-1.5">{t.actual_zone}</Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("gap-1", st.color)}>
                      {st.icon} {st.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(parseISO(t.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {transitions.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {transitions.map((next) => {
                            const cfg = statusConfig[next];
                            return (
                              <DropdownMenuItem
                                key={next}
                                onClick={() => updateStatus.mutate({ id: t.id, status: next })}
                              >
                                <ArrowRight className="h-3.5 w-3.5 mr-2" />
                                {cfg?.label || next}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
