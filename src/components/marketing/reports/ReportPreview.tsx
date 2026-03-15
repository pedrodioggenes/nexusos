/**
 * ReportPreview — Renders a @react-pdf/renderer Document in-browser
 * with download capability.
 */
import { useState, useCallback } from "react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Eye, FileText } from "lucide-react";
import { toast } from "sonner";

interface ReportPreviewProps {
  document: React.ReactElement;
  fileName?: string;
  label?: string;
}

export function ReportPreview({ document, fileName = "relatorio.pdf", label }: ReportPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const handleDownload = useCallback(async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(document).toBlob();
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("PDF gerado com sucesso!");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Erro ao gerar PDF");
    } finally {
      setIsGenerating(false);
    }
  }, [document, fileName]);

  const handlePreview = useCallback(async () => {
    setIsLoadingPreview(true);
    try {
      const blob = await pdf(document).toBlob();
      const url = URL.createObjectURL(blob);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(url);
    } catch (err) {
      console.error("PDF preview error:", err);
      toast.error("Erro ao gerar preview");
    } finally {
      setIsLoadingPreview(false);
    }
  }, [document, previewUrl]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          onClick={handleDownload}
          disabled={isGenerating}
          size="sm"
          className="gap-2 bg-app-gestao hover:bg-app-gestao/90"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isGenerating ? "Gerando..." : `Baixar ${label || "PDF"}`}
        </Button>

        <Button
          onClick={handlePreview}
          disabled={isLoadingPreview}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isLoadingPreview ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          Visualizar
        </Button>
      </div>

      {previewUrl && (
        <div className="border border-border rounded-lg overflow-hidden bg-muted/50">
          <div className="flex items-center gap-2 px-3 py-2 bg-muted border-b border-border">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{fileName}</span>
          </div>
          <iframe
            src={previewUrl}
            className="w-full bg-white"
            style={{ height: "70vh", minHeight: 500 }}
            title="PDF Preview"
          />
        </div>
      )}
    </div>
  );
}
