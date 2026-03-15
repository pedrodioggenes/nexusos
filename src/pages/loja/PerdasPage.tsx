import { PageHeader } from "@/components/ui/page-header";
import { useStoreFormulas } from "@/hooks/loja/useStoreFormulas";
import { useStoreData } from "@/hooks/loja/useStoreData";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from "recharts";

const TIPO_COLORS: Record<string, string> = {
  operacional: "hsl(var(--warning))",
  vencimento: "hsl(var(--destructive))",
  furto_externo: "hsl(var(--muted-foreground))",
  furto_interno: "hsl(var(--accent-foreground))",
};

const TIPO_LABELS: Record<string, string> = {
  operacional: "Operacional",
  vencimento: "Vencimento",
  furto_externo: "Furto Ext.",
  furto_interno: "Furto Int.",
};

export default function PerdasPage() {
  const { calcIP, calcParticipacaoTipo, formatPercent, formatMoney } = useStoreFormulas();
  const { getSecoesForLoja, getPerdasForLoja, getReceitaTotalLoja, evolucaoPerdas, lojas } = useStoreData();
  const [lojaId, setLojaId] = useState("loja-a");

  const secoes = getSecoesForLoja(lojaId);
  const perdas = getPerdasForLoja(lojaId);
  const receitaTotal = getReceitaTotalLoja(lojaId);
  const perdaTotal = perdas.reduce((s, p) => s + p.valorPerda, 0);

  // IP% por seção
  const ipPorSecao = useMemo(() => {
    return secoes.map(sec => {
      const perdaSecao = perdas.filter(p => p.secao === sec.nome).reduce((s, p) => s + p.valorPerda, 0);
      const ip = calcIP(perdaSecao, sec.receita);
      return { nome: sec.nome, ip: ip ?? 0, perda: perdaSecao };
    }).sort((a, b) => b.ip - a.ip);
  }, [secoes, perdas]);

  // Composição por tipo
  const composicaoTipo = useMemo(() => {
    const tipos = ["operacional", "vencimento", "furto_externo", "furto_interno"] as const;
    return tipos.map(t => {
      const total = perdas.filter(p => p.tipo === t).reduce((s, p) => s + p.valorPerda, 0);
      return { tipo: TIPO_LABELS[t], valor: total, pct: calcParticipacaoTipo(total, perdaTotal) ?? 0, fill: TIPO_COLORS[t] };
    });
  }, [perdas, perdaTotal]);

  // Top SKUs
  const topSkusPorPerda = useMemo(() => {
    const grouped: Record<string, { nome: string; total: number }> = {};
    perdas.forEach(p => {
      if (!grouped[p.skuId]) grouped[p.skuId] = { nome: p.skuNome, total: 0 };
      grouped[p.skuId].total += p.valorPerda;
    });
    return Object.entries(grouped)
      .map(([id, data]) => ({ skuId: id, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [perdas]);

  const ipTotal = calcIP(perdaTotal, receitaTotal);

  const getIPColor = (ip: number) => {
    if (ip <= 1.5) return "text-success";
    if (ip <= 2.5) return "text-warning";
    return "text-destructive";
  };

  // Evolução semanal chart data
  const evolucaoData = useMemo(() => {
    return evolucaoPerdas.map(e => ({
      ...e,
      total: e.operacional + e.vencimento + e.furto_externo + e.furto_interno,
    }));
  }, [evolucaoPerdas]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel de Perdas"
        description="IP%, composição por tipo e análise por SKU"
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
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">IP% Geral</p>
          <p className={cn("text-2xl font-bold", getIPColor(ipTotal ?? 0))}>{formatPercent(ipTotal)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">da receita bruta</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Total Perdas</p>
          <p className="text-2xl font-bold text-destructive">{formatMoney(perdaTotal)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">período atual</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Registros</p>
          <p className="text-2xl font-bold text-foreground">{perdas.length}</p>
          <p className="text-[10px] text-muted-foreground mt-1">ocorrências</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IP% por seção */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">IP% por Seção</h3>
          <div className="space-y-2">
            {ipPorSecao.map(sec => (
              <div key={sec.nome} className="flex items-center gap-3">
                <span className="text-xs text-foreground w-20 shrink-0">{sec.nome}</span>
                <div className="flex-1 h-5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", sec.ip <= 1.5 ? "bg-success" : sec.ip <= 2.5 ? "bg-warning" : "bg-destructive")}
                    style={{ width: `${Math.min(sec.ip * 20, 100)}%` }}
                  />
                </div>
                <span className={cn("text-xs font-mono font-medium w-12 text-right", getIPColor(sec.ip))}>{sec.ip.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Composição por tipo */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Composição por Tipo</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={composicaoTipo} dataKey="valor" nameKey="tipo" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {composicaoTipo.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Evolução Semanal */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Evolução Semanal de Perdas (12 semanas)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={evolucaoData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
            <XAxis dataKey="semana" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} />
            <Bar dataKey="operacional" stackId="a" fill={TIPO_COLORS.operacional} name="Operacional" />
            <Bar dataKey="vencimento" stackId="a" fill={TIPO_COLORS.vencimento} name="Vencimento" />
            <Bar dataKey="furto_externo" stackId="a" fill={TIPO_COLORS.furto_externo} name="Furto Ext." />
            <Bar dataKey="furto_interno" stackId="a" fill={TIPO_COLORS.furto_interno} name="Furto Int." radius={[4, 4, 0, 0]} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top SKUs */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Top 5 SKUs por Perda</h3>
        <div className="space-y-2">
          {topSkusPorPerda.map((s, i) => (
            <div key={s.skuId} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
              <span className="text-sm font-bold text-app-loja w-6">#{i + 1}</span>
              <span className="text-xs text-foreground flex-1">{s.nome}</span>
              <span className="text-xs font-mono text-destructive font-medium">{formatMoney(s.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
