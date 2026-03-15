import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, FileText, Clock, CheckCircle2, MapPin } from "lucide-react";
import { useRomaneios, useUpdateRomaneioStatus } from "@/hooks/cd/useSeparationData";
import { format } from "date-fns";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Rascunho", variant: "secondary" },
  loading: { label: "Carregando", variant: "outline" },
  dispatched: { label: "Despachado", variant: "default" },
  delivered: { label: "Entregue", variant: "default" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

export default function RomaneiosPage() {
  const { data: romaneios = [], isLoading } = useRomaneios();
  const updateStatus = useUpdateRomaneioStatus();
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return romaneios;
    return romaneios.filter((r: any) => r.status === statusFilter);
  }, [romaneios, statusFilter]);

  const stats = useMemo(() => ({
    draft: romaneios.filter((r: any) => r.status === "draft").length,
    loading: romaneios.filter((r: any) => r.status === "loading").length,
    dispatched: romaneios.filter((r: any) => r.status === "dispatched").length,
    delivered: romaneios.filter((r: any) => r.status === "delivered").length,
  }), [romaneios]);

  const handleAdvance = (id: string, current: string) => {
    const flow: Record<string, string> = { draft: "loading", loading: "dispatched", dispatched: "delivered" };
    const next = flow[current];
    if (!next) return;
    const extra: Record<string, any> = {};
    if (next === "dispatched") extra.departure_at = new Date().toISOString();
    if (next === "delivered") extra.arrival_at = new Date().toISOString();
    updateStatus.mutate({ id, status: next, extra });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Romaneios</h1>
        <p className="text-muted-foreground text-sm">Conferência de carga e despacho</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Rascunho", value: stats.draft, icon: FileText, color: "text-muted-foreground" },
          { label: "Carregando", value: stats.loading, icon: Clock, color: "text-yellow-500" },
          { label: "Despachados", value: stats.dispatched, icon: Truck, color: "text-blue-500" },
          { label: "Entregues", value: stats.delivered, icon: CheckCircle2, color: "text-green-500" },
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
          <CardTitle className="text-base">Romaneios ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="text-muted-foreground text-sm p-6">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm p-6">Nenhum romaneio encontrado</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Romaneio</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Motorista</TableHead>
                  <TableHead>Transportadora</TableHead>
                  <TableHead>Ordens</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Peso (kg)</TableHead>
                  <TableHead>Saída</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r: any) => {
                  const cfg = statusConfig[r.status] || statusConfig.draft;
                  const canAdvance = ["draft", "loading", "dispatched"].includes(r.status);
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.romaneio_number}</TableCell>
                      <TableCell>{r.vehicle_plate || "—"}</TableCell>
                      <TableCell>{r.driver_name || "—"}</TableCell>
                      <TableCell>{r.carrier_name || "—"}</TableCell>
                      <TableCell>{r.total_orders ?? 0}</TableCell>
                      <TableCell>{r.total_items ?? 0}</TableCell>
                      <TableCell>{r.total_weight_kg ? Number(r.total_weight_kg).toFixed(1) : "—"}</TableCell>
                      <TableCell className="text-xs">{r.departure_at ? format(new Date(r.departure_at), "dd/MM HH:mm") : "—"}</TableCell>
                      <TableCell><Badge variant={cfg.variant}>{cfg.label}</Badge></TableCell>
                      <TableCell>
                        {canAdvance && (
                          <Button size="sm" variant="outline" onClick={() => handleAdvance(r.id, r.status)} disabled={updateStatus.isPending}>
                            {r.status === "draft" ? "Carregar" : r.status === "loading" ? "Despachar" : "Confirmar Entrega"}
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
