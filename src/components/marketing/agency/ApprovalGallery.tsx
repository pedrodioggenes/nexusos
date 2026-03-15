import { useState } from 'react';
import { 
  Image, 
  Video, 
  FileText, 
  Check, 
  X, 
  MessageSquare,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { AgencyApproval } from '@/hooks/useAgencyDeliveries';

interface ApprovalGalleryProps {
  approvals: AgencyApproval[];
  onApprove: (id: string, feedback?: string) => void;
  onRequestAdjustments: (id: string, feedback: string) => void;
  onReject: (id: string, feedback: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  adjustments: 'Ajustes',
  rejected: 'Rejeitado',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400',
  approved: 'bg-emerald-500/20 text-emerald-400',
  adjustments: 'bg-orange-500/20 text-orange-400',
  rejected: 'bg-red-500/20 text-red-400',
};

export function ApprovalGallery({ 
  approvals, 
  onApprove, 
  onRequestAdjustments,
  onReject 
}: ApprovalGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');

  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const selectedApproval = selectedIndex !== null ? approvals[selectedIndex] : null;

  const getFileIcon = (fileType: string | null) => {
    if (fileType?.startsWith('image')) return Image;
    if (fileType?.startsWith('video')) return Video;
    return FileText;
  };

  const handleApprove = () => {
    if (selectedApproval) {
      onApprove(selectedApproval.id, feedback || undefined);
      setFeedback('');
      setSelectedIndex(null);
    }
  };

  const handleRequestAdjustments = () => {
    if (selectedApproval && feedback) {
      onRequestAdjustments(selectedApproval.id, feedback);
      setFeedback('');
      setSelectedIndex(null);
    }
  };

  const handleReject = () => {
    if (selectedApproval && feedback) {
      onReject(selectedApproval.id, feedback);
      setFeedback('');
      setSelectedIndex(null);
    }
  };

  const navigatePrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      setFeedback('');
    }
  };

  const navigateNext = () => {
    if (selectedIndex !== null && selectedIndex < approvals.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setFeedback('');
    }
  };

  if (approvals.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Nenhuma peça para aprovar</p>
        <p className="text-xs mt-1">As peças criativas aparecerão aqui quando forem enviadas pela agência</p>
      </div>
    );
  }

  return (
    <>
      {/* Stats */}
      <div className="flex items-center gap-4 mb-4">
        <Badge className="bg-amber-500/20 text-amber-400">
          {pendingApprovals.length} pendente(s)
        </Badge>
        <Badge className="bg-emerald-500/20 text-emerald-400">
          {approvals.filter(a => a.status === 'approved').length} aprovado(s)
        </Badge>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {approvals.map((approval, index) => {
          const FileIcon = getFileIcon(approval.file_type);
          const isImage = approval.file_type?.startsWith('image');

          return (
            <div
              key={approval.id}
              className={cn(
                "relative aspect-square rounded-lg border overflow-hidden cursor-pointer group transition-all",
                approval.status === 'pending' 
                  ? "border-amber-500/50 hover:border-amber-500" 
                  : "border-border/50 hover:border-module-gestao/50"
              )}
              onClick={() => setSelectedIndex(index)}
            >
              {/* Thumbnail */}
              {isImage ? (
                <img
                  src={approval.thumbnail_url || approval.file_url}
                  alt={`Versão ${approval.version}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <FileIcon className="w-12 h-12 text-muted-foreground" />
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>

              {/* Version Badge */}
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="text-xs">
                  v{approval.version}
                </Badge>
              </div>

              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                <Badge className={cn("text-xs", STATUS_COLORS[approval.status])}>
                  {STATUS_LABELS[approval.status]}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                Versão {selectedApproval?.version}
              </DialogTitle>
              {selectedApproval && (
                <Badge className={cn(STATUS_COLORS[selectedApproval.status])}>
                  {STATUS_LABELS[selectedApproval.status]}
                </Badge>
              )}
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preview */}
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              {selectedApproval?.file_type?.startsWith('image') ? (
                <img
                  src={selectedApproval.file_url}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              ) : selectedApproval?.file_type?.startsWith('video') ? (
                <video
                  src={selectedApproval.file_url}
                  controls
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="w-16 h-16 text-muted-foreground" />
                </div>
              )}

              {/* Navigation */}
              {approvals.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                    onClick={(e) => { e.stopPropagation(); navigatePrev(); }}
                    disabled={selectedIndex === 0}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={(e) => { e.stopPropagation(); navigateNext(); }}
                    disabled={selectedIndex === approvals.length - 1}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4">
              {/* Previous Feedback */}
              {selectedApproval?.feedback && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Feedback anterior:</p>
                  <p className="text-sm">{selectedApproval.feedback}</p>
                </div>
              )}

              {/* New Feedback */}
              {selectedApproval?.status === 'pending' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      Feedback
                    </label>
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Deixe seu feedback sobre esta peça..."
                      rows={4}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleApprove}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRequestAdjustments}
                      disabled={!feedback}
                      className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Solicitar Ajustes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReject}
                      disabled={!feedback}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Rejeitar
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
