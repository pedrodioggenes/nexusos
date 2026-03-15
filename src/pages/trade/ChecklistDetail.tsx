import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileCheck, CheckCircle, Clock, XCircle, Camera, MoreHorizontal, Loader2, Plus, Calendar, Store, Package } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUpdateChecklistItem, TradeChecklistItem } from '@/hooks/useTradeChecklists';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ChecklistDetail() {
  const { checklistId } = useParams<{ checklistId: string }>();
  const navigate = useNavigate();
  const updateItem = useUpdateChecklistItem();
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TradeChecklistItem | null>(null);
  const [notes, setNotes] = useState('');

  // Fetch checklist item with package and supplier info
  const { data: checklistItem, isLoading } = useQuery({
    queryKey: ['checklist-item-detail', checklistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trade_checklist_items')
        .select(`
          *,
          trade_packages!trade_checklist_items_package_id_fkey (
            id,
            name,
            start_date,
            end_date,
            suppliers!trade_packages_supplier_id_fkey (id, name)
          )
        `)
        .eq('id', checklistId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!checklistId,
  });

  // Fetch all items in the same package
  const { data: packageItems } = useQuery({
    queryKey: ['package-checklist-items', checklistItem?.package_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trade_checklist_items')
        .select('*')
        .eq('package_id', checklistItem!.package_id)
        .order('order_index');
      
      if (error) throw error;
      return data as TradeChecklistItem[];
    },
    enabled: !!checklistItem?.package_id,
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return { icon: CheckCircle, label: 'Aprovado', color: 'text-success border-success/30 bg-success/10' };
      case 'completed':
        return { icon: Clock, label: 'Aguardando Aprovação', color: 'text-warning border-warning/30 bg-warning/10' };
      case 'pending':
        return { icon: Clock, label: 'Pendente', color: 'text-muted-foreground border-border bg-muted/30' };
      case 'in_progress':
        return { icon: Clock, label: 'Em Progresso', color: 'text-primary border-primary/30 bg-primary/10' };
      case 'rejected':
        return { icon: XCircle, label: 'Rejeitado', color: 'text-destructive border-destructive/30 bg-destructive/10' };
      default:
        return { icon: Clock, label: status, color: 'text-muted-foreground border-border bg-muted/30' };
    }
  };

  const handleStatusChange = async (item: TradeChecklistItem, newStatus: string) => {
    await updateItem.mutateAsync({
      id: item.id,
      data: { status: newStatus },
    });
  };

  const handleUploadProof = async () => {
    if (!selectedItem) return;
    
    await updateItem.mutateAsync({
      id: selectedItem.id,
      data: { 
        status: 'completed',
      },
    });
    
    toast.success('Comprovação enviada para aprovação');
    setIsUploadOpen(false);
    setSelectedItem(null);
    setNotes('');
  };

  const openUploadDialog = (item: TradeChecklistItem) => {
    setSelectedItem(item);
    setNotes('');
    setIsUploadOpen(true);
  };

  const packageInfo = checklistItem?.trade_packages as any;
  const supplierName = packageInfo?.suppliers?.name || 'Desconhecido';
  const packageName = packageInfo?.name || 'Pacote';

  const completedCount = packageItems?.filter(i => ['completed', 'approved'].includes(i.status)).length || 0;
  const totalCount = packageItems?.length || 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Card className="card-base">
          <CardContent className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!checklistItem) {
    return (
      <div className="text-center py-12">
        <FileCheck className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground">Item de checklist não encontrado</p>
        <Button variant="link" onClick={() => navigate(-1)}>Voltar</Button>
      </div>
    );
  }

  const currentStatus = getStatusConfig(checklistItem.status);

  return (
    <div className="space-y-4">
      {/* Back button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-7 text-xs gap-1.5 -ml-2"
        onClick={() => navigate('/app/trade/checklists')}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar para Checklists
      </Button>

      <PageHeader 
        title={checklistItem.title}
        description={`${packageName} • ${supplierName}`}
        actions={
          <Badge variant="outline" className={cn("text-xs", currentStatus.color)}>
            <currentStatus.icon className="h-3 w-3 mr-1" />
            {currentStatus.label}
          </Badge>
        }
      />

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="card-base p-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-app-trade/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-app-trade" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Pacote</p>
              <p className="text-xs font-medium truncate max-w-[100px]">{packageName}</p>
            </div>
          </div>
        </Card>
        <Card className="card-base p-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Store className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Fornecedor</p>
              <p className="text-xs font-medium truncate max-w-[100px]">{supplierName}</p>
            </div>
          </div>
        </Card>
        <Card className="card-base p-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-warning" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Vencimento</p>
              <p className="text-xs font-medium">
                {checklistItem.due_date 
                  ? format(new Date(checklistItem.due_date), 'dd/MM/yyyy', { locale: ptBR })
                  : 'Sem prazo'
                }
              </p>
            </div>
          </div>
        </Card>
        <Card className="card-base p-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
              <FileCheck className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Progresso</p>
              <p className="text-xs font-medium">{completedCount}/{totalCount} itens</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Package Progress */}
      <Card className="card-base">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Progresso do Pacote</CardTitle>
            <span className="text-xs text-muted-foreground">{Math.round(progressPercent)}% concluído</span>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* Current Item Details */}
      <Card className="card-base border-app-trade/30">
        <CardHeader className="p-3 pb-2 bg-app-trade/5 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-app-trade" />
              Item Selecionado
            </CardTitle>
            {checklistItem.is_required && (
              <Badge variant="outline" className="text-[9px] border-destructive/30 text-destructive">
                Obrigatório
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div>
            <h3 className="text-base font-semibold mb-1">{checklistItem.title}</h3>
            {checklistItem.description && (
              <p className="text-sm text-muted-foreground">{checklistItem.description}</p>
            )}
          </div>

          {checklistItem.description && (
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-[10px] text-muted-foreground mb-1">Descrição</p>
              <p className="text-sm">{checklistItem.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            {checklistItem.status === 'pending' && (
              <>
                <Button 
                  size="sm" 
                  className="gap-1.5 bg-app-trade hover:bg-app-trade/90"
                  onClick={() => openUploadDialog(checklistItem)}
                >
                  <Camera className="h-3.5 w-3.5" />
                  Enviar Comprovação
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleStatusChange(checklistItem, 'in_progress')}
                >
                  Marcar Em Progresso
                </Button>
              </>
            )}
            {checklistItem.status === 'in_progress' && (
              <Button 
                size="sm" 
                className="gap-1.5 bg-app-trade hover:bg-app-trade/90"
                onClick={() => openUploadDialog(checklistItem)}
              >
                <Camera className="h-3.5 w-3.5" />
                Enviar Comprovação
              </Button>
            )}
            {checklistItem.status === 'rejected' && (
              <Button 
                size="sm" 
                className="gap-1.5 bg-app-trade hover:bg-app-trade/90"
                onClick={() => openUploadDialog(checklistItem)}
              >
                <Camera className="h-3.5 w-3.5" />
                Reenviar Comprovação
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Other Items in Package */}
      {packageItems && packageItems.length > 1 && (
        <Card className="card-base">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm font-medium">Outros Itens do Pacote</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-1.5">
              {packageItems
                .filter(item => item.id !== checklistId)
                .map((item) => {
                  const statusConfig = getStatusConfig(item.status);
                  return (
                    <div 
                      key={item.id} 
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/app/trade/checklists/${item.id}`)}
                    >
                      <Checkbox 
                        checked={['completed', 'approved'].includes(item.status)}
                        disabled
                        className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {item.due_date 
                            ? `Vence em ${format(new Date(item.due_date), 'dd/MM', { locale: ptBR })}`
                            : 'Sem prazo'
                          }
                        </p>
                      </div>
                      <Badge variant="outline" className={cn("text-[9px] shrink-0", statusConfig.color)}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Comprovação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Arraste uma imagem ou clique para selecionar</p>
              <Button variant="outline" size="sm">Selecionar Arquivo</Button>
            </div>
            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Adicione observações sobre a execução..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleUploadProof}
              disabled={updateItem.isPending}
              className="bg-app-trade hover:bg-app-trade/90"
            >
              {updateItem.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enviar para Aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
