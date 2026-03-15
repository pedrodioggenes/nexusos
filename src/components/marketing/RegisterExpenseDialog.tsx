import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Receipt, CalendarIcon } from 'lucide-react';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface RegisterExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
  categoryId: string;
  currentSpent: number;
  allocatedAmount: number;
  onSave: (data: { amount: number; description?: string; date: string }) => Promise<void>;
}

export function RegisterExpenseDialog({ 
  open, 
  onOpenChange, 
  categoryName,
  categoryId,
  currentSpent,
  allocatedAmount,
  onSave 
}: RegisterExpenseDialogProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount('');
      setDescription('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setIsSaving(true);
    try {
      await onSave({
        amount: parseFloat(amount),
        description: description.trim() || undefined,
        date,
      });
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

  const remaining = allocatedAmount - currentSpent;
  const newTotal = currentSpent + (parseFloat(amount) || 0);
  const percentAfter = allocatedAmount > 0 ? Math.round((newTotal / allocatedAmount) * 100) : 0;
  const isOverBudget = newTotal > allocatedAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Receipt className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <DialogTitle>Registrar Gasto</DialogTitle>
              <DialogDescription>
                {categoryName} • Disponível: {formatCurrency(remaining)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor do Gasto (R$)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="text-lg"
              required
            />
            {amount && (
              <p className={`text-xs ${isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
                Após registro: {formatCurrency(newTotal)} ({percentAfter}% do orçamento)
                {isOverBudget && ' — Excede o limite!'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Data do Gasto</Label>
            <Popover modal={false}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(parse(date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy') : <span>Selecionar data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                <Calendar
                  mode="single"
                  selected={date ? parse(date, 'yyyy-MM-dd', new Date()) : undefined}
                  onSelect={(d) => {
                    if (d) {
                      const year = d.getFullYear();
                      const month = String(d.getMonth() + 1).padStart(2, '0');
                      const day = String(d.getDate()).padStart(2, '0');
                      setDate(`${year}-${month}-${day}`);
                    }
                  }}
                  locale={ptBR}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Campanha de Black Friday"
              rows={2}
            />
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
              disabled={isSaving || !amount}
              className="bg-amber-500 hover:bg-amber-500/90"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar Gasto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
