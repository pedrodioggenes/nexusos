import { useAuth } from "@/contexts/AuthContext";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useTodayTimeEntries, useClockIn, useClockOut } from "@/hooks/useTimeTracking";
import { Clock, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HWWidgetCard } from "./WidgetCard";
import { useMemo } from "react";

export function ClockWidget() {
  const { user } = useAuth();
  const { data: tenantId } = useHWTenantId();
  const { data: entries } = useTodayTimeEntries(user?.id);
  const clockIn = useClockIn();
  const clockOut = useClockOut();

  const { isClockedIn, hoursWorked } = useMemo(() => {
    if (!entries?.length) return { isClockedIn: false, hoursWorked: "0h 0min" };

    const lastEntry = entries[entries.length - 1];
    const clockedIn = lastEntry?.entry_type === "clock_in";

    let totalMs = 0;
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].entry_type === "clock_in") {
        const end = entries[i + 1]?.timestamp
          ? new Date(entries[i + 1].timestamp).getTime()
          : clockedIn ? Date.now() : new Date(entries[i].timestamp).getTime();
        totalMs += end - new Date(entries[i].timestamp).getTime();
      }
    }

    const hours = Math.floor(totalMs / 3600000);
    const mins = Math.floor((totalMs % 3600000) / 60000);
    return { isClockedIn: clockedIn, hoursWorked: `${hours}h ${mins}min` };
  }, [entries]);

  const handleToggle = () => {
    if (!user?.id || !tenantId) return;
    if (isClockedIn) {
      clockOut.mutate({ employeeId: user.id, tenantId });
    } else {
      clockIn.mutate({ employeeId: user.id, tenantId });
    }
  };

  return (
    <HWWidgetCard title="Ponto" icon={<Clock className="h-4 w-4" />}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium" style={{ color: isClockedIn ? '#22C55E' : '#71717A' }}>
              {isClockedIn ? 'Em expediente' : 'Fora do expediente'}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: '#52525B' }}>
              Hoje: {hoursWorked}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-3 text-xs rounded-lg"
            style={{
              backgroundColor: isClockedIn ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
              color: isClockedIn ? '#EF4444' : '#22C55E',
            }}
            onClick={handleToggle}
            disabled={clockIn.isPending || clockOut.isPending}
          >
            {isClockedIn ? <LogOut className="h-3 w-3 mr-1" /> : <LogIn className="h-3 w-3 mr-1" />}
            {isClockedIn ? 'Saída' : 'Entrada'}
          </Button>
        </div>
      </div>
    </HWWidgetCard>
  );
}
