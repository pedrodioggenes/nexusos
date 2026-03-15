import { useState } from 'react';
import { Clock, Plus, CheckCircle, Play, AlertTriangle } from 'lucide-react';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { PremiumGlassCard } from '@/components/dashboard/PremiumGlassCard';
import { BlurFade } from '@/components/ui/blur-fade';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useReplenishmentTasks, useUpdateTaskStatus } from '@/hooks/useReplenishment';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function Tarefas() {
  const { tenant } = useAuth();
  const { data: tasks = [], isLoading } = useReplenishmentTasks(tenant?.id);
  const { mutate: updateStatus } = useUpdateTaskStatus();
  const [activeTab, setActiveTab] = useState('pending');

  const filteredTasks = tasks.filter(t => t.status === activeTab);

  const handleStartTask = (id: string) => {
    updateStatus(
      { id, status: 'in_progress', tenantId: tenant?.id || '' },
      {
        onSuccess: () => toast.success('Tarefa iniciada'),
        onError: () => toast.error('Erro ao iniciar tarefa'),
      }
    );
  };

  const handleCompleteTask = (id: string) => {
    updateStatus(
      { id, status: 'completed', tenantId: tenant?.id || '' },
      {
        onSuccess: () => toast.success('Tarefa concluída'),
        onError: () => toast.error('Erro ao concluir tarefa'),
      }
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-500';
      case 'high': return 'bg-orange-500/20 text-orange-500';
      case 'normal': return 'bg-blue-500/20 text-blue-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      regular: 'Regular',
      rupture: 'Ruptura',
      promotion: 'Promoção',
      expiration: 'Validade',
    };
    return labels[type] || type;
  };

  return (
    <PageWrapper
      title="Tarefas de Reposição"
      subtitle="Roteiros diários de reposição"
      icon={<Clock className="w-6 h-6" />}
      actions={
        <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600">
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pendentes ({tasks.filter(t => t.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              Em Andamento ({tasks.filter(t => t.status === 'in_progress').length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Concluídas ({tasks.filter(t => t.status === 'completed').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Lista de Tarefas */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <PremiumGlassCard className="p-12 text-center">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Nenhuma tarefa {activeTab === 'pending' ? 'pendente' : activeTab === 'in_progress' ? 'em andamento' : 'concluída'}
            </p>
          </PremiumGlassCard>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task, idx) => (
              <BlurFade key={task.id} delay={0.05 * idx}>
                <PremiumGlassCard className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getPriorityColor(task.priority || 'normal')}>
                          {task.priority === 'urgent' && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {task.priority || 'Normal'}
                        </Badge>
                        <Badge variant="outline">
                          {getTypeLabel(task.type || 'regular')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Data: {new Date(task.task_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {task.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStartTask(task.id)}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Iniciar
                        </Button>
                      )}
                      {task.status === 'in_progress' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleCompleteTask(task.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Concluir
                        </Button>
                      )}
                    </div>
                  </div>

                  {task.notes && (
                    <p className="text-sm text-muted-foreground">{task.notes}</p>
                  )}

                  <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                    {task.started_at && (
                      <span>Iniciada: {new Date(task.started_at).toLocaleTimeString('pt-BR')}</span>
                    )}
                    {task.completed_at && (
                      <span>Concluída: {new Date(task.completed_at).toLocaleTimeString('pt-BR')}</span>
                    )}
                  </div>
                </PremiumGlassCard>
              </BlurFade>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
