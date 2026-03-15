/**
 * EnterpriseDataTable - DataTable with persistence and client-side operations
 * 
 * Wraps DataTable with:
 * - User preference persistence (columns, page size, sort)
 * - Client-side search, sort, pagination
 * - Export functionality
 */

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { DataTable, Column, SortConfig } from "@/components/ui/data-table";
import { useTablePreferences } from "@/hooks/useTablePreferences";
import { EmptyState, EmptyStateProps } from "@/components/ui/EmptyState";

// Helper to convert values for comparison
function toComparable(v: unknown): string | number {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime();
  return String(v).toLowerCase();
}

// Client-side search
function applySearch<T extends Record<string, unknown>>(
  rows: T[],
  search: string,
  columns: Column<T>[],
  visibleColumns: string[]
): T[] {
  const q = search.trim().toLowerCase();
  if (!q) return rows;

  const searchableCols = columns.filter(
    (c) => visibleColumns.includes(c.id) && c.accessorKey
  );

  return rows.filter((row) => {
    for (const c of searchableCols) {
      const key = c.accessorKey as string;
      const value = row[key];
      if (String(value ?? "").toLowerCase().includes(q)) return true;
    }
    return false;
  });
}

// Client-side sort
function applySort<T extends Record<string, unknown>>(
  rows: T[],
  sort: SortConfig | null
): T[] {
  if (!sort?.column) return rows;

  const sorted = [...rows].sort((a, b) => {
    const av = toComparable(a[sort.column]);
    const bv = toComparable(b[sort.column]);

    if (typeof av === "number" && typeof bv === "number") return av - bv;
    return String(av).localeCompare(String(bv));
  });

  return sort.direction === "desc" ? sorted.reverse() : sorted;
}

export interface EnterpriseDataTableProps<T extends Record<string, unknown>> {
  tableId: string;
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyState?: EmptyStateProps;
  exportable?: boolean;
  onExport?: (rows: T[], fileName: string) => void;
  getRowId?: (row: T) => string;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  bulkActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedIds: string[]) => void;
    variant?: 'default' | 'destructive';
  }>;
  rowActions?: (row: T) => Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'destructive';
  }>;
  className?: string;
  stickyHeader?: boolean;
}

export function EnterpriseDataTable<T extends Record<string, unknown>>({
  tableId,
  data,
  columns,
  loading = false,
  emptyState,
  exportable = false,
  onExport,
  getRowId,
  selectable,
  selectedRows,
  onSelectionChange,
  bulkActions,
  rowActions,
  className,
  stickyHeader,
}: EnterpriseDataTableProps<T>) {
  const defaultColumns = useMemo(() => columns.map((c) => c.id), [columns]);

  const {
    preferences,
    isLoading: prefsLoading,
    setVisibleColumns,
    setPageSize,
    setSortConfig,
  } = useTablePreferences({
    tableId,
    defaultColumns,
    defaultPageSize: 25,
  });

  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  // Reset page when search changes
  useEffect(() => {
    setPageIndex(0);
  }, [search]);

  // Visible columns from preferences
  const visibleCols = preferences.visible_columns?.length > 0 
    ? preferences.visible_columns 
    : defaultColumns;

  // Apply client-side search
  const filtered = useMemo(
    () => applySearch(data, search, columns, visibleCols),
    [data, search, columns, visibleCols]
  );

  // Apply client-side sort
  const sorted = useMemo(
    () => applySort(filtered, preferences.sort_config ?? null),
    [filtered, preferences.sort_config]
  );

  // Pagination
  const totalCount = sorted.length;
  const pageSize = preferences.page_size ?? 25;
  const pageStart = pageIndex * pageSize;
  const pageEnd = pageStart + pageSize;

  const paginated = useMemo(
    () => sorted.slice(pageStart, pageEnd),
    [sorted, pageStart, pageEnd]
  );

  // Pagination config for DataTable
  const pagination = {
    pageIndex,
    pageSize,
    totalCount,
    onPageChange: setPageIndex,
    onPageSizeChange: (size: number) => {
      setPageSize(size);
      setPageIndex(0);
    },
  };

  // Sorting config for DataTable
  const sorting = {
    sortConfig: preferences.sort_config ?? null,
    onSortChange: (cfg: SortConfig | null) => {
      setSortConfig(cfg);
      setPageIndex(0);
    },
  };

  // Handle column visibility changes
  const handleVisibleColumnsChange = useCallback(
    (cols: Set<string>) => {
      setVisibleColumns(Array.from(cols));
    },
    [setVisibleColumns]
  );

  // Handle export
  const handleExport = useCallback(
    (format: 'csv' | 'excel') => {
      if (onExport) {
        onExport(sorted, `${tableId}-export`);
      }
    },
    [onExport, sorted, tableId]
  );

  // Build columns with visibility applied
  const columnsWithVisibility = useMemo(
    () =>
      columns.map((col) => ({
        ...col,
        hidden: !visibleCols.includes(col.id),
      })),
    [columns, visibleCols]
  );

  return (
    <DataTable
      data={paginated}
      columns={columnsWithVisibility}
      tableId={tableId}
      getRowId={getRowId}
      isLoading={loading || prefsLoading}
      isFetching={false}
      pagination={pagination}
      sorting={sorting}
      searchable
      searchPlaceholder="Buscar..."
      onSearch={setSearch}
      searchValue={search}
      selectable={selectable}
      selectedRows={selectedRows}
      onSelectionChange={onSelectionChange}
      bulkActions={bulkActions}
      rowActions={rowActions}
      exportable={exportable}
      onExport={onExport ? handleExport : undefined}
      emptyState={emptyState}
      className={className}
      stickyHeader={stickyHeader}
    />
  );
}

export default EnterpriseDataTable;
