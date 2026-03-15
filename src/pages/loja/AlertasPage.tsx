import { PageHeader } from "@/components/ui/page-header";
import { useStoreData } from "@/hooks/loja/useStoreData";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Bell, CheckCircle2, Eye, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const NIVEL_CONFIG = {
  critico: { label: "Crítico", color: "bg-destructive", textColor: "text-destructive", bgColor: "bg-destructive/10" },
  alerta: { label: "Alerta", color: "bg-warning", textColor: "text-warning", bgColor: "bg-warning/10" },
  info: { label: "Info", color: "bg-blue-500", textColor: "text-blue-500", bgColor: "bg-blue-500/10" },
};

export default function AlertasPage() {
  const { alertas } = useStoreData();
  const [statusFilter, setStatusFilter] = useState<"todos" | "aberto" | "reconhecido" | "resolvido">("todos");
  const [localAlertas, setLocalAlertas] = useState(alertas);

  const filtered = statusFilter === "todos" ? localAlertas : localAlertas.filter(a => a.status === statusFilter);

  const handleAction = (id: string, action: "reconhecido" | "resolvido") => {
    setLocalAlertas(prev => prev.map(a => a.id === id ? { ...a, status: action } : a));
    toast.success(action === "reconhecido" ? "Alerta reconhecido" : "Alerta resolvido");
  };

  const getTempoAberto = (criadoEm: string) => {
    const diff = Date.now() - new Date(criadoEm).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const openCount = localAlertas.filter(a => a.status === "aberto").length;
  const critCount = localAlertas.filter(a => a.nivel === "critico" && a.status === "aberto").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Central de Alertas"
        description="Alertas ativos com nível, KPI, SLA e ações"
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Abertos</p>
          <p className="text-2xl font-bold text-foreground">{openCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Críticos</p>
          <p className={cn("text-2xl font-bold", critCount > 0 ? "text-destructive" : "text-success")}>{critCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Total</p>
          <p className="text-2xl font-bold text-foreground">{localAlertas.length}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1">
        {[
          { key: "todos" as const, label: "Todos" },
          { key: "aberto" as const, label: "Abertos" },
          { key: "reconhecido" as const, label: "Reconhecidos" },
          { key: "resolvido" as const, label: "Resolvidos" },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              statusFilter === f.key ? "bg-module-loja text-white" : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="space-y-2">
        {filtered.map(alert => {
          const cfg = NIVEL_CONFIG[alert.nivel];
          const tempoAberto = getTempoAberto(alert.criadoEm);
          const slaExcedido = (Date.now() - new Date(alert.criadoEm).getTime()) > alert.slaHoras * 3600000;

          return (
            <div key={alert.id} className={cn("rounded-xl border border-border bg-card p-4 transition-all", alert.status === "resolvido" && "opacity-50")}>
              <div className="flex items-start gap-3">
                <div className={cn("mt-0.5 h-3 w-3 rounded-full shrink-0", cfg.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("text-xs font-semibold", cfg.textColor)}>{cfg.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">{alert.codigo}</span>
                    {slaExcedido && alert.status === "aberto" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" /> SLA excedido
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground mt-1">{alert.titulo}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.descricao}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span>KPI: {alert.kpiNome}</span>
                    <span>Valor: {alert.valorAtual}</span>
                    <span>Limite: {alert.valorLimite}</span>
                    <span>Aberto há: {tempoAberto}</span>
                    <span>SLA: {alert.slaHoras}h</span>
                  </div>
                </div>
                {alert.status === "aberto" && (
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleAction(alert.id, "reconhecido")}>
                      <Eye className="h-3 w-3 mr-1" /> Reconhecer
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleAction(alert.id, "resolvido")}>
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Resolver
                    </Button>
                  </div>
                )}
                {alert.status === "reconhecido" && (
                  <Button size="sm" variant="outline" className="h-7 text-[10px] shrink-0" onClick={() => handleAction(alert.id, "resolvido")}>
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Resolver
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
