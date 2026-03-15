import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ─── Initiatives ───
export function usePMOInitiatives() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["pmo-initiatives", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("pmo_initiatives")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("calculated_score", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenant?.id,
  });
}

export function useCreateInitiative() {
  const { tenant, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!tenant?.id || !user?.id) throw new Error("auth");
      const impact = Number(values.impact_score) || 0;
      const effort = Number(values.effort_score) || 0;
      const { data, error } = await supabase.from("pmo_initiatives").insert({
        ...values,
        tenant_id: tenant.id,
        created_by: user.id,
        impact_score: impact,
        effort_score: effort,
        calculated_score: impact > 0 && effort > 0 ? Math.round((impact / effort) * 100) / 100 : null,
      } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pmo-initiatives"] });
      toast.success("Iniciativa criada");
    },
    onError: () => toast.error("Erro ao criar iniciativa"),
  });
}

export function useUpdateInitiative() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: Record<string, unknown> & { id: string }) => {
      const impact = values.impact_score != null ? Number(values.impact_score) : undefined;
      const effort = values.effort_score != null ? Number(values.effort_score) : undefined;
      const updates: Record<string, unknown> = { ...values };
      if (impact != null && effort != null && impact > 0 && effort > 0) {
        updates.calculated_score = Math.round((impact / effort) * 100) / 100;
      }
      const { error } = await supabase.from("pmo_initiatives").update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pmo-initiatives"] });
      toast.success("Iniciativa atualizada");
    },
    onError: () => toast.error("Erro ao atualizar"),
  });
}

// ─── Sprints ───
export function usePMOSprints() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["pmo-sprints", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("pmo_sprints")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenant?.id,
  });
}

export function useCreateSprint() {
  const { tenant, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!tenant?.id || !user?.id) throw new Error("auth");
      const { data, error } = await supabase.from("pmo_sprints").insert({
        ...values,
        tenant_id: tenant.id,
        created_by: user.id,
      } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pmo-sprints"] });
      toast.success("Sprint criada");
    },
    onError: () => toast.error("Erro ao criar sprint"),
  });
}

export function useUpdateSprint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: Record<string, unknown> & { id: string }) => {
      const { error } = await supabase.from("pmo_sprints").update(values as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pmo-sprints"] });
      toast.success("Sprint atualizada");
    },
    onError: () => toast.error("Erro ao atualizar sprint"),
  });
}

export function usePMOSprintItems(sprintId?: string) {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["pmo-sprint-items", sprintId],
    queryFn: async () => {
      if (!tenant?.id || !sprintId) return [];
      const { data, error } = await supabase
        .from("pmo_sprint_items")
        .select("*, pmo_initiatives(*)")
        .eq("tenant_id", tenant.id)
        .eq("sprint_id", sprintId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenant?.id && !!sprintId,
  });
}

export function useCreateSprintItem() {
  const { tenant } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { sprint_id: string; initiative_id: string }) => {
      if (!tenant?.id) throw new Error("auth");
      const { error } = await supabase.from("pmo_sprint_items").insert({
        ...values,
        tenant_id: tenant.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pmo-sprint-items"] });
      toast.success("Item adicionado à sprint");
    },
    onError: () => toast.error("Erro ao adicionar item"),
  });
}

// ─── Weekly Reports ───
export function usePMOWeeklyReports() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["pmo-weekly-reports", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("pmo_weekly_reports")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("edition", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenant?.id,
  });
}

export function useCreateWeeklyReport() {
  const { tenant, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!tenant?.id || !user?.id) throw new Error("auth");
      const { data, error } = await supabase.from("pmo_weekly_reports").insert({
        ...values,
        tenant_id: tenant.id,
        created_by: user.id,
      } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pmo-weekly-reports"] });
      toast.success("Dashboard semanal criado");
    },
    onError: () => toast.error("Erro ao criar dashboard"),
  });
}

export function useUpdateWeeklyReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: Record<string, unknown> & { id: string }) => {
      const { error } = await supabase.from("pmo_weekly_reports").update(values as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pmo-weekly-reports"] });
      toast.success("Dashboard atualizado");
    },
    onError: () => toast.error("Erro ao atualizar dashboard"),
  });
}

// ─── Monthly Metrics ───
export function usePMOMonthlyMetrics(month?: string) {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["pmo-monthly-metrics", tenant?.id, month],
    queryFn: async () => {
      if (!tenant?.id) return [];
      let q = supabase
        .from("pmo_monthly_metrics")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("month", { ascending: false });
      if (month) q = q.eq("month", month);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenant?.id,
  });
}

export function useCreateMonthlyMetric() {
  const { tenant, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!tenant?.id || !user?.id) throw new Error("auth");
      const baseline = Number(values.baseline) || 0;
      const current = Number(values.current_value) || 0;
      const { data, error } = await supabase.from("pmo_monthly_metrics").insert({
        ...values,
        tenant_id: tenant.id,
        created_by: user.id,
        delta: current - baseline,
      } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pmo-monthly-metrics"] });
      toast.success("Métrica registrada");
    },
    onError: () => toast.error("Erro ao registrar métrica"),
  });
}

// ─── Releases ───
export function usePMOReleases() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["pmo-releases", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("pmo_releases")
        .select("*, pmo_release_items(*)")
        .eq("tenant_id", tenant.id)
        .order("release_date", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenant?.id,
  });
}

export function useCreateRelease() {
  const { tenant, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!tenant?.id || !user?.id) throw new Error("auth");
      const { data, error } = await supabase.from("pmo_releases").insert({
        ...values,
        tenant_id: tenant.id,
        created_by: user.id,
      } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pmo-releases"] });
      toast.success("Release criada");
    },
    onError: () => toast.error("Erro ao criar release"),
  });
}

export function useCreateReleaseItem() {
  const { tenant } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { release_id: string; description: string; modules_impacted?: string[]; initiative_id?: string }) => {
      if (!tenant?.id) throw new Error("auth");
      const { error } = await supabase.from("pmo_release_items").insert({
        ...values,
        tenant_id: tenant.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pmo-releases"] });
      toast.success("Item adicionado à release");
    },
    onError: () => toast.error("Erro ao adicionar item"),
  });
}

// ─── Training Sessions ───
export function usePMOTrainingSessions() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["pmo-training-sessions", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("pmo_training_sessions")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("session_date", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenant?.id,
  });
}

export function useCreateTrainingSession() {
  const { tenant, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!tenant?.id || !user?.id) throw new Error("auth");
      const { data, error } = await supabase.from("pmo_training_sessions").insert({
        ...values,
        tenant_id: tenant.id,
        created_by: user.id,
      } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pmo-training-sessions"] });
      toast.success("Sessão criada");
    },
    onError: () => toast.error("Erro ao criar sessão"),
  });
}

// ─── Playbooks ───
export function usePMOPlaybooks() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["pmo-playbooks", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("pmo_playbooks")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenant?.id,
  });
}

export function useCreatePlaybook() {
  const { tenant, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!tenant?.id || !user?.id) throw new Error("auth");
      const { data, error } = await supabase.from("pmo_playbooks").insert({
        ...values,
        tenant_id: tenant.id,
        created_by: user.id,
      } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pmo-playbooks"] });
      toast.success("Playbook publicado");
    },
    onError: () => toast.error("Erro ao criar playbook"),
  });
}

// ─── Internal Owners ───
export function usePMOInternalOwners() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["pmo-internal-owners", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase.from("pmo_internal_owners").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenant?.id,
  });
}

export function useCreateInternalOwner() {
  const { tenant, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!tenant?.id || !user?.id) throw new Error("auth");
      const { error } = await supabase.from("pmo_internal_owners").insert({ ...values, tenant_id: tenant.id, created_by: user.id } as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pmo-internal-owners"] }); toast.success("Dono interno registrado"); },
    onError: () => toast.error("Erro ao registrar"),
  });
}

// ─── Incidents ───
export function usePMOIncidents() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["pmo-incidents", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase.from("pmo_incidents").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenant?.id,
  });
}

export function useCreateIncident() {
  const { tenant, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!tenant?.id || !user?.id) throw new Error("auth");
      const { error } = await supabase.from("pmo_incidents").insert({ ...values, tenant_id: tenant.id, created_by: user.id } as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pmo-incidents"] }); toast.success("Incidente registrado"); },
    onError: () => toast.error("Erro ao registrar incidente"),
  });
}

// ─── Immersions ───
export function usePMOImmersions() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["pmo-immersions", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase.from("pmo_immersions").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenant?.id,
  });
}

export function useCreateImmersion() {
  const { tenant, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!tenant?.id || !user?.id) throw new Error("auth");
      const { error } = await supabase.from("pmo_immersions").insert({ ...values, tenant_id: tenant.id, created_by: user.id } as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pmo-immersions"] }); toast.success("Imersão registrada"); },
    onError: () => toast.error("Erro ao registrar imersão"),
  });
}

// ─── Work Agenda ───
export function usePMOWorkAgenda() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["pmo-work-agenda", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase.from("pmo_work_agenda").select("*").eq("tenant_id", tenant.id).order("event_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenant?.id,
  });
}

export function useCreateWorkAgenda() {
  const { tenant, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!tenant?.id || !user?.id) throw new Error("auth");
      const { error } = await supabase.from("pmo_work_agenda").insert({ ...values, tenant_id: tenant.id, created_by: user.id } as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pmo-work-agenda"] }); toast.success("Evento adicionado"); },
    onError: () => toast.error("Erro ao adicionar evento"),
  });
}

// ─── Quarterly Reviews ───
export function usePMOQuarterlyReviews() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["pmo-quarterly-reviews", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase.from("pmo_quarterly_reviews").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenant?.id,
  });
}

export function useCreateQuarterlyReview() {
  const { tenant, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!tenant?.id || !user?.id) throw new Error("auth");
      const { error } = await supabase.from("pmo_quarterly_reviews").insert({ ...values, tenant_id: tenant.id, created_by: user.id } as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pmo-quarterly-reviews"] }); toast.success("Revisão registrada"); },
    onError: () => toast.error("Erro ao registrar revisão"),
  });
}

// ─── Approvals ───
export function usePMOApprovals() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["pmo-approvals", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase.from("pmo_approvals").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenant?.id,
  });
}

export function useCreateApproval() {
  const { tenant, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!tenant?.id || !user?.id) throw new Error("auth");
      const { error } = await supabase.from("pmo_approvals").insert({ ...values, tenant_id: tenant.id, created_by: user.id } as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pmo-approvals"] }); toast.success("Aprovação solicitada"); },
    onError: () => toast.error("Erro ao solicitar aprovação"),
  });
}

export function useUpdateApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: Record<string, unknown> & { id: string }) => {
      const { error } = await supabase.from("pmo_approvals").update(values as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pmo-approvals"] }); toast.success("Aprovação atualizada"); },
    onError: () => toast.error("Erro ao atualizar aprovação"),
  });
}

// ─── Decisions ───
export function usePMODecisions() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["pmo-decisions", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase.from("pmo_decisions").select("*").eq("tenant_id", tenant.id).order("decision_date", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenant?.id,
  });
}

export function useCreateDecision() {
  const { tenant, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!tenant?.id || !user?.id) throw new Error("auth");
      const { error } = await supabase.from("pmo_decisions").insert({ ...values, tenant_id: tenant.id, created_by: user.id } as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pmo-decisions"] }); toast.success("Decisão registrada"); },
    onError: () => toast.error("Erro ao registrar decisão"),
  });
}

// ─── Tools/Costs ───
export function usePMOToolsCosts() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["pmo-tools-costs", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase.from("pmo_tools_costs").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenant?.id,
  });
}

export function useCreateToolCost() {
  const { tenant, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!tenant?.id || !user?.id) throw new Error("auth");
      const { error } = await supabase.from("pmo_tools_costs").insert({ ...values, tenant_id: tenant.id, created_by: user.id } as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pmo-tools-costs"] }); toast.success("Ferramenta registrada"); },
    onError: () => toast.error("Erro ao registrar ferramenta"),
  });
}

// ─── Settings ───
export function usePMOSettings() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["pmo-settings", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return null;
      const { data, error } = await supabase.from("pmo_settings").select("*").eq("tenant_id", tenant.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id,
  });
}

export function useUpsertPMOSettings() {
  const { tenant, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!tenant?.id || !user?.id) throw new Error("auth");
      const { data: existing } = await supabase.from("pmo_settings").select("id").eq("tenant_id", tenant.id).maybeSingle();
      if (existing) {
        const { error } = await supabase.from("pmo_settings").update(values as any).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("pmo_settings").insert({ ...values, tenant_id: tenant.id } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pmo-settings"] }); toast.success("Configurações salvas"); },
    onError: () => toast.error("Erro ao salvar configurações"),
  });
}

// ─── PDI Phases ───
export function usePDIPhases() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["pdi-phases", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("pdi_phases")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenant?.id,
  });
}

export function useUpdatePDIPhase() {
  const { tenant } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: { id: string } & Record<string, unknown>) => {
      if (!tenant?.id) throw new Error("auth");
      const { error } = await supabase
        .from("pdi_phases")
        .update(values as any)
        .eq("id", id)
        .eq("tenant_id", tenant.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pdi-phases"] }); toast.success("Fase atualizada"); },
    onError: () => toast.error("Erro ao atualizar fase"),
  });
}

export function useCreatePDIPhase() {
  const { tenant } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!tenant?.id) throw new Error("auth");
      const { error } = await supabase
        .from("pdi_phases")
        .insert({ ...values, tenant_id: tenant.id } as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pdi-phases"] }); toast.success("Fase criada"); },
    onError: () => toast.error("Erro ao criar fase"),
  });
}

export function useDeletePDIPhase() {
  const { tenant } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!tenant?.id) throw new Error("auth");
      const { error } = await supabase
        .from("pdi_phases")
        .delete()
        .eq("id", id)
        .eq("tenant_id", tenant.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pdi-phases"] }); toast.success("Fase removida"); },
    onError: () => toast.error("Erro ao remover fase"),
  });
}

// ─── PDI Cycles ───
export function usePDICycles() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["pdi-cycles", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("pdi_cycles")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenant?.id,
  });
}

export function useUpdatePDICycle() {
  const { tenant } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: { id: string } & Record<string, unknown>) => {
      if (!tenant?.id) throw new Error("auth");
      const { error } = await supabase
        .from("pdi_cycles")
        .update(values as any)
        .eq("id", id)
        .eq("tenant_id", tenant.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pdi-cycles"] }); toast.success("Ciclo atualizado"); },
    onError: () => toast.error("Erro ao atualizar ciclo"),
  });
}

export function useCreatePDICycle() {
  const { tenant } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!tenant?.id) throw new Error("auth");
      const { error } = await supabase
        .from("pdi_cycles")
        .insert({ ...values, tenant_id: tenant.id } as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pdi-cycles"] }); toast.success("Ciclo criado"); },
    onError: () => toast.error("Erro ao criar ciclo"),
  });
}

export function useDeletePDICycle() {
  const { tenant } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!tenant?.id) throw new Error("auth");
      const { error } = await supabase
        .from("pdi_cycles")
        .delete()
        .eq("id", id)
        .eq("tenant_id", tenant.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pdi-cycles"] }); toast.success("Ciclo removido"); },
    onError: () => toast.error("Erro ao remover ciclo"),
  });
}
