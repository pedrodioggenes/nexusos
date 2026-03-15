import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Share2, Bookmark, StickyNote, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { UNITS } from "@/data/dominio/mock-data";
import type { GlobalFilters } from "@/data/dominio/types";

interface GlobalFiltersBarProps {
  filters: GlobalFilters;
  onFilterChange: <K extends keyof GlobalFilters>(key: K, value: GlobalFilters[K]) => void;
  showCategory?: boolean;
}

const PERIODS = [
  { value: "realtime", label: "Tempo Real" },
  { value: "today", label: "Hoje" },
  { value: "month", label: "Mês" },
  { value: "quarter", label: "Trimestre" },
  { value: "semester", label: "Semestre" },
  { value: "year", label: "Ano" },
  { value: "historic", label: "Histórico" },
];

const COMPARISONS = [
  { value: "previous", label: "vs Anterior" },
  { value: "yoy", label: "vs Ano Anterior" },
  { value: "none", label: "Sem comparação" },
];

export function GlobalFiltersBar({ filters, onFilterChange, showCategory = false }: GlobalFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Unit selector */}
      <Select value={typeof filters.unit_id === "string" ? filters.unit_id : "all"} onValueChange={v => onFilterChange("unit_id", v)}>
        <SelectTrigger className="w-[180px] h-8 text-xs">
          <SelectValue placeholder="Unidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Consolidado</SelectItem>
          {UNITS.map(u => (
            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Period */}
      <Select value={filters.period} onValueChange={v => onFilterChange("period", v as GlobalFilters["period"])}>
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PERIODS.map(p => (
            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Comparison */}
      <Select value={filters.comparison} onValueChange={v => onFilterChange("comparison", v as GlobalFilters["comparison"])}>
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {COMPARISONS.map(c => (
            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showCategory && (
        <Select value={filters.category} onValueChange={v => onFilterChange("category", v)}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {["Mercearia", "Perecíveis", "Bebidas", "Higiene", "Limpeza", "Hortifruti", "Açougue", "Padaria"].map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={e => onFilterChange("search", e.target.value)}
          placeholder="Buscar..."
          className="h-8 w-[140px] pl-7 text-xs"
        />
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => toast({ title: "Exportar", description: "Relatório exportado com sucesso (placeholder)" })}>
        <Download className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => { navigator.clipboard.writeText(window.location.href); toast({ title: "Link copiado" }); }}>
        <Share2 className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => toast({ title: "Visão salva", description: "Preset salvo com sucesso (placeholder)" })}>
        <Bookmark className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => toast({ title: "Notas", description: "Funcionalidade de notas em breve" })}>
        <StickyNote className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
