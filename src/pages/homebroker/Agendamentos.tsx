import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Users, Play, Pause, Trash2, Search, CalendarDays } from 'lucide-react';
import { format, isBefore, isToday, isTomorrow, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ScheduledCampaign {
  id: string;
  title: string;
  scheduledAt: Date;
  status: 'scheduled' | 'paused' | 'sent';
  audienceCount: number;
  unitScope: string;
}

// Mock data
const mockScheduled: ScheduledCampaign[] = [
  { id: '1', title: 'Promoção Final de Semana', scheduledAt: addDays(new Date(), 2), status: 'scheduled', audienceCount: 1250, unitScope: 'Todas' },
  { id: '2', title: 'Lembrete Fidelidade', scheduledAt: addDays(new Date(), 1), status: 'scheduled', audienceCount: 890, unitScope: '3 unidades' },
  { id: '3', title: 'Black Friday Early', scheduledAt: new Date(), status: 'paused', audienceCount: 2100, unitScope: 'Todas' },
  { id: '4', title: 'Aniversário do Cliente', scheduledAt: addDays(new Date(), 5), status: 'scheduled', audienceCount: 45, unitScope: 'Belém Centro' },
  { id: '5', title: 'Campanha Natal', scheduledAt: addDays(new Date(), 10), status: 'scheduled', audienceCount: 3500, unitScope: 'Todas' },
];

const statusConfig = {
  scheduled: { label: 'Agendada', color: 'bg-accent/20 text-accent' },
  paused: { label: 'Pausada', color: 'bg-muted text-muted-foreground' },
  sent: { label: 'Enviada', color: 'bg-success/20 text-success' },
};

export default function Agendamentos() {
  const [campaigns, setCampaigns] = useState<ScheduledCampaign[]>(mockScheduled);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredCampaigns = campaigns
    .filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

  const getDateLabel = (date: Date): string => {
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  };

  const handleTogglePause = (id: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        const newStatus = c.status === 'paused' ? 'scheduled' : 'paused';
        toast.success(newStatus === 'paused' ? 'Campanha pausada' : 'Campanha reativada');
        return { ...c, status: newStatus as 'scheduled' | 'paused' };
      }
      return c;
    }));
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setCampaigns(prev => prev.filter(c => c.id !== deleteId));
    toast.success('Agendamento cancelado');
    setDeleteId(null);
  };

  // Group by date
  const groupedCampaigns = filteredCampaigns.reduce((acc, campaign) => {
    const dateKey = format(campaign.scheduledAt, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = { label: getDateLabel(campaign.scheduledAt), campaigns: [] };
    }
    acc[dateKey].campaigns.push(campaign);
    return acc;
  }, {} as Record<string, { label: string; campaigns: ScheduledCampaign[] }>);

  const upcomingCount = campaigns.filter(c => c.status === 'scheduled').length;
  const pausedCount = campaigns.filter(c => c.status === 'paused').length;
  const totalAudience = campaigns.filter(c => c.status === 'scheduled').reduce((sum, c) => sum + c.audienceCount, 0);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Agendamentos"
        description="Gerencie campanhas programadas para envio futuro"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="py-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{upcomingCount}</p>
              <p className="text-xs text-muted-foreground">Agendadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
              <Pause className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{pausedCount}</p>
              <p className="text-xs text-muted-foreground">Pausadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{totalAudience.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Público Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar campanhas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Grouped List */}
      {Object.entries(groupedCampaigns).map(([dateKey, group]) => (
        <div key={dateKey} className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {group.label}
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Público</TableHead>
                  <TableHead>Escopo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.campaigns.map(campaign => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {format(campaign.scheduledAt, 'HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        {campaign.audienceCount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{campaign.unitScope}</TableCell>
                    <TableCell>
                      <Badge className={statusConfig[campaign.status].color}>
                        {statusConfig[campaign.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleTogglePause(campaign.id)}
                          className="h-8 w-8"
                        >
                          {campaign.status === 'paused' ? (
                            <Play className="h-4 w-4 text-success" />
                          ) : (
                            <Pause className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setDeleteId(campaign.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      ))}

      {filteredCampaigns.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma campanha agendada</p>
          </CardContent>
        </Card>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar este agendamento? A campanha não será enviada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Cancelar Agendamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
