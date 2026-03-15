import { useAuth } from "@/contexts/AuthContext";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useHWDocumentSignatures } from "@/hooks/useHWDocumentSignatures";
import { FileSignature } from "lucide-react";
import { HWWidgetCard } from "./WidgetCard";

export function PendingSignaturesWidget() {
  const { user } = useAuth();
  const { data: tenantId } = useHWTenantId();
  const { data: signatures } = useHWDocumentSignatures(tenantId || undefined, user?.id);

  const pending = (signatures || []).filter(s => s.status === 'pending');
  const signed = (signatures || []).filter(s => s.status === 'signed');

  if (pending.length === 0 && signed.length === 0) return null;

  return (
    <HWWidgetCard title="Assinaturas" icon={<FileSignature className="h-4 w-4" />}>
      <div className="space-y-2">
        {pending.length > 0 && (
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <p className="text-xs font-medium" style={{ color: '#F87171' }}>
              {pending.length} documento(s) pendente(s)
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: 'hsl(var(--festval-stone))' }}>
              Aguardando sua assinatura
            </p>
          </div>
        )}
        {pending.slice(0, 3).map(s => (
          <div key={s.id} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: '#EF4444' }} />
            <span className="text-xs truncate flex-1 text-festval-ivory">{s.document_title}</span>
          </div>
        ))}
        {signed.length > 0 && (
          <div className="flex justify-between text-xs">
            <span style={{ color: 'hsl(var(--festval-stone))' }}>Assinados</span>
            <span className="font-semibold" style={{ color: '#22C55E' }}>{signed.length}</span>
          </div>
        )}
      </div>
    </HWWidgetCard>
  );
}
