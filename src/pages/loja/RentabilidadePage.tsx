import { PageHeader } from "@/components/ui/page-header";
import { useStoreFormulas } from "@/hooks/loja/useStoreFormulas";
import { useStoreData } from "@/hooks/loja/useStoreData";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";

export default function RentabilidadePage() {
  const { calcReceitaM2, calcMargemM2, calcParticipacaoReceita, calcParticipacaoArea, calcIPE, calcVariacaoIPE, formatMoney, formatPercent } = useStoreFormulas();
  const { getSecoesForLoja, lojas } = useStoreData();
  const [lojaId, setLojaId] = useState("loja-a");

  const secoes = getSecoesForLoja(lojaId);
  const loja = lojas.find(l => l.id === lojaId);
  const receitaTotal = secoes.reduce((s, sec) => s + sec.receita, 0);
  const areaTotal = loja?.areaTotal ?? secoes.reduce((s, sec) => s + sec.area, 0);
  const receitaAnteriorTotal = secoes.reduce((s, sec) => s + (sec.receitaAnterior ?? 0), 0);

  const data = useMemo(() => {
    return secoes.map(sec => {
      const receitaM2 = calcReceitaM2(sec.receita, sec.area);
      const margemM2 = calcMargemM2(sec.margemBruta, sec.area);
      const pr = calcParticipacaoReceita(sec.receita, receitaTotal);
      const pa = calcParticipacaoArea(sec.area, areaTotal);
      const ipe = calcIPE(pr, pa);

      const prAnterior = sec.receitaAnterior ? calcParticipacaoReceita(sec.receitaAnterior, receitaAnteriorTotal) : null;
      const paAnterior = pa; // area doesn't change
      const ipeAnterior = calcIPE(prAnterior, paAnterior);
      const variacaoIPE = calcVariacaoIPE(ipe, ipeAnterior);

      return {
        nome: sec.nome,
        receitaM2: receitaM2 ?? 0,
        margemM2: margemM2 ?? 0,
        pr: pr ?? 0,
        pa: pa ?? 0,
        ipe: ipe ?? 0,
        variacaoIPE: variacaoIPE ?? 0,
      };
    }).sort((a, b) => b.ipe - a.ipe);
  }, [secoes, receitaTotal, areaTotal, receitaAnteriorTotal]);

  const getIPEColor = (ipe: number) => {
    if (ipe >= 1.2) return "bg-success/20 text-success";
    if (ipe >= 0.8) return "bg-warning/20 text-warning";
    return "bg-destructive/20 text-destructive";
  };

  const getIPEBarColor = (ipe: number) => {
    if (ipe >= 1.2) return "hsl(var(--success))";
    if (ipe >= 0.8) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rentabilidade por Espaço"
        description="Mapa de Calor e Índice de Performance de Espaço (IPE)"
        actions={
          <select
            value={lojaId}
            onChange={e => setLojaId(e.target.value)}
            className="text-xs bg-card border border-border rounded-lg px-3 py-1.5 text-foreground"
          >
            {lojas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
          </select>
        }
      />

      {/* Heatmap Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.map(sec => (
          <div key={sec.nome} className={cn("rounded-xl border border-border p-4 transition-colors", getIPEColor(sec.ipe))}>
            <p className="text-xs font-semibold mb-2">{sec.nome}</p>
            <p className="text-2xl font-bold">{sec.ipe.toFixed(4)}</p>
            <p className="text-[10px] mt-1">IPE</p>
            <div className="flex items-center gap-1 mt-1">
              {sec.variacaoIPE >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span className="text-[10px]">{sec.variacaoIPE > 0 ? "+" : ""}{sec.variacaoIPE}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Ranking Table */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-app-loja" />
          <h3 className="text-sm font-semibold text-foreground">Ranking de Seções</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 text-muted-foreground font-medium">#</th>
                <th className="text-left py-2 px-2 text-muted-foreground font-medium">Seção</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">R$/m²</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">Margem/m²</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">PR%</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">PA%</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">IPE</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">Δ IPE</th>
              </tr>
            </thead>
            <tbody>
              {data.map((sec, i) => (
                <tr key={sec.nome} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2 px-2 font-bold text-app-loja">{i + 1}</td>
                  <td className="py-2 px-2 font-medium text-foreground">{sec.nome}</td>
                  <td className="py-2 px-2 text-right font-mono text-foreground">{formatMoney(sec.receitaM2)}</td>
                  <td className="py-2 px-2 text-right font-mono text-foreground">{formatMoney(sec.margemM2)}</td>
                  <td className="py-2 px-2 text-right text-muted-foreground">{formatPercent(sec.pr)}</td>
                  <td className="py-2 px-2 text-right text-muted-foreground">{formatPercent(sec.pa)}</td>
                  <td className="py-2 px-2 text-right font-bold">{sec.ipe.toFixed(4)}</td>
                  <td className={cn("py-2 px-2 text-right font-medium", sec.variacaoIPE >= 0 ? "text-success" : "text-destructive")}>
                    {sec.variacaoIPE > 0 ? "+" : ""}{sec.variacaoIPE}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* IPE Chart */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">IPE por Seção</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <XAxis dataKey="nome" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} domain={[0, 'auto']} />
            <Tooltip formatter={(v: number) => v.toFixed(4)} />
            <Bar dataKey="ipe" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={getIPEBarColor(entry.ipe)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 justify-center">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-success/60" /><span className="text-[10px] text-muted-foreground">IPE ≥ 1.2</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-warning/60" /><span className="text-[10px] text-muted-foreground">0.8 – 1.2</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-destructive/60" /><span className="text-[10px] text-muted-foreground">IPE &lt; 0.8</span></div>
        </div>
      </div>
    </div>
  );
}
