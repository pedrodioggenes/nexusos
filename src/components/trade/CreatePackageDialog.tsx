import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useCreateTradePackage } from '@/hooks/useTradePackages';
import { toast } from 'sonner';

interface CreatePackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePackageDialog({ open, onOpenChange }: CreatePackageDialogProps) {
  const { data: suppliers } = useSuppliers();
  const createPackage = useCreateTradePackage();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    supplier_id: '',
    period_start: '',
    period_end: '',
    total_value: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.supplier_id || !formData.period_start || !formData.period_end) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await createPackage.mutateAsync({
        name: formData.name,
        description: formData.description || null,
        supplier_id: formData.supplier_id,
        period_start: formData.period_start,
        period_end: formData.period_end,
        total_value: formData.total_value ? parseFloat(formData.total_value) : null,
        status: 'draft',
      });

      toast.success('Pacote criado com sucesso!');
      setFormData({ name: '', description: '', supplier_id: '', period_start: '', period_end: '', total_value: '' });
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao criar pacote');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Pacote de Trade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do Pacote *</Label>
            <Input 
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              placeholder="Ex: Campanha Verão 2026"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Fornecedor *</Label>
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
              <Label>Data Início *</Label>
              <Input 
                type="date"
                value={formData.period_start}
                onChange={e => setFormData(p => ({ ...p, period_start: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Data Fim *</Label>
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
              placeholder="Descrição opcional do pacote"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createPackage.isPending} className="bg-app-trade hover:bg-app-trade/90">
              {createPackage.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Pacote
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
