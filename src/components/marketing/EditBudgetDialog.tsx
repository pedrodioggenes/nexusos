import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Wallet } from 'lucide-react';

interface EditBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBudget: number;
  year: number;
  onSave: (newBudget: number) => Promise<void>;
}

export function EditBudgetDialog({ 
  open, 
  onOpenChange, 
  currentBudget,
  year,
  onSave 
}: EditBudgetDialogProps) {
  const [budgetAmount, setBudgetAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setBudgetAmount(currentBudget.toString());
    }
  }, [open, currentBudget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetAmount) return;

    setIsSaving(true);
    try {
      await onSave(parseFloat(budgetAmount));
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-app-gestao/10">
              <Wallet className="h-5 w-5 text-app-gestao" />
            </div>
            <div>
              <DialogTitle>Editar Orçamento Anual</DialogTitle>
              <DialogDescription>
                Ano {year} • Atual: {formatCurrency(currentBudget)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="budgetAmount">Novo Valor do Orçamento (R$)</Label>
            <Input
              id="budgetAmount"
              type="number"
              min="0"
              step="0.01"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              placeholder="Ex: 500000"
              className="text-lg"
              required
            />
            <p className="text-xs text-muted-foreground">
              Este valor representa o orçamento total disponível para o ano de {year}
            </p>
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
            <Button 
              type="submit" 
              disabled={isSaving || !budgetAmount}
              className="bg-app-gestao hover:bg-app-gestao/90"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
