/**
 * Builds a URL to navigate to NexusDesk with prefilled comprovação context.
 */
export function buildComprovacaoUrl(params: {
  actionName: string;
  storeName: string;
  retailActionId: string;
  storeId: string;
  itemId?: string;
  itemCategory?: string;
  itemTitle?: string;
  channel?: string;
}): string {
  const lines = [
    "#comprovação",
    `Ação: ${params.actionName}`,
    `Loja: ${params.storeName}`,
  ];
  if (params.itemId && params.itemTitle) {
    const prefix = params.itemCategory ? `${params.itemCategory} - ` : "";
    lines.push(`Item: ${prefix}${params.itemTitle}`);
  }

  const prefillText = lines.join("\n");

  const qs = new URLSearchParams({
    prefill: prefillText,
    comprovacao: "1",
    retailActionId: params.retailActionId,
    storeId: params.storeId,
  });
  if (params.itemId) {
    qs.set("itemId", params.itemId);
  }

  return `/app/desk?${qs.toString()}`;
}