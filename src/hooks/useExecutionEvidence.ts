import { useHyperworksEntityLinks, HyperworksEntityLink } from "./useHyperworksEntityLinks";

export function useExecutionEvidenceForRun(runId: string | null) {
  return useHyperworksEntityLinks(
    "retail_execution_run",
    runId || undefined
  );
}

export function useExecutionEvidenceForItem(itemId: string | null) {
  return useHyperworksEntityLinks(
    "retail_execution_item",
    itemId || undefined
  );
}

export type { HyperworksEntityLink };
