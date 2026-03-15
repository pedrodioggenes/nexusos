import { useState } from 'react';
import { Building2, Plus, FileText, Package, Image, Gauge, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { useAgencyPartner } from '@/hooks/useAgencyPartner';
import { useAgencyBriefings } from '@/hooks/useAgencyBriefings';
import { useAgencyDeliveries } from '@/hooks/useAgencyDeliveries';
import {
  AgencyInfoCard,
  AgencyScorecard,
  BriefingHub,
  CreateBriefingDialog,
  DeliveryKanban,
  ApprovalGallery,
  SLAGauges,
  CommunicationTimeline,
} from '@/components/marketing/agency';

export default function Agencia() {
  const [activeTab, setActiveTab] = useState('entregas');
  const [showBriefingDialog, setShowBriefingDialog] = useState(false);

  const { 
    agency, 
    isLoading, 
    scores, 
    latestScore, 
    slaMetrics, 
    communications,
    createAgency 
  } = useAgencyPartner();

  const { 
    briefings, 
    createBriefing, 
    sendBriefing,
    stats: briefingStats 
  } = useAgencyBriefings(agency?.id);

  const { 
    deliveriesByStatus, 
    stats: deliveryStats,
    updateDeliveryStatus 
  } = useAgencyDeliveries();

  // Mock approvals for now (would come from selected delivery)
  const mockApprovals: never[] = [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-gestao" />
      </div>
    );
  }

  // No agency configured yet
  if (!agency) {
    return (
      <div className="space-y-6">
        <PageHeader title="Agência Parceira" description="Gerencie o relacionamento com sua agência de marketing" />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Nenhuma agência cadastrada
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Configure os dados da sua agência parceira para começar a gerenciar briefings, entregas e SLAs.
          </p>
          <Button 
            onClick={() => createAgency.mutate({ name: 'Nova Agência' })}
            className="bg-app-gestao hover:bg-app-gestao/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar Agência
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Agência Parceira" 
        description={agency.name}
        actions={
          <Button 
            onClick={() => setShowBriefingDialog(true)}
            className="bg-app-gestao hover:bg-app-gestao/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Briefing
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Score</p>
            <p className="text-2xl font-bold text-app-gestao">
              {latestScore?.overall_score?.toFixed(1) || '-'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">SLA</p>
            <p className="text-2xl font-bold text-foreground">
              {slaMetrics?.on_time_delivery_rate?.toFixed(0) || '-'}%
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Entregas</p>
            <p className="text-2xl font-bold text-foreground">{deliveryStats.pending}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Briefings</p>
            <p className="text-2xl font-bold text-foreground">{briefingStats.inProduction}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Atrasadas</p>
            <p className="text-2xl font-bold text-red-400">{deliveryStats.overdue}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Area */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="entregas" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Entregas
              </TabsTrigger>
              <TabsTrigger value="briefings" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Briefings
              </TabsTrigger>
              <TabsTrigger value="aprovacoes" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Aprovações
              </TabsTrigger>
              <TabsTrigger value="sla" className="flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                SLAs
              </TabsTrigger>
              <TabsTrigger value="comunicacao" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comunicação
              </TabsTrigger>
            </TabsList>

            <TabsContent value="entregas">
              <DeliveryKanban 
                deliveriesByStatus={deliveriesByStatus}
                onStatusChange={(id, status) => updateDeliveryStatus.mutate({ id, status })}
              />
            </TabsContent>

            <TabsContent value="briefings">
              <BriefingHub
                briefings={briefings}
                onCreateNew={() => setShowBriefingDialog(true)}
                onSelect={() => {}}
                onSend={(id) => sendBriefing.mutate(id)}
              />
            </TabsContent>

            <TabsContent value="aprovacoes">
              <ApprovalGallery
                approvals={mockApprovals}
                onApprove={() => {}}
                onRequestAdjustments={() => {}}
                onReject={() => {}}
              />
            </TabsContent>

            <TabsContent value="sla">
              <SLAGauges metrics={slaMetrics} />
            </TabsContent>

            <TabsContent value="comunicacao">
              <CommunicationTimeline communications={communications} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <AgencyInfoCard agency={agency} />
          <AgencyScorecard scores={scores} latestScore={latestScore} />
        </div>
      </div>

      {/* Create Briefing Dialog */}
      <CreateBriefingDialog
        open={showBriefingDialog}
        onOpenChange={setShowBriefingDialog}
        onCreate={(data) => createBriefing.mutate(data)}
        agencyId={agency.id}
      />
    </div>
  );
}
