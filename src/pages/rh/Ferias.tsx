import { useState } from 'react';
import { Calendar, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { PremiumGlassCard } from '@/components/dashboard/PremiumGlassCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees } from '@/hooks/useEmployees';
import { useLeaveRequests, useApproveLeaveRequest, useRejectLeaveRequest } from '@/hooks/useVacations';
import { toast } from 'sonner';

export default function Ferias() {
  const { tenant } = useAuth();
  const { data: employees = [] } = useEmployees(tenant?.id);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const { data: leaveRequests = [] } = useLeaveRequests(selectedEmployeeId, tenant?.id);
  const { mutate: approveLeave } = useApproveLeaveRequest();
  const { mutate: rejectLeave } = useRejectLeaveRequest();

  const filteredLeaves = selectedEmployeeId
    ? leaveRequests.filter(l => l.employee_id === selectedEmployeeId)
    : leaveRequests;

  const handleApprove = (id: string, employeeId: string) => {
    approveLeave(
      { id, approvedBy: 'system', tenantId: tenant?.id || '', employeeId },
      {
        onSuccess: () => toast.success('Férias aprovadas'),
        onError: () => toast.error('Erro ao aprovar férias'),
      }
    );
  };

  const handleReject = (id: string, employeeId: string) => {
    rejectLeave(
      { id, tenantId: tenant?.id || '', employeeId },
      {
        onSuccess: () => toast.success('Férias rejeitadas'),
        onError: () => toast.error('Erro ao rejeitar férias'),
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-600';
      case 'rejected':
        return 'bg-red-500/20 text-red-600';
      default:
        return 'bg-yellow-500/20 text-yellow-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <PageWrapper
      title="Férias e Afastamentos"
      subtitle="Gestão de períodos afastado"
      icon={<Calendar className="w-6 h-6" />}
      actions={
        <Button className="bg-gradient-to-r from-orange-500 to-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          Solicitar Férias
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filtro */}
        <PremiumGlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Filtrar por Colaborador</h3>
          <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os colaboradores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os colaboradores</SelectItem>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PremiumGlassCard>

        {/* Lista de Férias */}
        {filteredLeaves.length === 0 ? (
          <PremiumGlassCard className="p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">Nenhuma solicitação de férias encontrada</p>
          </PremiumGlassCard>
        ) : (
          <div className="space-y-4">
            {filteredLeaves.map((leave) => {
              const employee = employees.find(e => e.id === leave.employee_id);
              return (
                <PremiumGlassCard key={leave.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{employee?.full_name}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${getStatusColor(leave.status || 'pending')}`}>
                          {getStatusIcon(leave.status || 'pending')}
                          {leave.status === 'approved' ? 'Aprovado' : leave.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{leave.type}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Data Inicial</p>
                      <p className="font-medium">
                        {new Date(leave.start_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Data Final</p>
                      <p className="font-medium">
                        {new Date(leave.end_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Dias</p>
                      <p className="font-medium">
                        {Math.ceil(
                          (new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / 
                          (1000 * 60 * 60 * 24)
                        )}
                      </p>
                    </div>
                  </div>

                  {leave.notes && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-1">Observações</p>
                      <p className="text-sm">{leave.notes}</p>
                    </div>
                  )}

                  {leave.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => handleApprove(leave.id, leave.employee_id)}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(leave.id, leave.employee_id)}
                        className="text-red-500 border-red-500"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </PremiumGlassCard>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
