import { DollarSign } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { useAgencyPartner } from '@/hooks/useAgencyPartner';
import { FinancialSummary, AgencyInfoCard } from '@/components/marketing/agency';
import { AgenciaEmptyState } from './AgenciaEmptyState';

export default function AgenciaFinanceiro() {
  const { agency, invoices, isLoading } = useAgencyPartner();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-gestao" />
      </div>
    );
  }

  if (!agency) return <AgenciaEmptyState />;

  return (
    <div className="space-y-6">
      <PageHeader title="Financeiro" description={`Fees, jobs extras e controle financeiro — ${agency.name}`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FinancialSummary monthlyFee={agency.monthly_fee || 0} invoices={invoices} />
        </div>
        <div>
          <AgencyInfoCard agency={agency} />
        </div>
      </div>
    </div>
  );
}
