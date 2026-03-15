import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ClipboardList, ArrowRight } from 'lucide-react';
import {
  demandStatusConfig,
  demandTypeConfig,
  demandPriorityConfig,
  type MarketingDemand,
  type DemandStatus,
} from '@/hooks/useMarketingDemands';

interface CampaignDemandsOverviewProps {
  campaignId: string;
  onGoToTab?: () => void;
}

export function CampaignDemandsOverview({ campaignId, onGoToTab }: CampaignDemandsOverviewProps) {
  const navigate = useNavigate();

  const { data: demands = [], isLoading } = useQuery({
    queryKey: ['campaign-demands-overview', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_demands')
        .select('id, title, status, type, priority, assigned_to, due_date, created_at')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profile names for assigned users
      const assignedIds = [...new Set((data || []).map(d => d.assigned_to).filter(Boolean))] as string[];
      let profilesMap: Record<string, string> = {};
      if (assignedIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', assignedIds);
        if (profiles) {
          profiles.forEach(p => {
            profilesMap[p.user_id] = p.full_name || p.email || 'Sem nome';
          });
        }
      }

      return (data || []).map(d => ({
        ...d,
        assigned_name: d.assigned_to ? (profilesMap[d.assigned_to] || 'Usuário') : null,
      }));
    },
    enabled: !!campaignId,
  });

  type DemandRow = (typeof demands)[number];

  // Status summary counts
  const statusCounts = demands.reduce<Record<string, number>>((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {});

  const summaryItems: { status: DemandStatus; count: number }[] = (
    ['open', 'in_progress', 'review', 'approved', 'completed'] as DemandStatus[]
  )
    .filter(s => statusCounts[s])
    .map(s => ({ status: s, count: statusCounts[s] }));

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          Carregando demandas…
        </CardContent>
      </Card>
    );
  }

  if (demands.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <ClipboardList className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">Nenhuma demanda vinculada a esta campanha.</p>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Demandas da Campanha
            <Badge variant="secondary" className="ml-1 text-xs">{demands.length}</Badge>
          </CardTitle>
          {onGoToTab && (
            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={onGoToTab}>
              Ver todas <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Mini status summary */}
        {summaryItems.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {summaryItems.map(({ status, count }) => {
              const cfg = demandStatusConfig[status];
              return (
                <span
                  key={status}
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bgColor} ${cfg.color}`}
                >
                  {count} {cfg.label}
                </span>
              );
            })}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {demands.map((demand: DemandRow) => {
              const statusCfg = demandStatusConfig[demand.status as DemandStatus];
              const typeCfg = demandTypeConfig[demand.type as keyof typeof demandTypeConfig];
              const priorityCfg = demandPriorityConfig[demand.priority as keyof typeof demandPriorityConfig];

              return (
                <TableRow
                  key={demand.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/app/marketing/demandas/${demand.id}`)}
                >
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {demand.title}
                  </TableCell>
                  <TableCell>
                    {demand.assigned_name ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {getInitials(demand.assigned_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {demand.assigned_name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {typeCfg && (
                      <span className="text-xs">
                        {typeCfg.icon} {typeCfg.label}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {statusCfg && (
                      <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${statusCfg.bgColor} ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {priorityCfg && (
                      <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${priorityCfg.bgColor} ${priorityCfg.color}`}>
                        {priorityCfg.label}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
