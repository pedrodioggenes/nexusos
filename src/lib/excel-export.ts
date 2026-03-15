// Excel Export Utilities for Marketing
// Uses CSV format with Excel-compatible encoding

interface ExportColumn<T> {
  key: keyof T | string;
  header: string;
  format?: 'currency' | 'percent' | 'number' | 'date' | 'text';
  getValue?: (row: T) => string | number | null | undefined;
}

const formatValue = (value: unknown, format?: string): string => {
  if (value === null || value === undefined) return '';

  switch (format) {
    case 'currency':
      const numValue = typeof value === 'number' ? value : parseFloat(String(value));
      if (isNaN(numValue)) return '';
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(numValue);
    
    case 'percent':
      const percentValue = typeof value === 'number' ? value : parseFloat(String(value));
      if (isNaN(percentValue)) return '';
      return `${percentValue.toFixed(2)}%`;
    
    case 'number':
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      if (isNaN(num)) return '';
      return new Intl.NumberFormat('pt-BR').format(num);
    
    case 'date':
      if (value instanceof Date) {
        return value.toLocaleDateString('pt-BR');
      }
      if (typeof value === 'string') {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('pt-BR');
        }
      }
      return String(value);
    
    default:
      return String(value);
  }
};

const escapeCSVValue = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Build header row
  const headerRow = columns.map(col => escapeCSVValue(col.header)).join(';');

  // Build data rows
  const dataRows = data.map(row => {
    return columns.map(col => {
      let value: unknown;
      
      if (col.getValue) {
        value = col.getValue(row);
      } else if (typeof col.key === 'string' && col.key in row) {
        value = row[col.key as keyof T];
      } else {
        value = '';
      }
      
      const formattedValue = formatValue(value, col.format);
      return escapeCSVValue(formattedValue);
    }).join(';');
  });

  // Combine all rows
  const csvContent = [headerRow, ...dataRows].join('\n');

  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Pre-built export configurations for common reports

export function exportKPIsReport(kpis: {
  period_start: string;
  period_end: string;
  roi?: number | null;
  cac?: number | null;
  ltv?: number | null;
  conversion_rate?: number | null;
  impressions?: number | null;
  clicks?: number | null;
  conversions?: number | null;
  revenue?: number | null;
}[]): void {
  exportToExcel(kpis, [
    { key: 'period_start', header: 'Período Início', format: 'date' },
    { key: 'period_end', header: 'Período Fim', format: 'date' },
    { key: 'roi', header: 'ROI (%)', format: 'percent' },
    { key: 'cac', header: 'CAC', format: 'currency' },
    { key: 'ltv', header: 'LTV', format: 'currency' },
    { key: 'conversion_rate', header: 'Taxa Conversão (%)', format: 'percent' },
    { key: 'impressions', header: 'Impressões', format: 'number' },
    { key: 'clicks', header: 'Cliques', format: 'number' },
    { key: 'conversions', header: 'Conversões', format: 'number' },
    { key: 'revenue', header: 'Receita', format: 'currency' },
  ], `kpis-marketing-${new Date().toISOString().split('T')[0]}`);
}

export function exportBudgetReport(budgets: {
  year: number;
  total_budget: number;
  categories?: { name: string; allocated_amount: number; spent_amount: number }[];
}[]): void {
  // Flatten budget with categories
  const flatData = budgets.flatMap(budget => 
    budget.categories?.map(cat => ({
      year: budget.year,
      total_budget: budget.total_budget,
      category_name: cat.name,
      allocated_amount: cat.allocated_amount,
      spent_amount: cat.spent_amount,
      remaining: cat.allocated_amount - cat.spent_amount,
      usage_percent: cat.allocated_amount > 0 ? (cat.spent_amount / cat.allocated_amount) * 100 : 0,
    })) || [{
      year: budget.year,
      total_budget: budget.total_budget,
      category_name: 'Total',
      allocated_amount: budget.total_budget,
      spent_amount: 0,
      remaining: budget.total_budget,
      usage_percent: 0,
    }]
  );

  exportToExcel(flatData, [
    { key: 'year', header: 'Ano', format: 'number' },
    { key: 'category_name', header: 'Categoria', format: 'text' },
    { key: 'allocated_amount', header: 'Valor Alocado', format: 'currency' },
    { key: 'spent_amount', header: 'Valor Gasto', format: 'currency' },
    { key: 'remaining', header: 'Saldo', format: 'currency' },
    { key: 'usage_percent', header: 'Uso (%)', format: 'percent' },
  ], `orcamento-marketing-${new Date().toISOString().split('T')[0]}`);
}

export function exportCampaignsReport(campaigns: {
  name: string;
  type: string;
  status: string;
  start_date?: string | null;
  end_date?: string | null;
  planned_budget: number;
  approved_budget: number;
  spent_amount: number;
  expected_roi?: number | null;
  actual_roi?: number | null;
  expected_reach?: number | null;
  actual_reach?: number | null;
  expected_conversions?: number | null;
  actual_conversions?: number | null;
}[]): void {
  exportToExcel(campaigns, [
    { key: 'name', header: 'Nome', format: 'text' },
    { key: 'type', header: 'Tipo', format: 'text' },
    { key: 'status', header: 'Status', format: 'text' },
    { key: 'start_date', header: 'Data Início', format: 'date' },
    { key: 'end_date', header: 'Data Fim', format: 'date' },
    { key: 'planned_budget', header: 'Orçamento Planejado', format: 'currency' },
    { key: 'approved_budget', header: 'Orçamento Aprovado', format: 'currency' },
    { key: 'spent_amount', header: 'Valor Gasto', format: 'currency' },
    { key: 'expected_roi', header: 'ROI Esperado (%)', format: 'percent' },
    { key: 'actual_roi', header: 'ROI Real (%)', format: 'percent' },
    { key: 'expected_reach', header: 'Alcance Esperado', format: 'number' },
    { key: 'actual_reach', header: 'Alcance Real', format: 'number' },
    { key: 'expected_conversions', header: 'Conversões Esperadas', format: 'number' },
    { key: 'actual_conversions', header: 'Conversões Reais', format: 'number' },
  ], `campanhas-marketing-${new Date().toISOString().split('T')[0]}`);
}

export function exportStorePerformanceReport(stores: {
  unit?: { name: string } | null;
  period_start: string;
  period_end: string;
  investment: number;
  revenue: number;
  roi?: number | null;
  impressions?: number | null;
  clicks?: number | null;
  conversions: number;
  conversion_rate?: number | null;
}[]): void {
  exportToExcel(stores, [
    { 
      key: 'store_name', 
      header: 'Loja', 
      format: 'text',
      getValue: (row) => row.unit?.name || 'N/A'
    },
    { key: 'period_start', header: 'Período Início', format: 'date' },
    { key: 'period_end', header: 'Período Fim', format: 'date' },
    { key: 'investment', header: 'Investimento', format: 'currency' },
    { key: 'revenue', header: 'Receita', format: 'currency' },
    { key: 'roi', header: 'ROI (%)', format: 'percent' },
    { key: 'impressions', header: 'Impressões', format: 'number' },
    { key: 'clicks', header: 'Cliques', format: 'number' },
    { key: 'conversions', header: 'Conversões', format: 'number' },
    { key: 'conversion_rate', header: 'Taxa Conversão (%)', format: 'percent' },
  ], `performance-lojas-${new Date().toISOString().split('T')[0]}`);
}

export function exportCoopFundsReport(funds: {
  supplier?: { name: string } | null;
  year: number;
  quarter?: number | null;
  negotiated_amount: number;
  executed_amount?: number | null;
  proven_amount?: number | null;
  utilization_rate?: number | null;
  status?: string | null;
}[]): void {
  exportToExcel(funds, [
    { 
      key: 'supplier_name', 
      header: 'Fornecedor', 
      format: 'text',
      getValue: (row) => row.supplier?.name || 'N/A'
    },
    { key: 'year', header: 'Ano', format: 'number' },
    { 
      key: 'period', 
      header: 'Período', 
      format: 'text',
      getValue: (row) => row.quarter ? `Q${row.quarter}` : 'Anual'
    },
    { key: 'negotiated_amount', header: 'Valor Negociado', format: 'currency' },
    { key: 'executed_amount', header: 'Valor Executado', format: 'currency' },
    { key: 'proven_amount', header: 'Valor Comprovado', format: 'currency' },
    { key: 'utilization_rate', header: 'Taxa Utilização (%)', format: 'percent' },
    { key: 'status', header: 'Status', format: 'text' },
  ], `verbas-cooperadas-${new Date().toISOString().split('T')[0]}`);
}
