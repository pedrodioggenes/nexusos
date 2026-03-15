import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, UploadCloud, History, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ProofUploadFlow } from "@/components/supplier/ProofUploadFlow";
import { ProofStatusTracker } from "@/components/supplier/ProofStatusTracker";
import { useTradeChecklistsGroupedByPackage } from "@/hooks/useTradeChecklists";
import { useTradeProofsWithDetails } from "@/hooks/useTradeProofs";

export default function FornecedorComprovacoes() {
  const [activeTab, setActiveTab] = useState<"upload" | "history">("upload");
  const [preselectChecklistId, setPreselectChecklistId] = useState<string>("");

  const grouped = useTradeChecklistsGroupedByPackage();
  const proofsQuery = useTradeProofsWithDetails();

  const checklistOptions = useMemo(() => {
    const packages = grouped.data ?? [];
    const allItems = packages.flatMap((p: any) =>
      (p.items ?? []).map((i: any) => ({
        id: i.id,
        title: i.title,
        status: i.status,
        packageName: p.name ?? p.supplier_name ?? null,
      }))
    );

    return allItems.filter((i: any) => ["pending", "rejected"].includes(i.status));
  }, [grouped.data]);

  const proofs = useMemo(() => {
    return (proofsQuery.data ?? []).map((p: any) => ({
      ...p,
      display_url: p.display_url ?? null,
      file_kind: p.file_kind ?? null,
    }));
  }, [proofsQuery.data]);

  const rejectedProofs = proofs.filter((p: any) => p.status === "rejected");

  const handleResubmit = (proof: any) => {
    setPreselectChecklistId(proof.checklist_item?.id ?? proof.checklist_item_id ?? "");
    setActiveTab("upload");
  };

  if (grouped.isLoading || proofsQuery.isLoading) {
    return <LoadingState variant="spinner" message="Carregando comprovações..." />;
  }

  if (grouped.error) {
    return (
      <ErrorState
        title="Erro ao carregar checklist"
        message={(grouped.error as any)?.message ?? "Falha ao carregar dados"}
        onRetry={() => grouped.refetch()}
      />
    );
  }

  if (proofsQuery.error) {
    return (
      <ErrorState
        title="Erro ao carregar comprovações"
        message={(proofsQuery.error as any)?.message ?? "Falha ao carregar dados"}
        onRetry={() => proofsQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Comprovações</h1>
        <p className="text-muted-foreground">
          Envie suas comprovações e acompanhe o status de aprovação.
        </p>
      </div>

      {rejectedProofs.length > 0 && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
            <div className="flex-1">
              <div className="font-medium">Atenção: há comprovações rejeitadas</div>
              <div className="text-sm text-muted-foreground">
                Revise o motivo e reenvie a comprovação corrigida pelo item correspondente.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <UploadCloud className="h-4 w-4" />
            Enviar
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          {checklistOptions.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-8 w-8 text-muted-foreground" />}
              title="Nenhum item pendente"
              description="Você não possui itens pendentes de comprovação no momento."
            />
          ) : (
            <ProofUploadFlow
              checklistItems={checklistOptions}
              initialChecklistItemId={preselectChecklistId || undefined}
              onChecklistItemChange={() => setPreselectChecklistId("")}
              onComplete={() => {
                grouped.refetch();
                proofsQuery.refetch();
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="history">
          <ProofStatusTracker
            proofs={proofs as any}
            onResubmit={handleResubmit}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
