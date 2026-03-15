import { PageHeader } from "@/components/ui/page-header";
import { useStoreData } from "@/hooks/loja/useStoreData";
import { useStoreFormulas } from "@/hooks/loja/useStoreFormulas";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { FileText, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function HistoricoPrecoPage() {
  const { historicoPrecos, skus } = useStoreData();
  const { calcMarkupReal, formatPercent } = useStoreFormulas();
  const [selectedSku, setSelectedSku] = useState<string | null>(null);

  const uniqueSkus = useMemo(() => {
    const ids = [...new Set(historicoPrecos.map(h => h.skuId))];
    return ids.map(id => ({
      id,
      nome: historicoPrecos.find(h => h.skuId === id)?.skuNome ?? id,
    }));
  }, [historicoPrecos]);

  const filteredHistory = useMemo(() => {
    const items = selectedSku ? historicoPrecos.filter(h => h.skuId === selectedSku) : historicoPrecos;
    return items.sort((a, b) => new Date(b.dataAlteracao).getTime() - new Date(a.dataAlteracao).getTime());
  }, [historicoPrecos, selectedSku]);

  const chartData = useMemo(() => {
    if (!selectedSku) return [];
    return historicoPrecos
      .filter(h => h.skuId === selectedSku)
      .sort((a, b) => new Date(a.dataAlteracao).getTime() - new Date(b.dataAlteracao).getTime())
      .flatMap(h => [
        { data: h.dataAlteracao, pv: h.precoAnterior, custo: h.custoVigente },
        { data: h.dataAlteracao + " (novo)", pv: h.precoNovo, custo: h.custoVigente },
      ]);
  }, [historicoPrecos, selectedSku]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Histórico de Preço por SKU"
        description="Timeline imutável de alterações de preço com markup resultante"
        actions={
          <select
            value={selectedSku ?? ""}
            onChange={e => setSelectedSku(e.target.value || null)}
            className="text-xs bg-card border border-border rounded-lg px-3 py-1.5 text-foreground"
          >
            <option value="">Todos os SKUs</option>
            {uniqueSkus.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        }
      />

      {/* Chart */}
      {selectedSku && chartData.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Evolução PV vs Custo</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="data" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} />
              <Line type="monotone" dataKey="pv" stroke="hsl(var(--module-loja))" strokeWidth={2} name="Preço Venda" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="custo" stroke="hsl(var(--destructive))" strokeWidth={2} name="Custo" dot={{ r: 4 }} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Timeline Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Data</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">SKU</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">PV Anterior</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">PV Novo</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Custo</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">MK Anterior</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">MK Novo</th>
                <th className="text-center py-2 px-3 text-muted-foreground font-medium">Δ</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map(h => {
                const mkAnterior = calcMarkupReal(h.precoAnterior, h.custoVigente);
                const mkNovo = calcMarkupReal(h.precoNovo, h.custoVigente);
                const subiu = h.precoNovo > h.precoAnterior;
                const isPAC = h.precoNovo < h.custoVigente;

                return (
                  <tr key={h.id} className={cn("border-b border-border/50 hover:bg-muted/20 transition-colors", isPAC && "bg-destructive/5")}>
                    <td className="py-2 px-3 text-muted-foreground">{new Date(h.dataAlteracao).toLocaleDateString("pt-BR")}</td>
                    <td className="py-2 px-3 font-medium text-foreground">{h.skuNome}</td>
                    <td className="py-2 px-3 text-right font-mono">R$ {h.precoAnterior.toFixed(2)}</td>
                    <td className={cn("py-2 px-3 text-right font-mono font-medium", isPAC ? "text-destructive" : "text-foreground")}>R$ {h.precoNovo.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-mono text-muted-foreground">R$ {h.custoVigente.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-mono text-muted-foreground">{formatPercent(mkAnterior)}</td>
                    <td className={cn("py-2 px-3 text-right font-mono", mkNovo !== null && mkNovo < 0 ? "text-destructive" : "text-foreground")}>{formatPercent(mkNovo)}</td>
                    <td className="py-2 px-3 text-center">
                      {subiu ? (
                        <ArrowUpRight className="h-4 w-4 text-success inline" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-destructive inline" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
