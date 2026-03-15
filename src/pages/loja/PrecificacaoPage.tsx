import { PageHeader } from "@/components/ui/page-header";
import { useStoreFormulas } from "@/hooks/loja/useStoreFormulas";
import { useStoreData } from "@/hooks/loja/useStoreData";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { DollarSign, AlertTriangle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function PrecificacaoPage() {
  const { calcMarkupReal, calcMargemReal, calcDesvioMarkup, calcIAP, formatPercent } = useStoreFormulas();
  const { getSKUsForLoja, lojas } = useStoreData();
  const [lojaId, setLojaId] = useState("loja-a");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"todos" | "pac" | "desvio">("todos");

  const skus = getSKUsForLoja(lojaId);

  const skuData = useMemo(() => {
    return skus.map(sku => {
      const markupReal = calcMarkupReal(sku.precoVenda, sku.custoUnitario);
      const margemReal = calcMargemReal(sku.precoVenda, sku.custoUnitario);
      const desvio = calcDesvioMarkup(markupReal, sku.markupMeta);
      const isPAC = sku.precoVenda < sku.custoUnitario;
      const aderente = markupReal !== null && Math.abs(markupReal - sku.markupMeta) <= sku.tolerancia;

      return { ...sku, markupReal, margemReal, desvio, isPAC, aderente };
    });
  }, [skus]);

  const filtered = useMemo(() => {
    let items = skuData;
    if (filter === "pac") items = items.filter(s => s.isPAC);
    if (filter === "desvio") items = items.filter(s => !s.aderente);
    if (search) items = items.filter(s => s.nome.toLowerCase().includes(search.toLowerCase()) || s.codigo.toLowerCase().includes(search.toLowerCase()));
    return items;
  }, [skuData, filter, search]);

  const iap = useMemo(() => {
    const aderentes = skuData.filter(s => s.aderente).length;
    return calcIAP(aderentes, skuData.length);
  }, [skuData]);

  const pacCount = skuData.filter(s => s.isPAC).length;

  const getIAPColor = (v: number | null) => {
    if (v === null) return "text-muted-foreground";
    if (v >= 85) return "text-success";
    if (v >= 75) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel de Precificação"
        description="Markup, IAP e SKUs com preço abaixo do custo (PAC)"
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

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">IAP (Aderência)</p>
          <p className={cn("text-2xl font-bold", getIAPColor(iap))}>{formatPercent(iap)}</p>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", iap !== null && iap >= 85 ? "bg-success" : iap !== null && iap >= 75 ? "bg-warning" : "bg-destructive")}
              style={{ width: `${iap ?? 0}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">SKUs PAC</p>
          <p className={cn("text-2xl font-bold", pacCount > 0 ? "text-destructive" : "text-success")}>{pacCount}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Preço abaixo do custo</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Total SKUs</p>
          <p className="text-2xl font-bold text-foreground">{skuData.length}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Monitorados</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar SKU por nome ou código..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        <div className="flex gap-1">
          {[
            { key: "todos" as const, label: "Todos" },
            { key: "pac" as const, label: "PAC" },
            { key: "desvio" as const, label: "Desvio" },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                filter === f.key ? "bg-app-loja text-white" : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* SKU Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Código</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">SKU</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Seção</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Custo</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">PV</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">MK Real</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">MK Meta</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Desvio</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Margem</th>
                <th className="text-center py-2 px-3 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(sku => (
                <tr key={sku.id} className={cn("border-b border-border/50 hover:bg-muted/20 transition-colors", sku.isPAC && "bg-destructive/5")}>
                  <td className="py-2 px-3 font-mono text-muted-foreground">{sku.codigo}</td>
                  <td className="py-2 px-3 font-medium text-foreground">{sku.nome}</td>
                  <td className="py-2 px-3 text-muted-foreground">{sku.secao}</td>
                  <td className="py-2 px-3 text-right font-mono">R$ {sku.custoUnitario.toFixed(2)}</td>
                  <td className={cn("py-2 px-3 text-right font-mono", sku.isPAC && "text-destructive font-bold")}>R$ {sku.precoVenda.toFixed(2)}</td>
                  <td className={cn("py-2 px-3 text-right font-mono font-medium", sku.markupReal !== null && sku.markupReal < 0 ? "text-destructive" : "text-foreground")}>
                    {formatPercent(sku.markupReal)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-muted-foreground">{sku.markupMeta}%</td>
                  <td className={cn("py-2 px-3 text-right font-mono", sku.desvio !== null && Math.abs(sku.desvio) > sku.tolerancia ? "text-destructive" : "text-muted-foreground")}>
                    {sku.desvio !== null ? `${sku.desvio > 0 ? "+" : ""}${sku.desvio.toFixed(1)}pp` : "—"}
                  </td>
                  <td className={cn("py-2 px-3 text-right font-mono", sku.margemReal !== null && sku.margemReal < 0 ? "text-destructive" : "text-foreground")}>
                    {formatPercent(sku.margemReal)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {sku.isPAC ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-destructive/10 text-destructive">
                        <AlertTriangle className="h-3 w-3" /> PAC
                      </span>
                    ) : sku.aderente ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-success/10 text-success">OK</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-warning/10 text-warning">Desvio</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
