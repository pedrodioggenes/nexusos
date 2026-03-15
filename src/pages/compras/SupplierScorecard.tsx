import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Award, Search, ArrowUpDown, ChevronRight, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  useComprasSuppliers,
  useComprasSupplierScores,
  classifySupplier,
} from "@/hooks/useComprasData";

type SortKey = "name" | "composite_score" | "lead_time_days";
type SortDir = "asc" | "desc";

export default function SupplierScorecard() {
  const navigate = useNavigate();
  const { data: suppliers = [], isLoading } = useComprasSuppliers();
  const { data: allScores = [] } = useComprasSupplierScores();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("composite_score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  // Merge latest scores per supplier
  const suppliersWithScores = useMemo(() => {
    const latestScores = new Map<string, any>();
    allScores.forEach((s: any) => {
      const existing = latestScores.get(s.supplier_id);
      if (!existing || s.period > existing.period) latestScores.set(s.supplier_id, s);
    });

    return suppliers.map((s: any) => ({
      ...s,
      latestScore: latestScores.get(s.id) ?? null,
    }));
  }, [suppliers, allScores]);

  const filtered = useMemo(() => {
    let list = suppliersWithScores;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s: any) =>
        s.name?.toLowerCase().includes(q) ||
        s.cnpj?.toLowerCase().includes(q) ||
        s.classification?.toLowerCase().includes(q)
      );
    }
    list.sort((a: any, b: any) => {
      let aVal = a[sortKey] ?? 0;
      let bVal = b[sortKey] ?? 0;
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [suppliersWithScores, search, sortKey, sortDir]);

  // Classification summary
  const classCounts = useMemo(() => {
    const counts = { strategic: 0, standard: 0, watch: 0, risk: 0 };
    suppliers.forEach((s: any) => {
      const score = s.composite_score ?? 0;
      if (score >= 85) counts.strategic++;
      else if (score >= 70) counts.standard++;
      else if (score >= 50) counts.watch++;
      else if (score > 0) counts.risk++;
    });
    return counts;
  }, [suppliers]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Scorecard de Fornecedores</h1>
        <p className="text-sm text-muted-foreground">Ranking e classificação por score composto</p>
      </div>

      {/* Classification summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Parceiro Estratégico", count: classCounts.strategic, color: "text-success", bg: "bg-success/10", border: "border-success/20" },
          { label: "Padrão", count: classCounts.standard, color: "text-app-compras", bg: "bg-app-compras/10", border: "border-app-compras/20" },
          { label: "Observação", count: classCounts.watch, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
          { label: "Em Risco", count: classCounts.risk, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
        ].map((c) => (
          <div key={c.label} className={cn("rounded-xl border p-3", c.border, c.bg)}>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{c.label}</p>
            <p className={cn("text-2xl font-bold mt-1", c.color)}>{c.count}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar fornecedor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-xl bg-app-compras/10 flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-app-compras" />
              </div>
              <p className="text-sm text-muted-foreground">Nenhum fornecedor encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold w-8">#</th>
                    <SortHeader label="Fornecedor" sortKey="name" current={sortKey} dir={sortDir} onSort={toggleSort} />
                    <SortHeader label="Score" sortKey="composite_score" current={sortKey} dir={sortDir} onSort={toggleSort} className="text-center" />
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold text-center">Classificação</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold text-center hidden md:table-cell">OTIF</th>
                    <SortHeader label="Lead Time" sortKey="lead_time_days" current={sortKey} dir={sortDir} onSort={toggleSort} className="text-center hidden md:table-cell" />
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold text-center hidden lg:table-cell">Preço</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold text-center hidden lg:table-cell">Qualidade</th>
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s: any, i: number) => {
                    const classification = classifySupplier(s.composite_score);
                    const ls = s.latestScore;
                    return (
                      <tr
                        key={s.id}
                        onClick={() => navigate(`/app/compras/fornecedores/${s.id}`)}
                        className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div>
                          <p className="text-sm font-medium text-foreground">{s.name}</p>
                          <p className="text-[10px] text-muted-foreground">{s.classification || s.cnpj || "—"}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <ScoreBadge score={s.composite_score} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", classification.bgColor, classification.color)}>
                            {classification.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell">
                          <span className="text-xs text-foreground">{ls?.score_otif ? `${ls.score_otif}%` : "—"}</span>
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell">
                          <span className="text-xs text-foreground">{s.lead_time_days ? `${s.lead_time_days}d` : "—"}</span>
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell">
                          <DimensionDot score={ls?.score_preco} />
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell">
                          <DimensionDot score={ls?.score_qualidade} />
                        </td>
                        <td className="px-4 py-3">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SortHeader({ label, sortKey, current, dir, onSort, className }: {
  label: string; sortKey: SortKey; current: SortKey; dir: SortDir;
  onSort: (key: SortKey) => void; className?: string;
}) {
  return (
    <th className={cn("px-4 py-3", className)}>
      <button
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold hover:text-foreground transition-colors"
      >
        {label}
        <ArrowUpDown className={cn("h-3 w-3", current === sortKey && "text-app-compras")} />
      </button>
    </th>
  );
}

function ScoreBadge({ score }: { score: number | null }) {
  if (!score) return <span className="text-xs text-muted-foreground">—</span>;
  const color = score >= 85 ? "text-success" : score >= 70 ? "text-app-compras" : score >= 50 ? "text-warning" : "text-destructive";
  return <span className={cn("text-sm font-bold", color)}>{score}</span>;
}

function DimensionDot({ score }: { score: number | null | undefined }) {
  if (!score) return <span className="text-xs text-muted-foreground">—</span>;
  const color = score >= 80 ? "bg-success" : score >= 60 ? "bg-warning" : "bg-destructive";
  return (
    <div className="flex items-center justify-center gap-1">
      <div className={cn("h-2 w-2 rounded-full", color)} />
      <span className="text-xs text-foreground">{score}</span>
    </div>
  );
}
