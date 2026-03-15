import { PageHeader } from "@/components/ui/page-header";
import { SolidCard, SolidCardContent } from "@/components/ui/solid-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface IndicatorEntry { sigla: string; nome: string; traducao?: string; modulo: string; formula?: string; benchmark?: string; explicacao: string; }

const indicators: IndicatorEntry[] = [
  { sigla: "Acuracidade", nome: "Inventory Accuracy", traducao: "Acuracidade de Estoque", modulo: "Armazenagem",
    formula: "Acuracidade = (Itens Corretos ÷ Itens Contados) × 100", benchmark: "≥ 98%",
    explicacao: "Percentual de itens cujo estoque físico confere com o estoque no sistema. Acuracidade < 95% indica problemas graves de controle que afetam compras, reposição e financeiro." },
  { sigla: "OTIF CD", nome: "On-Time In-Full (CD)", traducao: "No Prazo e Completo", modulo: "Expedição",
    formula: "OTIF = (Pedidos Completos e No Prazo ÷ Total de Pedidos) × 100", benchmark: "≥ 97%",
    explicacao: "Percentual de ordens de transferência/pedidos entregues às lojas no prazo e com todos os itens. Mede o nível de serviço do CD para a rede de lojas." },
  { sigla: "Giro", nome: "Inventory Turnover", traducao: "Giro de Estoque", modulo: "Armazenagem",
    formula: "Giro = CMV ÷ Estoque Médio", benchmark: "≥ 12×/ano",
    explicacao: "Quantas vezes o estoque do CD é completamente renovado por ano. Giro baixo indica excesso de estoque e capital imobilizado; giro alto indica operação eficiente." },
  { sigla: "FIFO", nome: "First In, First Out", traducao: "Primeiro que Entra, Primeiro que Sai", modulo: "Armazenagem",
    explicacao: "Método de gestão de estoque que garante que os lotes mais antigos sejam expedidos primeiro. Crítico para perecíveis. Violação do FIFO gera perdas por vencimento." },
  { sigla: "Ruptura CD", nome: "Stockout Rate (CD)", traducao: "Taxa de Ruptura", modulo: "Demanda",
    formula: "Ruptura = (SKUs sem Estoque ÷ SKUs Ativos) × 100", benchmark: "≤ 2%",
    explicacao: "Percentual de SKUs ativos que estão com estoque zerado no CD. Ruptura no CD se propaga imediatamente para todas as lojas abastecidas." },
  { sigla: "Nível de Serviço", nome: "Fill Rate", traducao: "Nível de Serviço", modulo: "Demanda",
    formula: "Fill Rate = (Itens Atendidos ÷ Itens Solicitados) × 100", benchmark: "≥ 98%",
    explicacao: "Percentual de itens solicitados pelas lojas que o CD consegue atender. Fill rate < 95% indica problemas de abastecimento ou planejamento de compras." },
  { sigla: "Dock-to-Stock", nome: "Dock-to-Stock Time", traducao: "Tempo Doca-Estoque", modulo: "Recebimento",
    formula: "Tempo em minutos entre chegada no doca e disponibilidade no sistema", benchmark: "≤ 120 min",
    explicacao: "Tempo total desde a chegada do caminhão até a mercadoria estar disponível no estoque do sistema. Inclui conferência, endereçamento e putaway." },
  { sigla: "Shrink Rate", nome: "Shrinkage Rate", traducao: "Taxa de Perda", modulo: "Qualidade",
    formula: "Shrink = (Valor das Perdas ÷ Faturamento) × 100", benchmark: "≤ 1%",
    explicacao: "Percentual do faturamento perdido em avarias, vencimentos, furtos e divergências. Meta do setor supermercadista é < 1%. Acima disso corrói diretamente a margem." },
  { sigla: "Picking Accuracy", nome: "Picking Accuracy", traducao: "Acuracidade de Separação", modulo: "Separação",
    formula: "Acuracidade = (Itens Separados Corretamente ÷ Total de Itens Separados) × 100", benchmark: "≥ 99,5%",
    explicacao: "Percentual de itens separados corretamente na primeira tentativa. Erros de picking geram retrabalho, devoluções e insatisfação das lojas." },
  { sigla: "Curva ABC", nome: "Classificação ABC", modulo: "Demanda",
    explicacao: "Classificação de SKUs por importância: A (20% dos SKUs = 80% do valor), B (30% = 15% do valor), C (50% = 5% do valor). Determina prioridade de reposição, localização no armazém e frequência de contagem cíclica." },
  { sigla: "Wave", nome: "Picking Wave", traducao: "Onda de Separação", modulo: "Separação",
    explicacao: "Agrupamento de múltiplas ordens de transferência em um único lote de separação para otimizar o percurso dos operadores no armazém. Reduz tempo de deslocamento e aumenta produtividade." },
  { sigla: "NC", nome: "Não Conformidade", modulo: "Recebimento",
    formula: "Taxa NC = (Recebimentos com NC ÷ Total de Recebimentos) × 100", benchmark: "≤ 3%",
    explicacao: "Registro de divergências detectadas no recebimento: quantidade errada, avaria, temperatura inadequada, validade curta. Alimenta o scorecard do fornecedor e impacta decisões de compra." },
];

const groupedIndicators = indicators.reduce<Record<string, IndicatorEntry[]>>((acc, ind) => {
  if (!acc[ind.modulo]) acc[ind.modulo] = [];
  acc[ind.modulo].push(ind);
  return acc;
}, {});

const moduleOrder = ["Recebimento", "Armazenagem", "Demanda", "Separação", "Expedição", "Qualidade"];

export default function GlossarioPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <PageHeader title="Glossário de Indicadores" description="Tradução, explicação e lógica de cálculo de todas as siglas e KPIs do CD"
        actions={<Button variant="outline" size="sm" onClick={() => navigate("/app/cd/manuais")}><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Button>} />
      {moduleOrder.map((modulo) => {
        const items = groupedIndicators[modulo];
        if (!items) return null;
        return (
          <div key={modulo} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-app-cd border-b border-border pb-2">{modulo}</h2>
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
                        {ind.benchmark && <div className="flex items-center gap-1.5"><span className="font-semibold text-foreground">Meta:</span><span className="text-app-cd font-medium">{ind.benchmark}</span></div>}
                      </div>
                    )}
                  </SolidCardContent>
                </SolidCard>
              ))}
            </div>
          </div>
        );
      })}
      <SolidCard variant="subtle" className="mt-8"><SolidCardContent className="p-4"><p className="text-[11px] text-muted-foreground leading-relaxed"><strong className="text-foreground">Fonte:</strong> Especificação formal — Aplicativo CD, NEXUS Platform. Versão 1.0, Março 2026.</p></SolidCardContent></SolidCard>
    </div>
  );
}
