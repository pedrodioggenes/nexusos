import { PageHeader } from "@/components/ui/page-header";
import { SolidCard, SolidCardContent } from "@/components/ui/solid-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface IndicatorEntry { sigla: string; nome: string; traducao?: string; modulo: string; formula?: string; benchmark?: string; explicacao: string; }

const indicators: IndicatorEntry[] = [
  { sigla: "NPS", nome: "Net Promoter Score", traducao: "Índice de Recomendação", modulo: "Satisfação",
    formula: "NPS = % Promotores (9–10) − % Detratores (0–6)", benchmark: "≥ 50",
    explicacao: "Mede a probabilidade de um cliente recomendar a empresa. NPS > 50 é considerado excelente. Clientes promotores geram crescimento orgânico; detratores geram churn e reputação negativa." },
  { sigla: "CSAT", nome: "Customer Satisfaction Score", traducao: "Índice de Satisfação", modulo: "Satisfação",
    formula: "CSAT = (Respostas Satisfeitas ÷ Total de Respostas) × 100", benchmark: "≥ 85%",
    explicacao: "Percentual de clientes que se declararam satisfeitos ou muito satisfeitos em pesquisas pontuais. Mede a satisfação transacional (após uma compra ou atendimento específico)." },
  { sigla: "CES", nome: "Customer Effort Score", traducao: "Índice de Esforço do Cliente", modulo: "Satisfação",
    formula: "CES = Média das notas de esforço (1–7)", benchmark: "≤ 3",
    explicacao: "Mede o esforço que o cliente precisa fazer para resolver um problema ou completar uma transação. Quanto menor o esforço, maior a fidelização. CES alto indica processos burocráticos ou atendimento ineficiente." },
  { sigla: "Churn", nome: "Churn Rate", traducao: "Taxa de Perda de Clientes", modulo: "Retenção",
    formula: "Churn = (Clientes Perdidos no Período ÷ Clientes no Início) × 100", benchmark: "≤ 5% mensal",
    explicacao: "Percentual de clientes que deixaram de comprar no período. No varejo alimentar, cliente é considerado perdido quando não compra há mais de 60 dias. Reduzir churn é mais rentável que adquirir novos clientes." },
  { sigla: "LTV", nome: "Lifetime Value", traducao: "Valor do Tempo de Vida", modulo: "Retenção",
    formula: "LTV = Ticket Médio × Frequência de Compra × Tempo de Retenção (meses)", benchmark: "Crescimento contínuo",
    explicacao: "Receita total esperada de um cliente durante todo o relacionamento. Clientes com alto LTV merecem ações de retenção personalizadas; baixo LTV pode indicar oportunidade de cross-sell." },
  { sigla: "RFM", nome: "Recency, Frequency, Monetary", traducao: "Recência, Frequência, Valor", modulo: "Segmentação",
    explicacao: "Modelo de segmentação que classifica clientes em três dimensões: Recência (quando foi a última compra), Frequência (quantas vezes compra) e Valor Monetário (quanto gasta). Cada dimensão recebe nota 1–5. Combinações definem segmentos como Champions (555), At Risk (255), Lost (111)." },
  { sigla: "Ticket Médio", nome: "Average Transaction Value", traducao: "Ticket Médio", modulo: "Segmentação",
    formula: "Ticket Médio = Faturamento ÷ Transações", benchmark: "Crescimento vs. período anterior",
    explicacao: "Valor médio gasto por transação. Usado para segmentar clientes e definir estratégias de upsell. Aumento de ticket médio é mais eficiente que aumento de fluxo para crescer receita." },
  { sigla: "Frequência", nome: "Purchase Frequency", traducao: "Frequência de Compra", modulo: "Segmentação",
    formula: "Frequência = Transações ÷ Clientes Únicos (no período)", benchmark: "≥ 4×/mês",
    explicacao: "Número médio de vezes que um cliente compra por mês. Alta frequência indica fidelidade; queda de frequência é sinal precoce de churn." },
  { sigla: "TMR", nome: "Average Resolution Time", traducao: "Tempo Médio de Resolução", modulo: "Atendimento",
    formula: "TMR = Σ Tempo de Resolução ÷ Total de Tickets Resolvidos", benchmark: "≤ 24 horas",
    explicacao: "Tempo médio para resolver um ticket de atendimento do início ao fim. TMR alto indica gargalos no processo, falta de autonomia do atendente ou problemas recorrentes sem solução estrutural." },
  { sigla: "FCR", nome: "First Contact Resolution", traducao: "Resolução no Primeiro Contato", modulo: "Atendimento",
    formula: "FCR = (Tickets Resolvidos no 1° Contato ÷ Total de Tickets) × 100", benchmark: "≥ 70%",
    explicacao: "Percentual de tickets resolvidos já no primeiro contato do cliente. FCR alto indica equipe bem treinada e processos eficientes. Cada contato adicional aumenta o custo de atendimento e a insatisfação." },
  { sigla: "Volume de Tickets", nome: "Ticket Volume", modulo: "Atendimento",
    explicacao: "Número total de tickets abertos no período. Acompanhado por canal (WhatsApp, telefone, e-mail, loja). Crescimento sem aumento proporcional de clientes indica problemas de qualidade." },
];

const groupedIndicators = indicators.reduce<Record<string, IndicatorEntry[]>>((acc, ind) => {
  if (!acc[ind.modulo]) acc[ind.modulo] = [];
  acc[ind.modulo].push(ind);
  return acc;
}, {});

const moduleOrder = ["Satisfação", "Retenção", "Segmentação", "Atendimento"];

export default function GlossarioPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <PageHeader title="Glossário de Indicadores" description="Tradução, explicação e lógica de cálculo de todas as siglas e KPIs do Cliente"
        actions={<Button variant="outline" size="sm" onClick={() => navigate("/app/cliente/manuais")}><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Button>} />
      {moduleOrder.map((modulo) => {
        const items = groupedIndicators[modulo];
        if (!items) return null;
        return (
          <div key={modulo} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-app-cliente border-b border-border pb-2">{modulo}</h2>
            <div className="grid gap-3">
              {items.map((ind) => (
                <SolidCard key={ind.sigla} variant="subtle">
                  <SolidCardContent className="p-4 space-y-2">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-sm font-bold text-foreground font-mono bg-muted px-2 py-0.5 rounded">{ind.sigla}</span>
                      <span className="text-sm font-semibold text-foreground">{ind.nome}</span>
                      {ind.traducao && <span className="text-xs text-muted-foreground italic">({ind.traducao})</span>}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{ind.explicacao}</p>
                    {(ind.formula || ind.benchmark) && (
                      <div className={cn("flex flex-wrap gap-3 pt-1 text-[11px]")}>
                        {ind.formula && <div className="flex items-start gap-1.5"><span className="font-semibold text-foreground shrink-0">Fórmula:</span><code className="text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono text-[10px] break-all">{ind.formula}</code></div>}
                        {ind.benchmark && <div className="flex items-center gap-1.5"><span className="font-semibold text-foreground">Meta:</span><span className="text-app-cliente font-medium">{ind.benchmark}</span></div>}
                      </div>
                    )}
                  </SolidCardContent>
                </SolidCard>
              ))}
            </div>
          </div>
        );
      })}
      <SolidCard variant="subtle" className="mt-8"><SolidCardContent className="p-4"><p className="text-[11px] text-muted-foreground leading-relaxed"><strong className="text-foreground">Fonte:</strong> Especificação formal — Aplicativo Cliente, NEXUS Platform. Versão 1.0, Março 2026.</p></SolidCardContent></SolidCard>
    </div>
  );
}
