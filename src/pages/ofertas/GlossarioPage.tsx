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
  {
    sigla: "Conversão",
    nome: "Taxa de Conversão da Oferta",
    modulo: "Performance de Ofertas",
    formula: "Conversão = (Vendas do SKU em Oferta ÷ Clientes Expostos) × 100",
    benchmark: "≥ 5%",
    explicacao: "Percentual de clientes expostos à oferta que efetivamente compraram o produto. Mede a atratividade real da promoção. Conversão baixa pode indicar preço pouco competitivo ou comunicação ineficaz.",
  },
  {
    sigla: "Sell-through",
    nome: "Sell-through Rate",
    traducao: "Taxa de Venda",
    modulo: "Performance de Ofertas",
    formula: "Sell-through = (Unidades Vendidas ÷ Estoque Disponível) × 100",
    benchmark: "≥ 70%",
    explicacao: "Percentual do estoque destinado à promoção que foi efetivamente vendido. Sell-through < 50% indica excesso de estoque para a demanda gerada ou oferta pouco atrativa.",
  },
  {
    sigla: "Uplift",
    nome: "Uplift de Vendas",
    modulo: "Performance de Ofertas",
    formula: "Uplift = ((Vendas com Oferta − Vendas sem Oferta) ÷ Vendas sem Oferta) × 100",
    benchmark: "≥ 20%",
    explicacao: "Incremento percentual nas vendas atribuído diretamente à oferta, comparado com o baseline de vendas normais. Uplift negativo indica canibalização ou que a oferta não gerou demanda incremental.",
  },
  {
    sigla: "Alcance",
    nome: "Reach da Campanha",
    traducao: "Alcance",
    modulo: "Distribuição",
    explicacao: "Número de clientes únicos que receberam/visualizaram a oferta. Mede a amplitude da distribuição da campanha promocional nos canais (WhatsApp, push, e-mail, encarte).",
  },
  {
    sigla: "Frequência",
    nome: "Frequência de Exposição",
    modulo: "Distribuição",
    formula: "Frequência = Impressões Totais ÷ Alcance",
    benchmark: "2–3× por campanha",
    explicacao: "Número médio de vezes que cada cliente foi exposto à oferta. Frequência muito alta gera fadiga; muito baixa não gera recall. O equilíbrio depende do canal e da duração da campanha.",
  },
  {
    sigla: "Taxa de Entrega",
    nome: "Delivery Rate",
    traducao: "Taxa de Entrega",
    modulo: "Distribuição",
    formula: "Entrega = (Mensagens Entregues ÷ Mensagens Enviadas) × 100",
    benchmark: "≥ 95%",
    explicacao: "Percentual de mensagens que chegaram ao destinatário. Taxa baixa indica problemas com números inválidos, bloqueios ou opt-outs não processados.",
  },
  {
    sigla: "Opt-out Rate",
    nome: "Taxa de Opt-out",
    traducao: "Taxa de Descadastro",
    modulo: "Distribuição",
    formula: "Opt-out = (Descadastros ÷ Mensagens Entregues) × 100",
    benchmark: "≤ 2%",
    explicacao: "Percentual de clientes que solicitaram parar de receber comunicações. Taxa alta indica excesso de frequência, conteúdo irrelevante ou segmentação ruim.",
  },
  {
    sigla: "Margem Promocional",
    nome: "Margem da Oferta",
    modulo: "Financeiro",
    formula: "Margem Promo = (Preço Promocional − Custo) ÷ Preço Promocional × 100",
    benchmark: "≥ 10%",
    explicacao: "Margem bruta do produto durante a vigência da oferta. Ofertas que geram margem negativa devem ser compensadas por volume incremental, verba comercial ou estratégia de tráfego.",
  },
  {
    sigla: "ROI Promo",
    nome: "ROI Promocional",
    modulo: "Financeiro",
    formula: "ROI Promo = (Margem Incremental − Custo da Campanha) ÷ Custo da Campanha × 100",
    benchmark: "≥ 100%",
    explicacao: "Retorno financeiro da campanha promocional considerando apenas a margem incremental (uplift). ROI negativo indica que a promoção destruiu valor — o custo superou o ganho adicional.",
  },
  {
    sigla: "Canibalização",
    nome: "Taxa de Canibalização",
    modulo: "Financeiro",
    formula: "Canibalização = (Queda nas Vendas de Similares ÷ Incremento do SKU Promovido) × 100",
    benchmark: "≤ 30%",
    explicacao: "Percentual do incremento de vendas do produto em oferta que veio às custas de outros produtos da mesma categoria. Alta canibalização indica que a promoção apenas transferiu demanda interna sem gerar crescimento real.",
  },
];

const groupedIndicators = indicators.reduce<Record<string, IndicatorEntry[]>>((acc, ind) => {
  if (!acc[ind.modulo]) acc[ind.modulo] = [];
  acc[ind.modulo].push(ind);
  return acc;
}, {});

const moduleOrder = ["Performance de Ofertas", "Distribuição", "Financeiro"];

export default function GlossarioPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Glossário de Indicadores"
        description="Tradução, explicação e lógica de cálculo de todas as siglas e KPIs do Ofertas"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/app/ofertas/manuais")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
        }
      />

      {moduleOrder.map((modulo) => {
        const items = groupedIndicators[modulo];
        if (!items) return null;
        return (
          <div key={modulo} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-app-ofertas border-b border-border pb-2">{modulo}</h2>
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
                        {ind.formula && (
                          <div className="flex items-start gap-1.5">
                            <span className="font-semibold text-foreground shrink-0">Fórmula:</span>
                            <code className="text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono text-[10px] break-all">{ind.formula}</code>
                          </div>
                        )}
                        {ind.benchmark && (
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground">Meta:</span>
                            <span className="text-app-ofertas font-medium">{ind.benchmark}</span>
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
            <strong className="text-foreground">Fonte:</strong> Especificação formal — Aplicativo Ofertas, NEXUS Platform. Versão 1.0, Março 2026.
          </p>
        </SolidCardContent>
      </SolidCard>
    </div>
  );
}
