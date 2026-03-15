import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useWhosOut } from "@/hooks/useWhosOut";
import { Palmtree } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { HWWidgetCard } from "./WidgetCard";

const LEAVE_LABELS: Record<string, string> = {
  vacation: 'Férias',
  sick: 'Atestado',
  personal: 'Pessoal',
  maternity: 'Maternidade',
  paternity: 'Paternidade',
};

export function WhosOutWidget() {
  const { data: tenantId } = useHWTenantId();
  const { data: entries } = useWhosOut(tenantId || undefined);

  if (!entries?.length) return null;

  return (
    <HWWidgetCard title="Quem tá Fora" icon={<Palmtree className="h-4 w-4" />}>
      <div className="space-y-2">
        {entries.slice(0, 5).map(e => (
          <div key={e.id} className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[9px] font-semibold" style={{ backgroundColor: 'hsl(var(--festval-border))', color: 'hsl(var(--festval-stone))' }}>
                {e.initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs truncate flex-1 text-festval-ivory">{e.employee_name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#EAB308' }}>
              {LEAVE_LABELS[e.leave_type] || e.leave_type}
            </span>
          </div>
        ))}
      </div>
    </HWWidgetCard>
  );
}
