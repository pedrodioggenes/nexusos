/**
 * Feature Flags — Marketing Demandas
 *
 * Todas as evoluções incrementais ficam atrás de flags.
 * Nunca altere o default para `true` sem validação completa
 * no checklist de regressão (docs/regression/demandas.md).
 */

export const FEATURE_FLAGS = {
  /** Layout V2 — reorganização visual sem risco funcional */
  DEMANDS_LAYOUT_V2: true,

  /** Governance V1 — regras de transição de status, owner obrigatório */
  DEMANDS_GOVERNANCE_V1: false,

  /** Server-side filters — paginação e filtros no Supabase */
  DEMANDS_SERVER_FILTERS_V1: false,

  /** Approvals RBAC — aprovação multi-nível com papéis */
  DEMANDS_APPROVALS_RBAC_V1: false,

  /** Completion Criteria — critérios de aceite obrigatórios */
  DEMANDS_COMPLETION_CRITERIA_V1: false,

  /** Templates — modelos de demanda reutilizáveis */
  DEMANDS_TEMPLATES_V1: false,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Verifica se uma feature flag está habilitada.
 * Uso: `if (isFeatureEnabled('DEMANDS_GOVERNANCE_V1')) { ... }`
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag] === true;
}
