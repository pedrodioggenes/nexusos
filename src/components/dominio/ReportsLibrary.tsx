import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Download, Eye, Clock, ChevronRight } from "lucide-react";
import { REPORT_TEMPLATES, type ReportTemplate, type ReportSection } from "@/data/dominio/inteligencia-mock";
import { useToast } from "@/hooks/use-toast";

function RenderSection({ section }: { section: ReportSection }) {
  if (section.type === "text") {
    return (
      <div className="space-y-1">
        <h4 className="font-semibold text-sm">{section.title}</h4>
        <p className="text-sm text-muted-foreground whitespace-pre-line">{section.data as string}</p>
      </div>
    );
  }

  if (section.type === "kpi") {
    const items = section.data as Record<string, string | number>[];
    return (
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">{section.title}</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {items.map((item, i) => (
            <Card key={i} className="p-3 bg-muted/30">
              <p className="text-[11px] text-muted-foreground">{item.indicador}</p>
              <p className="text-lg font-bold">{item.valor}</p>
              {item.variacao && <p className="text-xs text-muted-foreground">{item.variacao}</p>}
              {item.meta && <p className="text-xs text-muted-foreground">Meta: {item.meta}</p>}
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // table
  const rows = section.data as Record<string, string | number>[];
  if (!rows.length) return null;
  const cols = Object.keys(rows[0]);

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm">{section.title}</h4>
      <div className="overflow-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {cols.map((c) => (
                <TableHead key={c} className="text-xs capitalize">{c.replace(/_/g, " ")}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                {cols.map((c) => (
                  <TableCell key={c} className="text-xs">{String(row[c])}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function ReportsLibrary() {
  const { toast } = useToast();
  const [viewReport, setViewReport] = useState<ReportTemplate | null>(null);

  const handleExport = (report: ReportTemplate) => {
    toast({
      title: "Exportação iniciada",
      description: `O relatório "${report.name}" será gerado em PDF. (placeholder)`,
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORT_TEMPLATES.map((report) => (
          <Card key={report.id} className="p-5 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">{report.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{report.description}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">{report.frequency}</span>
                  <Badge variant="outline" className="text-[10px] h-4 ml-1">
                    {report.sections.length} seções
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Button size="sm" className="h-7 text-xs gap-1" onClick={() => setViewReport(report)}>
                    <Eye className="h-3 w-3" />
                    Gerar
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => handleExport(report)}>
                    <Download className="h-3 w-3" />
                    Exportar
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Report viewer dialog */}
      <Dialog open={!!viewReport} onOpenChange={(open) => !open && setViewReport(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {viewReport?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-2">
            {viewReport?.sections.map((section, i) => (
              <RenderSection key={i} section={section} />
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setViewReport(null)}>Fechar</Button>
            <Button size="sm" className="gap-1" onClick={() => viewReport && handleExport(viewReport)}>
              <Download className="h-3.5 w-3.5" />
              Exportar PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
