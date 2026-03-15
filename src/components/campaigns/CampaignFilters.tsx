import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type CampaignStatus = Database['public']['Enums']['campaign_status'];

interface CampaignFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: CampaignStatus | 'all';
  onStatusFilterChange: (value: CampaignStatus | 'all') => void;
}

export function CampaignFilters({ 
  search, 
  onSearchChange, 
  statusFilter, 
  onStatusFilterChange 
}: CampaignFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar campanhas..." 
          value={search} 
          onChange={e => onSearchChange(e.target.value)} 
          className="pl-10" 
        />
      </div>
      <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as CampaignStatus | 'all')}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Status</SelectItem>
          <SelectItem value="draft">Rascunho</SelectItem>
          <SelectItem value="scheduled">Agendada</SelectItem>
          <SelectItem value="sent">Enviada</SelectItem>
          <SelectItem value="canceled">Cancelada</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
