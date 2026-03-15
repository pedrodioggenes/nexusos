import { useMarketingDemands } from "@/hooks/useMarketingDemands";
import { BarChart3 } from "lucide-react";

export function MarketingPipelineWidget() {
  const { data: demands = [], isLoading } = useMarketingDemands({});

  if (isLoading) {
    return (
      <div className="rounded-xl p-4 bg-secondary border border-border">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pipeline</span>
        </div>
        <div className="animate-pulse h-16 rounded bg-muted" />
      </div>
    );
  }

  const stages = [
    { key: 'open', label: 'A Fazer', className: 'text-warning', bgClass: 'bg-warning/25' },
    { key: 'in_progress', label: 'Fazendo', className: 'text-blue-400', bgClass: 'bg-blue-400/25' },
    { key: 'review', label: 'Revisão', className: 'text-purple-400', bgClass: 'bg-purple-400/25' },
    { key: 'completed', label: 'Concluído', className: 'text-success', bgClass: 'bg-success/25' },
  ];

  const total = demands.length || 1;
  const counts = stages.map(s => ({
    ...s,
    count: demands.filter(d => d.status === s.key).length,
  }));

  return (
    <div className="rounded-xl p-4 bg-secondary border border-border">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="h-4 w-4 text-purple-400" />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pipeline</span>
      </div>

      <div className="space-y-1.5">
        {counts.map(stage => {
          const pct = (stage.count / total) * 100;
          return (
            <div key={stage.key} className="flex items-center gap-2">
              <span className="text-[10px] w-14 text-right shrink-0 text-muted-foreground">
                {stage.label}
              </span>
              <div className="flex-1 h-4 rounded overflow-hidden bg-muted">
                <div
                  className={`h-full rounded transition-all duration-500 flex items-center justify-end pr-1 ${stage.bgClass}`}
                  style={{ width: `${Math.max(pct, stage.count > 0 ? 12 : 0)}%` }}
                >
                  {stage.count > 0 && (
                    <span className={`text-[9px] font-semibold ${stage.className}`}>
                      {stage.count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
