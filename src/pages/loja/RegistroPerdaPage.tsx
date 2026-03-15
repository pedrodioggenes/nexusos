import { PageHeader } from "@/components/ui/page-header";
import { useStoreData } from "@/hooks/loja/useStoreData";
import { useStoreFormulas } from "@/hooks/loja/useStoreFormulas";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ClipboardList, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const TIPOS_PERDA = [
  { value: "operacional", label: "Operacional" },
  { value: "vencimento", label: "Vencimento" },
  { value: "furto_externo", label: "Furto Externo" },
  { value: "furto_interno", label: "Furto Interno" },
] as const;

export default function RegistroPerdaPage() {
  const { skus, lojas } = useStoreData();
  const { calcValorPerda, formatMoney } = useStoreFormulas();

  const [lojaId, setLojaId] = useState("loja-a");
  const [tipo, setTipo] = useState<string>("operacional");
  const [skuId, setSkuId] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const skusLoja = useMemo(() => skus.filter(s => s.lojaId === lojaId), [skus, lojaId]);
  const selectedSku = skusLoja.find(s => s.id === skuId);
  const qtd = parseFloat(quantidade) || 0;
  const valorPerda = selectedSku ? calcValorPerda(qtd, selectedSku.custoUnitario) : 0;

  const secoesUnicas = [...new Set(skusLoja.map(s => s.secao))];
  const [secao, setSecao] = useState("");
  const skusFiltrados = secao ? skusLoja.filter(s => s.secao === secao) : skusLoja;

  const handleSubmit = () => {
    if (!skuId || qtd <= 0) {
      toast.error("Preencha SKU e quantidade válida");
      return;
    }
    setSubmitted(true);
    toast.success(`Perda registrada: ${selectedSku?.nome} — ${formatMoney(valorPerda)}`);
    setTimeout(() => {
      setSkuId("");
      setQuantidade("");
      setSubmitted(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registro de Perda"
        description="Registrar perdas operacionais com cálculo automático pelo custo médio"
      />

      <div className="max-w-xl">
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="h-5 w-5 text-app-loja" />
            <h3 className="text-sm font-semibold text-foreground">Nova Perda</h3>
          </div>

          {/* Loja */}
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Loja</label>
            <select
              value={lojaId}
              onChange={e => { setLojaId(e.target.value); setSkuId(""); setSecao(""); }}
              className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            >
              {lojas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Tipo de Perda</label>
            <div className="flex gap-2 flex-wrap">
              {TIPOS_PERDA.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTipo(t.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    tipo === t.value ? "bg-app-loja text-white" : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Seção */}
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Seção</label>
            <select
              value={secao}
              onChange={e => { setSecao(e.target.value); setSkuId(""); }}
              className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            >
              <option value="">Todas as seções</option>
              {secoesUnicas.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* SKU */}
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">SKU</label>
            <select
              value={skuId}
              onChange={e => setSkuId(e.target.value)}
              className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            >
              <option value="">Selecione um SKU</option>
              {skusFiltrados.map(s => <option key={s.id} value={s.id}>{s.codigo} — {s.nome}</option>)}
            </select>
          </div>

          {/* Quantidade */}
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Quantidade</label>
            <Input
              type="number"
              min="0"
              step="0.1"
              placeholder="0"
              value={quantidade}
              onChange={e => setQuantidade(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Preview do valor */}
          {selectedSku && qtd > 0 && (
            <div className="rounded-lg bg-muted/50 p-4 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">SKU</span>
                <span className="text-foreground font-medium">{selectedSku.nome}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Custo Unitário</span>
                <span className="text-foreground font-mono">R$ {selectedSku.custoUnitario.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Quantidade</span>
                <span className="text-foreground font-mono">{qtd}</span>
              </div>
              <div className="border-t border-border mt-2 pt-2 flex justify-between text-sm">
                <span className="font-semibold text-foreground">Valor da Perda</span>
                <span className="font-bold text-destructive">{formatMoney(valorPerda)}</span>
              </div>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!skuId || qtd <= 0 || submitted}
            className="w-full bg-app-loja hover:bg-app-loja-glow text-white"
          >
            {submitted ? (
              <><CheckCircle2 className="h-4 w-4 mr-2" /> Registrado!</>
            ) : (
              <><ClipboardList className="h-4 w-4 mr-2" /> Registrar Perda</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
