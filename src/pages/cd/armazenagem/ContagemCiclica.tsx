import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Search, Loader2, RefreshCw, MoreHorizontal, CheckCircle2, Clock, ArrowRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCycleCounts, useRegisterCount, useApproveCycleCount } from "@/hooks/cd/useStorageData";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pendente", color: "bg-muted text-muted-foreground border-border", icon: <Clock className="h-3 w-3" /> },
  counted: { label: "Contado", color: "bg-warning/10 text-warning border-warning/20", icon: <RefreshCw className="h-3 w-3" /> },
  approved: { label: "Aprovado", color: "bg-success/10 text-success border-success/20", icon: <CheckCircle2 className="h-3 w-3" /> },
  rejected: { label: "Rejeitado", color: "bg-destructive/10 text-destructive border-destructive/20", icon: <AlertTriangle className="h-3 w-3" /> },
};

export default function ContagemCiclicaPage() {
  const { data: counts = [], isLoading } = useCycleCounts();
  const registerCount = useRegisterCount();
  const approveCount = useApproveCycleCount();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Count dialog
  const [countDialog, setCountDialog] = useState<{ open: boolean; id: string; sku_name: string; qty_system: number }>({
    open: false, id: "", sku_name: "", qty_system: 0,
  });
  const [qtyPhysical, setQtyPhysical] = useState("");

  // Approve dialog
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; id: string }>({ open: false, id: "" });
  const [adjustmentReason, setAdjustmentReason] = useState("");

  const filtered = useMemo(() => {
    return counts.filter((c: any) => {
      const matchSearch = !search ||
        c.sku_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.sku_code?.toLowerCase().includes(search.toLowerCase()) ||
        c.location_code?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [counts, search, statusFilter]);

  const stats = useMemo(() => ({
    pending: counts.filter((c: any) => c.status === "pending").length,
    counted: counts.filter((c: any) => c.status === "counted").length,
    approved: counts.filter((c: any) => c.status === "approved").length,
    accuracy: (() => {
      const approved = counts.filter((c: any) => c.status === "approved" && c.delta_pct !== null);
      if (approved.length === 0) return null;
      const avgDelta = approved.reduce((s: number, c: any) => s + Math.abs(c.delta_pct || 0), 0) / approved.length;
      return Math.round((100 - avgDelta) * 100) / 100;
    })(),
  }), [counts]);

  const handleRegister = () => {
    const qty = parseFloat(qtyPhysical);
    if (isNaN(qty) || qty < 0) return;
    registerCount.mutate(
      { id: countDialog.id, qty_physical: qty },
      { onSuccess: () => { setCountDialog({ open: false, id: "", sku_name: "", qty_system: 0 }); setQtyPhysical(""); } }
    );
  };

  const handleApprove = () => {
    approveCount.mutate(
      { id: approveDialog.id, adjustment_reason: adjustmentReason },
      { onSuccess: () => { setApproveDialog({ open: false, id: "" }); setAdjustmentReason(""); } }
    );
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Contagem Cíclica"
        description="Inventário rotativo por curva ABC com aprovação de ajustes"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Pendentes</p>
          <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Contados (aguardando)</p>
          <p className="text-2xl font-bold text-warning">{stats.counted}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Aprovados</p>
          <p className="text-2xl font-bold text-success">{stats.approved}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Acurácia Média</p>
          <p className="text-2xl font-bold text-foreground">{stats.accuracy !== null ? `${stats.accuracy}%` : "—"}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar SKU ou endereço..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="counted">Contados</SelectItem>
            <SelectItem value="approved">Aprovados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <RefreshCw className="h-10 w-10 mb-2 opacity-40" />
          <p className="text-sm">Nenhuma contagem encontrada</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead className="text-right">Sistema</TableHead>
              <TableHead className="text-right">Físico</TableHead>
              <TableHead className="text-right">Delta</TableHead>
              <TableHead className="text-right">Delta %</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c: any) => {
              const st = statusConfig[c.status] || statusConfig.pending;
              const hasDelta = c.delta !== null && c.delta !== 0;
              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground text-sm">{c.sku_name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{c.sku_code}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {c.location_code ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{c.location_code}</span>
                        {c.location_zone && <Badge variant="outline" className="text-[10px] px-1">{c.location_zone}</Badge>}
                      </div>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium">{c.qty_system}</TableCell>
                  <TableCell className="text-right font-medium">{c.qty_physical ?? "—"}</TableCell>
                  <TableCell className={cn("text-right font-medium", hasDelta && (c.delta > 0 ? "text-success" : "text-destructive"))}>
                    {c.delta !== null ? (c.delta > 0 ? `+${c.delta}` : c.delta) : "—"}
                  </TableCell>
                  <TableCell className={cn("text-right text-sm", hasDelta && (c.delta_pct && Math.abs(c.delta_pct) > 5 ? "text-destructive font-bold" : "text-muted-foreground"))}>
                    {c.delta_pct !== null ? `${c.delta_pct}%` : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("gap-1", st.color)}>
                      {st.icon} {st.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(parseISO(c.created_at), "dd/MM/yy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {(c.status === "pending" || c.status === "counted") && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {c.status === "pending" && (
                            <DropdownMenuItem onClick={() => {
                              setCountDialog({ open: true, id: c.id, sku_name: c.sku_name || "SKU", qty_system: c.qty_system });
                              setQtyPhysical("");
                            }}>
                              <ArrowRight className="h-3.5 w-3.5 mr-2" /> Registrar Contagem
                            </DropdownMenuItem>
                          )}
                          {c.status === "counted" && (
                            <DropdownMenuItem onClick={() => {
                              setApproveDialog({ open: true, id: c.id });
                              setAdjustmentReason("");
                            }}>
                              <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Aprovar Ajuste
                            </DropdownMenuItem>
                          )}
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

      {/* Count Dialog */}
      <Dialog open={countDialog.open} onOpenChange={(o) => setCountDialog({ ...countDialog, open: o })}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Registrar Contagem</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{countDialog.sku_name}</p>
            <p className="text-xs text-muted-foreground">Quantidade sistema: <strong>{countDialog.qty_system}</strong></p>
            <div className="space-y-1.5">
              <Label className="text-xs">Quantidade Física *</Label>
              <Input
                type="number"
                min="0"
                value={qtyPhysical}
                onChange={(e) => setQtyPhysical(e.target.value)}
                placeholder="0"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleRegister} disabled={registerCount.isPending || !qtyPhysical}>
              {registerCount.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialog.open} onOpenChange={(o) => setApproveDialog({ ...approveDialog, open: o })}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Aprovar Ajuste</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Motivo do Ajuste</Label>
              <Input
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="Ex: Quebra operacional"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleApprove} disabled={approveCount.isPending}>
              {approveCount.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Aprovar e Ajustar Estoque
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
