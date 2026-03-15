import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package, FileCheck, Image, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Activity {
  id: string;
  supplier: string;
  action: string;
  item: string;
  time: string;
  status: 'pending' | 'completed' | 'approved' | 'rejected' | 'active';
  type: 'package' | 'checklist' | 'proof';
  link?: string;
}

interface ActivityFeedProps {
  limit?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const mockActivities: Activity[] = [
  { id: '1', supplier: 'Nestlé', action: 'Enviou comprovação', item: 'Display de Páscoa', time: '5 min atrás', status: 'pending', type: 'proof', link: '/app/trade/comprovacoes' },
  { id: '2', supplier: 'Coca-Cola', action: 'Completou checklist', item: 'Campanha Verão', time: '15 min atrás', status: 'completed', type: 'checklist', link: '/app/trade/checklists' },
  { id: '3', supplier: 'P&G', action: 'Novo pacote atribuído', item: 'Limpeza 2026', time: '1h atrás', status: 'active', type: 'package', link: '/app/trade/pacotes' },
  { id: '4', supplier: 'Unilever', action: 'Comprovação aprovada', item: 'Ponto Extra', time: '2h atrás', status: 'approved', type: 'proof', link: '/app/trade/comprovacoes' },
  { id: '5', supplier: 'Ambev', action: 'Comprovação rejeitada', item: 'Display Cerveja', time: '3h atrás', status: 'rejected', type: 'proof', link: '/app/trade/comprovacoes' },
  { id: '6', supplier: 'Mondelez', action: 'Checklist atualizado', item: 'Chocolates Natal', time: '4h atrás', status: 'pending', type: 'checklist', link: '/app/trade/checklists' },
];

const getStatusConfig = (status: Activity['status']) => {
  switch (status) {
    case 'pending':
      return { label: 'Pendente', color: 'border-warning/30 text-warning', icon: Clock };
    case 'completed':
      return { label: 'Concluído', color: 'border-success/30 text-success', icon: CheckCircle };
    case 'approved':
      return { label: 'Aprovado', color: 'border-success/30 text-success', icon: CheckCircle };
    case 'rejected':
      return { label: 'Rejeitado', color: 'border-destructive/30 text-destructive', icon: XCircle };
    case 'active':
      return { label: 'Ativo', color: 'border-primary/30 text-primary', icon: Package };
    default:
      return { label: status, color: 'border-border text-muted-foreground', icon: Clock };
  }
};

const getTypeIcon = (type: Activity['type']) => {
  switch (type) {
    case 'package':
      return Package;
    case 'checklist':
      return FileCheck;
    case 'proof':
      return Image;
    default:
      return Package;
  }
};

export function ActivityFeed({ limit = 5, showViewAll = true, onViewAll }: ActivityFeedProps) {
  const navigate = useNavigate();
  const activities = limit ? mockActivities.slice(0, limit) : mockActivities;

  const handleActivityClick = (activity: Activity) => {
    if (activity.link) {
      navigate(activity.link);
    }
  };

  return (
    <div className="space-y-2">
      {activities.map((activity) => {
        const statusConfig = getStatusConfig(activity.status);
        const TypeIcon = getTypeIcon(activity.type);
        const StatusIcon = statusConfig.icon;

        return (
          <div 
            key={activity.id} 
            onClick={() => handleActivityClick(activity)}
            className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/50 cursor-pointer hover:border-app-trade/30 hover:bg-muted/50 transition-all duration-200 group"
          >
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-app-trade/10 transition-colors">
              <TypeIcon className="h-4 w-4 text-muted-foreground group-hover:text-app-trade transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">{activity.supplier}</span>
                <span className="text-[10px] text-muted-foreground">{activity.action}</span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">{activity.item}</p>
            </div>
            <div className="text-right shrink-0 flex flex-col items-end gap-1">
              <Badge 
                variant="outline" 
                className={`text-[9px] ${statusConfig.color}`}
              >
                <StatusIcon className="h-2.5 w-2.5 mr-1" />
                {statusConfig.label}
              </Badge>
              <p className="text-[9px] text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        );
      })}

      {showViewAll && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full h-8 text-[10px] text-muted-foreground hover:text-foreground mt-2"
          onClick={onViewAll}
        >
          Ver todas as atividades
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      )}
    </div>
  );
}
