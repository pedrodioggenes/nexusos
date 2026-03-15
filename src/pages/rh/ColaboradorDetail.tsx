import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Mail, Phone, Calendar, Building, Award } from 'lucide-react';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { PremiumGlassCard } from '@/components/dashboard/PremiumGlassCard';
import { Button } from '@/components/ui/button';
import { useEmployee } from '@/hooks/useEmployees';
import { useTodayTimeEntries } from '@/hooks/useTimeTracking';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ColaboradorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: employee, isLoading } = useEmployee(id);
  const { data: todayEntries = [] } = useTodayTimeEntries(id);

  if (isLoading) {
    return (
      <PageWrapper title="Carregando..." subtitle="">
        <div className="h-40 bg-muted rounded-lg animate-pulse" />
      </PageWrapper>
    );
  }

  if (!employee) {
    return (
      <PageWrapper title="Não encontrado" subtitle="">
        <PremiumGlassCard className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Colaborador não encontrado</p>
          <Button onClick={() => navigate('/app/rh/colaboradores')}>
            Voltar
          </Button>
        </PremiumGlassCard>
      </PageWrapper>
    );
  }

  const clockInTime = todayEntries.find(e => e.entry_type === 'clock_in');
  const clockOutTime = todayEntries.find(e => e.entry_type === 'clock_out');

  return (
    <PageWrapper
      title={employee.full_name}
      subtitle={employee.position}
      actions={
        <Button 
          onClick={() => navigate(`/app/rh/colaboradores/${id}/editar`)}
          variant="outline"
        >
          Editar
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Pessoais */}
          <PremiumGlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Informações Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium flex items-center mt-1">
                  <Mail className="w-4 h-4 mr-2 text-blue-400" />
                  {employee.contact_email || '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CPF</p>
                <p className="font-medium mt-1">{employee.cpf || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                <p className="font-medium mt-1">
                  {employee.birth_date 
                    ? new Date(employee.birth_date).toLocaleDateString('pt-BR')
                    : '—'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contato</p>
                <p className="font-medium flex items-center mt-1">
                  <Phone className="w-4 h-4 mr-2 text-green-400" />
                  {employee.contact_phone || '—'}
                </p>
              </div>
            </div>
          </PremiumGlassCard>

          {/* Informações Profissionais */}
          <PremiumGlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Informações Profissionais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Departamento</p>
                <p className="font-medium flex items-center mt-1">
                  <Building className="w-4 h-4 mr-2 text-purple-400" />
                  {employee.department || '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Admissão</p>
                <p className="font-medium flex items-center mt-1">
                  <Calendar className="w-4 h-4 mr-2 text-orange-400" />
                  {new Date(employee.hire_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Salário</p>
                <p className="font-medium mt-1">
                  {employee.salary 
                    ? `R$ ${employee.salary.toLocaleString('pt-BR', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2 
                      })}`
                    : '—'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${
                  employee.status === 'active' 
                    ? 'bg-green-500/20 text-green-600' 
                    : 'bg-yellow-500/20 text-yellow-600'
                }`}>
                  {employee.status === 'active' ? 'Ativo' : 'Afastado'}
                </span>
              </div>
            </div>
          </PremiumGlassCard>
        </div>

        {/* Painel Lateral */}
        <div className="space-y-6">
          {/* Registro de Ponto Hoje */}
          <PremiumGlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-400" />
              Ponto de Hoje
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Entrada</p>
                <p className="font-semibold">
                  {clockInTime 
                    ? new Date(clockInTime.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '—'
                  }
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Saída</p>
                <p className="font-semibold">
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

          {/* Ações Rápidas */}
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate(`/app/rh/colaboradores/${id}/ferias`)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Ver Férias
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate(`/app/rh/colaboradores/${id}/avaliacoes`)}
            >
              <Award className="w-4 h-4 mr-2" />
              Ver Avaliações
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
