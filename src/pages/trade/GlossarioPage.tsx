import { PageHeader } from "@/components/ui/page-header";
import { SolidCard, SolidCardContent } from "@/components/ui/solid-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface IndicatorEntry { sigla: string; nome: string; traducao?: string; modulo: string; formula?: string; benchmark?: string; explicacao: string; }

const indicators: IndicatorEntry[] = [
  { sigla: "OTIF", nome: "On-Time In-Full", traducao: "No Prazo e Completo", modulo: "Execução",
    formula: "OTIF = (Pacotes executados no prazo E completos ÷ Total de Pacotes) × 100", benchmark: "≥ 95%",
    explicacao: "Percentual de pacotes de trade marketing entregues simultaneamente no prazo e com todas as ações executadas. Mede a confiabilidade da execução entre empresa e fornecedor." },
  { sigla: "Aderência", nome: "Aderência ao Pacote", modulo: "Execução",
    formula: "Aderência = (Ações Executadas ÷ Ações Contratadas) × 100", benchmark: "≥ 90%",
    explicacao: "Percentual de ações do pacote comercial que foram efetivamente executadas conforme contratado. Aderência baixa indica descumprimento de acordos e risco de perda de verbas." },
  { sigla: "ROI Trade", nome: "ROI de Trade Marketing", modulo: "Retorno",
    formula: "ROI Trade = (Receita Incremental − Investimento Trade) ÷ Investimento Trade × 100", benchmark: "≥ 150%",
    explicacao: "Retorno financeiro das ações de trade marketing. Considera a receita incremental gerada pelas ações (displays, pontas de gôndola, encartes) versus o investimento realizado." },
  { sigla: "Sell-in", nome: "Sell-in", traducao: "Venda ao Varejista", modulo: "Vendas",
    explicacao: "Volume de vendas do fornecedor para o varejista (compras). Sell-in alto sem sell-out proporcional indica acúmulo de estoque e risco de encalhe." },
  { sigla: "Sell-out", nome: "Sell-out", traducao: "Venda ao Consumidor Final", modulo: "Vendas",
    explicacao: "Volume de vendas do varejista para o consumidor final. É o indicador que valida se a ação de trade realmente gerou demanda ou apenas antecipou compras." },
  { sigla: "Sell-in/Sell-out", nome: "Razão Sell-in vs Sell-out", modulo: "Vendas",
    formula: "Razão = Sell-in ÷ Sell-out", benchmark: "≈ 1,0",
    explicacao: "Relação entre volume comprado e vendido. Razão > 1,2 indica excesso de push (estoque crescendo). Razão < 0,8 indica ruptura iminente. O equilíbrio ideal é próximo de 1,0." },
  { sigla: "Verba Contratada", nome: "Verba Trade Contratada", modulo: "Financeiro",
    explicacao: "Valor total de verbas negociadas com fornecedores em pacotes de trade marketing. Inclui bonificações, descontos por exposição, encartes e PDV." },
  { sigla: "Verba Executada", nome: "Verba Trade Realizada", modulo: "Financeiro",
    formula: "Execução = (Verba Realizada ÷ Verba Contratada) × 100", benchmark: "≥ 95%",
    explicacao: "Percentual da verba contratada que foi efetivamente recebida. Diferença entre contratado e realizado indica ações não cumpridas ou condições não atingidas." },
  { sigla: "Comprovação", nome: "Taxa de Comprovação", modulo: "Execução",
    formula: "Comprovação = (Ações com Foto/Evidência ÷ Total de Ações) × 100", benchmark: "100%",
    explicacao: "Percentual de ações de trade que possuem comprovação fotográfica ou documental. Comprovação incompleta pode gerar glosa de verba pelo fornecedor." },
  { sigla: "Checklist Score", nome: "Score do Checklist", modulo: "Execução",
    formula: "Score = (Itens Conformes ÷ Total de Itens) × 100", benchmark: "≥ 85%",
    explicacao: "Percentual de conformidade nos checklists de execução de ponto de venda. Mede se displays, precificação e material de comunicação estão conforme o acordado." },
];

const groupedIndicators = indicators.reduce<Record<string, IndicatorEntry[]>>((acc, ind) => {
  if (!acc[ind.modulo]) acc[ind.modulo] = [];
  acc[ind.modulo].push(ind);
  return acc;
}, {});

const moduleOrder = ["Execução", "Vendas", "Retorno", "Financeiro"];

export default function GlossarioPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <PageHeader title="Glossário de Indicadores" description="Tradução, explicação e lógica de cálculo de todas as siglas e KPIs do Trade"
        actions={<Button variant="outline" size="sm" onClick={() => navigate("/app/trade/manuais")}><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Button>} />
      {moduleOrder.map((modulo) => {
        const items = groupedIndicators[modulo];
        if (!items) return null;
        return (
          <div key={modulo} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-module-trade border-b border-border pb-2">{modulo}</h2>
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
                        {ind.benchmark && <div className="flex items-center gap-1.5"><span className="font-semibold text-foreground">Meta:</span><span className="text-module-trade font-medium">{ind.benchmark}</span></div>}
                      </div>
                    )}
                  </SolidCardContent>
                </SolidCard>
              ))}
            </div>
          </div>
        );
      })}
      <SolidCard variant="subtle" className="mt-8"><SolidCardContent className="p-4"><p className="text-[11px] text-muted-foreground leading-relaxed"><strong className="text-foreground">Fonte:</strong> Especificação formal — Aplicativo Trade, NEXUS Platform. Versão 1.0, Março 2026.</p></SolidCardContent></SolidCard>
    </div>
  );
}
