import { useState } from 'react';
import { Clock, Pause, MoreVertical } from 'lucide-react';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { PremiumGlassCard } from '@/components/dashboard/PremiumGlassCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees, useEmployee } from '@/hooks/useEmployees';
import { useTodayTimeEntries, useClockIn, useClockOut } from '@/hooks/useTimeTracking';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Ponto() {
  const { tenant } = useAuth();
  const { data: employees = [] } = useEmployees(tenant?.id);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const { data: employee } = useEmployee(selectedEmployeeId);
  const { data: todayEntries = [] } = useTodayTimeEntries(selectedEmployeeId);
  const { mutate: clockIn, isPending: isClockingIn } = useClockIn();
  const { mutate: clockOut, isPending: isClockingOut } = useClockOut();

  const handleClockIn = () => {
    if (!selectedEmployeeId || !tenant?.id) return;
    clockIn(
      { employeeId: selectedEmployeeId, tenantId: tenant.id },
      {
        onSuccess: () => toast.success('Entrada registrada'),
        onError: () => toast.error('Erro ao registrar entrada'),
      }
    );
  };

  const handleClockOut = () => {
    if (!selectedEmployeeId || !tenant?.id) return;
    clockOut(
      { employeeId: selectedEmployeeId, tenantId: tenant.id },
      {
        onSuccess: () => toast.success('Saída registrada'),
        onError: () => toast.error('Erro ao registrar saída'),
      }
    );
  };

  const clockInTime = todayEntries.find(e => e.entry_type === 'clock_in');
  const clockOutTime = todayEntries.find(e => e.entry_type === 'clock_out');

  return (
    <PageWrapper
      title="Registro de Ponto"
      subtitle="Controle de frequência e horas"
      icon={<Clock className="w-6 h-6" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Seletor de Colaborador */}
          <PremiumGlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Selecionar Colaborador</h3>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um colaborador..." />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name} - {emp.position || 'Sem cargo'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </PremiumGlassCard>

          {/* Status do Ponto */}
          {selectedEmployeeId && (
            <PremiumGlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-6">Status do Ponto de Hoje</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-lg border border-green-500/30 bg-green-500/5">
                  <p className="text-sm text-muted-foreground mb-2">Entrada</p>
                  <p className="text-3xl font-bold text-green-500">
                    {clockInTime 
                      ? new Date(clockInTime.timestamp).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '—'
                    }
                  </p>
                </div>
                <div className="p-6 rounded-lg border border-red-500/30 bg-red-500/5">
                  <p className="text-sm text-muted-foreground mb-2">Saída</p>
                  <p className="text-3xl font-bold text-red-500">
                    {clockOutTime 
                      ? new Date(clockOutTime.timestamp).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '—'
                    }
                  </p>
                </div>
              </div>
            </PremiumGlassCard>
          )}

          {/* Timeline de Ponto */}
          {todayEntries.length > 0 && (
            <PremiumGlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Histórico do Dia</h3>
              <div className="space-y-3">
                {todayEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {entry.entry_type === 'clock_in' ? (
                        <Clock className="w-5 h-5 text-green-500" />
                      ) : (
                        <Pause className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium capitalize">
                          {entry.entry_type === 'clock_in' ? 'Entrada' : 'Saída'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </PremiumGlassCard>
          )}
        </div>

        {/* Painel de Ações */}
        <div className="space-y-4">
          <Button 
            onClick={handleClockIn}
            disabled={!selectedEmployeeId || isClockingIn || !!clockInTime}
            className="w-full h-20 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-lg font-semibold"
          >
            <Clock className="w-6 h-6 mr-2" />
            {isClockingIn ? 'Registrando...' : 'Entrada'}
          </Button>
          
          <Button 
            onClick={handleClockOut}
            disabled={!selectedEmployeeId || isClockingOut || !clockInTime || !!clockOutTime}
            className="w-full h-20 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-lg font-semibold"
          >
            <Pause className="w-6 h-6 mr-2" />
            {isClockingOut ? 'Registrando...' : 'Saída'}
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
