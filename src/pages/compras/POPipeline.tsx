import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  FileText,
  Clock,
  CheckCircle2,
  Send,
  Package,
  AlertTriangle,
  XCircle,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { useComprasPurchaseOrders, formatBRL } from "@/hooks/useComprasData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  draft: { label: "Rascunho", icon: FileText, className: "bg-muted text-muted-foreground" },
  pending_approval: { label: "Aprovação", icon: Clock, className: "bg-warning/15 text-warning border-warning/30" },
  approved: { label: "Aprovada", icon: CheckCircle2, className: "bg-success/15 text-success border-success/30" },
  sent: { label: "Enviada", icon: Send, className: "bg-app-compras/15 text-app-compras border-app-compras/30" },
  received: { label: "Recebida", icon: Package, className: "bg-success/15 text-success border-success/30" },
  divergent: { label: "Divergência", icon: AlertTriangle, className: "bg-destructive/15 text-destructive border-destructive/30" },
  cancelled: { label: "Cancelada", icon: XCircle, className: "bg-muted text-muted-foreground" },
};

export default function POPipeline() {
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useComprasPurchaseOrders();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"created_at" | "total_value" | "expected_date">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.po_number.toLowerCase().includes(q) ||
          (o.compras_suppliers as any)?.name?.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      const va = (a as any)[sortField] ?? "";
      const vb = (b as any)[sortField] ?? "";
      if (sortDir === "asc") return va > vb ? 1 : -1;
      return va < vb ? 1 : -1;
    });
    return list;
  }, [orders, statusFilter, search, sortField, sortDir]);

  // Summary counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      const s = o.status || "draft";
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`gap-1 text-[11px] font-medium border ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline de OCs</h1>
          <p className="text-sm text-muted-foreground">Ordens de compra por status</p>
        </div>
        <Button
          onClick={() => navigate("/app/compras/ordens/nova")}
          className="bg-app-compras hover:bg-app-compras/90 text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Nova OC
        </Button>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const count = statusCounts[key] || 0;
          const isActive = statusFilter === key;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(isActive ? "all" : key)}
              className={`rounded-xl border p-3 text-left transition-all ${
                isActive
                  ? "border-app-compras bg-app-compras/5 ring-1 ring-app-compras/20"
                  : "border-border bg-card hover:bg-secondary/50"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground uppercase font-medium">{cfg.label}</span>
              </div>
              <span className="text-lg font-bold text-foreground">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número ou fornecedor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Nenhuma OC encontrada</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Ajuste os filtros ou crie uma nova ordem</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-32">Nº OC</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <button onClick={() => toggleSort("total_value")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                        Valor Total <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                    <TableHead>PPV</TableHead>
                    <TableHead>
                      <button onClick={() => toggleSort("expected_date")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                        Previsão <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button onClick={() => toggleSort("created_at")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                        Criada em <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((po) => {
                    const supplier = po.compras_suppliers as any;
                    const ppv = po.ppv_total;
                    return (
                      <TableRow key={po.id} className="cursor-pointer hover:bg-secondary/30">
                        <TableCell className="font-mono text-xs font-medium text-app-compras">{po.po_number}</TableCell>
                        <TableCell>
                          <div>
                            <span className="text-sm font-medium text-foreground">{supplier?.name || "—"}</span>
                            {supplier?.cnpj && (
                              <span className="ml-1.5 text-[10px] text-muted-foreground">({supplier.cnpj})</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell><StatusBadge status={po.status || "draft"} /></TableCell>
                        <TableCell className="font-medium text-sm">{po.total_value ? formatBRL(po.total_value) : "—"}</TableCell>
                        <TableCell>
                          {ppv != null ? (
                            <span className={`text-sm font-medium ${ppv > 0 ? "text-destructive" : ppv < 0 ? "text-success" : "text-muted-foreground"}`}>
                              {ppv > 0 ? "+" : ""}{formatBRL(ppv)}
                            </span>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {po.expected_date ? format(new Date(po.expected_date), "dd/MM/yy") : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(po.created_at), "dd/MM/yy")}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
