import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { PageHeader } from "@/components/ui/page-header";
import { ShieldAlert, AlertTriangle, Copy, Clock } from "lucide-react";

const fraudTypeLabels: Record<string, { label: string; icon: typeof AlertTriangle; color: string }> = {
  cpf_duplicado: { label: "CPF Duplicado", icon: Copy, color: "text-destructive" },
  cupom_invalido: { label: "Cupom Inválido", icon: AlertTriangle, color: "text-accent-foreground" },
  frequencia_anormal: { label: "Frequência Anormal", icon: Clock, color: "text-module-sorteios" },
};

export default function SorteiosFraudLogs() {
  const { data: tenantId } = useHWTenantId();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("sorteios_fraud_logs")
        .select("*, sorteios_participants(nome, cpf)")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });
      setLogs(data ?? []);
      setLoading(false);
    };
    fetchLogs();
  }, [tenantId]);

  return (
    <div className="space-y-4">
      <PageHeader title="Logs de Fraude" description="Alertas de atividades suspeitas" />

      <div className="space-y-3">
        {logs.map((log) => {
          const info = fraudTypeLabels[log.tipo] ?? { label: log.tipo, icon: AlertTriangle, color: "text-muted-foreground" };
          const Icon = info.icon;
          return (
            <div key={log.id} className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${info.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 ${info.color} font-medium`}>
                      {info.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  {log.sorteios_participants && (
                    <p className="text-xs text-foreground mt-1">
                      Participante: <span className="font-medium">{log.sorteios_participants.nome}</span> ({log.sorteios_participants.cpf})
                    </p>
                  )}
                  {log.detalhes && <p className="text-xs text-muted-foreground mt-1">{log.detalhes}</p>}
                </div>
              </div>
            </div>
          );
        })}
        {!loading && logs.length === 0 && (
          <div className="bg-card rounded-xl p-8 text-center text-muted-foreground border border-border text-xs">
            Nenhum alerta de fraude registrado
          </div>
        )}
      </div>
    </div>
  );
}
