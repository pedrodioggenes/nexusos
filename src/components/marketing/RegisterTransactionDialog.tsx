import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Loader2, X, Plus, CalendarIcon } from 'lucide-react';
import { useCreateTransaction, useUpdateTransaction, type FinancialTransaction } from '@/hooks/useFinancialTransactions';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const COST_CATEGORIES = [
  'Mídia Paga', 'Produção de Conteúdo', 'Eventos', 'PDV/Materiais',
  'Ferramentas/Software', 'Agência', 'Equipe', 'Logística',
  'Impressão', 'Trade Marketing', 'Outra',
];

const REVENUE_CATEGORIES = [
  'Verba Cooperada', 'Orçamento Interno', 'Patrocínio', 'Bonificação', 'Outros',
];

const PAYMENT_METHODS = ['Boleto', 'PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Transferência', 'Dinheiro', 'Outros'];

export const SUBCATEGORY_MAP: Record<string, string[]> = {
  'Mídia Paga': ['Rádio Interna', 'Rádio Externa', 'Televisão', 'Carro de Som', 'Patrocínio', 'Jornal/Revista', 'Digital/Online', 'Outdoor', 'Outra'],
  'Produção de Conteúdo': ['Foto', 'Vídeo', 'Design Gráfico', 'Copywriting', 'Outra'],
  'Eventos': ['Produção', 'Decoração', 'Buffet/Catering', 'Locação', 'Outra'],
  'PDV/Materiais': ['Cartaz', 'Banner', 'Adesivo', 'Display', 'Outra'],
};

interface RegisterTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: 'receita' | 'custo';
  editTransaction?: FinancialTransaction | null;
}

export function RegisterTransactionDialog({ open, onOpenChange, defaultType = 'custo', editTransaction }: RegisterTransactionDialogProps) {
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const isEditing = !!editTransaction;
  
  const [type, setType] = useState<'receita' | 'custo'>(defaultType);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState<'confirmado' | 'pendente'>('confirmado');
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [manualSubcategory, setManualSubcategory] = useState(false);

  useEffect(() => {
    if (open) {
      if (editTransaction) {
        setType(editTransaction.type);
        setAmount(String(editTransaction.amount));
        setDate(editTransaction.date);
        setCategory(editTransaction.category);
        setSubcategory(editTransaction.subcategory || '');
        setDescription(editTransaction.description);
        setPaymentMethod(editTransaction.payment_method || '');
        setStatus(editTransaction.status === 'cancelado' ? 'pendente' : editTransaction.status);
        setNotes(editTransaction.notes || '');
        setTags(editTransaction.tags || []);
        setTagInput('');
        setManualSubcategory(false);
      } else {
        setType(defaultType);
        setAmount('');
        setDate(format(new Date(), 'yyyy-MM-dd'));
        setCategory('');
        setSubcategory('');
        setManualSubcategory(false);
        setDescription('');
        setPaymentMethod('');
        setStatus('confirmado');
        setNotes('');
        setTags([]);
        setTagInput('');
      }
    }
  }, [open, defaultType, editTransaction]);

  const categories = type === 'custo' ? COST_CATEGORIES : REVENUE_CATEGORIES;

  const handleSubmit = async () => {
    if (!amount || !category || !description) return;

    const payload = {
      type,
      amount: parseFloat(amount),
      date,
      category,
      subcategory: subcategory || null,
      description,
      payment_method: paymentMethod || null,
      status,
      tags,
      notes: notes || null,
      reference_type: null,
      reference_id: null,
    };

    if (isEditing) {
      await updateTransaction.mutateAsync({ id: editTransaction.id, ...payload });
    } else {
      await createTransaction.mutateAsync(
        payload as Omit<FinancialTransaction, 'id' | 'tenant_id' | 'created_by' | 'created_at' | 'updated_at'>
      );
    }

    onOpenChange(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const isPending = createTransaction.isPending || updateTransaction.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEditing ? 'Editar Movimentação' : 'Registrar Movimentação'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => { setType('receita'); setCategory(''); }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all border',
                type === 'receita'
                  ? 'bg-success/10 border-success text-success'
                  : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
              )}
            >
              <TrendingUp className="h-4 w-4" />
              Receita
            </button>
            <button
              onClick={() => { setType('custo'); setCategory(''); }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all border',
                type === 'custo'
                  ? 'bg-destructive/10 border-destructive text-destructive'
                  : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
              )}
            >
              <TrendingDown className="h-4 w-4" />
              Custo
            </button>
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Valor (R$) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Data *</Label>
              <Popover modal={false}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-9",
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
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-xs">Categoria *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Selecionar categoria" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory */}
          <div className="space-y-1.5">
            <Label className="text-xs">Subcategoria</Label>
            {SUBCATEGORY_MAP[category] ? (
              <>
               {!manualSubcategory ? (
                  <Select value={SUBCATEGORY_MAP[category].includes(subcategory) ? subcategory : ''} onValueChange={v => { if (v === '__other__') { setManualSubcategory(true); setSubcategory(''); } else { setSubcategory(v); } }}>
                    <SelectTrigger><SelectValue placeholder="Selecionar subcategoria" /></SelectTrigger>
                    <SelectContent>
                      {SUBCATEGORY_MAP[category].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                      <SelectItem value="__other__">Digitar manualmente...</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex gap-2">
                    <Input value={subcategory} onChange={e => setSubcategory(e.target.value)} placeholder="Digite a subcategoria" autoFocus />
                    <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => { setManualSubcategory(false); setSubcategory(''); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Input value={subcategory} onChange={e => setSubcategory(e.target.value)} placeholder="Opcional" />
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs">Descrição *</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Descreva a movimentação" />
          </div>

          {/* Payment Method + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Forma de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as 'confirmado' | 'pendente')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label className="text-xs">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Adicionar tag"
                className="flex-1"
              />
              <Button type="button" size="icon" variant="outline" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs">Observações</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas adicionais" rows={2} />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button
              onClick={handleSubmit}
              disabled={!amount || !category || !description || isPending}
              className={cn(
                type === 'receita' ? 'bg-success hover:bg-success/90' : 'bg-destructive hover:bg-destructive/90',
                'text-white'
              )}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar' : `Registrar ${type === 'receita' ? 'Receita' : 'Custo'}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
