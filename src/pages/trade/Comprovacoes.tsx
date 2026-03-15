import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Image as ImageIcon,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  FileText,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';

import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { StatCard } from '@/components/ui/stat-card';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

import { ProofApprovalPanel } from '@/components/trade/ProofApprovalPanel';
import { ProofDetailSheet } from '@/components/trade/ProofDetailSheet';

import { useTradeProofsWithDetails, useApproveProof } from '@/hooks/useTradeProofs';
import type { TradeProofWithDetails } from '@/hooks/useTradeProofs';

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ProofKind = 'image' | 'pdf' | 'file';

type UIProof = TradeProofWithDetails & {
  display_url?: string;
  file_kind: ProofKind;
};

function isLikelyUrl(v: string) {
  return /^https?:\/\//i.test(v) || v.startsWith('data:') || v.startsWith('blob:');
}

function inferKindFromPath(pathOrUrl: string): ProofKind {
  const v = (pathOrUrl || '').toLowerCase();
  if (v.includes('.pdf') || v.endsWith('/pdf') || v.includes('application/pdf')) return 'pdf';
  return 'image';
}

export default function Comprovacoes() {
  const {
    data: proofsRaw,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useTradeProofsWithDetails();

  const approveProof = useApproveProof();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const [selectedProof, setSelectedProof] = useState<UIProof | null>(null);

  const [rejectNotes, setRejectNotes] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [processingId, setProcessingId] = useState<string | null>(null);

  /**
   * Resolve signed URL quando image_url for path do Storage.
   */
  const proofMediaQuery = useQuery({
    queryKey: ['trade-proof-media', (proofsRaw || []).map((p) => p.id)],
    enabled: !!(proofsRaw && proofsRaw.length > 0),
    staleTime: 1000 * 60,
    queryFn: async () => {
      const entries = await Promise.all(
        (proofsRaw || []).map(async (p) => {
          const raw = p.image_url;
          const kind = inferKindFromPath(raw);

          if (!raw) return [p.id, { url: '', kind }] as const;

          if (isLikelyUrl(raw)) {
            return [p.id, { url: raw, kind }] as const;
          }

          const { data, error } = await supabase.storage
            .from('trade-proofs')
            .createSignedUrl(raw, 60 * 60);

          if (error || !data?.signedUrl) {
            return [p.id, { url: raw, kind }] as const;
          }

          return [p.id, { url: data.signedUrl, kind }] as const;
        })
      );

      return Object.fromEntries(entries) as Record<string, { url: string; kind: ProofKind }>;
    },
  });

  const proofs: UIProof[] = useMemo(() => {
    const mediaMap = proofMediaQuery.data || {};
    return (proofsRaw || []).map((p) => {
      const media = mediaMap[p.id];
      const kind = media?.kind ?? inferKindFromPath(p.image_url);
      const displayUrl = media?.url ?? (isLikelyUrl(p.image_url) ? p.image_url : undefined);

      return {
        ...p,
        file_kind: kind,
        display_url: displayUrl,
        image_url: displayUrl || p.image_url,
      } as UIProof;
    });
  }, [proofsRaw, proofMediaQuery.data]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return { icon: CheckCircle, label: 'Aprovado', color: 'text-success border-success/30 bg-success/5' };
      case 'pending':
        return { icon: Clock, label: 'Pendente', color: 'text-warning border-warning/30 bg-warning/5' };
      case 'rejected':
        return { icon: XCircle, label: 'Rejeitado', color: 'text-destructive border-destructive/30 bg-destructive/5' };
      default:
        return { icon: Clock, label: status, color: 'text-muted-foreground border-border' };
    }
  };

  const filteredProofs = useMemo(() => {
    return proofs.filter((p) => {
      const matchesSearch =
        (p.checklist_title || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.package_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.supplier_name || '').toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [proofs, search, statusFilter]);

  const stats = useMemo(() => {
    const total = proofs.length;
    const pending = proofs.filter((p) => p.status === 'pending').length;
    const approved = proofs.filter((p) => p.status === 'approved').length;
    const rejected = proofs.filter((p) => p.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [proofs]);

  const formatTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: false, locale: ptBR });
  };

  const openRejectDialog = (proof: UIProof) => {
    setSelectedProof(proof);
    setRejectNotes(proof.review_notes || '');
    setIsRejectDialogOpen(true);
  };

  const openProof = (proof: UIProof) => {
    if (proof.file_kind === 'pdf') {
      const url = proof.display_url || proof.image_url;
      if (url) window.open(url, '_blank');
      return;
    }

    setSelectedProof(proof);
    setIsDetailOpen(true);
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      await approveProof.mutateAsync({ id, approve: true });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedProof) return;

    const notes = rejectNotes.trim();
    if (notes.length < 3) return;

    try {
      setProcessingId(selectedProof.id);
      await approveProof.mutateAsync({
        id: selectedProof.id,
        approve: false,
        notes,
      });
      setIsRejectDialogOpen(false);
      setRejectNotes('');
      setSelectedProof(null);
    } finally {
      setProcessingId(null);
    }
  };

  const ProofsSkeleton = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="card-base overflow-hidden">
          <Skeleton className="aspect-video" />
          <CardContent className="p-3">
            <Skeleton className="h-4 w-3/4 mb-1.5" />
            <Skeleton className="h-3 w-1/2 mb-2" />
            <Skeleton className="h-3 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (error) {
    return (
      <div className="space-y-4">
        <PageHeader title="Comprovações" description="Revisão de imagens e documentos enviados" />
        <ErrorState
          title="Erro ao carregar comprovações"
          message={(error as Error)?.message || 'Falha ao buscar dados'}
          onRetry={() => refetch()}
          isRetrying={isFetching}
          variant="card"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Comprovações" description="Revisão de imagens e documentos enviados" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Total"
          value={stats.total}
          icon={<ImageIcon className="h-4 w-4" />}
          variant="accent"
        />
        <StatCard
          title="Pendentes"
          value={stats.pending}
          icon={<Clock className="h-4 w-4" />}
          variant="warning"
        />
        <StatCard
          title="Aprovadas"
          value={stats.approved}
          icon={<CheckCircle className="h-4 w-4" />}
          variant="success"
        />
        <StatCard
          title="Rejeitadas"
          value={stats.rejected}
          icon={<XCircle className="h-4 w-4" />}
          variant="destructive"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar comprovações..."
              className="h-8 pl-8 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Atualizar lista"
          >
            {isFetching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Atualizar
          </Button>

          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            Filtros
          </Button>
        </div>

        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs px-3">Todas</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs px-3 gap-1">
              Pendentes
              {stats.pending > 0 && (
                <Badge className="h-4 px-1 text-[9px] bg-warning/20 text-warning">
                  {stats.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="text-xs px-3">Aprovadas</TabsTrigger>
            <TabsTrigger value="rejected" className="text-xs px-3">Rejeitadas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content with Approval Panel */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        {/* Proofs Grid */}
        <div>
          {isLoading ? (
            <ProofsSkeleton />
          ) : filteredProofs.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <EmptyState
                  icon={<ImageIcon className="h-12 w-12 text-muted-foreground/50" />}
                  title="Nenhuma comprovação encontrada"
                  description={search ? 'Tente ajustar os filtros de busca' : 'Aguardando envio de comprovações'}
                  variant="default"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredProofs.map((proof) => {
                const statusConfig = getStatusConfig(proof.status);
                const isProcessing = processingId === proof.id;

                const fileBadge =
                  proof.file_kind === 'pdf' ? (
                    <Badge variant="secondary" className="absolute top-2 left-2 text-[9px] bg-black/60 text-white">
                      <FileText className="h-3 w-3 mr-1" />
                      PDF
                    </Badge>
                  ) : null;

                return (
                  <Card key={proof.id} className="card-base overflow-hidden group">
                    {/* Preview */}
                    <div className="relative aspect-video bg-muted">
                      {fileBadge}

                      {proof.file_kind === 'pdf' ? (
                        <div className="w-full h-full flex items-center justify-center bg-muted/80">
                          <div className="text-center">
                            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-1" />
                            <span className="text-xs text-muted-foreground">Documento PDF</span>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={proof.display_url || proof.image_url || '/placeholder.svg'}
                          alt={proof.checklist_title || 'Comprovação'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <Badge variant="outline" className={`text-[9px] ${statusConfig.color}`}>
                          <statusConfig.icon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>

                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-6 text-[10px] bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => openProof(proof)}
                        >
                          {proof.file_kind === 'pdf' ? (
                            <>
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Abrir
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-3">
                      <h3 className="text-xs font-medium text-foreground truncate mb-0.5">
                        {proof.checklist_title || 'Item sem título'}
                      </h3>

                      <p className="text-[10px] text-muted-foreground truncate">
                        {proof.package_name || 'Pacote'}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted-foreground">
                          {proof.supplier_name || 'Fornecedor'} · Há {formatTimeAgo(proof.created_at)}
                        </span>
                      </div>

                      {proof.review_notes && proof.status === 'rejected' && (
                        <p className="text-[10px] text-destructive mt-2 p-1.5 rounded bg-destructive/10 border border-destructive/20">
                          {proof.review_notes}
                        </p>
                      )}

                      {proof.status === 'pending' ? (
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-7 text-xs gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => openRejectDialog(proof)}
                            disabled={isProcessing}
                          >
                            <ThumbsDown className="h-3 w-3" />
                            Rejeitar
                          </Button>

                          <Button
                            size="sm"
                            className="flex-1 h-7 text-xs gap-1 bg-success hover:bg-success/90"
                            onClick={() => handleApprove(proof.id)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <ThumbsUp className="h-3 w-3" />
                            )}
                            Aprovar
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full h-7 text-xs gap-1"
                            onClick={() => openProof(proof)}
                          >
                            <Eye className="h-3 w-3" />
                            Ver arquivo
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Approval Panel - Sidebar */}
        <div className="hidden lg:block">
          <ProofApprovalPanel
            proofs={proofs as any}
            onViewProof={(p) => openProof(p as UIProof)}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Detail Sheet (imagens) */}
      <ProofDetailSheet
        proof={selectedProof as any}
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) setSelectedProof(null);
        }}
      />

      {/* Reject Dialog */}
      <Dialog
        open={isRejectDialogOpen}
        onOpenChange={(open) => {
          setIsRejectDialogOpen(open);
          if (!open) {
            setRejectNotes('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Comprovação</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedProof && (
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="text-sm font-medium">
                  {selectedProof.checklist_title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedProof.supplier_name} · {selectedProof.package_name}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Motivo da Rejeição <span className="text-destructive">*</span></Label>
              <Textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Descreva o motivo da rejeição (ex.: imagem ilegível, item errado, falta carimbo, etc.)"
                rows={3}
              />
              <p className="text-[10px] text-muted-foreground">
                Dica: seja objetivo. Isso vira histórico e ajuda o fornecedor a corrigir.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={approveProof.isPending || rejectNotes.trim().length < 3 || !selectedProof}
            >
              {approveProof.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
