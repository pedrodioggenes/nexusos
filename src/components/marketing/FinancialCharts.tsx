import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { FinancialSummary } from '@/hooks/useFinancialTransactions';

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--destructive))',
  'hsl(var(--warning))',
  'hsl(var(--success))',
  'hsl(var(--accent))',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#ec4899',
  '#14b8a6',
];

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, notation: 'compact' }).format(v);

interface FinancialChartsProps {
  summary: FinancialSummary | undefined;
  isLoading?: boolean;
}

export function FinancialCharts({ summary, isLoading }: FinancialChartsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Evolution chart data: pivot byCategoryMonth into { month, Cat1, Cat2, ... }
  const { evolutionData, topCategories } = useMemo(() => {
    if (!summary?.byCategoryMonth?.length) return { evolutionData: [], topCategories: [] };

    // Get top 6 cost categories by total amount
    const catTotals = new Map<string, number>();
    summary.byCategoryMonth.forEach(d => {
      catTotals.set(d.category, (catTotals.get(d.category) || 0) + d.amount);
    });
    const top = Array.from(catTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([cat]) => cat);

    // Pivot
    const monthMap = new Map<string, Record<string, number>>();
    summary.byCategoryMonth
      .filter(d => top.includes(d.category))
      .forEach(d => {
        const row = monthMap.get(d.month) || {};
        row[d.category] = (row[d.category] || 0) + d.amount;
        monthMap.set(d.month, row);
      });

    const data = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, cats]) => ({
        month: MONTH_LABELS[month.split('-')[1]] || month,
        ...cats,
      }));

    return { evolutionData: data, topCategories: top };
  }, [summary]);

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="h-[320px] animate-pulse bg-muted/20" />
        <Card className="h-[320px] animate-pulse bg-muted/20" />
      </div>
    );
  }

  const barData = summary.byMonth.map(m => ({
    month: MONTH_LABELS[m.month.split('-')[1]] || m.month,
    Receita: m.receita,
    Custo: m.custo,
  }));

  const pieData = summary.byCategory
    .filter(c => c.type === 'custo' && c.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  const drillData = selectedCategory
    ? (summary.bySubcategory || [])
        .filter(s => s.category === selectedCategory && s.amount > 0)
        .sort((a, b) => b.amount - a.amount)
    : [];

  const hasBarData = barData.length > 0;
  const hasPieData = pieData.length > 0;
  const showDrill = selectedCategory && drillData.length > 0;
  const hasEvolution = evolutionData.length > 1;

  const handlePieClick = (_: unknown, index: number) => {
    if (pieData[index]) {
      setSelectedCategory(pieData[index].category);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart - Revenue vs Costs */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receitas vs Custos</CardTitle>
          </CardHeader>
          <CardContent>
            {hasBarData ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={formatCurrency} width={60} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [formatCurrency(value)]}
                  />
                  <Bar dataKey="Receita" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Custo" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
                Sem dados para exibir
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart - Cost Distribution with Drill-down */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {showDrill ? `${selectedCategory} — Subcategorias` : 'Distribuição de Custos'}
              </CardTitle>
              {showDrill && (
                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={() => setSelectedCategory(null)}>
                  <ArrowLeft className="h-3 w-3" /> Voltar
                </Button>
              )}
            </div>
            {!showDrill && hasPieData && (
              <p className="text-[10px] text-muted-foreground mt-0.5">Clique em uma fatia para ver subcategorias</p>
            )}
          </CardHeader>
          <CardContent>
            {showDrill ? (
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {drillData.map((item, i) => {
                  const maxVal = drillData[0]?.amount || 1;
                  const pct = (item.amount / maxVal) * 100;
                  return (
                    <div key={item.subcategory} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground font-medium truncate">{item.subcategory}</span>
                        <span className="text-muted-foreground ml-2 shrink-0">{formatCurrency(item.amount)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : hasPieData ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    onClick={handlePieClick}
                    cursor="pointer"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value)]} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px' }}
                    formatter={(value: string) => <span className="text-muted-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
                Sem custos registrados
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Evolution Chart - Cost trend by category */}
      {hasEvolution && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Evolução Mensal por Categoria de Custo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={formatCurrency} width={60} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [formatCurrency(value)]}
                />
                {topCategories.map((cat, i) => (
                  <Line
                    key={cat}
                    type="monotone"
                    dataKey={cat}
                    name={cat}
                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
