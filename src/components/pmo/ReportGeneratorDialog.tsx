/**
 * ReportGeneratorDialog — Reusable dialog for configuring and generating contextual reports.
 * Uses @react-pdf/renderer for real vector PDF generation.
 */
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Loader2, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/csv-export";
import React from "react";

export type ReportType =
  | "pdi_status"
  | "iniciativas"
  | "sprint_review"
  | "releases"
  | "indicadores"
  | "suporte_sla"
  | "geral";

interface ReportSection {
  key: string;
  label: string;
  defaultEnabled: boolean;
}

const REPORT_CONFIGS: Record<ReportType, { title: string; description: string; sections: ReportSection[] }> = {
  pdi_status: {
    title: "Relatório de Status PDI",
    description: "Progresso das fases, marcos e ciclos de entrega do Plano Diretor",
    sections: [
      { key: "phase_progress", label: "Progresso por Fase", defaultEnabled: true },
      { key: "gates", label: "Status dos Gates", defaultEnabled: true },
      { key: "cycles", label: "Ciclos de Entrega", defaultEnabled: true },
      { key: "timeline", label: "Timeline Visual", defaultEnabled: false },
      { key: "risks", label: "Riscos e Bloqueios", defaultEnabled: true },
      { key: "observations", label: "Observações e Notas", defaultEnabled: false },
    ],
  },
  iniciativas: {
    title: "Relatório de Iniciativas",
    description: "Pipeline de iniciativas com priorização e status por etapa",
    sections: [
      { key: "kanban_summary", label: "Resumo do Kanban", defaultEnabled: true },
      { key: "priority_matrix", label: "Matriz de Prioridade", defaultEnabled: true },
      { key: "blocked_items", label: "Itens Bloqueados", defaultEnabled: true },
      { key: "completed_period", label: "Concluídas no Período", defaultEnabled: true },
      { key: "ownership", label: "Distribuição por Dono", defaultEnabled: false },
    ],
  },
  sprint_review: {
    title: "Sprint Review Report",
    description: "Velocidade, burndown e entregáveis da sprint",
    sections: [
      { key: "velocity", label: "Velocidade e Throughput", defaultEnabled: true },
      { key: "items_delivered", label: "Itens Entregues", defaultEnabled: true },
      { key: "carryover", label: "Carryover / Spillover", defaultEnabled: true },
      { key: "goals_met", label: "Objetivos da Sprint", defaultEnabled: true },
      { key: "impediments", label: "Impedimentos", defaultEnabled: false },
    ],
  },
  releases: {
    title: "Release Notes Report",
    description: "Changelog e impacto das releases publicadas",
    sections: [
      { key: "release_summary", label: "Sumário de Releases", defaultEnabled: true },
      { key: "modules_impacted", label: "Aplicativos Impactados", defaultEnabled: true },
      { key: "changelog", label: "Changelog Detalhado", defaultEnabled: true },
      { key: "deployment_status", label: "Status de Deploy", defaultEnabled: false },
    ],
  },
  indicadores: {
    title: "Relatório de Indicadores",
    description: "KPIs operacionais, valor entregue e tendências",
    sections: [
      { key: "kpi_cards", label: "KPIs Principais", defaultEnabled: true },
      { key: "value_delivered", label: "Valor Entregue (R$)", defaultEnabled: true },
      { key: "trends", label: "Tendências (6 meses)", defaultEnabled: true },
      { key: "solution_breakdown", label: "Breakdown por Solução", defaultEnabled: false },
    ],
  },
  suporte_sla: {
    title: "Relatório de Suporte & SLA",
    description: "Compliance de SLA, tickets e tempo de resposta",
    sections: [
      { key: "sla_compliance", label: "Compliance de SLA", defaultEnabled: true },
      { key: "ticket_volume", label: "Volume de Tickets", defaultEnabled: true },
      { key: "response_time", label: "Tempo de Resposta", defaultEnabled: true },
      { key: "resolution_rate", label: "Taxa de Resolução", defaultEnabled: true },
    ],
  },
  geral: {
    title: "Relatório Geral Executivo",
    description: "Visão consolidada de todas as áreas do Tech",
    sections: [
      { key: "pdi_overview", label: "Resumo PDI", defaultEnabled: true },
      { key: "initiatives_summary", label: "Pipeline de Iniciativas", defaultEnabled: true },
      { key: "sprint_status", label: "Sprint Atual", defaultEnabled: true },
      { key: "releases_recent", label: "Releases Recentes", defaultEnabled: true },
      { key: "kpi_highlights", label: "Indicadores-Chave", defaultEnabled: true },
      { key: "risks_blockers", label: "Riscos e Bloqueios", defaultEnabled: true },
      { key: "governance_log", label: "Log de Governança", defaultEnabled: false },
      { key: "ai_insights", label: "Insights com IA", defaultEnabled: false },
    ],
  },
};

interface ReportGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: ReportType;
  /** Optional data to export as CSV */
  exportData?: { data: any[]; headers: { key: string; label: string }[]; filename: string };
  /** Optional callback when report is generated */
  onGenerate?: (config: { sections: string[]; period: string; format: string; comments: string }) => void;
}

export function ReportGeneratorDialog({
  open,
  onOpenChange,
  reportType,
  exportData,
  onGenerate,
}: ReportGeneratorDialogProps) {
  const config = REPORT_CONFIGS[reportType];
  const [enabledSections, setEnabledSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(config.sections.map(s => [s.key, s.defaultEnabled]))
  );
  const [period, setPeriod] = useState("current_month");
  const [format, setFormat] = useState("pdf");
  const [comments, setComments] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleSection = (key: string) => {
    setEnabledSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedCount = Object.values(enabledSections).filter(Boolean).length;

  const getPeriodLabel = () => {
    const now = new Date();
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    switch (period) {
      case "current_week": return `Semana ${now.toLocaleDateString("pt-BR")}`;
      case "current_month": return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
      case "last_30d": return `Últimos 30 dias`;
      case "current_quarter": {
        const q = Math.ceil((now.getMonth() + 1) / 3);
        return `Q${q} ${now.getFullYear()}`;
      }
      case "ytd": return `YTD ${now.getFullYear()}`;
      default: return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const selectedSections = Object.entries(enabledSections)
        .filter(([, enabled]) => enabled)
        .map(([key]) => key);

      if (format === "csv" && exportData) {
        exportToCSV(exportData.data, exportData.filename, exportData.headers);
        toast.success("CSV exportado com sucesso!");
        onOpenChange(false);
        return;
      }

      // Notify parent if callback provided
      onGenerate?.({ sections: selectedSections, period, format, comments });

      // Generate real PDF using @react-pdf/renderer
      const { PMOReportDocument } = await import("@/lib/pdf/templates/pmo-report-template");
      const { generateAndDownloadPDF } = await import("@/lib/pdf/generate-report");
      const { BRAND } = await import("@/lib/pdf/theme");

      const periodLabel = getPeriodLabel();

      // Build sample KPIs based on report type
      const kpis = buildKpisForType(reportType, BRAND);

      const reportData = {
        reportType,
        reportTitle: config.title,
        reportSubtitle: config.description,
        period: periodLabel,
        companyName: "Empresa",
        sections: selectedSections,
        comments: comments || undefined,
        kpis,
        tables: buildTablesForType(reportType, selectedSections),
        alerts: buildAlertsForType(reportType, selectedSections),
        insights: buildInsightsForType(reportType, selectedSections),
      };

      const doc = React.createElement(PMOReportDocument, { data: reportData });
      const fileName = `${config.title.replace(/\s+/g, "_")}_${periodLabel.replace(/\s+/g, "_")}`;

      await generateAndDownloadPDF(doc, fileName);
      toast.success(`Relatório "${config.title}" gerado com sucesso!`);
      onOpenChange(false);
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Erro ao gerar relatório PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-app-pmo" />
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Period */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Período</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="current_week">Semana Atual</SelectItem>
                <SelectItem value="current_month">Mês Atual</SelectItem>
                <SelectItem value="last_30d">Últimos 30 dias</SelectItem>
                <SelectItem value="current_quarter">Trimestre Atual</SelectItem>
                <SelectItem value="ytd">Ano até aqui (YTD)</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
            {period === "custom" && (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input type="date" placeholder="Início" />
                <Input type="date" placeholder="Fim" />
              </div>
            )}
          </div>

          {/* Sections */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Seções do Relatório</Label>
              <Badge variant="outline" className="text-[10px]">{selectedCount}/{config.sections.length} selecionadas</Badge>
            </div>
            <div className="space-y-1.5 rounded-lg border border-border p-3 bg-muted/20">
              {config.sections.map(section => (
                <label
                  key={section.key}
                  className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={enabledSections[section.key]}
                    onCheckedChange={() => toggleSection(section.key)}
                  />
                  <span className="text-sm text-foreground">{section.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Format */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Formato</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF (Relatório Visual)</SelectItem>
                <SelectItem value="csv">CSV (Dados Tabulares)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Comentários Qualitativos <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              placeholder="Destaques, bloqueios, decisões estratégicas..."
              rows={3}
              className="text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || selectedCount === 0}
            className="flex-1 bg-app-pmo hover:bg-app-pmo/90 text-white gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : format === "csv" ? (
              <Download className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {isGenerating ? "Gerando..." : "Gerar Relatório"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Simple button to trigger report generation from any page */
export function ReportButton({
  reportType,
  label = "Relatório",
  exportData,
  onGenerate,
  variant = "outline",
}: {
  reportType: ReportType;
  label?: string;
  exportData?: ReportGeneratorDialogProps["exportData"];
  onGenerate?: ReportGeneratorDialogProps["onGenerate"];
  variant?: "outline" | "default" | "ghost";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant={variant} onClick={() => setOpen(true)} className="gap-1.5">
        <FileText className="h-3.5 w-3.5" />
        {label}
      </Button>
      <ReportGeneratorDialog
        open={open}
        onOpenChange={setOpen}
        reportType={reportType}
        exportData={exportData}
        onGenerate={onGenerate}
      />
    </>
  );
}

// ── Data builders (placeholder data when no real data available) ──

function buildKpisForType(reportType: ReportType, BRAND: any) {
  const commonKpis = [
    { label: "Progresso Geral", value: "72%", change: "▲ 5pp", changeType: "positive" as const, accentColor: BRAND.green },
    { label: "Itens Concluídos", value: "34", change: "▲ 12%", changeType: "positive" as const, accentColor: BRAND.blue },
    { label: "Itens Pendentes", value: "18", change: "▼ 3", changeType: "negative" as const, accentColor: BRAND.orange },
    { label: "Bloqueios Ativos", value: "4", change: "Requer atenção", changeType: "negative" as const, accentColor: BRAND.red },
  ];

  switch (reportType) {
    case "pdi_status":
      return [
        { label: "Fases Concluídas", value: "3/6", change: "50%", changeType: "positive" as const, accentColor: BRAND.green },
        { label: "Gates Aprovados", value: "2", accentColor: BRAND.blue },
        { label: "Ciclos Ativos", value: "5", accentColor: BRAND.teal },
        { label: "Dias até Próximo Gate", value: "15", accentColor: BRAND.orange },
      ];
    case "sprint_review":
      return [
        { label: "Velocidade", value: "42 pts", change: "▲ 8%", changeType: "positive" as const, accentColor: BRAND.green },
        { label: "Itens Entregues", value: "18/22", change: "82%", changeType: "positive" as const, accentColor: BRAND.blue },
        { label: "Carryover", value: "4", change: "▼ 2", changeType: "positive" as const, accentColor: BRAND.orange },
        { label: "Bugs Resolvidos", value: "7", accentColor: BRAND.teal },
      ];
    default:
      return commonKpis;
  }
}

function buildTablesForType(reportType: ReportType, sections: string[]) {
  const tables: Record<string, any> = {};

  if (reportType === "pdi_status" && sections.includes("phase_progress")) {
    tables.phase_progress = {
      title: "Progresso por Fase",
      columns: [
        { key: "phase", label: "Fase", width: "30%" },
        { key: "status", label: "Status", width: "20%" },
        { key: "progress", label: "Progresso", width: "15%", align: "right" },
        { key: "target", label: "Meta", width: "15%", align: "right" },
        { key: "responsible", label: "Responsável", width: "20%" },
      ],
      rows: [
        { phase: "F0 - Preparação", status: "Concluída", progress: "100%", target: "100%", responsible: "PMO" },
        { phase: "F1 - Discovery", status: "Concluída", progress: "100%", target: "100%", responsible: "Produto" },
        { phase: "F2 - Design", status: "Em Andamento", progress: "75%", target: "100%", responsible: "UX/UI" },
        { phase: "F3 - Desenvolvimento", status: "Planejada", progress: "20%", target: "60%", responsible: "Eng." },
        { phase: "F4 - Testes", status: "Planejada", progress: "0%", target: "0%", responsible: "QA" },
        { phase: "F5 - Deploy", status: "Planejada", progress: "0%", target: "0%", responsible: "DevOps" },
      ],
    };
  }

  if (reportType === "iniciativas" && sections.includes("kanban_summary")) {
    tables.kanban_summary = {
      title: "Resumo do Pipeline de Iniciativas",
      columns: [
        { key: "initiative", label: "Iniciativa", width: "35%" },
        { key: "area", label: "Área", width: "15%" },
        { key: "status", label: "Status", width: "15%" },
        { key: "priority", label: "Prioridade", width: "15%" },
        { key: "owner", label: "Responsável", width: "20%" },
      ],
      rows: [
        { initiative: "Migração Cloud", area: "Infra", status: "Em Andamento", priority: "Alta", owner: "DevOps" },
        { initiative: "Novo CRM", area: "Produto", status: "Em Andamento", priority: "Crítica", owner: "Produto" },
        { initiative: "App Mobile v2", area: "Mobile", status: "Backlog", priority: "Média", owner: "Mobile" },
      ],
    };
  }

  if (reportType === "sprint_review" && sections.includes("items_delivered")) {
    tables.items_delivered = {
      title: "Itens Entregues na Sprint",
      columns: [
        { key: "item", label: "Item", width: "40%" },
        { key: "type", label: "Tipo", width: "15%" },
        { key: "points", label: "Pontos", width: "15%", align: "right" },
        { key: "status", label: "Status", width: "15%" },
        { key: "assignee", label: "Dev", width: "15%" },
      ],
      rows: [
        { item: "Login social Google", type: "Feature", points: "5", status: "Concluída", assignee: "Ana" },
        { item: "Fix checkout flow", type: "Bug", points: "3", status: "Concluída", assignee: "Carlos" },
        { item: "Dashboard analytics", type: "Feature", points: "8", status: "Concluída", assignee: "Maria" },
      ],
    };
  }

  if (reportType === "releases" && sections.includes("release_summary")) {
    tables.release_summary = {
      title: "Releases Publicadas",
      columns: [
        { key: "version", label: "Versão", width: "15%" },
        { key: "date", label: "Data", width: "15%" },
        { key: "type", label: "Tipo", width: "15%" },
        { key: "items", label: "Itens", width: "10%", align: "right" },
        { key: "description", label: "Descrição", width: "45%" },
      ],
      rows: [
        { version: "v2.4.0", date: "15/02/2026", type: "Major", items: "12", description: "Novo aplicativo de relatórios" },
        { version: "v2.3.1", date: "08/02/2026", type: "Patch", items: "4", description: "Correções de performance" },
      ],
    };
  }

  return Object.keys(tables).length > 0 ? tables : undefined;
}

function buildAlertsForType(reportType: ReportType, sections: string[]) {
  if (reportType === "pdi_status" && sections.includes("risks")) {
    return [
      { title: "Risco", message: "Fase F3 com atraso de 2 semanas no cronograma. Necessário realocar recursos.", type: "danger" as const },
      { title: "Atenção", message: "Budget de cloud computing atingiu 85% da previsão trimestral.", type: "warning" as const },
      { title: "Oportunidade", message: "Parceria com fornecedor pode acelerar entregas do F4 em 30%.", type: "success" as const },
    ];
  }
  if (reportType === "geral" && sections.includes("risks_blockers")) {
    return [
      { title: "Bloqueio", message: "Dependência de API externa atrasando aplicativo de integração.", type: "danger" as const },
      { title: "Atenção", message: "3 sprints consecutivas com carryover acima de 20%.", type: "warning" as const },
    ];
  }
  return undefined;
}

function buildInsightsForType(reportType: ReportType, sections: string[]) {
  if (reportType === "geral") {
    return [
      { title: "Velocidade crescente", text: "Throughput aumentou 15% nos últimos 3 sprints.", type: "success" as const },
      { title: "Dívida técnica", text: "Acumulado de 23 itens técnicos no backlog requer atenção.", type: "warning" as const },
      { title: "Satisfação do time", text: "NPS interno subiu para 78 pontos no último ciclo.", type: "opportunity" as const },
      { title: "Custo por feature", text: "Redução de 12% no custo médio por feature entregue.", type: "success" as const },
    ];
  }
  return undefined;
}
