import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Award, TrendingUp, AlertTriangle, Wallet,
  Clock, Package, Phone, Mail, Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useComprasSupplierDetail,
  useComprasSupplierScores,
  useComprasPriceHistory,
  useComprasTradeAllowances,
  useComprasDivergences,
  classifySupplier,
  formatBRL,
  formatPct,
} from "@/hooks/useComprasData";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";

export default function SupplierProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: supplier, isLoading } = useComprasSupplierDetail(id!);
  const { data: scores = [] } = useComprasSupplierScores(id);
  const { data: priceHistory = [] } = useComprasPriceHistory(id);
  const { data: tradeAllowances = [] } = useComprasTradeAllowances(id);
  const { data: divergences = [] } = useComprasDivergences(id);

  const classification = classifySupplier(supplier?.composite_score ?? null);

  // Latest score for radar
  const latestScore = scores[0];
  const radarData = useMemo(() => {
    if (!latestScore) return [];
    return [
      { dim: "Preço", value: latestScore.score_preco ?? 0 },
      { dim: "OTIF", value: latestScore.score_otif ?? 0 },
      { dim: "Qualidade", value: latestScore.score_qualidade ?? 0 },
      { dim: "Responsividade", value: latestScore.score_responsividade ?? 0 },
      { dim: "Comercial", value: latestScore.score_comercial ?? 0 },
    ];
  }, [latestScore]);

  // Score evolution
  const scoreEvolution = useMemo(() => {
    return [...scores].reverse().map((s: any) => ({
      period: s.period,
      score: s.composite_score ?? 0,
    }));
  }, [scores]);

  // Price history chart
  const priceChartData = useMemo(() => {
    return priceHistory.slice(-30).map((p: any) => ({
      date: new Date(p.effective_date).toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
      price: p.unit_price,
      sku: (p as any).compras_skus?.name ?? p.sku_id,
    }));
  }, [priceHistory]);

  if (isLoading) {
    return <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Carregando...</div>;
  }

  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-muted-foreground mb-4">Fornecedor não encontrado</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{supplier.name}</h1>
            <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", classification.bgColor, classification.color)}>
              {classification.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {supplier.cnpj && `${supplier.cnpj} · `}{supplier.classification || "Sem classificação"}
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-3xl font-bold text-app-compras">{supplier.composite_score ?? "—"}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={<Clock className="h-4 w-4" />} label="Lead Time" value={supplier.lead_time_days ? `${supplier.lead_time_days} dias` : "—"} />
        <MetricCard icon={<Package className="h-4 w-4" />} label="Pedido Mínimo" value={supplier.min_order_value ? formatBRL(supplier.min_order_value) : "—"} />
        <MetricCard icon={<TrendingUp className="h-4 w-4" />} label="OTIF" value={latestScore?.score_otif ? formatPct(latestScore.score_otif) : "—"} />
        <MetricCard icon={<Wallet className="h-4 w-4" />} label="Prazo Pagto" value={supplier.payment_terms || "—"} />
      </div>

      {/* Contact info */}
      {(supplier.contact_email || supplier.contact_phone) && (
        <Card>
          <CardContent className="p-4 flex flex-wrap gap-6">
            {supplier.contact_email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{supplier.contact_email}</span>
              </div>
            )}
            {supplier.contact_phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{supplier.contact_phone}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Radar + Score Evolution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Dimensões do Score</CardTitle>
          </CardHeader>
          <CardContent>
            {radarData.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">Sem dados de avaliação</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="dim" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                   <Radar
                     name="Score"
                     dataKey="value"
                     stroke="hsl(var(--app-compras))"
                     fill="hsl(var(--app-compras))"
                     fillOpacity={0.2}
                     strokeWidth={2}
                   />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Score Evolution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Evolução do Score</CardTitle>
          </CardHeader>
          <CardContent>
            {scoreEvolution.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">Sem histórico de scores</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={scoreEvolution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                   <Line
                     type="monotone"
                     dataKey="score"
                     stroke="hsl(var(--app-compras))"
                     strokeWidth={2}
                     dot={{ fill: "hsl(var(--app-compras))", r: 4 }}
                   />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Price History */}
      {priceChartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Histórico de Preços</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={priceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Line type="monotone" dataKey="price" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Trade Allowances + Divergences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trade Allowances */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wallet className="h-4 w-4 text-app-compras" /> Verbas Comerciais
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tradeAllowances.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Nenhuma verba registrada</p>
            ) : (
              <div className="space-y-2">
                {tradeAllowances.slice(0, 5).map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{t.type} — {t.description || "Sem descrição"}</p>
                      <p className="text-[10px] text-muted-foreground">{t.status}</p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-xs font-semibold text-foreground">{formatBRL(t.forecasted_value ?? 0)}</p>
                      <p className="text-[10px] text-muted-foreground">Realizado: {formatBRL(t.realized_value ?? 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Divergences */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Divergências
            </CardTitle>
          </CardHeader>
          <CardContent>
            {divergences.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Nenhuma divergência registrada</p>
            ) : (
              <div className="space-y-2">
                {divergences.slice(0, 5).map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{d.type}: {d.description || "—"}</p>
                      <p className="text-[10px] text-muted-foreground">{d.status} · {new Date(d.created_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      {d.financial_impact != null && (
                        <p className="text-xs font-semibold text-destructive">{formatBRL(d.financial_impact)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
