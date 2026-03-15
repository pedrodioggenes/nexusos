import { useEffect, useMemo, useState } from "react";
import { Upload, FileText, Image as ImageIcon, X, RotateCcw, CheckCircle2, Camera, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useEnhancedStorageUpload } from "@/hooks/useEnhancedStorageUpload";
import { useCreateTradeProof } from "@/hooks/useTradeProofs";

type ChecklistItemOption = {
  id: string;
  title: string;
  packageName?: string | null;
  status?: string | null;
};

type QueueItem = {
  id: string;
  file: File;
  kind: "image" | "pdf" | "file";
  previewUrl?: string;
  status: "queued" | "uploading" | "success" | "error";
  error?: string;
  progress: number;
};

function detectKind(file: File): "image" | "pdf" | "file" {
  if (file.type === "application/pdf") return "pdf";
  if (file.type.startsWith("image/")) return "image";
  return "file";
}

function formatBytes(bytes: number) {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

interface ProofUploadFlowProps {
  checklistItems: ChecklistItemOption[];
  initialChecklistItemId?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  onComplete?: () => void;
  onChecklistItemChange?: (id: string) => void;
  onUploadComplete?: () => void;
}

export function ProofUploadFlow({
  checklistItems,
  initialChecklistItemId,
  maxFiles = 10,
  maxSizeMB = 10,
  onComplete,
  onChecklistItemChange,
  onUploadComplete,
}: ProofUploadFlowProps) {
  const [selectedChecklistId, setSelectedChecklistId] = useState<string>(initialChecklistItemId ?? "");
  const [notes, setNotes] = useState("");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const createProof = useCreateTradeProof();
  const { upload, isUploading } = useEnhancedStorageUpload({
    bucket: "trade-proofs",
    allowedTypes: ["image/*", "application/pdf"],
  });
  
  const maxFileSize = maxSizeMB * 1024 * 1024;

  useEffect(() => {
    if (initialChecklistItemId) {
      setSelectedChecklistId(initialChecklistItemId);
    }
  }, [initialChecklistItemId]);

  const selectedChecklist = useMemo(
    () => checklistItems.find((c) => c.id === selectedChecklistId),
    [checklistItems, selectedChecklistId]
  );

  const canPickMore = queue.length < maxFiles;

  const addFiles = (files: FileList | File[]) => {
    if (!selectedChecklistId) {
      toast.error("Selecione o item do checklist antes de enviar arquivos.");
      return;
    }

    const arr = Array.from(files);

    if (queue.length + arr.length > maxFiles) {
      toast.error(`Máximo de ${maxFiles} arquivos por envio.`);
      return;
    }

    const mapped: QueueItem[] = arr.map((file) => {
      const kind = detectKind(file);
      const previewUrl = kind === "image" ? URL.createObjectURL(file) : undefined;
      return {
        id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        file,
        kind,
        previewUrl,
        status: "queued",
        progress: 0,
      };
    });

    setQueue((prev) => [...prev, ...mapped]);
  };

  const removeItem = (id: string) => {
    setQueue((prev) => {
      const item = prev.find((x) => x.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  };

  const resetQueue = () => {
    queue.forEach((q) => q.previewUrl && URL.revokeObjectURL(q.previewUrl));
    setQueue([]);
  };

  const handleSelectChecklist = (id: string) => {
    setSelectedChecklistId(id);
    onChecklistItemChange?.(id);
  };

  const uploadOne = async (q: QueueItem) => {
    setQueue((prev) => prev.map((x) => (x.id === q.id ? { ...x, status: "uploading", progress: 10, error: undefined } : x)));

    try {
      // category: isolate by checklist id
      const result = await upload(q.file, `trade-proofs/${selectedChecklistId}`);

      // IMPORTANT:
      // store storage path in trade_proofs.image_url (compat w/ schema)
      await createProof.mutateAsync({
        checklist_item_id: selectedChecklistId,
        storage_path: result.path,
        description: notes.trim() ? notes.trim() : undefined,
      });

      setQueue((prev) => prev.map((x) => (x.id === q.id ? { ...x, status: "success", progress: 100 } : x)));
    } catch (err: any) {
      setQueue((prev) =>
        prev.map((x) =>
          x.id === q.id
            ? { ...x, status: "error", progress: 0, error: err?.message ?? "Falha ao enviar" }
            : x
        )
      );
    }
  };

  const uploadAll = async () => {
    if (!selectedChecklistId) {
      toast.error("Selecione o item do checklist.");
      return;
    }
    if (queue.length === 0) {
      toast.error("Selecione ao menos um arquivo.");
      return;
    }

    // upload sequentially to reduce edge errors
    for (const q of queue) {
      if (q.status === "success") continue;
      await uploadOne(q);
    }

    const hasErrors = queue.some((x) => x.status === "error");
    if (!hasErrors) {
      toast.success("Comprovações enviadas com sucesso!");
      onComplete?.();
      onUploadComplete?.();
      resetQueue();
      setNotes("");
    } else {
      toast.warning("Alguns arquivos falharam. Use Retry nos itens com erro.");
    }
  };

  const retryItem = async (id: string) => {
    const item = queue.find((x) => x.id === id);
    if (!item) return;
    await uploadOne(item);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!canPickMore) return;
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const pendingCount = queue.filter((x) => x.status === "queued").length;
  const successCount = queue.filter((x) => x.status === "success").length;
  const errorCount = queue.filter((x) => x.status === "error").length;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Enviar comprovações</span>
          <div className="flex items-center gap-2">
            {successCount > 0 && <Badge variant="secondary" className="bg-success/15 text-success">{successCount} ok</Badge>}
            {errorCount > 0 && <Badge variant="secondary" className="bg-warning/15 text-warning">{errorCount} erro</Badge>}
            {pendingCount > 0 && <Badge variant="secondary">{pendingCount} fila</Badge>}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Checklist select */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Item do checklist</div>
          <Select value={selectedChecklistId} onValueChange={handleSelectChecklist}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Selecione o item do checklist..." />
            </SelectTrigger>
            <SelectContent>
              {checklistItems.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.packageName ? `${c.packageName} — ` : ""}{c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedChecklist?.status && (
            <div className="text-[11px] text-muted-foreground">
              Status atual: <span className="font-medium">{selectedChecklist.status}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Observações (opcional)</div>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex.: foto do material instalado, data, referência, etc."
            className="min-h-[80px]"
          />
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={[
            "rounded-xl border border-dashed p-4 transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-border/70",
          ].join(" ")}
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <Camera className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="flex-1">
              <div className="text-sm font-medium">Arraste e solte aqui</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Aceita <b>imagens</b> e <b>PDF</b>. Máximo {maxFiles} arquivos, {maxSizeMB}MB cada.
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!selectedChecklistId || !canPickMore}
                  onClick={() => {
                    const el = document.getElementById("proof-file-input") as HTMLInputElement | null;
                    el?.click();
                  }}
                >
                  Selecionar arquivos
                </Button>

                <input
                  id="proof-file-input"
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    if (e.target.files?.length) addFiles(e.target.files);
                    e.currentTarget.value = "";
                  }}
                />

                {queue.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={resetQueue}>
                    Limpar fila
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Queue */}
        {queue.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Fila de upload</div>

            <div className="space-y-2">
              {queue.map((q) => (
                <div key={q.id} className="rounded-lg border border-border/60 p-2">
                  <div className="flex gap-2 items-start">
                    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {q.kind === "image" && q.previewUrl ? (
                        <img src={q.previewUrl} alt={q.file.name} className="h-full w-full object-cover" />
                      ) : q.kind === "pdf" ? (
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate">{q.file.name}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {q.file.type || "arquivo"} • {formatBytes(q.file.size)}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {q.status === "success" && <CheckCircle2 className="h-4 w-4 text-success" />}
                          {q.status === "error" && (
                            <Button variant="ghost" size="icon" onClick={() => retryItem(q.id)}>
                              <RotateCcw className="h-4 w-4 text-warning" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => removeItem(q.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {q.status === "uploading" && (
                        <div className="mt-2">
                          <Progress value={q.progress} />
                        </div>
                      )}

                      {q.status === "error" && (
                        <div className="mt-2 text-[11px] text-warning">
                          {q.error ?? "Falha ao enviar"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                className="flex-1"
                disabled={isUploading || createProof.isPending || !selectedChecklistId}
                onClick={uploadAll}
              >
                {(isUploading || createProof.isPending) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar comprovações
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
