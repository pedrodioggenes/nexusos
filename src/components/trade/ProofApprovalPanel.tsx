import { useMemo, useState } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  FileText,
  ExternalLink,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { useApproveProof } from "@/hooks/useTradeProofs";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type ProofKind = "image" | "pdf" | "file";

interface ProofData {
  id: string;
  image_url: string;
  display_url?: string | null;
  file_kind?: ProofKind | null;
  status: string;
  checklist_title?: string | null;
  package_name?: string | null;
  supplier_name?: string | null;
  created_at: string;
  review_notes?: string | null;
}

interface ProofApprovalPanelProps {
  proofs: ProofData[];
  onViewProof?: (proof: ProofData) => void;
  isLoading?: boolean;
}

function inferKindFromValue(v: string): ProofKind {
  const s = (v || "").toLowerCase();
  if (s.includes(".pdf") || s.includes("application/pdf")) return "pdf";
  return "image";
}

export function ProofApprovalPanel({
  proofs,
  onViewProof,
  isLoading,
}: ProofApprovalPanelProps) {
  const approveProof = useApproveProof();

  const [processingId, setProcessingId] = useState<string | null>(null);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [rejectTarget, setRejectTarget] = useState<ProofData | null>(null);

  const pendingProofs = useMemo(() => {
    return (proofs || [])
      .filter((p) => p.status === "pending")
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [proofs]);

  const formatTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: false, locale: ptBR });
  };

  const getMediaUrl = (proof: ProofData) => {
    return proof.display_url ?? proof.image_url;
  };

  const getKind = (proof: ProofData): ProofKind => {
    if (proof.file_kind) return proof.file_kind;
    return inferKindFromValue(getMediaUrl(proof));
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      await approveProof.mutateAsync({ id, approve: true });
    } finally {
      setProcessingId(null);
    }
  };

  const openReject = (proof: ProofData) => {
    setRejectTarget(proof);
    setRejectNotes(proof.review_notes ?? "");
    setRejectOpen(true);
  };

  const submitReject = async () => {
    if (!rejectTarget) return;
    const notes = rejectNotes.trim();
    if (notes.length < 3) return;

    try {
      setProcessingId(rejectTarget.id);
      await approveProof.mutateAsync({
        id: rejectTarget.id,
        approve: false,
        notes,
      });

      setRejectOpen(false);
      setRejectNotes("");
      setRejectTarget(null);
    } finally {
      setProcessingId(null);
    }
  };

  const openView = (proof: ProofData) => {
    const url = getMediaUrl(proof);
    const kind = getKind(proof);

    if (kind === "pdf") {
      if (url) window.open(url, "_blank");
      return;
    }

    onViewProof?.(proof);
  };

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <div className="h-5 bg-muted rounded animate-pulse w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-warning/30 bg-warning/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              Aguardando Aprovação
            </CardTitle>
            <Badge variant="secondary" className="bg-warning/20 text-warning text-xs">
              {pendingProofs.length}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {pendingProofs.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle className="h-8 w-8 text-success/50 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                Nenhuma comprovação pendente
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[340px]">
              <div className="space-y-2 pr-2">
                {pendingProofs.map((proof) => {
                  const kind = getKind(proof);
                  const url = getMediaUrl(proof);
                  const isProcessing = processingId === proof.id;

                  return (
                    <div
                      key={proof.id}
                      className="p-2 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <div className="flex gap-2">
                        {/* Thumbnail */}
                        <div className="relative h-14 w-14 rounded-md overflow-hidden bg-muted shrink-0">
                          {kind === "pdf" ? (
                            <div className="h-full w-full flex flex-col items-center justify-center gap-0.5">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <span className="text-[8px] font-medium text-muted-foreground uppercase">
                                PDF
                              </span>
                            </div>
                          ) : (
                            <img
                              src={url}
                              alt={proof.checklist_title || "Comprovação"}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                              }}
                            />
                          )}

                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute inset-0 h-full w-full opacity-0 hover:opacity-100 bg-black/50 transition-opacity"
                            onClick={() => openView(proof)}
                            title={kind === "pdf" ? "Abrir PDF" : "Ver imagem"}
                          >
                            {kind === "pdf" ? (
                              <ExternalLink className="h-4 w-4 text-white" />
                            ) : (
                              <Eye className="h-4 w-4 text-white" />
                            )}
                          </Button>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {proof.checklist_title || "Sem título"}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {proof.package_name || "Pacote"}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {proof.supplier_name || "Fornecedor"}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Há {formatTimeAgo(proof.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 h-7 text-[10px]"
                          onClick={() => openView(proof)}
                          disabled={isProcessing}
                        >
                          {kind === "pdf" ? (
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

                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 h-7 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => openReject(proof)}
                          disabled={isProcessing}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Rejeitar
                        </Button>

                        <Button
                          size="sm"
                          className="flex-1 h-7 text-[10px] bg-success hover:bg-success/90"
                          onClick={() => handleApprove(proof.id)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Aprovar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog
        open={rejectOpen}
        onOpenChange={(open) => {
          setRejectOpen(open);
          if (!open) {
            setRejectNotes("");
            setRejectTarget(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rejeitar comprovação</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {rejectTarget && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-sm font-medium truncate">
                  {rejectTarget.checklist_title || "Sem título"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {rejectTarget.supplier_name || "Fornecedor"} · {rejectTarget.package_name || "Pacote"}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Motivo (obrigatório)</Label>
              <Textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                rows={3}
                placeholder="Ex.: imagem ilegível, item errado, falta evidência, etc."
              />
              <div className="text-[10px] text-muted-foreground">
                Seja objetivo — isso vira histórico e guia o fornecedor na correção.
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectOpen(false)}
              disabled={processingId !== null}
            >
              Cancelar
            </Button>

            <Button
              variant="destructive"
              onClick={submitReject}
              disabled={
                !rejectTarget ||
                rejectNotes.trim().length < 3 ||
                processingId === rejectTarget?.id
              }
            >
              {processingId === rejectTarget?.id ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejeitando...
                </>
              ) : (
                "Rejeitar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
