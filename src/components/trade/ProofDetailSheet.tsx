import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ExternalLink,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { supabase } from "@/integrations/supabase/client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import { AuditTimeline } from "@/components/audit/AuditTimeline";

type ProofKind = "image" | "pdf" | "file";

type ProofDetail = {
  id: string;
  status: "pending" | "approved" | "rejected" | string;

  // pode ser URL final, signedUrl, ou storage path
  image_url: string;
  display_url?: string | null;
  file_kind?: ProofKind | null;

  checklist_title?: string | null;
  package_name?: string | null;
  supplier_name?: string | null;

  description?: string | null;

  created_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  review_notes?: string | null;
};

export function ProofDetailSheet({
  proof,
  open,
  onOpenChange,
}: {
  proof: ProofDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isLikelyUrl = (v: string) => /^https?:\/\//i.test(v) || v.startsWith("data:") || v.startsWith("blob:");

  const inferredKind: ProofKind = useMemo(() => {
    const raw = (proof?.display_url ?? proof?.image_url ?? "").toLowerCase();
    if (proof?.file_kind) return proof.file_kind;
    if (raw.includes(".pdf") || raw.includes("application/pdf")) return "pdf";
    return "image";
  }, [proof?.file_kind, proof?.display_url, proof?.image_url]);

  const statusBadge = useMemo(() => {
    const s = proof?.status;
    if (s === "approved") {
      return {
        icon: CheckCircle,
        label: "Aprovado",
        className: "bg-success/15 text-success border-success/30",
      };
    }
    if (s === "rejected") {
      return {
        icon: XCircle,
        label: "Rejeitado",
        className: "bg-destructive/10 text-destructive border-destructive/25",
      };
    }
    return {
      icon: Clock,
      label: "Pendente",
      className: "bg-warning/15 text-warning border-warning/30",
    };
  }, [proof?.status]);

  /**
   * Resolve a URL "exibível" do arquivo:
   * - Se já vier como URL http(s) ou blob, usa direto
   * - Se vier como storage path, cria signedUrl
   */
  const mediaQuery = useQuery({
    queryKey: ["proof-media", proof?.id, proof?.display_url, proof?.image_url],
    enabled: !!proof && open,
    staleTime: 1000 * 60, // 60s
    queryFn: async () => {
      const raw = (proof?.display_url ?? proof?.image_url ?? "").trim();
      if (!raw) return "";

      if (isLikelyUrl(raw)) return raw;

      // raw é path no bucket
      const { data, error } = await supabase.storage
        .from("trade-proofs")
        .createSignedUrl(raw, 60 * 60);

      if (error || !data?.signedUrl) return raw; // fallback
      return data.signedUrl;
    },
  });

  const mediaUrl = mediaQuery.data || (proof?.display_url ?? proof?.image_url ?? "");

  const title = proof?.checklist_title || "Comprovação";
  const supplier = proof?.supplier_name || "Fornecedor";
  const pkg = proof?.package_name || "Pacote";

  const createdAtLabel = proof?.created_at
    ? format(new Date(proof.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : "-";

  const reviewedAtLabel =
    proof?.reviewed_at
      ? format(new Date(proof.reviewed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
      : null;

  const Icon = statusBadge.icon;

  const openInNewTab = () => {
    if (!mediaUrl) return;
    window.open(mediaUrl, "_blank");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col overflow-hidden">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/60 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-lg font-semibold truncate">
                  {title}
                </SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground truncate">
                  {supplier} • {pkg}
                </SheetDescription>
              </div>

              <Badge variant="outline" className={statusBadge.className}>
                <Icon className="h-3.5 w-3.5 mr-1" />
                {statusBadge.label}
              </Badge>
            </div>
          </SheetHeader>

          <Separator />

          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-6">
              {/* Preview */}
              <div className="rounded-xl border border-border/60 overflow-hidden bg-muted/30">
                {inferredKind === "pdf" ? (
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-destructive" />
                        </div>

                        <div>
                          <p className="text-sm font-medium">Documento PDF</p>
                          <p className="text-xs text-muted-foreground">
                            Clique para abrir em uma nova aba.
                          </p>
                        </div>
                      </div>

                      <Button size="sm" variant="secondary" className="gap-2" onClick={openInNewTab}>
                        <ExternalLink className="h-4 w-4" />
                        Abrir
                      </Button>
                    </div>

                    {/* Viewer inline (quando permitido pelo navegador/CSP) */}
                    {mediaUrl ? (
                      <div className="rounded-lg overflow-hidden border border-border/60 bg-background">
                        <iframe
                          src={mediaUrl}
                          className="w-full h-[400px]"
                          title="PDF Preview"
                        />
                      </div>
                    ) : (
                      <div className="mt-4 text-xs text-muted-foreground">
                        Carregando PDF...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    {mediaUrl ? (
                      <img
                        src={mediaUrl}
                        alt={title}
                        className="w-full h-auto max-h-[560px] object-contain bg-muted"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    ) : (
                      <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}

                    <div className="absolute top-3 right-3">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-2 bg-background/70 backdrop-blur border border-border/60"
                        onClick={openInNewTab}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Abrir
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="rounded-xl border border-border/60 p-4 space-y-2">
                <div className="text-xs text-muted-foreground">Detalhes</div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[11px] text-muted-foreground">Fornecedor</div>
                    <div className="text-sm font-medium truncate">{supplier}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">Pacote</div>
                    <div className="text-sm font-medium truncate">{pkg}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">Enviado em</div>
                    <div className="text-sm font-medium">{createdAtLabel}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">Status</div>
                    <div className="text-sm font-medium">{statusBadge.label}</div>
                  </div>
                </div>

                {proof?.description ? (
                  <>
                    <Separator className="my-3" />
                    <div className="text-[11px] text-muted-foreground">Observação do fornecedor</div>
                    <div className="text-sm whitespace-pre-wrap">{proof.description}</div>
                  </>
                ) : null}

                {proof?.status === "rejected" && proof?.review_notes ? (
                  <>
                    <Separator className="my-3" />
                    <div className="text-[11px] text-muted-foreground">Motivo da rejeição</div>
                    <div className="text-sm whitespace-pre-wrap text-destructive">
                      {proof.review_notes}
                    </div>
                  </>
                ) : null}

                {reviewedAtLabel ? (
                  <>
                    <Separator className="my-3" />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[11px] text-muted-foreground">Revisado em</div>
                        <div className="text-sm font-medium">{reviewedAtLabel}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground">Revisado por</div>
                        <div className="text-sm font-medium truncate">
                          {proof?.reviewed_by ?? "-"}
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>

              {/* Audit */}
              {proof?.id ? (
                <div className="rounded-xl border border-border/60 p-4 space-y-3">
                  <div className="text-xs font-medium">Auditoria</div>
                  <AuditTimeline resourceType="trade_proofs" resourceId={proof.id} />
                </div>
              ) : null}
            </div>
          </ScrollArea>

          <Separator />

          {/* Footer */}
          <div className="px-5 py-3 flex items-center justify-between gap-2">
            <div className="text-[11px] text-muted-foreground truncate">
              ID: <span className="font-medium text-foreground/80">{proof?.id ?? "-"}</span>
            </div>

            <Button size="sm" variant="outline" className="gap-2" onClick={openInNewTab} disabled={!mediaUrl}>
              <ExternalLink className="h-4 w-4" />
              Abrir arquivo
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
