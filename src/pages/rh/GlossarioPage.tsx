import { PageHeader } from "@/components/ui/page-header";
import { SolidCard, SolidCardContent } from "@/components/ui/solid-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface IndicatorEntry { sigla: string; nome: string; traducao?: string; modulo: string; formula?: string; benchmark?: string; explicacao: string; }

const indicators: IndicatorEntry[] = [
  { sigla: "Turnover", nome: "Employee Turnover Rate", traducao: "Taxa de Rotatividade", modulo: "Gestão de Pessoas",
    formula: "Turnover = ((Admissões + Demissões) ÷ 2 ÷ Headcount Médio) × 100", benchmark: "≤ 3% mensal",
    explicacao: "Taxa de rotatividade de colaboradores. Turnover alto gera custos de recrutamento, treinamento e perda de produtividade. No varejo, taxas acima de 5% mensais indicam problemas de gestão ou remuneração." },
  { sigla: "Absenteísmo", nome: "Absenteeism Rate", traducao: "Taxa de Absenteísmo", modulo: "Gestão de Pessoas",
    formula: "Absenteísmo = (Horas Ausentes ÷ Horas Previstas) × 100", benchmark: "≤ 3%",
    explicacao: "Percentual de horas não trabalhadas em relação às horas previstas. Inclui faltas, atrasos e saídas antecipadas. Absenteísmo alto reduz produtividade e sobrecarrega a equipe." },
  { sigla: "Headcount", nome: "Headcount", traducao: "Quadro de Pessoal", modulo: "Gestão de Pessoas",
    explicacao: "Número total de colaboradores ativos na empresa ou unidade. Acompanhado mensalmente para controle de dimensionamento e custo de pessoal." },
  { sigla: "Custo per Capita", nome: "Cost per Employee", traducao: "Custo por Colaborador", modulo: "Custo de Pessoal",
    formula: "Custo per Capita = Total de Custos de Pessoal ÷ Headcount", benchmark: "Variável por cargo",
    explicacao: "Custo médio mensal de cada colaborador incluindo salário, encargos, benefícios e provisões (férias, 13º). Usado para dimensionar equipes e orçar abertura de lojas." },
  { sigla: "Custo/Faturamento", nome: "Payroll-to-Revenue Ratio", traducao: "Folha sobre Faturamento", modulo: "Custo de Pessoal",
    formula: "Razão = (Folha de Pagamento Total ÷ Faturamento) × 100", benchmark: "≤ 12%",
    explicacao: "Percentual do faturamento comprometido com folha de pagamento. No varejo alimentar, a meta é manter abaixo de 12%. Acima disso indica excesso de pessoal ou baixa produtividade." },
  { sigla: "Horas Extras", nome: "Overtime Rate", traducao: "Taxa de Horas Extras", modulo: "Ponto & Jornada",
    formula: "HE = (Horas Extras Realizadas ÷ Horas Normais) × 100", benchmark: "≤ 5%",
    explicacao: "Percentual de horas extras em relação à jornada normal. Horas extras recorrentes indicam subdimensionamento da equipe ou má distribuição de escalas." },
  { sigla: "Banco de Horas", nome: "Time Bank Balance", traducao: "Saldo de Banco de Horas", modulo: "Ponto & Jornada",
    explicacao: "Saldo acumulado de horas trabalhadas além da jornada que podem ser compensadas com folgas. Saldo muito alto indica risco trabalhista e necessidade de compensação." },
  { sigla: "eNPS", nome: "Employee Net Promoter Score", traducao: "NPS do Colaborador", modulo: "Engajamento",
    formula: "eNPS = % Promotores − % Detratores", benchmark: "≥ 30",
    explicacao: "Mede a satisfação e lealdade dos colaboradores. Baseado na pergunta 'De 0 a 10, quanto você recomendaria a empresa como lugar para trabalhar?'. eNPS negativo indica ambiente de trabalho problemático." },
  { sigla: "Taxa de Aprovação", nome: "Training Pass Rate", traducao: "Taxa de Aprovação em Treinamento", modulo: "Desenvolvimento",
    formula: "Aprovação = (Colaboradores Aprovados ÷ Colaboradores Treinados) × 100", benchmark: "≥ 85%",
    explicacao: "Percentual de colaboradores que atingiram nota mínima em avaliações pós-treinamento. Taxa baixa indica problemas na qualidade do treinamento ou inadequação do conteúdo." },
  { sigla: "Time-to-Hire", nome: "Time to Hire", traducao: "Tempo de Contratação", modulo: "Recrutamento",
    formula: "Tempo médio em dias entre abertura da vaga e contratação", benchmark: "≤ 15 dias",
    explicacao: "Tempo total do processo seletivo. Processos longos aumentam o custo de posições vagas e podem resultar em perda de candidatos qualificados para concorrentes." },
  { sigla: "SLA Férias", nome: "Vacation SLA", traducao: "SLA de Férias", modulo: "Ponto & Jornada",
    formula: "SLA = (Férias Programadas No Prazo ÷ Total de Férias Devidas) × 100", benchmark: "100%",
    explicacao: "Percentual de férias concedidas dentro do período concessivo legal (12 meses após período aquisitivo). Férias vencidas geram risco trabalhista e passivo financeiro." },
];

const groupedIndicators = indicators.reduce<Record<string, IndicatorEntry[]>>((acc, ind) => {
  if (!acc[ind.modulo]) acc[ind.modulo] = [];
  acc[ind.modulo].push(ind);
  return acc;
}, {});

const moduleOrder = ["Gestão de Pessoas", "Custo de Pessoal", "Ponto & Jornada", "Engajamento", "Desenvolvimento", "Recrutamento"];

export default function GlossarioPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <PageHeader title="Glossário de Indicadores" description="Tradução, explicação e lógica de cálculo de todas as siglas e KPIs do RH"
        actions={<Button variant="outline" size="sm" onClick={() => navigate("/app/rh/manuais")}><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Button>} />
      {moduleOrder.map((modulo) => {
        const items = groupedIndicators[modulo];
        if (!items) return null;
        return (
          <div key={modulo} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-module-rh border-b border-border pb-2">{modulo}</h2>
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
                        {ind.benchmark && <div className="flex items-center gap-1.5"><span className="font-semibold text-foreground">Meta:</span><span className="text-module-rh font-medium">{ind.benchmark}</span></div>}
                      </div>
                    )}
                  </SolidCardContent>
                </SolidCard>
              ))}
            </div>
          </div>
        );
      })}
      <SolidCard variant="subtle" className="mt-8"><SolidCardContent className="p-4"><p className="text-[11px] text-muted-foreground leading-relaxed"><strong className="text-foreground">Fonte:</strong> Especificação formal — Aplicativo RH, NEXUS Platform. Versão 1.0, Março 2026.</p></SolidCardContent></SolidCard>
    </div>
  );
}
