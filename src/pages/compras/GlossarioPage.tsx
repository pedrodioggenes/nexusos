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
  // --- Painel Executivo ---
  {
    sigla: "DPO",
    nome: "Days Payable Outstanding",
    traducao: "Dias Médios de Pagamento a Fornecedores",
    modulo: "Painel Executivo",
    formula: "DPO = (Contas a Pagar Médias ÷ CMV) × T",
    benchmark: "≥ 30 dias",
    explicacao:
      "Mede quantos dias, em média, a empresa leva para pagar seus fornecedores após receber as mercadorias. Quanto maior o DPO, mais tempo o capital de giro fica disponível. É o principal instrumento de gestão de caixa no lado das compras. Se o DPO cai abruptamente, pode indicar perda de poder de negociação ou mudança de política de pagamento.",
  },
  {
    sigla: "COGS",
    nome: "Cost of Goods Sold",
    traducao: "Custo das Mercadorias Vendidas (CMV)",
    modulo: "Painel Executivo",
    explicacao:
      "Valor total das mercadorias vendidas no período. Usado como denominador em diversos KPIs financeiros (DPO, DIO, Giro). Não inclui despesas operacionais — apenas o custo direto de aquisição dos produtos vendidos.",
  },
  {
    sigla: "Desembolso Projetado",
    nome: "Projeção de Desembolso",
    modulo: "Painel Executivo",
    formula: "Σ V_oc × 1[vencimento ∈ [d1, d2]]",
    benchmark: "≤ caixa disponível",
    explicacao:
      "Soma do valor de todas as Ordens de Compra aprovadas cujos vencimentos caem dentro das janelas de 0–15, 0–30, 31–60 e 61–90 dias. Permite ao CFO antecipar necessidades de caixa e evitar surpresas de fluxo.",
  },
  // --- Scorecard de Fornecedor ---
  {
    sigla: "OTIF",
    nome: "On-Time In-Full",
    traducao: "No Prazo e Completo",
    modulo: "Scorecard de Fornecedor",
    formula: "OTIF = (OCs no prazo E na quantidade ÷ Total de OCs) × 100",
    benchmark: "≥ 95%",
    explicacao:
      "Percentual de Ordens de Compra entregues simultaneamente no prazo (tolerância de 1 dia útil) e na quantidade correta (tolerância de 2%). As duas condições devem ser verdadeiras ao mesmo tempo — uma entrega no prazo mas com falta de produto NÃO conta como OTIF positivo.",
  },
  {
    sigla: "TDR",
    nome: "Taxa de Divergência de Recebimento",
    modulo: "Scorecard de Fornecedor",
    formula: "TDR = (OCs com divergência ÷ Total de OCs) × 100",
    benchmark: "≤ 3%",
    explicacao:
      "Percentual de Ordens de Compra que apresentaram alguma divergência no recebimento (quantidade errada, avaria, validade inadequada, preço diferente). Indica a confiabilidade operacional do fornecedor. Acima de 3% gera alerta.",
  },
  {
    sigla: "Score Composto",
    nome: "Score Composto do Fornecedor",
    modulo: "Scorecard de Fornecedor",
    formula: "S = Σ (w_d × σ_d(x_d)) para 5 dimensões",
    benchmark: "≥ 80 = Parceiro",
    explicacao:
      "Nota de 0 a 100 que consolida cinco dimensões do fornecedor: Preço (competitividade), Pontualidade (OTIF), Qualidade (taxa de divergência), Responsividade (tempo de resposta) e Condições Comerciais (verbas e prazos). Cada dimensão tem peso configurável, e a soma dos pesos é sempre 100%. Classifica o fornecedor como Crítico (<50), Regular (50–69), Bom (70–79) ou Parceiro (≥80).",
  },
  {
    sigla: "ICF",
    nome: "Índice de Concentração de Fornecedor",
    modulo: "Scorecard de Fornecedor",
    formula: "ICF = (Volume do maior fornecedor ÷ Volume total da categoria) × 100",
    benchmark: "≤ 60%",
    explicacao:
      "Mede o grau de dependência de um único fornecedor dentro de uma categoria. Quando o ICF ultrapassa 60%, indica risco de supply: se esse fornecedor falhar, a categoria inteira pode sofrer ruptura. É um alerta para diversificação da base de fornecedores.",
  },
  // --- Ordem de Compra ---
  {
    sigla: "OC",
    nome: "Ordem de Compra",
    modulo: "Ordem de Compra Inteligente",
    explicacao:
      "Documento formal que registra a intenção de compra: fornecedor, itens, quantidades, preços negociados, prazo de pagamento e data prevista de entrega. No Compras, a OC é mais que um documento — é uma ferramenta de decisão financeira que calcula em tempo real o impacto no GMROI, no CCC e no PPV antes da confirmação.",
  },
  {
    sigla: "PPV",
    nome: "Purchase Price Variance",
    traducao: "Variação de Preço de Compra",
    modulo: "Ordem de Compra Inteligente",
    formula: "PPV = (Preço de Referência − Preço Negociado) × Quantidade",
    benchmark: "≥ 0 (positivo = economia)",
    explicacao:
      "Mede a diferença entre o preço de referência (média ponderada das últimas compras) e o preço efetivamente negociado. PPV positivo indica economia (saving); negativo indica que pagou mais caro que o histórico. É calculado em tempo real no momento de criação da OC. PPV negativo acima de 5% gera alerta automático.",
  },
  {
    sigla: "P(ref)",
    nome: "Preço de Referência (Baseline do PPV)",
    modulo: "Ordem de Compra Inteligente",
    formula: "Média ponderada exponencialmente decrescente das últimas R compras (R=5 padrão)",
    explicacao:
      "O preço baseline contra o qual o PPV é calculado. Não é simplesmente a última compra — é a média das últimas 5 compras do mesmo SKU ao mesmo fornecedor, com peso maior para compras mais recentes. Isso suaviza variações pontuais e dá uma referência justa para avaliar se a negociação atual é boa ou ruim.",
  },
  {
    sigla: "Cobertura",
    nome: "Cobertura de Estoque Resultante",
    modulo: "Ordem de Compra Inteligente",
    formula: "Cobertura = (Estoque Atual + Quantidade da OC) ÷ ADD",
    benchmark: "≤ 45 dias (secos); ≤ 21 dias (perecíveis)",
    explicacao:
      "Quantos dias de venda o estoque total (atual + nova compra) cobre. Se a cobertura ultrapassar 120% do limite máximo configurado para o SKU, o sistema alerta sobre compra excessiva. Excesso de cobertura imobiliza capital e aumenta risco de perda.",
  },
  // --- Custo Total de Aquisição ---
  {
    sigla: "CTA",
    nome: "Custo Total de Aquisição",
    modulo: "Custo Total de Aquisição",
    formula: "CTA = Preço Negociado + Frete Rateado − Descontos − Verbas + Custo de Divergência",
    benchmark: "≤ Preço de Tabela + 2%",
    explicacao:
      "O custo real de cada SKU comprado, considerando todos os componentes além do preço de tabela: frete, divergências de recebimento, avarias e devoluções. O preço negociado raramente é o custo final — o CTA revela o custo verdadeiro. Quando o CTA supera a tabela em mais de 2% de forma recorrente para um fornecedor, indica problemas operacionais sérios.",
  },
  {
    sigla: "CNC",
    nome: "Custo de Não-Conformidade",
    modulo: "Custo Total de Aquisição",
    formula: "CNC(%) = (Σ Valor das Divergências ÷ Volume de Compras) × 100",
    benchmark: "≤ 2%",
    explicacao:
      "Percentual do volume de compras que foi perdido em divergências causadas pelo fornecedor (quantidade errada, avaria, validade inadequada). Mede o custo operacional que o fornecedor gera além do preço negociado. Fornecedores com CNC acima de 2% devem ser renegociados ou substituídos.",
  },
  {
    sigla: "∆CTA",
    nome: "Desvio CTA versus Tabela",
    modulo: "Custo Total de Aquisição",
    formula: "∆CTA(%) = (CTA Real − Preço Tabela) ÷ Preço Tabela × 100",
    benchmark: "≤ +2%",
    explicacao:
      "Variação percentual entre o custo total real de aquisição e o preço de tabela do fornecedor. Revela o impacto oculto de frete, divergências e outros custos que não aparecem no preço negociado.",
  },
  // --- GMROI ---
  {
    sigla: "GMROI",
    nome: "Gross Margin Return on Inventory Investment",
    traducao: "Retorno da Margem Bruta sobre o Investimento em Estoque",
    modulo: "GMROI por Categoria e Fornecedor",
    formula: "GMROI = Margem Bruta ÷ Custo Médio do Estoque",
    benchmark: "≥ 2,0 (secos); ≥ 3,0 (perecíveis)",
    explicacao:
      "Indica quantos reais de margem bruta cada real investido em estoque gera. GMROI = 2,0 significa que cada R$1 em estoque gera R$2 de margem. GMROI < 1,0 significa que o produto destrói valor — o custo de manter o estoque supera a margem que ele gera. É o indicador-chave para decidir se um SKU ou fornecedor deve ser mantido, renegociado ou descontinuado.",
  },
  {
    sigla: "Giro de Estoque",
    nome: "Inventory Turnover",
    traducao: "Giro de Estoque",
    modulo: "GMROI por Categoria e Fornecedor",
    formula: "Giro = CMV ÷ Estoque Médio",
    benchmark: "≥ 15×/ano",
    explicacao:
      "Quantas vezes o estoque médio é vendido e reposto por ano. Giro alto com margem baixa pode ser sustentável; giro baixo exige margem muito alta para compensar o capital imobilizado. A Matriz GMROI × Giro posiciona cada categoria em 4 quadrantes para ação estratégica.",
  },
  {
    sigla: "Matriz GMROI × Giro",
    nome: "Matriz de 4 Quadrantes",
    modulo: "GMROI por Categoria e Fornecedor",
    explicacao:
      "Gráfico de dispersão que posiciona categorias/fornecedores em 4 quadrantes: (1) Alto Giro + Alto GMROI = Estrela — manter e proteger; (2) Alto Giro + Baixo GMROI = Volume — renegociar margem; (3) Baixo Giro + Alto GMROI = Nicho — otimizar estoque; (4) Baixo Giro + Baixo GMROI = Destruidor de Valor — descontinuar ou reestruturar. O eixo X é o Giro e o eixo Y é o GMROI.",
  },
  // --- Demanda ---
  {
    sigla: "ADD",
    nome: "Average Daily Demand",
    traducao: "Demanda Média Diária",
    modulo: "Análise de Demanda e Previsão",
    formula: "Média móvel ponderada de 30 dias (pesos 3–2–1 para décadas recentes→antigas)",
    explicacao:
      "Estimativa da demanda diária de um SKU, calculada como média ponderada dos últimos 30 dias de venda, dando peso maior aos dias mais recentes. Dias com ruptura de estoque são excluídos do cálculo para não subestimar a demanda real. É o insumo fundamental para calcular Ponto de Reposição, Estoque de Segurança e QPE.",
  },
  {
    sigla: "IS",
    nome: "Índice de Sazonalidade",
    traducao: "Índice Sazonal",
    modulo: "Análise de Demanda e Previsão",
    formula: "IS(m) = Demanda média do mês ÷ Demanda média anual",
    explicacao:
      "Fator multiplicador que ajusta a demanda pela sazonalidade do mês. IS > 1,0 indica mês acima da média (ex: dezembro para panetone); IS < 1,0 indica mês abaixo da média. Usado para ajustar a QPE e a projeção de necessidade de compra.",
  },
  {
    sigla: "QPE",
    nome: "Quantidade de Pedido Econômica (EOQ)",
    traducao: "Economic Order Quantity",
    modulo: "Análise de Demanda e Previsão",
    formula: "QPE = ⌈√(2 × Demanda Anual × Custo por Pedido ÷ Custo de Estocagem)⌉",
    explicacao:
      "Quantidade ótima de pedido que minimiza o custo total (custo de fazer pedidos + custo de manter estoque). O resultado é arredondado para o múltiplo de embalagem do fornecedor. É ajustada pelo índice sazonal do mês corrente. QPE muito alta gera cobertura excessiva; muito baixa gera pedidos frequentes com custo operacional elevado.",
  },
  {
    sigla: "Q(sug)",
    nome: "Quantidade Sugerida de Compra",
    modulo: "Análise de Demanda e Previsão",
    formula: "Q(sug) = max(Necessidade Projetada − Estoque Atual, 0)",
    explicacao:
      "Quantidade recomendada para a próxima OC, calculada como a necessidade projetada (ADD × (Lead Time + Ciclo) × Sazonalidade + Estoque Segurança) menos o estoque atual. Se o estoque atual já cobre a necessidade, a sugestão é zero. É arredondada para o múltiplo de embalagem.",
  },
  // --- Financeiro ---
  {
    sigla: "CCC",
    nome: "Cash Conversion Cycle",
    traducao: "Ciclo de Conversão de Caixa",
    modulo: "Painel Financeiro",
    formula: "CCC = DIO + DSO − DPO",
    benchmark: "≤ 0 (ideal)",
    explicacao:
      "Tempo total em dias entre pagar o fornecedor e receber do cliente. CCC negativo significa que os fornecedores financiam a operação (você recebe antes de pagar). O DSO é próximo de zero (vendas à vista). O objetivo é maximizar o DPO (negociar prazos maiores) e minimizar o DIO (girar estoque rápido). Quando DPO > DIO, os fornecedores financiam o estoque.",
  },
  {
    sigla: "DIO",
    nome: "Days Inventory Outstanding",
    traducao: "Dias de Estoque em Mãos",
    modulo: "Painel Financeiro",
    formula: "DIO = Estoque Médio ÷ (CMV ÷ Dias)",
    explicacao:
      "Quantos dias de vendas o estoque médio cobre. DIO alto indica excesso de estoque (capital parado); DIO baixo indica operação enxuta mas com risco de ruptura. É diretamente influenciado pelas decisões de compra e pelo GMROI.",
  },
  {
    sigla: "DSO",
    nome: "Days Sales Outstanding",
    traducao: "Dias de Recebimento de Vendas",
    modulo: "Painel Financeiro",
    formula: "DSO = Contas a Receber ÷ (Receita ÷ Dias)",
    explicacao:
      "Tempo médio para receber dos clientes. No varejo supermercadista com vendas majoritariamente à vista, o DSO é próximo de zero, o que torna o CCC fortemente dependente de DIO e DPO.",
  },
  {
    sigla: "∆CCC",
    nome: "Impacto da OC no CCC",
    modulo: "Painel Financeiro",
    formula: "∆CCC = ∆DIO − ∆DPO",
    benchmark: "≤ 0",
    explicacao:
      "Estimativa do impacto que uma nova Ordem de Compra terá no Ciclo de Conversão de Caixa. Se ∆CCC < 0, a OC melhora o ciclo financeiro. Se ∆CCC > 0, a OC piora. Calculado em tempo real na Calculadora de OC para que o comprador veja o impacto financeiro antes de confirmar.",
  },
  {
    sigla: "Saving",
    nome: "Saving Realizado",
    modulo: "Painel Financeiro",
    formula: "Saving(%) = Σ PPV positivo ÷ Volume total a preço de tabela × 100",
    benchmark: "≥ 1% ao mês",
    explicacao:
      "Percentual de economia real obtido nas negociações de compra, calculado apenas sobre os PPVs positivos acumulados no período. A meta padrão é saving ≥ 1% do volume de compras por mês. Exclui PPVs negativos da soma para refletir apenas as economias efetivas.",
  },
  // --- Verba Comercial ---
  {
    sigla: "Trade Spend",
    nome: "Verba Comercial",
    modulo: "Gestão de Verba Comercial",
    explicacao:
      "Toda receita oriunda de acordos comerciais com fornecedores: descontos por volume, bonificações, verbas de encarte, exposição preferencial (PDV), enxoval de loja nova. É uma linha de resultado frequentemente perdida por falta de controle. O Compras registra cada verba com tipo, valor, vigência e condicionais, e monitora previsto vs. realizado.",
  },
  {
    sigla: "TSROI",
    nome: "Trade Spend ROI",
    traducao: "Retorno sobre Investimento em Verba Comercial",
    modulo: "Gestão de Verba Comercial",
    formula: "TSROI = (Σ Receita de Verba ÷ Σ Compras Comprometidas) × 100",
    benchmark: "≥ 1,5% do faturamento",
    explicacao:
      "Mede o retorno financeiro das verbas comerciais negociadas. Para cada real comprometido em compras atreladas a verbas, quanto o fornecedor retornou em verba. Permite avaliar se os acordos comerciais estão gerando valor real ou apenas aumentando o volume de compras sem contrapartida proporcional.",
  },
  {
    sigla: "Aderência de Verba",
    nome: "Aderência da Verba Condicional",
    modulo: "Gestão de Verba Comercial",
    formula: "Aderência = (Condição Realizada ÷ Condição Contratada) × 100",
    benchmark: "≥ 100%",
    explicacao:
      "Percentual de cumprimento das condições necessárias para receber a verba (ex: atingir volume mínimo de compra). Aderência < 100% significa que a empresa não cumpriu as condições e pode perder a verba. O sistema monitora em tempo real e alerta quando a aderência está em risco.",
  },
  // --- Semáforo ---
  {
    sigla: "Semáforo",
    nome: "Sistema de Semáforo Operacional",
    modulo: "Todos os aplicativos",
    explicacao:
      "Código de cores aplicado a todos os indicadores: Verde = dentro da meta; Amarelo = faixa de atenção (entre limiar e meta); Vermelho = crítico (abaixo do limiar). Azul é reservado para alertas informativos sem ação requerida. O semáforo consolidado do painel executivo agrega 4 dimensões: Custo, Fornecedor, Demanda e Financeiro.",
  },
  // --- Alçadas ---
  {
    sigla: "Alçada de Aprovação",
    nome: "Níveis de Aprovação de OC",
    modulo: "Ordem de Compra Inteligente",
    explicacao:
      "Regra de governança: OCs até R$10.000 são aprovadas pelo comprador. OCs entre R$10.000 e R$50.000 exigem aprovação gerencial. OCs acima de R$50.000 exigem aprovação da diretoria. Compras fora do ciclo padrão (proativas/oportunísticas) exigem nível hierárquico maior independente do valor.",
  },
  {
    sigla: "SKU",
    nome: "Stock Keeping Unit",
    traducao: "Unidade de Manutenção de Estoque",
    modulo: "Todos os aplicativos",
    explicacao:
      "Código único que identifica cada produto no sistema. No Compras, cada SKU tem fornecedor primário, fornecedores alternativos, preço padrão histórico, CTA médio e parâmetros de cobertura mínima/máxima.",
  },
  {
    sigla: "Lead Time",
    nome: "Lead Time do Fornecedor",
    modulo: "Análise de Demanda e Previsão",
    explicacao:
      "Tempo em dias entre o envio da Ordem de Compra e o recebimento efetivo da mercadoria. É usado no cálculo de Ponto de Reposição e na projeção de necessidade de compra. Lead times longos exigem compras com mais antecedência e estoques de segurança maiores.",
  },
  {
    sigla: "MB",
    nome: "Margem Bruta",
    modulo: "GMROI por Categoria e Fornecedor",
    formula: "MB = Receita de Vendas − CMV",
    explicacao:
      "Diferença entre o faturamento e o custo das mercadorias vendidas. É o numerador do GMROI — representa o valor que sobra das vendas após cobrir o custo de aquisição dos produtos.",
  },
  {
    sigla: "NF / NF-e",
    nome: "Nota Fiscal / Nota Fiscal Eletrônica",
    modulo: "Custo Total de Aquisição",
    explicacao:
      "Documento fiscal que acompanha a entrega. No recebimento, o sistema confere NF vs. OC com tolerância configurável. Divergências entre NF e OC (preço, quantidade, produtos) geram registro de não-conformidade e impactam o CTA e o score do fornecedor.",
  },
];

// Group indicators by module
const groupedIndicators = indicators.reduce<Record<string, IndicatorEntry[]>>(
  (acc, ind) => {
    if (!acc[ind.modulo]) acc[ind.modulo] = [];
    acc[ind.modulo].push(ind);
    return acc;
  },
  {}
);

const moduleOrder = [
  "Painel Executivo",
  "Scorecard de Fornecedor",
  "Ordem de Compra Inteligente",
  "Custo Total de Aquisição",
  "GMROI por Categoria e Fornecedor",
  "Análise de Demanda e Previsão",
  "Gestão de Verba Comercial",
  "Painel Financeiro",
  "Todos os aplicativos",
];

export default function GlossarioPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Glossário de Indicadores"
        description="Tradução, explicação e lógica de cálculo de todas as siglas e KPIs do Compras"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/app/compras/manuais")}
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
            <h2 className="text-xs font-semibold uppercase tracking-wider text-app-compras border-b border-border pb-2">
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
                      <div className={cn(
                        "flex flex-wrap gap-3 pt-1 text-[11px]",
                      )}>
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
                            <span className="text-app-compras font-medium">{ind.benchmark}</span>
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
            <strong className="text-foreground">Fonte:</strong> Especificação formal de auditoria técnica — Aplicativo Compras, NEXUS Platform. 
            Versão 1.0, Março 2026. 
            Todos os cálculos seguem arredondamento bancário (half-even) e timestamps em UTC−3 (Parauapebas-PA). 
            Valores monetários em R$ com duas casas decimais.
          </p>
        </SolidCardContent>
      </SolidCard>
    </div>
  );
}
