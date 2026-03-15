import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCampaigns, useSendCampaign, CampaignWithUnits } from '@/hooks/useCampaigns';
import { Database } from '@/integrations/supabase/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// Componentes refatorados
import { CampaignWizard } from '@/components/campaigns/CampaignWizard';
import { CampaignTable } from '@/components/campaigns/CampaignTable';
import { CampaignFilters } from '@/components/campaigns/CampaignFilters';
import { CampaignDetailDialog } from '@/components/campaigns/CampaignDetailDialog';

type CampaignStatus = Database['public']['Enums']['campaign_status'];

export default function Campanhas() {
  // Filters state
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  
  // Dialogs state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignWithUnits | null>(null);
  const [isConfirmSendOpen, setIsConfirmSendOpen] = useState(false);
  const [campaignToSend, setCampaignToSend] = useState<string | null>(null);

  // Data hooks
  const { data: campaigns, isLoading } = useCampaigns({
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  const sendCampaign = useSendCampaign();

  // Filter campaigns by search
  const filteredCampaigns = campaigns?.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  // Handlers
  const handleView = (campaign: CampaignWithUnits) => {
    setSelectedCampaign(campaign);
    setIsDetailOpen(true);
  };

  const handleSendRequest = (campaignId: string) => {
    setCampaignToSend(campaignId);
    setIsConfirmSendOpen(true);
  };

  const handleSendConfirm = async () => {
    if (!campaignToSend) return;
    await sendCampaign.mutateAsync(campaignToSend);
    setIsConfirmSendOpen(false);
    setCampaignToSend(null);
  };

  const handleCampaignCreated = (campaignId: string) => {
    setCampaignToSend(campaignId);
    setIsConfirmSendOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campanhas"
        description="Crie e gerencie suas campanhas de marketing"
        actions={
          <Button onClick={() => setIsWizardOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />Nova Campanha
          </Button>
        }
      />

      <CampaignFilters 
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <CampaignTable 
        campaigns={filteredCampaigns}
        isLoading={isLoading}
        onView={handleView}
        onSend={handleSendRequest}
      />

      {/* Wizard Dialog */}
      <CampaignWizard 
        open={isWizardOpen} 
        onOpenChange={setIsWizardOpen}
        onCampaignCreated={handleCampaignCreated}
      />

      {/* Detail Dialog */}
      <CampaignDetailDialog
        campaign={selectedCampaign}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      {/* Confirm Send Dialog */}
      <AlertDialog open={isConfirmSendOpen} onOpenChange={setIsConfirmSendOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Disparo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja disparar esta campanha agora? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSendConfirm}
              disabled={sendCampaign.isPending}
            >
              {sendCampaign.isPending ? 'Enviando...' : 'Confirmar Disparo'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
