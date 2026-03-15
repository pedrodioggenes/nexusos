import { useState } from "react";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { CONDICOES, CONDICOES_LOG } from "@/data/dominio/compras-mock";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock } from "lucide-react";

export default function ComprasCondicoes() {
  const { filters, updateFilter } = useGlobalFilters();

  const filtered = filters.search
    ? CONDICOES.filter((c) => c.supplier_name.toLowerCase().includes(filters.search.toLowerCase()))
    : CONDICOES;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Condições Comerciais</h1>
        <p className="text-muted-foreground">Prazos, descontos e condições negociadas com fornecedores</p>
      </div>

      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fornecedor</TableHead>
            <TableHead className="text-center">Prazo (dias)</TableHead>
            <TableHead className="text-center">Desconto (%)</TableHead>
            <TableHead className="text-center">Bonificação (%)</TableHead>
            <TableHead>Observações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-semibold">{c.supplier_name}</TableCell>
              <TableCell className="text-center">
                <Badge variant="outline">{c.prazo_dias}d</Badge>
              </TableCell>
              <TableCell className="text-center">
                {c.desconto_pct > 0 ? (
                  <span className="font-semibold" style={{ color: "hsl(var(--primary))" }}>{c.desconto_pct}%</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {c.bonificacao_pct > 0 ? (
                  <span className="font-semibold text-accent-foreground">{c.bonificacao_pct}%</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{c.observacoes || "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Log de Atualizações */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" /> Histórico de Atualizações
        </h2>
        <div className="space-y-2">
          {CONDICOES_LOG.map((log) => (
            <div key={log.id} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
              <div className="flex-1">
                <span className="font-semibold">{log.supplier_name}</span>
                <span className="text-muted-foreground"> · {log.campo}: </span>
                <span className="text-muted-foreground line-through">{log.valor_anterior}</span>
                <ArrowRight className="inline h-3 w-3 mx-1 text-muted-foreground" />
                <span className="font-semibold">{log.valor_novo}</span>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {log.data} · {log.usuario}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
