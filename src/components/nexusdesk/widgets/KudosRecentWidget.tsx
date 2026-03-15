import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useHWRecognitions } from "@/hooks/useHWRecognitions";
import { Heart } from "lucide-react";
import { HWWidgetCard } from "./WidgetCard";

export function KudosRecentWidget() {
  const { data: tenantId } = useHWTenantId();
  const { data: recognitions } = useHWRecognitions(tenantId || undefined);

  const recent = (recognitions || []).slice(0, 3);

  if (recent.length === 0) return null;

  return (
    <HWWidgetCard title="Kudos Recentes" icon={<Heart className="h-4 w-4" />}>
      <div className="space-y-2.5">
        {recent.map(r => (
          <div key={r.id} className="flex items-start gap-2">
            <span className="text-sm shrink-0">{r.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-festval-ivory">
                <strong>{r.from_name}</strong> → {r.to_name}
              </p>
              <p className="text-[10px] truncate" style={{ color: 'hsl(var(--festval-stone))' }}>{r.message}</p>
            </div>
          </div>
        ))}
      </div>
    </HWWidgetCard>
  );
}
