import { useAuth } from "@/contexts/AuthContext";
import { useMarketingDemands, demandStatusConfig } from "@/hooks/useMarketingDemands";
import { ClipboardList, Circle, Clock, CheckCircle2, Eye } from "lucide-react";

export function MarketingDemandsWidget() {
  const { user } = useAuth();
  const { data: demands = [], isLoading } = useMarketingDemands({});

  if (isLoading) {
    return (
      <div className="rounded-xl p-4" style={{ backgroundColor: '#18181B', border: '1px solid #27272A' }}>
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="h-4 w-4" style={{ color: '#71717A' }} />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#71717A' }}>Demandas</span>
        </div>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-5 rounded" style={{ backgroundColor: '#27272A' }} />
          ))}
        </div>
      </div>
    );
  }

  const open = demands.filter(d => d.status === 'open').length;
  const inProgress = demands.filter(d => d.status === 'in_progress').length;
  const review = demands.filter(d => d.status === 'review').length;
  const completed = demands.filter(d => d.status === 'completed').length;
  const total = demands.length;

  const stats = [
    { label: 'A Fazer', value: open, icon: Circle, color: '#F59E0B' },
    { label: 'Fazendo', value: inProgress, icon: Clock, color: '#3B82F6' },
    { label: 'Revisão', value: review, icon: Eye, color: '#8B5CF6' },
    { label: 'Concluídas', value: completed, icon: CheckCircle2, color: '#22C55E' },
  ];

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: '#18181B', border: '1px solid #27272A' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4" style={{ color: '#8B5CF6' }} />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#71717A' }}>Demandas</span>
        </div>
        <span className="text-[10px] font-medium" style={{ color: '#52525B' }}>{total} total</span>
      </div>
      <div className="space-y-2">
        {stats.map(s => (
          <div key={s.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <s.icon className="h-3 w-3" style={{ color: s.color }} />
              <span className="text-xs" style={{ color: '#A1A1AA' }}>{s.label}</span>
            </div>
            <span className="text-xs font-semibold" style={{ color: s.value > 0 ? s.color : '#3F3F46' }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <div className="mt-3 h-1.5 rounded-full flex overflow-hidden" style={{ backgroundColor: '#27272A' }}>
        {total > 0 && (
          <>
            <div style={{ width: `${(completed / total) * 100}%`, backgroundColor: '#22C55E' }} />
            <div style={{ width: `${(review / total) * 100}%`, backgroundColor: '#8B5CF6' }} />
            <div style={{ width: `${(inProgress / total) * 100}%`, backgroundColor: '#3B82F6' }} />
            <div style={{ width: `${(open / total) * 100}%`, backgroundColor: '#F59E0B' }} />
          </>
        )}
      </div>
    </div>
  );
}
