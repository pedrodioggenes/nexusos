import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Receipt,
  Hash,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { PageWrapper } from "@/components/marketing/PageWrapper";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useFinancialTransactions, type FinancialTransaction } from "@/hooks/useFinancialTransactions";
import { exportToCSV } from "@/lib/csv-export";
import { toast } from "sonner";

/* ─── Helpers ──────────────────────────────────────────── */

function fmtCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
}

function monthLabel(d: Date) {
  return format(d, "MMMM yyyy", { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase());
}

/* ─── Anomaly detection helpers ──────────────────────── */

function findMissingCategory(txs: FinancialTransaction[]) {
  return txs.filter((t) => !t.category || t.category.trim() === "");
}

function findMissingDescription(txs: FinancialTransaction[]) {
  return txs.filter((t) => !t.description || t.description.trim() === "");
}

function findPossibleDuplicates(txs: FinancialTransaction[]) {
  const dupes: FinancialTransaction[] = [];
  const seen = new Map<string, FinancialTransaction>();
  for (const t of txs) {
    const key = `${t.amount}-${t.date}-${t.category}-${t.type}`;
    if (seen.has(key)) {
      dupes.push(t);
      const original = seen.get(key)!;
      if (!dupes.includes(original)) dupes.push(original);
    } else {
      seen.set(key, t);
    }
  }
  return dupes;
}

function findOutliers(txs: FinancialTransaction[]) {
  if (txs.length < 3) return [];
  const amounts = txs.map((t) => Math.abs(Number(t.amount)));
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const stdDev = Math.sqrt(amounts.reduce((s, v) => s + (v - mean) ** 2, 0) / amounts.length);
  const threshold = mean + 3 * stdDev;
  return txs.filter((t) => Math.abs(Number(t.amount)) > threshold);
}

/* ─── Component ────────────────────────────────────────── */

export default function FechamentoMes() {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));

  const dateFrom = format(selectedMonth, "yyyy-MM-dd");
  const dateTo = format(endOfMonth(selectedMonth), "yyyy-MM-dd");

  const { data: transactions = [], isLoading } = useFinancialTransactions({ dateFrom, dateTo });

  const activeTxs = useMemo(() => transactions.filter((t) => t.status !== "cancelado"), [transactions]);

  /* KPIs */
  const totalCusto = useMemo(() => activeTxs.filter((t) => t.type === "custo").reduce((s, t) => s + Number(t.amount), 0), [activeTxs]);
  const totalReceita = useMemo(() => activeTxs.filter((t) => t.type === "receita").reduce((s, t) => s + Number(t.amount), 0), [activeTxs]);
  const saldo = totalReceita - totalCusto;
  const totalLancamentos = activeTxs.length;

  /* Checklist items */
  const missingCategory = useMemo(() => findMissingCategory(activeTxs), [activeTxs]);
  const missingDescription = useMemo(() => findMissingDescription(activeTxs), [activeTxs]);
  const duplicates = useMemo(() => findPossibleDuplicates(activeTxs), [activeTxs]);
  const outliers = useMemo(() => findOutliers(activeTxs), [activeTxs]);

  const checklistItems = useMemo(
    () => [
      { label: "Transações sem categoria", count: missingCategory.length, items: missingCategory },
      { label: "Transações sem descrição", count: missingDescription.length, items: missingDescription },
      { label: "Possíveis duplicadas", count: duplicates.length, items: duplicates },
      { label: "Valores fora do padrão", count: outliers.length, items: outliers },
    ],
    [missingCategory, missingDescription, duplicates, outliers]
  );

  const totalIssues = checklistItems.reduce((s, c) => s + c.count, 0);
  const isCloseable = totalIssues === 0 && totalLancamentos > 0;

  /* Navigation */
  const goPrev = () => setSelectedMonth((m) => subMonths(m, 1));
  const goNext = () => {
    const next = new Date(selectedMonth);
    next.setMonth(next.getMonth() + 1);
    if (next <= new Date()) setSelectedMonth(startOfMonth(next));
  };

  /* Export */
  const handleExport = () => {
    if (activeTxs.length === 0) return;
    exportToCSV(
      activeTxs,
      `fechamento_${format(selectedMonth, "yyyy-MM")}`,
      [
        { key: "date", label: "Data" },
        { key: "type", label: "Tipo" },
        { key: "category", label: "Categoria" },
        { key: "subcategory", label: "Subcategoria" },
        { key: "description", label: "Descrição" },
        { key: "amount", label: "Valor" },
        { key: "payment_method", label: "Forma Pagamento" },
        { key: "status", label: "Status" },
        { key: "notes", label: "Observações" },
      ]
    );
    toast.success("CSV exportado com sucesso!");
  };

  const openInMovimentacoes = () => navigate("/app/marketing/financeiro");

  return (
    <PageWrapper
      title="Fechamento do Mês"
      subtitle="Validação e consolidação financeira mensal"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1" onClick={handleExport} disabled={activeTxs.length === 0}>
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Button>
        </div>
      }
    >
      {/* Month selector */}
      <BlurFade delay={0.05}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold text-foreground min-w-[140px] text-center">
              {monthLabel(selectedMonth)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={goNext}
              disabled={endOfMonth(selectedMonth) >= new Date()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Closeable badge */}
          {!isLoading && (
            <Badge
              variant={isCloseable ? "default" : "secondary"}
              className={cn(
                "text-[11px] gap-1",
                isCloseable
                  ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                  : totalLancamentos === 0
                    ? "bg-muted text-muted-foreground"
                    : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
              )}
            >
              {isCloseable ? (
                <>
                  <ShieldCheck className="h-3 w-3" /> Pronto para fechar
                </>
              ) : totalLancamentos === 0 ? (
                "Sem lançamentos"
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3" /> {totalIssues} pendência{totalIssues !== 1 ? "s" : ""}
                </>
              )}
            </Badge>
          )}
        </div>
      </BlurFade>

      {/* A) KPI Cards */}
      <BlurFade delay={0.08}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          ) : (
            <>
              <MiniKpi label="Total de custos" value={fmtCurrency(totalCusto)} icon={<TrendingDown className="h-4 w-4 text-destructive" />} />
              <MiniKpi label="Total de receitas" value={fmtCurrency(totalReceita)} icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} />
              <MiniKpi label="Saldo do mês" value={fmtCurrency(saldo)} icon={<Receipt className="h-4 w-4 text-app-gestao" />} accent={saldo < 0 ? "destructive" : undefined} />
              <MiniKpi label="Nº de lançamentos" value={String(totalLancamentos)} icon={<Hash className="h-4 w-4 text-muted-foreground" />} />
            </>
          )}
        </div>
      </BlurFade>

      {/* B) Checklist */}
      <BlurFade delay={0.11}>
        <div className="rounded-xl border bg-card">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Checklist de Fechamento</h3>
            {!isLoading && totalLancamentos > 0 && (
              <span className="text-[11px] text-muted-foreground">
                {checklistItems.filter((c) => c.count === 0).length}/{checklistItems.length} OK
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
            </div>
          ) : totalLancamentos === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Nenhum lançamento neste mês.
            </div>
          ) : (
            <div className="divide-y">
              {checklistItems.map((item) => {
                const ok = item.count === 0;
                return (
                  <div key={item.label} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {ok ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive shrink-0" />
                      )}
                      <span className={cn("text-sm", ok ? "text-muted-foreground" : "text-foreground font-medium")}>
                        {item.count} {item.label.toLowerCase()}
                      </span>
                    </div>
                    {!ok && (
                      <Badge variant="destructive" className="text-[10px] px-1.5">
                        {item.count}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </BlurFade>

      {/* C) Pendências detail tables */}
      {!isLoading &&
        checklistItems
          .filter((c) => c.count > 0)
          .map((check, idx) => (
            <BlurFade key={check.label} delay={0.14 + idx * 0.03}>
              <div className="rounded-xl border bg-card">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    {check.label}
                    <Badge variant="secondary" className="text-[10px] ml-1">{check.count}</Badge>
                  </h4>
                  <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1" onClick={openInMovimentacoes}>
                    <ExternalLink className="h-3 w-3" />
                    Abrir em Movimentações
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] text-sm">
                    <thead>
                      <tr className="border-b text-[11px] text-muted-foreground uppercase tracking-wider">
                        <th className="text-left px-4 py-2 font-medium">Data</th>
                        <th className="text-left px-4 py-2 font-medium">Descrição</th>
                        <th className="text-left px-4 py-2 font-medium">Categoria</th>
                        <th className="text-right px-4 py-2 font-medium">Valor</th>
                        <th className="text-center px-4 py-2 font-medium">Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {check.items.slice(0, 10).map((t) => (
                        <tr key={t.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{format(new Date(t.date), "dd/MM")}</td>
                          <td className="px-4 py-2.5 text-foreground truncate max-w-[200px]">{t.description || "—"}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{t.category || "—"}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums font-medium">{fmtCurrency(Number(t.amount))}</td>
                          <td className="px-4 py-2.5 text-center">
                            <Badge variant="secondary" className="text-[10px]">
                              {t.type === "receita" ? "Receita" : "Custo"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {check.items.length > 10 && (
                    <div className="px-4 py-2 text-[11px] text-muted-foreground border-t">
                      + {check.items.length - 10} itens adicionais
                    </div>
                  )}
                </div>
              </div>
            </BlurFade>
          ))}
    </PageWrapper>
  );
}

/* ─── Mini KPI Card ──────────────────────────────────── */

function MiniKpi({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent?: "destructive" }) {
  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
        {icon}
      </div>
      <span className={cn("text-xl lg:text-2xl font-bold tabular-nums", accent === "destructive" ? "text-destructive" : "text-foreground")}>
        {value}
      </span>
    </div>
  );
}
