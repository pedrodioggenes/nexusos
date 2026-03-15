import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useDeleteTransaction, type FinancialTransaction } from '@/hooks/useFinancialTransactions';
import { cn } from '@/lib/utils';

interface TransactionsListProps {
  transactions: FinancialTransaction[];
  isLoading?: boolean;
  onEdit?: (transaction: FinancialTransaction) => void;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(v);

const formatDate = (d: string) => {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

const statusColors: Record<string, string> = {
  confirmado: 'bg-success/10 text-success border-success/20',
  pendente: 'bg-warning/10 text-warning border-warning/20',
  cancelado: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function TransactionsList({ transactions, isLoading, onEdit }: TransactionsListProps) {
  const deleteTransaction = useDeleteTransaction();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        Carregando transações...
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-sm">Nenhuma transação encontrada</p>
        <p className="text-muted-foreground/60 text-xs mt-1">Registre receitas e custos para visualizar aqui</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map(t => (
            <TableRow key={t.id}>
              <TableCell>
                <div className={cn(
                  'flex items-center justify-center h-7 w-7 rounded-full',
                  t.type === 'receita' ? 'bg-success/10' : 'bg-destructive/10'
                )}>
                  {t.type === 'receita'
                    ? <TrendingUp className="h-3.5 w-3.5 text-success" />
                    : <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(t.date)}</TableCell>
              <TableCell>
                <span className="text-sm font-medium">{t.description}</span>
                {t.tags?.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {t.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                    ))}
                    {t.tags.length > 2 && (
                      <span className="text-[10px] text-muted-foreground">+{t.tags.length - 2}</span>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-[11px]">{t.category}</Badge>
              </TableCell>
              <TableCell className={cn(
                'text-right font-semibold text-sm',
                t.type === 'receita' ? 'text-success' : 'text-destructive'
              )}>
                {t.type === 'receita' ? '+' : '-'}{formatCurrency(Number(t.amount))}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn('text-[10px]', statusColors[t.status])}>
                  {t.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-0.5">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit?.(t)}>
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteId(t.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => { if (deleteId) deleteTransaction.mutate(deleteId); setDeleteId(null); }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
