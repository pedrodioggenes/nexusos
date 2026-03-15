import jsPDF from "jspdf";
import { INSIGHT_CONFIGS } from "./insight-config";
import type { AIInsight } from "@/hooks/useAIInsights";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ============= CSV Export =============

function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function getInsightTypeLabel(type: string): string {
  return INSIGHT_CONFIGS[type as keyof typeof INSIGHT_CONFIGS]?.label || type;
}

export function exportInsightsToCSV(insights: AIInsight[], filename: string = 'insights-export') {
  const headers = ['Data', 'Hora', 'Tipo', 'Insight', 'Confiança (%)', 'Status'];
  
  const rows = insights.map(insight => {
    const date = new Date(insight.created_at);
    return [
      format(date, 'dd/MM/yyyy', { locale: ptBR }),
      format(date, 'HH:mm', { locale: ptBR }),
      getInsightTypeLabel(insight.insight_type),
      insight.insight_text,
      insight.confidence_score?.toString() || '-',
      insight.is_dismissed ? 'Arquivado' : 'Ativo',
    ].map(v => escapeCSVValue(String(v)));
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============= PDF Export =============

interface InsightPDFFilters {
  period?: string;
  type?: string;
}

function getPeriodLabel(period?: string): string {
  switch (period) {
    case 'today': return 'Hoje';
    case 'week': return 'Esta Semana';
    case 'month': return 'Este Mês';
    default: return 'Todos os Períodos';
  }
}

export async function exportInsightsToPDF(
  insights: AIInsight[], 
  filters: InsightPDFFilters = {}
): Promise<void> {
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

  const colors = {
    primary: [139, 92, 246] as [number, number, number], // Purple
    secondary: [100, 116, 139] as [number, number, number], // Gray
    text: [30, 41, 59] as [number, number, number],
    muted: [100, 116, 139] as [number, number, number],
    success: [34, 197, 94] as [number, number, number],
    warning: [234, 179, 8] as [number, number, number],
  };

  // Helper functions
  const addPage = () => {
    pdf.addPage();
    currentY = margin;
    drawFooter();
  };

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - margin - 15) {
      addPage();
      return true;
    }
    return false;
  };

  const drawFooter = () => {
    pdf.setFontSize(8);
    pdf.setTextColor(...colors.muted);
    pdf.text(
      `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
      margin,
      pageHeight - 10
    );
    pdf.text(
      `Página ${pdf.getNumberOfPages()}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );
  };

  // ============= Cover Page =============
  
  // Header bar
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, pageWidth, 60, 'F');

  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Relatório de Insights', margin, 35);

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Análises geradas por IA', margin, 48);

  currentY = 80;

  // Summary box
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(margin, currentY, contentWidth, 50, 3, 3, 'F');
  
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Resumo do Relatório', margin + 10, currentY + 15);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  
  const activeCount = insights.filter(i => !i.is_dismissed).length;
  const archivedCount = insights.filter(i => i.is_dismissed).length;
  const avgConfidence = insights.length > 0 
    ? Math.round(insights.reduce((sum, i) => sum + (i.confidence_score || 0), 0) / insights.length)
    : 0;

  pdf.text(`Total de insights: ${insights.length}`, margin + 10, currentY + 28);
  pdf.text(`Ativos: ${activeCount} | Arquivados: ${archivedCount}`, margin + 10, currentY + 38);
  pdf.text(`Confiança média: ${avgConfidence}%`, margin + 10, currentY + 48);

  // Filters applied
  pdf.text(`Período: ${getPeriodLabel(filters.period)}`, pageWidth / 2, currentY + 28);
  const typeLabel = filters.type && filters.type !== 'all' 
    ? getInsightTypeLabel(filters.type) 
    : 'Todos os Tipos';
  pdf.text(`Tipo: ${typeLabel}`, pageWidth / 2, currentY + 38);

  currentY += 70;

  // Type breakdown
  const typeBreakdown = insights.reduce((acc, insight) => {
    acc[insight.insight_type] = (acc[insight.insight_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (Object.keys(typeBreakdown).length > 0) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Distribuição por Tipo', margin, currentY);
    currentY += 10;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    Object.entries(typeBreakdown).forEach(([type, count]) => {
      pdf.text(`• ${getInsightTypeLabel(type)}: ${count} insight${count > 1 ? 's' : ''}`, margin + 5, currentY);
      currentY += 6;
    });
  }

  drawFooter();

  // ============= Insights List =============
  
  if (insights.length > 0) {
    addPage();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(...colors.text);
    pdf.text('Insights Detalhados', margin, currentY);
    currentY += 15;

    // Group by date
    const groupedInsights = insights.reduce((acc, insight) => {
      const date = format(new Date(insight.created_at), 'dd/MM/yyyy', { locale: ptBR });
      if (!acc[date]) acc[date] = [];
      acc[date].push(insight);
      return acc;
    }, {} as Record<string, AIInsight[]>);

    for (const [date, dateInsights] of Object.entries(groupedInsights)) {
      checkPageBreak(25);

      // Date header
      pdf.setFillColor(...colors.primary);
      pdf.roundedRect(margin, currentY, 35, 8, 2, 2, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text(date, margin + 3, currentY + 5.5);
      
      pdf.setTextColor(...colors.muted);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${dateInsights.length} insight${dateInsights.length > 1 ? 's' : ''}`, margin + 40, currentY + 5.5);
      
      currentY += 15;

      for (const insight of dateInsights) {
        const textLines = pdf.splitTextToSize(insight.insight_text, contentWidth - 20);
        const boxHeight = Math.max(35, 25 + textLines.length * 5);
        
        checkPageBreak(boxHeight + 10);

        // Insight box
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(margin, currentY, contentWidth, boxHeight, 3, 3, 'F');

        // Type badge
        pdf.setFillColor(...colors.primary);
        pdf.roundedRect(margin + 5, currentY + 5, 40, 6, 2, 2, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.text(getInsightTypeLabel(insight.insight_type), margin + 7, currentY + 9);

        // Status badge
        if (insight.is_dismissed) {
          pdf.setFillColor(...colors.warning);
          pdf.roundedRect(margin + 48, currentY + 5, 22, 6, 2, 2, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.text('Arquivado', margin + 50, currentY + 9);
        }

        // Confidence
        pdf.setTextColor(...colors.muted);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        const confidenceText = `Confiança: ${insight.confidence_score || 0}%`;
        pdf.text(confidenceText, pageWidth - margin - 5, currentY + 9, { align: 'right' });

        // Time
        const time = format(new Date(insight.created_at), 'HH:mm', { locale: ptBR });
        pdf.text(time, pageWidth - margin - 35, currentY + 9, { align: 'right' });

        // Insight text
        pdf.setTextColor(...colors.text);
        pdf.setFontSize(9);
        pdf.text(textLines, margin + 5, currentY + 18);

        currentY += boxHeight + 8;
      }
    }
  }

  drawFooter();

  // Download
  pdf.save(`insights-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
