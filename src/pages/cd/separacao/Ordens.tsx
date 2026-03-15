import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, Truck, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { useTransferOrders, useUpdateTransferOrderStatus } from "@/hooks/cd/useSeparationData";
import { format } from "date-fns";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  approved: { label: "Aprovada", variant: "default" },
  picking: { label: "Em Separação", variant: "outline" },
  packed: { label: "Embalada", variant: "default" },
  shipped: { label: "Expedida", variant: "default" },
  delivered: { label: "Entregue", variant: "default" },
  cancelled: { label: "Cancelada", variant: "destructive" },
};

const priorityIcons: Record<string, React.ReactNode> = {
  critical: <AlertTriangle className="h-3.5 w-3.5 text-destructive" />,
  high: <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />,
  medium: <Clock className="h-3.5 w-3.5 text-yellow-500" />,
  low: <Clock className="h-3.5 w-3.5 text-muted-foreground" />,
};

export default function OrdensPage() {
  const { data: orders = [], isLoading } = useTransferOrders();
  const updateStatus = useUpdateTransferOrderStatus();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return orders.filter((o: any) => {
      const matchSearch = !search || o.transfer_number?.toLowerCase().includes(search.toLowerCase()) || o.store_name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => ({
    pending: orders.filter((o: any) => o.status === "pending").length,
    picking: orders.filter((o: any) => o.status === "picking").length,
    packed: orders.filter((o: any) => o.status === "packed").length,
    shipped: orders.filter((o: any) => o.status === "shipped").length,
  }), [orders]);

  const handleAdvanceStatus = (id: string, current: string) => {
    const flow: Record<string, string> = { pending: "approved", approved: "picking", picking: "packed", packed: "shipped" };
    const next = flow[current];
    if (!next) return;
    const extra: Record<string, any> = {};
    if (next === "shipped") extra.shipped_at = new Date().toISOString();
    updateStatus.mutate({ id, status: next, extra });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ordens de Transferência</h1>
        <p className="text-muted-foreground text-sm">Gestão de ordens de separação por loja</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pendentes", value: stats.pending, icon: Clock, color: "text-yellow-500" },
          { label: "Separando", value: stats.picking, icon: Package, color: "text-blue-500" },
          { label: "Embaladas", value: stats.packed, icon: CheckCircle2, color: "text-green-500" },
          { label: "Expedidas", value: stats.shipped, icon: Truck, color: "text-muted-foreground" },
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

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nº ou loja..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
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
          <CardTitle className="text-base">Ordens ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="text-muted-foreground text-sm p-6">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm p-6">Nenhuma ordem encontrada</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Ordem</TableHead>
                  <TableHead>Loja</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>SKUs</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o: any) => {
                  const cfg = statusConfig[o.status] || statusConfig.pending;
                  const canAdvance = ["pending", "approved", "picking", "packed"].includes(o.status);
                  return (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">{o.transfer_number}</TableCell>
                      <TableCell>{o.store_name || o.store_code || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {priorityIcons[o.priority] || priorityIcons.medium}
                          <span className="text-xs capitalize">{o.priority || "medium"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{o.total_skus ?? "—"}</TableCell>
                      <TableCell>{o.total_items ?? "—"}</TableCell>
                      <TableCell className="text-xs">{format(new Date(o.requested_date), "dd/MM/yyyy")}</TableCell>
                      <TableCell><Badge variant={cfg.variant}>{cfg.label}</Badge></TableCell>
                      <TableCell>
                        {canAdvance && (
                          <Button size="sm" variant="outline" onClick={() => handleAdvanceStatus(o.id, o.status)} disabled={updateStatus.isPending}>
                            Avançar
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
