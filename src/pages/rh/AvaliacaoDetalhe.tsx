import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Award, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees } from '@/hooks/useEmployees';
import { usePerformanceReviews, useSubmitPerformanceReview } from '@/hooks/usePerformanceReviews';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { PremiumGlassCard } from '@/components/dashboard/PremiumGlassCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export default function AvaliacaoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenant } = useAuth();
  const { data: employees = [] } = useEmployees(tenant?.id);
  const { data: reviews = [] } = usePerformanceReviews(undefined, tenant?.id);
  const submitReview = useSubmitPerformanceReview();

  const review = reviews.find((r) => r.id === id);
  const employee = review ? employees.find((e) => e.id === review.employee_id) : null;

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Award className="w-12 h-12 text-muted-foreground opacity-30" />
        <p className="text-muted-foreground">Avaliação não encontrada</p>
        <Button variant="outline" onClick={() => navigate('/app/rh/avaliacoes')}>
          Voltar às Avaliações
        </Button>
      </div>
    );
  }

  const overallRating = review.overall_rating || 0;
  const goals = Array.isArray(review.goals) ? review.goals as any[] : [];
  const scores = review.scores && typeof review.scores === 'object' ? review.scores as Record<string, number> : {};

  const handleSubmit = async () => {
    if (!tenant?.id) return;
    await submitReview.mutateAsync({
      id: review.id,
      tenantId: tenant.id,
      employeeId: review.employee_id,
    });
    toast.success('Avaliação finalizada com sucesso!');
    navigate('/app/rh/avaliacoes');
  };

  return (
    <PageWrapper
      title="Detalhe da Avaliação"
      subtitle={employee?.full_name ?? 'Colaborador'}
      icon={<Award className="w-6 h-6" />}
      actions={
        <Button variant="outline" onClick={() => navigate('/app/rh/avaliacoes')}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Header Card */}
        <PremiumGlassCard className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">{employee?.full_name ?? '—'}</h2>
              <p className="text-sm text-muted-foreground mt-1">{review.review_cycle}</p>
              {employee?.position && (
                <p className="text-xs text-muted-foreground">{employee.position}</p>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              review.status === 'submitted'
                ? 'bg-green-500/20 text-green-600'
                : 'bg-yellow-500/20 text-yellow-600'
            }`}>
              {review.status === 'submitted' ? 'Finalizado' : 'Rascunho'}
            </span>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Avaliação Geral</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(overallRating) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`}
                  />
                ))}
                <span className="ml-2 text-lg font-bold">{overallRating.toFixed(1)}/5</span>
              </div>
            </div>
            <Progress value={(overallRating / 5) * 100} />
          </div>
        </PremiumGlassCard>

        {/* Scores */}
        {Object.keys(scores).length > 0 && (
          <PremiumGlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Pontuações por Critério</h3>
            <div className="space-y-3">
              {Object.entries(scores).map(([key, value]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm capitalize">{key.replace(/_/g, ' ')}</p>
                    <p className="text-sm font-semibold">{Number(value).toFixed(1)}/5</p>
                  </div>
                  <Progress value={(Number(value) / 5) * 100} />
                </div>
              ))}
            </div>
          </PremiumGlassCard>
        )}

        {/* Feedback */}
        <div className="grid md:grid-cols-2 gap-4">
          {review.strengths && (
            <PremiumGlassCard className="p-6">
              <h3 className="text-base font-semibold mb-3 text-green-600">Pontos Fortes</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{review.strengths}</p>
            </PremiumGlassCard>
          )}
          {review.improvements && (
            <PremiumGlassCard className="p-6">
              <h3 className="text-base font-semibold mb-3 text-amber-600">Pontos de Melhoria</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{review.improvements}</p>
            </PremiumGlassCard>
          )}
        </div>

        {/* Goals */}
        {goals.length > 0 && (
          <PremiumGlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Metas</h3>
            <div className="space-y-3">
              {goals.map((goal: any, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${goal.achieved ? 'bg-green-500' : 'bg-amber-500'}`} />
                  <div>
                    <p className="text-sm font-medium">{goal.title || goal.description || JSON.stringify(goal)}</p>
                    {goal.achieved !== undefined && (
                      <p className="text-xs text-muted-foreground mt-0.5">{goal.achieved ? 'Alcançada' : 'Em andamento'}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </PremiumGlassCard>
        )}

        {/* Actions */}
        {review.status !== 'submitted' && (
          <div className="flex justify-end gap-3">
            <Button
              onClick={handleSubmit}
              disabled={submitReview.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitReview.isPending ? 'Finalizando...' : 'Finalizar Avaliação'}
            </Button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
