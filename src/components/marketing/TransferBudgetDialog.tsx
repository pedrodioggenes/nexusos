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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowRightLeft, ArrowRight } from 'lucide-react';
import { MarketingBudgetCategory } from '@/hooks/useMarketingBudgets';

interface TransferBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: MarketingBudgetCategory[];
  onSave: (data: { fromCategoryId: string; toCategoryId: string; amount: number }) => Promise<void>;
}

export function TransferBudgetDialog({
  open,
  onOpenChange,
  categories,
  onSave,
}: TransferBudgetDialogProps) {
  const [fromCategoryId, setFromCategoryId] = useState('');
  const [toCategoryId, setToCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setFromCategoryId('');
      setToCategoryId('');
      setAmount('');
    }
  }, [open]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const fromCategory = categories.find(c => c.id === fromCategoryId);
  const toCategory = categories.find(c => c.id === toCategoryId);
  const availableAmount = fromCategory ? fromCategory.allocated_amount - fromCategory.spent_amount : 0;
  const transferAmount = parseFloat(amount) || 0;
  const isValidAmount = transferAmount > 0 && transferAmount <= availableAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromCategoryId || !toCategoryId || !isValidAmount) return;

    setIsSaving(true);
    try {
      await onSave({
        fromCategoryId,
        toCategoryId,
        amount: transferAmount,
      });
      onOpenChange(false);
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  const filteredToCategories = categories.filter(c => c.id !== fromCategoryId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-muted">
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            </div>
            Transferência entre Categorias
          </DialogTitle>
          <DialogDescription>
            Mova verba alocada de uma categoria para outra
          </DialogDescription>
        </DialogHeader>

        {categories.length < 2 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              É necessário ter pelo menos 2 categorias para fazer transferências
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="from-category">Origem</Label>
              <Select value={fromCategoryId} onValueChange={setFromCategoryId}>
                <SelectTrigger id="from-category">
                  <SelectValue placeholder="Selecione a categoria de origem" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <span>{cat.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({formatCurrency(cat.allocated_amount - cat.spent_amount)} disponível)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {fromCategoryId && (
              <>
                <div className="flex items-center justify-center">
                  <div className="p-2 rounded-full bg-muted">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to-category">Destino</Label>
                  <Select value={toCategoryId} onValueChange={setToCategoryId}>
                    <SelectTrigger id="to-category">
                      <SelectValue placeholder="Selecione a categoria de destino" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {filteredToCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <span>{cat.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({formatCurrency(cat.allocated_amount)} alocado)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transfer-amount">Valor a Transferir (R$)</Label>
                  <Input
                    id="transfer-amount"
                    type="number"
                    min="0"
                    max={availableAmount}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Máx: ${formatCurrency(availableAmount)}`}
                  />
                  {amount && !isValidAmount && transferAmount > availableAmount && (
                    <p className="text-xs text-destructive">
                      Valor excede o disponível na categoria de origem
                    </p>
                  )}
                </div>

                {fromCategory && toCategory && isValidAmount && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm text-muted-foreground">Resumo da transferência:</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>{fromCategory.name}:</span>
                        <span className="text-chart-warning">
                          -{formatCurrency(transferAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{toCategory.name}:</span>
                        <span className="text-chart-success">
                          +{formatCurrency(transferAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!fromCategoryId || !toCategoryId || !isValidAmount || isSaving}
                className="bg-app-gestao hover:bg-app-gestao/90"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Transferir
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
