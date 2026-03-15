/**
 * Financeiro — Business Rules Hooks
 * Connects frontend to DB-level business rules (R-01, R-05, R-11)
 */
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ============ R-01: Criar Nova Versão de Resultado Aprovado ============

export function useNovaVersaoResultado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ resultadoId, justificativa }: { resultadoId: string; justificativa: string }) => {
      const { data, error } = await supabase.rpc("fin_criar_nova_versao_resultado", {
        p_resultado_id: resultadoId,
        p_justificativa: justificativa,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: (newId) => {
      toast.success("Nova versão criada com sucesso", {
        description: `ID: ${newId.slice(0, 8)}…`,
      });
      queryClient.invalidateQueries({ queryKey: ["fin-resultados"] });
    },
    onError: (err: Error) => {
      toast.error("Erro ao criar nova versão", { description: err.message });
    },
  });
}

// ============ R-05: Avaliar Semáforos ============

export function useAvaliarSemaforos() {
  return useMutation({
    mutationFn: async (tenantId: string) => {
      const { data, error } = await supabase.rpc("fin_avaliar_semaforos", {
        p_tenant_id: tenantId,
      });
      if (error) throw error;
      return data as number;
    },
    onSuccess: (count) => {
      if (count > 0) {
        toast.warning(`${count} alerta(s) gerado(s)`, {
          description: "Verifique o painel de alertas financeiros.",
        });
      } else {
        toast.success("Todos os indicadores dentro das metas");
      }
    },
    onError: (err: Error) => {
      toast.error("Erro na avaliação de semáforos", { description: err.message });
    },
  });
}

// ============ R-11: Verificar Deterioração IMC ============

export function useVerificarIMCDeterioracao() {
  return useMutation({
    mutationFn: async (tenantId: string) => {
      const { data, error } = await supabase.rpc("fin_verificar_imc_deterioracao", {
        p_tenant_id: tenantId,
      });
      if (error) throw error;
      return data as number;
    },
    onSuccess: (count) => {
      if (count > 0) {
        toast.warning(`${count} categoria(s) com IMC em deterioração`);
      }
    },
    onError: (err: Error) => {
      toast.error("Erro na verificação de IMC", { description: err.message });
    },
  });
}

// ============ R-03: Ratear Despesa ============

export function useRatearDespesa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ despesaId, meses }: { despesaId: string; meses?: number }) => {
      const { error } = await supabase.rpc("fin_ratear_despesa", {
        p_despesa_id: despesaId,
        p_meses: meses ?? 12,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Despesa rateada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["fin-despesas"] });
    },
    onError: (err: Error) => {
      toast.error("Erro no rateio", { description: err.message });
    },
  });
}

// ============ Query: Alertas Financeiros Ativos ============

export function useAlertasFinanceiros(tenantId?: string) {
  return useQuery({
    queryKey: ["fin-alertas", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("fin_alerta_financeiro")
        .select("*")
        .eq("tenant_id", tenantId)
        .is("resolvido_em", null)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
    staleTime: 30_000,
  });
}

// ============ Mutation: Resolver Alerta ============

export function useResolverAlerta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertaId: string) => {
      const { error } = await supabase
        .from("fin_alerta_financeiro")
        .update({ resolvido_em: new Date().toISOString(), resolvido_por: (await supabase.auth.getUser()).data.user?.id })
        .eq("id", alertaId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Alerta resolvido");
      queryClient.invalidateQueries({ queryKey: ["fin-alertas"] });
    },
    onError: (err: Error) => {
      toast.error("Erro ao resolver alerta", { description: err.message });
    },
  });
}
