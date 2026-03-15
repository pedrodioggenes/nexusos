import { useMemo } from "react";
import {
  Eye,
  TrendingUp,
  DollarSign,
  Megaphone,
  ClipboardList,
  Store,
  ExternalLink,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageWrapper } from "@/components/marketing/PageWrapper";
import { StatCardWithSparkline } from "@/components/marketing/StatCardWithSparkline";
import { PeriodFilter, usePeriodFilter } from "@/components/ui/period-filter";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useMarketingKPIs } from "@/hooks/useMarketingKPIs";
import { useMarketingBudgets } from "@/hooks/useMarketingBudgets";
import { useMarketingCampaigns } from "@/hooks/useMarketingCampaigns";
import { useStorePerformance } from "@/hooks/useStorePerformance";
import { useMarketingDemands } from "@/hooks/useMarketingDemands";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

/** Check if two date ranges overlap */
function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart <= bEnd && bStart <= aEnd;
}

function isWithinRange(dateStr: string | null | undefined, start: Date, end: Date) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d >= start && d <= end;
}

export default function VisaoUnificada() {
  const navigate = useNavigate();
  const { period, setPeriod, getDateRange, customRange, setCustomRange, periodLabel } = usePeriodFilter("30d");

  // Compute date range once (stable per render via period/customRange)
  const dateRange = useMemo(() => getDateRange(), [period, customRange]);

  // ---- Raw data hooks (unchanged, no new params) ----
  const { data: allKpis = [], isLoading: kpiLoading } = useMarketingKPIs("monthly");
  const { data: budget, isLoading: budgetLoading } = useMarketingBudgets();
  const { data: allCampaigns = [], isLoading: campaignLoading } = useMarketingCampaigns();
  const { data: allStores = [], isLoading: storesLoading } = useStorePerformance("monthly");
  const { data: allDemands = [], isLoading: demandsLoading } = useMarketingDemands();

  const isLoading = kpiLoading || budgetLoading || campaignLoading || storesLoading;

  // ---- Client-side filtering ----

  // KPIs: filter by period_start within range
  const filteredKpis = useMemo(
    () => allKpis.filter((k) => isWithinRange(k.period_start, dateRange.start, dateRange.end)),
    [allKpis, dateRange]
  );
  const latestKpi = filteredKpis[0] ?? null;

  // Campaigns: overlap between campaign dates and selected range
  const filteredCampaigns = useMemo(
    () =>
      allCampaigns.filter((c) => {
        // If campaign has start/end dates, check overlap
        if (c.start_date && c.end_date) {
          return rangesOverlap(dateRange.start, dateRange.end, new Date(c.start_date), new Date(c.end_date));
        }
        // Fallback: filter by created_at
        return isWithinRange(c.created_at, dateRange.start, dateRange.end);
      }),
    [allCampaigns, dateRange]
  );

  // Demands: filter by created_at
  const filteredDemands = useMemo(
    () => allDemands.filter((d) => isWithinRange(d.created_at, dateRange.start, dateRange.end)),
    [allDemands, dateRange]
  );

  // Stores: filter by period_start
  const filteredStores = useMemo(
    () => allStores.filter((s) => isWithinRange(s.period_start, dateRange.start, dateRange.end)),
    [allStores, dateRange]
  );

  // ---- Computed values ----
  const roi = latestKpi?.roi ?? 0;

  const totalBudget = budget?.total_budget ?? 0;
  const spentBudget =
    budget?.marketing_budget_categories?.reduce((sum, c) => sum + Number(c.spent_amount || 0), 0) ?? 0;
  const budgetUsedPct = totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0;

  const activeCampaigns = filteredCampaigns.filter((c) => c.status === "active").length;
  const pendingDemands = filteredDemands.filter(
    (d) => d.status === "open" || d.status === "in_progress" || d.status === "review"
  ).length;

  // Store ranking - top 7
  const topStores = [...filteredStores].sort((a, b) => (b.roi || 0) - (a.roi || 0)).slice(0, 7);

  // Budget chart data (annual, not time-filterable)
  const budgetChartData = (budget?.marketing_budget_categories ?? []).map((c) => ({
    name: c.name.length > 12 ? c.name.substring(0, 12) + "…" : c.name,
    alocado: Number(c.allocated_amount),
    gasto: Number(c.spent_amount),
  }));

  // Period display text
  const periodText = useMemo(() => {
    return `${format(dateRange.start, "dd/MM/yyyy", { locale: ptBR })} – ${format(dateRange.end, "dd/MM/yyyy", { locale: ptBR })}`;
  }, [dateRange]);

  const shortcuts = [
    { label: "KPIs", path: "/app/marketing/kpis", icon: TrendingUp },
    { label: "Lojas", path: "/app/marketing/lojas", icon: Store },
    { label: "Campanhas", path: "/app/marketing/campanhas", icon: Megaphone },
    { label: "Demandas", path: "/app/marketing/demandas", icon: ClipboardList },
    { label: "Relatórios", path: "/app/marketing/relatorios", icon: ExternalLink },
  ];

  return (
    <PageWrapper
      title="Análises — Visão Unificada"
      subtitle="Panorama integrado de todas as métricas"
      icon={<Eye className="h-5 w-5 text-module-gestao" />}
      actions={
        <PeriodFilter
          value={period}
          onChange={setPeriod}
          options={["7d", "30d", "90d", "month", "quarter", "year", "custom"]}
          customRange={customRange}
          onCustomRangeChange={setCustomRange}
        />
      }
    >
      {/* Period indicator */}
      <p className="text-[10px] text-muted-foreground -mt-2 mb-1">
        Período: {periodText}
      </p>

      {/* Top KPIs */}
      <BlurFade delay={0.05}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCardWithSparkline
            title="ROI Geral"
            value={isLoading ? "--" : `${roi.toFixed(1)}%`}
            change={filteredKpis.length > 0 ? `${filteredKpis.length} período(s)` : undefined}
            changeType="neutral"
            icon={<TrendingUp className="h-4 w-4" />}
            isLoading={kpiLoading}
            onClick={() => navigate("/app/marketing/kpis")}
          />
          <StatCardWithSparkline
            title="Budget Utilizado"
            value={isLoading ? "--" : `${budgetUsedPct.toFixed(0)}%`}
            change={totalBudget > 0 ? `${formatCurrency(spentBudget)} / ${formatCurrency(totalBudget)}` : undefined}
            changeType="neutral"
            icon={<DollarSign className="h-4 w-4" />}
            isLoading={budgetLoading}
            onClick={() => navigate("/app/marketing/financeiro")}
          />
          <StatCardWithSparkline
            title="Campanhas Ativas"
            value={isLoading ? "--" : activeCampaigns}
            change={`${filteredCampaigns.length} no período`}
            changeType="neutral"
            icon={<Megaphone className="h-4 w-4" />}
            isLoading={campaignLoading}
            onClick={() => navigate("/app/marketing/campanhas")}
          />
          <StatCardWithSparkline
            title="Demandas Pendentes"
            value={isLoading ? "--" : pendingDemands}
            change={filteredDemands.length > 0 ? `${filteredDemands.length} no período` : undefined}
            changeType={pendingDemands > 5 ? "negative" : "neutral"}
            icon={<ClipboardList className="h-4 w-4" />}
            isLoading={demandsLoading}
            onClick={() => navigate("/app/marketing/demandas")}
          />
        </div>
      </BlurFade>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Budget Distribution Chart */}
        <BlurFade delay={0.1}>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-module-gestao" />
                  Distribuição de Budget
                  <span className="text-[9px] font-normal text-muted-foreground">(anual)</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-module-gestao"
                  onClick={() => navigate("/app/marketing/financeiro")}
                >
                  Ver detalhes
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {budgetLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : budgetChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={budgetChartData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--card))",
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="alocado" fill="hsl(var(--module-gestao) / 0.3)" radius={[4, 4, 0, 0]} name="Alocado" />
                    <Bar dataKey="gasto" fill="hsl(var(--module-gestao))" radius={[4, 4, 0, 0]} name="Gasto" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                  Nenhum dado de budget disponível
                </div>
              )}
            </CardContent>
          </Card>
        </BlurFade>

        {/* Store Ranking Table */}
        <BlurFade delay={0.15}>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-module-gestao" />
                  Ranking de Lojas
                  {filteredStores.length !== allStores.length && (
                    <span className="text-[9px] font-normal text-muted-foreground">
                      ({filteredStores.length} registros)
                    </span>
                  )}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-module-gestao"
                  onClick={() => navigate("/app/marketing/lojas")}
                >
                  Ver todas
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {storesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : topStores.length > 0 ? (
                <div className="space-y-1">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-2 px-2 py-1 text-[10px] text-muted-foreground font-medium">
                    <span className="col-span-1">#</span>
                    <span className="col-span-4">Loja</span>
                    <span className="col-span-3 text-right">Receita</span>
                    <span className="col-span-2 text-right">ROI</span>
                    <span className="col-span-2 text-right">Status</span>
                  </div>
                  {topStores.map((store, index) => {
                    const storeRoi = store.roi || 0;
                    const isHigh = storeRoi >= 200;
                    const isLow = storeRoi < 100;
                    return (
                      <motion.div
                        key={store.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="grid grid-cols-12 gap-2 items-center px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer text-xs"
                        onClick={() => navigate("/app/marketing/lojas")}
                      >
                        <span className="col-span-1 font-bold text-muted-foreground">{index + 1}</span>
                        <span className="col-span-4 font-medium text-foreground truncate">
                          {store.unit?.name || "Loja"}
                        </span>
                        <span className="col-span-3 text-right font-medium">{formatCurrency(store.revenue)}</span>
                        <span
                          className={cn(
                            "col-span-2 text-right font-bold",
                            isHigh && "text-emerald-500",
                            isLow && "text-destructive",
                            !isHigh && !isLow && "text-foreground"
                          )}
                        >
                          {storeRoi.toFixed(0)}%
                        </span>
                        <span className="col-span-2 text-right">
                          {isLow ? (
                            <Badge variant="destructive" className="text-[8px] h-4 px-1">
                              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                              Baixo
                            </Badge>
                          ) : isHigh ? (
                            <Badge className="text-[8px] h-4 px-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                              Alto
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[8px] h-4 px-1">
                              OK
                            </Badge>
                          )}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                  Nenhum dado de lojas no período selecionado
                </div>
              )}
            </CardContent>
          </Card>
        </BlurFade>
      </div>

      {/* Quick Shortcuts */}
      <BlurFade delay={0.2}>
        <div className="flex flex-wrap gap-2">
          {shortcuts.map((s) => (
            <Button
              key={s.path}
              variant="outline"
              size="sm"
              className="gap-2 text-xs h-8 hover:border-module-gestao/50 hover:text-module-gestao"
              onClick={() => navigate(s.path)}
            >
              <s.icon className="h-3.5 w-3.5" />
              {s.label}
            </Button>
          ))}
        </div>
      </BlurFade>
    </PageWrapper>
  );
}
