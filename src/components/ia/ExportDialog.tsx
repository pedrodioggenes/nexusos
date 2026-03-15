import * as React from 'react';
import { useState } from 'react';
import { FileDown, FileText, File } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { exportToMarkdown, exportToPDF } from '@/lib/ia-export';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
}

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: Conversation | null;
  isDarkMode?: boolean;
}

export const ExportDialog = React.forwardRef<HTMLDivElement, ExportDialogProps>(
  function ExportDialog({
    open,
    onOpenChange,
    conversation,
  }, ref) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExportMarkdown = async () => {
      if (!conversation) return;
      
      setIsExporting(true);
      try {
        exportToMarkdown(conversation);
        toast.success('Conversa exportada como Markdown!');
        onOpenChange(false);
      } catch (error) {
        console.error('Export error:', error);
        toast.error('Erro ao exportar conversa');
      } finally {
        setIsExporting(false);
      }
    };

    const handleExportPDF = async () => {
      if (!conversation) return;
      
      setIsExporting(true);
      try {
        await exportToPDF(conversation);
        toast.success('Conversa exportada como PDF!');
        onOpenChange(false);
      } catch (error) {
        console.error('Export error:', error);
        toast.error('Erro ao exportar conversa');
      } finally {
        setIsExporting(false);
      }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          ref={ref}
          className="sm:max-w-md"
          style={{ 
            backgroundColor: "rgba(24, 24, 27, 0.95)",
            borderColor: "rgba(255, 255, 255, 0.08)"
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white/90">
              <FileDown className="h-5 w-5" />
              Exportar conversa
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Escolha o formato para exportar esta conversa
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button
              variant="outline"
              onClick={handleExportMarkdown}
              disabled={isExporting}
              className="flex flex-col items-center gap-2 h-auto py-4 border-white/[0.08] hover:bg-white/[0.04] text-white/80"
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm font-medium">Markdown</span>
              <span className="text-xs text-white/40">
                .md
              </span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex flex-col items-center gap-2 h-auto py-4 border-white/[0.08] hover:bg-white/[0.04] text-white/80"
            >
              <File className="h-6 w-6" />
              <span className="text-sm font-medium">PDF</span>
              <span className="text-xs text-white/40">
                .pdf
              </span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);
