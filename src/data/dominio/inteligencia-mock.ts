// ── Inteligência mock data ──

export interface InsightFeedItem {
  id: string;
  title: string;
  what: string;
  evidence: string;
  action: string;
  severity: "critical" | "warning" | "info";
  domain: string;
  link_to: string;
  link_label: string;
  link_state?: Record<string, unknown>;
  created_at: string;
}

export interface AIQueryTemplate {
  id: string;
  label: string;
  question: string;
  answer: string;
  sources: { label: string; route: string }[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  frequency: string;
  sections: ReportSection[];
}

export interface ReportSection {
  title: string;
  type: "kpi" | "table" | "text";
  data: Record<string, string | number>[] | string;
}

// ── Insights Feed (derivados dos KPIs e alertas existentes) ──
export const INSIGHTS_FEED: InsightFeedItem[] = [
  {
    id: "ins1",
    title: "Ruptura crítica concentrada em Express",
    what: "A unidade Express tem 120 SKUs em ruptura — é a maior da rede e representa 35% de todas as rupturas.",
    evidence: "120 de 340 rupturas totais. Categoria Bebidas responde por 65% dos itens faltantes. Fornecedor 'Distribuidora Águas' atrasou 3 entregas no mês.",
    action: "Abrir pendência cobrando fornecedor e revisar pedidos da categoria Bebidas na Express.",
    severity: "critical",
    domain: "produtos",
    link_to: "/app/dominio/produtos/ruptura",
    link_label: "Ver Rupturas",
    link_state: { filter_unit: "u7" },
    created_at: "2026-02-13T08:00:00Z",
  },
  {
    id: "ins2",
    title: "Margem do Açougue Leste abaixo de 15% há 3 semanas",
    what: "A margem do Açougue na Leste caiu para 12.8%, enquanto a média da rede é 20.8%.",
    evidence: "Custo médio subiu 8% sem repasse ao preço. Fornecedor 'Frigorífico Boi Gordo' aumentou tabela em Jan/2026.",
    action: "Renegociar preço com fornecedor ou repassar ao consumidor. Verificar se o mix de cortes mudou.",
    severity: "critical",
    domain: "financeiro",
    link_to: "/app/dominio/produtos/preco-margem",
    link_label: "Ver Preço & Margem",
    link_state: { filter_category: "Açougue" },
    created_at: "2026-02-12T14:30:00Z",
  },
  {
    id: "ins3",
    title: "Vendas da Leste em queda há 4 semanas",
    what: "Vendas caíram de R$1.70M para R$1.62M (−4.7%). É a única unidade com tendência consecutiva negativa.",
    evidence: "Ticket médio estável (R$95). O problema é volume de clientes: −6% no fluxo de loja (dado de catraca).",
    action: "Investigar causa da queda de fluxo: concorrência local, obra na via, ou problema de experiência na loja.",
    severity: "critical",
    domain: "vendas",
    link_to: "/app/dominio/vendas",
    link_label: "Ver Vendas",
    link_state: { filter_unit: "u4" },
    created_at: "2026-02-11T10:00:00Z",
  },
  {
    id: "ins4",
    title: "Perdas da Express são 3x a média da rede",
    what: "Express tem R$45.2k em perdas vs. média de R$16k nas demais unidades.",
    evidence: "Hortifruti e Perecíveis concentram 72% das perdas. Quebra operacional (não validade) é o principal motivo.",
    action: "Realizar auditoria presencial. Verificar processo de recebimento e armazenamento.",
    severity: "critical",
    domain: "financeiro",
    link_to: "/app/dominio/produtos/perdas",
    link_label: "Ver Perdas",
    link_state: { filter_unit: "u7" },
    created_at: "2026-02-10T09:15:00Z",
  },
  {
    id: "ins5",
    title: "Estoque de Limpeza na Sul parado há 45 dias",
    what: "Cobertura de 45 dias, mais que o dobro do ideal (21 dias). Capital parado estimado: R$18k.",
    evidence: "Compra excessiva em Jan/2026 para campanha que não aconteceu. 12 SKUs com giro zero.",
    action: "Montar ação de liquidação ou transferir estoque para unidades com giro maior.",
    severity: "warning",
    domain: "produtos",
    link_to: "/app/dominio/produtos/giro-cobertura",
    link_label: "Ver Giro & Cobertura",
    link_state: { filter_unit: "u3" },
    created_at: "2026-02-08T14:00:00Z",
  },
  {
    id: "ins6",
    title: "Fornecedor de Higiene com atrasos recorrentes",
    what: "O fornecedor 'CleanMax' atrasou 4 das últimas 6 entregas, causando ruptura em 32 SKUs na Oeste.",
    evidence: "Tempo médio de atraso: 3.2 dias. Impacto estimado em vendas perdidas: R$22k.",
    action: "Cobrar fornecedor formalmente e avaliar fornecedor alternativo para itens críticos.",
    severity: "warning",
    domain: "compras",
    link_to: "/app/dominio/compras/entregas",
    link_label: "Ver Entregas",
    created_at: "2026-02-12T09:00:00Z",
  },
  {
    id: "ins7",
    title: "Shopping é a unidade mais eficiente da rede",
    what: "Maior margem (28.1%), menor ruptura (15 SKUs) e menor perda (R$8.2k). Ticket médio mais alto: R$145.",
    evidence: "Equipe estável, 0 pendências abertas. Mix de produtos premium contribui para margem alta.",
    action: "Usar como modelo para treinamento. Replicar práticas de gestão nas unidades problemáticas.",
    severity: "info",
    domain: "vendas",
    link_to: "/app/dominio/unidades",
    link_label: "Ver Unidades",
    created_at: "2026-02-13T07:00:00Z",
  },
  {
    id: "ins8",
    title: "Faltas na unidade Norte acima do tolerável",
    what: "18 faltas no mês, 2x a média da rede. Concentradas no setor de Perecíveis.",
    evidence: "3 colaboradores com mais de 3 faltas cada. Padrão em segundas e sextas.",
    action: "Tratar com líder do setor. Avaliar necessidade de reposição ou reforço.",
    severity: "warning",
    domain: "pessoas",
    link_to: "/app/dominio/pessoas/faltas-atrasos",
    link_label: "Ver Faltas & Atrasos",
    created_at: "2026-02-12T11:00:00Z",
  },
];

// ── Templates de perguntas rápidas para IA ──
export const AI_QUERY_TEMPLATES: AIQueryTemplate[] = [
  {
    id: "q1",
    label: "Por que a margem caiu?",
    question: "Por que a margem caiu?",
    answer: "A margem consolidada da rede caiu de 24.8% para 23.5% no período. Os principais fatores são:\n\n1. **Açougue na Leste** — margem de 12.8% (meta: 20%). Custo de fornecedor subiu 8% sem repasse.\n2. **Bebidas consolidado** — margem de 18.7% (meta: 20%). Promoções agressivas em Jan/2026 comprimiram margem.\n3. **Express geral** — perdas de R$45.2k impactam diretamente o resultado líquido.\n\nRecomendação: priorizar renegociação do Açougue Leste e auditoria de perdas na Express.",
    sources: [
      { label: "Preço & Margem", route: "/app/dominio/produtos/preco-margem" },
      { label: "Perdas", route: "/app/dominio/produtos/perdas" },
      { label: "Financeiro", route: "/app/dominio/financeiro" },
    ],
  },
  {
    id: "q2",
    label: "Quais unidades pioraram?",
    question: "Quais unidades pioraram?",
    answer: "Duas unidades apresentam deterioração clara:\n\n1. **Leste** — vendas em queda há 4 semanas (−4.7%), margem abaixo da meta, 87 SKUs em ruptura e R$42.3k em perdas.\n2. **Express** — vendas 15% abaixo da meta, 120 SKUs em ruptura, perdas 3x a média e ticket médio mais baixo da rede (R$87).\n\nA Norte tem sinais de alerta (faltas, ruptura em Perecíveis) mas ainda dentro do tolerável.\n\nSem dado suficiente para avaliar tendência de longo prazo — sugiro acompanhar por mais 2 semanas.",
    sources: [
      { label: "Visão Unidades", route: "/app/dominio/unidades" },
      { label: "Vendas", route: "/app/dominio/vendas" },
      { label: "Alertas", route: "/app/dominio/problemas/alertas" },
    ],
  },
  {
    id: "q3",
    label: "Quais SKUs estão causando perdas?",
    question: "Quais SKUs estão causando perdas?",
    answer: "Os 5 SKUs com maior perda acumulada no mês:\n\n| SKU | Produto | Perda | Motivo principal |\n|-----|---------|-------|------------------|\n| SKU-003 | Banana Prata | R$8.2k | Validade (perecível) |\n| SKU-008 | Peito de Frango | R$6.1k | Quebra operacional |\n| SKU-015 | Alface Crespa | R$4.8k | Validade (perecível) |\n| SKU-012 | Iogurte Natural | R$3.9k | Validade |\n| SKU-019 | Tomate | R$3.2k | Quebra operacional |\n\nPerecíveis representam 68% do total de perdas. A Express concentra 28% do valor.",
    sources: [
      { label: "Perdas por SKU", route: "/app/dominio/produtos/perdas" },
      { label: "Catálogo SKU", route: "/app/dominio/produtos/catalogo" },
    ],
  },
  {
    id: "q4",
    label: "Qual o risco de abastecimento?",
    question: "Qual o risco de abastecimento?",
    answer: "Categorias com maior risco de desabastecimento:\n\n1. **Bebidas** — dependência de 1 fornecedor (Distribuidora Águas) para 60% do volume. 3 atrasos no mês.\n2. **Higiene** — fornecedor CleanMax com 67% de atraso nas entregas. Sem alternativa homologada.\n3. **Açougue** — Frigorífico Boi Gordo é fornecedor único. Reajuste de 8% sem aviso prévio.\n\nSem dado suficiente sobre lead time de novos fornecedores — sugiro levantar com Compras.",
    sources: [
      { label: "Risco Abastecimento", route: "/app/dominio/compras/risco" },
      { label: "Fornecedores", route: "/app/dominio/compras/fornecedores" },
    ],
  },
  {
    id: "q5",
    label: "Resumo executivo da semana",
    question: "Resumo executivo da semana",
    answer: "**Semana 10-13 Fev/2026 — Rede Consolidada**\n\n✅ **Positivo:** Shopping mantém excelência (margem 28.1%, 0 pendências). Sul e Oeste estáveis.\n\n⚠️ **Atenção:** Norte com faltas elevadas e ruptura em Perecíveis. Bebidas com margem comprimida na rede.\n\n🔴 **Crítico:** Leste em queda consecutiva de vendas. Express com ruptura, perdas e ticket médio baixo — requer intervenção imediata.\n\n**Ações prioritárias:** (1) Auditoria Express, (2) Renegociação Açougue Leste, (3) Cobrança fornecedor Bebidas.",
    sources: [
      { label: "Dashboard", route: "/app/dominio" },
      { label: "Alertas", route: "/app/dominio/problemas/alertas" },
      { label: "Pendências", route: "/app/dominio/problemas/pendencias" },
    ],
  },
];

// ── Templates de Relatórios ──
export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "r1",
    name: "Semanal Diretoria",
    description: "Visão consolidada da semana para apresentação à diretoria",
    frequency: "Semanal",
    sections: [
      {
        title: "KPIs da Semana",
        type: "kpi",
        data: [
          { indicador: "Venda Líquida", valor: "R$ 12.4M", variacao: "+3.3%" },
          { indicador: "Margem Consolidada", valor: "23.5%", variacao: "-1.3pp" },
          { indicador: "Ruptura Total", valor: "340 SKUs", variacao: "+12%" },
          { indicador: "Perdas", valor: "R$ 161.7k", variacao: "+8%" },
        ],
      },
      {
        title: "Unidades Críticas",
        type: "table",
        data: [
          { unidade: "Leste", problema: "Vendas em queda 4 semanas", impacto: "R$ 230k gap vs meta" },
          { unidade: "Express", problema: "Ruptura + perdas elevadas", impacto: "R$ 245k impacto estimado" },
        ],
      },
      { title: "Recomendações", type: "text", data: "1. Auditoria presencial na Express\n2. Renegociação de fornecedor Açougue\n3. Plano de recuperação de vendas Leste" },
    ],
  },
  {
    id: "r2",
    name: "Mensal por Unidade",
    description: "Desempenho detalhado de cada unidade no mês",
    frequency: "Mensal",
    sections: [
      {
        title: "Ranking de Unidades",
        type: "table",
        data: [
          { unidade: "Centro", venda: "R$ 2.45M", margem: "24.5%", ruptura: "23", perdas: "R$ 12.4k" },
          { unidade: "Norte", venda: "R$ 2.10M", margem: "22.1%", ruptura: "45", perdas: "R$ 28.7k" },
          { unidade: "Sul", venda: "R$ 1.85M", margem: "26.3%", ruptura: "18", perdas: "R$ 9.8k" },
          { unidade: "Leste", venda: "R$ 1.62M", margem: "19.8%", ruptura: "87", perdas: "R$ 42.3k" },
          { unidade: "Oeste", venda: "R$ 1.78M", margem: "23.7%", ruptura: "32", perdas: "R$ 15.6k" },
          { unidade: "Shopping", venda: "R$ 1.45M", margem: "28.1%", ruptura: "15", perdas: "R$ 8.2k" },
          { unidade: "Express", venda: "R$ 1.15M", margem: "21.4%", ruptura: "120", perdas: "R$ 45.2k" },
        ],
      },
      { title: "Destaques", type: "text", data: "Shopping lidera em eficiência. Leste e Express precisam de intervenção." },
    ],
  },
  {
    id: "r3",
    name: "Perdas do Mês",
    description: "Análise detalhada de perdas por unidade, categoria e motivo",
    frequency: "Mensal",
    sections: [
      {
        title: "Perdas por Unidade",
        type: "table",
        data: [
          { unidade: "Express", valor: "R$ 45.2k", pct_venda: "3.9%", principal_motivo: "Quebra operacional" },
          { unidade: "Leste", valor: "R$ 42.3k", pct_venda: "2.6%", principal_motivo: "Validade" },
          { unidade: "Norte", valor: "R$ 28.7k", pct_venda: "1.4%", principal_motivo: "Validade" },
          { unidade: "Oeste", valor: "R$ 15.6k", pct_venda: "0.9%", principal_motivo: "Quebra operacional" },
          { unidade: "Centro", valor: "R$ 12.4k", pct_venda: "0.5%", principal_motivo: "Furto" },
          { unidade: "Sul", valor: "R$ 9.8k", pct_venda: "0.5%", principal_motivo: "Validade" },
          { unidade: "Shopping", valor: "R$ 8.2k", pct_venda: "0.6%", principal_motivo: "Validade" },
        ],
      },
      {
        title: "Top Categorias",
        type: "table",
        data: [
          { categoria: "Perecíveis", valor: "R$ 52k", pct_total: "32%" },
          { categoria: "Hortifruti", valor: "R$ 38k", pct_total: "24%" },
          { categoria: "Açougue", valor: "R$ 28k", pct_total: "17%" },
        ],
      },
      { title: "Conclusão", type: "text", data: "Perdas estão R$ 22k acima do orçado. Perecíveis e quebra operacional na Express são as alavancas de correção." },
    ],
  },
  {
    id: "r4",
    name: "Ruptura Crítica",
    description: "SKUs e unidades com ruptura acima do aceitável",
    frequency: "Semanal",
    sections: [
      {
        title: "Resumo",
        type: "kpi",
        data: [
          { indicador: "Total SKUs em Ruptura", valor: "340", meta: "<200" },
          { indicador: "Unidades Críticas", valor: "2", meta: "0" },
          { indicador: "Impacto Estimado", valor: "R$ 285k", meta: "—" },
        ],
      },
      {
        title: "Detalhamento por Unidade",
        type: "table",
        data: [
          { unidade: "Express", skus_ruptura: "120", categorias: "Bebidas, Higiene", fornecedor_problema: "Dist. Águas" },
          { unidade: "Leste", skus_ruptura: "87", categorias: "Perecíveis, Mercearia", fornecedor_problema: "—" },
          { unidade: "Norte", skus_ruptura: "45", categorias: "Perecíveis", fornecedor_problema: "LaticBR" },
        ],
      },
      { title: "Ações Recomendadas", type: "text", data: "1. Cobrar Distribuidora Águas (prazo: 48h)\n2. Transferir estoque de Higiene da Sul para Oeste\n3. Revisar pedidos automáticos de Perecíveis na Norte" },
    ],
  },
];
