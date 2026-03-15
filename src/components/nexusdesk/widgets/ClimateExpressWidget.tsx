import { useAuth } from "@/contexts/AuthContext";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useHWClimateSurveys } from "@/hooks/useHWClimateSurveys";
import { ThermometerSun } from "lucide-react";
import { HWWidgetCard } from "./WidgetCard";

export function ClimateExpressWidget() {
  const { user } = useAuth();
  const { data: tenantId } = useHWTenantId();
  const { data: surveys } = useHWClimateSurveys(tenantId || undefined, user?.id);

  const activeSurveys = (surveys || []).filter(s => s.is_active && !s.user_responded);
  const respondedCount = (surveys || []).filter(s => s.user_responded).length;
  const totalResponses = (surveys || []).reduce((sum, s) => sum + (s.response_count || 0), 0);

  if (!surveys?.length) return null;

  return (
    <HWWidgetCard title="Clima Express" icon={<ThermometerSun className="h-4 w-4" />}>
      <div className="space-y-2">
        {activeSurveys.length > 0 ? (
          <>
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <p className="text-xs font-medium" style={{ color: '#A78BFA' }}>
                {activeSurveys.length} pesquisa(s) pendente(s)
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: 'hsl(var(--festval-stone))' }}>
                Sua opinião faz a diferença
              </p>
            </div>
          </>
        ) : (
          <div className="flex justify-between text-xs">
            <span style={{ color: 'hsl(var(--festval-stone))' }}>Participações</span>
            <span className="font-semibold" style={{ color: '#22C55E' }}>{respondedCount}</span>
          </div>
        )}
        <div className="flex justify-between text-xs">
          <span style={{ color: 'hsl(var(--festval-stone))' }}>Respostas da equipe</span>
          <span className="font-semibold text-festval-ivory">{totalResponses}</span>
        </div>
      </div>
    </HWWidgetCard>
  );
}
