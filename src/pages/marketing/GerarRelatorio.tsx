import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subMonths, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Download, Sparkles, Calendar, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateExecutiveReport, downloadPDF, type ReportConfig, type ReportData, type ReportPeriod, type ReportType } from '@/lib/pdf-generator';
import { useLatestMarketingKPI } from '@/hooks/useMarketingKPIs';
import { useMarketingBudgets, useMarketingBudgetCategories } from '@/hooks/useMarketingBudgets';
import { useMarketingPlans } from '@/hooks/useMarketingPlans';

export default function GerarRelatorio() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [reportType, setReportType] = useState<ReportType>('executive');
  const [sections, setSections] = useState({
    executiveSummary: true, budgetAnalysis: true, channelPerformance: false, marketingActions: true, conclusions: true,
  });
  const [includeAIInsights, setIncludeAIInsights] = useState(false);

  const { data: latestKPI } = useLatestMarketingKPI('monthly');
  const { data: budgets } = useMarketingBudgets(new Date().getFullYear());
  const currentBudget = budgets?.[0];
  const { data: categories } = useMarketingBudgetCategories(currentBudget?.id);
  const { data: plans } = useMarketingPlans();

  const handleSectionChange = (section: keyof typeof sections, checked: boolean) => {
    setSections(prev => ({ ...prev, [section]: checked }));
  };

  const getPeriodDates = () => {
    const now = new Date();
    switch (period) {
      case 'month': const lm = subMonths(now, 1); return { start: startOfMonth(lm), end: endOfMonth(lm) };
      case 'quarter': return { start: startOfQuarter(now), end: endOfQuarter(now) };
      case 'year': return { start: startOfYear(now), end: endOfYear(now) };
      default: return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const generateAIInsights = async (data: ReportData): Promise<string> => {
    try {
      const prompt = `Analise os seguintes dados de marketing e gere insights executivos em português:\n\nKPIs:\n- ROI: ${data.kpis?.roi ?? 'N/A'}%\n- Receita: R$ ${data.kpis?.revenue ?? 0}\n- Conversões: ${data.kpis?.conversions ?? 0}\n- CAC: R$ ${data.kpis?.cac ?? 0}\n\nOrçamento:\n- Total: R$ ${data.budget?.total ?? 0}\n- Utilizado: R$ ${data.budget?.spent ?? 0}\n\nAções: ${data.actions?.length ?? 0}\n\nGere um resumo executivo de 3-4 parágrafos com análise geral, pontos de destaque e recomendações.`;
      const response = await supabase.functions.invoke('ia-chat', { body: { messages: [{ role: 'user', content: prompt }], mode: 'report' } });
      if (response.error) throw response.error;
      return response.data?.response || 'Não foi possível gerar insights automáticos.';
    } catch { return 'Não foi possível gerar insights automáticos.'; }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const periodDates = getPeriodDates();
      const config: ReportConfig = { period, periodStart: periodDates.start, periodEnd: periodDates.end, reportType, sections, includeAIInsights, companyName: 'Empresa' };
      const budgetTotal = currentBudget?.total_budget || 0;
      const budgetSpent = categories?.reduce((sum, cat) => sum + (cat.spent_amount || 0), 0) || 0;
      const data: ReportData = {
        kpis: latestKPI ? { roi: latestKPI.roi, revenue: latestKPI.revenue, conversions: latestKPI.conversions, conversionRate: latestKPI.conversion_rate, cac: latestKPI.cac, ltv: latestKPI.ltv, impressions: latestKPI.impressions, clicks: latestKPI.clicks } : undefined,
        budget: { total: budgetTotal, spent: budgetSpent, available: budgetTotal - budgetSpent, categories: categories?.map(cat => ({ name: cat.name, allocated: cat.allocated_amount || 0, spent: cat.spent_amount || 0, color: cat.color || '#6B7280' })) || [] },
        actions: plans?.map(plan => ({ title: plan.title, type: plan.type, status: plan.status || 'planned', startDate: plan.start_date ? format(new Date(plan.start_date), 'dd/MM/yyyy') : undefined, endDate: plan.end_date ? format(new Date(plan.end_date), 'dd/MM/yyyy') : undefined, budget: plan.budget || undefined })) || [],
      };
      if (includeAIInsights) data.aiInsights = await generateAIInsights(data);
      const pdf = await generateExecutiveReport(config, data);
      const periodLabel = period === 'month' ? format(periodDates.start, 'MMM-yyyy', { locale: ptBR }) : period === 'quarter' ? `Q${Math.ceil((periodDates.start.getMonth() + 1) / 3)}-${periodDates.start.getFullYear()}` : periodDates.start.getFullYear().toString();
      downloadPDF(pdf, `relatorio-executivo-${periodLabel}.pdf`);
      toast({ title: 'Relatório gerado!', description: 'O download do PDF foi iniciado.' });
      navigate('/app/marketing/relatorios');
    } catch {
      toast({ title: 'Erro ao gerar relatório', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedSectionsCount = Object.values(sections).filter(Boolean).length;

  return (
    <PageWrapper
      title="Gerar Relatório Executivo"
      subtitle="Configure as opções e gere um PDF profissional"
      icon={<FileText className="h-5 w-5 text-module-gestao" />}
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate('/app/marketing/relatorios')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
      }
    >
      {isGenerating ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-medium">Gerando Relatório...</p>
            <p className="text-sm text-muted-foreground mt-1">{includeAIInsights ? 'Analisando dados e gerando insights com IA...' : 'Compilando dados e gerando PDF...'}</p>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 space-y-6 max-w-lg">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Período</Label>
              <Select value={period} onValueChange={v => setPeriod(v as ReportPeriod)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="month"><div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Último Mês</div></SelectItem>
                  <SelectItem value="quarter">Trimestre Atual</SelectItem>
                  <SelectItem value="year">Ano Atual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Tipo de Relatório</Label>
              <RadioGroup value={reportType} onValueChange={v => setReportType(v as ReportType)}>
                <div className="grid grid-cols-2 gap-3">
                  {[['executive', 'Executivo Completo'], ['summary', 'Resumo Rápido'], ['performance', 'Performance'], ['budget', 'Orçamento']].map(([v, l]) => (
                    <div key={v} className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-module-gestao/50 cursor-pointer transition-colors">
                      <RadioGroupItem value={v} id={v} />
                      <Label htmlFor={v} className="cursor-pointer text-sm">{l}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Seções ({selectedSectionsCount} selecionadas)</Label>
              <div className="space-y-2">
                {[['executiveSummary', 'Resumo Executivo (KPIs)'], ['budgetAnalysis', 'Análise de Orçamento'], ['channelPerformance', 'Performance por Canal'], ['marketingActions', 'Ações de Marketing'], ['conclusions', 'Conclusões e Recomendações']].map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox id={key} checked={sections[key as keyof typeof sections]} onCheckedChange={c => handleSectionChange(key as keyof typeof sections, c as boolean)} />
                    <Label htmlFor={key} className="cursor-pointer text-sm">{label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer ${includeAIInsights ? 'border-blue-500 bg-blue-500/10' : 'border-border hover:border-blue-500/50'}`}
              onClick={() => setIncludeAIInsights(!includeAIInsights)}>
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${includeAIInsights ? 'bg-blue-500' : 'bg-muted'}`}>
                  <Sparkles className={`h-5 w-5 ${includeAIInsights ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">Insights com IA</p>
                  <p className="text-xs text-muted-foreground">Gerar conclusões automáticas</p>
                </div>
              </div>
              <Checkbox checked={includeAIInsights} onCheckedChange={c => setIncludeAIInsights(c as boolean)} />
            </div>

            <Button className="w-full gap-2" size="lg" onClick={handleGenerate} disabled={selectedSectionsCount === 0}>
              <Download className="h-4 w-4" /> Gerar PDF <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </PageWrapper>
  );
}
