import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useHWDepartments } from "@/hooks/useHWTeams";
import { useHWShifts, useUpsertShift, SHIFT_TYPES } from "@/hooks/useHWShifts";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";

const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

interface ShiftCalendarProps {
  canManage: boolean;
}

export function ShiftCalendar({ canManage }: ShiftCalendarProps) {
  const { user } = useAuth();
  const { data: tenantId } = useHWTenantId();
  const { data: departments } = useHWDepartments(tenantId || undefined);
  const [currentWeek, setCurrentWeek] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const upsertShift = useUpsertShift();

  const weekStart = format(currentWeek, 'yyyy-MM-dd');
  const weekEnd = format(addDays(currentWeek, 6), 'yyyy-MM-dd');
  const { data: shifts, isLoading } = useHWShifts(tenantId || undefined, weekStart, weekEnd);

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i)),
    [currentWeek]
  );

  // Flatten all team members
  const allMembers = useMemo(() => {
    if (!departments) return [];
    return departments.flatMap(d =>
      d.teams.flatMap(t =>
        t.members.map(m => ({ ...m, teamId: t.id, teamName: t.name }))
      )
    );
  }, [departments]);

  const getShift = (userId: string, date: string) =>
    shifts?.find(s => s.user_id === userId && s.shift_date === date);

  const handleCycleShift = (member: typeof allMembers[0], date: string) => {
    if (!canManage || !tenantId || !user?.id) return;
    const current = getShift(member.userId, date);
    const types = Object.keys(SHIFT_TYPES);
    const idx = current ? types.indexOf(current.shift_type) : -1;
    const nextType = types[(idx + 1) % types.length];
    const info = SHIFT_TYPES[nextType];

    upsertShift.mutate({
      team_id: member.teamId,
      user_id: member.userId,
      tenant_id: tenantId,
      shift_date: date,
      shift_type: nextType,
      start_time: info.start || undefined,
      end_time: info.end || undefined,
      created_by: user.id,
    });
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #27272A' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: '#18181B' }}>
        <Button variant="ghost" size="icon" className="h-7 w-7" style={{ color: '#71717A' }}
          onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>
          {format(currentWeek, "dd MMM", { locale: ptBR })} — {format(addDays(currentWeek, 6), "dd MMM yyyy", { locale: ptBR })}
        </span>
        <Button variant="ghost" size="icon" className="h-7 w-7" style={{ color: '#71717A' }}
          onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#52525B' }} />
        </div>
      ) : allMembers.length === 0 ? (
        <p className="text-xs text-center py-6" style={{ color: '#52525B' }}>Nenhum membro nas equipes</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr style={{ backgroundColor: '#0F0F10' }}>
                <th className="text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#52525B', width: '140px' }}>
                  Membro
                </th>
                {weekDays.map((day, i) => (
                  <th key={i} className="text-center px-1 py-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#52525B' }}>
                    <div>{DAY_LABELS[i]}</div>
                    <div style={{ color: '#3F3F46' }}>{format(day, 'dd')}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allMembers.map(member => (
                <tr key={member.id} className="border-t" style={{ borderColor: '#1F1F23' }}>
                  <td className="px-3 py-2">
                    <p className="text-xs font-medium truncate" style={{ color: '#D4D4D8', maxWidth: '130px' }}>{member.name}</p>
                    <p className="text-[9px] truncate" style={{ color: '#52525B' }}>{member.teamName}</p>
                  </td>
                  {weekDays.map((day, i) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const shift = getShift(member.userId, dateStr);
                    const info = shift ? SHIFT_TYPES[shift.shift_type] : null;
                    return (
                      <td key={i} className="px-1 py-1.5 text-center">
                        <button
                          onClick={() => handleCycleShift(member, dateStr)}
                          disabled={!canManage}
                          className="w-full px-1.5 py-1 rounded-md text-[10px] font-medium transition-colors"
                          style={{
                            backgroundColor: info?.bg || '#1A1A1D',
                            color: info?.color || '#3F3F46',
                            cursor: canManage ? 'pointer' : 'default',
                          }}
                        >
                          {info?.label || '—'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 px-4 py-2 flex-wrap" style={{ backgroundColor: '#0F0F10' }}>
        {Object.entries(SHIFT_TYPES).map(([key, info]) => (
          <div key={key} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: info.color }} />
            <span className="text-[9px]" style={{ color: '#52525B' }}>{info.label}</span>
          </div>
        ))}
        {canManage && <span className="text-[9px] ml-auto" style={{ color: '#3F3F46' }}>Clique para alternar turno</span>}
      </div>
    </div>
  );
}
