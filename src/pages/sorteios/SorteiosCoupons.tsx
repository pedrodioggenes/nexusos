import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { CheckCircle2, XCircle, ShieldAlert, Search } from "lucide-react";
import { toast } from "sonner";

export default function SorteiosCoupons() {
  const { data: tenantId } = useHWTenantId();
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCoupons = async () => {
    if (!tenantId) return;
    setLoading(true);
    let query = supabase
      .from("sorteios_coupons")
      .select("*, sorteios_participants(nome, cpf)")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });
    if (statusFilter !== "all") query = query.eq("status", statusFilter as "pendente" | "validado" | "rejeitado" | "fraudulento");
    if (search.trim()) query = query.ilike("cupom_numero", `%${search}%`);
    const { data } = await query;
    setCoupons(data ?? []);
    setLoading(false);
  };

  useEffect(() => { if (tenantId) fetchCoupons(); }, [statusFilter, search, tenantId]);

  const updateStatus = async (id: string, status: "pendente" | "validado" | "rejeitado" | "fraudulento") => {
    const { error } = await supabase.from("sorteios_coupons")
      .update({ status, validated_at: new Date().toISOString(), validated_by: user?.id })
      .eq("id", id);
    if (error) { toast.error("Erro ao atualizar"); return; }
    toast.success(`Cupom ${status}`);
    fetchCoupons();
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Cupons" description="Validação e gestão de cupons fiscais" />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar por número..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg bg-card border border-border text-foreground text-sm outline-none">
          <option value="all">Todos</option>
          <option value="pendente">Pendentes</option>
          <option value="validado">Validados</option>
          <option value="rejeitado">Rejeitados</option>
          <option value="fraudulento">Fraudulentos</option>
        </select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs">Cupom</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs">Participante</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs">Valor</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs">Status</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs">Data</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium text-xs">Ações</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-foreground font-mono text-xs">{c.cupom_numero?.length > 20 ? `${c.cupom_numero.slice(0,10)}...${c.cupom_numero.slice(-10)}` : c.cupom_numero}</td>
                  <td className="py-3 px-4 text-foreground text-xs">{c.sorteios_participants?.nome ?? "—"}</td>
                  <td className="py-3 px-4 text-foreground text-xs">{c.valor_compra ? `R$ ${Number(c.valor_compra).toFixed(2)}` : "—"}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      c.status === "validado" ? "bg-success/10 text-success" :
                      c.status === "rejeitado" ? "bg-muted text-muted-foreground" :
                      c.status === "fraudulento" ? "bg-destructive/10 text-destructive" :
                      "bg-accent/10 text-accent-foreground"
                    }`}>{c.status}</span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">{new Date(c.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="py-3 px-4 text-right">
                    {c.status === "pendente" && (
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => updateStatus(c.id, "validado")} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-success/10 text-success hover:bg-success/20 font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Validar
                        </button>
                        <button onClick={() => updateStatus(c.id, "rejeitado")} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-muted text-muted-foreground hover:bg-muted/80 font-medium">
                          <XCircle className="w-3 h-3" /> Rejeitar
                        </button>
                        <button onClick={() => updateStatus(c.id, "fraudulento")} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 font-medium">
                          <ShieldAlert className="w-3 h-3" /> Fraude
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && coupons.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-muted-foreground text-xs">Nenhum cupom encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
