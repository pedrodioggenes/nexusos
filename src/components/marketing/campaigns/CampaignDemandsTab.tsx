import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, ChevronRight } from 'lucide-react';
import { CreateDemandaDialog } from '@/components/marketing/demands/CreateDemandaDialog';
import {
  demandStatusConfig,
  demandPriorityConfig,
  type MarketingDemand,
} from '@/hooks/useMarketingDemands';
import { useUsers } from '@/hooks/useUsers';
import { cn } from '@/lib/utils';

interface CampaignDemandsTabProps {
  campaignId: string;
  campaignName: string;
}

export function CampaignDemandsTab({ campaignId, campaignName }: CampaignDemandsTabProps) {
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();
  const { data: users } = useUsers();

  const { data: demands = [], isLoading } = useQuery({
    queryKey: ['campaign-demands', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_demands')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as MarketingDemand[];
    },
    enabled: !!campaignId,
  });

  const getUserName = (userId: string | null) => {
    if (!userId) return null;
    const user = users?.find(u => u.user_id === userId);
    return user?.profiles?.full_name || user?.profiles?.email || null;
  };

  const getInitial = (name: string | null) => name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {demands.length} demanda{demands.length !== 1 ? 's' : ''} vinculada{demands.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Nova Demanda
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : demands.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            Nenhuma demanda vinculada a esta campanha.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {demands.map((demand) => {
            const statusCfg = demandStatusConfig[demand.status];
            const priorityCfg = demandPriorityConfig[demand.priority];
            const assigneeName = getUserName(demand.assigned_to);

            return (
              <Card
                key={demand.id}
                className="cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => navigate(`/app/marketing/demandas/${demand.id}`)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  {assigneeName && (
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                        {getInitial(assigneeName)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{demand.title}</p>
                    {assigneeName && (
                      <p className="text-[10px] text-muted-foreground truncate">{assigneeName}</p>
                    )}
                  </div>
                  <Badge variant="outline" className={cn('text-[10px] shrink-0', statusCfg.color, statusCfg.bgColor)}>
                    {statusCfg.label}
                  </Badge>
                  <Badge variant="outline" className={cn('text-[10px] shrink-0', priorityCfg.color, priorityCfg.bgColor)}>
                    {priorityCfg.label}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateDemandaDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        campaignId={campaignId}
      />
    </div>
  );
}
