import { useState } from 'react';
import { Briefcase, Plus, TrendingUp } from 'lucide-react';
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
import { useJobCandidates } from '@/hooks/useRecruitment';
import { Badge } from '@/components/ui/badge';

export default function Recrutamento() {
  const { tenant } = useAuth();
  const { data: candidates = [] } = useJobCandidates(tenant?.id);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const filteredCandidates = filterStatus
    ? candidates.filter(c => c.status === filterStatus)
    : candidates;

  const statusCounts = {
    applied: candidates.filter(c => c.status === 'applied').length,
    screening: candidates.filter(c => c.status === 'screening').length,
    interview: candidates.filter(c => c.status === 'interview').length,
    offer: candidates.filter(c => c.status === 'offer').length,
    hired: candidates.filter(c => c.status === 'hired').length,
    rejected: candidates.filter(c => c.status === 'rejected').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hired':
        return 'bg-green-500/20 text-green-600';
      case 'offer':
        return 'bg-blue-500/20 text-blue-600';
      case 'interview':
        return 'bg-purple-500/20 text-purple-600';
      case 'screening':
        return 'bg-yellow-500/20 text-yellow-600';
      case 'rejected':
        return 'bg-red-500/20 text-red-600';
      default:
        return 'bg-gray-500/20 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      applied: 'Candidatura Recebida',
      screening: 'Triagem',
      interview: 'Entrevista',
      offer: 'Proposta',
      hired: 'Contratado',
      rejected: 'Rejeitado',
    };
    return labels[status] || status;
  };

  return (
    <PageWrapper
      title="Recrutamento"
      subtitle="Pipeline de contratação"
      icon={<Briefcase className="w-6 h-6" />}
      actions={
        <Button className="bg-gradient-to-r from-red-500 to-red-600">
          <Plus className="w-4 h-4 mr-2" />
          Novo Candidato
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <PremiumGlassCard 
              key={status}
              className={`p-4 cursor-pointer transition-colors ${filterStatus === status ? 'border-blue-400' : ''}`}
              onClick={() => setFilterStatus(filterStatus === status ? '' : status)}
            >
              <p className="text-xs text-muted-foreground capitalize mb-2">{getStatusLabel(status)}</p>
              <p className="text-2xl font-bold">{count}</p>
            </PremiumGlassCard>
          ))}
        </div>

        {/* Filtro */}
        <PremiumGlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Filtrar por Status</h3>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os candidatos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os candidatos</SelectItem>
              {Object.entries(statusCounts).map(([status]) => (
                <SelectItem key={status} value={status}>
                  {getStatusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PremiumGlassCard>

        {/* Lista de Candidatos */}
        {filteredCandidates.length === 0 ? (
          <PremiumGlassCard className="p-12 text-center">
            <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">Nenhum candidato encontrado</p>
          </PremiumGlassCard>
        ) : (
          <div className="space-y-4">
            {filteredCandidates.map((candidate) => (
              <PremiumGlassCard key={candidate.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{candidate.name}</h3>
                    <p className="text-sm text-muted-foreground">{candidate.position_applied}</p>
                  </div>
                  <Badge className={getStatusColor(candidate.status || 'applied')}>
                    {getStatusLabel(candidate.status || 'applied')}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="text-sm">{candidate.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Telefone</p>
                    <p className="text-sm">{candidate.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Data de Candidatura</p>
                    <p className="text-sm">
                      {new Date(candidate.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  {candidate.interview_date && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Data da Entrevista</p>
                      <p className="text-sm">
                        {new Date(candidate.interview_date).toLocaleDateString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {candidate.notes && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Observações</p>
                    <p className="text-sm">{candidate.notes}</p>
                  </div>
                )}

                <Button variant="outline" className="w-full">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Atualizar Status
                </Button>
              </PremiumGlassCard>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
