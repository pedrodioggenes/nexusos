import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Search } from 'lucide-react';
import { useUnits, useCreateUnit, useUpdateUnit, Unit } from '@/hooks/useUnits';
import { format } from 'date-fns';

export default function Unidades() {
  const { data: units, isLoading } = useUnits();
  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();
  const [search, setSearch] = useState('');
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', city: '', is_active: true });

  const filteredUnits = units?.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUnit) {
      await updateUnit.mutateAsync({ id: editingUnit.id, ...formData });
    } else {
      await createUnit.mutateAsync(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const openEditDialog = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({ name: unit.name, city: unit.city, is_active: unit.is_active });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingUnit(null);
    setFormData({ name: '', city: '', is_active: true });
  };

  return (
    <div className="space-y-3">
      <PageHeader 
        title="Unidades" 
        description="Gerencie as unidades da rede"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-7 text-xs"><Plus className="h-3.5 w-3.5 mr-1" />Nova Unidade</Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle className="text-sm">{editingUnit ? 'Editar Unidade' : 'Nova Unidade'}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nome</Label>
                  <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Cidade</Label>
                  <Input value={formData.city} onChange={e => setFormData(p => ({ ...p, city: e.target.value }))} required className="h-8 text-xs" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_active} onCheckedChange={v => setFormData(p => ({ ...p, is_active: v }))} />
                  <Label className="text-xs">Ativa</Label>
                </div>
                <Button type="submit" className="w-full h-8 text-xs">{editingUnit ? 'Salvar' : 'Criar'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-7 h-7 text-xs" />
        </div>
      </div>

      <div className="bg-card rounded border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] uppercase tracking-wider py-2 h-auto text-muted-foreground">Nome</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider py-2 h-auto text-muted-foreground">Cidade</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider py-2 h-auto text-muted-foreground">Status</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider py-2 h-auto text-muted-foreground">Criada</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider py-2 h-auto text-muted-foreground w-[60px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell className="py-1.5"><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-4 w-12 rounded-full" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-3 w-14" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-6 w-6 rounded" /></TableCell>
                </TableRow>
              ))
            ) : filteredUnits?.length ? (
              filteredUnits.map(unit => (
                <TableRow key={unit.id} className="border-border">
                  <TableCell className="py-1.5 text-xs font-medium">{unit.name}</TableCell>
                  <TableCell className="py-1.5 text-xs">{unit.city}</TableCell>
                  <TableCell className="py-1.5">
                    <Badge variant={unit.is_active ? 'default' : 'secondary'} className="text-[9px] h-4 px-1.5">
                      {unit.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1.5 text-[11px] text-muted-foreground">{format(new Date(unit.created_at), 'dd/MM/yy')}</TableCell>
                  <TableCell className="py-1.5">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(unit)} className="h-6 w-6">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-4 text-xs">Nenhuma unidade encontrada</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
