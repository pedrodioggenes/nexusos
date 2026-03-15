import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useHWBulletins } from "@/hooks/useHWBulletins";
import { Pin } from "lucide-react";
import { HWWidgetCard } from "./WidgetCard";

export function PinnedBulletinsWidget() {
  const { data: tenantId } = useHWTenantId();
  const { data: bulletins } = useHWBulletins(tenantId || undefined);

  const pinned = (bulletins || []).filter(b => b.pinned);

  if (pinned.length === 0) return null;

  const priorityColors: Record<string, { bg: string; color: string }> = {
    urgent: { bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' },
    high: { bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' },
    normal: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' },
    low: { bg: 'rgba(113, 113, 122, 0.15)', color: 'hsl(var(--festval-stone))' },
  };

  return (
    <HWWidgetCard title="Avisos Fixados" icon={<Pin className="h-4 w-4" />}>
      <div className="space-y-2">
        {pinned.slice(0, 4).map(b => {
          const pColor = priorityColors[b.priority] || priorityColors.normal;
          return (
            <div key={b.id} className="p-2 rounded-lg" style={{ backgroundColor: 'hsl(var(--festval-border))' }}>
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate text-festval-ivory">{b.title}</p>
                  <p className="text-[10px] truncate mt-0.5" style={{ color: 'hsl(var(--festval-stone))' }}>{b.content}</p>
                </div>
                <span className="text-[9px] px-1 py-0.5 rounded shrink-0" style={{ backgroundColor: pColor.bg, color: pColor.color }}>
                  {b.priority === 'urgent' ? 'Urgente' : b.priority === 'high' ? 'Alta' : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </HWWidgetCard>
  );
}
