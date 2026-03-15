import { ShoppingCart, Package, Store, FileCheck, Users, BarChart3, Clock } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const plannedFeatures = [
  {
    icon: Package,
    title: 'Gestão de Ações',
    description: 'Criação e acompanhamento de ações promocionais e campanhas de trade.',
  },
  {
    icon: Store,
    title: 'Cadastro de PDV',
    description: 'Gerenciamento de pontos de venda e lojas participantes.',
  },
  {
    icon: FileCheck,
    title: 'Controle de Execuções',
    description: 'Acompanhamento de execuções em campo e validação de materiais.',
  },
  {
    icon: Users,
    title: 'Gestão de Promotores',
    description: 'Cadastro e gestão de promotores e equipes de campo.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios de Performance',
    description: 'Análises e relatórios de desempenho das ações de trade.',
  },
];

const timeline = [
  { phase: 'Planejamento', status: 'done', period: 'Q1 2026' },
  { phase: 'Desenvolvimento', status: 'current', period: 'Q2 2026' },
  { phase: 'Testes Beta', status: 'pending', period: 'Q3 2026' },
  { phase: 'Lançamento', status: 'pending', period: 'Q4 2026' },
];

export default function TradeHome() {
  return (
    <div className="space-y-4">
      <PageHeader 
        title="Visão Geral" 
        description="Sistema de Trade Marketing"
      />

      {/* Status Banner */}
      <Card className="card-base border-success/30 bg-success/5">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-condensed font-semibold text-sm text-foreground">
              Trade em Desenvolvimento
            </h3>
            <p className="text-xs text-muted-foreground">
              Este aplicativo está sendo construído. Em breve novas funcionalidades estarão disponíveis.
            </p>
          </div>
          <Badge className="bg-success/20 text-success border-success/30 text-[10px]">
            <Clock className="h-3 w-3 mr-1" />
            Em breve
          </Badge>
        </CardContent>
      </Card>

      {/* Planned Features */}
      <div>
        <h3 className="font-condensed font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">
          Funcionalidades Planejadas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {plannedFeatures.map((feature, index) => (
            <Card key={index} className="card-base">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-start gap-2">
                  <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                    <feature.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xs font-medium">{feature.title}</CardTitle>
                    <CardDescription className="text-[10px] mt-0.5">{feature.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <Card className="card-base">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs font-medium">Cronograma de Lançamento</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className={`px-3 py-2 rounded border text-center min-w-[100px] ${
                  item.status === 'done' 
                    ? 'bg-success/10 border-success/30 text-success' 
                    : item.status === 'current'
                      ? 'bg-accent/10 border-accent/30 text-accent'
                      : 'bg-muted border-border text-muted-foreground'
                }`}>
                  <p className="text-[10px] font-medium">{item.phase}</p>
                  <p className="text-[9px] opacity-70">{item.period}</p>
                </div>
                {index < timeline.length - 1 && (
                  <div className={`h-0.5 w-6 ${
                    item.status === 'done' ? 'bg-success' : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
