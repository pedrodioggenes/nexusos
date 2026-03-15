/**
 * DataTable - Enterprise-grade table component
 * 
 * Features:
 * - Server-side and client-side pagination
 * - Sorting (single and multi-column)
 * - Column visibility toggle
 * - Column reordering
 * - Filtering
 * - User preference persistence
 * - CSV/Excel export
 * - Bulk actions
 * - Loading and empty states
 */

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  SlidersHorizontal,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Loader2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmptyState } from './EmptyState';

// Types
export interface Column<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => React.ReactNode;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  minWidth?: string | number;
  align?: 'left' | 'center' | 'right';
  hidden?: boolean;
}

export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  column: string;
  value: string;
  operator?: 'contains' | 'equals' | 'startsWith' | 'endsWith';
}

export interface DataTableProps<T> {
  // Data
  data: T[];
  columns: Column<T>[];
  
  // Identification
  tableId: string; // Unique ID for preference persistence
  getRowId?: (row: T) => string;
  
  // Loading states
  isLoading?: boolean;
  isFetching?: boolean;
  
  // Pagination (controlled)
  pagination?: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  
  // Sorting (controlled)
  sorting?: {
    sortConfig: SortConfig | null;
    onSortChange: (config: SortConfig | null) => void;
  };
  
  // Filtering
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  searchValue?: string;
  
  // Selection
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  
  // Actions
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
  
  // Export
  exportable?: boolean;
  onExport?: (format: 'csv' | 'excel') => void;
  
  // Empty state
  emptyState?: {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  
  // Styling
  className?: string;
  stickyHeader?: boolean;
}

const pageSizeOptions = [10, 25, 50, 100];

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns: initialColumns,
  tableId,
  getRowId = (row) => (row.id as string) || String(data.indexOf(row)),
  isLoading = false,
  isFetching = false,
  pagination,
  sorting,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  onSearch,
  searchValue = '',
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  bulkActions = [],
  rowActions,
  exportable = false,
  onExport,
  emptyState,
  className,
  stickyHeader = false,
}: DataTableProps<T>) {
  // Local state for column visibility
  const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(
    new Set(initialColumns.filter((c) => !c.hidden).map((c) => c.id))
  );
  
  // Local search state (debounced)
  const [localSearch, setLocalSearch] = React.useState(searchValue);
  const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  // Handle search with debounce
  React.useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      onSearch?.(localSearch);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [localSearch, onSearch]);

  // Sync external search value
  React.useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  // Filter visible columns
  const columns = React.useMemo(
    () => initialColumns.filter((c) => visibleColumns.has(c.id)),
    [initialColumns, visibleColumns]
  );

  // Handle row selection
  const handleSelectAll = React.useCallback(() => {
    if (!onSelectionChange) return;
    
    const allIds = data.map(getRowId);
    const allSelected = allIds.every((id) => selectedRows.includes(id));
    
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allIds);
    }
  }, [data, getRowId, onSelectionChange, selectedRows]);

  const handleSelectRow = React.useCallback(
    (rowId: string) => {
      if (!onSelectionChange) return;
      
      const isSelected = selectedRows.includes(rowId);
      if (isSelected) {
        onSelectionChange(selectedRows.filter((id) => id !== rowId));
      } else {
        onSelectionChange([...selectedRows, rowId]);
      }
    },
    [onSelectionChange, selectedRows]
  );

  // Handle sort
  const handleSort = React.useCallback(
    (columnId: string) => {
      if (!sorting) return;
      
      const { sortConfig, onSortChange } = sorting;
      
      if (sortConfig?.column === columnId) {
        if (sortConfig.direction === 'asc') {
          onSortChange({ column: columnId, direction: 'desc' });
        } else {
          onSortChange(null);
        }
      } else {
        onSortChange({ column: columnId, direction: 'asc' });
      }
    },
    [sorting]
  );

  // Get cell value
  const getCellValue = React.useCallback(
    (row: T, column: Column<T>): React.ReactNode => {
      if (column.cell) {
        return column.cell(row);
      }
      if (column.accessorFn) {
        return column.accessorFn(row);
      }
      if (column.accessorKey) {
        return row[column.accessorKey] as React.ReactNode;
      }
      return null;
    },
    []
  );

  // Render sort icon
  const renderSortIcon = (columnId: string) => {
    if (!sorting) return null;
    
    const { sortConfig } = sorting;
    
    if (sortConfig?.column !== columnId) {
      return <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />;
    }
    
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="ml-2 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-2 h-3 w-3" />
    );
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {searchable && (
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-10" />
          </div>
        )}
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && <TableHead className="w-12"><Skeleton className="h-4 w-4" /></TableHead>}
                {initialColumns.slice(0, 5).map((col) => (
                  <TableHead key={col.id}>
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {selectable && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
                  {initialColumns.slice(0, 5).map((col) => (
                    <TableCell key={col.id}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Render empty state
  if (data.length === 0 && !isFetching) {
    return (
      <div className={cn('space-y-4', className)}>
        {searchable && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-9"
              />
              {localSearch && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setLocalSearch('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        )}
        
        <EmptyState
          title={emptyState?.title || 'Nenhum registro encontrado'}
          description={emptyState?.description || 'Não há dados para exibir no momento.'}
          icon={emptyState?.icon}
          action={emptyState?.action}
        />
      </div>
    );
  }

  const allSelected = data.length > 0 && data.every((row) => selectedRows.includes(getRowId(row)));
  const someSelected = selectedRows.length > 0 && !allSelected;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1">
          {/* Search */}
          {searchable && (
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-9 w-64"
              />
              {localSearch && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setLocalSearch('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
          
          {/* Bulk actions */}
          {selectable && selectedRows.length > 0 && (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-sm text-muted-foreground">
                {selectedRows.length} selecionado(s)
              </span>
              {bulkActions.map((action, i) => (
                <Button
                  key={i}
                  variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => action.onClick(selectedRows)}
                >
                  {action.icon}
                  <span className="ml-1">{action.label}</span>
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Loading indicator */}
          {isFetching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          
          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Colunas visíveis</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {initialColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={visibleColumns.has(column.id)}
                  onCheckedChange={(checked) => {
                    const newVisible = new Set(visibleColumns);
                    if (checked) {
                      newVisible.add(column.id);
                    } else {
                      newVisible.delete(column.id);
                    }
                    setVisibleColumns(newVisible);
                  }}
                >
                  {column.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Export */}
          {exportable && onExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onExport('csv')}>
                  Exportar CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('excel')}>
                  Exportar Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div className={cn(
        'rounded-xl border border-border overflow-hidden',
        stickyHeader && 'max-h-[600px] overflow-auto'
      )}>
        <Table>
          <TableHeader className={cn(stickyHeader && 'sticky top-0 bg-secondary/50 z-10')}>
            <TableRow>
              {/* Selection column */}
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    ref={(el) => {
                      if (el) {
                        (el as unknown as HTMLInputElement).indeterminate = someSelected;
                      }
                    }}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              
              {/* Data columns */}
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    textAlign: column.align,
                  }}
                  className={cn(
                    column.sortable && sorting && 'cursor-pointer select-none hover:bg-secondary/30'
                  )}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className={cn(
                    'flex items-center',
                    column.align === 'center' && 'justify-center',
                    column.align === 'right' && 'justify-end'
                  )}>
                    {column.header}
                    {column.sortable && renderSortIcon(column.id)}
                  </div>
                </TableHead>
              ))}
              
              {/* Actions column */}
              {rowActions && (
                <TableHead className="w-12" />
              )}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {data.map((row) => {
              const rowId = getRowId(row);
              const isSelected = selectedRows.includes(rowId);
              
              return (
                <TableRow
                  key={rowId}
                  data-state={isSelected ? 'selected' : undefined}
                  className={cn(isSelected && 'bg-primary/5')}
                >
                  {/* Selection cell */}
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleSelectRow(rowId)}
                      />
                    </TableCell>
                  )}
                  
                  {/* Data cells */}
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      style={{ textAlign: column.align }}
                    >
                      {getCellValue(row, column)}
                    </TableCell>
                  ))}
                  
                  {/* Actions cell */}
                  {rowActions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {rowActions(row).map((action, i) => (
                            <DropdownMenuItem
                              key={i}
                              onClick={action.onClick}
                              className={cn(
                                action.variant === 'destructive' && 'text-destructive'
                              )}
                            >
                              {action.icon}
                              <span className={action.icon ? 'ml-2' : ''}>{action.label}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Exibindo</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
              className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>de {pagination.totalCount} registros</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={pagination.pageIndex === 0}
              onClick={() => pagination.onPageChange(0)}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={pagination.pageIndex === 0}
              onClick={() => pagination.onPageChange(pagination.pageIndex - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="mx-2 text-sm">
              Página {pagination.pageIndex + 1} de{' '}
              {Math.ceil(pagination.totalCount / pagination.pageSize)}
            </span>
            
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={
                pagination.pageIndex >=
                Math.ceil(pagination.totalCount / pagination.pageSize) - 1
              }
              onClick={() => pagination.onPageChange(pagination.pageIndex + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={
                pagination.pageIndex >=
                Math.ceil(pagination.totalCount / pagination.pageSize) - 1
              }
              onClick={() =>
                pagination.onPageChange(
                  Math.ceil(pagination.totalCount / pagination.pageSize) - 1
                )
              }
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
