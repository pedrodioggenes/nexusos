import { PageHeader } from "@/components/ui/page-header";
import { SolidCard, SolidCardContent } from "@/components/ui/solid-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface IndicatorEntry { sigla: string; nome: string; traducao?: string; modulo: string; formula?: string; benchmark?: string; explicacao: string; }

const indicators: IndicatorEntry[] = [
  { sigla: "Ruptura", nome: "Stockout Rate", traducao: "Taxa de Ruptura", modulo: "Disponibilidade",
    formula: "Ruptura = (SKUs sem Estoque na Gôndola ÷ SKUs Ativos) × 100", benchmark: "≤ 5%",
    explicacao: "Percentual de produtos que deveriam estar na gôndola mas estão indisponíveis. Ruptura é a principal causa de perda de vendas — clientes não encontram o que procuram e compram na concorrência." },
  { sigla: "OSA", nome: "On-Shelf Availability", traducao: "Disponibilidade em Gôndola", modulo: "Disponibilidade",
    formula: "OSA = (SKUs Presentes na Gôndola ÷ SKUs no Planograma) × 100", benchmark: "≥ 95%",
    explicacao: "Percentual de produtos do planograma que estão efetivamente disponíveis na gôndola. Diferente da ruptura de estoque, o OSA mede se o produto está no ponto de venda mesmo que haja estoque no depósito." },
  { sigla: "Cobertura", nome: "Days of Supply", traducao: "Cobertura de Estoque", modulo: "Disponibilidade",
    formula: "Cobertura = Estoque Atual ÷ Demanda Média Diária", benchmark: "3–7 dias (gôndola)",
    explicacao: "Dias de venda que o estoque atual na gôndola cobre. Cobertura < 2 dias indica risco iminente de ruptura; > 10 dias na gôndola pode indicar produto com baixo giro ocupando espaço." },
  { sigla: "FIFO", nome: "First In, First Out", traducao: "Primeiro que Entra, Primeiro que Sai", modulo: "Validade",
    explicacao: "Método de reposição que garante que produtos com validade mais próxima fiquem na frente da gôndola. Violação do FIFO é a principal causa de perdas por vencimento no varejo alimentar." },
  { sigla: "Produtos Próx. Vencimento", nome: "Near-Expiry Items", modulo: "Validade",
    formula: "% Próx. Vencimento = (SKUs com validade < X dias ÷ SKUs Perecíveis) × 100", benchmark: "≤ 3%",
    explicacao: "Percentual de produtos perecíveis com validade dentro da janela de alerta (configurável por categoria). Produtos próximos ao vencimento devem ser priorizados para ação comercial (desconto) ou transferência." },
  { sigla: "Share of Shelf", nome: "Share of Shelf", traducao: "Participação de Prateleira", modulo: "Exposição",
    formula: "SoS = (Frentes do Produto ÷ Total de Frentes da Categoria) × 100", benchmark: "≈ Market Share",
    explicacao: "Percentual do espaço de prateleira ocupado por um produto ou marca em relação ao total da categoria. Idealmente deve ser proporcional ao market share. Desequilíbrio indica oportunidade de otimização de planograma." },
  { sigla: "Planograma", nome: "Planogram Compliance", traducao: "Aderência ao Planograma", modulo: "Exposição",
    formula: "Aderência = (Posições Conforme Planograma ÷ Total de Posições) × 100", benchmark: "≥ 90%",
    explicacao: "Percentual de posições na gôndola que estão de acordo com o planograma definido. Baixa aderência indica reposição desorganizada e pode afetar a experiência do cliente e o sell-through de produtos estratégicos." },
  { sigla: "Tarefas/Hora", nome: "Tasks per Hour", traducao: "Produtividade de Reposição", modulo: "Produtividade",
    formula: "Produtividade = Tarefas Concluídas ÷ Horas Trabalhadas", benchmark: "≥ 15 tarefas/hora",
    explicacao: "Número de tarefas de reposição completadas por hora de trabalho. Mede a eficiência do repositor. Produtividade baixa pode indicar layout ruim, excesso de deslocamento ou falta de organização do depósito." },
  { sigla: "Tempo Médio Tarefa", nome: "Avg Task Duration", traducao: "Tempo Médio por Tarefa", modulo: "Produtividade",
    formula: "TMT = Tempo Total de Reposição ÷ Tarefas Concluídas",
    explicacao: "Tempo médio para completar uma tarefa de reposição. Inclui deslocamento, busca no depósito e organização na gôndola. Usado para dimensionar equipe e definir roteiros otimizados." },
  { sigla: "Comprovação", nome: "Photo Proof Rate", traducao: "Taxa de Comprovação", modulo: "Produtividade",
    formula: "Comprovação = (Tarefas com Foto ÷ Total de Tarefas) × 100", benchmark: "100%",
    explicacao: "Percentual de tarefas de reposição com comprovação fotográfica. Garante que a reposição foi efetivamente realizada e permite auditoria remota da execução." },
];

const groupedIndicators = indicators.reduce<Record<string, IndicatorEntry[]>>((acc, ind) => {
  if (!acc[ind.modulo]) acc[ind.modulo] = [];
  acc[ind.modulo].push(ind);
  return acc;
}, {});

const moduleOrder = ["Disponibilidade", "Validade", "Exposição", "Produtividade"];

export default function GlossarioPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <PageHeader title="Glossário de Indicadores" description="Tradução, explicação e lógica de cálculo de todas as siglas e KPIs do Reposição"
        actions={<Button variant="outline" size="sm" onClick={() => navigate("/app/reposicao/manuais")}><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Button>} />
      {moduleOrder.map((modulo) => {
        const items = groupedIndicators[modulo];
        if (!items) return null;
        return (
          <div key={modulo} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-module-reposicao border-b border-border pb-2">{modulo}</h2>
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
                        {ind.benchmark && <div className="flex items-center gap-1.5"><span className="font-semibold text-foreground">Meta:</span><span className="text-module-reposicao font-medium">{ind.benchmark}</span></div>}
                      </div>
                    )}
                  </SolidCardContent>
                </SolidCard>
              ))}
            </div>
          </div>
        );
      })}
      <SolidCard variant="subtle" className="mt-8"><SolidCardContent className="p-4"><p className="text-[11px] text-muted-foreground leading-relaxed"><strong className="text-foreground">Fonte:</strong> Especificação formal — Aplicativo Reposição, NEXUS Platform. Versão 1.0, Março 2026.</p></SolidCardContent></SolidCard>
    </div>
  );
}
