import { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye, 
  RotateCcw,
  FileImage,
  AlertCircle,
  FileText,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ProofRecord {
  id: string;
  checklist_item_id?: string;
  checklist_title?: string;
  package_name?: string;
  image_url: string;
  display_url?: string | null;
  file_kind?: string | null;
  notes?: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  review_notes?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  created_at: string;
  checklist_item?: {
    id?: string;
    title?: string;
    package?: {
      name?: string;
    };
  };
}

interface ProofStatusTrackerProps {
  proofs: ProofRecord[];
  isLoading?: boolean;
  onResubmit?: (proof: ProofRecord) => void;
}

const statusConfig = {
  pending: { 
    icon: Clock, 
    label: 'Em Revisão', 
    color: 'text-warning', 
    bg: 'bg-warning/10 border-warning/30' 
  },
  approved: { 
    icon: CheckCircle, 
    label: 'Aprovado', 
    color: 'text-success', 
    bg: 'bg-success/10 border-success/30' 
  },
  rejected: { 
    icon: XCircle, 
    label: 'Rejeitado', 
    color: 'text-destructive', 
    bg: 'bg-destructive/10 border-destructive/30' 
  },
};

function ProofCard({ 
  proof, 
  onView, 
  onResubmit 
}: { 
  proof: ProofRecord; 
  onView: () => void;
  onResubmit?: () => void;
}) {
  const config = statusConfig[proof.status];
  const Icon = config.icon;
  const src = proof.display_url ?? proof.image_url;
  const isPdf = proof.file_kind === 'pdf';
  const title = proof.checklist_title ?? proof.checklist_item?.title ?? 'Comprovação';
  const packageName = proof.package_name ?? proof.checklist_item?.package?.name ?? '';

  const handleOpenFile = () => {
    if (isPdf && src) {
      window.open(src, "_blank");
    } else {
      onView();
    }
  };

  return (
    <Card className={cn("card-base overflow-hidden transition-all hover:border-border/80", proof.status === 'rejected' && "border-destructive/30")}>
      <div className="relative aspect-video bg-muted group">
        {isPdf ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
            <FileText className="h-10 w-10 text-muted-foreground mb-2" />
            <span className="text-xs text-muted-foreground">Documento PDF</span>
          </div>
        ) : (
          <img 
            src={src} 
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute bottom-2 left-2">
          <Badge variant="outline" className={cn("text-[9px]", config.bg, config.color)}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>

        {/* View Button */}
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute top-2 right-2 h-7 w-7 bg-black/50 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleOpenFile}
        >
          {isPdf ? <ExternalLink className="h-3.5 w-3.5 text-white" /> : <Eye className="h-3.5 w-3.5 text-white" />}
        </Button>
      </div>

      <CardContent className="p-3">
        <h3 className="text-xs font-medium text-foreground truncate mb-0.5">
          {title}
        </h3>
        <p className="text-[10px] text-muted-foreground truncate mb-1">
          {packageName}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {formatDistanceToNow(new Date(proof.created_at), { 
            addSuffix: true, 
            locale: ptBR 
          })}
        </p>

        {/* Rejection Reason */}
        {proof.status === 'rejected' && proof.review_notes && (
          <div className="mt-2 p-2 rounded bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-1.5">
              <AlertCircle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-medium text-destructive">Motivo da rejeição:</p>
                <p className="text-[10px] text-destructive/80">{proof.review_notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Approval Info */}
        {proof.status === 'approved' && proof.reviewed_at && (
          <div className="mt-2 p-2 rounded bg-success/10 border border-success/20">
            <p className="text-[10px] text-success">
              Aprovado em {format(new Date(proof.reviewed_at), "dd/MM/yyyy 'às' HH:mm")}
            </p>
          </div>
        )}

        {/* Resubmit Action */}
        {proof.status === 'rejected' && onResubmit && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2 h-7 text-[10px] gap-1"
            onClick={onResubmit}
          >
            <RotateCcw className="h-3 w-3" />
            Reenviar Comprovação
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function ProofStatusTracker({ 
  proofs, 
  isLoading = false,
  onResubmit 
}: ProofStatusTrackerProps) {
  const [selectedProof, setSelectedProof] = useState<ProofRecord | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const filteredProofs = proofs.filter(proof => {
    if (activeTab === 'all') return true;
    return proof.status === activeTab;
  });

  const counts = {
    all: proofs.length,
    pending: proofs.filter(p => p.status === 'pending').length,
    approved: proofs.filter(p => p.status === 'approved').length,
    rejected: proofs.filter(p => p.status === 'rejected').length,
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const handleResubmit = (proof: ProofRecord) => {
    onResubmit?.(proof);
    setSelectedProof(null);
  };

  const selectedSrc = selectedProof?.display_url ?? selectedProof?.image_url;
  const selectedIsPdf = selectedProof?.file_kind === 'pdf';
  const selectedTitle = selectedProof?.checklist_title ?? selectedProof?.checklist_item?.title ?? 'Comprovação';
  const selectedPackageName = selectedProof?.package_name ?? selectedProof?.checklist_item?.package?.name ?? '';

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-8">
          <TabsTrigger value="all" className="text-xs h-7 gap-1.5">
            Todas
            <Badge variant="secondary" className="text-[9px] h-4 px-1">
              {counts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs h-7 gap-1.5">
            <Clock className="h-3 w-3" />
            Em revisão
            {counts.pending > 0 && (
              <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-warning/20 text-warning">
                {counts.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="text-xs h-7 gap-1.5">
            <CheckCircle className="h-3 w-3" />
            Aprovadas
          </TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs h-7 gap-1.5">
            <XCircle className="h-3 w-3" />
            Rejeitadas
            {counts.rejected > 0 && (
              <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-destructive/20 text-destructive">
                {counts.rejected}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Proofs Grid */}
      {filteredProofs.length === 0 ? (
        <Card className="card-base p-8">
          <div className="text-center">
            <FileImage className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-sm font-medium text-foreground mb-1">
              Nenhuma comprovação encontrada
            </h3>
            <p className="text-xs text-muted-foreground">
              {activeTab === 'all' 
                ? 'Você ainda não enviou nenhuma comprovação.'
                : `Nenhuma comprovação com status "${statusConfig[activeTab as keyof typeof statusConfig]?.label || activeTab}".`}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProofs.map(proof => (
            <ProofCard 
              key={proof.id} 
              proof={proof}
              onView={() => setSelectedProof(proof)}
              onResubmit={onResubmit ? () => handleResubmit(proof) : undefined}
            />
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedProof} onOpenChange={() => setSelectedProof(null)}>
        <DialogContent className="max-w-2xl">
          {selectedProof && (
            <>
              <DialogHeader>
                <DialogTitle className="text-sm">{selectedTitle}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {selectedIsPdf ? (
                  <div className="w-full h-64 bg-muted rounded-lg flex flex-col items-center justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">Documento PDF</p>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => window.open(selectedSrc!, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir PDF
                    </Button>
                  </div>
                ) : (
                  <img 
                    src={selectedSrc} 
                    alt={selectedTitle}
                    className="w-full max-h-[50vh] object-contain rounded-lg bg-muted"
                  />
                )}

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Pacote</p>
                    <p className="font-medium">{selectedPackageName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant="outline" className={cn("text-[10px]", statusConfig[selectedProof.status].bg, statusConfig[selectedProof.status].color)}>
                      {statusConfig[selectedProof.status].label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Enviado em</p>
                    <p className="font-medium">
                      {format(new Date(selectedProof.created_at), "dd/MM/yyyy 'às' HH:mm")}
                    </p>
                  </div>
                  {selectedProof.reviewed_at && (
                    <div>
                      <p className="text-muted-foreground">Revisado em</p>
                      <p className="font-medium">
                        {format(new Date(selectedProof.reviewed_at), "dd/MM/yyyy 'às' HH:mm")}
                      </p>
                    </div>
                  )}
                </div>

                {(selectedProof.notes || selectedProof.description) && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Suas observações</p>
                    <p className="text-xs p-2 rounded bg-muted/50">{selectedProof.notes || selectedProof.description}</p>
                  </div>
                )}

                {selectedProof.review_notes && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Observações do revisor</p>
                    <p className={cn(
                      "text-xs p-2 rounded",
                      selectedProof.status === 'rejected' 
                        ? "bg-destructive/10 text-destructive" 
                        : "bg-success/10 text-success"
                    )}>
                      {selectedProof.review_notes}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                {selectedProof.status === 'rejected' && onResubmit && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleResubmit(selectedProof)}
                    className="gap-1"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reenviar
                  </Button>
                )}
                <Button variant="secondary" onClick={() => setSelectedProof(null)}>
                  Fechar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProofStatusTracker;
