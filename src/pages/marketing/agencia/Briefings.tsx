import { useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { useAgencyPartner } from '@/hooks/useAgencyPartner';
import { useAgencyBriefings } from '@/hooks/useAgencyBriefings';
import { BriefingHub, CreateBriefingDialog } from '@/components/marketing/agency';
import { AgenciaEmptyState } from './AgenciaEmptyState';

export default function AgenciaBriefings() {
  const [showDialog, setShowDialog] = useState(false);
  const { agency, isLoading } = useAgencyPartner();
  const { briefings, createBriefing, sendBriefing, stats } = useAgencyBriefings(agency?.id);

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
      <PageHeader
        title="Briefings"
        description={`Hub de briefings — ${agency.name}`}
        actions={
          <Button onClick={() => setShowDialog(true)} className="bg-app-gestao hover:bg-app-gestao/90">
            <Plus className="w-4 h-4 mr-2" />
            Novo Briefing
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Em Produção</p>
            <p className="text-2xl font-bold text-blue-400">{stats.inProduction}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Rascunho</p>
            <p className="text-2xl font-bold text-muted-foreground">{stats.draft}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Enviados</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.sent}</p>
          </CardContent>
        </Card>
      </div>

      <BriefingHub
        briefings={briefings}
        onCreateNew={() => setShowDialog(true)}
        onSelect={() => {}}
        onSend={(id) => sendBriefing.mutate(id)}
      />

      <CreateBriefingDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onCreate={(data) => createBriefing.mutate(data)}
        agencyId={agency.id}
      />
    </div>
  );
}
