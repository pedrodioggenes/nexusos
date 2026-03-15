import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatCard } from '@/components/ui/stat-card';
import { Progress } from '@/components/ui/progress';
import { Search, RefreshCw, Send, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface MessageLog {
  id: string;
  campaignTitle: string;
  phone: string;
  status: 'queued' | 'sending' | 'sent' | 'failed';
  sentAt?: Date;
  error?: string;
}

interface QueueStats {
  total: number;
  queued: number;
  sending: number;
  sent: number;
  failed: number;
}

// Mock data
const mockLogs: MessageLog[] = [
  { id: '1', campaignTitle: 'Promoção Janeiro', phone: '+5594999990001', status: 'sent', sentAt: new Date() },
  { id: '2', campaignTitle: 'Promoção Janeiro', phone: '+5594999990002', status: 'sent', sentAt: new Date() },
  { id: '3', campaignTitle: 'Promoção Janeiro', phone: '+5594999990003', status: 'sending' },
  { id: '4', campaignTitle: 'Promoção Janeiro', phone: '+5594999990004', status: 'queued' },
  { id: '5', campaignTitle: 'Promoção Janeiro', phone: '+5594999990005', status: 'failed', error: 'Número inválido' },
  { id: '6', campaignTitle: 'Boas-vindas', phone: '+5594999990006', status: 'sent', sentAt: new Date(Date.now() - 3600000) },
  { id: '7', campaignTitle: 'Boas-vindas', phone: '+5594999990007', status: 'sent', sentAt: new Date(Date.now() - 3600000) },
  { id: '8', campaignTitle: 'Lembrete Compra', phone: '+5594999990008', status: 'queued' },
];

const statusConfig = {
  queued: { label: 'Na Fila', color: 'bg-muted text-muted-foreground', icon: Clock },
  sending: { label: 'Enviando', color: 'bg-blue-500/20 text-blue-500', icon: Send },
  sent: { label: 'Enviado', color: 'bg-success/20 text-success', icon: CheckCircle },
  failed: { label: 'Falhou', color: 'bg-destructive/20 text-destructive', icon: XCircle },
};

export default function Envios() {
  const [logs, setLogs] = useState<MessageLog[]>(mockLogs);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats: QueueStats = {
    total: logs.length,
    queued: logs.filter(l => l.status === 'queued').length,
    sending: logs.filter(l => l.status === 'sending').length,
    sent: logs.filter(l => l.status === 'sent').length,
    failed: logs.filter(l => l.status === 'failed').length,
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.phone.includes(search) || log.campaignTitle.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      // Simulate some progress
      setLogs(prev => prev.map(log => {
        if (log.status === 'queued' && Math.random() > 0.5) {
          return { ...log, status: 'sending' as const };
        }
        if (log.status === 'sending' && Math.random() > 0.3) {
          return { ...log, status: 'sent' as const, sentAt: new Date() };
        }
        return log;
      }));
      setIsRefreshing(false);
    }, 1000);
  };

  // Auto-refresh every 5 seconds when there are pending items
  useEffect(() => {
    if (stats.queued + stats.sending > 0) {
      const interval = setInterval(handleRefresh, 5000);
      return () => clearInterval(interval);
    }
  }, [stats.queued, stats.sending]);

  const progressPercent = stats.total > 0 ? ((stats.sent + stats.failed) / stats.total) * 100 : 0;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Fila de Envios"
        description="Acompanhe o status dos envios em tempo real"
        actions={
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard title="Total" value={stats.total} icon={<Send className="h-4 w-4" />} />
        <StatCard title="Na Fila" value={stats.queued} icon={<Clock className="h-4 w-4" />} />
        <StatCard title="Enviando" value={stats.sending} icon={<Send className="h-4 w-4" />} variant="primary" />
        <StatCard title="Enviados" value={stats.sent} icon={<CheckCircle className="h-4 w-4" />} variant="success" />
        <StatCard title="Falhas" value={stats.failed} icon={<XCircle className="h-4 w-4" />} variant="destructive" />
      </div>

      {/* Progress */}
      {stats.total > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progresso do Envio</span>
              <span className="text-sm text-muted-foreground">{progressPercent.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.sent + stats.failed} de {stats.total} mensagens processadas
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por telefone ou campanha..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="queued">Na Fila</SelectItem>
            <SelectItem value="sending">Enviando</SelectItem>
            <SelectItem value="sent">Enviados</SelectItem>
            <SelectItem value="failed">Falhas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campanha</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Enviado em</TableHead>
              <TableHead>Erro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map(log => {
              const StatusIcon = statusConfig[log.status].icon;
              return (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.campaignTitle}</TableCell>
                  <TableCell className="font-mono text-sm">{log.phone}</TableCell>
                  <TableCell>
                    <Badge className={statusConfig[log.status].color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig[log.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.sentAt ? format(log.sentAt, 'dd/MM HH:mm:ss') : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-destructive">
                    {log.error || '-'}
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum envio encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Info */}
      {stats.queued + stats.sending > 0 && (
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="py-3 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            <p className="text-sm text-blue-500">
              A fila é atualizada automaticamente a cada 5 segundos enquanto há envios pendentes.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
