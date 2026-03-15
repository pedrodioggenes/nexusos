import { DollarSign, TrendingUp, Receipt, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AgencyInvoice } from '@/hooks/useAgencyPartner';

interface FinancialSummaryProps {
  monthlyFee: number;
  invoices: AgencyInvoice[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  paid: 'Pago',
  disputed: 'Contestado',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400',
  approved: 'bg-blue-500/20 text-blue-400',
  paid: 'bg-emerald-500/20 text-emerald-400',
  disputed: 'bg-red-500/20 text-red-400',
};

export function FinancialSummary({ monthlyFee, invoices }: FinancialSummaryProps) {
  const currentYear = new Date().getFullYear();
  
  // Calculate totals for current year
  const yearInvoices = invoices.filter(inv => 
    new Date(inv.reference_month).getFullYear() === currentYear
  );
  
  const totalPaid = yearInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total_amount, 0);
  
  const totalPending = yearInvoices
    .filter(inv => ['pending', 'approved'].includes(inv.status))
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  const totalExtras = yearInvoices.reduce((sum, inv) => {
    const extrasSum = inv.extras.reduce((es, e) => es + (e.amount || 0), 0);
    return sum + extrasSum;
  }, 0);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card/50 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <CreditCard className="w-4 h-4" />
            <span className="text-xs">Fee Mensal</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(monthlyFee)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs">Pago em {currentYear}</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {formatCurrency(totalPaid)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <Receipt className="w-4 h-4" />
            <span className="text-xs">Pendente</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">
            {formatCurrency(totalPending)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Extras {currentYear}</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {formatCurrency(totalExtras)}
          </p>
        </div>
      </div>

      {/* Invoices List */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Histórico de Faturas</h4>
        
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma fatura registrada</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invoices.slice(0, 6).map(invoice => (
              <div 
                key={invoice.id}
                className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {format(new Date(invoice.reference_month), "MMMM yyyy", { locale: ptBR })}
                    </p>
                    {invoice.invoice_number && (
                      <p className="text-xs text-muted-foreground">
                        NF: {invoice.invoice_number}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(invoice.total_amount)}
                    </p>
                    {invoice.extras.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        +{invoice.extras.length} extra(s)
                      </p>
                    )}
                  </div>
                  <Badge className={cn("text-xs", STATUS_COLORS[invoice.status])}>
                    {STATUS_LABELS[invoice.status]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
