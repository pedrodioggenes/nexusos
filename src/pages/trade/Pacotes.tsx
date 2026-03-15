import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Search, Filter, LayoutGrid, List, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTradePackagesWithStats, useCreateTradePackage, TradePackageWithStats } from '@/hooks/useTradePackages';
import { useSuppliers } from '@/hooks/useSuppliers';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PackageKanban } from '@/components/trade/PackageKanban';
import { StatCard } from '@/components/ui/stat-card';
import { Building2, Calendar, CheckCircle, Clock } from 'lucide-react';

export default function Pacotes() {
  const navigate = useNavigate();
  const { data: packages, isLoading, error } = useTradePackagesWithStats();
  const { data: suppliers } = useSuppliers();
  const createPackage = useCreateTradePackage();
  
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    supplier_id: '',
    period_start: '',
    period_end: '',
    total_value: '',
  });

  const filteredPackages = (packages || []).filter(pkg =>
    pkg.name.toLowerCase().includes(search.toLowerCase()) ||
    pkg.supplier_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const stats = {
    total: packages?.length || 0,
    draft: packages?.filter(p => p.status === 'draft').length || 0,
    active: packages?.filter(p => p.status === 'active').length || 0,
    completed: packages?.filter(p => p.status === 'completed').length || 0,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.supplier_id || !formData.period_start || !formData.period_end) return;

    await createPackage.mutateAsync({
      name: formData.name,
      description: formData.description || null,
      supplier_id: formData.supplier_id,
      period_start: formData.period_start,
      period_end: formData.period_end,
      total_value: formData.total_value ? parseFloat(formData.total_value) : null,
      status: 'draft',
    });

    setFormData({ name: '', description: '', supplier_id: '', period_start: '', period_end: '', total_value: '' });
    setIsCreateOpen(false);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Ativo', color: 'border-success/30 text-success' };
      case 'draft':
        return { label: 'Rascunho', color: 'border-muted text-muted-foreground' };
      case 'completed':
        return { label: 'Concluído', color: 'border-primary/30 text-primary' };
      default:
        return { label: status, color: 'border-muted text-muted-foreground' };
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Erro ao carregar pacotes</p>
      </div>
    );
  }

  // Skeleton for loading state
  const PackagesSkeleton = () => (
    <div className="grid gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="card-base">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Pacotes" 
        description="Gestão de pacotes de trade marketing"
        actions={
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'kanban' | 'list')}>
              <TabsList className="h-8">
                <TabsTrigger value="kanban" className="text-xs gap-1 px-2">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Kanban
                </TabsTrigger>
                <TabsTrigger value="list" className="text-xs gap-1 px-2">
                  <List className="h-3.5 w-3.5" />
                  Lista
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 text-xs gap-1.5 bg-app-trade hover:bg-app-trade/90">
                  <Plus className="h-3.5 w-3.5" />
                  Novo Pacote
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Pacote</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input 
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      placeholder="Ex: Campanha Verão 2026"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fornecedor</Label>
                    <Select value={formData.supplier_id} onValueChange={v => setFormData(p => ({ ...p, supplier_id: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um fornecedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {(suppliers || []).map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Início</Label>
                      <Input 
                        type="date"
                        value={formData.period_start}
                        onChange={e => setFormData(p => ({ ...p, period_start: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fim</Label>
                      <Input 
                        type="date"
                        value={formData.period_end}
                        onChange={e => setFormData(p => ({ ...p, period_end: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor Total (R$)</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={formData.total_value}
                      onChange={e => setFormData(p => ({ ...p, total_value: e.target.value }))}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea 
                      value={formData.description}
                      onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                      placeholder="Descrição opcional"
                      rows={3}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createPackage.isPending} className="bg-app-trade hover:bg-app-trade/90">
                      {createPackage.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Criar Pacote
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Total"
          value={stats.total}
          icon={<Package className="h-4 w-4" />}
          variant="accent"
        />
        <StatCard
          title="Rascunhos"
          value={stats.draft}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          title="Ativos"
          value={stats.active}
          icon={<Building2 className="h-4 w-4" />}
          variant="success"
        />
        <StatCard
          title="Concluídos"
          value={stats.completed}
          icon={<CheckCircle className="h-4 w-4" />}
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            placeholder="Buscar pacotes..." 
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

      {/* Content */}
      {isLoading ? (
        <PackagesSkeleton />
      ) : viewMode === 'kanban' ? (
        <PackageKanban 
          packages={filteredPackages}
          isLoading={isLoading}
        />
      ) : (
        <div className="grid gap-3">
          {filteredPackages.map((pkg) => {
            const statusConfig = getStatusConfig(pkg.status);
            const progress = pkg.totalItems > 0 ? (pkg.completedItems / pkg.totalItems) * 100 : 0;

            return (
              <Card 
                key={pkg.id} 
                className="card-base hover:border-app-trade/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/app/trade/pacotes/${pkg.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Package Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-foreground truncate">{pkg.name}</h3>
                        <Badge variant="outline" className={`text-[9px] shrink-0 ${statusConfig.color}`}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {pkg.supplier_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(pkg.period_start)} - {formatDate(pkg.period_end)}
                        </span>
                      </div>
                    </div>

                    {/* Center: Progress */}
                    <div className="w-32 shrink-0">
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium text-foreground">
                          {pkg.completedItems}/{pkg.totalItems}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-app-trade rounded-full transition-all" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Right: Value */}
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium text-foreground">{formatCurrency(pkg.total_value)}</p>
                      <p className="text-[10px] text-muted-foreground">valor total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && filteredPackages.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum pacote encontrado</p>
            <Button variant="link" onClick={() => setIsCreateOpen(true)} className="text-app-trade">
              Criar primeiro pacote
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
