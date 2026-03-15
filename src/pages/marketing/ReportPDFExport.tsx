/**
 * ReportPDFExport — Page for generating and previewing professional PDF reports.
 * Demonstrates WBR, MMR, QBR templates with sample data.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";
import { PageWrapper } from "@/components/marketing/PageWrapper";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportPreview } from "@/components/marketing/reports/ReportPreview";
import { WBRDocument, type WBRData } from "@/lib/pdf/templates/wbr-template";
import { MMRDocument, type MMRData } from "@/lib/pdf/templates/mmr-template";
import { QBRDocument, type QBRData } from "@/lib/pdf/templates/qbr-template";

// ── Sample Data ─────────────────────────────────────────
const sampleWBR: WBRData = {
  period: "17 a 23 de Fevereiro de 2026",
  companyName: "Empresa Demo",
  kpis: {
    demandsCreated: 18,
    demandsCompleted: 14,
    campaignsActive: 5,
    budgetUtilization: 62,
    avgCompletionDays: 3.2,
    overdueCount: 2,
  },
  demandsByStatus: [
    { status: "Criada", count: 4 },
    { status: "Em Revisão", count: 6 },
    { status: "Aprovada", count: 14 },
    { status: "Cancelada", count: 1 },
  ],
  campaignProgress: [
    { name: "Carnaval 2026", progress: 85 },
    { name: "Ofertas Semanais", progress: 100 },
    { name: "Páscoa Antecipada", progress: 30 },
    { name: "Dia do Consumidor", progress: 15 },
  ],
  topAlerts: [
    { message: "2 demandas atrasadas na área de Design — prazo vencido há 3 dias.", severity: "danger" },
    { message: "Budget de Tráfego Pago atingiu 88% de utilização.", severity: "warning" },
    { message: "Campanha 'Carnaval 2026' com taxa de engajamento 25% acima da média.", severity: "info" },
  ],
  budgetByCategory: [
    { name: "Tráfego Pago", allocated: 45000, spent: 39600 },
    { name: "Produção de Conteúdo", allocated: 15000, spent: 8200 },
    { name: "Material PDV", allocated: 20000, spent: 12500 },
    { name: "Eventos", allocated: 10000, spent: 3000 },
  ],
  weekHighlights: [
    "Lançamento da campanha Carnaval com peças em 42 lojas",
    "Aprovação de 14 demandas — recorde semanal",
    "Novo template de briefing implementado para agência",
  ],
  insights: [
    {
      title: "Engajamento Carnaval",
      text: "Campanha com performance 25% acima da média. Formato de vídeo curto com maior taxa de compartilhamento.",
      items: ["Escalar formato de Reels", "Replicar para Páscoa"],
      type: "success",
    },
    {
      title: "Atraso em Design",
      text: "2 demandas atrasadas há 3 dias. Gargalo no time de design gráfico por sobrecarga.",
      items: ["Redistribuir demandas", "Avaliar freelancer extra"],
      type: "danger",
    },
    {
      title: "Budget Tráfego",
      text: "Utilização em 88% na 3ª semana. Ritmo atual excederá budget antes do fechamento.",
      items: ["Ajustar bid strategy", "Pausar campanhas de baixo ROI"],
      type: "warning",
    },
    {
      title: "Template de Briefing",
      text: "Novo modelo reduz tempo de criação de briefing de 45min para 15min em média.",
      items: ["Expandir para todas as agências"],
      type: "opportunity",
    },
  ],
};

const sampleMMR: MMRData = {
  period: "Fevereiro 2026",
  companyName: "Empresa Demo",
  executiveSummary:
    "O mês de fevereiro apresentou resultados sólidos com ROI de 245%, impulsionado pela campanha de Carnaval que gerou alcance recorde. O budget foi utilizado de forma eficiente em 74%, com destaque para investimentos em Tráfego Pago e Material PDV. As 67 demandas entregues representam um aumento de 18% sobre janeiro, demonstrando melhoria na produtividade operacional.",
  kpis: {
    roi: 245,
    revenue: 890000,
    totalBudget: 120000,
    budgetSpent: 88800,
    conversions: 3420,
    cac: 26,
    demandsTotal: 78,
    demandsCompleted: 67,
    campaignsLaunched: 8,
    avgSatisfaction: 4.3,
  },
  budgetCategories: [
    { name: "Tráfego Pago", allocated: 45000, spent: 39600 },
    { name: "Produção de Conteúdo", allocated: 15000, spent: 12800 },
    { name: "Material PDV", allocated: 25000, spent: 18400 },
    { name: "Eventos / Ativações", allocated: 20000, spent: 12000 },
    { name: "Mídia Offline", allocated: 15000, spent: 6000 },
  ],
  campaignResults: [
    { name: "Carnaval 2026", type: "Sazonal", status: "Ativa", reach: 520000, investment: 35000, roi: 420 },
    { name: "Ofertas da Semana", type: "Promocional", status: "Recorrente", reach: 180000, investment: 12000, roi: 180 },
    { name: "Dia do Consumidor", type: "Sazonal", status: "Planejada", reach: 0, investment: 8000 },
    { name: "Institucional Fev", type: "Institucional", status: "Concluída", reach: 95000, investment: 5000, roi: 80 },
  ],
  demandMetrics: {
    avgDaysToComplete: 4.1,
    byType: [
      { type: "Social Media", count: 28 },
      { type: "Design", count: 22 },
      { type: "Copywriting", count: 15 },
      { type: "Vídeo", count: 8 },
      { type: "Tráfego", count: 5 },
    ],
    byPriority: [
      { priority: "Baixa", count: 12 },
      { priority: "Média", count: 35 },
      { priority: "Alta", count: 22 },
      { priority: "Urgente", count: 9 },
    ],
  },
  storeRanking: [
    { name: "Loja Centro", score: 95 },
    { name: "Loja Shopping", score: 88 },
    { name: "Loja Bairro Norte", score: 82 },
    { name: "Loja Matriz", score: 76 },
    { name: "Loja Sul", score: 68 },
  ],
  recommendations: [
    "Aumentar budget de Tráfego Pago em 15% para março — canal com melhor ROI",
    "Reduzir prazo médio de demandas urgentes — meta de 2 dias úteis",
    "Escalar formato de vídeo curto — engajamento 3x superior a estáticos",
    "Revisar SLA da agência para entregas de Material PDV — 3 atrasos no mês",
  ],
  insights: [
    {
      title: "ROI Excepcional",
      text: "ROI de 245% no mês, puxado pelo Carnaval. Melhor resultado desde o início das operações.",
      items: ["Documentar estratégia para replicar"],
      type: "success",
    },
    {
      title: "Vídeo Curto em Alta",
      text: "Formatos de vídeo curto geraram 3x mais engajamento que posts estáticos no Instagram.",
      items: ["Aumentar produção de Reels e TikTok", "Treinar equipe interna"],
      type: "opportunity",
    },
    {
      title: "SLA da Agência",
      text: "3 entregas de Material PDV com atraso — impacto em ativações de loja.",
      items: ["Reunião de alinhamento", "Avaliar penalidades contratuais"],
      type: "warning",
    },
    {
      title: "Loja Sul Abaixo",
      text: "Score de execução de apenas 68%. Materiais não aplicados corretamente.",
      items: ["Auditoria presencial", "Treinamento de equipe local"],
      type: "danger",
    },
  ],
};

const sampleQBR: QBRData = {
  period: "Q1 2026",
  quarter: "1º Trimestre",
  companyName: "Empresa Demo",
  executiveSummary:
    "O primeiro trimestre de 2026 consolidou a estratégia de marketing omnichannel com ROI médio de 198%, representando crescimento de 35% sobre o Q4 2025. A receita total de R$ 2.4M foi impulsionada pelas campanhas sazonais de Carnaval e Dia do Consumidor. O CAC médio se manteve em R$ 28, dentro da meta de R$ 30. A taxa de entrega de demandas atingiu 86%, com 204 demandas concluídas das 237 criadas no período.",
  kpis: {
    roi: 198,
    totalRevenue: 2400000,
    totalInvestment: 340000,
    totalConversions: 12150,
    avgCac: 28,
    avgLtv: 420,
    demandsCompleted: 204,
    demandsTotal: 237,
    campaignsTotal: 22,
    experimentsRun: 6,
  },
  monthlyTrend: [
    { month: "Janeiro", revenue: 680000, investment: 95000, roi: 168 },
    { month: "Fevereiro", revenue: 890000, investment: 120000, roi: 245 },
    { month: "Março", revenue: 830000, investment: 125000, roi: 182 },
  ],
  topCampaigns: [
    { name: "Carnaval 2026", roi: 420, investment: 35000, revenue: 182000 },
    { name: "Dia do Consumidor", roi: 310, investment: 28000, revenue: 114800 },
    { name: "Ofertas Semanais (Jan-Mar)", roi: 195, investment: 48000, revenue: 141600 },
    { name: "Páscoa Antecipada", roi: 150, investment: 22000, revenue: 55000 },
  ],
  channelPerformance: [
    { channel: "Google Ads", investment: 85000, revenue: 420000, conversions: 3800 },
    { channel: "Meta Ads", investment: 72000, revenue: 340000, conversions: 4200 },
    { channel: "PDV / Material", investment: 65000, revenue: 580000, conversions: 2100 },
    { channel: "E-mail Marketing", investment: 8000, revenue: 95000, conversions: 1200 },
    { channel: "Mídia Offline", investment: 45000, revenue: 180000, conversions: 850 },
  ],
  budgetVsActual: [
    { category: "Tráfego Pago", planned: 130000, actual: 157000 },
    { category: "Produção", planned: 50000, actual: 42000 },
    { category: "Material PDV", planned: 70000, actual: 65000 },
    { category: "Eventos", planned: 40000, actual: 38000 },
    { category: "Mídia Offline", planned: 50000, actual: 45000 },
  ],
  experimentResults: [
    {
      title: "Vídeo vs Estático",
      hypothesis: "Vídeos curtos geram 2x mais engajamento",
      result: "3.2x mais engajamento",
      decision: "Escalar",
    },
    {
      title: "CTA no WhatsApp",
      hypothesis: "CTA direto no WhatsApp converte mais",
      result: "+45% conversão",
      decision: "Adotar",
    },
    {
      title: "Horário de Postagem",
      hypothesis: "Posts às 19h performam melhor",
      result: "Sem diferença significativa",
      decision: "Manter atual",
    },
  ],
  strategicGoals: [
    { goal: "Atingir ROI médio de 200%", target: "200%", actual: "198%", progress: 99 },
    { goal: "Reduzir CAC para R$ 25", target: "R$ 25", actual: "R$ 28", progress: 72 },
    { goal: "Completar 90% das demandas", target: "90%", actual: "86%", progress: 86 },
    { goal: "Lançar 20+ campanhas", target: "20", actual: "22", progress: 100 },
    { goal: "Executar 5+ experimentos", target: "5", actual: "6", progress: 100 },
  ],
  insights: [
    {
      title: "Crescimento Consistente",
      text: "ROI cresceu 35% vs Q4 2025. Estratégia omnichannel mostrando resultados sustentáveis.",
      items: ["Manter investimento nos canais atuais", "Documentar playbook"],
      type: "success",
    },
    {
      title: "CAC Acima da Meta",
      text: "CAC em R$ 28, 12% acima da meta de R$ 25. Principal driver: custo de Google Ads.",
      items: ["Otimizar segmentação", "Testar novas audiências"],
      type: "warning",
    },
    {
      title: "PDV com Maior ROI",
      text: "Canal PDV/Material com receita de R$ 580K — maior retorno por real investido.",
      items: ["Expandir programa para novas lojas", "Aumentar frequência de materiais"],
      type: "opportunity",
    },
    {
      title: "Taxa de Entrega",
      text: "86% de demandas entregues — abaixo da meta de 90%. Gargalo em demandas de vídeo.",
      items: ["Contratar editor de vídeo", "Redefinir prioridades"],
      type: "danger",
    },
  ],
  nextQuarterPriorities: [
    "Foco em redução do CAC para R$ 25 — otimizar segmentações de tráfego",
    "Escalar produção de vídeo curto — meta de 60% do conteúdo em vídeo",
    "Implementar automação de e-mail marketing para base de clientes",
    "Expandir programa de fidelidade para 5 lojas piloto",
    "Iniciar planejamento da campanha de Dia das Mães (maior do ano)",
  ],
};

// ── Page Component ──────────────────────────────────────
export default function ReportPDFExport() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("wbr");

  return (
    <PageWrapper
      title="Relatórios PDF Profissionais"
      subtitle="Geração de relatórios vetoriais com qualidade editorial"
      icon={<FileText className="h-5 w-5 text-app-gestao" />}
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/app/marketing/relatorios")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="wbr" className="gap-2 text-xs">
            WBR
            <Badge variant="secondary" className="text-[9px] px-1.5">Semanal</Badge>
          </TabsTrigger>
          <TabsTrigger value="mmr" className="gap-2 text-xs">
            MMR
            <Badge variant="secondary" className="text-[9px] px-1.5">Mensal</Badge>
          </TabsTrigger>
          <TabsTrigger value="qbr" className="gap-2 text-xs">
            QBR
            <Badge variant="secondary" className="text-[9px] px-1.5">Trimestral</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wbr">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly Business Review</CardTitle>
              <CardDescription>
                Revisão semanal com foco operacional — KPIs, demandas, campanhas e alertas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportPreview
                document={<WBRDocument data={sampleWBR} />}
                fileName={`WBR-${sampleWBR.period.replace(/\s/g, "-")}.pdf`}
                label="WBR"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mmr">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Marketing Review</CardTitle>
              <CardDescription>
                Relatório mensal completo com análise de ROI, budget, campanhas e operação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportPreview
                document={<MMRDocument data={sampleMMR} />}
                fileName={`MMR-${sampleMMR.period.replace(/\s/g, "-")}.pdf`}
                label="MMR"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qbr">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quarterly Business Review</CardTitle>
              <CardDescription>
                Análise trimestral estratégica com tendências, metas, experimentos e recomendações.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportPreview
                document={<QBRDocument data={sampleQBR} />}
                fileName={`QBR-${sampleQBR.quarter}-2026.pdf`}
                label="QBR"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}
