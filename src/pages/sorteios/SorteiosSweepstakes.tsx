import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { PageHeader } from "@/components/ui/page-header";
import { Trophy, Plus, Eye, Copy, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface CreateForm {
  titulo: string;
  nome_empresa: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
}

const EMPTY_FORM: CreateForm = {
  titulo: "",
  nome_empresa: "",
  descricao: "",
  data_inicio: "",
  data_fim: "",
};

export default function SorteiosSweepstakes() {
  const navigate = useNavigate();
  const { data: tenantId } = useHWTenantId();
  const [sweepstakes, setSweepstakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);

  const fetchSweepstakes = async () => {
    if (!tenantId) return;
    setLoading(true);
    const { data } = await supabase
      .from("sorteios_sweepstakes")
      .select("*, sorteios_participants(nome, cpf)")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });
    setSweepstakes(data ?? []);
    setLoading(false);
  };

  useEffect(() => { if (tenantId) fetchSweepstakes(); }, [tenantId]);

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/sorteio/${slug}`);
    toast.success("Link copiado!");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    if (!form.titulo.trim() || !form.data_inicio || !form.data_fim) {
      toast.error("Preencha título e datas obrigatórios");
      return;
    }
    setCreating(true);
    const slug = form.titulo
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      + "-" + Date.now().toString(36);

    const { data, error } = await supabase
      .from("sorteios_sweepstakes")
      .insert({
        tenant_id: tenantId,
        titulo: form.titulo.trim(),
        nome_empresa: form.nome_empresa.trim() || form.titulo.trim(),
        descricao: form.descricao.trim() || null,
        data_inicio: form.data_inicio,
        data_fim: form.data_fim,
        slug,
        status: "ativo" as const,
      })
      .select()
      .single();

    setCreating(false);
    if (error) {
      toast.error("Erro ao criar sorteio: " + error.message);
      return;
    }
    toast.success("Sorteio criado com sucesso!");
    setShowCreate(false);
    setForm(EMPTY_FORM);
    fetchSweepstakes();
    if (data?.id) navigate(`/app/sorteios/campanhas/${data.id}`);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Campanhas de Sorteio"
        description="Gerencie suas promoções e sorteios"
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" /> Novo Sorteio
          </button>
        }
      />

      {/* Create Dialog */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Novo Sorteio</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-muted rounded transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Título *</label>
                <input
                  value={form.titulo}
                  onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ex: Sorteio de Natal 2025"
                  required
                  className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Nome da Empresa</label>
                <input
                  value={form.nome_empresa}
                  onChange={(e) => setForm(f => ({ ...f, nome_empresa: e.target.value }))}
                  placeholder="Razão social ou nome fantasia"
                  className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Descrição</label>
                <textarea
                  value={form.descricao}
                  onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))}
                  placeholder="Descreva brevemente o sorteio"
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Data Início *</label>
                  <input
                    type="date"
                    value={form.data_inicio}
                    onChange={(e) => setForm(f => ({ ...f, data_inicio: e.target.value }))}
                    required
                    className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Data Fim *</label>
                  <input
                    type="date"
                    value={form.data_fim}
                    onChange={(e) => setForm(f => ({ ...f, data_fim: e.target.value }))}
                    required
                    className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 h-9 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Criar Sorteio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : sweepstakes.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Trophy className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Nenhuma campanha criada</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" /> Criar primeiro sorteio
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {sweepstakes.map((sw) => (
            <div key={sw.id} className="bg-card rounded-xl p-4 border border-border flex items-center gap-4">
              {sw.logo_url && <img src={sw.logo_url} alt="" className="h-10 w-10 rounded-lg object-cover" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-foreground truncate">{sw.titulo}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    sw.status === "ativo" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  }`}>
                    {sw.status === "ativo" ? "Ativo" : "Encerrado"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {sw.nome_empresa} · {new Date(sw.data_inicio).toLocaleDateString("pt-BR")} — {new Date(sw.data_fim).toLocaleDateString("pt-BR")}
                </p>
                {sw.winner_id && sw.sorteios_participants && (
                  <p className="text-xs text-success mt-1">🎉 Vencedor: {sw.sorteios_participants.nome}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {sw.slug && (
                  <button onClick={() => copyLink(sw.slug)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Copiar link">
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
                <button onClick={() => navigate(`/app/sorteios/campanhas/${sw.id}`)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors" title="Detalhes">
                  <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
