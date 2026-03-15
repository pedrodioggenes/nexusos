/**
 * Demand Completion Criteria
 *
 * Defines minimum requirements for completing a demand based on its type.
 * Used both client-side (UI checklist) and referenced by the RPC.
 */

import type { DemandType, DemandStatus } from './types';

// ─── TYPES ────────────────────────────────────────────────────

export interface CompletionCriterion {
  key: string;
  label: string;
  /** Human-friendly hint shown when criterion is not met */
  hint: string;
  /** Where the user should go to satisfy this */
  actionLabel?: string;
}

export interface CompletionValidationInput {
  demandType: DemandType;
  demandStatus: DemandStatus;
  /** Whether at least one response has been submitted */
  hasSubmittedResponse: boolean;
  /** Whether at least one response is marked is_final=true */
  hasFinalResponse: boolean;
  /** Whether there are any deliverable_urls in responses */
  hasDeliverableUrl: boolean;
  /** Whether there are approved responses */
  hasApprovedResponse: boolean;
  /** Whether the 'ready' workflow step is done */
  hasReadyWorkflowStep: boolean;
  /** Whether all required approvals are approved */
  allApprovalsApproved: boolean;
}

export interface CompletionValidationResult {
  ok: boolean;
  /** Criteria that are NOT met */
  missing: CompletionCriterion[];
  /** All criteria for this demand type */
  all: (CompletionCriterion & { met: boolean })[];
}

// ─── CRITERIA BY TYPE ─────────────────────────────────────────

const CRITERIA_REGISTRY: Record<DemandType, CompletionCriterion[]> = {
  design: [
    {
      key: 'deliverable',
      label: 'Entregável final anexado',
      hint: 'Anexe pelo menos um arquivo/link marcado como entrega final.',
      actionLabel: 'Adicionar entregável',
    },
    {
      key: 'response_submitted',
      label: 'Resposta submetida',
      hint: 'Envie uma resposta com os arquivos da entrega.',
      actionLabel: 'Abrir respostas',
    },
  ],
  copywriting: [
    {
      key: 'deliverable',
      label: 'Texto final ou link entregue',
      hint: 'Adicione o documento/link final como entregável.',
      actionLabel: 'Adicionar entregável',
    },
    {
      key: 'response_submitted',
      label: 'Resposta submetida',
      hint: 'Envie uma resposta com o texto final.',
      actionLabel: 'Abrir respostas',
    },
  ],
  video: [
    {
      key: 'deliverable',
      label: 'Arquivo de vídeo final anexado',
      hint: 'Anexe o link do vídeo final.',
      actionLabel: 'Adicionar entregável',
    },
    {
      key: 'response_submitted',
      label: 'Resposta submetida',
      hint: 'Envie uma resposta com o link do vídeo.',
      actionLabel: 'Abrir respostas',
    },
  ],
  social_media: [
    {
      key: 'ready_or_deliverable',
      label: 'Pronto para publicar ou entregável final',
      hint: 'Marque a etapa "Pronto para Publicar" no workflow OU adicione um entregável final.',
      actionLabel: 'Ver workflow',
    },
    {
      key: 'response_submitted',
      label: 'Resposta submetida',
      hint: 'Envie uma resposta com o conteúdo para publicação.',
      actionLabel: 'Abrir respostas',
    },
  ],
  general: [
    {
      key: 'response_submitted',
      label: 'Ao menos uma resposta submetida',
      hint: 'Envie uma resposta antes de concluir.',
      actionLabel: 'Abrir respostas',
    },
  ],
};

// ─── PUBLIC API ───────────────────────────────────────────────

/**
 * Returns the default criteria list for a demand type.
 */
export function getDefaultCriteriaByType(type: DemandType): CompletionCriterion[] {
  return CRITERIA_REGISTRY[type] || CRITERIA_REGISTRY.general;
}

/**
 * Validate whether a demand meets all completion criteria for its type.
 */
export function validateCompletion(
  input: CompletionValidationInput
): CompletionValidationResult {
  const criteria = getDefaultCriteriaByType(input.demandType);

  const evaluated = criteria.map((criterion) => {
    let met = false;

    switch (criterion.key) {
      case 'deliverable':
        met = input.hasDeliverableUrl || input.hasFinalResponse;
        break;
      case 'ready_or_deliverable':
        met = input.hasReadyWorkflowStep || input.hasDeliverableUrl || input.hasFinalResponse;
        break;
      case 'response_submitted':
        met = input.hasSubmittedResponse || input.hasApprovedResponse || input.hasFinalResponse;
        break;
      default:
        met = false;
    }

    return { ...criterion, met };
  });

  const missing = evaluated.filter((c) => !c.met);

  return {
    ok: missing.length === 0,
    missing,
    all: evaluated,
  };
}
