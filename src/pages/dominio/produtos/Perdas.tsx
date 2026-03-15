import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { LinkToContext } from "@/components/dominio/LinkToContext";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { useLossesBySKU } from "@/hooks/useProductsData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { KPICardData } from "@/data/dominio/types";

export default function ProdutosPerdas() {
  const { filters, updateFilter } = useGlobalFilters();
  const losses = useLossesBySKU();

  const totalLosses = losses.reduce((s, l) => s + l.perdas, 0);
  const avgLossesPerSKU = losses.length > 0 ? totalLosses / losses.length : 0;
  const topLossSKU = losses.length > 0 ? losses.reduce((max, l) => l.perdas > max.perdas ? l : max) : null;

  const kpiItems: KPICardData[] = [
    { label: "Perdas Totais", value: totalLosses, formatted_value: `R$ ${(totalLosses / 1000).toFixed(0)}k`, variation_pct: -12.5, variation_type: "negative" },
    { label: "Perdas % Vendas", value: 2.3, formatted_value: "2.3%", variation_pct: -8.2, variation_type: "negative" },
    { label: "SKUs com Perdas", value: losses.length, formatted_value: losses.length.toString(), variation_pct: 0, variation_type: "neutral" },
    { label: "Maior Perda", value: topLossSKU?.perdas || 0, formatted_value: topLossSKU ? `R$ ${topLossSKU.perdas.toLocaleString()}` : "—", variation_pct: 0, variation_type: "neutral" },
  ];

  // Chart data
  const chartData = losses.map(l => ({ name: l.sku, perdas: l.perdas }));
  
  const categoryLosses = losses.reduce((acc, l) => {
    const existing = acc.find(c => c.name === l.category);
    if (existing) {
      existing.value += l.perdas;
    } else {
      acc.push({ name: l.category, value: l.perdas });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = ["hsl(var(--destructive))", "hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Perdas de Produtos</h1>
        <p className="text-muted-foreground">Análise de perdas por produto, categoria e unidade</p>
      </div>

      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} showCategory={true} />

      <KPIGrid items={kpiItems} columns={4} />

      {/* Atalho para Problemas */}
      <div className="flex gap-2">
        <LinkToContext
          label="Ver Problemas > Perdas (filtrado)"
          to="/app/dominio/problemas/perdas"
          state={{ filtered: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SKU Losses */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold mb-4">Perdas por SKU (Top 10)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value}`} />
              <Bar dataKey="perdas" fill="hsl(var(--destructive))" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Losses */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold mb-4">Perdas por Categoria</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryLosses}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: R$ ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryLosses.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `R$ ${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Losses Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Perdas (R$)</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead>Unidade</TableHead>
            <TableHead className="text-right">Recorrência</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {losses.map((loss) => (
            <TableRow key={loss.sku} className="hover:bg-muted/50">
              <TableCell className="font-mono text-xs font-semibold">{loss.sku}</TableCell>
              <TableCell className="max-w-xs truncate">{loss.name}</TableCell>
              <TableCell>{loss.category}</TableCell>
              <TableCell className="text-right font-semibold" style={{ color: "hsl(var(--destructive))" }}>R$ {loss.perdas.toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {loss.motivo}
                </Badge>
              </TableCell>
              <TableCell>{loss.unidade}</TableCell>
              <TableCell className="text-right">{loss.recorrencia}x/mês</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
