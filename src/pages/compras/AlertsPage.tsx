import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useComprasAlerts, useComprasSuppliers } from "@/hooks/useComprasData";
import { AlertTriangle, Bell, CheckCircle, Info, ShieldAlert } from "lucide-react";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const levelConfig: Record<string, { icon: typeof AlertTriangle; color: string; bg: string; label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  critical: { icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/5 border-destructive/20", label: "Crítico", variant: "destructive" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/5 border-warning/20", label: "Atenção", variant: "outline" },
  info: { icon: Info, color: "text-module-compras", bg: "bg-module-compras/5 border-module-compras/20", label: "Info", variant: "secondary" },
};

export default function AlertsPage() {
  const { data: alerts = [], isLoading } = useComprasAlerts();
  const { data: suppliers = [] } = useComprasSuppliers();
  const qc = useQueryClient();

  const grouped = useMemo(() => {
    const g: Record<string, any[]> = { critical: [], warning: [], info: [] };
    alerts.forEach((a: any) => {
      const level = a.level || "info";
      if (!g[level]) g[level] = [];
      g[level].push(a);
    });
    return g;
  }, [alerts]);

  const handleResolve = async (alertId: string) => {
    const { error } = await supabase
      .from("compras_alerts")
      .update({ resolved_at: new Date().toISOString() })
      .eq("id", alertId);
    if (error) {
      toast.error("Erro ao resolver alerta");
    } else {
      toast.success("Alerta resolvido");
      qc.invalidateQueries({ queryKey: ["compras-alerts"] });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Carregando alertas...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bell className="h-6 w-6 text-module-compras" />Alertas de Compras
        </h1>
        <p className="text-sm text-muted-foreground">Rupturas, preços, fornecedores e alertas financeiros</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {(["critical", "warning", "info"] as const).map(level => {
          const cfg = levelConfig[level];
          const count = grouped[level]?.length || 0;
          return (
            <Card key={level}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${cfg.bg} border`}>
                  <cfg.icon className={`h-5 w-5 ${cfg.color}`} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{cfg.label}</p>
                  <p className={`text-2xl font-bold ${cfg.color}`}>{count}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alert Lists */}
      {(["critical", "warning", "info"] as const).map(level => {
        const items = grouped[level] || [];
        if (items.length === 0) return null;
        const cfg = levelConfig[level];
        return (
          <Card key={level} className={`border ${level === "critical" ? "border-destructive/30" : ""}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                {cfg.label} ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map((a: any) => (
                <div key={a.id} className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${cfg.bg}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-foreground">{a.title}</p>
                      <Badge variant={cfg.variant} className="text-[10px] shrink-0">{a.alert_type?.replace(/_/g, " ")}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(a.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0 text-xs" onClick={() => handleResolve(a.id)}>
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />Resolver
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {alerts.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckCircle className="h-10 w-10 text-success mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">Nenhum alerta ativo</p>
            <p className="text-xs text-muted-foreground">Todos os indicadores estão dentro dos parâmetros</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
