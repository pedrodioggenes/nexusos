import { useAuth } from "@/contexts/AuthContext";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { usePerformanceReviews } from "@/hooks/usePerformanceReviews";
import { ClipboardCheck } from "lucide-react";
import { HWWidgetCard } from "./WidgetCard";

export function PerformancePendingWidget() {
  const { user } = useAuth();
  const { data: tenantId } = useHWTenantId();
  const { data: reviews } = usePerformanceReviews(undefined, tenantId || undefined);

  const drafts = (reviews || []).filter((r: any) => r.status === 'draft');
  const pending = (reviews || []).filter((r: any) => r.status === 'submitted');

  if (drafts.length === 0 && pending.length === 0) return null;

  return (
    <HWWidgetCard title="Avaliações" icon={<ClipboardCheck className="h-4 w-4" />}>
      <div className="space-y-2">
        {drafts.length > 0 && (
          <div className="flex justify-between text-xs">
            <span style={{ color: 'hsl(var(--festval-stone))' }}>Rascunhos</span>
            <span className="font-semibold" style={{ color: '#EAB308' }}>{drafts.length}</span>
          </div>
        )}
        {pending.length > 0 && (
          <div className="flex justify-between text-xs">
            <span style={{ color: 'hsl(var(--festval-stone))' }}>Aguardando revisão</span>
            <span className="font-semibold" style={{ color: '#3B82F6' }}>{pending.length}</span>
          </div>
        )}
        <p className="text-[10px]" style={{ color: 'hsl(var(--festval-stone-muted))' }}>
          {drafts.length > 0 ? `${drafts.length} avaliação(ões) pendente(s)` : 'Todas em dia'}
        </p>
      </div>
    </HWWidgetCard>
  );
}
