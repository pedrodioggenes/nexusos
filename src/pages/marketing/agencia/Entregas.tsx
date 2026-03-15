import { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { useAgencyPartner } from '@/hooks/useAgencyPartner';
import { useAgencyDeliveries } from '@/hooks/useAgencyDeliveries';
import { DeliveryKanban } from '@/components/marketing/agency';
import { AgenciaEmptyState } from './AgenciaEmptyState';

export default function AgenciaEntregas() {
  const { agency, isLoading } = useAgencyPartner();
  const { deliveriesByStatus, stats, updateDeliveryStatus } = useAgencyDeliveries();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-module-gestao" />
      </div>
    );
  }

  if (!agency) return <AgenciaEmptyState />;

  return (
    <div className="space-y-6">
      <PageHeader title="Entregas" description={`Kanban de entregas — ${agency.name}`} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Rejeitadas</p>
            <p className="text-2xl font-bold text-foreground">{stats.rejected}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Aprovadas</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.approved}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Atrasadas</p>
            <p className="text-2xl font-bold text-red-400">{stats.overdue}</p>
          </CardContent>
        </Card>
      </div>

      <DeliveryKanban
        deliveriesByStatus={deliveriesByStatus}
        onStatusChange={(id, status) => updateDeliveryStatus.mutate({ id, status })}
      />
    </div>
  );
}
