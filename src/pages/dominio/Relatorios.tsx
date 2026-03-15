import { FileText, Plus, Calendar, Download, Mail } from 'lucide-react';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { BlurFade } from '@/components/ui/blur-fade';
import { PremiumGlassCard } from '@/components/dashboard/PremiumGlassCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomReports } from '@/hooks/useExecutiveMetrics';
import { Badge } from '@/components/ui/badge';

export default function RelatoriosDominio() {
  const { tenant } = useAuth();
  const { data: reports = [], isLoading } = useCustomReports(tenant?.id);

  // Relatórios pré-definidos
  const predefinedReports = [
    { 
      id: 'financial', 
      name: 'Relatório Financeiro Mensal', 
      description: 'Faturamento, margens e custos do período',
      icon: '💰'
    },
    { 
      id: 'operations', 
      name: 'Performance de Lojas', 
      description: 'Ranking e métricas por unidade',
      icon: '🏪'
    },
    { 
      id: 'hr', 
      name: 'Indicadores de RH', 
      description: 'Headcount, turnover e produtividade',
      icon: '👥'
    },
    { 
      id: 'marketing', 
      name: 'ROI de Marketing', 
      description: 'Retorno sobre investimento em campanhas',
      icon: '📊'
    },
    { 
      id: 'trade', 
      name: 'Performance de Trade', 
      description: 'Ativações e investimentos de fornecedores',
      icon: '🤝'
    },
    { 
      id: 'executive', 
      name: 'Resumo Executivo', 
      description: 'Visão consolidada para diretoria',
      icon: '👔'
    },
  ];

  return (
    <PageWrapper
      title="Relatórios"
      subtitle="Geração e agendamento de relatórios"
      icon={<FileText className="w-6 h-6 text-cyan-400" />}
      actions={
        <Button className="bg-gradient-to-r from-purple-500 to-purple-600">
          <Plus className="w-4 h-4 mr-2" />
          Novo Relatório
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Relatórios Pré-definidos */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Relatórios Disponíveis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predefinedReports.map((report, idx) => (
              <BlurFade key={report.id} delay={0.05 * idx}>
                <PremiumGlassCard className="p-6 cursor-pointer hover:border-purple-400 transition-colors">
                  <div className="text-3xl mb-3">{report.icon}</div>
                  <h4 className="font-semibold mb-2">{report.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Gerar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="w-4 h-4 mr-1" />
                      Agendar
                    </Button>
                  </div>
                </PremiumGlassCard>
              </BlurFade>
            ))}
          </div>
        </div>

        {/* Relatórios Personalizados */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Relatórios Personalizados</h3>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <PremiumGlassCard className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">Nenhum relatório personalizado criado</p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Relatório
              </Button>
            </PremiumGlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((report) => (
                <PremiumGlassCard key={report.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold">{report.name}</h4>
                    <Badge variant={report.is_active ? 'default' : 'secondary'}>
                      {report.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  {report.description && (
                    <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {report.last_generated_at 
                      ? `Último: ${new Date(report.last_generated_at).toLocaleDateString('pt-BR')}`
                      : 'Nunca gerado'
                    }
                  </div>
                </PremiumGlassCard>
              ))}
            </div>
          )}
        </div>

        {/* Agendamentos */}
        <BlurFade delay={0.4}>
          <PremiumGlassCard className="p-6 border-purple-500/30">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-400" />
              Agendamentos Ativos
            </h3>
            <p className="text-muted-foreground text-center py-8">
              Nenhum agendamento configurado
            </p>
            <Button variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Configurar Agendamento
            </Button>
          </PremiumGlassCard>
        </BlurFade>
      </div>
    </PageWrapper>
  );
}
