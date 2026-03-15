import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  FileBarChart,
  PieChart as PieChartIcon,
  TrendingUp,
  ListOrdered,
  Table2,
  Download,
  FileText,
  Receipt,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { PageWrapper } from "@/components/marketing/PageWrapper";
import { PeriodFilter, usePeriodFilter } from "@/components/ui/period-filter";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useFinancialTransactions, useFinancialSummary, type FinancialTransaction } from "@/hooks/useFinancialTransactions";
import { useMarketingBudgets } from "@/hooks/useMarketingBudgets";
import { exportToCSV } from "@/lib/csv-export";
import {
  generateAndDownloadPDF,
  FinancialReportDocument,
  ResumoMensalDocument,
  CustosCategoriaDocument,
  GastoOrcamentoDocument,
  TopCustosDocument,
  LancamentosDocument,
} from "@/lib/pdf";
import type { FinancialReportData } from "@/lib/pdf";
import { toast } from "sonner";

/* ─── Helpers ────────────────────────────────────────── */

function fmtCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
}

const PIE_COLORS = [
  "hsl(var(--module-gestao))",
  "hsl(var(--primary))",
  "hsl(210 70% 55%)",
  "hsl(260 60% 55%)",
  "hsl(340 65% 55%)",
  "hsl(30 80% 55%)",
  "hsl(170 60% 45%)",
  "hsl(50 80% 50%)",
];

/* ─── Report Definitions ─────────────────────────────── */

interface ReportDef {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const REPORTS: ReportDef[] = [
  { id: "resumo", title: "Resumo Mensal", description: "Receitas, custos e saldo consolidados por mês", icon: <FileBarChart className="h-5 w-5" /> },
  { id: "categorias", title: "Custos por Categoria", description: "Distribuição de gastos por categoria", icon: <PieChartIcon className="h-5 w-5" /> },
  { id: "evolucao", title: "Gasto vs Orçamento", description: "Evolução do gasto acumulado vs orçamento planejado", icon: <TrendingUp className="h-5 w-5" /> },
  { id: "top-custos", title: "Top Custos do Período", description: "Maiores lançamentos de custo ordenados por valor", icon: <ListOrdered className="h-5 w-5" /> },
  { id: "detalhado", title: "Lançamentos Detalhados", description: "Tabela completa de todos os lançamentos com filtros", icon: <Table2 className="h-5 w-5" /> },
];

/* ─── Component ──────────────────────────────────────── */

export default function RelatoriosFinanceiros() {
  const { period, setPeriod, getDateRange, customRange, setCustomRange } = usePeriodFilter("year");
  const [openReport, setOpenReport] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const dateRange = getDateRange();
  const dateFrom = dateRange.start.toISOString().slice(0, 10);
  const dateTo = dateRange.end.toISOString().slice(0, 10);

  const { data: transactions = [], isLoading } = useFinancialTransactions({ dateFrom, dateTo });
  const { data: summaryData } = useFinancialSummary(dateFrom, dateTo);
  const { data: budget } = useMarketingBudgets(new Date().getFullYear());

  const activeTxs = useMemo(() => transactions.filter((t) => t.status !== "cancelado"), [transactions]);

  /* ─── Period Label ─── */
  const periodLabel = useMemo(() => {
    const fmt = (d: Date) => format(d, "MMMM yyyy", { locale: ptBR });
    return `${fmt(dateRange.start)} — ${fmt(dateRange.end)}`;
  }, [dateRange]);

  /* ─── Computed data per report ─── */

  const resumoData = useMemo(() => {
    const map = new Map<string, { receita: number; custo: number }>();
    activeTxs.forEach((t) => {
      const m = t.date.substring(0, 7);
      const e = map.get(m) || { receita: 0, custo: 0 };
      if (t.type === "receita") e.receita += Number(t.amount);
      else e.custo += Number(t.amount);
      map.set(m, e);
    });
    const LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => ({ name: LABELS[parseInt(k.split("-")[1]) - 1] || k, month: k, Receita: v.receita, Custo: v.custo, Saldo: v.receita - v.custo }));
  }, [activeTxs]);

  const categoriasData = useMemo(() => {
    const map = new Map<string, number>();
    activeTxs.filter((t) => t.type === "custo").forEach((t) => {
      const cat = t.category || "Sem categoria";
      map.set(cat, (map.get(cat) || 0) + Number(t.amount));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [activeTxs]);

  const evolucaoData = useMemo(() => {
    const monthly = budget?.total_budget ? budget.total_budget / 12 : 0;
    const map = new Map<string, number>();
    activeTxs.filter((t) => t.type === "custo").forEach((t) => {
      const m = t.date.substring(0, 7);
      map.set(m, (map.get(m) || 0) + Number(t.amount));
    });
    const LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => ({ name: LABELS[parseInt(k.split("-")[1]) - 1] || k, month: k, Gasto: Math.round(v), Orçamento: Math.round(monthly) }));
  }, [activeTxs, budget]);

  const topCustos = useMemo(() => {
    return [...activeTxs]
      .filter((t) => t.type === "custo")
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 20);
  }, [activeTxs]);

  /* ─── PDF export helper ─── */
  const exportPDF = async (doc: React.ReactElement, filename: string) => {
    setIsGeneratingPDF(true);
    try {
      await generateAndDownloadPDF(doc, filename);
      toast.success("PDF exportado!");
    } catch (e) {
      console.error("PDF error:", e);
      toast.error("Erro ao gerar PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  /* ─── Full PDF Export ─── */
  const handleFullPDFExport = async () => {
    if (!summaryData || activeTxs.length === 0) {
      toast.error("Sem dados para gerar o relatório");
      return;
    }
    const reportData: FinancialReportData = {
      periodLabel,
      summary: {
        totalReceita: summaryData.totalReceita,
        totalCusto: summaryData.totalCusto,
        saldo: summaryData.saldo,
        receitaTrend: summaryData.receitaTrend,
        custoTrend: summaryData.custoTrend,
      },
      byMonth: summaryData.byMonth,
      byCategory: summaryData.byCategory,
      bySubcategory: summaryData.bySubcategory,
      budget: budget ? {
        total: budget.total_budget || 0,
        remaining: (budget.total_budget || 0) - summaryData.totalCusto,
      } : undefined,
      topCosts: topCustos.map((t) => ({
        date: format(new Date(t.date), "dd/MM/yy"),
        description: t.description || "",
        category: t.category || "",
        subcategory: t.subcategory || undefined,
        amount: Number(t.amount),
      })),
      transactions: activeTxs.map((t) => ({
        date: format(new Date(t.date), "dd/MM/yy"),
        type: t.type,
        category: t.category || "",
        subcategory: t.subcategory || undefined,
        description: t.description || "",
        amount: Number(t.amount),
        status: t.status,
      })),
    };
    await exportPDF(
      React.createElement(FinancialReportDocument, { data: reportData }),
      `relatorio_financeiro_${dateFrom}_${dateTo}.pdf`
    );
  };

  /* ─── Individual PDF exports ─── */
  const exportResumoPDF = () => exportPDF(
    React.createElement(ResumoMensalDocument, {
      data: { periodLabel, rows: resumoData.map((r) => ({ month: r.month, receita: r.Receita, custo: r.Custo })) },
    }),
    `resumo_mensal_${dateFrom}_${dateTo}.pdf`
  );

  const exportCategoriasPDF = () => exportPDF(
    React.createElement(CustosCategoriaDocument, {
      data: { periodLabel, categories: categoriasData },
    }),
    `custos_categoria_${dateFrom}_${dateTo}.pdf`
  );

  const exportEvolucaoPDF = () => exportPDF(
    React.createElement(GastoOrcamentoDocument, {
      data: { periodLabel, rows: evolucaoData.map((r) => ({ month: r.month, gasto: r.Gasto, orcamento: r.Orçamento })) },
    }),
    `gasto_vs_orcamento_${dateFrom}_${dateTo}.pdf`
  );

  const exportTopCustosPDF = () => exportPDF(
    React.createElement(TopCustosDocument, {
      data: {
        periodLabel,
        items: topCustos.map((t) => ({
          date: format(new Date(t.date), "dd/MM/yy"),
          description: t.description || "",
          category: t.category || "",
          amount: Number(t.amount),
        })),
      },
    }),
    `top_custos_${dateFrom}_${dateTo}.pdf`
  );

  const exportDetalhadoPDF = () => exportPDF(
    React.createElement(LancamentosDocument, {
      data: {
        periodLabel,
        items: activeTxs.map((t) => ({
          date: format(new Date(t.date), "dd/MM/yy"),
          type: t.type,
          category: t.category || "",
          subcategory: t.subcategory || undefined,
          description: t.description || "",
          amount: Number(t.amount),
          paymentMethod: t.payment_method || undefined,
          status: t.status,
        })),
      },
    }),
    `lancamentos_${dateFrom}_${dateTo}.pdf`
  );

  /* ─── CSV Export helpers ─── */

  const exportResumo = () => {
    exportToCSV(resumoData, `resumo_mensal_${dateFrom}_${dateTo}`, [
      { key: "name", label: "Mês" },
      { key: "Receita", label: "Receita" },
      { key: "Custo", label: "Custo" },
      { key: "Saldo", label: "Saldo" },
    ]);
    toast.success("CSV exportado!");
  };

  const exportCategorias = () => {
    exportToCSV(categoriasData, `custos_categoria_${dateFrom}_${dateTo}`, [
      { key: "name", label: "Categoria" },
      { key: "value", label: "Valor" },
    ]);
    toast.success("CSV exportado!");
  };

  const exportEvolucao = () => {
    exportToCSV(evolucaoData, `gasto_vs_orcamento_${dateFrom}_${dateTo}`, [
      { key: "name", label: "Mês" },
      { key: "Gasto", label: "Gasto" },
      { key: "Orçamento", label: "Orçamento" },
    ]);
    toast.success("CSV exportado!");
  };

  const exportTopCustos = () => {
    exportToCSV(topCustos, `top_custos_${dateFrom}_${dateTo}`, [
      { key: "date", label: "Data" },
      { key: "description", label: "Descrição" },
      { key: "category", label: "Categoria" },
      { key: "amount", label: "Valor" },
    ]);
    toast.success("CSV exportado!");
  };

  const exportDetalhado = () => {
    exportToCSV(activeTxs, `lancamentos_${dateFrom}_${dateTo}`, [
      { key: "date", label: "Data" },
      { key: "type", label: "Tipo" },
      { key: "category", label: "Categoria" },
      { key: "subcategory", label: "Subcategoria" },
      { key: "description", label: "Descrição" },
      { key: "amount", label: "Valor" },
      { key: "payment_method", label: "Forma Pagamento" },
      { key: "status", label: "Status" },
      { key: "notes", label: "Observações" },
    ]);
    toast.success("CSV exportado!");
  };

  const hasData = activeTxs.length > 0;

  return (
    <PageWrapper
      title="Relatórios Financeiros"
      subtitle="Biblioteca de relatórios do marketing"
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
      {/* Report Cards Grid */}
      <BlurFade delay={0.05}>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {REPORTS.map((r) => (
              <button
                key={r.id}
                onClick={() => setOpenReport(r.id)}
                className="rounded-xl border bg-card p-5 text-left hover:border-module-gestao/40 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="rounded-lg bg-muted p-2.5 text-muted-foreground group-hover:text-module-gestao transition-colors">
                    {r.icon}
                  </div>
                  {!hasData && <Badge variant="secondary" className="text-[10px]">Sem dados</Badge>}
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{r.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{r.description}</p>
              </button>
            ))}
            {/* PDF Completo — sexto card */}
            <button
              onClick={handleFullPDFExport}
              disabled={isGeneratingPDF || !hasData}
              className="rounded-xl border bg-card p-5 text-left hover:border-module-gestao/40 hover:shadow-sm transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="rounded-lg bg-muted p-2.5 text-muted-foreground group-hover:text-module-gestao transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
                <Badge className="bg-module-gestao/10 text-module-gestao border-module-gestao/20 text-[9px] font-bold">PDF</Badge>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Relatório Completo</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {isGeneratingPDF ? "Gerando..." : "Documento com KPIs, gráficos, custos e lançamentos"}
              </p>
            </button>
          </div>
        )}
      </BlurFade>

      {/* ═══ DIALOGS ═══ */}

      {/* 1. Resumo Mensal */}
      <ReportDialog open={openReport === "resumo"} onClose={() => setOpenReport(null)} title="Resumo Mensal"
        onExportCSV={exportResumo} onExportPDF={exportResumoPDF} hasData={resumoData.length > 0} isGeneratingPDF={isGeneratingPDF}
        hint="Mostra receitas, custos e saldo agregados por mês. Use para identificar meses deficitários e tendências sazonais."
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={resumoData} barCategoryGap="15%">
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <RTooltip formatter={(v: number) => fmtCurrency(v)} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Receita" fill="hsl(var(--module-gestao))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Custo" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ReportDialog>

      {/* 2. Custos por Categoria */}
      <ReportDialog open={openReport === "categorias"} onClose={() => setOpenReport(null)} title="Custos por Categoria"
        onExportCSV={exportCategorias} onExportPDF={exportCategoriasPDF} hasData={categoriasData.length > 0} isGeneratingPDF={isGeneratingPDF}
        hint="Distribuição percentual dos custos por categoria. Identifique onde o orçamento está concentrado e possíveis excessos."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={categoriasData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={2} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ strokeWidth: 1 }} style={{ fontSize: 10 }}>
                {categoriasData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <RTooltip formatter={(v: number) => fmtCurrency(v)} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 overflow-y-auto max-h-[280px]">
            {categoriasData.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-sm px-2 py-1.5 rounded-lg hover:bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-foreground truncate">{c.name}</span>
                </div>
                <span className="text-muted-foreground tabular-nums text-xs">{fmtCurrency(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </ReportDialog>

      {/* 3. Gasto vs Orçamento */}
      <ReportDialog open={openReport === "evolucao"} onClose={() => setOpenReport(null)} title="Gasto vs Orçamento"
        onExportCSV={exportEvolucao} onExportPDF={exportEvolucaoPDF} hasData={evolucaoData.length > 0} isGeneratingPDF={isGeneratingPDF}
        hint="Compara o gasto real com a parcela mensal do orçamento anual. Meses com barra vermelha ultrapassando a cinza indicam estouro."
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={evolucaoData} barCategoryGap="15%">
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <RTooltip formatter={(v: number) => fmtCurrency(v)} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Orçamento" fill="hsl(var(--muted-foreground) / 0.25)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Gasto" fill="hsl(var(--module-gestao))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ReportDialog>

      {/* 4. Top Custos */}
      <ReportDialog open={openReport === "top-custos"} onClose={() => setOpenReport(null)} title="Top Custos do Período"
        onExportCSV={exportTopCustos} onExportPDF={exportTopCustosPDF} hasData={topCustos.length > 0} isGeneratingPDF={isGeneratingPDF}
        hint="Lista os maiores lançamentos de custo do período. Revise itens de alto valor para garantir que estejam categorizados e justificados."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-b text-[11px] text-muted-foreground uppercase tracking-wider">
                <th className="text-left px-3 py-2 font-medium">#</th>
                <th className="text-left px-3 py-2 font-medium">Data</th>
                <th className="text-left px-3 py-2 font-medium">Descrição</th>
                <th className="text-left px-3 py-2 font-medium">Categoria</th>
                <th className="text-right px-3 py-2 font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              {topCustos.map((t, i) => (
                <tr key={t.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2.5 text-muted-foreground tabular-nums">{i + 1}</td>
                  <td className="px-3 py-2.5 text-muted-foreground tabular-nums whitespace-nowrap">{format(new Date(t.date), "dd/MM/yy")}</td>
                  <td className="px-3 py-2.5 text-foreground truncate max-w-[200px]">{t.description || "—"}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{t.category || "—"}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-medium">{fmtCurrency(Number(t.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ReportDialog>

      {/* 5. Lançamentos Detalhados */}
      <ReportDialog open={openReport === "detalhado"} onClose={() => setOpenReport(null)} title="Lançamentos Detalhados"
        onExportCSV={exportDetalhado} onExportPDF={exportDetalhadoPDF} hasData={activeTxs.length > 0} wide isGeneratingPDF={isGeneratingPDF}
        hint="Todos os lançamentos do período em formato tabular. Exporte para CSV ou PDF."
      >
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b text-[11px] text-muted-foreground uppercase tracking-wider">
                <th className="text-left px-3 py-2 font-medium">Data</th>
                <th className="text-center px-3 py-2 font-medium">Tipo</th>
                <th className="text-left px-3 py-2 font-medium">Categoria</th>
                <th className="text-left px-3 py-2 font-medium">Descrição</th>
                <th className="text-right px-3 py-2 font-medium">Valor</th>
                <th className="text-left px-3 py-2 font-medium">Pagamento</th>
                <th className="text-center px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {activeTxs.slice(0, 100).map((t) => (
                <tr key={t.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2 text-muted-foreground tabular-nums whitespace-nowrap">{format(new Date(t.date), "dd/MM/yy")}</td>
                  <td className="px-3 py-2 text-center">
                    <Badge variant="secondary" className="text-[10px]">{t.type === "receita" ? "Receita" : "Custo"}</Badge>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{t.category || "—"}</td>
                  <td className="px-3 py-2 text-foreground truncate max-w-[180px]">{t.description || "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium">{fmtCurrency(Number(t.amount))}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{t.payment_method || "—"}</td>
                  <td className="px-3 py-2 text-center">
                    <Badge variant="outline" className="text-[10px]">{t.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {activeTxs.length > 100 && (
            <div className="px-3 py-2 text-[11px] text-muted-foreground border-t">
              Exibindo 100 de {activeTxs.length} — exporte para ver todos.
            </div>
          )}
        </div>
      </ReportDialog>
    </PageWrapper>
  );
}

/* ─── Report Dialog Wrapper ──────────────────────────── */

function ReportDialog({
  open, onClose, title, onExportCSV, onExportPDF, hasData, hint, wide, isGeneratingPDF, children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  onExportCSV: () => void;
  onExportPDF?: () => void;
  hasData: boolean;
  hint: string;
  wide?: boolean;
  isGeneratingPDF?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={cn("max-h-[85vh] overflow-y-auto", wide ? "sm:max-w-4xl" : "sm:max-w-2xl")}>
        <DialogHeader>
          <DialogTitle className="text-base flex items-center justify-between">
            {title}
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5" onClick={onExportCSV} disabled={!hasData}>
                <Download className="h-3.5 w-3.5" />
                CSV
              </Button>
              {onExportPDF && (
                <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5" onClick={onExportPDF} disabled={!hasData || isGeneratingPDF}>
                  <FileText className="h-3.5 w-3.5" />
                  PDF
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Hint */}
        <div className="rounded-lg bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground leading-relaxed">
          💡 {hint}
        </div>

        {/* Content */}
        {hasData ? (
          <div className="mt-2">{children}</div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <Receipt className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Sem dados para o período selecionado.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
