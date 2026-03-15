import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Loader2, Package, MoreHorizontal, CheckCircle2, XCircle, Clock, ArrowRight, AlertTriangle, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useOrderSuggestions, useApproveOrderSuggestion, useRejectOrderSuggestion } from "@/hooks/cd/useDemandData";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "bg-warning/10 text-warning border-warning/20" },
  approved: { label: "Aprovado", color: "bg-success/10 text-success border-success/20" },
  rejected: { label: "Rejeitado", color: "bg-destructive/10 text-destructive border-destructive/20" },
  converted: { label: "Convertido", color: "bg-primary/10 text-primary border-primary/20" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  critical: { label: "Crítico", color: "bg-destructive/10 text-destructive border-destructive/20" },
  high: { label: "Alto", color: "bg-warning/10 text-warning border-warning/20" },
  medium: { label: "Médio", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  low: { label: "Baixo", color: "bg-muted text-muted-foreground border-border" },
};

export default function ReposicaoPage() {
  const { data: suggestions = [], isLoading } = useOrderSuggestions();
  const approve = useApproveOrderSuggestion();
  const reject = useRejectOrderSuggestion();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filtered = useMemo(() => {
    return suggestions.filter((s: any) => {
      const matchSearch = !search ||
        s.sku_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.sku_code?.toLowerCase().includes(search.toLowerCase()) ||
        s.store_name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const matchPriority = priorityFilter === "all" || s.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [suggestions, search, statusFilter, priorityFilter]);

  const stats = useMemo(() => ({
    pending: suggestions.filter((s: any) => s.status === "pending").length,
    critical: suggestions.filter((s: any) => s.priority === "critical" && s.status === "pending").length,
    approved: suggestions.filter((s: any) => s.status === "approved").length,
    totalQty: suggestions.filter((s: any) => s.status === "pending").reduce((a: number, s: any) => a + (s.suggested_qty || 0), 0),
  }), [suggestions]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Reposição"
        description="ADD, Safety Stock e Reorder Point — sugestões de pedido"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Pendentes</p>
          <p className="text-2xl font-bold text-warning">{stats.pending}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            <p className="text-xs text-muted-foreground">Críticos</p>
          </div>
          <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Aprovados</p>
          <p className="text-2xl font-bold text-success">{stats.approved}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Qtde Total Pendente</p>
          <p className="text-2xl font-bold text-foreground">{stats.totalQty.toLocaleString("pt-BR")}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar SKU ou loja..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="approved">Aprovados</SelectItem>
            <SelectItem value="rejected">Rejeitados</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Prioridade</SelectItem>
            <SelectItem value="critical">Crítico</SelectItem>
            <SelectItem value="high">Alto</SelectItem>
            <SelectItem value="medium">Médio</SelectItem>
            <SelectItem value="low">Baixo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Package className="h-10 w-10 mb-2 opacity-40" />
          <p className="text-sm">Nenhuma sugestão encontrada</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prioridade</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Loja</TableHead>
              <TableHead className="text-right">Estoque Atual</TableHead>
              <TableHead className="text-right">ROP</TableHead>
              <TableHead className="text-right">Sugestão</TableHead>
              <TableHead>Ruptura Projetada</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s: any) => {
              const st = statusConfig[s.status] || statusConfig.pending;
              const pr = priorityConfig[s.priority] || priorityConfig.low;
              const ruptDays = s.projected_rupture_date
                ? differenceInDays(parseISO(s.projected_rupture_date), new Date())
                : null;
              return (
                <TableRow key={s.id}>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", pr.color)}>{pr.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground text-sm">{s.sku_name || "—"}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">{s.sku_code}</span>
                        {s.abc_curve && (
                          <Badge variant="outline" className="text-[10px] px-1">{s.abc_curve}</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{s.store_name || "—"}</TableCell>
                  <TableCell className="text-right font-medium">{s.current_stock ?? "—"}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{s.reorder_point ?? "—"}</TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    {s.suggested_qty}
                    {s.suggested_qty_packs && (
                      <span className="text-xs text-muted-foreground ml-1">({s.suggested_qty_packs} cx)</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {ruptDays !== null ? (
                      <div className="flex items-center gap-1">
                        <TrendingDown className={cn("h-3.5 w-3.5", ruptDays <= 3 ? "text-destructive" : ruptDays <= 7 ? "text-warning" : "text-muted-foreground")} />
                        <span className={cn("text-sm font-medium", ruptDays <= 3 ? "text-destructive" : ruptDays <= 7 ? "text-warning" : "text-muted-foreground")}>
                          {ruptDays <= 0 ? "Hoje!" : `${ruptDays}d`}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", st.color)}>{st.label}</Badge>
                  </TableCell>
                  <TableCell>
                    {s.status === "pending" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => approve.mutate({ id: s.id })}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Aprovar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => reject.mutate({ id: s.id })}>
                            <XCircle className="h-3.5 w-3.5 mr-2" /> Rejeitar
                          </DropdownMenuItem>
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
