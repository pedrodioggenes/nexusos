import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Users, Building2, Megaphone, UserX } from 'lucide-react';
import { useContactsByUnitReport, useGeneralContactsReport, useCampaignVolumeReport, useOptOutReport } from '@/hooks/useReports';
import { useUnits } from '@/hooks/useUnits';
import { exportToCSV } from '@/lib/csv-export';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Relatorios() {
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: units } = useUnits();
  const { data: contactsByUnit, isLoading: loadingContactsByUnit } = useContactsByUnitReport(selectedUnit !== 'all' ? selectedUnit : undefined);
  const { data: generalContacts, isLoading: loadingGeneral } = useGeneralContactsReport();
  const { data: campaignVolume, isLoading: loadingCampaigns } = useCampaignVolumeReport(startDate || undefined, endDate || undefined);
  const { data: optOuts, isLoading: loadingOptOuts } = useOptOutReport(startDate || undefined, endDate || undefined);

  const handleExportContactsByUnit = () => {
    if (!contactsByUnit || contactsByUnit.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }
    exportToCSV(contactsByUnit, `contatos_por_unidade_${format(new Date(), 'yyyyMMdd')}`, [
      { key: 'phone', label: 'Telefone' },
      { key: 'name', label: 'Nome' },
      { key: 'status', label: 'Status' },
      { key: 'scope', label: 'Escopo' },
      { key: 'unit_name', label: 'Unidade' },
      { key: 'city', label: 'Cidade' },
    ]);
    toast.success('Arquivo exportado com sucesso');
  };

  const handleExportGeneral = () => {
    if (!generalContacts || generalContacts.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }
    exportToCSV(generalContacts, `base_geral_contatos_${format(new Date(), 'yyyyMMdd')}`, [
      { key: 'phone', label: 'Telefone' },
      { key: 'name', label: 'Nome' },
      { key: 'status', label: 'Status' },
      { key: 'scope', label: 'Escopo' },
      { key: 'unit_name', label: 'Unidade' },
      { key: 'created_at', label: 'Data Cadastro' },
      { key: 'last_interaction_at', label: 'Última Interação' },
    ]);
    toast.success('Arquivo exportado com sucesso');
  };

  const handleExportCampaigns = () => {
    if (!campaignVolume || campaignVolume.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }
    exportToCSV(campaignVolume, `campanhas_volumes_${format(new Date(), 'yyyyMMdd')}`, [
      { key: 'title', label: 'Título' },
      { key: 'message_type', label: 'Tipo' },
      { key: 'unit_scope', label: 'Escopo' },
      { key: 'status', label: 'Status' },
      { key: 'sent_at', label: 'Data Envio' },
      { key: 'total_messages', label: 'Total Mensagens' },
      { key: 'queued', label: 'Na Fila' },
      { key: 'sent', label: 'Enviadas' },
      { key: 'failed', label: 'Falhas' },
    ]);
    toast.success('Arquivo exportado com sucesso');
  };

  const handleExportOptOuts = () => {
    if (!optOuts || optOuts.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }
    exportToCSV(optOuts, `opt_outs_${format(new Date(), 'yyyyMMdd')}`, [
      { key: 'phone', label: 'Telefone' },
      { key: 'name', label: 'Nome' },
      { key: 'unit_name', label: 'Unidade' },
      { key: 'updated_at', label: 'Data Opt-out' },
    ]);
    toast.success('Arquivo exportado com sucesso');
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Relatórios" description="Exporte dados e visualize métricas do sistema" />

      <Tabs defaultValue="contacts-unit" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contacts-unit" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Por Unidade</span>
          </TabsTrigger>
          <TabsTrigger value="contacts-general" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Base Geral</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            <span className="hidden sm:inline">Campanhas</span>
          </TabsTrigger>
          <TabsTrigger value="optouts" className="flex items-center gap-2">
            <UserX className="h-4 w-4" />
            <span className="hidden sm:inline">Opt-outs</span>
          </TabsTrigger>
        </TabsList>

        {/* Contatos por Unidade */}
        <TabsContent value="contacts-unit">
          <Card>
            <CardHeader>
              <CardTitle>Contatos por Unidade</CardTitle>
              <CardDescription>Lista de contatos filtrados por unidade com status e assinatura</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2">
                  <Label>Unidade</Label>
                  <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                    <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Unidades</SelectItem>
                      {units?.filter(u => u.is_active).map(unit => (
                        <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleExportContactsByUnit} disabled={loadingContactsByUnit || !contactsByUnit?.length}>
                  <Download className="h-4 w-4 mr-2" />Exportar CSV
                </Button>
              </div>
              <div className="border rounded-lg max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Escopo</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Cidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingContactsByUnit ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        </TableRow>
                      ))
                    ) : contactsByUnit?.length ? (
                      contactsByUnit.slice(0, 50).map((contact, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-sm">{contact.phone}</TableCell>
                          <TableCell>{contact.name || '-'}</TableCell>
                          <TableCell className="capitalize">{contact.status}</TableCell>
                          <TableCell>{contact.scope === 'all_units' ? 'Todas' : 'Específica'}</TableCell>
                          <TableCell>{contact.unit_name}</TableCell>
                          <TableCell>{contact.city}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum contato encontrado</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {contactsByUnit && contactsByUnit.length > 50 && (
                <p className="text-sm text-muted-foreground">Mostrando 50 de {contactsByUnit.length} registros. Exporte para ver todos.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Base Geral */}
        <TabsContent value="contacts-general">
          <Card>
            <CardHeader>
              <CardTitle>Base Geral de Contatos</CardTitle>
              <CardDescription>Lista completa de todos os contatos com informações de assinatura</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleExportGeneral} disabled={loadingGeneral || !generalContacts?.length}>
                <Download className="h-4 w-4 mr-2" />Exportar CSV
              </Button>
              <div className="border rounded-lg max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Escopo</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Cadastro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingGeneral ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-18" /></TableCell>
                        </TableRow>
                      ))
                    ) : generalContacts?.length ? (
                      generalContacts.slice(0, 50).map((contact, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-sm">{contact.phone}</TableCell>
                          <TableCell>{contact.name || '-'}</TableCell>
                          <TableCell className="capitalize">{contact.status}</TableCell>
                          <TableCell>{contact.scope === 'all_units' ? 'Todas' : 'Específica'}</TableCell>
                          <TableCell>{contact.unit_name}</TableCell>
                          <TableCell>{contact.created_at ? format(new Date(contact.created_at), 'dd/MM/yyyy') : '-'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum contato encontrado</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {generalContacts && generalContacts.length > 50 && (
                <p className="text-sm text-muted-foreground">Mostrando 50 de {generalContacts.length} registros. Exporte para ver todos.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campanhas e Volumes */}
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Campanhas e Volumes</CardTitle>
              <CardDescription>Relatório de campanhas com contagem de mensagens por status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-[160px]" />
                </div>
                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-[160px]" />
                </div>
                <Button onClick={handleExportCampaigns} disabled={loadingCampaigns || !campaignVolume?.length}>
                  <Download className="h-4 w-4 mr-2" />Exportar CSV
                </Button>
              </div>
              <div className="border rounded-lg max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Envio</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Fila</TableHead>
                      <TableHead className="text-right">Enviadas</TableHead>
                      <TableHead className="text-right">Falhas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingCampaigns ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                        </TableRow>
                      ))
                    ) : campaignVolume?.length ? (
                      campaignVolume.map((campaign, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{campaign.title}</TableCell>
                          <TableCell className="capitalize">{campaign.message_type}</TableCell>
                          <TableCell className="capitalize">{campaign.status}</TableCell>
                          <TableCell>{campaign.sent_at ? format(new Date(campaign.sent_at), 'dd/MM/yyyy HH:mm') : '-'}</TableCell>
                          <TableCell className="text-right font-medium">{campaign.total_messages}</TableCell>
                          <TableCell className="text-right">{campaign.queued}</TableCell>
                          <TableCell className="text-right text-green-600">{campaign.sent}</TableCell>
                          <TableCell className="text-right text-destructive">{campaign.failed}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Nenhuma campanha encontrada</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opt-outs */}
        <TabsContent value="optouts">
          <Card>
            <CardHeader>
              <CardTitle>Opt-outs por Período</CardTitle>
              <CardDescription>Lista de contatos que optaram por sair no período selecionado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-[160px]" />
                </div>
                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-[160px]" />
                </div>
                <Button onClick={handleExportOptOuts} disabled={loadingOptOuts || !optOuts?.length}>
                  <Download className="h-4 w-4 mr-2" />Exportar CSV
                </Button>
              </div>
              <div className="border rounded-lg max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Data Opt-out</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingOptOuts ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        </TableRow>
                      ))
                    ) : optOuts?.length ? (
                      optOuts.map((contact, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-sm">{contact.phone}</TableCell>
                          <TableCell>{contact.name || '-'}</TableCell>
                          <TableCell>{contact.unit_name}</TableCell>
                          <TableCell>{contact.updated_at ? format(new Date(contact.updated_at), 'dd/MM/yyyy HH:mm') : '-'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum opt-out encontrado</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
