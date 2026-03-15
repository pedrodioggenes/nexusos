import { Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { useAgencyPartner } from '@/hooks/useAgencyPartner';

export function AgenciaEmptyState() {
  const { createAgency } = useAgencyPartner();

  return (
    <div className="space-y-6">
      <PageHeader title="Agência Parceira" description="Gerencie o relacionamento com sua agência de marketing" />
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Nenhuma agência cadastrada</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Configure os dados da sua agência parceira para começar a gerenciar briefings, entregas e SLAs.
        </p>
        <Button
          onClick={() => createAgency.mutate({ name: 'Nova Agência' })}
          className="bg-module-gestao hover:bg-module-gestao/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Cadastrar Agência
        </Button>
      </div>
    </div>
  );
}
