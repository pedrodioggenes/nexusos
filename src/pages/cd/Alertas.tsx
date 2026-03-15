import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Bell, CheckCircle2, Info, ExternalLink, Eye } from "lucide-react";
import { useCDAlerts, useResolveAlert, useMarkAlertViewed } from "@/hooks/cd/useAlertData";
import { format } from "date-fns";

const levelConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode; color: string }> = {
  critical: { label: "Crítico", variant: "destructive", icon: <AlertTriangle className="h-4 w-4" />, color: "text-destructive" },
  warning: { label: "Atenção", variant: "outline", icon: <Bell className="h-4 w-4" />, color: "text-yellow-500" },
  info: { label: "Info", variant: "secondary", icon: <Info className="h-4 w-4" />, color: "text-blue-500" },
};

const categoryLabels: Record<string, string> = {
  receiving: "Recebimento",
  storage: "Armazenagem",
  demand: "Demanda",
  picking: "Separação",
  expedition: "Expedição",
  quality: "Qualidade",
  expiration: "Validade",
  rupture: "Ruptura",
  inventory: "Inventário",
  general: "Geral",
};

export default function AlertasPage() {
  const { data: alerts = [], isLoading } = useCDAlerts();
  const resolveAlert = useResolveAlert();
  const markViewed = useMarkAlertViewed();
  const navigate = useNavigate();
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");

  const filtered = useMemo(() => {
    return alerts.filter((a: any) => {
      const matchLevel = levelFilter === "all" || a.level === levelFilter;
      const matchStatus = statusFilter === "all" ||
        (statusFilter === "active" && !a.resolved_at) ||
        (statusFilter === "resolved" && a.resolved_at);
      return matchLevel && matchStatus;
    });
  }, [alerts, levelFilter, statusFilter]);

  const stats = useMemo(() => ({
    critical: alerts.filter((a: any) => a.level === "critical" && !a.resolved_at).length,
    warning: alerts.filter((a: any) => a.level === "warning" && !a.resolved_at).length,
    info: alerts.filter((a: any) => a.level === "info" && !a.resolved_at).length,
    resolved: alerts.filter((a: any) => a.resolved_at).length,
  }), [alerts]);

  const handleAction = (alert: any) => {
    if (!alert.viewed_at) markViewed.mutate({ id: alert.id });
    if (alert.action_url) navigate(alert.action_url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Alertas Operacionais</h1>
        <p className="text-muted-foreground text-sm">Centro de alertas com ações diretas</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Críticos", value: stats.critical, icon: AlertTriangle, color: "text-destructive" },
          { label: "Atenção", value: stats.warning, icon: Bell, color: "text-yellow-500" },
          { label: "Informativos", value: stats.info, icon: Info, color: "text-blue-500" },
          { label: "Resolvidos", value: stats.resolved, icon: CheckCircle2, color: "text-green-500" },
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
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Severidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(levelConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="resolved">Resolvidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Alertas ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="text-muted-foreground text-sm p-6">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm p-6">Nenhum alerta encontrado</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a: any) => {
                  const cfg = levelConfig[a.level] || levelConfig.info;
                  const isResolved = !!a.resolved_at;
                  return (
                    <TableRow key={a.id} className={!a.viewed_at && !isResolved ? "bg-muted/30" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className={cfg.color}>{cfg.icon}</span>
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{categoryLabels[a.category] || a.category}</TableCell>
                      <TableCell className="font-medium text-sm max-w-[200px] truncate">{a.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[250px] truncate">{a.description || "—"}</TableCell>
                      <TableCell className="text-xs">{format(new Date(a.created_at), "dd/MM HH:mm")}</TableCell>
                      <TableCell>
                        {isResolved ? (
                          <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Resolvido</Badge>
                        ) : (
                          <Badge variant="outline">Ativo</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {a.action_url && (
                            <Button size="sm" variant="ghost" onClick={() => handleAction(a)} title="Ir para ação">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {!isResolved && (
                            <Button size="sm" variant="outline" onClick={() => resolveAlert.mutate({ id: a.id })} disabled={resolveAlert.isPending}>
                              Resolver
                            </Button>
                          )}
                        </div>
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
