import { PageHeader } from "@/components/ui/page-header";
import { useStoreData } from "@/hooks/loja/useStoreData";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Sliders, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function SetupLojaPage() {
  const { lojas, getSecoesForLoja } = useStoreData();
  const [lojaId, setLojaId] = useState("loja-a");
  const secoes = getSecoesForLoja(lojaId);
  const loja = lojas.find(l => l.id === lojaId);

  const [areas, setAreas] = useState<Record<string, number>>(() => {
    const m: Record<string, number> = {};
    secoes.forEach(s => { m[s.id] = s.area; });
    return m;
  });

  const areaTotal = Object.values(areas).reduce((s, v) => s + v, 0);

  // Markup metas
  const [markups] = useState([
    { categoria: "Hortifruti", markupMeta: 65, tolerancia: 5 },
    { categoria: "Açougue", markupMeta: 50, tolerancia: 3 },
    { categoria: "Mercearia", markupMeta: 42, tolerancia: 5 },
    { categoria: "Padaria", markupMeta: 160, tolerancia: 10 },
  ]);

  // Alert limits
  const [limites] = useState([
    { kpi: "IP%", secao: "Hortifruti", limite: 2.0, tipo: "max" },
    { kpi: "IP%", secao: "Açougue", limite: 1.5, tipo: "max" },
    { kpi: "IP%", secao: "Mercearia", limite: 1.0, tipo: "max" },
    { kpi: "IP%", secao: "Padaria", limite: 2.5, tipo: "max" },
    { kpi: "IAP", secao: "Geral", limite: 85, tipo: "min" },
  ]);

  const handleAreaChange = (secaoId: string, value: string) => {
    const num = parseFloat(value) || 0;
    setAreas(prev => ({ ...prev, [secaoId]: num }));
  };

  const handleSave = () => {
    toast.success("Configuração salva com sucesso (mock)");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Setup de Loja"
        description="Cadastro de áreas por seção, markup meta e limites de alerta"
        actions={
          <div className="flex items-center gap-2">
            <select
              value={lojaId}
              onChange={e => setLojaId(e.target.value)}
              className="text-xs bg-card border border-border rounded-lg px-3 py-1.5 text-foreground"
            >
              {lojas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
            <Button size="sm" onClick={handleSave} className="bg-app-loja hover:bg-app-loja-glow text-white">
              <Save className="h-4 w-4 mr-1" /> Salvar
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Áreas */}
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
          <div className="flex items-center gap-2 mb-3">
            <Sliders className="h-4 w-4 text-app-loja" />
            <h3 className="text-sm font-semibold text-foreground">Área por Seção (m²)</h3>
          </div>
          <div className="space-y-3">
            {secoes.map(sec => (
              <div key={sec.id} className="flex items-center gap-3">
                <span className="text-xs text-foreground w-24">{sec.nome}</span>
                <Input
                  type="number"
                  min="0"
                  value={areas[sec.id] ?? sec.area}
                  onChange={e => handleAreaChange(sec.id, e.target.value)}
                  className="text-xs flex-1"
                />
                <span className="text-[10px] text-muted-foreground w-8">m²</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 flex justify-between text-xs">
              <span className="font-medium text-foreground">Total</span>
              <span className={cn("font-mono font-bold", areaTotal !== (loja?.areaTotal ?? 0) ? "text-warning" : "text-foreground")}>{areaTotal} m²</span>
            </div>
            {loja && areaTotal !== loja.areaTotal && (
              <p className="text-[10px] text-warning">⚠ Total difere da área cadastrada ({loja.areaTotal} m²)</p>
            )}
          </div>
        </div>

        {/* Markup Meta */}
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
          <h3 className="text-sm font-semibold text-foreground mb-3">Markup Meta por Categoria</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 text-muted-foreground font-medium">Categoria</th>
                  <th className="text-right py-1.5 text-muted-foreground font-medium">Meta %</th>
                  <th className="text-right py-1.5 text-muted-foreground font-medium">Tolerância</th>
                </tr>
              </thead>
              <tbody>
                {markups.map(m => (
                  <tr key={m.categoria} className="border-b border-border/50">
                    <td className="py-1.5 text-foreground">{m.categoria}</td>
                    <td className="py-1.5 text-right font-mono text-foreground">{m.markupMeta}%</td>
                    <td className="py-1.5 text-right font-mono text-muted-foreground">±{m.tolerancia}pp</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Limites de Alerta */}
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
          <h3 className="text-sm font-semibold text-foreground mb-3">Limites de Alerta</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 text-muted-foreground font-medium">KPI</th>
                  <th className="text-left py-1.5 text-muted-foreground font-medium">Seção</th>
                  <th className="text-right py-1.5 text-muted-foreground font-medium">Limite</th>
                  <th className="text-center py-1.5 text-muted-foreground font-medium">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {limites.map((l, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1.5 text-foreground font-mono">{l.kpi}</td>
                    <td className="py-1.5 text-foreground">{l.secao}</td>
                    <td className="py-1.5 text-right font-mono text-foreground">{l.limite}</td>
                    <td className="py-1.5 text-center">
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium",
                        l.tipo === "max" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                      )}>
                        {l.tipo === "max" ? "Máx" : "Mín"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
