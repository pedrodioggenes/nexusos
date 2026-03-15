import { Gauge } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { useAgencyPartner } from '@/hooks/useAgencyPartner';
import { SLAGauges, AgencyScorecard } from '@/components/marketing/agency';
import { AgenciaEmptyState } from './AgenciaEmptyState';

export default function AgenciaSlaPerformance() {
  const { agency, isLoading, slaMetrics, scores, latestScore } = useAgencyPartner();

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
      <PageHeader title="SLA & Performance" description={`Compliance e scorecard — ${agency.name}`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SLAGauges metrics={slaMetrics} />
        </div>
        <div>
          <AgencyScorecard scores={scores} latestScore={latestScore} />
        </div>
      </div>
    </div>
  );
}
