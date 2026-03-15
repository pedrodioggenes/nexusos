import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Search, Filter, MoreHorizontal, Mail, Phone, CheckCircle, XCircle, Loader2, Eye } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useSuppliersWithStats, useCreateSupplier, useUpdateSupplier } from '@/hooks/useSuppliers';

export default function Fornecedores() {
  const navigate = useNavigate();
  const { data: suppliers, isLoading, error } = useSuppliersWithStats();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    contact_email: '',
    contact_phone: '',
    is_active: true,
  });

  const filteredSuppliers = (suppliers || []).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.cnpj?.toLowerCase().includes(search.toLowerCase()) ||
    s.contact_email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    await createSupplier.mutateAsync({
      name: formData.name,
      cnpj: formData.cnpj || null,
      contact_email: formData.contact_email || null,
      contact_phone: formData.contact_phone || null,
      is_active: formData.is_active,
    });

    setFormData({ name: '', cnpj: '', contact_email: '', contact_phone: '', is_active: true });
    setIsCreateOpen(false);
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await updateSupplier.mutateAsync({
      id,
      data: { is_active: !currentStatus }
    });
  };

  const formatCNPJ = (cnpj: string | null) => {
    if (!cnpj) return '-';
    // Simple CNPJ formatting
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Erro ao carregar fornecedores</p>
      </div>
    );
  }

  // Skeleton for loading state
  const SuppliersSkeleton = () => (
    <div className="grid md:grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="card-base">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-7 w-7 rounded" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-16 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
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
        title="Fornecedores" 
        description="Gestão de fornecedores parceiros"
        actions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-7 text-xs gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Novo Fornecedor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Fornecedor</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da Empresa</Label>
                  <Input 
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder="Ex: Nestlé Brasil"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input 
                    value={formData.cnpj}
                    onChange={e => setFormData(p => ({ ...p, cnpj: e.target.value }))}
                    placeholder="00.000.000/0001-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email de Contato</Label>
                  <Input 
                    type="email"
                    value={formData.contact_email}
                    onChange={e => setFormData(p => ({ ...p, contact_email: e.target.value }))}
                    placeholder="trade@empresa.com.br"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone de Contato</Label>
                  <Input 
                    value={formData.contact_phone}
                    onChange={e => setFormData(p => ({ ...p, contact_phone: e.target.value }))}
                    placeholder="(11) 0000-0000"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Fornecedor Ativo</Label>
                  <Switch 
                    checked={formData.is_active}
                    onCheckedChange={v => setFormData(p => ({ ...p, is_active: v }))}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createSupplier.isPending}>
                    {createSupplier.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Criar Fornecedor
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
            placeholder="Buscar fornecedores..." 
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

      {/* Suppliers Grid */}
      {isLoading ? (
        <SuppliersSkeleton />
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {filteredSuppliers.map((supplier) => (
          <Card 
            key={supplier.id} 
            className="card-base hover:border-app-trade/30 transition-colors cursor-pointer group"
            onClick={() => navigate(`/app/trade/fornecedores/${supplier.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-medium text-foreground truncate">{supplier.name}</h3>
                      <button 
                        onClick={() => toggleActive(supplier.id, supplier.is_active)}
                        className="shrink-0"
                      >
                        {supplier.is_active ? (
                          <CheckCircle className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-2">{formatCNPJ(supplier.cnpj)}</p>
                    
                    <div className="space-y-1">
                      {supplier.contact_email && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{supplier.contact_email}</span>
                        </div>
                      )}
                      {supplier.contact_phone && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{supplier.contact_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px]">
                      {supplier.packagesActive} pacotes
                    </Badge>
                    <Badge variant="outline" className="text-[9px]">
                      {supplier.usersCount} usuários
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/app/trade/fornecedores/${supplier.id}`);
                    }}
                  >
                    <Eye className="h-3 w-3" />
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredSuppliers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum fornecedor encontrado</p>
            <Button variant="link" onClick={() => setIsCreateOpen(true)}>Cadastrar primeiro fornecedor</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
