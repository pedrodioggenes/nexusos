import { FileBarChart, Download, Filter, Calendar, Building2, Package, TrendingUp, FileText } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'performance' | 'financial' | 'operational' | 'executive';
  format: 'pdf' | 'excel' | 'csv';
  lastGenerated?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const availableReports: Report[] = [
  { id: '1', name: 'Performance Geral', description: 'Visão completa de aprovações, pendências e rejeições por fornecedor', type: 'performance', format: 'pdf', lastGenerated: '2026-01-27', icon: TrendingUp },
  { id: '2', name: 'ROI por Fornecedor', description: 'Análise detalhada de retorno sobre investimento de cada parceiro', type: 'financial', format: 'excel', lastGenerated: '2026-01-26', icon: FileBarChart },
  { id: '3', name: 'Comprovações Pendentes', description: 'Lista de todas as comprovações aguardando revisão', type: 'operational', format: 'excel', lastGenerated: '2026-01-27', icon: Package },
  { id: '4', name: 'Pacotes por Período', description: 'Relatório de pacotes ativos, concluídos e cancelados', type: 'operational', format: 'pdf', lastGenerated: '2026-01-25', icon: Building2 },
  { id: '5', name: 'Resumo Executivo', description: 'Principais KPIs e métricas para apresentação gerencial', type: 'executive', format: 'pdf', icon: FileText },
  { id: '6', name: 'Exportação de Dados', description: 'Dados brutos de pacotes, checklists e comprovações', type: 'operational', format: 'csv', icon: FileText },
];

const getTypeConfig = (type: Report['type']) => {
  switch (type) {
    case 'performance':
      return { label: 'Performance', color: 'border-success/30 text-success bg-success/10' };
    case 'financial':
      return { label: 'Financeiro', color: 'border-warning/30 text-warning bg-warning/10' };
    case 'operational':
      return { label: 'Operacional', color: 'border-primary/30 text-primary bg-primary/10' };
    case 'executive':
      return { label: 'Executivo', color: 'border-app-trade/30 text-app-trade bg-app-trade/10' };
    default:
      return { label: type, color: 'border-border text-muted-foreground bg-muted' };
  }
};

const getFormatBadge = (format: Report['format']) => {
  switch (format) {
    case 'pdf':
      return 'PDF';
    case 'excel':
      return 'Excel';
    case 'csv':
      return 'CSV';
    default:
      return format;
  }
};

export default function RelatoriosTrade() {
  const [filter, setFilter] = useState<'all' | Report['type']>('all');

  const filteredReports = filter === 'all' 
    ? availableReports 
    : availableReports.filter(r => r.type === filter);

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Relatórios Trade" 
        description="Geração e exportação de relatórios de trade marketing"
        actions={
          <Button size="sm" className="h-8 text-xs gap-1.5 bg-app-trade hover:bg-app-trade/90">
            <Calendar className="h-3.5 w-3.5" />
            Agendar Relatório
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          size="sm" 
          className="h-8 text-xs"
          onClick={() => setFilter('all')}
        >
          Todos
        </Button>
        <Button 
          variant={filter === 'performance' ? 'default' : 'outline'} 
          size="sm" 
          className="h-8 text-xs"
          onClick={() => setFilter('performance')}
        >
          Performance
        </Button>
        <Button 
          variant={filter === 'financial' ? 'default' : 'outline'} 
          size="sm" 
          className="h-8 text-xs"
          onClick={() => setFilter('financial')}
        >
          Financeiro
        </Button>
        <Button 
          variant={filter === 'operational' ? 'default' : 'outline'} 
          size="sm" 
          className="h-8 text-xs"
          onClick={() => setFilter('operational')}
        >
          Operacional
        </Button>
        <Button 
          variant={filter === 'executive' ? 'default' : 'outline'} 
          size="sm" 
          className="h-8 text-xs"
          onClick={() => setFilter('executive')}
        >
          Executivo
        </Button>
      </div>

      {/* Reports Grid */}
      <div className="grid md:grid-cols-2 gap-3">
        {filteredReports.map((report) => {
          const typeConfig = getTypeConfig(report.type);
          const Icon = report.icon;

          return (
            <Card key={report.id} className="card-base hover:border-app-trade/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-app-trade/20 to-app-trade/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-app-trade" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-foreground">{report.name}</h3>
                      <Badge variant="outline" className={`text-[9px] ${typeConfig.color}`}>
                        {typeConfig.label}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2">{report.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px]">{getFormatBadge(report.format)}</Badge>
                      {report.lastGenerated && (
                        <span className="text-[9px] text-muted-foreground">
                          Último: {new Date(report.lastGenerated).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 w-8 shrink-0">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Generated */}
      <Card className="card-base">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs font-medium">Gerados Recentemente</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-2">
            {[
              { name: 'Performance Geral - Jan 2026', date: '27/01/2026 10:30', format: 'pdf', size: '2.4 MB' },
              { name: 'ROI por Fornecedor Q4 2025', date: '26/01/2026 15:45', format: 'excel', size: '1.8 MB' },
              { name: 'Comprovações Pendentes', date: '27/01/2026 08:00', format: 'excel', size: '456 KB' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium text-foreground">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{item.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px]">{item.format.toUpperCase()}</Badge>
                  <span className="text-[9px] text-muted-foreground">{item.size}</span>
                  <Button size="icon" variant="ghost" className="h-6 w-6">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
