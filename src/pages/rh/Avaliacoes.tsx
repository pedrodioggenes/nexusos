import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Plus } from 'lucide-react';
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
import { usePerformanceReviews } from '@/hooks/usePerformanceReviews';
import { Progress } from '@/components/ui/progress';

export default function Avaliacoes() {
  const navigate = useNavigate();
  const { tenant } = useAuth();
  const { data: employees = [] } = useEmployees(tenant?.id);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const { data: reviews = [] } = usePerformanceReviews(selectedEmployeeId, tenant?.id);

  const filteredReviews = selectedEmployeeId
    ? reviews.filter(r => r.employee_id === selectedEmployeeId)
    : reviews;

  return (
    <PageWrapper
      title="Avaliações de Desempenho"
      subtitle="Ciclos e resultados de avaliação"
      icon={<Award className="w-6 h-6" />}
      actions={
        <Button className="bg-gradient-to-r from-green-500 to-green-600">
          <Plus className="w-4 h-4 mr-2" />
          Nova Avaliação
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

        {/* Lista de Avaliações */}
        {filteredReviews.length === 0 ? (
          <PremiumGlassCard className="p-12 text-center">
            <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">Nenhuma avaliação encontrada</p>
          </PremiumGlassCard>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => {
              const employee = employees.find(e => e.id === review.employee_id);
              const overallRating = review.overall_rating || 0;
              return (
                <PremiumGlassCard key={review.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{employee?.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{review.review_cycle}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      review.status === 'submitted' 
                        ? 'bg-green-500/20 text-green-600'
                        : 'bg-yellow-500/20 text-yellow-600'
                    }`}>
                      {review.status === 'submitted' ? 'Finalizado' : 'Rascunho'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Avaliação Geral</p>
                        <p className="text-lg font-bold">{overallRating.toFixed(1)}/5</p>
                      </div>
                      <Progress value={(overallRating / 5) * 100} />
                    </div>

                    {review.strengths && (
                      <div>
                        <p className="text-sm font-medium mb-1">Pontos Fortes</p>
                        <p className="text-sm text-muted-foreground">{review.strengths}</p>
                      </div>
                    )}

                    {review.improvements && (
                      <div>
                        <p className="text-sm font-medium mb-1">Pontos de Melhoria</p>
                        <p className="text-sm text-muted-foreground">{review.improvements}</p>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => navigate(`/app/rh/avaliacoes/${review.id}`)}
                  >
                    Ver Detalhes
                  </Button>
                </PremiumGlassCard>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
