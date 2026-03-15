import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FolderOpen,
  FileQuestion,
  Copy,
  TrendingUp,
  X,
  Receipt,
} from "lucide-react";
import { PageWrapper } from "@/components/marketing/PageWrapper";
import { PeriodFilter, usePeriodFilter } from "@/components/ui/period-filter";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useFinancialTransactions, type FinancialTransaction } from "@/hooks/useFinancialTransactions";

/* ─── Helpers ────────────────────────────────────────── */

function fmtCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(v);
}

/* ─── Detection logic ────────────────────────────────── */

function findMissingCategory(txs: FinancialTransaction[]) {
  return txs.filter((t) => !t.category || t.category.trim() === "");
}

function findMissingDescription(txs: FinancialTransaction[]) {
  return txs.filter((t) => !t.description || t.description.trim() === "");
}

function findDuplicates(txs: FinancialTransaction[]) {
  const groups = new Map<string, FinancialTransaction[]>();
  for (const t of txs) {
    const key = `${t.date}|${Number(t.amount).toFixed(2)}|${t.type}`;
    const arr = groups.get(key) || [];
    arr.push(t);
    groups.set(key, arr);
  }
  const dupes: FinancialTransaction[] = [];
  groups.forEach((arr) => {
    if (arr.length > 1) dupes.push(...arr);
  });
  return dupes;
}

function findOutliers(txs: FinancialTransaction[], topN = 10) {
  if (txs.length < 3) return [];
  const sorted = [...txs].sort((a, b) => Math.abs(Number(b.amount)) - Math.abs(Number(a.amount)));
  const amounts = txs.map((t) => Math.abs(Number(t.amount)));
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const stdDev = Math.sqrt(amounts.reduce((s, v) => s + (v - mean) ** 2, 0) / amounts.length);
  const threshold = mean + 2 * stdDev;
  const statistical = sorted.filter((t) => Math.abs(Number(t.amount)) > threshold);
  return statistical.length > 0 ? statistical.slice(0, topN) : sorted.slice(0, Math.min(5, sorted.length));
}

/* ─── Types ──────────────────────────────────────────── */

interface IssueSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: FinancialTransaction[];
  description: string;
}

/* ─── Component ──────────────────────────────────────── */

export default function Conciliacao() {
  const navigate = useNavigate();
  const { period, setPeriod, getDateRange, customRange, setCustomRange } = usePeriodFilter("month");
  const [typeFilter, setTypeFilter] = useState<"all" | "receita" | "custo">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [detailTx, setDetailTx] = useState<FinancialTransaction | null>(null);

  const dateRange = getDateRange();
  const dateFrom = dateRange.start.toISOString().slice(0, 10);
  const dateTo = dateRange.end.toISOString().slice(0, 10);

  const { data: allTransactions = [], isLoading } = useFinancialTransactions({
    dateFrom,
    dateTo,
    type: typeFilter === "all" ? undefined : typeFilter,
    category: categoryFilter === "all" ? undefined : categoryFilter,
  });

  const activeTxs = useMemo(() => allTransactions.filter((t) => t.status !== "cancelado"), [allTransactions]);

  // Unique categories for filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    allTransactions.forEach((t) => { if (t.category) set.add(t.category); });
    return Array.from(set).sort();
  }, [allTransactions]);

  // Sections
  const sections: IssueSection[] = useMemo(() => [
    {
      id: "no-category",
      label: "Sem categoria",
      icon: <FolderOpen className="h-4 w-4 text-amber-500" />,
      items: findMissingCategory(activeTxs),
      description: "Lançamentos sem categoria dificultam a análise por centro de custo.",
    },
    {
      id: "no-description",
      label: "Sem descrição",
      icon: <FileQuestion className="h-4 w-4 text-amber-500" />,
      items: findMissingDescription(activeTxs),
      description: "Sem descrição, é difícil auditar e justificar o gasto.",
    },
    {
      id: "duplicates",
      label: "Duplicadas prováveis",
      icon: <Copy className="h-4 w-4 text-destructive" />,
      items: findDuplicates(activeTxs),
      description: "Mesma data, mesmo valor e mesmo tipo — podem ser lançamentos duplicados.",
    },
    {
      id: "outliers",
      label: "Valores atípicos",
      icon: <TrendingUp className="h-4 w-4 text-destructive" />,
      items: findOutliers(activeTxs),
      description: "Valores significativamente acima da média — recomenda-se revisão.",
    },
  ], [activeTxs]);

  const totalIssues = sections.reduce((s, sec) => s + sec.items.length, 0);
  const sectionsWithIssues = sections.filter((s) => s.items.length > 0);
  const allClean = totalIssues === 0 && activeTxs.length > 0;

  return (
    <PageWrapper
      title="Conciliação"
      subtitle="Qualidade e integridade dos dados financeiros"
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
      {/* Filters */}
      <BlurFade delay={0.05}>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="receita">Receita</SelectItem>
              <SelectItem value="custo">Custo</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!isLoading && (
            <div className="ml-auto flex items-center gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  "text-[11px] gap-1",
                  allClean
                    ? "bg-emerald-500/10 text-emerald-600"
                    : totalIssues > 0
                      ? "bg-amber-500/10 text-amber-600"
                      : ""
                )}
              >
                {allClean ? (
                  <><CheckCircle2 className="h-3 w-3" /> Dados limpos</>
                ) : activeTxs.length === 0 ? (
                  "Sem lançamentos"
                ) : (
                  <><AlertTriangle className="h-3 w-3" /> {totalIssues} problema{totalIssues !== 1 ? "s" : ""}</>
                )}
              </Badge>

              <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1" onClick={() => navigate("/app/marketing/financeiro")}>
                <ExternalLink className="h-3 w-3" />
                Movimentações
              </Button>
            </div>
          )}
        </div>
      </BlurFade>

      {/* Summary cards */}
      <BlurFade delay={0.08}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          ) : (
            sections.map((sec) => {
              const ok = sec.items.length === 0;
              return (
                <div
                  key={sec.id}
                  className={cn(
                    "rounded-xl border bg-card p-4 flex flex-col gap-1.5 transition-colors",
                    !ok && "border-amber-500/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-medium">{sec.label}</span>
                    {ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : sec.icon}
                  </div>
                  <span className={cn("text-2xl font-bold tabular-nums", ok ? "text-emerald-600" : "text-foreground")}>
                    {sec.items.length}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </BlurFade>

      {/* All clean */}
      {!isLoading && allClean && (
        <BlurFade delay={0.11}>
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border bg-card">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Dados financeiros limpos</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Nenhum problema detectado nos {activeTxs.length} lançamentos do período.
            </p>
          </div>
        </BlurFade>
      )}

      {/* Empty state */}
      {!isLoading && activeTxs.length === 0 && (
        <BlurFade delay={0.11}>
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border bg-card">
            <Receipt className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Sem lançamentos</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Não há lançamentos financeiros no período selecionado.
            </p>
          </div>
        </BlurFade>
      )}

      {/* Issue tables */}
      {!isLoading &&
        sectionsWithIssues.map((sec, idx) => (
          <BlurFade key={sec.id} delay={0.11 + idx * 0.03}>
            <div className="rounded-xl border bg-card">
              <div className="px-4 py-3 border-b">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    {sec.icon}
                    {sec.label}
                    <Badge variant="secondary" className="text-[10px]">{sec.items.length}</Badge>
                  </h4>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{sec.description}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[550px] text-sm">
                  <thead>
                    <tr className="border-b text-[11px] text-muted-foreground uppercase tracking-wider">
                      <th className="text-left px-4 py-2 font-medium">Data</th>
                      <th className="text-left px-4 py-2 font-medium">Descrição</th>
                      <th className="text-left px-4 py-2 font-medium">Categoria</th>
                      <th className="text-right px-4 py-2 font-medium">Valor</th>
                      <th className="text-center px-4 py-2 font-medium">Tipo</th>
                      <th className="text-center px-4 py-2 font-medium w-[80px]">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sec.items.slice(0, 15).map((t) => (
                      <tr key={t.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 text-muted-foreground tabular-nums whitespace-nowrap">
                          {format(new Date(t.date), "dd/MM/yy")}
                        </td>
                        <td className="px-4 py-2.5 text-foreground truncate max-w-[220px]">
                          {t.description || <span className="text-muted-foreground italic">sem descrição</span>}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {t.category || <span className="italic">—</span>}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                          {fmtCurrency(Number(t.amount))}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <Badge variant="secondary" className="text-[10px]">
                            {t.type === "receita" ? "Receita" : "Custo"}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => setDetailTx(t)}>
                            Ver
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sec.items.length > 15 && (
                  <div className="px-4 py-2 text-[11px] text-muted-foreground border-t">
                    + {sec.items.length - 15} itens adicionais
                  </div>
                )}
              </div>
            </div>
          </BlurFade>
        ))}

      {/* Detail Sheet */}
      <Sheet open={!!detailTx} onOpenChange={(open) => !open && setDetailTx(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-base">Detalhe do Lançamento</SheetTitle>
          </SheetHeader>
          {detailTx && (
            <div className="mt-6 space-y-4">
              <DetailRow label="Data" value={format(new Date(detailTx.date), "dd/MM/yyyy")} />
              <DetailRow label="Tipo" value={detailTx.type === "receita" ? "Receita" : "Custo"} />
              <DetailRow label="Categoria" value={detailTx.category || "—"} />
              <DetailRow label="Subcategoria" value={detailTx.subcategory || "—"} />
              <DetailRow label="Descrição" value={detailTx.description || "—"} />
              <DetailRow label="Valor" value={fmtCurrency(Number(detailTx.amount))} highlight />
              <DetailRow label="Forma de Pagamento" value={detailTx.payment_method || "—"} />
              <DetailRow label="Status" value={detailTx.status} />
              <DetailRow label="Tags" value={detailTx.tags?.join(", ") || "—"} />
              <DetailRow label="Observações" value={detailTx.notes || "—"} />
              <DetailRow label="Criado em" value={format(new Date(detailTx.created_at), "dd/MM/yyyy HH:mm")} />

              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs gap-2"
                  onClick={() => {
                    setDetailTx(null);
                    navigate("/app/marketing/financeiro");
                  }}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Abrir em Movimentações
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </PageWrapper>
  );
}

/* ─── Detail Row ─────────────────────────────────────── */

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[11px] text-muted-foreground font-medium shrink-0">{label}</span>
      <span className={cn("text-sm text-right", highlight ? "font-semibold text-foreground" : "text-foreground/80")}>
        {value}
      </span>
    </div>
  );
}
