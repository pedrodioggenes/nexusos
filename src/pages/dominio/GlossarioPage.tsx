import { PageHeader } from "@/components/ui/page-header";
import { SolidCard, SolidCardContent } from "@/components/ui/solid-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface IndicatorEntry { sigla: string; nome: string; traducao?: string; modulo: string; formula?: string; benchmark?: string; explicacao: string; }

const indicators: IndicatorEntry[] = [
  { sigla: "DRE", nome: "Demonstração do Resultado do Exercício", modulo: "Financeiro",
    explicacao: "Relatório contábil que mostra receitas, custos, despesas e lucro/prejuízo do período. É a visão consolidada da performance financeira do negócio." },
  { sigla: "EBITDA", nome: "Earnings Before Interest, Taxes, Depreciation and Amortization", traducao: "Lucro Antes de Juros, Impostos, Depreciação e Amortização", modulo: "Financeiro",
    formula: "EBITDA = Lucro Operacional + Depreciação + Amortização", benchmark: "≥ 8% da Receita",
    explicacao: "Indicador de geração de caixa operacional. Remove efeitos financeiros e contábeis para mostrar a rentabilidade pura da operação. EBITDA negativo indica que a operação não se sustenta." },
  { sigla: "Margem Líquida", nome: "Net Profit Margin", traducao: "Margem Líquida", modulo: "Financeiro",
    formula: "Margem Líquida = (Lucro Líquido ÷ Receita Líquida) × 100", benchmark: "≥ 3%",
    explicacao: "Percentual da receita que sobra como lucro após todos os custos, despesas, impostos e juros. No varejo supermercadista, margens líquidas de 2–4% são típicas." },
  { sigla: "Margem Bruta", nome: "Gross Margin", traducao: "Margem Bruta", modulo: "Financeiro",
    formula: "Margem Bruta = (Receita − CMV) ÷ Receita × 100", benchmark: "≥ 25%",
    explicacao: "Percentual da receita que sobra após o custo das mercadorias vendidas. Indica o poder de precificação e a eficiência na compra de mercadorias." },
  { sigla: "Ticket Médio", nome: "Average Transaction Value", traducao: "Ticket Médio", modulo: "Vendas",
    formula: "Ticket Médio = Faturamento ÷ Número de Transações", benchmark: "Crescimento mensal",
    explicacao: "Valor médio de cada transação de venda. Aumentar o ticket médio é mais eficiente que aumentar o fluxo de clientes. Estratégias incluem cross-sell, upsell e mix de produtos." },
  { sigla: "SSS", nome: "Same-Store Sales", traducao: "Vendas Mesmas Lojas", modulo: "Vendas",
    formula: "SSS = ((Vendas Período Atual − Vendas Mesmo Período Anterior) ÷ Vendas Período Anterior) × 100", benchmark: "≥ Inflação + 2%",
    explicacao: "Crescimento de vendas comparando apenas lojas que já existiam no período anterior. Exclui o efeito de novas aberturas para mostrar o crescimento orgânico real da rede." },
  { sigla: "Fluxo de Caixa", nome: "Cash Flow", traducao: "Fluxo de Caixa", modulo: "Financeiro",
    explicacao: "Movimentação de entradas e saídas de dinheiro no período. Fluxo de caixa positivo garante capacidade de pagar fornecedores, funcionários e investimentos. Diferente do lucro contábil." },
  { sigla: "Ruptura", nome: "Stockout Rate", traducao: "Taxa de Ruptura", modulo: "Produtos",
    formula: "Ruptura = (SKUs sem Estoque ÷ SKUs Ativos) × 100", benchmark: "≤ 5%",
    explicacao: "Percentual de produtos ativos que estão indisponíveis para venda. Ruptura é a principal causa de perda de vendas e insatisfação do cliente no varejo alimentar." },
  { sigla: "Giro de Estoque", nome: "Inventory Turnover", traducao: "Giro de Estoque", modulo: "Produtos",
    formula: "Giro = CMV ÷ Estoque Médio", benchmark: "≥ 15×/ano",
    explicacao: "Quantas vezes o estoque é completamente renovado por ano. Giro alto indica operação eficiente; baixo indica capital imobilizado. Varia significativamente por categoria." },
  { sigla: "Cobertura", nome: "Days of Supply", traducao: "Cobertura de Estoque", modulo: "Produtos",
    formula: "Cobertura = Estoque Atual ÷ Demanda Média Diária", benchmark: "15–45 dias",
    explicacao: "Quantos dias de venda o estoque atual cobre. Cobertura excessiva imobiliza capital; insuficiente gera ruptura. A meta varia por tipo de produto (perecível vs. seco)." },
  { sigla: "Turnover RH", nome: "Employee Turnover", traducao: "Rotatividade de Pessoal", modulo: "Pessoas",
    formula: "Turnover = ((Admissões + Demissões) ÷ 2 ÷ Headcount Médio) × 100", benchmark: "≤ 3% mensal",
    explicacao: "Taxa de rotatividade de colaboradores. Turnover alto gera custos de recrutamento, treinamento e perda de produtividade. No varejo, taxas acima de 5% mensais indicam problemas de gestão ou remuneração." },
  { sigla: "Absenteísmo", nome: "Absenteeism Rate", traducao: "Taxa de Absenteísmo", modulo: "Pessoas",
    formula: "Absenteísmo = (Horas Ausentes ÷ Horas Previstas) × 100", benchmark: "≤ 3%",
    explicacao: "Percentual de horas não trabalhadas em relação às horas previstas. Inclui faltas, atrasos e saídas antecipadas. Absenteísmo alto reduz produtividade e sobrecarrega a equipe presente." },
  { sigla: "Produtividade", nome: "Revenue per Employee", traducao: "Faturamento por Colaborador", modulo: "Pessoas",
    formula: "Produtividade = Faturamento ÷ Headcount", benchmark: "Crescimento trimestral",
    explicacao: "Receita gerada por cada colaborador. Mede a eficiência da força de trabalho. Produtividade crescente indica ganho de escala; decrescente indica ineficiência operacional." },
];

const groupedIndicators = indicators.reduce<Record<string, IndicatorEntry[]>>((acc, ind) => {
  if (!acc[ind.modulo]) acc[ind.modulo] = [];
  acc[ind.modulo].push(ind);
  return acc;
}, {});

const moduleOrder = ["Financeiro", "Vendas", "Produtos", "Pessoas"];

export default function GlossarioPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <PageHeader title="Glossário de Indicadores" description="Tradução, explicação e lógica de cálculo de todas as siglas e KPIs do Domínio"
        actions={<Button variant="outline" size="sm" onClick={() => navigate("/app/dominio/manuais")}><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Button>} />
      {moduleOrder.map((modulo) => {
        const items = groupedIndicators[modulo];
        if (!items) return null;
        return (
          <div key={modulo} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-app-dominio border-b border-border pb-2">{modulo}</h2>
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
                        {ind.benchmark && <div className="flex items-center gap-1.5"><span className="font-semibold text-foreground">Meta:</span><span className="text-app-dominio font-medium">{ind.benchmark}</span></div>}
                      </div>
                    )}
                  </SolidCardContent>
                </SolidCard>
              ))}
            </div>
          </div>
        );
      })}
      <SolidCard variant="subtle" className="mt-8"><SolidCardContent className="p-4"><p className="text-[11px] text-muted-foreground leading-relaxed"><strong className="text-foreground">Fonte:</strong> Especificação formal — Aplicativo Domínio, NEXUS Platform. Versão 1.0, Março 2026.</p></SolidCardContent></SolidCard>
    </div>
  );
}
