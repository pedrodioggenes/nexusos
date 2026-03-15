import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { PageHeader } from "@/components/ui/page-header";
import { Search } from "lucide-react";

const PAGE_SIZE = 20;

export default function SorteiosParticipants() {
  const { data: tenantId } = useHWTenantId();
  const [participants, setParticipants] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchParticipants = async () => {
    if (!tenantId) return;
    setLoading(true);
    let query = supabase
      .from("sorteios_participants")
      .select("*", { count: "exact" })
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (search.trim()) query = query.or(`nome.ilike.%${search}%,cpf.ilike.%${search}%`);
    const { data, count } = await query;
    setParticipants(data ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  };

  useEffect(() => { setPage(0); }, [search]);
  useEffect(() => { if (tenantId) fetchParticipants(); }, [search, page, tenantId]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <PageHeader title="Participantes" description={`${total} participante(s) cadastrado(s)`} />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Buscar por nome ou CPF..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs">Nome</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs">CPF</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs">WhatsApp</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs">Status</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-foreground text-xs font-medium">{p.nome}</td>
                  <td className="py-3 px-4 text-foreground text-xs">{p.cpf}</td>
                  <td className="py-3 px-4 text-foreground text-xs">{p.whatsapp}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      p.status === "ativo" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    }`}>{p.status === "ativo" ? "Ativo" : "Bloqueado"}</span>
                  </td>
                </tr>
              ))}
              {!loading && participants.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground text-xs">Nenhum participante encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-card border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors">
            Anterior
          </button>
          <span className="text-xs text-muted-foreground">Página {page + 1} de {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-card border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors">
            Próximo
          </button>
        </div>
      )}
    </div>
  );
}
