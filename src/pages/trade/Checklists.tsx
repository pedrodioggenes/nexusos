import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, Search, Filter, CheckCircle, Clock, XCircle, ChevronRight, Loader2, Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useTradeChecklistsGroupedByPackage, useCreateChecklistItem, useUpdateChecklistItem } from '@/hooks/useTradeChecklists';
import { useTradePackages } from '@/hooks/useTradePackages';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Checklists() {
  const navigate = useNavigate();
  const { data: packagesWithItems, isLoading, error } = useTradeChecklistsGroupedByPackage();
  const { data: packages } = useTradePackages();
  const createItem = useCreateChecklistItem();
  const updateItem = useUpdateChecklistItem();

  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    package_id: '',
    title: '',
    description: '',
    due_date: '',
    is_required: true,
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return { icon: CheckCircle, label: 'Aprovado', color: 'text-success border-success/30' };
      case 'completed':
        return { icon: Clock, label: 'Aguardando', color: 'text-warning border-warning/30' };
      case 'pending':
        return { icon: Clock, label: 'Pendente', color: 'text-muted-foreground border-border' };
      case 'in_progress':
        return { icon: Clock, label: 'Em Progresso', color: 'text-primary border-primary/30' };
      case 'rejected':
        return { icon: XCircle, label: 'Rejeitado', color: 'text-destructive border-destructive/30' };
      default:
        return { icon: Clock, label: status, color: 'text-muted-foreground border-border' };
    }
  };

  const filteredPackages = (packagesWithItems || []).filter(pkg =>
    pkg.name.toLowerCase().includes(search.toLowerCase()) ||
    pkg.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
    pkg.items.some(item => item.title.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.package_id || !formData.title) return;

    await createItem.mutateAsync({
      package_id: formData.package_id,
      title: formData.title,
      description: formData.description || null,
      due_date: formData.due_date || null,
      is_required: formData.is_required,
      status: 'pending',
      order_index: 0,
    });

    setFormData({ package_id: '', title: '', description: '', due_date: '', is_required: true });
    setIsCreateOpen(false);
  };

  const formatDueDate = (date: string | null) => {
    if (!date) return 'Sem data';
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Erro ao carregar checklists</p>
      </div>
    );
  }

  // Skeleton for loading state
  const ChecklistsSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i} className="card-base">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-1.5">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3 p-2 rounded bg-muted/30 border border-border/50">
                  <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-3/4 mb-1" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Checklists" 
        description="Acompanhamento de execução de ações"
        actions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-7 text-xs gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Item de Checklist</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Pacote</Label>
                  <Select value={formData.package_id} onValueChange={v => setFormData(p => ({ ...p, package_id: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um pacote" />
                    </SelectTrigger>
                    <SelectContent>
                      {(packages || []).map(pkg => (
                        <SelectItem key={pkg.id} value={pkg.id}>{pkg.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input 
                    value={formData.title}
                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    placeholder="Ex: Display Ilha Central"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input 
                    value={formData.description}
                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                    placeholder="Descrição opcional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Vencimento</Label>
                  <Input 
                    type="date"
                    value={formData.due_date}
                    onChange={e => setFormData(p => ({ ...p, due_date: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="required"
                    checked={formData.is_required}
                    onCheckedChange={(checked) => setFormData(p => ({ ...p, is_required: !!checked }))}
                  />
                  <Label htmlFor="required" className="text-sm font-normal">Item obrigatório</Label>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createItem.isPending}>
                    {createItem.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Criar Item
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            placeholder="Buscar itens..." 
            className="h-8 pl-8 text-xs"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
          <Filter className="h-3.5 w-3.5" />
          Filtros
        </Button>
      </div>

      {/* Checklists by Package */}
      {isLoading ? (
        <ChecklistsSkeleton />
      ) : (
        <div className="space-y-4">
          {filteredPackages.map((pkg) => (
          <Card key={pkg.id} className="card-base">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-medium">{pkg.name}</CardTitle>
                  <p className="text-[10px] text-muted-foreground">{pkg.supplier_name}</p>
                </div>
                <Badge variant="outline" className="text-[9px]">
                  {pkg.items.filter(i => i.status === 'approved').length}/{pkg.items.length} aprovados
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-1.5">
                {pkg.items.map((item) => {
                  const statusConfig = getStatusConfig(item.status);
                  return (
                    <div 
                      key={item.id} 
                      className="flex items-center gap-3 p-2 rounded bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/app/trade/checklists/${item.id}`)}
                    >
                      <statusConfig.icon className={`h-4 w-4 shrink-0 ${statusConfig.color.split(' ')[0]}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {item.due_date ? `Vence em ${formatDueDate(item.due_date)}` : 'Sem prazo'}
                        </p>
                      </div>
                      {item.is_required && (
                        <Badge variant="outline" className="text-[9px] border-destructive/30 text-destructive">
                          Obrigatório
                        </Badge>
                      )}
                      <Badge variant="outline" className={`text-[9px] shrink-0 ${statusConfig.color}`}>
                        {statusConfig.label}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredPackages.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileCheck className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum checklist encontrado</p>
            <Button variant="link" onClick={() => setIsCreateOpen(true)}>Criar primeiro item</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
