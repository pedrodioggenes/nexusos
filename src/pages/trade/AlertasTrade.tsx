import { AlertTriangle, Clock, CheckCircle, XCircle, Bell, Filter, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TradeAlert {
  id: string;
  type: 'deadline' | 'pending' | 'rejected' | 'approval';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  supplier?: string;
  package?: string;
  createdAt: string;
  dueDate?: string;
  isRead: boolean;
  link?: string;
}

const mockAlerts: TradeAlert[] = [
  {
    id: '1',
    type: 'deadline',
    severity: 'critical',
    title: 'Prazo de Entrega Vencendo',
    description: 'O pacote "Campanha Páscoa 2026" tem 3 itens com prazo vencendo hoje.',
    supplier: 'Nestlé',
    package: 'Campanha Páscoa 2026',
    createdAt: '2026-01-27T10:00:00',
    dueDate: '2026-01-27',
    isRead: false,
    link: '/app/trade/pacotes',
  },
  {
    id: '2',
    type: 'rejected',
    severity: 'warning',
    title: 'Comprovação Rejeitada',
    description: 'A comprovação do display foi rejeitada por posicionamento incorreto.',
    supplier: 'P&G',
    package: 'Limpeza 2026',
    createdAt: '2026-01-27T09:30:00',
    isRead: false,
    link: '/app/trade/comprovacoes',
  },
  {
    id: '3',
    type: 'pending',
    severity: 'warning',
    title: '12 Itens Aguardando Revisão',
    description: 'Há comprovações pendentes de aprovação há mais de 48 horas.',
    createdAt: '2026-01-27T08:00:00',
    isRead: true,
    link: '/app/trade/comprovacoes?status=pending',
  },
  {
    id: '4',
    type: 'approval',
    severity: 'info',
    title: 'Pacote Aprovado',
    description: 'O pacote "Display Nescafé" foi 100% concluído e aprovado.',
    supplier: 'Nestlé',
    package: 'Display Nescafé',
    createdAt: '2026-01-26T16:00:00',
    isRead: true,
    link: '/app/trade/pacotes',
  },
  {
    id: '5',
    type: 'deadline',
    severity: 'warning',
    title: 'Prazo em 3 dias',
    description: '8 itens do pacote "Campanha Verão" vencem em 3 dias.',
    supplier: 'Coca-Cola',
    package: 'Campanha Verão 2026',
    createdAt: '2026-01-26T14:00:00',
    dueDate: '2026-01-30',
    isRead: true,
    link: '/app/trade/checklists',
  },
];

const getSeverityConfig = (severity: TradeAlert['severity']) => {
  switch (severity) {
    case 'critical':
      return { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', icon: AlertTriangle };
    case 'warning':
      return { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', icon: Clock };
    case 'info':
      return { color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', icon: CheckCircle };
    default:
      return { color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border', icon: Bell };
  }
};

const getTypeLabel = (type: TradeAlert['type']) => {
  switch (type) {
    case 'deadline':
      return 'Prazo';
    case 'pending':
      return 'Pendente';
    case 'rejected':
      return 'Rejeitado';
    case 'approval':
      return 'Aprovação';
    default:
      return type;
  }
};

export default function AlertasTrade() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');

  const filteredAlerts = mockAlerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(search.toLowerCase()) ||
      alert.description.toLowerCase().includes(search.toLowerCase()) ||
      alert.supplier?.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'unread') return matchesSearch && !alert.isRead;
    if (filter === 'critical') return matchesSearch && alert.severity === 'critical';
    return matchesSearch;
  });

  const stats = {
    total: mockAlerts.length,
    unread: mockAlerts.filter(a => !a.isRead).length,
    critical: mockAlerts.filter(a => a.severity === 'critical').length,
    pending: mockAlerts.filter(a => a.type === 'pending').length,
  };

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Alertas Trade" 
        description="Centro de alertas e notificações de trade marketing"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="card-base cursor-pointer hover:border-module-trade/50" onClick={() => setFilter('all')}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Total</p>
                <p className="text-xl font-bold text-foreground">{stats.total}</p>
              </div>
              <Bell className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-base cursor-pointer hover:border-module-trade/50" onClick={() => setFilter('unread')}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Não Lidos</p>
                <p className="text-xl font-bold text-warning">{stats.unread}</p>
              </div>
              <Clock className="h-5 w-5 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-base cursor-pointer hover:border-module-trade/50" onClick={() => setFilter('critical')}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Críticos</p>
                <p className="text-xl font-bold text-destructive">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-base">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Pendentes</p>
                <p className="text-xl font-bold text-foreground">{stats.pending}</p>
              </div>
              <XCircle className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            placeholder="Buscar alertas..." 
            className="h-8 pl-8 text-xs"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          size="sm" 
          className="h-8 text-xs"
          onClick={() => setFilter('all')}
        >
          Todos
        </Button>
        <Button 
          variant={filter === 'unread' ? 'default' : 'outline'} 
          size="sm" 
          className="h-8 text-xs"
          onClick={() => setFilter('unread')}
        >
          Não Lidos
        </Button>
        <Button 
          variant={filter === 'critical' ? 'default' : 'outline'} 
          size="sm" 
          className="h-8 text-xs"
          onClick={() => setFilter('critical')}
        >
          Críticos
        </Button>
      </div>

      {/* Alerts List */}
      <div className="space-y-2">
        {filteredAlerts.map((alert) => {
          const severityConfig = getSeverityConfig(alert.severity);
          const SeverityIcon = severityConfig.icon;

          return (
            <Card 
              key={alert.id} 
              className={`card-base cursor-pointer hover:border-module-trade/50 transition-all ${!alert.isRead ? 'ring-1 ring-module-trade/20' : ''}`}
              onClick={() => alert.link && navigate(alert.link)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-lg ${severityConfig.bg} flex items-center justify-center shrink-0`}>
                    <SeverityIcon className={`h-5 w-5 ${severityConfig.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-foreground">{alert.title}</h3>
                      {!alert.isRead && (
                        <div className="h-2 w-2 rounded-full bg-module-trade" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={`text-[9px] ${severityConfig.border} ${severityConfig.color}`}>
                        {getTypeLabel(alert.type)}
                      </Badge>
                      {alert.supplier && (
                        <Badge variant="outline" className="text-[9px]">{alert.supplier}</Badge>
                      )}
                      {alert.dueDate && (
                        <span className="text-[9px] text-muted-foreground">Prazo: {new Date(alert.dueDate).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(alert.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAlerts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum alerta encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
