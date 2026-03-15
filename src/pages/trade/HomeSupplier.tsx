import { Package, FileCheck, Image, Clock, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function TradeHomeSupplier() {
  const { supplier } = useAuth();

  // Mock stats for supplier
  const stats = [
    { label: 'Pacotes Ativos', value: '3', icon: Package, color: 'text-success' },
    { label: 'Itens Pendentes', value: '12', icon: Clock, color: 'text-warning' },
    { label: 'Aprovados', value: '28', icon: CheckCircle, color: 'text-success' },
    { label: 'Em Revisão', value: '4', icon: AlertCircle, color: 'text-accent' },
  ];

  // Mock checklist items
  const pendingItems = [
    { title: 'Display Ilha - Loja Centro', dueDate: 'Hoje', priority: 'high', package: 'Campanha Verão 2026' },
    { title: 'Ponto Extra - Loja Norte', dueDate: 'Amanhã', priority: 'medium', package: 'Campanha Verão 2026' },
    { title: 'Material PDV - Todas as lojas', dueDate: 'Em 3 dias', priority: 'low', package: 'Ativação Marca' },
  ];

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Bem-vindo" 
        description={supplier ? `Portal do Fornecedor · ${supplier.name}` : 'Portal do Fornecedor'}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <Card key={index} className="card-base">
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                  <p className="text-xl font-condensed font-bold text-foreground mt-0.5">{stat.value}</p>
                </div>
                <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Items + Quick Upload */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Pending Checklist Items */}
        <Card className="card-base lg:col-span-2">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium">Itens Pendentes</CardTitle>
              <Badge variant="outline" className="text-[9px] border-warning/30 text-warning">
                {pendingItems.length} itens
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-2">
              {pendingItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded bg-muted/30 border border-border/50">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${
                    item.priority === 'high' ? 'bg-destructive' :
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
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 mt-0.5">
                      <Upload className="h-3 w-3 mr-1" />
                      Enviar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-3 h-7 text-xs">
              Ver todos os itens
            </Button>
          </CardContent>
        </Card>

        {/* Quick Upload */}
        <Card className="card-base">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-medium">Envio Rápido</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-success/50 transition-colors cursor-pointer">
              <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">
                Arraste uma imagem ou clique para enviar
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                PNG, JPG até 10MB
              </p>
            </div>
            <div className="mt-3 space-y-1.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Dicas</p>
              <ul className="text-[10px] text-muted-foreground space-y-1">
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="h-3 w-3 text-success shrink-0 mt-0.5" />
                  <span>Fotografe com boa iluminação</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="h-3 w-3 text-success shrink-0 mt-0.5" />
                  <span>Inclua data visível na foto</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="h-3 w-3 text-success shrink-0 mt-0.5" />
                  <span>Mostre o contexto da loja</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card className="card-base">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs font-medium">Comprovações Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { title: 'Display Entrada', status: 'approved', date: 'Ontem' },
              { title: 'Ponto Extra A', status: 'pending', date: 'Há 2 dias' },
              { title: 'Material PDV', status: 'rejected', date: 'Há 3 dias', reason: 'Foto sem data' },
            ].map((item, index) => (
              <div key={index} className="p-2 rounded bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground">{item.title}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-[9px] ${
                      item.status === 'approved' ? 'border-success/30 text-success' :
                      item.status === 'pending' ? 'border-warning/30 text-warning' :
                      'border-destructive/30 text-destructive'
                    }`}
                  >
                    {item.status === 'approved' ? 'Aprovado' :
                     item.status === 'pending' ? 'Em revisão' : 'Rejeitado'}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{item.date}</p>
                {item.reason && (
                  <p className="text-[10px] text-destructive mt-1">Motivo: {item.reason}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
