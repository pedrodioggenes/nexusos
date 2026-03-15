import { PageHeader } from "@/components/ui/page-header";
import { useDRELojaData } from "@/hooks/financeiro/useFinancialData";
import { formatCurrency, formatPercent } from "@/hooks/financeiro/useFinancialFormulas";
import { Store, CheckCircle2, Clock, FileEdit } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusConfig = {
  rascunho: { label: "Rascunho", icon: FileEdit, color: "text-muted-foreground bg-muted/50" },
  em_revisao: { label: "Em Revisão", icon: Clock, color: "text-warning bg-warning/10" },
  aprovado: { label: "Aprovado", icon: CheckCircle2, color: "text-success bg-success/10" },
};

export default function DRELojaPage() {
  const stores = useDRELojaData();
  const [selectedStore, setSelectedStore] = useState(stores[0].storeId);
  const store = stores.find(s => s.storeId === selectedStore)!;
  const status = statusConfig[store.status];
  const StatusIcon = status.icon;

  const fmt = (v: number, isPercent?: boolean) => isPercent ? formatPercent(v) : formatCurrency(v);

  return (
    <div className="space-y-6">
      <PageHeader title="DRE Gerencial — Loja" description="Demonstração de resultado por unidade" />

      <div className="flex items-center gap-3 flex-wrap">
        <Select value={selectedStore} onValueChange={setSelectedStore}>
          <SelectTrigger className="w-[200px]">
            <Store className="h-3.5 w-3.5 mr-2 text-app-financeiro" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {stores.map(s => (
              <SelectItem key={s.storeId} value={s.storeId}>{s.storeName}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", status.color)}>
          <StatusIcon className="h-3 w-3" />
          {status.label} — v{store.version}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_120px_120px] gap-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
          <div className="px-4 py-3">Linha</div>
          <div className="px-3 py-3 text-right">Loja</div>
          <div className="px-3 py-3 text-right">Mês Ant.</div>
          <div className="px-3 py-3 text-right">Meta</div>
        </div>

        {store.lines.map((line) => (
          <div
            key={line.key}
            className={cn(
              "grid grid-cols-[1fr_120px_120px_120px] gap-0 border-b border-border/50 last:border-0 items-center hover:bg-muted/20",
              line.level === 0 && "bg-muted/10",
            )}
          >
            <div className={cn("px-4 py-2 text-sm", line.level === 2 && "pl-8", line.isBold && "font-semibold text-foreground", !line.isBold && "text-muted-foreground")}>
              {line.label}
            </div>
            <div className={cn("px-3 py-2 text-right text-sm tabular-nums", line.isBold && "font-semibold", line.value < 0 && "text-destructive")}>
              {fmt(line.value, line.isPercent)}
            </div>
            <div className="px-3 py-2 text-right text-sm text-muted-foreground tabular-nums">
              {fmt(line.prevValue, line.isPercent)}
            </div>
            <div className="px-3 py-2 text-right text-sm text-muted-foreground tabular-nums">
              {line.metaValue !== null ? fmt(line.metaValue, line.isPercent) : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
