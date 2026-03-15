import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, Package, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useStockLots } from "@/hooks/cd/useStorageData";

const statusLabels: Record<string, { label: string; color: string }> = {
  available: { label: "Disponível", color: "bg-success/10 text-success border-success/20" },
  reserved: { label: "Reservado", color: "bg-warning/10 text-warning border-warning/20" },
  blocked: { label: "Bloqueado", color: "bg-destructive/10 text-destructive border-destructive/20" },
  consumed: { label: "Consumido", color: "bg-muted text-muted-foreground border-border" },
};

function getExpiryUrgency(expirationDate: string | null): { label: string; color: string } | null {
  if (!expirationDate) return null;
  const days = differenceInDays(parseISO(expirationDate), new Date());
  if (days < 0) return { label: "Vencido", color: "bg-destructive/10 text-destructive border-destructive/20" };
  if (days <= 7) return { label: `${days}d`, color: "bg-destructive/10 text-destructive border-destructive/20" };
  if (days <= 30) return { label: `${days}d`, color: "bg-warning/10 text-warning border-warning/20" };
  return { label: `${days}d`, color: "bg-muted text-muted-foreground border-border" };
}

export default function LotesPage() {
  const { data: lots = [], isLoading } = useStockLots();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expiryFilter, setExpiryFilter] = useState("all");

  const filtered = useMemo(() => {
    return lots.filter((l: any) => {
      const matchSearch = !search ||
        l.sku_name?.toLowerCase().includes(search.toLowerCase()) ||
        l.sku_code?.toLowerCase().includes(search.toLowerCase()) ||
        l.batch_number?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || l.status === statusFilter;

      let matchExpiry = true;
      if (expiryFilter !== "all" && l.expiration_date) {
        const days = differenceInDays(parseISO(l.expiration_date), new Date());
        if (expiryFilter === "expired") matchExpiry = days < 0;
        else if (expiryFilter === "7d") matchExpiry = days >= 0 && days <= 7;
        else if (expiryFilter === "30d") matchExpiry = days >= 0 && days <= 30;
      } else if (expiryFilter !== "all" && !l.expiration_date) {
        matchExpiry = false;
      }

      return matchSearch && matchStatus && matchExpiry;
    });
  }, [lots, search, statusFilter, expiryFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: lots.length,
      expiring7d: lots.filter((l: any) => l.expiration_date && differenceInDays(parseISO(l.expiration_date), now) <= 7 && differenceInDays(parseISO(l.expiration_date), now) >= 0).length,
      expired: lots.filter((l: any) => l.expiration_date && differenceInDays(parseISO(l.expiration_date), now) < 0).length,
      blocked: lots.filter((l: any) => l.status === "blocked").length,
    };
  }, [lots]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Lotes & Validades (FEFO)"
        description="Gestão de lotes com prioridade First-Expired, First-Out"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total de Lotes</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
            <p className="text-xs text-muted-foreground">Vencendo (7d)</p>
          </div>
          <p className="text-2xl font-bold text-warning">{stats.expiring7d}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-destructive" />
            <p className="text-xs text-muted-foreground">Vencidos</p>
          </div>
          <p className="text-2xl font-bold text-destructive">{stats.expired}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Bloqueados</p>
          <p className="text-2xl font-bold text-foreground">{stats.blocked}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar SKU ou lote..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="available">Disponível</SelectItem>
            <SelectItem value="reserved">Reservado</SelectItem>
            <SelectItem value="blocked">Bloqueado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={expiryFilter} onValueChange={setExpiryFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Validade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="expired">Vencidos</SelectItem>
            <SelectItem value="7d">≤ 7 dias</SelectItem>
            <SelectItem value="30d">≤ 30 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Package className="h-10 w-10 mb-2 opacity-40" />
          <p className="text-sm">Nenhum lote encontrado</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Lote</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead className="text-right">Disponível</TableHead>
              <TableHead className="text-right">Reservado</TableHead>
              <TableHead className="text-right">Bloqueado</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((lot: any) => {
              const st = statusLabels[lot.status] || statusLabels.available;
              const expiry = getExpiryUrgency(lot.expiration_date);
              return (
                <TableRow key={lot.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground text-sm">{lot.sku_name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{lot.sku_code}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{lot.batch_number || "—"}</TableCell>
                  <TableCell>
                    {lot.expiration_date ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{format(parseISO(lot.expiration_date), "dd/MM/yy")}</span>
                        {expiry && (
                          <Badge variant="outline" className={cn("text-[10px] px-1.5", expiry.color)}>
                            {expiry.label}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sem validade</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">{lot.qty_available}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{lot.qty_reserved}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{lot.qty_blocked}</TableCell>
                  <TableCell>
                    {lot.location_code ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{lot.location_code}</span>
                        {lot.location_zone && (
                          <Badge variant="outline" className="text-[10px] px-1">{lot.location_zone}</Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", st.color)}>{st.label}</Badge>
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
