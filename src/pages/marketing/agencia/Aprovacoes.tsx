import { Image } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { useAgencyPartner } from '@/hooks/useAgencyPartner';
import { ApprovalGallery } from '@/components/marketing/agency';
import { AgenciaEmptyState } from './AgenciaEmptyState';

export default function AgenciaAprovacoes() {
  const { agency, isLoading } = useAgencyPartner();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-gestao" />
      </div>
    );
  }

  if (!agency) return <AgenciaEmptyState />;

  // Mock approvals - would come from delivery selection
  const mockApprovals: never[] = [];

  return (
    <div className="space-y-6">
      <PageHeader title="Aprovações" description={`Galeria de proofing criativo — ${agency.name}`} />

      <ApprovalGallery
        approvals={mockApprovals}
        onApprove={() => {}}
        onRequestAdjustments={() => {}}
        onReject={() => {}}
      />
    </div>
  );
}
