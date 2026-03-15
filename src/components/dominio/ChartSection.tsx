import { Card } from "@/components/ui/card";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ScatterChart, Scatter, ZAxis, ReferenceLine
} from "recharts";
import type { TrendDataPoint, UnitSummary, CategorySummary, SalesByDay, SalesByHour, SalesByCategory, TicketDistribution, ItemsPerCoupon, EvolutionDriver, SalesByUnit } from "@/data/dominio/types";

const COLORS = [
  "hsl(270, 60%, 55%)", "hsl(200, 70%, 55%)", "hsl(150, 60%, 45%)",
  "hsl(40, 80%, 55%)", "hsl(350, 70%, 55%)", "hsl(180, 50%, 45%)",
  "hsl(290, 50%, 50%)", "hsl(20, 70%, 55%)"
];

interface ChartSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function ChartSection({ title, subtitle, children }: ChartSectionProps) {
  return (
    <Card className="p-4 bg-card border-border">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );
}

const currencyFormatter = (v: number) => {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
  return String(v);
};

export function TrendChart({ data, showComparison = false }: { data: TrendDataPoint[]; showComparison?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis tickFormatter={currencyFormatter} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <Tooltip formatter={(v: number) => `R$ ${currencyFormatter(v)}`} />
        <Legend />
        <Line type="monotone" dataKey="sales" name="Vendas" stroke="hsl(270, 60%, 55%)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="margin" name="Margem" stroke="hsl(150, 60%, 45%)" strokeWidth={2} dot={false} />
        {showComparison && (
          <>
            <Line type="monotone" dataKey="sales_prev" name="Vendas (ant.)" stroke="hsl(270, 60%, 55%)" strokeWidth={1} strokeDasharray="4 4" dot={false} />
            <Line type="monotone" dataKey="margin_prev" name="Margem (ant.)" stroke="hsl(150, 60%, 45%)" strokeWidth={1} strokeDasharray="4 4" dot={false} />
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function UnitRankingChart({ data }: { data: UnitSummary[] }) {
  const sorted = [...data].sort((a, b) => b.sales - a.sales);
  const chartData = sorted.map(u => ({ name: u.name, sales: u.sales }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis type="number" tickFormatter={currencyFormatter} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} stroke="hsl(var(--muted-foreground))" />
        <Tooltip formatter={(v: number) => `R$ ${currencyFormatter(v)}`} />
        <Bar dataKey="sales" fill="hsl(270, 60%, 55%)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryMixChart({ data }: { data: CategorySummary[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="sales" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={2} label={({ name, share_pct }) => `${name} ${share_pct}%`} labelLine={false}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => `R$ ${currencyFormatter(v)}`} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function SalesMarginScatter({ data }: { data: UnitSummary[] }) {
  const chartData = data.map(u => ({ name: u.name, sales: u.sales / 1000000, margin: u.margin_pct, losses: u.losses_value }));
  return (
    <ResponsiveContainer width="100%" height={250}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis type="number" dataKey="sales" name="Vendas (M)" unit="M" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis type="number" dataKey="margin" name="Margem %" unit="%" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <ZAxis type="number" dataKey="losses" range={[50, 400]} />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(v: number, name: string) => name === "Vendas (M)" ? `R$ ${v.toFixed(1)}M` : `${v.toFixed(1)}%`} />
        <Scatter data={chartData} fill="hsl(270, 60%, 55%)">
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function LossesRankingChart({ data }: { data: UnitSummary[] }) {
  const sorted = [...data].sort((a, b) => b.losses_value - a.losses_value);
  const chartData = sorted.map(u => ({ name: u.name, losses: u.losses_value }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis type="number" tickFormatter={currencyFormatter} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} stroke="hsl(var(--muted-foreground))" />
        <Tooltip formatter={(v: number) => `R$ ${currencyFormatter(v)}`} />
        <Bar dataKey="losses" fill="hsl(350, 70%, 55%)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ===== SALES CHARTS =====

export function SalesByDayChart({ data, showComparison = false }: { data: SalesByDay[]; showComparison?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis tickFormatter={currencyFormatter} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <Tooltip formatter={(v: number) => `R$ ${currencyFormatter(v)}`} />
        <Legend />
        <Line type="monotone" dataKey="sales" name="Vendas" stroke="hsl(270, 60%, 55%)" strokeWidth={2} dot={false} />
        {showComparison && (
          <Line type="monotone" dataKey="sales_prev" name="Anterior" stroke="hsl(270, 60%, 55%)" strokeWidth={1} strokeDasharray="4 4" dot={false} />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SalesByHourChart({ data }: { data: SalesByHour[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis tickFormatter={currencyFormatter} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <Tooltip formatter={(v: number) => `R$ ${currencyFormatter(v)}`} />
        <Bar dataKey="sales" fill="hsl(200, 70%, 55%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryBarChart({ data }: { data: SalesByCategory[] }) {
  const sorted = [...data].sort((a, b) => b.sales - a.sales).slice(0, 10);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={sorted} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis type="number" tickFormatter={currencyFormatter} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} stroke="hsl(var(--muted-foreground))" />
        <Tooltip formatter={(v: number) => `R$ ${currencyFormatter(v)}`} />
        <Bar dataKey="sales" fill="hsl(270, 60%, 55%)" radius={[0, 4, 4, 0]}>
          {sorted.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TicketDistributionChart({ data }: { data: TicketDistribution[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="range" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <Tooltip formatter={(v: number, name: string) => name === "count" ? `${v.toLocaleString()} cupons` : `${v}%`} />
        <Bar dataKey="count" name="Quantidade" fill="hsl(270, 60%, 55%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ItemsPerCouponChart({ data }: { data: ItemsPerCoupon[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[3.5, 5.5]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="avg_items" name="Atual" stroke="hsl(270, 60%, 55%)" strokeWidth={2} />
        <Line type="monotone" dataKey="avg_items_prev" name="Anterior" stroke="hsl(270, 60%, 55%)" strokeWidth={1} strokeDasharray="4 4" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function WaterfallChart({ data }: { data: EvolutionDriver[] }) {
  const chartData = data.map(d => ({
    name: d.name,
    delta: d.delta,
    fill: d.delta >= 0 ? "hsl(150, 60%, 45%)" : "hsl(350, 70%, 55%)",
  }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis type="number" tickFormatter={currencyFormatter} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={75} stroke="hsl(var(--muted-foreground))" />
        <Tooltip formatter={(v: number) => `R$ ${currencyFormatter(v)}`} />
        <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" />
        <Bar dataKey="delta" name="Delta" radius={[0, 4, 4, 0]}>
          {chartData.map((d, i) => (
            <Cell key={i} fill={d.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function UnitComparisonChart({ data }: { data: SalesByUnit[] }) {
  const chartData = data.map(u => ({
    name: u.unit_name,
    vendas: u.sales,
    ticket: u.ticket * 10000,
    crescimento: u.growth_pct * 100000,
  }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis tickFormatter={currencyFormatter} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <Tooltip formatter={(v: number) => `R$ ${currencyFormatter(v)}`} />
        <Legend />
        <Bar dataKey="vendas" name="Vendas" fill="hsl(270, 60%, 55%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
