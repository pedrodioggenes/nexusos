import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Building2, Calendar, CheckCircle, Clock, XCircle, Image, Edit, MoreHorizontal, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ActivityFeed } from '@/components/trade/ActivityFeed';

// Mock data - in production would fetch from API
const mockPackageDetail = {
  id: 'pkg-1',
  name: 'Campanha Páscoa 2026',
  description: 'Campanha de trade marketing para produtos de Páscoa incluindo displays, pontos extras e material de PDV.',
  status: 'active',
  supplier: { id: 'nestle-001', name: 'Nestlé' },
  period: { start: '2026-01-15', end: '2026-04-30' },
  value: 45000,
  progress: 75,
  metrics: {
    totalItems: 12,
    completedItems: 9,
    pendingItems: 2,
    rejectedItems: 1,
  },
  checklistItems: [
    { id: 'item-1', name: 'Display Ilha Central', location: 'Loja Centro', status: 'approved', dueDate: '2026-01-20', proofUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400' },
    { id: 'item-2', name: 'Ponto Extra Corredor 3', location: 'Loja Centro', status: 'approved', dueDate: '2026-01-22', proofUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400' },
    { id: 'item-3', name: 'Display Checkout', location: 'Loja Norte', status: 'approved', dueDate: '2026-01-25', proofUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400' },
    { id: 'item-4', name: 'Ponta de Gôndola', location: 'Loja Sul', status: 'pending', dueDate: '2026-01-28' },
    { id: 'item-5', name: 'Material PDV Entrada', location: 'Todas', status: 'pending', dueDate: '2026-01-30' },
    { id: 'item-6', name: 'Display Especial', location: 'Loja Centro', status: 'rejected', dueDate: '2026-01-18', rejectionReason: 'Posicionamento incorreto - refazer montagem' },
  ],
  proofs: [
    { id: 'proof-1', itemName: 'Display Ilha Central', imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400', status: 'approved', uploadedAt: '2026-01-20' },
    { id: 'proof-2', itemName: 'Ponto Extra Corredor 3', imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', status: 'approved', uploadedAt: '2026-01-22' },
    { id: 'proof-3', itemName: 'Display Checkout', imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400', status: 'approved', uploadedAt: '2026-01-25' },
    { id: 'proof-4', itemName: 'Display Especial', imageUrl: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400', status: 'rejected', uploadedAt: '2026-01-18' },
  ],
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'active':
      return { label: 'Ativo', color: 'border-success/30 text-success bg-success/10', icon: CheckCircle };
    case 'completed':
      return { label: 'Concluído', color: 'border-primary/30 text-primary bg-primary/10', icon: CheckCircle };
    case 'approved':
      return { label: 'Aprovado', color: 'border-success/30 text-success bg-success/10', icon: CheckCircle };
    case 'pending':
      return { label: 'Pendente', color: 'border-warning/30 text-warning bg-warning/10', icon: Clock };
    case 'rejected':
      return { label: 'Rejeitado', color: 'border-destructive/30 text-destructive bg-destructive/10', icon: XCircle };
    case 'draft':
      return { label: 'Rascunho', color: 'border-muted text-muted-foreground bg-muted', icon: Clock };
    default:
      return { label: status, color: 'border-muted text-muted-foreground bg-muted', icon: Clock };
  }
};

export default function PacoteDetail() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  
  // In production, fetch data based on packageId
  const pkg = mockPackageDetail;
  const statusConfig = getStatusConfig(pkg.status);
  const daysRemaining = Math.ceil((new Date(pkg.period.end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate('/app/trade/pacotes')}
        className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Pacotes
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-app-trade/20 to-app-trade/10 flex items-center justify-center shrink-0">
            <Package className="h-7 w-7 text-app-trade" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{pkg.name}</h1>
              <Badge variant="outline" className={`text-[10px] ${statusConfig.color}`}>
                {statusConfig.label}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                {pkg.supplier.name}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(pkg.period.start).toLocaleDateString('pt-BR')} - {new Date(pkg.period.end).toLocaleDateString('pt-BR')}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 max-w-xl">{pkg.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Edit className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="card-base">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Progresso do Pacote</span>
            <span className="text-sm font-bold text-app-trade">{pkg.progress}%</span>
          </div>
          <Progress value={pkg.progress} className="h-2" />
          <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
            <span>{pkg.metrics.completedItems} de {pkg.metrics.totalItems} itens concluídos</span>
            <span>{daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Prazo encerrado'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="card-base">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-foreground" />
              <div>
                <p className="text-lg font-bold text-foreground">{pkg.metrics.totalItems}</p>
                <p className="text-[10px] text-muted-foreground">Itens Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-base">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <div>
                <p className="text-lg font-bold text-success">{pkg.metrics.completedItems}</p>
                <p className="text-[10px] text-muted-foreground">Aprovados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-base">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              <div>
                <p className="text-lg font-bold text-warning">{pkg.metrics.pendingItems}</p>
                <p className="text-[10px] text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-base">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-lg font-bold text-destructive">{pkg.metrics.rejectedItems}</p>
                <p className="text-[10px] text-muted-foreground">Rejeitados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="checklist" className="space-y-4">
        <TabsList className="h-9">
          <TabsTrigger value="checklist" className="text-xs">Checklist</TabsTrigger>
          <TabsTrigger value="proofs" className="text-xs">Comprovações</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="space-y-2">
          {pkg.checklistItems.map((item) => {
            const itemStatusConfig = getStatusConfig(item.status);
            const StatusIcon = itemStatusConfig.icon;

            return (
              <Card key={item.id} className="card-base">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`h-8 w-8 rounded-lg ${itemStatusConfig.color.replace('border-', 'bg-').replace('/30', '/20')} flex items-center justify-center shrink-0`}>
                        <StatusIcon className={`h-4 w-4 ${itemStatusConfig.color.split(' ')[1]}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-medium text-foreground">{item.name}</h3>
                          <Badge variant="outline" className={`text-[9px] ${itemStatusConfig.color}`}>
                            {itemStatusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{item.location}</p>
                        {item.rejectionReason && (
                          <p className="text-[10px] text-destructive mt-1">{item.rejectionReason}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground">
                        Prazo: {new Date(item.dueDate).toLocaleDateString('pt-BR')}
                      </span>
                      {item.status === 'pending' && (
                        <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1">
                          <Upload className="h-3 w-3" />
                          Enviar
                        </Button>
                      )}
                      {item.proofUrl && (
                        <img 
                          src={item.proofUrl} 
                          alt={item.name}
                          className="h-10 w-10 rounded object-cover border border-border"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="proofs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {pkg.proofs.map((proof) => {
              const proofStatusConfig = getStatusConfig(proof.status);
              return (
                <Card key={proof.id} className="card-base overflow-hidden group cursor-pointer">
                  <div className="relative aspect-square">
                    <img 
                      src={proof.imageUrl} 
                      alt={proof.itemName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Badge 
                      variant="outline" 
                      className={`absolute top-2 right-2 text-[9px] ${proofStatusConfig.color}`}
                    >
                      {proofStatusConfig.label}
                    </Badge>
                  </div>
                  <CardContent className="p-2">
                    <p className="text-[11px] font-medium text-foreground truncate">{proof.itemName}</p>
                    <p className="text-[9px] text-muted-foreground">
                      {new Date(proof.uploadedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="card-base">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-medium">Atividades do Pacote</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <ActivityFeed limit={10} showViewAll={false} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Value Card */}
      <Card className="card-base">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Valor Total do Pacote</span>
            <span className="text-lg font-bold text-app-trade">{formatCurrency(pkg.value)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
