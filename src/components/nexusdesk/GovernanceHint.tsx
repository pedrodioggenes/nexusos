/**
 * Non-blocking governance hints for the message composer.
 * Shows template suggestions, type badges, and #comprovação auto-link hints.
 */
import { Info, Lightbulb, Link2 } from "lucide-react";
import type { MessageType } from "@/hooks/useChannelGovernance";

interface GovernanceHintProps {
  /** Currently detected message type based on content */
  detectedType: MessageType | null;
  /** Allowed types for this channel */
  allowedTypes: MessageType[];
  /** Template suggestion for this channel */
  suggestedTemplate: string | null;
  /** Whether to show comprovação link suggestion */
  showComprovacaoHint: boolean;
  /** Callback when user wants to use suggested template */
  onUseTemplate?: () => void;
}

const typeLabels: Record<MessageType, { label: string; color: string }> = {
  normal: { label: 'Mensagem', color: '#71717A' },
  comunicado: { label: 'Comunicado', color: '#2563EB' },
  pedido: { label: 'Pedido', color: '#D97706' },
  'comprovação': { label: 'Comprovação', color: '#059669' },
};

export function GovernanceHint({
  detectedType,
  allowedTypes,
  suggestedTemplate,
  showComprovacaoHint,
  onUseTemplate,
}: GovernanceHintProps) {
  // Nothing to show
  if (!showComprovacaoHint && !suggestedTemplate && !detectedType) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 text-xs" style={{ borderTop: '1px solid #27272A' }}>
      {/* Detected type badge */}
      {detectedType && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium"
          style={{
            backgroundColor: typeLabels[detectedType].color + '20',
            color: typeLabels[detectedType].color,
          }}
        >
          <Info className="h-3 w-3" />
          {typeLabels[detectedType].label}
        </span>
      )}

      {/* Type not in allowed list warning */}
      {detectedType && !allowedTypes.includes(detectedType) && (
        <span className="text-xs" style={{ color: '#D97706' }}>
          ⚠ Este canal não costuma receber {typeLabels[detectedType].label.toLowerCase()}s
        </span>
      )}

      {/* Comprovação auto-link hint */}
      {showComprovacaoHint && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
          style={{ backgroundColor: '#059669' + '20', color: '#059669' }}
        >
          <Link2 className="h-3 w-3" />
          Após postar, sugeriremos vincular à Execução em Loja
        </span>
      )}

      {/* Template suggestion */}
      {suggestedTemplate && !detectedType && (
        <button
          onClick={onUseTemplate}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
          style={{ backgroundColor: '#7C2D12' + '20', color: '#C2410C' }}
        >
          <Lightbulb className="h-3 w-3" />
          Usar template sugerido
        </button>
      )}
    </div>
  );
}
