import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { MarketingBudgetCategory } from '@/hooks/useMarketingBudgets';

const PRESET_COLORS = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-pink-500',
];

interface BudgetCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: MarketingBudgetCategory | null;
  onSave: (data: { name: string; allocated_amount: number; color: string }) => Promise<void>;
}

export function BudgetCategoryDialog({ 
  open, 
  onOpenChange, 
  category, 
  onSave 
}: BudgetCategoryDialogProps) {
  const [name, setName] = useState('');
  const [allocatedAmount, setAllocatedAmount] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setAllocatedAmount(category.allocated_amount.toString());
      setColor(category.color || PRESET_COLORS[0]);
    } else {
      setName('');
      setAllocatedAmount('');
      setColor(PRESET_COLORS[0]);
    }
  }, [category, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !allocatedAmount) return;

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        allocated_amount: parseFloat(allocatedAmount),
        color,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Editar Categoria' : 'Nova Categoria de Orçamento'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Categoria</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Trade Marketing"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor Alocado (R$)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={allocatedAmount}
              onChange={(e) => setAllocatedAmount(e.target.value)}
              placeholder="0,00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full ${c} transition-all ${
                    color === c 
                      ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110' 
                      : 'hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving || !name.trim() || !allocatedAmount}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {category ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
