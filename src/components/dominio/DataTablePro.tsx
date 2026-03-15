import { useState, useMemo } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";

export interface ColumnDef<T> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (row: T) => React.ReactNode;
  getValue?: (row: T) => string | number;
  className?: string;
}

interface ActionDef<T> {
  label: string;
  onClick: (row: T) => void;
  variant?: "default" | "ghost" | "outline" | "destructive";
  show?: (row: T) => boolean;
}

interface DataTableProProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  actions?: ActionDef<T>[];
  pageSize?: number;
  onRowClick?: (row: T) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any

export function DataTablePro<T extends Record<string, any>>({ data, columns, actions, pageSize = 10, onRowClick }: DataTableProProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [colFilters, setColFilters] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    let result = [...data];
    for (const [key, val] of Object.entries(colFilters)) {
      if (!val) continue;
      const col = columns.find(c => c.key === key);
      const search = val.toLowerCase();
      result = result.filter(row => {
        const v = col?.getValue ? col.getValue(row) : (row as Record<string, unknown>)[key];
        return String(v ?? "").toLowerCase().includes(search);
      });
    }
    return result;
  }, [data, colFilters, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find(c => c.key === sortKey);
    return [...filtered].sort((a, b) => {
      const av = col?.getValue ? col.getValue(a) : (a as Record<string, unknown>)[sortKey];
      const bv = col?.getValue ? col.getValue(b) : (b as Record<string, unknown>)[sortKey];
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av ?? "").localeCompare(String(bv ?? ""));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50" />;
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  };

  return (
    <div className="space-y-2">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(col => (
              <TableHead key={col.key} className={col.className}>
                <div className="space-y-1">
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => col.sortable !== false && toggleSort(col.key)}
                    disabled={col.sortable === false}
                  >
                    {col.label}
                    {col.sortable !== false && <SortIcon col={col.key} />}
                  </button>
                  {col.filterable !== false && (
                    <Input
                      value={colFilters[col.key] || ""}
                      onChange={e => { setColFilters(p => ({ ...p, [col.key]: e.target.value })); setPage(0); }}
                      placeholder="Filtrar..."
                      className="h-6 text-[10px] px-1"
                    />
                  )}
                </div>
              </TableHead>
            ))}
            {actions && actions.length > 0 && <TableHead className="w-[120px]">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center text-muted-foreground py-8">
                Nenhum resultado encontrado
              </TableCell>
            </TableRow>
          ) : (
            paged.map((row, i) => (
              <TableRow
                key={i}
                className={onRowClick ? "cursor-pointer" : ""}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map(col => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </TableCell>
                ))}
                {actions && actions.length > 0 && (
                  <TableCell onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1">
                      {actions.filter(a => !a.show || a.show(row)).map((action, ai) => (
                        <Button key={ai} variant={action.variant || "ghost"} size="sm" className="h-7 text-xs px-2" onClick={() => action.onClick(row)}>
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>{sorted.length} resultado{sorted.length !== 1 ? "s" : ""}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 px-2" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <span>{page + 1} / {totalPages}</span>
            <Button variant="ghost" size="sm" className="h-7 px-2" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
