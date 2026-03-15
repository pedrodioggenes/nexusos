import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Calendar, Filter, Eye, Sparkles, ExternalLink, Clock, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExecutiveReportDialog } from '@/components/marketing/ExecutiveReportDialog';
import { ScheduleReportDialog } from '@/components/marketing/ScheduleReportDialog';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { BlurFade } from '@/components/ui/blur-fade';
import { useLatestMarketingKPI } from '@/hooks/useMarketingKPIs';
import { useMarketingBudgets } from '@/hooks/useMarketingBudgets';
import { useMarketingCampaigns } from '@/hooks/useMarketingCampaigns';
import { useStorePerformance } from '@/hooks/useStorePerformance';
import { useCoopFunds } from '@/hooks/useCoopFunds';
import { 
  exportKPIsReport, 
  exportBudgetReport, 
  exportCampaignsReport, 
  exportStorePerformanceReport,
  exportCoopFundsReport 
} from '@/lib/excel-export';
import { toast } from 'sonner';

const reports = [
  {
    id: 1,
    title: 'Relatório Executivo Mensal',
    description: 'Visão consolidada de todas as ações de marketing do mês',
    type: 'Mensal',
    lastGenerated: '15 Jan 2026',
    status: 'Disponível',
  },
  {
    id: 2,
    title: 'Performance de Campanhas',
    description: 'Análise detalhada de ROI e métricas por campanha',
    type: 'Sob demanda',
    lastGenerated: '12 Jan 2026',
    status: 'Disponível',
  },
  {
    id: 3,
    title: 'Análise de Trade Marketing',
    description: 'Compliance, execução e resultados de trade',
    type: 'Quinzenal',
    lastGenerated: '10 Jan 2026',
    status: 'Disponível',
  },
  {
    id: 4,
    title: 'Relatório de Budget',
    description: 'Alocação e consumo de orçamento por categoria',
    type: 'Mensal',
    lastGenerated: '01 Jan 2026',
    status: 'Disponível',
  },
  {
    id: 5,
    title: 'Dashboard de KPIs',
    description: 'Exportação do painel de indicadores',
    type: 'Sob demanda',
    lastGenerated: '08 Jan 2026',
    status: 'Disponível',
  },
];

const scheduledReports = [
  { title: 'Relatório Executivo Fev/26', date: '01 Fev 2026', status: 'Agendado' },
  { title: 'Performance Q1 2026', date: '01 Abr 2026', status: 'Agendado' },
];

export default function Relatorios() {
  const navigate = useNavigate();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  // Fetch data for exports
  const { data: kpi } = useLatestMarketingKPI('monthly');
  const { data: budget } = useMarketingBudgets();
  const { data: campaigns = [] } = useMarketingCampaigns();
  const { data: stores = [] } = useStorePerformance('monthly');
  const { data: funds = [] } = useCoopFunds(new Date().getFullYear());

  const handleExportKPIs = () => {
    if (kpi) {
      exportKPIsReport([kpi]);
      toast.success('KPIs exportados com sucesso');
    } else {
      toast.error('Nenhum dado de KPI disponível');
    }
  };

  const handleExportBudget = () => {
    if (budget?.marketing_budget_categories) {
      const budgetData = [{
        year: budget.year,
        total_budget: budget.total_budget,
        categories: budget.marketing_budget_categories.map(c => ({
          name: c.name,
          allocated_amount: Number(c.allocated_amount),
          spent_amount: Number(c.spent_amount),
        }))
      }];
      exportBudgetReport(budgetData);
      toast.success('Budget exportado com sucesso');
    } else {
      toast.error('Nenhum dado de budget disponível');
    }
  };

  const handleExportCampaigns = () => {
    if (campaigns.length > 0) {
      exportCampaignsReport(campaigns);
      toast.success('Campanhas exportadas com sucesso');
    } else {
      toast.error('Nenhuma campanha disponível');
    }
  };

  const handleExportStores = () => {
    if (stores.length > 0) {
      exportStorePerformanceReport(stores);
      toast.success('Performance de lojas exportada com sucesso');
    } else {
      toast.error('Nenhum dado de performance disponível');
    }
  };

  const handleExportCoopFunds = () => {
    if (funds.length > 0) {
      exportCoopFundsReport(funds);
      toast.success('Verbas cooperadas exportadas com sucesso');
    } else {
      toast.error('Nenhuma verba cooperada disponível');
    }
  };

  return (
    <PageWrapper
      title="Relatórios Executivos"
      subtitle="Relatórios e exportações gerenciais"
      icon={<FileText className="h-5 w-5 text-app-gestao" />}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-8 text-xs"
            onClick={() => navigate('/app/marketing/relatorios/pdf')}
          >
            <FileText className="h-3.5 w-3.5" />
            PDF Profissional
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-8 text-xs"
            onClick={() => navigate('/app/marketing/relatorios/builder')}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Builder
          </Button>
          <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
            <Filter className="h-3.5 w-3.5" />
            Filtrar
          </Button>
          <Button 
            size="sm" 
            className="gap-2 h-8 text-xs bg-app-gestao hover:bg-app-gestao/90"
            onClick={() => setReportDialogOpen(true)}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Gerar Relatório Executivo
          </Button>
        </div>
      }
    >

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Reports List - Full width on mobile, 2 cols on lg */}
        <div className="order-2 lg:order-1 lg:col-span-2 space-y-3">
          {reports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="bg-card border-border hover:border-app-gestao/50 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-app-gestao/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <FileText className="h-4 w-4 text-app-gestao" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          {report.title}
                          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {report.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="secondary" className="text-[9px] h-5">
                            {report.type}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {report.lastGenerated}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-app-gestao/10">
                        <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-app-gestao" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-app-gestao/10">
                        <Download className="h-3.5 w-3.5 text-muted-foreground hover:text-app-gestao" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Scheduled Reports & Export - First on mobile for quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="order-1 lg:order-2 space-y-3 md:space-y-4"
        >
          <Card className="bg-card border-border hover:border-app-gestao/50 hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-app-gestao/10">
                  <Calendar className="h-4 w-4 text-app-gestao" />
                </div>
                Agendados
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {scheduledReports.map((report, index) => (
                <div 
                  key={index}
                  className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <p className="text-xs font-medium text-foreground">{report.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground">{report.date}</span>
                    <Badge variant="outline" className="text-[9px] h-5 border-app-gestao/30 text-app-gestao">
                      {report.status}
                    </Badge>
                  </div>
                </div>
              ))}
              
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs h-8 hover:border-app-gestao/50 hover:text-app-gestao gap-2"
                  onClick={() => setScheduleDialogOpen(true)}
                >
                  <Clock className="h-3 w-3" />
                  Agendar Relatório
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-app-gestao/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Exportar Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="default" 
                size="sm" 
                className="w-full justify-start gap-2 text-xs h-9 bg-app-gestao hover:bg-app-gestao/90"
                onClick={() => setReportDialogOpen(true)}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Apresentação Executiva (PDF)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2 text-xs h-8 hover:border-app-gestao/50 hover:text-app-gestao"
                onClick={handleExportKPIs}
              >
                <Download className="h-3 w-3" />
                Exportar KPIs (Excel)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2 text-xs h-8 hover:border-app-gestao/50 hover:text-app-gestao"
                onClick={handleExportBudget}
              >
                <Download className="h-3 w-3" />
                Exportar Budget (Excel)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2 text-xs h-8 hover:border-app-gestao/50 hover:text-app-gestao"
                onClick={handleExportCampaigns}
              >
                <Download className="h-3 w-3" />
                Exportar Campanhas (CSV)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2 text-xs h-8 hover:border-app-gestao/50 hover:text-app-gestao"
                onClick={handleExportStores}
              >
                <Download className="h-3 w-3" />
                Exportar Performance Lojas (Excel)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2 text-xs h-8 hover:border-app-gestao/50 hover:text-app-gestao"
                onClick={handleExportCoopFunds}
              >
                <Download className="h-3 w-3" />
                Exportar Trade Marketing (Excel)
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Executive Report Dialog */}
      <ExecutiveReportDialog 
        open={reportDialogOpen} 
        onOpenChange={setReportDialogOpen} 
      />

      {/* Schedule Report Dialog */}
      <ScheduleReportDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
      />
    </PageWrapper>
  );
}