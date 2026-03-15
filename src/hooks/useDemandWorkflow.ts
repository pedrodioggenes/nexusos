import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface WorkflowStep {
  id: string;
  tenant_id: string;
  demand_id: string;
  step_key: string;
  step_label: string;
  step_order: number;
  status: "pending" | "in_progress" | "blocked" | "done" | "skipped";
  owner_role: string | null;
  due_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DemandApproval {
  id: string;
  tenant_id: string;
  demand_id: string;
  required: boolean;
  approver_user_id: string | null;
  approver_role: string | null;
  status: "pending" | "approved" | "changes_requested" | "rejected";
  note: string | null;
  decided_at: string | null;
  created_at: string;
  updated_at: string;
}

// Default SLA hours by demand type
export const SLA_HOURS: Record<string, number> = {
  design: 48,
  copywriting: 24,
  video: 72,
  social_media: 24,
  general: 48,
};

// Default workflow steps template
const DEFAULT_STEPS: { key: string; label: string; ownerRole?: string }[] = [
  { key: "brief", label: "Briefing", ownerRole: "manager" },
  { key: "draft", label: "Rascunho", ownerRole: "design" },
  { key: "review", label: "Revisão", ownerRole: "manager" },
  { key: "approval", label: "Aprovação", ownerRole: "manager" },
  { key: "ready", label: "Pronto para Publicar" },
  { key: "published", label: "Publicado" },
  { key: "reported", label: "Reportado" },
];

// ─── Workflow Steps ───

export function useWorkflowSteps(demandId: string | undefined) {
  return useQuery({
    queryKey: ["workflow-steps", demandId],
    queryFn: async () => {
      if (!demandId) return [];
      const { data, error } = await supabase
        .from("demand_workflow_steps")
        .select("*")
        .eq("demand_id", demandId)
        .order("step_order", { ascending: true });
      if (error) throw error;
      return data as WorkflowStep[];
    },
    enabled: !!demandId,
  });
}

export function useInitWorkflowSteps() {
  const queryClient = useQueryClient();
  const { tenant } = useAuth();

  return useMutation({
    mutationFn: async ({
      demandId,
      demandType,
      dueDate,
    }: {
      demandId: string;
      demandType?: string;
      dueDate?: string;
    }) => {
      if (!tenant?.id) throw new Error("Tenant não encontrado");

      const slaHours = SLA_HOURS[demandType || "general"] || 48;
      const now = new Date();

      const rows = DEFAULT_STEPS.map((s, i) => {
        const stepDue = dueDate
          ? new Date(new Date(dueDate).getTime() - (DEFAULT_STEPS.length - i - 1) * slaHours * 60 * 60 * 1000 / DEFAULT_STEPS.length)
          : null;

        return {
          tenant_id: tenant.id,
          demand_id: demandId,
          step_key: s.key,
          step_label: s.label,
          step_order: i,
          status: i === 0 ? "in_progress" : "pending",
          owner_role: s.ownerRole || null,
          due_date: stepDue?.toISOString() || null,
          started_at: i === 0 ? now.toISOString() : null,
        };
      });

      const { data, error } = await supabase
        .from("demand_workflow_steps")
        .insert(rows as never[])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["workflow-steps", vars.demandId] });
      toast.success("Pipeline de produção criado!");
    },
    onError: (err: Error) => {
      toast.error("Erro ao criar pipeline: " + err.message);
    },
  });
}

export function useUpdateWorkflowStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      demandId,
    }: {
      id: string;
      status: WorkflowStep["status"];
      demandId: string;
    }) => {
      const updates: Record<string, unknown> = { status };
      if (status === "in_progress") updates.started_at = new Date().toISOString();
      if (status === "done") updates.completed_at = new Date().toISOString();

      const { data, error } = await supabase
        .from("demand_workflow_steps")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, demandId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workflow-steps", data.demandId] });
    },
  });
}

// ─── Demand Approvals ───

export function useDemandApprovals(demandId: string | undefined) {
  return useQuery({
    queryKey: ["demand-approvals", demandId],
    queryFn: async () => {
      if (!demandId) return [];
      const { data, error } = await supabase
        .from("demand_approvals")
        .select("*")
        .eq("demand_id", demandId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DemandApproval[];
    },
    enabled: !!demandId,
  });
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: ["demand-approvals-pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demand_approvals")
        .select("*, marketing_demands(id, title, type, priority, due_date, status)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as (DemandApproval & {
        marketing_demands: {
          id: string;
          title: string;
          type: string;
          priority: string;
          due_date: string | null;
          status: string;
        } | null;
      })[];
    },
  });
}

export function useCreateDemandApproval() {
  const queryClient = useQueryClient();
  const { tenant } = useAuth();

  return useMutation({
    mutationFn: async ({
      demandId,
      approverUserId,
      approverRole,
    }: {
      demandId: string;
      approverUserId?: string;
      approverRole?: string;
    }) => {
      if (!tenant?.id) throw new Error("Tenant não encontrado");

      const { data, error } = await supabase
        .from("demand_approvals")
        .insert({
          tenant_id: tenant.id,
          demand_id: demandId,
          approver_user_id: approverUserId || null,
          approver_role: approverRole || "admin",
          required: true,
        } as never)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["demand-approvals", vars.demandId] });
      queryClient.invalidateQueries({ queryKey: ["demand-approvals-pending"] });
      toast.success("Aprovação solicitada!");
    },
  });
}

export function useDecideDemandApproval() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      demandId,
      status,
      note,
      useRpc = false,
    }: {
      id: string;
      demandId: string;
      status: "approved" | "changes_requested" | "rejected";
      note?: string;
      useRpc?: boolean;
    }) => {
      if (useRpc) {
        // Server-side RBAC enforcement via RPC
        const { data, error } = await supabase.rpc(
          "rpc_decide_demand_approval" as never,
          {
            p_approval_id: id,
            p_decision: status,
            p_note: note || null,
          } as never
        );

        if (error) throw error;

        const result = data as unknown as {
          success: boolean;
          error?: string;
          approval_id?: string;
          demand_id?: string;
          decision?: string;
        };

        if (!result.success) {
          throw new Error(result.error || "Erro na decisão de aprovação");
        }

        return { ...result, demandId, status };
      }

      // Legacy: direct update (when flag is off)
      const { data, error } = await supabase
        .from("demand_approvals")
        .update({
          status,
          note: note || null,
          decided_at: new Date().toISOString(),
          approver_user_id: user?.id,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, demandId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["demand-approvals", data.demandId] });
      queryClient.invalidateQueries({ queryKey: ["demand-approvals-pending"] });
      queryClient.invalidateQueries({ queryKey: ["marketing-demands"] });

      const label =
        data.status === "approved"
          ? "Aprovada"
          : data.status === "changes_requested"
          ? "Ajustes solicitados"
          : "Rejeitada";
      toast.success(`Demanda: ${label}`);
    },
    onError: (err: Error) => {
      toast.error("Erro na decisão: " + err.message);
    },
  });
}

// ─── SLA check utility ───

export function isStepOverdue(step: WorkflowStep): boolean {
  if (step.status === "done" || step.status === "skipped") return false;
  if (!step.due_date) return false;
  return new Date(step.due_date) < new Date();
}

export function useOverdueSteps() {
  return useQuery({
    queryKey: ["workflow-steps-overdue"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("demand_workflow_steps")
        .select("*, marketing_demands(id, title, type, priority)")
        .in("status", ["pending", "in_progress", "blocked"])
        .lt("due_date", now)
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data as (WorkflowStep & {
        marketing_demands: {
          id: string;
          title: string;
          type: string;
          priority: string;
        } | null;
      })[];
    },
  });
}
