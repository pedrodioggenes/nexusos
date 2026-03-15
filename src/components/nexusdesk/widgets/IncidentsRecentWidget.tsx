import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useHWIncidents, INCIDENT_TYPES, SEVERITY_LEVELS } from "@/hooks/useHWIncidents";
import { ShieldAlert } from "lucide-react";
import { HWWidgetCard } from "./WidgetCard";

export function IncidentsRecentWidget() {
  const { data: tenantId } = useHWTenantId();
  const { data: incidents } = useHWIncidents(tenantId || undefined);

  const recent = (incidents || []).filter(i => !i.resolved_at).slice(0, 4);

  if (recent.length === 0) return null;

  return (
    <HWWidgetCard title="Ocorrências" icon={<ShieldAlert className="h-4 w-4" />}>
      <div className="space-y-1.5">
        {recent.map(inc => {
          const sev = SEVERITY_LEVELS[inc.severity] || SEVERITY_LEVELS.low;
          return (
            <div key={inc.id} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: sev.color }} />
              <span className="text-xs truncate flex-1 text-festval-ivory">
                {INCIDENT_TYPES[inc.type] || inc.type}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: sev.bg, color: sev.color }}>
                {sev.label}
              </span>
            </div>
          );
        })}
      </div>
    </HWWidgetCard>
  );
}
