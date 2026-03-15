import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, Package, AlertTriangle, TrendingUp, Truck, BarChart3 } from "lucide-react";
import { useCDStores } from "@/hooks/cd/useDemandData";
import { useTransferOrders } from "@/hooks/cd/useSeparationData";
import { useLossRecords } from "@/hooks/cd/useQualityData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function PainelLojaPage() {
  const { data: stores = [] } = useCDStores();
  const { data: orders = [] } = useTransferOrders();
  const { data: losses = [] } = useLossRecords();
  const [selectedStore, setSelectedStore] = useState<string>("all");

  const storeOrders = useMemo(() => {
    if (selectedStore === "all") return orders;
    return orders.filter((o: any) => o.store_id === selectedStore);
  }, [orders, selectedStore]);

  const storeLosses = useMemo(() => {
    if (selectedStore === "all") return losses;
    return losses.filter((l: any) => l.store_id === selectedStore);
  }, [losses, selectedStore]);

  const stats = useMemo(() => ({
    totalOrders: storeOrders.length,
    pendingOrders: storeOrders.filter((o: any) => o.status === "pending").length,
    deliveredOrders: storeOrders.filter((o: any) => o.status === "delivered").length,
    totalLossValue: storeLosses.reduce((s: number, l: any) => s + (l.total_value || l.qty * (l.unit_cost || 0)), 0),
  }), [storeOrders, storeLosses]);

  const ordersByStore = useMemo(() => {
    const map: Record<string, { name: string; total: number; pending: number }> = {};
    orders.forEach((o: any) => {
      const name = o.store_name || o.store_code || "—";
      if (!map[o.store_id]) map[o.store_id] = { name, total: 0, pending: 0 };
      map[o.store_id].total++;
      if (o.status === "pending") map[o.store_id].pending++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [orders]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel da Loja</h1>
          <p className="text-muted-foreground text-sm">Visão consolidada por unidade</p>
        </div>
        <Select value={selectedStore} onValueChange={setSelectedStore}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Selecionar loja" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Lojas</SelectItem>
            {stores.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Ordens", value: stats.totalOrders, icon: Package, color: "text-primary" },
          { label: "Pendentes", value: stats.pendingOrders, icon: AlertTriangle, color: "text-yellow-500" },
          { label: "Entregues", value: stats.deliveredOrders, icon: Truck, color: "text-green-500" },
          { label: "Perdas (R$)", value: `R$ ${stats.totalLossValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-destructive" },
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

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Ordens por Loja
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ordersByStore.length === 0 ? (
            <p className="text-muted-foreground text-sm">Sem dados</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordersByStore} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="hsl(var(--primary))" name="Total" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="hsl(var(--destructive))" name="Pendentes" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
