import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, DollarSign } from 'lucide-react';
import { MarketingBudgetCategory } from '@/hooks/useMarketingBudgets';

interface ExtraBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: MarketingBudgetCategory[];
  onSave: (data: { amount: number; categoryId?: string; description: string; date: string }) => Promise<void>;
}

export function ExtraBudgetDialog({
  open,
  onOpenChange,
  categories,
  onSave,
}: ExtraBudgetDialogProps) {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount('');
      setCategoryId('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [open]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setIsSaving(true);
    try {
      await onSave({
        amount: parseFloat(amount),
        categoryId: categoryId || undefined,
        description,
        date,
      });
      onOpenChange(false);
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-chart-success/10">
              <DollarSign className="h-4 w-4 text-chart-success" />
            </div>
            Verba Extraordinária
          </DialogTitle>
          <DialogDescription>
            Adicione um aporte extra de verba ao orçamento
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="extra-amount">Valor (R$) *</Label>
            <Input
              id="extra-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 50000"
              className="text-lg"
            />
            {amount && (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(parseFloat(amount) || 0)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="extra-category">Categoria (opcional)</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="extra-category">
                <SelectValue placeholder="Alocar em categoria específica" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="">Nenhuma (só budget total)</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {categoryId 
                ? 'Valor será adicionado à categoria selecionada' 
                : 'Valor será adicionado apenas ao budget total'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="extra-date">Data</Label>
            <Input
              id="extra-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="extra-description">Descrição *</Label>
            <Textarea
              id="extra-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Verba adicional para campanha de Natal"
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!amount || !description || isSaving}
              className="bg-chart-success hover:bg-chart-success/90"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar Verba
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
