import { Package, FileCheck, Image, Clock, CheckCircle, AlertCircle, Upload, TrendingUp, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AIInsightCard } from '@/components/marketing/AIInsightCard';

export default function FornecedorHome() {
  const { supplier } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: 'Pacotes Ativos', value: '3', icon: Package, color: 'text-success', trend: null },
    { label: 'Itens Pendentes', value: '12', icon: Clock, color: 'text-warning', trend: '-3' },
    { label: 'Aprovados', value: '28', icon: CheckCircle, color: 'text-success', trend: '+5' },
    { label: 'Em Revisão', value: '4', icon: AlertCircle, color: 'text-accent', trend: null },
  ];

  const pendingItems = [
    { id: '1', title: 'Display Ilha - Loja Centro', dueDate: 'Hoje', priority: 'high', package: 'Campanha Verão 2026' },
    { id: '2', title: 'Ponto Extra - Loja Norte', dueDate: 'Amanhã', priority: 'medium', package: 'Campanha Verão 2026' },
    { id: '3', title: 'Material PDV - Todas as lojas', dueDate: 'Em 3 dias', priority: 'low', package: 'Ativação Marca' },
  ];

  const recentActivity = [
    { id: '1', type: 'approved', title: 'Geladeira Exclusiva', time: 'Há 2 horas' },
    { id: '2', type: 'submitted', title: 'Display Ilha Central', time: 'Ontem' },
    { id: '3', type: 'rejected', title: 'Totem Entrada', time: 'Há 2 dias', reason: 'Foto sem data' },
  ];

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Visão Geral" 
        description={supplier ? `Portal do Fornecedor · ${supplier.name}` : 'Portal do Fornecedor'}
      />

      {/* AI Insight Card */}
      <AIInsightCard
        type="trade"
        moduleColor="trade"
        prompt="Ajude o fornecedor a priorizar suas entregas e otimizar o processo de comprovação, identificando itens com prazo crítico e dicas para aprovação rápida."
        contextData={{ stats, pendingItems }}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <Card key={index} className="card-base">
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <p className="text-xl font-condensed font-bold text-foreground">{stat.value}</p>
                    {stat.trend && (
                      <span className={`text-[10px] font-medium ${
                        stat.trend.startsWith('+') ? 'text-success' : 'text-destructive'
                      }`}>
                        {stat.trend}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Pending Items */}
        <Card className="card-base lg:col-span-2">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium">Itens Pendentes de Envio</CardTitle>
              <Badge variant="outline" className="text-[9px] border-warning/30 text-warning">
                {pendingItems.length} itens
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-2">
              {pendingItems.map((item) => (
                <div 
                  key={item.id} 
                  className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors hover:bg-muted/50 ${
                    item.priority === 'high' 
                      ? 'border-destructive/30 bg-destructive/5' 
                      : 'border-border/50 bg-muted/30'
                  }`}
                >
                  <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                    item.priority === 'high' ? 'bg-destructive animate-pulse' :
                    item.priority === 'medium' ? 'bg-warning' : 'bg-success'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground">{item.package}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-[10px] font-medium ${
                      item.priority === 'high' ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {item.dueDate}
                    </p>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 text-[10px] px-2 mt-0.5 hover:bg-success/10 hover:text-success"
                      onClick={() => navigate('/app/trade/fornecedor/comprovacoes')}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Enviar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3 h-8 text-xs"
              onClick={() => navigate('/app/trade/fornecedor/checklist')}
            >
              Ver todos os itens
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card className="card-base">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-medium">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 h-9 text-xs"
                onClick={() => navigate('/app/trade/fornecedor/pacotes')}
              >
                <Package className="h-3.5 w-3.5 text-success" />
                Ver Meus Pacotes
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 h-9 text-xs"
                onClick={() => navigate('/app/trade/fornecedor/checklist')}
              >
                <FileCheck className="h-3.5 w-3.5 text-warning" />
                Ver Checklist
              </Button>
              <Button 
                className="w-full justify-start gap-2 h-9 text-xs bg-success hover:bg-success/90"
                onClick={() => navigate('/app/trade/fornecedor/comprovacoes')}
              >
                <Image className="h-3.5 w-3.5" />
                Enviar Comprovação
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="card-base">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-medium">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-2">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-2 py-1.5 border-b border-border/50 last:border-0">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                      activity.type === 'approved' ? 'bg-success/10 text-success' :
                      activity.type === 'rejected' ? 'bg-destructive/10 text-destructive' :
                      'bg-accent/10 text-accent'
                    }`}>
                      {activity.type === 'approved' ? <CheckCircle className="h-3 w-3" /> :
                       activity.type === 'rejected' ? <AlertCircle className="h-3 w-3" /> :
                       <Upload className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-foreground truncate">
                        {activity.title}
                      </p>
                      <p className="text-[9px] text-muted-foreground">{activity.time}</p>
                      {activity.reason && (
                        <p className="text-[9px] text-destructive mt-0.5">{activity.reason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
