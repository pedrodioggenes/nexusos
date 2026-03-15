import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, UserX, UserCheck, Download, TrendingDown, Calendar, Building2 } from 'lucide-react';
import { format, subDays } from 'date-fns';
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

interface OptOutContact {
  id: string;
  phone: string;
  name: string | null;
  unit: string;
  optOutDate: Date;
  reason?: string;
}

const mockOptOuts: OptOutContact[] = [
  { id: '1', phone: '+5594999990001', name: 'Maria Silva', unit: 'Belém Centro', optOutDate: subDays(new Date(), 1), reason: 'Mensagens frequentes' },
  { id: '2', phone: '+5594999990002', name: null, unit: 'Ananindeua', optOutDate: subDays(new Date(), 2) },
  { id: '3', phone: '+5594999990003', name: 'João Santos', unit: 'Belém Centro', optOutDate: subDays(new Date(), 3), reason: 'Não deseja mais receber' },
  { id: '4', phone: '+5594999990004', name: 'Ana Costa', unit: 'Castanhal', optOutDate: subDays(new Date(), 5) },
  { id: '5', phone: '+5594999990005', name: null, unit: 'Belém Centro', optOutDate: subDays(new Date(), 7), reason: 'Trocou de número' },
  { id: '6', phone: '+5594999990006', name: 'Pedro Lima', unit: 'Marituba', optOutDate: subDays(new Date(), 10) },
  { id: '7', phone: '+5594999990007', name: 'Carla Souza', unit: 'Belém Centro', optOutDate: subDays(new Date(), 15), reason: 'Mudou de cidade' },
];

export default function OptOuts() {
  const [optOuts, setOptOuts] = useState<OptOutContact[]>(mockOptOuts);
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [reactivateId, setReactivateId] = useState<string | null>(null);

  const units = [...new Set(optOuts.map(o => o.unit))];

  const filteredOptOuts = optOuts.filter(contact => {
    const matchesSearch = contact.phone.includes(search) || 
                          (contact.name?.toLowerCase().includes(search.toLowerCase()));
    const matchesUnit = unitFilter === 'all' || contact.unit === unitFilter;
    return matchesSearch && matchesUnit;
  });

  const last7Days = optOuts.filter(o => o.optOutDate > subDays(new Date(), 7)).length;
  const last30Days = optOuts.filter(o => o.optOutDate > subDays(new Date(), 30)).length;

  const handleReactivate = () => {
    if (!reactivateId) return;
    setOptOuts(prev => prev.filter(o => o.id !== reactivateId));
    toast.success('Contato reativado');
    setReactivateId(null);
  };

  const handleExport = () => {
    const csv = [
      ['Telefone', 'Nome', 'Unidade', 'Data Opt-out', 'Motivo'].join(','),
      ...filteredOptOuts.map(o => [
        o.phone,
        o.name || '',
        o.unit,
        format(o.optOutDate, 'dd/MM/yyyy'),
        o.reason || '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opt_outs_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
    toast.success('Arquivo exportado');
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Opt-outs"
        description="Gerencie contatos que optaram por não receber mensagens"
        actions={
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />Exportar
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Total Opt-outs" value={optOuts.length} icon={<UserX className="h-4 w-4" />} />
        <StatCard title="Últimos 7 dias" value={last7Days} icon={<Calendar className="h-4 w-4" />} variant="warning" />
        <StatCard title="Últimos 30 dias" value={last30Days} icon={<TrendingDown className="h-4 w-4" />} variant="destructive" />
        <StatCard title="Unidades" value={units.length} icon={<Building2 className="h-4 w-4" />} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por telefone ou nome..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={unitFilter} onValueChange={setUnitFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Unidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Unidades</SelectItem>
            {units.map(unit => (
              <SelectItem key={unit} value={unit}>{unit}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Telefone</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Data Opt-out</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOptOuts.map(contact => (
              <TableRow key={contact.id}>
                <TableCell className="font-mono text-sm">{contact.phone}</TableCell>
                <TableCell>{contact.name || <span className="text-muted-foreground">-</span>}</TableCell>
                <TableCell>
                  <Badge variant="outline">{contact.unit}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(contact.optOutDate, 'dd/MM/yyyy HH:mm')}
                </TableCell>
                <TableCell className="text-sm">
                  {contact.reason || <span className="text-muted-foreground">Não informado</span>}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setReactivateId(contact.id)}
                    className="text-success hover:text-success"
                  >
                    <UserCheck className="h-4 w-4 mr-1" />
                    Reativar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredOptOuts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum opt-out encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <h4 className="font-medium mb-2">Sobre Opt-outs</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Contatos que optaram por não receber mensagens não são incluídos em campanhas</li>
            <li>• Você pode reativar um contato se ele solicitar receber mensagens novamente</li>
            <li>• O histórico de opt-out é mantido para conformidade com LGPD</li>
          </ul>
        </CardContent>
      </Card>

      {/* Reactivate Dialog */}
      <AlertDialog open={!!reactivateId} onOpenChange={() => setReactivateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reativar Contato</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja reativar este contato? Ele voltará a receber mensagens de campanhas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReactivate} className="bg-success text-success-foreground hover:bg-success/90">
              Reativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
