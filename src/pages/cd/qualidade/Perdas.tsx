import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skull, Search, DollarSign, Package, AlertTriangle } from "lucide-react";
import { useLossRecords } from "@/hooks/cd/useQualityData";
import { format } from "date-fns";

const originLabels: Record<string, string> = {
  receiving: "Recebimento", storage: "Armazenagem", picking: "Separação",
  expedition: "Expedição", expiration: "Validade", damage: "Avaria", theft: "Furto", other: "Outro",
};

const causeColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  receiving: "outline", storage: "secondary", picking: "secondary", expedition: "outline",
  expiration: "destructive", damage: "destructive", theft: "destructive", other: "secondary",
};

export default function PerdasPage() {
  const { data: losses = [], isLoading } = useLossRecords();
  const [search, setSearch] = useState("");
  const [originFilter, setOriginFilter] = useState("all");

  const filtered = useMemo(() => {
    return losses.filter((l: any) => {
      const matchSearch = !search || l.sku_name?.toLowerCase().includes(search.toLowerCase()) || l.sku_code?.toLowerCase().includes(search.toLowerCase());
      const matchOrigin = originFilter === "all" || l.origin === originFilter;
      return matchSearch && matchOrigin;
    });
  }, [losses, search, originFilter]);

  const stats = useMemo(() => {
    const totalQty = losses.reduce((s: number, l: any) => s + (l.qty || 0), 0);
    const totalValue = losses.reduce((s: number, l: any) => s + (l.total_value || l.qty * (l.unit_cost || l.avg_unit_cost || 0)), 0);
    const byOrigin = losses.reduce((acc: Record<string, number>, l: any) => {
      acc[l.origin] = (acc[l.origin] || 0) + (l.total_value || l.qty * (l.unit_cost || 0));
      return acc;
    }, {});
    const topOrigin = Object.entries(byOrigin).sort(([, a], [, b]) => (b as number) - (a as number))[0];
    return { totalQty, totalValue, totalRecords: losses.length, topOrigin: topOrigin ? originLabels[topOrigin[0]] || topOrigin[0] : "—" };
  }, [losses]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Perdas</h1>
        <p className="text-muted-foreground text-sm">Registro de perdas por origem</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Registros", value: stats.totalRecords, icon: Skull, color: "text-destructive" },
          { label: "Qtd Total", value: stats.totalQty.toLocaleString("pt-BR"), icon: Package, color: "text-yellow-500" },
          { label: "Valor Total", value: `R$ ${stats.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-destructive" },
          { label: "Maior Origem", value: stats.topOrigin, icon: AlertTriangle, color: "text-orange-500" },
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
          <Input placeholder="Buscar por SKU..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={originFilter} onValueChange={setOriginFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Origem" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {Object.entries(originLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Registros ({filtered.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {isLoading ? <p className="text-muted-foreground text-sm p-6">Carregando...</p> : filtered.length === 0 ? <p className="text-muted-foreground text-sm p-6">Nenhuma perda registrada</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead><TableHead>SKU</TableHead><TableHead>Origem</TableHead>
                  <TableHead>Causa</TableHead><TableHead>Qtd</TableHead><TableHead>Custo Unit.</TableHead>
                  <TableHead>Valor Total</TableHead><TableHead>Loja</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((l: any) => {
                  const value = l.total_value || l.qty * (l.unit_cost || 0);
                  return (
                    <TableRow key={l.id}>
                      <TableCell className="text-xs">{format(new Date(l.recorded_at), "dd/MM/yyyy")}</TableCell>
                      <TableCell><p className="text-sm font-medium truncate max-w-[200px]">{l.sku_name || l.sku_code}</p><p className="text-xs text-muted-foreground">{l.sku_code}</p></TableCell>
                      <TableCell><Badge variant={causeColors[l.origin] || "secondary"}>{originLabels[l.origin] || l.origin}</Badge></TableCell>
                      <TableCell className="text-xs">{l.cause || "—"}</TableCell>
                      <TableCell className="font-mono">{l.qty}</TableCell>
                      <TableCell className="font-mono text-xs">R$ {(l.unit_cost || 0).toFixed(2)}</TableCell>
                      <TableCell className="font-mono text-destructive font-medium">R$ {value.toFixed(2)}</TableCell>
                      <TableCell className="text-xs">{l.store_name || "CD"}</TableCell>
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
