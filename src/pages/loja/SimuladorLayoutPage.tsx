import { PageHeader } from "@/components/ui/page-header";
import { useStoreFormulas } from "@/hooks/loja/useStoreFormulas";
import { useStoreData } from "@/hooks/loja/useStoreData";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Move, RotateCcw, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function SimuladorLayoutPage() {
  const { calcReceitaM2, calcMargemM2, calcParticipacaoReceita, calcParticipacaoArea, calcIPE, formatMoney } = useStoreFormulas();
  const { getSecoesForLoja, lojas } = useStoreData();

  const [lojaId, setLojaId] = useState("loja-a");
  const secoes = getSecoesForLoja(lojaId);
  const loja = lojas.find(l => l.id === lojaId);

  const [simAreas, setSimAreas] = useState<Record<string, number>>(() => {
    const m: Record<string, number> = {};
    secoes.forEach(s => { m[s.id] = s.area; });
    return m;
  });

  const handleReset = () => {
    const m: Record<string, number> = {};
    secoes.forEach(s => { m[s.id] = s.area; });
    setSimAreas(m);
  };

  const simTotal = Object.values(simAreas).reduce((s, v) => s + v, 0);
  const receitaTotal = secoes.reduce((s, sec) => s + sec.receita, 0);

  const comparison = useMemo(() => {
    return secoes.map(sec => {
      const originalArea = sec.area;
      const simArea = simAreas[sec.id] ?? sec.area;

      // Original
      const origReceitaM2 = calcReceitaM2(sec.receita, originalArea) ?? 0;
      const origMargemM2 = calcMargemM2(sec.margemBruta, originalArea) ?? 0;
      const origPR = calcParticipacaoReceita(sec.receita, receitaTotal) ?? 0;
      const origPA = calcParticipacaoArea(originalArea, loja?.areaTotal ?? 1) ?? 0;
      const origIPE = calcIPE(origPR, origPA) ?? 0;

      // Simulated
      const simReceitaM2 = calcReceitaM2(sec.receita, simArea) ?? 0;
      const simMargemM2 = calcMargemM2(sec.margemBruta, simArea) ?? 0;
      const simPA = calcParticipacaoArea(simArea, simTotal || 1) ?? 0;
      const simPR = calcParticipacaoReceita(sec.receita, receitaTotal) ?? 0;
      const simIPE = calcIPE(simPR, simPA) ?? 0;

      return {
        nome: sec.nome,
        id: sec.id,
        originalArea,
        simArea,
        origReceitaM2,
        simReceitaM2,
        deltaReceitaM2: simReceitaM2 - origReceitaM2,
        origMargemM2,
        simMargemM2,
        origIPE,
        simIPE,
        deltaIPE: simIPE - origIPE,
      };
    });
  }, [secoes, simAreas, simTotal, receitaTotal, loja]);

  const handleApply = () => {
    toast.success("Layout simulado aplicado! (criaria novos registros de AreaSecao)");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Simulador de Layout"
        description="Redistribua áreas e projete novos R$/m², Margem/m² e IPE"
        actions={
          <div className="flex items-center gap-2">
            <select
              value={lojaId}
              onChange={e => setLojaId(e.target.value)}
              className="text-xs bg-card border border-border rounded-lg px-3 py-1.5 text-foreground"
            >
              {lojas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
            <Button size="sm" variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" /> Reset
            </Button>
          </div>
        }
      />

      {/* Slider inputs */}
      <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
        <div className="flex items-center gap-2 mb-3">
          <Move className="h-4 w-4 text-module-loja" />
          <h3 className="text-sm font-semibold text-foreground">Redistribuir Áreas</h3>
          <span className={cn("ml-auto text-xs font-mono", simTotal !== (loja?.areaTotal ?? 0) ? "text-warning" : "text-muted-foreground")}>
            Total: {simTotal} m² / {loja?.areaTotal ?? 0} m²
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {secoes.map(sec => (
            <div key={sec.id}>
              <label className="text-[10px] text-muted-foreground block mb-1">{sec.nome}</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={simAreas[sec.id] ?? sec.area}
                  onChange={e => setSimAreas(prev => ({ ...prev, [sec.id]: parseFloat(e.target.value) || 0 }))}
                  className="text-xs"
                />
                <span className="text-[10px] text-muted-foreground">m²</span>
              </div>
              {simAreas[sec.id] !== sec.area && (
                <p className={cn("text-[10px] mt-0.5",
                  (simAreas[sec.id] ?? 0) > sec.area ? "text-success" : "text-destructive"
                )}>
                  {(simAreas[sec.id] ?? 0) > sec.area ? "+" : ""}{((simAreas[sec.id] ?? 0) - sec.area).toFixed(0)} m²
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Seção</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Área Atual</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Área Sim.</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">R$/m² Atual</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">R$/m² Sim.</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Δ R$/m²</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">IPE Atual</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">IPE Sim.</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Δ IPE</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map(c => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-2 px-3 font-medium text-foreground">{c.nome}</td>
                  <td className="py-2 px-3 text-right font-mono text-muted-foreground">{c.originalArea}</td>
                  <td className="py-2 px-3 text-right font-mono text-foreground">{c.simArea}</td>
                  <td className="py-2 px-3 text-right font-mono text-muted-foreground">{formatMoney(c.origReceitaM2)}</td>
                  <td className="py-2 px-3 text-right font-mono text-foreground">{formatMoney(c.simReceitaM2)}</td>
                  <td className={cn("py-2 px-3 text-right font-mono font-medium", c.deltaReceitaM2 >= 0 ? "text-success" : "text-destructive")}>
                    {c.deltaReceitaM2 >= 0 ? "+" : ""}{formatMoney(c.deltaReceitaM2)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-muted-foreground">{c.origIPE.toFixed(4)}</td>
                  <td className="py-2 px-3 text-right font-mono text-foreground">{c.simIPE.toFixed(4)}</td>
                  <td className={cn("py-2 px-3 text-right font-mono font-medium", c.deltaIPE >= 0 ? "text-success" : "text-destructive")}>
                    {c.deltaIPE >= 0 ? "+" : ""}{c.deltaIPE.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleApply} className="bg-module-loja hover:bg-module-loja-glow text-white">
          <Play className="h-4 w-4 mr-2" /> Aplicar Layout Simulado
        </Button>
      </div>
    </div>
  );
}
