import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Percent,
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  PiggyBank,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { PageWrapper } from "@/components/marketing/PageWrapper";
import { PeriodFilter, usePeriodFilter } from "@/components/ui/period-filter";
import { BlurFade } from "@/components/ui/blur-fade";
import { useMarketingBudgets } from "@/hooks/useMarketingBudgets";
import { useFinancialTransactions } from "@/hooks/useFinancialTransactions";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

type BudgetStatus = "ok" | "atencao" | "estourado";

function getStatus(percentUsed: number): BudgetStatus {
  if (percentUsed > 100) return "estourado";
  if (percentUsed >= 80) return "atencao";
  return "ok";
}

const STATUS_CONFIG: Record<BudgetStatus, { label: string; color: string; badgeVariant: "default" | "secondary" | "destructive" }> = {
  ok: { label: "OK", color: "text-emerald-500", badgeVariant: "default" },
  atencao: { label: "Atenção", color: "text-amber-500", badgeVariant: "secondary" },
  estourado: { label: "Estourado", color: "text-destructive", badgeVariant: "destructive" },
};

export default function OrcamentoFinanceiro() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const { period, setPeriod, getDateRange, customRange, setCustomRange } = usePeriodFilter("year");

  const dateRange = getDateRange();
  const dateFrom = dateRange.start.toISOString().slice(0, 10);
  const dateTo = dateRange.end.toISOString().slice(0, 10);

  const { data: budget, isLoading: loadingBudget } = useMarketingBudgets(currentYear);
  const { data: transactions = [], isLoading: loadingTx } = useFinancialTransactions({
    dateFrom,
    dateTo,
    type: "custo",
  });

  const isLoading = loadingBudget || loadingTx;

  // Aggregate spending by category
  const spendByCategory = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.status !== "cancelado")
      .forEach((t) => {
        map.set(t.category, (map.get(t.category) || 0) + Number(t.amount));
      });
    return map;
  }, [transactions]);

  const totalSpent = useMemo(
    () => transactions.filter((t) => t.status !== "cancelado").reduce((s, t) => s + Number(t.amount), 0),
    [transactions]
  );

  const totalBudget = budget?.total_budget ?? 0;
  const saldo = totalBudget - totalSpent;
  const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const overallStatus = getStatus(percentUsed);

  // Category rows
  const categoryRows = useMemo(() => {
    const categories = budget?.marketing_budget_categories ?? [];
    if (categories.length === 0 && spendByCategory.size === 0) return [];

    const rows = new Map<string, { allocated: number; spent: number }>();

    // Start with budget categories
    categories.forEach((c) => {
      rows.set(c.name, { allocated: c.allocated_amount, spent: spendByCategory.get(c.name) || 0 });
    });

    // Add any spend categories not in budget
    spendByCategory.forEach((amount, cat) => {
      if (!rows.has(cat)) {
        rows.set(cat, { allocated: 0, spent: amount });
      }
    });

    return Array.from(rows.entries())
      .map(([category, { allocated, spent }]) => {
        const pctUsed = allocated > 0 ? (spent / allocated) * 100 : spent > 0 ? 999 : 0;
        return {
          category,
          allocated,
          spent,
          saldo: allocated - spent,
          pctUsed,
          status: getStatus(pctUsed),
        };
      })
      .sort((a, b) => b.spent - a.spent);
  }, [budget, spendByCategory]);

  // Chart data — spending by month
  const chartData = useMemo(() => {
    const monthMap = new Map<string, { previsto: number; gasto: number }>();
    const categories = budget?.marketing_budget_categories ?? [];
    const monthlyAllocated = totalBudget > 0 ? totalBudget / 12 : 0;

    transactions
      .filter((t) => t.status !== "cancelado")
      .forEach((t) => {
        const month = t.date.substring(0, 7);
        const existing = monthMap.get(month) || { previsto: monthlyAllocated, gasto: 0 };
        existing.gasto += Number(t.amount);
        if (!monthMap.has(month)) existing.previsto = monthlyAllocated;
        monthMap.set(month, existing);
      });

    // Ensure all months in range are present
    const startMonth = new Date(dateFrom);
    const endMonth = new Date(dateTo);
    const cursor = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1);
    while (cursor <= endMonth) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap.has(key)) {
        monthMap.set(key, { previsto: monthlyAllocated, gasto: 0 });
      }
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => ({
        name: MONTH_LABELS[parseInt(key.split("-")[1]) - 1] || key,
        Previsto: Math.round(val.previsto),
        Gasto: Math.round(val.gasto),
      }));
  }, [transactions, totalBudget, dateFrom, dateTo]);

  const hasBudget = !!budget && totalBudget > 0;

  // Empty state
  if (!isLoading && !hasBudget) {
    return (
      <PageWrapper title="Orçamento" subtitle="Planejado vs realizado do departamento de marketing">
        <BlurFade delay={0.1}>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="rounded-2xl bg-muted/50 p-6 mb-4">
              <PiggyBank className="h-14 w-14 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Nenhum orçamento cadastrado</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              Cadastre o orçamento anual do marketing para acompanhar o planejado vs realizado por categoria.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/app/marketing/financeiro")}
            >
              <CircleDollarSign className="h-4 w-4 mr-2" />
              Ir para Movimentações
            </Button>
          </div>
        </BlurFade>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Orçamento"
      subtitle="Planejado vs realizado do departamento de marketing"
      actions={
        <PeriodFilter
          value={period}
          onChange={setPeriod}
          options={["month", "quarter", "semester", "year", "custom"]}
          customRange={customRange}
          onCustomRangeChange={setCustomRange}
        />
      }
    >
      {/* KPIs */}
      <BlurFade delay={0.05}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          ) : (
            <>
              <KpiCard
                label="Orçamento do período"
                value={formatCurrency(totalBudget)}
                icon={<Wallet className="h-4 w-4 text-module-gestao" />}
              />
              <KpiCard
                label="Gasto do período"
                value={formatCurrency(totalSpent)}
                icon={<TrendingDown className="h-4 w-4 text-destructive" />}
                accent={totalSpent > totalBudget ? "destructive" : undefined}
              />
              <KpiCard
                label="Saldo disponível"
                value={formatCurrency(saldo)}
                icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
                accent={saldo < 0 ? "destructive" : undefined}
              />
              <KpiCard
                label="% Consumido"
                value={formatPercent(percentUsed)}
                icon={<Percent className="h-4 w-4 text-muted-foreground" />}
                progress={Math.min(percentUsed, 100)}
                status={overallStatus}
              />
            </>
          )}
        </div>
      </BlurFade>

      {/* Chart */}
      <BlurFade delay={0.1}>
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Previsto vs Gasto por Mês</h3>
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
              Sem dados para o período selecionado
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <div className="min-w-[400px]">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      className="fill-muted-foreground"
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <RechartsTooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--card))",
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Previsto" fill="hsl(var(--muted-foreground) / 0.25)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Gasto" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={
                            entry.Gasto > entry.Previsto
                              ? "hsl(var(--destructive))"
                              : "hsl(var(--module-gestao))"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </BlurFade>

      {/* Category Table */}
      <BlurFade delay={0.15}>
        <div className="rounded-xl border bg-card">
          <div className="p-4 border-b">
            <h3 className="text-sm font-semibold text-foreground">Orçamento por Categoria</h3>
          </div>
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : categoryRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <p className="text-sm text-muted-foreground">
                Nenhuma categoria de orçamento configurada ainda.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-[11px] uppercase tracking-wider">
                    <th className="text-left px-4 py-2.5 font-medium">Categoria</th>
                    <th className="text-right px-4 py-2.5 font-medium">Previsto</th>
                    <th className="text-right px-4 py-2.5 font-medium">Gasto</th>
                    <th className="text-right px-4 py-2.5 font-medium">Saldo</th>
                    <th className="text-right px-4 py-2.5 font-medium">% Usado</th>
                    <th className="text-center px-4 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryRows.map((row) => {
                    const cfg = STATUS_CONFIG[row.status];
                    return (
                      <tr key={row.category} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{row.category}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                          {formatCurrency(row.allocated)}
                        </td>
                        <td className={cn("px-4 py-3 text-right tabular-nums", row.status === "estourado" && "text-destructive font-medium")}>
                          {formatCurrency(row.spent)}
                        </td>
                        <td className={cn("px-4 py-3 text-right tabular-nums", row.saldo < 0 ? "text-destructive" : "text-emerald-600")}>
                          {formatCurrency(row.saldo)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {row.allocated > 0 ? formatPercent(row.pctUsed) : "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            variant={cfg.badgeVariant}
                            className={cn(
                              "text-[10px] px-2",
                              row.status === "ok" && "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20",
                              row.status === "atencao" && "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                            )}
                          >
                            {row.status === "atencao" && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {row.status === "estourado" && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {row.status === "ok" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {cfg.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Footer totals */}
                <tfoot>
                  <tr className="bg-muted/30 font-semibold text-foreground">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(totalBudget)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(totalSpent)}</td>
                    <td className={cn("px-4 py-3 text-right tabular-nums", saldo < 0 ? "text-destructive" : "text-emerald-600")}>
                      {formatCurrency(saldo)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatPercent(percentUsed)}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={STATUS_CONFIG[overallStatus].badgeVariant}
                        className={cn(
                          "text-[10px] px-2",
                          overallStatus === "ok" && "bg-emerald-500/10 text-emerald-600",
                          overallStatus === "atencao" && "bg-amber-500/10 text-amber-600"
                        )}
                      >
                        {STATUS_CONFIG[overallStatus].label}
                      </Badge>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </BlurFade>
    </PageWrapper>
  );
}

/* ─── KPI Card ──────────────────────────────────────────── */

function KpiCard({
  label,
  value,
  icon,
  accent,
  progress,
  status,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: "destructive";
  progress?: number;
  status?: BudgetStatus;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
        {icon}
      </div>
      <span
        className={cn(
          "text-xl lg:text-2xl font-bold tabular-nums",
          accent === "destructive" ? "text-destructive" : "text-foreground"
        )}
      >
        {value}
      </span>
      {progress !== undefined && (
        <div className="space-y-1">
          <Progress
            value={progress}
            className={cn(
              "h-1.5",
              status === "estourado" && "[&>div]:bg-destructive",
              status === "atencao" && "[&>div]:bg-amber-500",
              status === "ok" && "[&>div]:bg-emerald-500"
            )}
          />
        </div>
      )}
    </div>
  );
}
