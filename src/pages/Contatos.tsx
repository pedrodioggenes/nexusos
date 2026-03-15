import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Eye, UserX, UserCheck } from 'lucide-react';
import { useContacts, useCreateContact, useUpdateContact, ContactWithSubscription } from '@/hooks/useContacts';
import { useUnits } from '@/hooks/useUnits';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type ContactStatus = Database['public']['Enums']['contact_status'];
type SubscriptionScope = Database['public']['Enums']['subscription_scope'];

export default function Contatos() {
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'all'>('all');
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactWithSubscription | null>(null);

  const { data: contacts, isLoading } = useContacts({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    unitId: unitFilter !== 'all' ? unitFilter : undefined,
    search: search || undefined,
  });
  const { data: units } = useUnits();
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();

  const [formData, setFormData] = useState({
    phone_e164: '',
    name: '',
    scope: 'all_units' as SubscriptionScope,
    unit_id: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneRegex = /^\+[1-9]\d{10,14}$/;
    if (!phoneRegex.test(formData.phone_e164)) {
      toast.error('Telefone inválido. Use formato E.164: +5594999999999');
      return;
    }
    await createContact.mutateAsync({
      phone_e164: formData.phone_e164,
      name: formData.name || undefined,
      subscription: {
        scope: formData.scope,
        unit_id: formData.scope === 'single_unit' ? formData.unit_id : undefined,
      },
    });
    setIsCreateOpen(false);
    setFormData({ phone_e164: '', name: '', scope: 'all_units', unit_id: '' });
  };

  const handleOptOut = async () => {
    if (!selectedContact) return;
    await updateContact.mutateAsync({ id: selectedContact.id, status: 'opted_out' });
    setIsDetailOpen(false);
  };

  const handleReactivate = async () => {
    if (!selectedContact) return;
    await updateContact.mutateAsync({ id: selectedContact.id, status: 'active' });
    setIsDetailOpen(false);
  };

  const handleUpdateContact = async () => {
    if (!selectedContact) return;
    await updateContact.mutateAsync({
      id: selectedContact.id,
      name: formData.name,
      subscription: {
        scope: formData.scope,
        unit_id: formData.scope === 'single_unit' ? formData.unit_id : null,
      },
    });
    setIsDetailOpen(false);
  };

  const openDetail = (contact: ContactWithSubscription) => {
    setSelectedContact(contact);
    setFormData({
      phone_e164: contact.phone_e164,
      name: contact.name || '',
      scope: contact.subscriptions?.scope || 'all_units',
      unit_id: contact.subscriptions?.unit_id || '',
    });
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-3">
      <PageHeader
        title="Contatos"
        description="Gerencie seus contatos e suas assinaturas"
        actions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-7 text-xs"><Plus className="h-3.5 w-3.5 mr-1" />Novo Contato</Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle className="text-sm">Novo Contato</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Telefone (E.164)</Label>
                  <Input
                    placeholder="+5594999999999"
                    value={formData.phone_e164}
                    onChange={e => setFormData(p => ({ ...p, phone_e164: e.target.value }))}
                    required
                    className="h-8 text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">Formato: +55 + DDD + número</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Nome (opcional)</Label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Assinatura</Label>
                  <Select value={formData.scope} onValueChange={(v: SubscriptionScope) => setFormData(p => ({ ...p, scope: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_units" className="text-xs">Todas as Unidades</SelectItem>
                      <SelectItem value="single_unit" className="text-xs">Unidade Específica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.scope === 'single_unit' && (
                  <div className="space-y-1">
                    <Label className="text-xs">Unidade</Label>
                    <Select value={formData.unit_id} onValueChange={v => setFormData(p => ({ ...p, unit_id: v }))}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {units?.filter(u => u.is_active).map(unit => (
                          <SelectItem key={unit.id} value={unit.id} className="text-xs">{unit.name} - {unit.city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button type="submit" className="w-full h-8 text-xs" disabled={createContact.isPending}>
                  {createContact.isPending ? 'Criando...' : 'Criar Contato'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[150px] max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-7 h-7 text-xs" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ContactStatus | 'all')}>
          <SelectTrigger className="w-[130px] h-7 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">Todos</SelectItem>
            <SelectItem value="active" className="text-xs">Ativos</SelectItem>
            <SelectItem value="opted_out" className="text-xs">Opt-out</SelectItem>
            <SelectItem value="blocked" className="text-xs">Bloqueados</SelectItem>
          </SelectContent>
        </Select>
        <Select value={unitFilter} onValueChange={setUnitFilter}>
          <SelectTrigger className="w-[140px] h-7 text-xs"><SelectValue placeholder="Unidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">Todas</SelectItem>
            {units?.filter(u => u.is_active).map(unit => (
              <SelectItem key={unit.id} value={unit.id} className="text-xs">{unit.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] uppercase tracking-wider py-2 h-auto text-muted-foreground">Telefone</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider py-2 h-auto text-muted-foreground">Nome</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider py-2 h-auto text-muted-foreground">Status</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider py-2 h-auto text-muted-foreground">Assinatura</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider py-2 h-auto text-muted-foreground">Cadastro</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider py-2 h-auto text-muted-foreground w-[60px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell className="py-1.5"><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-3 w-14" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-6 w-6 rounded" /></TableCell>
                </TableRow>
              ))
            ) : contacts?.length ? (
              contacts.map(contact => (
                <TableRow key={contact.id} className="border-border">
                  <TableCell className="py-1.5 text-xs font-mono">{contact.phone_e164}</TableCell>
                  <TableCell className="py-1.5 text-xs">{contact.name || '-'}</TableCell>
                  <TableCell className="py-1.5"><StatusBadge status={contact.status} /></TableCell>
                  <TableCell className="py-1.5 text-xs">
                    {contact.subscriptions?.scope === 'all_units' 
                      ? 'Todas' 
                      : contact.subscriptions?.units?.name || 'N/A'}
                  </TableCell>
                  <TableCell className="py-1.5 text-[11px] text-muted-foreground">{format(new Date(contact.created_at), 'dd/MM/yy')}</TableCell>
                  <TableCell className="py-1.5">
                    <Button variant="ghost" size="icon" onClick={() => openDetail(contact)} className="h-6 w-6">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-4 text-xs">Nenhum contato encontrado</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-sm">Detalhes do Contato</DialogTitle></DialogHeader>
          {selectedContact && (
            <div className="space-y-3">
              <div className="p-2 bg-muted rounded">
                <p className="text-[10px] text-muted-foreground">Telefone</p>
                <p className="font-mono text-sm">{selectedContact.phone_e164}</p>
              </div>
              <div><StatusBadge status={selectedContact.status} /></div>
              <div className="space-y-1">
                <Label className="text-xs">Nome</Label>
                <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Assinatura</Label>
                <Select value={formData.scope} onValueChange={(v: SubscriptionScope) => setFormData(p => ({ ...p, scope: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_units" className="text-xs">Todas as Unidades</SelectItem>
                    <SelectItem value="single_unit" className="text-xs">Unidade Específica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.scope === 'single_unit' && (
                <div className="space-y-1">
                  <Label className="text-xs">Unidade</Label>
                  <Select value={formData.unit_id} onValueChange={v => setFormData(p => ({ ...p, unit_id: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {units?.filter(u => u.is_active).map(unit => (
                        <SelectItem key={unit.id} value={unit.id} className="text-xs">{unit.name} - {unit.city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                {selectedContact.status === 'active' ? (
                  <Button variant="destructive" size="sm" onClick={handleOptOut} disabled={updateContact.isPending} className="h-7 text-xs">
                    <UserX className="h-3.5 w-3.5 mr-1" />Opt-out
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleReactivate} disabled={updateContact.isPending} className="h-7 text-xs">
                    <UserCheck className="h-3.5 w-3.5 mr-1" />Reativar
                  </Button>
                )}
                <Button size="sm" onClick={handleUpdateContact} disabled={updateContact.isPending} className="h-7 text-xs">
                  {updateContact.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
