import jsPDF from 'jspdf';

export type ReportPeriod = 'month' | 'quarter' | 'year' | 'custom';
export type ReportType = 'executive' | 'summary' | 'performance' | 'budget';

export interface ReportSections {
  executiveSummary: boolean;
  budgetAnalysis: boolean;
  channelPerformance: boolean;
  marketingActions: boolean;
  conclusions: boolean;
}

export interface ReportConfig {
  period: ReportPeriod;
  periodStart?: Date;
  periodEnd?: Date;
  reportType: ReportType;
  sections: ReportSections;
  includeAIInsights: boolean;
  companyName?: string;
}

export interface ReportData {
  kpis?: {
    roi?: number | null;
    revenue?: number | null;
    conversions?: number | null;
    conversionRate?: number | null;
    cac?: number | null;
    ltv?: number | null;
    impressions?: number | null;
    clicks?: number | null;
  };
  budget?: {
    total: number;
    spent: number;
    available: number;
    categories: Array<{
      name: string;
      allocated: number;
      spent: number;
      color: string;
    }>;
  };
  actions?: Array<{
    title: string;
    type: string;
    status: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
  }>;
  aiInsights?: string;
}

// Colors from design system
const COLORS = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#808080',
  lightGray: '#E5E5E5',
  darkGray: '#1A1A1A',
  blue: '#2563EB',
  red: '#A51C1C', // brand-red
  yellow: '#FFC107', // brand-yellow
  success: '#22C55E',
  warning: '#EAB308',
};

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(1)}%`;
}

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('pt-BR').format(value);
}

function getPeriodLabel(config: ReportConfig): string {
  const now = new Date();
  switch (config.period) {
    case 'month':
      return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(now);
    case 'quarter':
      const quarter = Math.ceil((now.getMonth() + 1) / 3);
      return `${quarter}º Trimestre ${now.getFullYear()}`;
    case 'year':
      return `Ano ${now.getFullYear()}`;
    case 'custom':
      if (config.periodStart && config.periodEnd) {
        const start = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(config.periodStart);
        const end = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(config.periodEnd);
        return `${start} - ${end}`;
      }
      return 'Período Personalizado';
    default:
      return '';
  }
}

function getReportTypeLabel(type: ReportConfig['reportType']): string {
  switch (type) {
    case 'executive': return 'Relatório Executivo';
    case 'summary': return 'Resumo Executivo';
    case 'performance': return 'Relatório de Performance';
    case 'budget': return 'Relatório de Orçamento';
    default: return 'Relatório';
  }
}

export async function generateExecutiveReport(
  config: ReportConfig,
  data: ReportData
): Promise<jsPDF> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  // Helper functions
  const addPage = () => {
    pdf.addPage();
    currentY = margin;
  };

  const checkPageBreak = (neededSpace: number) => {
    if (currentY + neededSpace > pageHeight - margin) {
      addPage();
      return true;
    }
    return false;
  };

  const drawFooter = (pageNum: number, totalPages: number) => {
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `Gerado pelo Marketing | ${new Date().toLocaleDateString('pt-BR')}`,
      margin,
      pageHeight - 10
    );
    pdf.text(
      `Página ${pageNum} de ${totalPages}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );
  };

  // ============ COVER PAGE ============
  // Background
  pdf.setFillColor(0, 0, 0);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Top accent line
  pdf.setFillColor(165, 28, 28); // brand-red
  pdf.rect(0, 0, pageWidth, 3, 'F');

  // Logo placeholder (text-based)
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('nexusOS', pageWidth / 2, 60, { align: 'center' });

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(128, 128, 128);
  pdf.text('Relatório Executivo', pageWidth / 2, 70, { align: 'center' });

  // Report title
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  const reportTitle = getReportTypeLabel(config.reportType);
  pdf.text(reportTitle, pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });

  // Period
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(200, 200, 200);
  pdf.text(getPeriodLabel(config), pageWidth / 2, pageHeight / 2, { align: 'center' });

  // Generated date
  pdf.setFontSize(10);
  pdf.setTextColor(128, 128, 128);
  pdf.text(
    `Gerado em ${new Date().toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })}`,
    pageWidth / 2,
    pageHeight - 40,
    { align: 'center' }
  );

  // Confidential badge
  pdf.setFontSize(9);
  pdf.setTextColor(165, 28, 28);
  pdf.text('CONFIDENCIAL', pageWidth / 2, pageHeight - 25, { align: 'center' });

  let pageCount = 1;

  // ============ EXECUTIVE SUMMARY ============
  if (config.sections.executiveSummary && data.kpis) {
    addPage();
    pageCount++;

    // Page background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Header line
    pdf.setFillColor(165, 28, 28);
    pdf.rect(0, 0, pageWidth, 2, 'F');

    currentY = 30;

    // Section title
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Resumo Executivo', margin, currentY);
    currentY += 15;

    // Subtitle
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Principais indicadores de performance do período', margin, currentY);
    currentY += 20;

    // KPI Cards - 2x2 grid
    const kpiCardWidth = (contentWidth - 10) / 2;
    const kpiCardHeight = 40;

    const kpis = [
      { label: 'ROI', value: formatPercent(data.kpis.roi), color: COLORS.success },
      { label: 'Receita', value: formatCurrency(data.kpis.revenue), color: COLORS.blue },
      { label: 'Conversões', value: formatNumber(data.kpis.conversions), color: COLORS.blue },
      { label: 'Taxa de Conversão', value: formatPercent(data.kpis.conversionRate), color: COLORS.success },
      { label: 'CAC', value: formatCurrency(data.kpis.cac), color: COLORS.warning },
      { label: 'LTV', value: formatCurrency(data.kpis.ltv), color: COLORS.blue },
    ];

    kpis.forEach((kpi, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = margin + col * (kpiCardWidth + 10);
      const y = currentY + row * (kpiCardHeight + 10);

      // Card background
      pdf.setFillColor(248, 249, 250);
      pdf.roundedRect(x, y, kpiCardWidth, kpiCardHeight, 4, 4, 'F');

      // Left accent
      pdf.setFillColor(
        parseInt(kpi.color.slice(1, 3), 16),
        parseInt(kpi.color.slice(3, 5), 16),
        parseInt(kpi.color.slice(5, 7), 16)
      );
      pdf.rect(x, y, 3, kpiCardHeight, 'F');

      // Label
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(kpi.label, x + 10, y + 12);

      // Value
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(kpi.value, x + 10, y + 30);
    });

    currentY += Math.ceil(kpis.length / 2) * (kpiCardHeight + 10) + 20;

    // Impressions and Clicks section
    if (data.kpis.impressions || data.kpis.clicks) {
      checkPageBreak(50);

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Métricas de Alcance', margin, currentY);
      currentY += 15;

      const metricsText = [
        `Impressões: ${formatNumber(data.kpis.impressions)}`,
        `Cliques: ${formatNumber(data.kpis.clicks)}`,
      ];

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      metricsText.forEach(text => {
        pdf.text(text, margin, currentY);
        currentY += 8;
      });
    }
  }

  // ============ BUDGET ANALYSIS ============
  if (config.sections.budgetAnalysis && data.budget) {
    addPage();
    pageCount++;

    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    pdf.setFillColor(165, 28, 28);
    pdf.rect(0, 0, pageWidth, 2, 'F');

    currentY = 30;

    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Análise de Orçamento', margin, currentY);
    currentY += 15;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Distribuição e utilização do budget de marketing', margin, currentY);
    currentY += 25;

    // Budget overview cards
    const budgetCards = [
      { label: 'Orçamento Total', value: formatCurrency(data.budget.total), color: COLORS.blue },
      { label: 'Utilizado', value: formatCurrency(data.budget.spent), color: COLORS.warning },
      { label: 'Disponível', value: formatCurrency(data.budget.available), color: COLORS.success },
    ];

    const cardWidth = (contentWidth - 20) / 3;
    const cardHeight = 35;

    budgetCards.forEach((card, index) => {
      const x = margin + index * (cardWidth + 10);

      pdf.setFillColor(248, 249, 250);
      pdf.roundedRect(x, currentY, cardWidth, cardHeight, 4, 4, 'F');

      pdf.setFillColor(
        parseInt(card.color.slice(1, 3), 16),
        parseInt(card.color.slice(3, 5), 16),
        parseInt(card.color.slice(5, 7), 16)
      );
      pdf.rect(x, currentY, 3, cardHeight, 'F');

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(card.label, x + 10, currentY + 12);

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(card.value, x + 10, currentY + 26);
    });

    currentY += cardHeight + 25;

    // Progress bar
    const utilizationPercent = data.budget.total > 0 
      ? (data.budget.spent / data.budget.total) * 100 
      : 0;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Utilização: ${utilizationPercent.toFixed(1)}%`, margin, currentY);
    currentY += 10;

    // Progress bar background
    pdf.setFillColor(230, 230, 230);
    pdf.roundedRect(margin, currentY, contentWidth, 10, 5, 5, 'F');

    // Progress bar fill
    const progressColor = utilizationPercent > 90 ? COLORS.red : 
                          utilizationPercent > 70 ? COLORS.warning : COLORS.success;
    pdf.setFillColor(
      parseInt(progressColor.slice(1, 3), 16),
      parseInt(progressColor.slice(3, 5), 16),
      parseInt(progressColor.slice(5, 7), 16)
    );
    const progressWidth = (contentWidth * Math.min(utilizationPercent, 100)) / 100;
    if (progressWidth > 0) {
      pdf.roundedRect(margin, currentY, progressWidth, 10, 5, 5, 'F');
    }
    currentY += 25;

    // Categories table
    if (data.budget.categories && data.budget.categories.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Categorias de Orçamento', margin, currentY);
      currentY += 15;

      // Table header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, currentY, contentWidth, 10, 'F');

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(80, 80, 80);
      pdf.text('Categoria', margin + 5, currentY + 7);
      pdf.text('Alocado', margin + 70, currentY + 7);
      pdf.text('Utilizado', margin + 110, currentY + 7);
      pdf.text('% Uso', margin + 150, currentY + 7);
      currentY += 12;

      // Table rows
      pdf.setFont('helvetica', 'normal');
      data.budget.categories.forEach((cat, index) => {
        const usage = cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0;

        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(margin, currentY - 5, contentWidth, 12, 'F');
        }

        pdf.setTextColor(40, 40, 40);
        pdf.text(cat.name, margin + 5, currentY + 3);
        pdf.text(formatCurrency(cat.allocated), margin + 70, currentY + 3);
        pdf.text(formatCurrency(cat.spent), margin + 110, currentY + 3);

        const usageColor = usage > 90 ? COLORS.red : usage > 70 ? COLORS.warning : COLORS.success;
        pdf.setTextColor(
          parseInt(usageColor.slice(1, 3), 16),
          parseInt(usageColor.slice(3, 5), 16),
          parseInt(usageColor.slice(5, 7), 16)
        );
        pdf.text(`${usage.toFixed(0)}%`, margin + 150, currentY + 3);

        currentY += 12;
      });
    }
  }

  // ============ MARKETING ACTIONS ============
  if (config.sections.marketingActions && data.actions && data.actions.length > 0) {
    addPage();
    pageCount++;

    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    pdf.setFillColor(165, 28, 28);
    pdf.rect(0, 0, pageWidth, 2, 'F');

    currentY = 30;

    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Ações de Marketing', margin, currentY);
    currentY += 15;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Campanhas e iniciativas realizadas no período', margin, currentY);
    currentY += 25;

    data.actions.forEach((action, index) => {
      checkPageBreak(40);

      // Action card
      pdf.setFillColor(248, 249, 250);
      pdf.roundedRect(margin, currentY, contentWidth, 35, 4, 4, 'F');

      // Status indicator
      const statusColor = action.status === 'completed' ? COLORS.success :
                          action.status === 'in_progress' ? COLORS.blue : COLORS.gray;
      pdf.setFillColor(
        parseInt(statusColor.slice(1, 3), 16),
        parseInt(statusColor.slice(3, 5), 16),
        parseInt(statusColor.slice(5, 7), 16)
      );
      pdf.circle(margin + 10, currentY + 17.5, 3, 'F');

      // Title
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(action.title, margin + 20, currentY + 14);

      // Details
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      const details = [];
      if (action.type) details.push(action.type);
      if (action.startDate) details.push(action.startDate);
      if (action.budget) details.push(formatCurrency(action.budget));
      pdf.text(details.join(' • '), margin + 20, currentY + 26);

      currentY += 42;
    });
  }

  // ============ AI INSIGHTS / CONCLUSIONS ============
  if (config.sections.conclusions) {
    addPage();
    pageCount++;

    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    pdf.setFillColor(165, 28, 28);
    pdf.rect(0, 0, pageWidth, 2, 'F');

    currentY = 30;

    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Conclusões e Recomendações', margin, currentY);
    currentY += 25;

    if (config.includeAIInsights && data.aiInsights) {
      // AI badge
      pdf.setFillColor(37, 99, 235);
      pdf.roundedRect(margin, currentY, 80, 20, 4, 4, 'F');
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text('✨ Insights gerados por IA', margin + 5, currentY + 13);
      currentY += 30;

      // AI content
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(40, 40, 40);

      const lines = pdf.splitTextToSize(data.aiInsights, contentWidth);
      lines.forEach((line: string) => {
        checkPageBreak(10);
        pdf.text(line, margin, currentY);
        currentY += 7;
      });
    } else {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('As conclusões e próximos passos serão adicionados manualmente.', margin, currentY);
    }
  }

  // Add footers to all pages
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    if (i > 1) { // Skip cover page
      drawFooter(i - 1, totalPages - 1);
    }
  }

  return pdf;
}

export function downloadPDF(pdf: jsPDF, filename: string): void {
  pdf.save(filename);
}
