import { useAuth } from "@/contexts/AuthContext";
import { useHWGoals } from "@/hooks/useHWGoals";
import { Target } from "lucide-react";
import { HWWidgetCard } from "./WidgetCard";

export function GoalsProgressWidget() {
  const { user } = useAuth();
  const { data: goals } = useHWGoals('personal');

  const activeGoals = (goals || []).filter(g => g.status === 'active');

  if (activeGoals.length === 0) return null;

  const avgProgress = activeGoals.reduce((sum, g) => {
    const pct = g.target_value > 0 ? (g.current_value / g.target_value) * 100 : 0;
    return sum + pct;
  }, 0) / activeGoals.length;

  return (
    <HWWidgetCard title="Metas" icon={<Target className="h-4 w-4" />}>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span style={{ color: '#A1A1AA' }}>Progresso geral</span>
          <span className="font-semibold" style={{ color: avgProgress >= 75 ? '#22C55E' : avgProgress >= 40 ? '#EAB308' : '#EF4444' }}>
            {Math.round(avgProgress)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full" style={{ backgroundColor: '#27272A' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.round(avgProgress))}%`,
              backgroundColor: avgProgress >= 75 ? '#22C55E' : avgProgress >= 40 ? '#EAB308' : '#EF4444',
            }}
          />
        </div>
        <div className="space-y-1.5 mt-2">
          {activeGoals.slice(0, 3).map(g => {
            const pct = g.target_value > 0 ? Math.round((g.current_value / g.target_value) * 100) : 0;
            return (
              <div key={g.id} className="flex items-center gap-2">
                <div className="h-1 flex-1 rounded-full" style={{ backgroundColor: '#27272A' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, pct)}%`,
                      backgroundColor: pct >= 75 ? '#22C55E' : pct >= 40 ? '#EAB308' : '#EF4444',
                    }}
                  />
                </div>
                <span className="text-[10px] truncate max-w-[80px]" style={{ color: '#A1A1AA' }}>{g.title}</span>
                <span className="text-[10px] font-semibold shrink-0" style={{ color: '#D4D4D8' }}>{pct}%</span>
              </div>
            );
          })}
        </div>
        <p className="text-[10px]" style={{ color: '#52525B' }}>{activeGoals.length} meta(s) ativa(s)</p>
      </div>
    </HWWidgetCard>
  );
}
