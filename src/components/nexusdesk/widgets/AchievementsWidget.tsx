import { useAuth } from "@/contexts/AuthContext";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useHWUserBadges } from "@/hooks/useHWAchievements";
import { Trophy } from "lucide-react";
import { HWWidgetCard } from "./WidgetCard";

export function AchievementsWidget() {
  const { user } = useAuth();
  const { data: tenantId } = useHWTenantId();
  const { data: badges } = useHWUserBadges(tenantId || undefined, user?.id);

  if (!badges?.length) return null;

  const totalPoints = badges.reduce((sum, b) => sum + (b.achievement?.points || 0), 0);

  return (
    <HWWidgetCard title="Conquistas" icon={<Trophy className="h-4 w-4" />}>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span style={{ color: 'hsl(var(--festval-stone))' }}>Pontos totais</span>
          <span className="font-semibold" style={{ color: '#F59E0B' }}>{totalPoints} pts</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {badges.slice(0, 6).map(b => (
            <div
              key={b.id}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-sm"
              style={{ backgroundColor: 'hsl(var(--festval-border))' }}
              title={b.achievement?.title || 'Badge'}
            >
              {b.achievement?.icon || '🏆'}
            </div>
          ))}
          {badges.length > 6 && (
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-semibold"
              style={{ backgroundColor: 'hsl(var(--festval-border))', color: 'hsl(var(--festval-stone))' }}
            >
              +{badges.length - 6}
            </div>
          )}
        </div>
        <p className="text-[10px]" style={{ color: 'hsl(var(--festval-stone-muted))' }}>{badges.length} conquista(s) desbloqueada(s)</p>
      </div>
    </HWWidgetCard>
  );
}
