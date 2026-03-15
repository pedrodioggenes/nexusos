import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { validateCompletion, type CompletionValidationResult } from "@/domain/demands/completionCriteria";
import type { DemandType } from "@/domain/demands/types";

interface CompletionContext {
  demandId: string;
  demandType: DemandType;
}

/**
 * Fetches all data needed to evaluate completion criteria client-side.
 */
export function useCompletionCriteria({ demandId, demandType }: CompletionContext) {
  return useQuery({
    queryKey: ["completion-criteria", demandId],
    queryFn: async (): Promise<CompletionValidationResult> => {
      // Fetch responses
      const { data: responses } = await supabase
        .from("demand_responses")
        .select("status, is_final, deliverable_urls")
        .eq("demand_id", demandId);

      // Fetch workflow steps
      const { data: steps } = await supabase
        .from("demand_workflow_steps")
        .select("step_key, status")
        .eq("demand_id", demandId);

      // Fetch approvals
      const { data: approvals } = await supabase
        .from("demand_approvals")
        .select("required, status")
        .eq("demand_id", demandId);

      const hasSubmittedResponse = (responses || []).some(
        (r) => r.status === "submitted"
      );
      const hasFinalResponse = (responses || []).some((r) => r.is_final === true);
      const hasDeliverableUrl = (responses || []).some(
        (r) =>
          r.deliverable_urls != null &&
          JSON.stringify(r.deliverable_urls) !== "[]" &&
          JSON.stringify(r.deliverable_urls) !== "null"
      );
      const hasApprovedResponse = (responses || []).some(
        (r) => r.status === "approved"
      );
      const hasReadyWorkflowStep = (steps || []).some(
        (s) => s.step_key === "ready" && s.status === "done"
      );
      const requiredApprovals = (approvals || []).filter((a) => a.required);
      const allApprovalsApproved =
        requiredApprovals.length === 0 ||
        requiredApprovals.every((a) => a.status === "approved");

      return validateCompletion({
        demandType,
        demandStatus: "open", // not used in validation currently
        hasSubmittedResponse,
        hasFinalResponse,
        hasDeliverableUrl,
        hasApprovedResponse,
        hasReadyWorkflowStep,
        allApprovalsApproved,
      });
    },
    enabled: !!demandId,
  });
}

/**
 * Calls the server-side rpc_complete_demand RPC.
 */
export function useCompleteDemand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      demandId,
      reason,
    }: {
      demandId: string;
      reason?: string;
    }) => {
      const { data, error } = await supabase.rpc(
        "rpc_complete_demand" as never,
        {
          p_demand_id: demandId,
          p_reason: reason || null,
        } as never
      );

      if (error) throw error;

      const result = data as unknown as {
        success: boolean;
        error?: string;
        missing?: { key: string; label: string }[];
        demand_id?: string;
      };

      if (!result.success) {
        throw Object.assign(new Error(result.error || "Erro ao concluir"), {
          missing: result.missing,
        });
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["marketing-demands"] });
      queryClient.invalidateQueries({ queryKey: ["demand-stats"] });
      queryClient.invalidateQueries({
        queryKey: ["completion-criteria", data.demand_id],
      });
      toast.success("Demanda concluída com sucesso!");
    },
    onError: (err: Error & { missing?: { key: string; label: string }[] }) => {
      if (err.missing && err.missing.length > 0) {
        toast.error("Critérios não atendidos. Verifique o checklist.");
      } else {
        toast.error(err.message);
      }
    },
  });
}
