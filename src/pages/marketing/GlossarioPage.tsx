import { PageHeader } from "@/components/ui/page-header";
import { SolidCard, SolidCardContent } from "@/components/ui/solid-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface IndicatorEntry {
  sigla: string;
  nome: string;
  traducao?: string;
  modulo: string;
  formula?: string;
  benchmark?: string;
  explicacao: string;
}

const indicators: IndicatorEntry[] = [
  // --- ROI & Retorno ---
  {
    sigla: "ROI",
    nome: "Return on Investment",
    traducao: "Retorno sobre Investimento",
    modulo: "Retorno & Performance",
    formula: "ROI = (Receita − Investimento) ÷ Investimento × 100",
    benchmark: "≥ 300%",
    explicacao: "Mede o retorno financeiro de cada real investido em marketing. ROI de 300% significa que cada R$1 investido gerou R$3 de receita líquida. É o indicador-chave para justificar orçamento e priorizar canais.",
  },
  {
    sigla: "ROAS",
    nome: "Return on Ad Spend",
    traducao: "Retorno sobre Gasto em Mídia",
    modulo: "Retorno & Performance",
    formula: "ROAS = Receita Gerada ÷ Gasto em Mídia",
    benchmark: "≥ 4:1",
    explicacao: "Mede especificamente o retorno sobre investimento em mídia paga (Google Ads, Meta Ads, etc.). ROAS de 4:1 significa que cada R$1 em mídia gera R$4 de receita. Diferente do ROI, não considera custos operacionais — apenas gasto direto em anúncios.",
  },
  // --- Aquisição ---
  {
    sigla: "CAC",
    nome: "Customer Acquisition Cost",
    traducao: "Custo de Aquisição de Cliente",
    modulo: "Aquisição",
    formula: "CAC = Total Investido em Aquisição ÷ Novos Clientes Adquiridos",
    benchmark: "< LTV ÷ 3",
    explicacao: "Custo médio para conquistar um novo cliente. Inclui mídia, equipe, ferramentas e produção de conteúdo. O CAC deve ser, no máximo, 1/3 do LTV para garantir sustentabilidade. CAC crescente indica ineficiência nos canais de aquisição.",
  },
  {
    sigla: "CPL",
    nome: "Cost per Lead",
    traducao: "Custo por Lead",
    modulo: "Aquisição",
    formula: "CPL = Investimento na Campanha ÷ Leads Gerados",
    benchmark: "Varia por segmento",
    explicacao: "Custo médio para gerar um lead qualificado. Usado para avaliar a eficiência de campanhas de geração de demanda. CPL alto pode indicar segmentação ruim ou criativo pouco atrativo.",
  },
  {
    sigla: "CPC",
    nome: "Cost per Click",
    traducao: "Custo por Clique",
    modulo: "Aquisição",
    formula: "CPC = Gasto em Mídia ÷ Cliques Recebidos",
    benchmark: "Varia por plataforma",
    explicacao: "Custo médio de cada clique em anúncios pagos. CPC alto pode indicar alta concorrência no leilão de anúncios ou baixa qualidade do criativo/landing page.",
  },
  {
    sigla: "CPM",
    nome: "Cost per Mille",
    traducao: "Custo por Mil Impressões",
    modulo: "Aquisição",
    formula: "CPM = (Gasto em Mídia ÷ Impressões) × 1000",
    benchmark: "Varia por plataforma",
    explicacao: "Custo para atingir mil impressões de um anúncio. Usado para avaliar a eficiência de campanhas de awareness e branding. CPM baixo com alta frequência pode indicar saturação da audiência.",
  },
  // --- Engajamento ---
  {
    sigla: "CTR",
    nome: "Click-Through Rate",
    traducao: "Taxa de Cliques",
    modulo: "Engajamento",
    formula: "CTR = (Cliques ÷ Impressões) × 100",
    benchmark: "≥ 2% (search); ≥ 0,5% (display)",
    explicacao: "Percentual de pessoas que clicam no anúncio após vê-lo. CTR alto indica boa relevância do criativo e segmentação. CTR baixo sugere revisão do copy, visual ou público-alvo.",
  },
  {
    sigla: "Taxa de Conversão",
    nome: "Conversion Rate",
    traducao: "Taxa de Conversão",
    modulo: "Engajamento",
    formula: "Conversão = (Ações Realizadas ÷ Visitantes) × 100",
    benchmark: "≥ 3% (e-commerce); ≥ 10% (landing page)",
    explicacao: "Percentual de visitantes que realizam a ação desejada (compra, cadastro, download). É o indicador mais direto da eficácia de uma campanha ou página.",
  },
  {
    sigla: "Bounce Rate",
    nome: "Bounce Rate",
    traducao: "Taxa de Rejeição",
    modulo: "Engajamento",
    formula: "Bounce Rate = (Sessões de uma única página ÷ Total de Sessões) × 100",
    benchmark: "≤ 40%",
    explicacao: "Percentual de visitantes que saem do site sem interagir. Bounce rate alto indica problemas de UX, conteúdo irrelevante ou tempo de carregamento lento.",
  },
  // --- Valor do Cliente ---
  {
    sigla: "LTV",
    nome: "Lifetime Value",
    traducao: "Valor do Tempo de Vida do Cliente",
    modulo: "Valor do Cliente",
    formula: "LTV = Ticket Médio × Frequência de Compra × Tempo de Retenção",
    benchmark: "≥ 3× CAC",
    explicacao: "Receita total esperada de um cliente durante todo o relacionamento com a empresa. LTV alto justifica maior investimento em aquisição. A relação LTV:CAC deve ser de pelo menos 3:1.",
  },
  {
    sigla: "Churn Rate",
    nome: "Churn Rate",
    traducao: "Taxa de Cancelamento",
    modulo: "Valor do Cliente",
    formula: "Churn = (Clientes Perdidos no Período ÷ Clientes no Início) × 100",
    benchmark: "≤ 5% mensal",
    explicacao: "Percentual de clientes que deixam de comprar ou cancelam no período. Churn alto corrói o LTV e aumenta a pressão sobre aquisição. Reduzir churn costuma ser mais rentável que adquirir novos clientes.",
  },
  // --- Mídia & Alcance ---
  {
    sigla: "Alcance",
    nome: "Reach",
    traducao: "Alcance",
    modulo: "Mídia & Alcance",
    explicacao: "Número de pessoas únicas que viram o conteúdo ou anúncio. Diferente de impressões (que contam visualizações repetidas). Alcance mede a amplitude da distribuição da mensagem.",
  },
  {
    sigla: "Frequência",
    nome: "Frequency",
    traducao: "Frequência",
    modulo: "Mídia & Alcance",
    formula: "Frequência = Impressões ÷ Alcance",
    benchmark: "2–4× (ideal)",
    explicacao: "Número médio de vezes que cada pessoa viu o anúncio. Frequência muito alta causa fadiga de anúncio; muito baixa não gera lembrança. O equilíbrio ideal depende do objetivo da campanha.",
  },
  {
    sigla: "SOV",
    nome: "Share of Voice",
    traducao: "Participação de Voz",
    modulo: "Mídia & Alcance",
    formula: "SOV = (Impressões da Marca ÷ Total de Impressões do Segmento) × 100",
    benchmark: "≥ Market Share",
    explicacao: "Participação da marca no total de mídia do segmento. SOV maior que market share tende a gerar crescimento; menor tende a gerar perda. É a referência para dimensionar investimento em mídia.",
  },
  // --- Orçamento ---
  {
    sigla: "Budget Burn Rate",
    nome: "Taxa de Consumo do Orçamento",
    modulo: "Gestão de Orçamento",
    formula: "Burn Rate = Gasto Acumulado ÷ Orçamento Total × 100",
    benchmark: "Proporcional ao período",
    explicacao: "Percentual do orçamento já consumido no período. Permite projetar se o orçamento será suficiente até o final do ciclo ou se precisa de ajuste. Burn rate muito acelerado no início indica risco de ficar sem verba.",
  },
  {
    sigla: "CPA",
    nome: "Cost per Acquisition",
    traducao: "Custo por Aquisição",
    modulo: "Gestão de Orçamento",
    formula: "CPA = Investimento Total ÷ Conversões",
    benchmark: "≤ Margem do Produto",
    explicacao: "Custo para gerar uma conversão (venda, cadastro). Diferente do CAC que mede cliente novo, o CPA mede qualquer conversão definida como objetivo. Deve ser menor que a margem do produto para ser sustentável.",
  },
];

const groupedIndicators = indicators.reduce<Record<string, IndicatorEntry[]>>(
  (acc, ind) => {
    if (!acc[ind.modulo]) acc[ind.modulo] = [];
    acc[ind.modulo].push(ind);
    return acc;
  },
  {}
);

const moduleOrder = [
  "Retorno & Performance",
  "Aquisição",
  "Engajamento",
  "Valor do Cliente",
  "Mídia & Alcance",
  "Gestão de Orçamento",
];

export default function GlossarioPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Glossário de Indicadores"
        description="Tradução, explicação e lógica de cálculo de todas as siglas e KPIs do Marketing"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/app/marketing/manuais")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        }
      />

      {moduleOrder.map((modulo) => {
        const items = groupedIndicators[modulo];
        if (!items) return null;

        return (
          <div key={modulo} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-app-gestao border-b border-border pb-2">
              {modulo}
            </h2>
            <div className="grid gap-3">
              {items.map((ind) => (
                <SolidCard key={ind.sigla} variant="subtle">
                  <SolidCardContent className="p-4 space-y-2">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-sm font-bold text-foreground font-mono bg-muted px-2 py-0.5 rounded">
                        {ind.sigla}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {ind.nome}
                      </span>
                      {ind.traducao && (
                        <span className="text-xs text-muted-foreground italic">
                          ({ind.traducao})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {ind.explicacao}
                    </p>
                    {(ind.formula || ind.benchmark) && (
                      <div className={cn("flex flex-wrap gap-3 pt-1 text-[11px]")}>
                        {ind.formula && (
                          <div className="flex items-start gap-1.5">
                            <span className="font-semibold text-foreground shrink-0">Fórmula:</span>
                            <code className="text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono text-[10px] break-all">
                              {ind.formula}
                            </code>
                          </div>
                        )}
                        {ind.benchmark && (
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground">Meta:</span>
                            <span className="text-app-gestao font-medium">{ind.benchmark}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </SolidCardContent>
                </SolidCard>
              ))}
            </div>
          </div>
        );
      })}

      <SolidCard variant="subtle" className="mt-8">
        <SolidCardContent className="p-4">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Fonte:</strong> Especificação formal — Aplicativo Marketing, NEXUS Platform.
            Versão 1.0, Março 2026.
          </p>
        </SolidCardContent>
      </SolidCard>
    </div>
  );
}
