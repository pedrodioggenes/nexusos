import { useState, useMemo, useRef, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Store,
  ClipboardCheck,
  FileCheck,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ImageOff,
} from "lucide-react";
import { useRetailActions } from "@/hooks/useRetailActions";
import { useExecutionRuns } from "@/hooks/useRetailExecution";
import { useCreateHyperworksEntityLink } from "@/hooks/useHyperworksEntityLinks";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type { Message } from "./MessageItem";

interface ComprovacaoPrefill {
  retailActionId?: string;
  storeId?: string;
  itemId?: string;
}

interface LinkComprovacaoSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  message: Message;
  onLinked?: (entityType: string, entityId: string) => void;
  prefill?: ComprovacaoPrefill;
}

type VinculoType = "retail_execution" | "marketing_execution";

export function LinkComprovacaoSheet({
  open,
  onOpenChange,
  message,
  onLinked,
  prefill,
}: LinkComprovacaoSheetProps) {
  const { tenant } = useAuth();
  const createLink = useCreateHyperworksEntityLink();

  // Step state — initialize from prefill if provided
  const [vinculoType, setVinculoType] = useState<VinculoType>("retail_execution");
  const [selectedActionId, setSelectedActionId] = useState(prefill?.retailActionId || "");
  const [selectedStoreId, setSelectedStoreId] = useState(prefill?.storeId || "");
  const [selectedItemId, setSelectedItemId] = useState(prefill?.itemId || "");
  const prefillApplied = useRef(false);

  // Apply prefill when sheet opens
  useEffect(() => {
    if (open && prefill && !prefillApplied.current) {
      if (prefill.retailActionId) setSelectedActionId(prefill.retailActionId);
      if (prefill.storeId) setSelectedStoreId(prefill.storeId);
      if (prefill.itemId) setSelectedItemId(prefill.itemId);
      prefillApplied.current = true;
    }
    if (!open) {
      prefillApplied.current = false;
    }
  }, [open, prefill]);

  // Data sources
  const { actions } = useRetailActions();
  const { runs } = useExecutionRuns(selectedActionId || undefined);

  // Active actions only
  const activeActions = useMemo(
    () =>
      actions.filter((a) =>
        ["planned", "in_production", "ready", "running"].includes(a.status)
      ),
    [actions]
  );

  // Stores that have runs for selected action
  const [stores, setStoresState] = useState<{ id: string; name: string }[]>([]);
  const { data: storesData } = useQuery({
    queryKey: ["units-for-link", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const table: any = supabase.from("units");
      const result = await table
        .select("id, name")
        .eq("tenant_id", tenant.id)
        .order("name");
      return result.data || [];
    },
    enabled: !!tenant?.id && open,
  });

  const storesWithRuns = useMemo(() => {
    if (!storesData) return [];
    return storesData.map((s: any) => ({
      ...s,
      run: runs.find((r) => r.store_id === s.id),
    }));
  }, [storesData, runs]);

  const storesOnlyWithRuns = useMemo(
    () => storesWithRuns.filter((s: any) => s.run),
    [storesWithRuns]
  );

  // Checklist items for selected run
  const selectedRun = runs.find((r) => r.store_id === selectedStoreId);
  const { data: checklistItems = [] } = useQuery({
    queryKey: ["execution-items-link", selectedRun?.id],
    queryFn: async () => {
      if (!selectedRun?.id) return [];
      const { data, error } = await supabase
        .from("retail_execution_items")
        .select("*")
        .eq("execution_run_id", selectedRun.id)
        .order("category");
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedRun?.id,
  });

  // Media detection
  const hasMedia = !!(message as any).attachments?.length;

  // Extract excerpt
  const excerpt =
    message.content.length > 200
      ? message.content.substring(0, 200) + "…"
      : message.content;

  const handleConfirm = async () => {
    if (vinculoType === "retail_execution") {
      const entityType = selectedItemId
        ? "retail_execution_item"
        : "retail_execution_run";
      const entityId = selectedItemId || selectedRun?.id;
      if (!entityId) return;

      await createLink.mutateAsync({
        message_id: message.id,
        entity_type: entityType as any,
        entity_id: entityId,
        relation_type: "evidence",
        label: "Comprovação",
        excerpt,
        media_urls: (message as any).attachments?.map?.((a: any) => a.url) || null,
      });

      onLinked?.(entityType, entityId);
    }

    // Reset & close
    setSelectedActionId("");
    setSelectedStoreId("");
    setSelectedItemId("");
    onOpenChange(false);
  };

  const canConfirm =
    vinculoType === "retail_execution" &&
    selectedActionId &&
    selectedStoreId &&
    selectedRun;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto"
        style={{ backgroundColor: "#18181B", borderColor: "#27272A" }}
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="text-sm" style={{ color: "#FAFAFA" }}>
            Vincular Comprovação
          </SheetTitle>
          <SheetDescription className="text-xs" style={{ color: "#71717A" }}>
            Vincule este post a uma execução como evidência
          </SheetDescription>
        </SheetHeader>

        {/* Post preview */}
        <div
          className="p-3 rounded-lg mb-4 border"
          style={{ backgroundColor: "#27272A", borderColor: "#3F3F46" }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-medium" style={{ color: "#A1A1AA" }}>
              {message.userName}
            </span>
            {!hasMedia && (
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 gap-0.5"
                style={{ borderColor: "#52525B", color: "#71717A" }}
              >
                <ImageOff className="h-2.5 w-2.5" />
                Sem mídia
              </Badge>
            )}
          </div>
          <p className="text-xs line-clamp-3" style={{ color: "#D4D4D8" }}>
            {excerpt}
          </p>
        </div>

        {/* Step 1: Tipo de vínculo */}
        <div className="space-y-3">
          <div>
            <Label className="text-xs mb-1.5 block" style={{ color: "#A1A1AA" }}>
              Tipo de vínculo
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setVinculoType("retail_execution")}
                className={cn(
                  "p-3 rounded-lg border text-left transition-colors",
                  vinculoType === "retail_execution"
                    ? "border-orange-500/50 bg-orange-500/10"
                    : "border-zinc-700 hover:border-zinc-600"
                )}
                style={{
                  backgroundColor:
                    vinculoType === "retail_execution"
                      ? "rgba(249, 115, 22, 0.1)"
                      : "#27272A",
                }}
              >
                <ClipboardCheck
                  className="h-4 w-4 mb-1"
                  style={{
                    color:
                      vinculoType === "retail_execution" ? "#F97316" : "#71717A",
                  }}
                />
                <div
                  className="text-xs font-medium"
                  style={{
                    color:
                      vinculoType === "retail_execution" ? "#FAFAFA" : "#A1A1AA",
                  }}
                >
                  Execução em Loja
                </div>
                <div className="text-[10px]" style={{ color: "#52525B" }}>
                  Compliance
                </div>
              </button>
              <button
                onClick={() => setVinculoType("marketing_execution")}
                className={cn(
                  "p-3 rounded-lg border text-left transition-colors opacity-50 cursor-not-allowed"
                )}
                style={{
                  backgroundColor: "#27272A",
                  borderColor: "#3F3F46",
                }}
                disabled
              >
                <FileCheck className="h-4 w-4 mb-1" style={{ color: "#71717A" }} />
                <div className="text-xs font-medium" style={{ color: "#A1A1AA" }}>
                  Canais
                </div>
                <div className="text-[10px]" style={{ color: "#52525B" }}>
                  Em breve
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Ação comercial */}
          {vinculoType === "retail_execution" && (
            <>
              <div>
                <Label className="text-xs mb-1.5 block" style={{ color: "#A1A1AA" }}>
                  Ação Comercial
                </Label>
                <Select value={selectedActionId} onValueChange={(v) => { setSelectedActionId(v); setSelectedStoreId(""); setSelectedItemId(""); }}>
                  <SelectTrigger
                    className="h-9 text-xs"
                    style={{
                      backgroundColor: "#27272A",
                      borderColor: "#3F3F46",
                      color: "#D4D4D8",
                    }}
                  >
                    <SelectValue placeholder="Selecionar ação..." />
                  </SelectTrigger>
                  <SelectContent
                    style={{
                      backgroundColor: "#27272A",
                      borderColor: "#3F3F46",
                    }}
                  >
                    {activeActions.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.title}
                      </SelectItem>
                    ))}
                    {activeActions.length === 0 && (
                      <div
                        className="px-2 py-1.5 text-xs"
                        style={{ color: "#71717A" }}
                      >
                        Nenhuma ação ativa
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Step 3: Loja */}
              {selectedActionId && (
                <div>
                  <Label
                    className="text-xs mb-1.5 block"
                    style={{ color: "#A1A1AA" }}
                  >
                    Loja
                  </Label>
                  <Select value={selectedStoreId} onValueChange={(v) => { setSelectedStoreId(v); setSelectedItemId(""); }}>
                    <SelectTrigger
                      className="h-9 text-xs"
                      style={{
                        backgroundColor: "#27272A",
                        borderColor: "#3F3F46",
                        color: "#D4D4D8",
                      }}
                    >
                      <SelectValue placeholder="Selecionar loja..." />
                    </SelectTrigger>
                    <SelectContent
                      style={{
                        backgroundColor: "#27272A",
                        borderColor: "#3F3F46",
                      }}
                    >
                      {storesOnlyWithRuns.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>
                          <span className="flex items-center gap-2">
                            <Store className="h-3 w-3" />
                            {s.name}
                            {s.run && (
                              <span
                                className="text-[10px]"
                                style={{
                                  color:
                                    s.run.compliance_score >= 80
                                      ? "#16A34A"
                                      : s.run.compliance_score >= 50
                                      ? "#F59E0B"
                                      : "#EF4444",
                                }}
                              >
                                {s.run.compliance_score}%
                              </span>
                            )}
                          </span>
                        </SelectItem>
                      ))}
                      {storesOnlyWithRuns.length === 0 && (
                        <div
                          className="px-2 py-1.5 text-xs"
                          style={{ color: "#71717A" }}
                        >
                          Nenhuma loja com execução iniciada
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Step 4: Item (opcional) */}
              {selectedRun && checklistItems.length > 0 && (
                <div>
                  <Label
                    className="text-xs mb-1.5 flex items-center gap-1"
                    style={{ color: "#A1A1AA" }}
                  >
                    Item do checklist
                    <span className="text-[10px]" style={{ color: "#52525B" }}>
                      (opcional)
                    </span>
                  </Label>
                  <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                    <SelectTrigger
                      className="h-9 text-xs"
                      style={{
                        backgroundColor: "#27272A",
                        borderColor: "#3F3F46",
                        color: "#D4D4D8",
                      }}
                    >
                      <SelectValue placeholder="Vincular ao run inteiro..." />
                    </SelectTrigger>
                    <SelectContent
                      style={{
                        backgroundColor: "#27272A",
                        borderColor: "#3F3F46",
                      }}
                    >
                      <SelectItem value="none">
                        <span className="text-xs" style={{ color: "#71717A" }}>
                          Vincular ao run inteiro
                        </span>
                      </SelectItem>
                      {checklistItems.map((item: any) => (
                        <SelectItem key={item.id} value={item.id}>
                          <span className="flex items-center gap-1.5">
                            {item.status === "ok" ? (
                              <CheckCircle2
                                className="h-3 w-3"
                                style={{ color: "#16A34A" }}
                              />
                            ) : item.status === "not_ok" ? (
                              <AlertTriangle
                                className="h-3 w-3"
                                style={{ color: "#EF4444" }}
                              />
                            ) : (
                              <div
                                className="h-3 w-3 rounded-full border"
                                style={{ borderColor: "#52525B" }}
                              />
                            )}
                            {item.title}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Run summary */}
              {selectedRun && (
                <div
                  className="p-2.5 rounded-lg border"
                  style={{ backgroundColor: "#27272A", borderColor: "#3F3F46" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px]" style={{ color: "#71717A" }}>
                      Compliance atual
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{
                        color:
                          selectedRun.compliance_score >= 80
                            ? "#16A34A"
                            : selectedRun.compliance_score >= 50
                            ? "#F59E0B"
                            : "#EF4444",
                      }}
                    >
                      {selectedRun.compliance_score}%
                    </span>
                  </div>
                  {selectedRun.issues_count > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertTriangle
                        className="h-3 w-3"
                        style={{ color: "#EF4444" }}
                      />
                      <span className="text-[10px]" style={{ color: "#EF4444" }}>
                        {selectedRun.issues_count} issue(s) aberta(s)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs"
            style={{
              backgroundColor: "#27272A",
              borderColor: "#3F3F46",
              color: "#A1A1AA",
            }}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            className="flex-1 h-9 text-xs gap-1.5"
            style={{
              backgroundColor: canConfirm ? "#EA580C" : "#3F3F46",
              color: canConfirm ? "#FAFAFA" : "#71717A",
            }}
            disabled={!canConfirm || createLink.isPending}
            onClick={handleConfirm}
          >
            {createLink.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Vincular
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
