import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ============================================================================
// SYSTEM PROMPT
// ============================================================================
const SYSTEM_PROMPT = `Você é a NexusIA, assistente de inteligência artificial integrada ao ecossistema nexusOS.

## SUAS CAPACIDADES

Você tem acesso completo aos dados do sistema através de ferramentas cobrindo TODOS os aplicativos:

- **Trade**: Fornecedores, pacotes de trade, checklists, comprovações
- **Ofertas**: Campanhas de WhatsApp, contatos, unidades
- **Marketing**: Orçamentos, KPIs de marketing, planejamento estratégico
- **Loja**: Rentabilidade por m², precificação/markup, perdas operacionais, IPC
- **Financeiro**: DRE, margens, verbas cooperadas, alertas financeiros
- **CD (WMS)**: Estoque, SKUs, recebimentos, picking, expedição, perdas do CD
- **RH**: Quadro de pessoal, turnover, absenteísmo, treinamentos, custos de pessoal
- **Compras**: Pedidos de compra, fornecedores, lead times, saving
- **Cliente**: NPS, reclamações, ticket médio, segmentação de clientes
- **Tech**: Incidentes de TI, SLAs, ativos de infra, projetos de tecnologia
- **Academy**: Treinamentos, certificações, trilhas de aprendizagem
- **Winthor (ERP)**: Estoque, vendas, rupturas, margens

## CONTEXTO EMPRESARIAL

A rede demo possui 7 lojas no Pará:
| Loja | Cidade | Faturamento Mensal |
|------|--------|-------------------|
| Cidade Jardim | Parauapebas | R$ 2.850.000 |
| VS10 | Parauapebas | R$ 2.400.000 |
| Beira-Rio | Parauapebas | R$ 2.100.000 |
| Faruk | Parauapebas | R$ 1.950.000 |
| Canaã dos Carajás | Canaã dos Carajás | R$ 1.500.000 |
| Núcleo Urbano | Parauapebas | R$ 950.000 |
| Xinguara | Xinguara | R$ 650.000 |
| **TOTAL** | | **R$ 12.400.000/mês** |

### Case de Sucesso: Parceria Nestlé (Out/25 - Jan/26)
- Investimento: R$ 126.000 | ROI: 285% | Crescimento: +37% | Faturamento: R$ 381.000

## GERACAO DE DOCUMENTOS - REGRAS CRITICAS

Quando o usuario pedir PDF, relatorio ou documento para download:
1. Use a ferramenta generate_document com o parametro "content" contendo texto COMPLETO formatado
2. NAO use markdown no content! Escreva texto limpo
3. Titulos em MAIUSCULAS, listas com "- ", linhas em branco para separar secoes

## DIRETRIZES GERAIS

- Use as ferramentas para buscar dados antes de responder
- Seja direto e útil
- Formate respostas de CHAT com Markdown (apenas no chat, nao em documentos)
- Cite fontes dos dados entre parênteses
- Quando perguntar sobre dados cruzados entre aplicativos, use múltiplas ferramentas
- Responda em português brasileiro`;

// ============================================================================
// TOOL DEFINITIONS
// ============================================================================
const TOOLS = [
  // === Trade ===
  { type: "function", function: { name: "get_suppliers", description: "Lista fornecedores cadastrados no Trade.", parameters: { type: "object", properties: { active_only: { type: "boolean" }, search: { type: "string" } } } } },
  { type: "function", function: { name: "get_trade_packages", description: "Lista pacotes de trade marketing.", parameters: { type: "object", properties: { supplier_id: { type: "string" }, status: { type: "string", enum: ["active", "draft", "completed", "cancelled"] } } } } },
  { type: "function", function: { name: "get_checklists", description: "Lista itens de checklist de trade.", parameters: { type: "object", properties: { package_id: { type: "string" }, status: { type: "string" } } } } },
  { type: "function", function: { name: "get_trade_proofs", description: "Lista comprovações enviadas.", parameters: { type: "object", properties: { status: { type: "string", enum: ["pending", "approved", "rejected"] } } } } },

  // === Ofertas ===
  { type: "function", function: { name: "get_campaigns", description: "Lista campanhas de marketing.", parameters: { type: "object", properties: { status: { type: "string" }, limit: { type: "number" } } } } },
  { type: "function", function: { name: "get_contacts_stats", description: "Estatísticas da base de contatos.", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "get_units", description: "Lista unidades/lojas.", parameters: { type: "object", properties: { active_only: { type: "boolean" } } } } },

  // === Marketing ===
  { type: "function", function: { name: "get_budget_overview", description: "Visão geral do orçamento de marketing.", parameters: { type: "object", properties: { year: { type: "number" } } } } },
  { type: "function", function: { name: "get_budget_by_category", description: "Orçamento por categoria.", parameters: { type: "object", properties: { category: { type: "string" } } } } },
  { type: "function", function: { name: "get_marketing_kpis", description: "KPIs de marketing consolidados.", parameters: { type: "object", properties: { period: { type: "string" } } } } },
  { type: "function", function: { name: "get_coop_funds", description: "Verbas cooperadas negociadas com fornecedores.", parameters: { type: "object", properties: { supplier_id: { type: "string" }, status: { type: "string" } } } } },

  // === Winthor/ERP ===
  { type: "function", function: { name: "get_stock_levels", description: "Níveis de estoque do ERP.", parameters: { type: "object", properties: { product_name: { type: "string" }, category: { type: "string" }, low_stock_only: { type: "boolean" } } } } },
  { type: "function", function: { name: "get_sales_data", description: "Dados de vendas.", parameters: { type: "object", properties: { period: { type: "string" }, category: { type: "string" } } } } },
  { type: "function", function: { name: "get_nestle_partnership_data", description: "Dados da parceria Nestlé (case de sucesso).", parameters: { type: "object", properties: { include_comparison: { type: "boolean" }, include_products: { type: "boolean" }, include_stores: { type: "boolean" } } } } },

  // === Loja ===
  { type: "function", function: { name: "get_loja_rentabilidade", description: "Rentabilidade por m² por seção/loja. Inclui R$/m², Margem/m², IPE.", parameters: { type: "object", properties: { loja: { type: "string", description: "Nome da loja" }, secao: { type: "string", description: "Nome da seção" } } } } },
  { type: "function", function: { name: "get_loja_precificacao", description: "Dados de precificação: markup real, IAP, SKUs PAC.", parameters: { type: "object", properties: { loja: { type: "string" }, categoria: { type: "string" } } } } },
  { type: "function", function: { name: "get_loja_perdas", description: "Perdas operacionais: IP% por seção/tipo, composição, evolução.", parameters: { type: "object", properties: { loja: { type: "string" }, tipo: { type: "string", enum: ["operacional", "vencimento", "furto_externo", "furto_interno"] } } } } },
  { type: "function", function: { name: "get_loja_comparativo", description: "Comparativo entre lojas: IPC, ranking, distância da melhor prática.", parameters: { type: "object", properties: { kpi: { type: "string", description: "KPI para comparar: receita_m2, ip_pct, iap, ipe" } } } } },

  // === Financeiro ===
  { type: "function", function: { name: "get_fin_dre", description: "DRE resumido da rede ou de uma loja específica.", parameters: { type: "object", properties: { loja: { type: "string" }, periodo: { type: "string", description: "Ex: 2026-01, 2026-02" } } } } },
  { type: "function", function: { name: "get_fin_margens", description: "Margens (bruta, operacional, líquida) por loja.", parameters: { type: "object", properties: { loja: { type: "string" } } } } },
  { type: "function", function: { name: "get_fin_alertas", description: "Alertas financeiros ativos.", parameters: { type: "object", properties: {} } } },

  // === CD (WMS) ===
  { type: "function", function: { name: "get_cd_estoque", description: "Posição de estoque do CD: SKUs, lotes, locações, validade.", parameters: { type: "object", properties: { categoria: { type: "string" }, critico_only: { type: "boolean" } } } } },
  { type: "function", function: { name: "get_cd_recebimento", description: "Agenda e status de recebimentos do CD.", parameters: { type: "object", properties: { status: { type: "string" } } } } },
  { type: "function", function: { name: "get_cd_expedicao", description: "Ordens de transferência e expedição do CD.", parameters: { type: "object", properties: { loja_destino: { type: "string" }, status: { type: "string" } } } } },
  { type: "function", function: { name: "get_cd_kpis", description: "KPIs operacionais do CD: dock-to-stock, acurácia, ocupação.", parameters: { type: "object", properties: {} } } },

  // === RH ===
  { type: "function", function: { name: "get_rh_quadro", description: "Quadro de pessoal: headcount, vagas, distribuição por loja/departamento.", parameters: { type: "object", properties: { loja: { type: "string" }, departamento: { type: "string" } } } } },
  { type: "function", function: { name: "get_rh_indicadores", description: "Indicadores de RH: turnover, absenteísmo, horas extras, custo/FTE.", parameters: { type: "object", properties: { periodo: { type: "string" } } } } },
  { type: "function", function: { name: "get_rh_treinamentos", description: "Status de treinamentos e certificações obrigatórias.", parameters: { type: "object", properties: { area: { type: "string" } } } } },

  // === Compras ===
  { type: "function", function: { name: "get_compras_pedidos", description: "Pedidos de compra: status, fornecedor, valor, prazo.", parameters: { type: "object", properties: { status: { type: "string" }, fornecedor: { type: "string" } } } } },
  { type: "function", function: { name: "get_compras_saving", description: "Saving e economia em compras por categoria.", parameters: { type: "object", properties: { periodo: { type: "string" } } } } },
  { type: "function", function: { name: "get_compras_fornecedores", description: "Performance de fornecedores: OTIF, lead time, devoluções.", parameters: { type: "object", properties: { fornecedor: { type: "string" } } } } },
  { type: "function", function: { name: "get_compras_matriz", description: "Matriz Giro x Margem (GMROI) por categoria.", parameters: { type: "object", properties: {} } } },

  // === Cliente ===
  { type: "function", function: { name: "get_cliente_nps", description: "NPS e satisfação do cliente por loja, com evolução mensal.", parameters: { type: "object", properties: { loja: { type: "string" } } } } },
  { type: "function", function: { name: "get_cliente_reclamacoes", description: "Reclamações e ocorrências dos clientes.", parameters: { type: "object", properties: { status: { type: "string" }, categoria: { type: "string" } } } } },
  { type: "function", function: { name: "get_cliente_segmentacao", description: "Segmentação de clientes: ticket médio, frequência, perfil, churn.", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "get_cliente_satisfacao", description: "Satisfação por área de serviço (variedade, atendimento, preços etc).", parameters: { type: "object", properties: {} } } },

  // === Tech ===
  { type: "function", function: { name: "get_tech_incidentes", description: "Incidentes de TI: status, SLA, impacto.", parameters: { type: "object", properties: { status: { type: "string" }, prioridade: { type: "string" } } } } },
  { type: "function", function: { name: "get_tech_infra", description: "Status da infraestrutura: servidores, rede, PDVs por loja.", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "get_tech_projetos", description: "Projetos de tecnologia em andamento.", parameters: { type: "object", properties: {} } } },

  // === Academy ===
  { type: "function", function: { name: "get_academy_trilhas", description: "Trilhas de aprendizagem e progresso dos colaboradores.", parameters: { type: "object", properties: { area: { type: "string" } } } } },
  { type: "function", function: { name: "get_academy_kpis", description: "KPIs de treinamento: horas, certificações, investimento.", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "get_academy_ranking", description: "Ranking de lojas por taxa de conclusão de treinamentos.", parameters: { type: "object", properties: {} } } },

  // === Marketing ===
  { type: "function", function: { name: "get_gestao_demandas", description: "Status de demandas criativas e produção de marketing.", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "get_gestao_campanhas", description: "Campanhas de marketing ativas com ROI.", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "get_gestao_equipe", description: "Status da equipe interna de marketing.", parameters: { type: "object", properties: {} } } },

  // === Document Generation ===
  { type: "function", function: { name: "generate_document", description: "Gera documento para download. Content deve ser texto limpo sem markdown.", parameters: { type: "object", properties: { format: { type: "string", enum: ["pdf", "xlsx", "docx"] }, title: { type: "string" }, content: { type: "string" }, structured_data: { type: "object" } }, required: ["format", "title", "content"] } } },
];

// ============================================================================
// MOCK DATA — Loja
// ============================================================================
const MOCK_LOJA = {
  rentabilidade: [
    { loja: "Cidade Jardim", secao: "Hortifruti", area_m2: 180, receita_mensal: 485000, margem_mensal: 145500, receita_m2: 2694.44, margem_m2: 808.33, ipe: 1.24 },
    { loja: "Cidade Jardim", secao: "Açougue", area_m2: 120, receita_mensal: 520000, margem_mensal: 130000, receita_m2: 4333.33, margem_m2: 1083.33, ipe: 1.99 },
    { loja: "Cidade Jardim", secao: "Mercearia", area_m2: 450, receita_mensal: 890000, margem_mensal: 222500, receita_m2: 1977.78, margem_m2: 494.44, ipe: 0.91 },
    { loja: "Cidade Jardim", secao: "Padaria", area_m2: 95, receita_mensal: 280000, margem_mensal: 112000, receita_m2: 2947.37, margem_m2: 1178.95, ipe: 1.36 },
    { loja: "VS10", secao: "Hortifruti", area_m2: 150, receita_mensal: 360000, margem_mensal: 108000, receita_m2: 2400.00, margem_m2: 720.00, ipe: 1.10 },
    { loja: "VS10", secao: "Açougue", area_m2: 100, receita_mensal: 410000, margem_mensal: 102500, receita_m2: 4100.00, margem_m2: 1025.00, ipe: 1.88 },
    { loja: "VS10", secao: "Mercearia", area_m2: 380, receita_mensal: 720000, margem_mensal: 180000, receita_m2: 1894.74, margem_m2: 473.68, ipe: 0.87 },
    { loja: "VS10", secao: "Padaria", area_m2: 80, receita_mensal: 210000, margem_mensal: 84000, receita_m2: 2625.00, margem_m2: 1050.00, ipe: 1.20 },
  ],
  precificacao: {
    iap_rede: 82.5,
    skus_pac: [
      { sku: "Banana Prata kg", loja: "Beira-Rio", preco: 3.49, custo: 3.85, markup: -9.35, impacto: -0.36 },
      { sku: "Cerveja Brahma 350ml", loja: "Faruk", preco: 2.99, custo: 3.12, markup: -4.17, impacto: -0.13 },
      { sku: "Frango Congelado kg", loja: "Xinguara", preco: 8.90, custo: 9.20, markup: -3.26, impacto: -0.30 },
    ],
    iap_por_loja: [
      { loja: "Cidade Jardim", iap: 88.2, skus_avaliados: 4200, skus_aderentes: 3704 },
      { loja: "VS10", iap: 85.1, skus_avaliados: 3800, skus_aderentes: 3234 },
      { loja: "Beira-Rio", iap: 79.4, skus_avaliados: 3500, skus_aderentes: 2779 },
      { loja: "Faruk", iap: 81.3, skus_avaliados: 3200, skus_aderentes: 2602 },
      { loja: "Canaã dos Carajás", iap: 83.0, skus_avaliados: 2800, skus_aderentes: 2324 },
      { loja: "Núcleo Urbano", iap: 78.6, skus_avaliados: 2200, skus_aderentes: 1729 },
      { loja: "Xinguara", iap: 76.2, skus_avaliados: 1800, skus_aderentes: 1372 },
    ]
  },
  perdas: {
    ip_rede: 1.82,
    por_loja: [
      { loja: "Cidade Jardim", ip_pct: 1.45, valor: 41325, composicao: { operacional: 35, vencimento: 30, furto_externo: 25, furto_interno: 10 } },
      { loja: "VS10", ip_pct: 1.62, valor: 38880, composicao: { operacional: 30, vencimento: 35, furto_externo: 25, furto_interno: 10 } },
      { loja: "Beira-Rio", ip_pct: 2.10, valor: 44100, composicao: { operacional: 25, vencimento: 28, furto_externo: 35, furto_interno: 12 } },
      { loja: "Faruk", ip_pct: 1.95, valor: 38025, composicao: { operacional: 28, vencimento: 32, furto_externo: 28, furto_interno: 12 } },
      { loja: "Canaã dos Carajás", ip_pct: 1.80, valor: 27000, composicao: { operacional: 32, vencimento: 30, furto_externo: 28, furto_interno: 10 } },
      { loja: "Núcleo Urbano", ip_pct: 2.35, valor: 22325, composicao: { operacional: 22, vencimento: 25, furto_externo: 40, furto_interno: 13 } },
      { loja: "Xinguara", ip_pct: 2.50, valor: 16250, composicao: { operacional: 20, vencimento: 28, furto_externo: 38, furto_interno: 14 } },
    ]
  },
  comparativo: [
    { loja: "Cidade Jardim", ipc: 87.4, receita_m2: 3375, ip_pct: 1.45, iap: 88.2, ipe_medio: 1.38 },
    { loja: "VS10", ipc: 82.1, receita_m2: 3380, ip_pct: 1.62, iap: 85.1, ipe_medio: 1.26 },
    { loja: "Beira-Rio", ipc: 74.5, receita_m2: 2800, ip_pct: 2.10, iap: 79.4, ipe_medio: 1.05 },
    { loja: "Faruk", ipc: 72.8, receita_m2: 2785, ip_pct: 1.95, iap: 81.3, ipe_medio: 1.02 },
    { loja: "Canaã dos Carajás", ipc: 68.3, receita_m2: 2500, ip_pct: 1.80, iap: 83.0, ipe_medio: 0.98 },
    { loja: "Núcleo Urbano", ipc: 58.2, receita_m2: 1900, ip_pct: 2.35, iap: 78.6, ipe_medio: 0.85 },
    { loja: "Xinguara", ipc: 52.1, receita_m2: 1625, ip_pct: 2.50, iap: 76.2, ipe_medio: 0.78 },
  ]
};

// ============================================================================
// MOCK DATA — Financeiro
// ============================================================================
const MOCK_FIN = {
  dre_rede: {
    periodo: "2026-02", receita_bruta: 12400000, devolucoes: 186000, descontos: 310000, impostos: 1488000,
    receita_liquida: 10416000, cmv: 7812000, perdas: 225880, bonificacoes: 124000, margem_bruta: 2502120,
    despesas_operacionais: 1860000, ebitda: 642120, resultado_financeiro: -62000, lucro_liquido: 464096,
    margem_bruta_pct: 24.02, margem_operacional_pct: 6.16, margem_liquida_pct: 4.46
  },
  margens_por_loja: [
    { loja: "Cidade Jardim", margem_bruta: 26.5, margem_operacional: 8.2, margem_liquida: 5.8 },
    { loja: "VS10", margem_bruta: 25.1, margem_operacional: 7.4, margem_liquida: 5.1 },
    { loja: "Beira-Rio", margem_bruta: 23.8, margem_operacional: 5.9, margem_liquida: 3.9 },
    { loja: "Faruk", margem_bruta: 23.2, margem_operacional: 5.5, margem_liquida: 3.5 },
    { loja: "Canaã dos Carajás", margem_bruta: 22.5, margem_operacional: 4.8, margem_liquida: 3.0 },
    { loja: "Núcleo Urbano", margem_bruta: 20.8, margem_operacional: 3.2, margem_liquida: 1.8 },
    { loja: "Xinguara", margem_bruta: 19.5, margem_operacional: 2.1, margem_liquida: 0.9 },
  ],
  alertas: [
    { tipo: "semaforo", severidade: "critico", titulo: "Margem líquida Xinguara abaixo do limite (0.9%)", kpi: "margem_liquida_pct", valor: 0.9, meta: 3.0 },
    { tipo: "semaforo", severidade: "alerta", titulo: "Margem operacional Núcleo Urbano em queda (3.2%)", kpi: "margem_operacional_pct", valor: 3.2, meta: 5.0 },
    { tipo: "deterioracao_imc", severidade: "alerta", titulo: "IMC em queda: Bebidas", kpi: "imc_bebidas", descricao: "Categoria Bebidas com IMC em deterioração por 2 períodos consecutivos" },
  ]
};

// ============================================================================
// MOCK DATA — CD
// ============================================================================
const MOCK_CD = {
  estoque: [
    { sku: "ARR-001", descricao: "Arroz Tio João 5kg", categoria: "Grãos", lote: "L2026-0145", qty: 2400, locacao: "A-01-03", validade: "2026-12-15", status: "disponivel" },
    { sku: "ACU-015", descricao: "Açúcar Cristal 1kg", categoria: "Mercearia", lote: "L2026-0189", qty: 1850, locacao: "A-02-01", validade: "2027-03-20", status: "disponivel" },
    { sku: "LEI-008", descricao: "Leite UHT Integral 1L", categoria: "Laticínios", lote: "L2026-0201", qty: 45, locacao: "C-01-02", validade: "2026-04-10", status: "critico" },
    { sku: "CER-012", descricao: "Cerveja Brahma 350ml", categoria: "Bebidas", lote: "L2026-0178", qty: 0, locacao: "B-03-01", validade: "2026-09-01", status: "ruptura" },
    { sku: "FRU-003", descricao: "Banana Prata kg", categoria: "Hortifruti", lote: "L2026-0215", qty: 320, locacao: "D-01-01", validade: "2026-03-12", status: "proximo_vencer" },
    { sku: "OLE-007", descricao: "Óleo Soja Liza 900ml", categoria: "Mercearia", lote: "L2026-0230", qty: 3200, locacao: "A-03-02", validade: "2027-06-10", status: "disponivel" },
    { sku: "MAR-019", descricao: "Margarina Qualy 500g", categoria: "Laticínios", lote: "L2026-0245", qty: 180, locacao: "C-02-01", validade: "2026-05-20", status: "disponivel" },
    { sku: "SAB-022", descricao: "Sabão OMO 1kg", categoria: "Limpeza", lote: "L2026-0198", qty: 920, locacao: "B-01-04", validade: "2027-08-15", status: "disponivel" },
    { sku: "PEP-005", descricao: "Pepsi 2L", categoria: "Bebidas", lote: "L2026-0260", qty: 12, locacao: "B-03-05", validade: "2026-07-01", status: "critico" },
    { sku: "CAF-011", descricao: "Café Pilão 500g", categoria: "Mercearia", lote: "L2026-0275", qty: 680, locacao: "A-04-01", validade: "2027-01-30", status: "disponivel" },
    { sku: "FEI-003", descricao: "Feijão Carioca Kicaldo 1kg", categoria: "Grãos", lote: "L2026-0290", qty: 1500, locacao: "A-01-05", validade: "2026-11-20", status: "disponivel" },
    { sku: "IOG-014", descricao: "Iogurte Danone Natural 170g", categoria: "Laticínios", lote: "L2026-0310", qty: 0, locacao: "C-03-02", validade: "2026-03-15", status: "ruptura" },
  ],
  kpis: { dock_to_stock_min: 42, acuracia_inventario: 97.8, ocupacao_pct: 73.5, pedidos_dia: 28, itens_expedidos_dia: 4200, produtividade_picks_hora: 85, fill_rate: 94.2, shrink_rate: 1.3, rar: 96.2, pedidos_atrasados: 3 },
  recebimentos: [
    { fornecedor: "Nestlé", po: "PO-2026-0456", status: "agendado", data: "2026-03-06", itens: 15, dock: "D1", valor_total: 185000 },
    { fornecedor: "Ambev", po: "PO-2026-0461", status: "em_conferencia", data: "2026-03-05", itens: 22, dock: "D2", valor_total: 220000 },
    { fornecedor: "P&G", po: "PO-2026-0458", status: "concluido", data: "2026-03-04", itens: 18, dock: "D1", resultado: "aprovado_com_ressalvas", valor_total: 98000 },
    { fornecedor: "BRF", po: "PO-2026-0470", status: "agendado", data: "2026-03-07", itens: 8, dock: "D3", valor_total: 142000 },
    { fornecedor: "Coca-Cola", po: "PO-2026-0485", status: "agendado", data: "2026-03-08", itens: 20, dock: "D2", valor_total: 175000 },
    { fornecedor: "Unilever", po: "PO-2026-0490", status: "concluido", data: "2026-03-03", itens: 12, dock: "D1", resultado: "aprovado", valor_total: 98000 },
  ],
  expedicao: [
    { ordem: "TO-2026-1245", loja_destino: "Cidade Jardim", status: "picking", itens: 85, peso_kg: 1240, previsao: "2026-03-05 14:00" },
    { ordem: "TO-2026-1246", loja_destino: "VS10", status: "aguardando", itens: 62, peso_kg: 890, previsao: "2026-03-05 16:00" },
    { ordem: "TO-2026-1243", loja_destino: "Beira-Rio", status: "expedido", itens: 74, peso_kg: 1050, romaneio: "ROM-2026-0312" },
    { ordem: "TO-2026-1247", loja_destino: "Faruk", status: "aguardando", itens: 48, peso_kg: 720, previsao: "2026-03-06 08:00" },
    { ordem: "TO-2026-1248", loja_destino: "Canaã dos Carajás", status: "picking", itens: 92, peso_kg: 1380, previsao: "2026-03-06 10:00" },
    { ordem: "TO-2026-1244", loja_destino: "Xinguara", status: "expedido", itens: 38, peso_kg: 560, romaneio: "ROM-2026-0313" },
    { ordem: "TO-2026-1249", loja_destino: "Núcleo Urbano", status: "aguardando", itens: 55, peso_kg: 810, previsao: "2026-03-06 14:00" },
  ],
  perdas_cd: [
    { sku: "FRU-003", descricao: "Banana Prata kg", motivo: "Vencimento", qty: 85, valor: 425, data: "2026-03-03" },
    { sku: "IOG-014", descricao: "Iogurte Danone Natural", motivo: "Avaria recebimento", qty: 24, valor: 120, data: "2026-03-02" },
    { sku: "LEI-008", descricao: "Leite UHT Integral", motivo: "Temperatura", qty: 48, valor: 240, data: "2026-03-01" },
  ]
};

// ============================================================================
// MOCK DATA — RH
// ============================================================================
const MOCK_RH = {
  quadro: {
    headcount_total: 892, vagas_abertas: 14, custo_folha_mensal: 3250000,
    por_loja: [
      { loja: "Cidade Jardim", headcount: 185, vagas: 3, custo_folha: 674000 },
      { loja: "VS10", headcount: 162, vagas: 2, custo_folha: 590000 },
      { loja: "Beira-Rio", headcount: 148, vagas: 2, custo_folha: 540000 },
      { loja: "Faruk", headcount: 132, vagas: 2, custo_folha: 481000 },
      { loja: "Canaã dos Carajás", headcount: 105, vagas: 2, custo_folha: 383000 },
      { loja: "Núcleo Urbano", headcount: 82, vagas: 1, custo_folha: 299000 },
      { loja: "Xinguara", headcount: 58, vagas: 1, custo_folha: 211000 },
      { loja: "CD Central", headcount: 20, vagas: 1, custo_folha: 72000 },
    ],
    por_departamento: [
      { dept: "Operações de Loja", headcount: 520, custo_medio: 2800 },
      { dept: "Açougue/Padaria", headcount: 145, custo_medio: 3200 },
      { dept: "Administrativo", headcount: 68, custo_medio: 4500 },
      { dept: "Marketing", headcount: 22, custo_medio: 5800 },
      { dept: "TI", headcount: 12, custo_medio: 7200 },
      { dept: "RH", headcount: 8, custo_medio: 5500 },
      { dept: "CD/Logística", headcount: 20, custo_medio: 3800 },
      { dept: "Diretoria", headcount: 7, custo_medio: 18000 },
    ]
  },
  indicadores: {
    turnover_mensal: 3.2, turnover_anual: 38.4, absenteismo: 4.8,
    horas_extras_pct: 7.2, custo_fte_medio: 3643, tempo_medio_admissao_dias: 18,
    satisfacao_interna: 72, acidentes_trabalho_mes: 2, afastamentos_ativos: 8,
    por_loja: [
      { loja: "Cidade Jardim", turnover: 2.1, absenteismo: 3.5, satisfacao: 78 },
      { loja: "VS10", turnover: 2.8, absenteismo: 4.2, satisfacao: 75 },
      { loja: "Beira-Rio", turnover: 3.5, absenteismo: 5.1, satisfacao: 70 },
      { loja: "Faruk", turnover: 3.0, absenteismo: 4.5, satisfacao: 72 },
      { loja: "Canaã dos Carajás", turnover: 3.8, absenteismo: 5.5, satisfacao: 68 },
      { loja: "Núcleo Urbano", turnover: 4.5, absenteismo: 6.2, satisfacao: 62 },
      { loja: "Xinguara", turnover: 5.2, absenteismo: 7.0, satisfacao: 58 },
    ]
  },
  treinamentos: [
    { trilha: "Segurança Alimentar (obrigatória)", status: "78% concluído", vencimento: "2026-06-30", colaboradores: 520, horas: 8 },
    { trilha: "Atendimento ao Cliente", status: "62% concluído", vencimento: "2026-04-30", colaboradores: 650, horas: 12 },
    { trilha: "Operação de Caixa", status: "91% concluído", vencimento: null, colaboradores: 180, horas: 6 },
    { trilha: "Liderança para Gestores", status: "45% concluído", vencimento: "2026-05-15", colaboradores: 42, horas: 24 },
    { trilha: "Prevenção de Perdas", status: "55% concluído", vencimento: "2026-07-30", colaboradores: 280, horas: 6 },
    { trilha: "NR-12 Máquinas e Equipamentos", status: "82% concluído", vencimento: "2026-08-15", colaboradores: 145, horas: 4 },
  ],
  admissoes_demissoes: {
    admissoes_mes: 18, demissoes_mes: 28, saldo: -10,
    motivos_demissao: [
      { motivo: "Pedido pelo colaborador", pct: 42 },
      { motivo: "Justa causa", pct: 15 },
      { motivo: "Contrato experiência", pct: 22 },
      { motivo: "Reestruturação", pct: 12 },
      { motivo: "Outros", pct: 9 },
    ]
  }
};

// ============================================================================
// MOCK DATA — Compras
// ============================================================================
const MOCK_COMPRAS = {
  pedidos: [
    { po: "PO-2026-0456", fornecedor: "Nestlé", valor: 185000, status: "aprovado", prazo: "2026-03-06", itens: 15, categoria: "Alimentos" },
    { po: "PO-2026-0461", fornecedor: "Ambev", valor: 220000, status: "recebendo", prazo: "2026-03-05", itens: 22, categoria: "Bebidas" },
    { po: "PO-2026-0470", fornecedor: "BRF", valor: 142000, status: "pendente", prazo: "2026-03-10", itens: 8, categoria: "Carnes" },
    { po: "PO-2026-0475", fornecedor: "Unilever", valor: 98000, status: "aprovado", prazo: "2026-03-08", itens: 12, categoria: "Limpeza/Higiene" },
    { po: "PO-2026-0480", fornecedor: "Coca-Cola", valor: 175000, status: "rascunho", prazo: "2026-03-12", itens: 18, categoria: "Bebidas" },
    { po: "PO-2026-0482", fornecedor: "JBS", valor: 165000, status: "aprovado", prazo: "2026-03-09", itens: 10, categoria: "Carnes" },
    { po: "PO-2026-0488", fornecedor: "Camil", valor: 78000, status: "pendente", prazo: "2026-03-11", itens: 6, categoria: "Grãos" },
    { po: "PO-2026-0492", fornecedor: "Pepsico", valor: 95000, status: "aprovado", prazo: "2026-03-07", itens: 14, categoria: "Snacks" },
  ],
  saving: { 
    periodo: "2026-02", saving_total: 285000, saving_pct: 4.2, 
    por_categoria: [
      { categoria: "Bebidas", saving: 95000, pct: 5.1, volume_compras: 1862000 },
      { categoria: "Mercearia", saving: 72000, pct: 3.8, volume_compras: 1894000 },
      { categoria: "Limpeza", saving: 48000, pct: 4.5, volume_compras: 1067000 },
      { categoria: "Carnes", saving: 42000, pct: 3.2, volume_compras: 1312500 },
      { categoria: "Laticínios", saving: 28000, pct: 3.9, volume_compras: 717949 },
    ]
  },
  fornecedores_performance: [
    { fornecedor: "Nestlé", otif: 96.5, lead_time_dias: 3, devolucoes_pct: 0.8, volume_mensal: 380000 },
    { fornecedor: "Ambev", otif: 94.2, lead_time_dias: 2, devolucoes_pct: 1.2, volume_mensal: 520000 },
    { fornecedor: "BRF", otif: 91.3, lead_time_dias: 4, devolucoes_pct: 2.1, volume_mensal: 285000 },
    { fornecedor: "Unilever", otif: 97.1, lead_time_dias: 3, devolucoes_pct: 0.5, volume_mensal: 196000 },
    { fornecedor: "Coca-Cola", otif: 95.8, lead_time_dias: 2, devolucoes_pct: 0.9, volume_mensal: 350000 },
    { fornecedor: "JBS", otif: 88.4, lead_time_dias: 5, devolucoes_pct: 3.2, volume_mensal: 330000 },
    { fornecedor: "P&G", otif: 98.0, lead_time_dias: 3, devolucoes_pct: 0.3, volume_mensal: 180000 },
  ],
  matriz_giro_margem: [
    { categoria: "Bebidas", giro: 18.5, margem_pct: 18.7, gmroi: 3.46, classificacao: "Cash Cow" },
    { categoria: "Mercearia", giro: 12.2, margem_pct: 22.5, gmroi: 2.75, classificacao: "Estrela" },
    { categoria: "Perecíveis", giro: 24.1, margem_pct: 28.3, gmroi: 6.82, classificacao: "Estrela" },
    { categoria: "Limpeza", giro: 8.5, margem_pct: 25.4, gmroi: 2.16, classificacao: "Oportunidade" },
    { categoria: "Higiene", giro: 7.2, margem_pct: 32.1, gmroi: 2.31, classificacao: "Oportunidade" },
    { categoria: "Hortifruti", giro: 30.0, margem_pct: 35.2, gmroi: 10.56, classificacao: "Estrela" },
    { categoria: "Açougue", giro: 22.0, margem_pct: 20.8, gmroi: 4.58, classificacao: "Cash Cow" },
    { categoria: "Padaria", giro: 28.0, margem_pct: 45.0, gmroi: 12.60, classificacao: "Estrela" },
  ]
};

// ============================================================================
// MOCK DATA — Cliente
// ============================================================================
const MOCK_CLIENTE = {
  nps: {
    rede: 62, evolucao: [
      { mes: "Set/25", nps: 55 }, { mes: "Out/25", nps: 58 }, { mes: "Nov/25", nps: 60 },
      { mes: "Dez/25", nps: 59 }, { mes: "Jan/26", nps: 61 }, { mes: "Fev/26", nps: 62 },
    ],
    por_loja: [
      { loja: "Cidade Jardim", nps: 72, respostas: 850, promotores: 65, detratores: 12 },
      { loja: "VS10", nps: 68, respostas: 720, promotores: 58, detratores: 14 },
      { loja: "Beira-Rio", nps: 60, respostas: 580, promotores: 52, detratores: 18 },
      { loja: "Faruk", nps: 58, respostas: 490, promotores: 48, detratores: 20 },
      { loja: "Canaã dos Carajás", nps: 55, respostas: 380, promotores: 45, detratores: 22 },
      { loja: "Núcleo Urbano", nps: 48, respostas: 210, promotores: 38, detratores: 28 },
      { loja: "Xinguara", nps: 45, respostas: 150, promotores: 35, detratores: 30 },
    ]
  },
  reclamacoes: [
    { id: "REC-001", loja: "Beira-Rio", categoria: "Fila no caixa", status: "aberta", data: "2026-03-04", prioridade: "alta", tempo_resposta_horas: null },
    { id: "REC-002", loja: "Núcleo Urbano", categoria: "Produto vencido", status: "em_tratamento", data: "2026-03-03", prioridade: "critica", tempo_resposta_horas: 4 },
    { id: "REC-003", loja: "VS10", categoria: "Atendimento", status: "resolvida", data: "2026-03-01", prioridade: "media", tempo_resposta_horas: 12 },
    { id: "REC-004", loja: "Xinguara", categoria: "Preço divergente", status: "aberta", data: "2026-03-05", prioridade: "alta", tempo_resposta_horas: null },
    { id: "REC-005", loja: "Cidade Jardim", categoria: "Estacionamento", status: "resolvida", data: "2026-02-28", prioridade: "baixa", tempo_resposta_horas: 48 },
    { id: "REC-006", loja: "Faruk", categoria: "Ruptura de produto", status: "em_tratamento", data: "2026-03-04", prioridade: "alta", tempo_resposta_horas: 6 },
    { id: "REC-007", loja: "Canaã dos Carajás", categoria: "Limpeza da loja", status: "aberta", data: "2026-03-05", prioridade: "media", tempo_resposta_horas: null },
  ],
  segmentacao: {
    total_clientes: 185000, ticket_medio: 148.50, frequencia_media: 3.2,
    segmentos: [
      { nome: "Premium", pct: 8, ticket_medio: 420, frequencia: 5.2, clientes: 14800, receita_mensal: 3225600 },
      { nome: "Regular", pct: 52, ticket_medio: 165, frequencia: 3.5, clientes: 96200, receita_mensal: 5555550 },
      { nome: "Esporádico", pct: 28, ticket_medio: 85, frequencia: 1.8, clientes: 51800, receita_mensal: 792540 },
      { nome: "Novo", pct: 12, ticket_medio: 110, frequencia: 1.2, clientes: 22200, receita_mensal: 293040 },
    ],
    churn_rate: 5.8, reativacao_rate: 12.3
  },
  satisfacao_por_area: [
    { area: "Variedade de produtos", nota: 8.2 },
    { area: "Atendimento", nota: 7.5 },
    { area: "Preços", nota: 6.8 },
    { area: "Limpeza/Organização", nota: 8.0 },
    { area: "Estacionamento", nota: 6.2 },
    { area: "Tempo de espera caixa", nota: 5.8 },
  ]
};

// ============================================================================
// MOCK DATA — Tech
// ============================================================================
const MOCK_TECH = {
  incidentes: [
    { id: "INC-421", titulo: "PDV 3 Cidade Jardim offline", prioridade: "critica", status: "em_andamento", sla_restante: "2h", impacto: "1 caixa inoperante", responsavel: "Carlos TI" },
    { id: "INC-419", titulo: "Link internet Xinguara instável", prioridade: "alta", status: "aberto", sla_restante: "6h", impacto: "Intermitência nos PDVs", responsavel: "ISP Local" },
    { id: "INC-418", titulo: "Impressora etiquetas CD com defeito", prioridade: "media", status: "aguardando_peca", sla_restante: "24h", impacto: "Etiquetagem manual", responsavel: "Fornecedor Zebra" },
    { id: "INC-415", titulo: "Atualização ERP módulo fiscal", prioridade: "baixa", status: "agendado", sla_restante: "48h", impacto: "Nenhum (preventivo)", responsavel: "Winthor" },
    { id: "INC-422", titulo: "Balança Seção Hortifruti VS10 descalibrada", prioridade: "alta", status: "aberto", sla_restante: "4h", impacto: "Pesagem incorreta", responsavel: "Manutenção" },
    { id: "INC-423", titulo: "Servidor backup Faruk com disco cheio", prioridade: "media", status: "em_andamento", sla_restante: "12h", impacto: "Backup suspenso", responsavel: "Carlos TI" },
  ],
  infra: {
    pdvs_total: 85, pdvs_online: 83, pdvs_offline: 2,
    servidores: { total: 12, saudaveis: 11, alerta: 1, ultimo_backup: "2026-03-05 02:00" },
    links: { total: 8, up: 7, degradado: 1, down: 0 },
    uptime_30d: 99.4,
    por_loja: [
      { loja: "Cidade Jardim", pdvs: 18, online: 17, link_status: "up" },
      { loja: "VS10", pdvs: 15, online: 15, link_status: "up" },
      { loja: "Beira-Rio", pdvs: 14, online: 14, link_status: "up" },
      { loja: "Faruk", pdvs: 12, online: 12, link_status: "up" },
      { loja: "Canaã dos Carajás", pdvs: 10, online: 10, link_status: "up" },
      { loja: "Núcleo Urbano", pdvs: 8, online: 8, link_status: "up" },
      { loja: "Xinguara", pdvs: 6, online: 5, link_status: "degradado" },
      { loja: "CD Central", pdvs: 2, online: 2, link_status: "up" },
    ]
  },
  projetos: [
    { nome: "Migração PDVs para Linux", status: "em_andamento", progresso: 65, previsao: "2026-05-30", responsavel: "Time TI" },
    { nome: "Implantação BI Domínio", status: "em_andamento", progresso: 80, previsao: "2026-04-15", responsavel: "Araripe.me" },
    { nome: "Novo sistema de câmeras", status: "planejado", progresso: 10, previsao: "2026-06-30", responsavel: "Integrador" },
    { nome: "Wi-Fi para clientes (5 lojas)", status: "concluido", progresso: 100, previsao: "2026-02-28", responsavel: "ISP" },
  ]
};

// ============================================================================
// MOCK DATA — Academy
// ============================================================================
const MOCK_ACADEMY = {
  trilhas: [
    { nome: "Onboarding Novos Colaboradores", area: "Geral", inscritos: 45, concluidos: 32, media_nota: 8.5, duracao_horas: 16, obrigatoria: true },
    { nome: "Segurança Alimentar - NR12", area: "Operações", inscritos: 520, concluidos: 405, media_nota: 7.8, duracao_horas: 8, obrigatoria: true },
    { nome: "Excelência no Atendimento", area: "Frente de Loja", inscritos: 650, concluidos: 403, media_nota: 8.2, duracao_horas: 12, obrigatoria: false },
    { nome: "Gestão de Perecíveis", area: "Açougue/Hortifruti", inscritos: 145, concluidos: 98, media_nota: 7.5, duracao_horas: 10, obrigatoria: true },
    { nome: "Liderança e Gestão de Equipes", area: "Gestão", inscritos: 42, concluidos: 19, media_nota: 9.0, duracao_horas: 24, obrigatoria: false },
    { nome: "Prevenção de Perdas", area: "Segurança", inscritos: 280, concluidos: 195, media_nota: 7.9, duracao_horas: 6, obrigatoria: true },
    { nome: "Manuseio de Alimentos - Frios", area: "Operações", inscritos: 145, concluidos: 112, media_nota: 8.1, duracao_horas: 4, obrigatoria: true },
    { nome: "Técnicas de Vendas Varejo", area: "Comercial", inscritos: 320, concluidos: 180, media_nota: 7.6, duracao_horas: 8, obrigatoria: false },
  ],
  kpis: {
    total_horas_treinamento: 12480,
    horas_por_colaborador: 14.0,
    taxa_conclusao_geral: 68.5,
    investimento_mensal: 42000,
    certificacoes_ativas: 720,
    certificacoes_vencidas: 85,
    proximas_vencer_30d: 45,
  },
  ranking_lojas: [
    { loja: "Cidade Jardim", conclusao_pct: 82, horas_media: 18.5 },
    { loja: "VS10", conclusao_pct: 75, horas_media: 16.2 },
    { loja: "Beira-Rio", conclusao_pct: 70, horas_media: 14.8 },
    { loja: "Faruk", conclusao_pct: 68, horas_media: 13.5 },
    { loja: "Canaã dos Carajás", conclusao_pct: 62, horas_media: 11.2 },
    { loja: "Núcleo Urbano", conclusao_pct: 55, horas_media: 9.8 },
    { loja: "Xinguara", conclusao_pct: 48, horas_media: 8.0 },
  ]
};

// ============================================================================
// MOCK DATA — Marketing (Marketing OS)
// ============================================================================
const MOCK_GESTAO = {
  demandas: {
    total: 42, abertas: 12, em_producao: 8, aguardando_aprovacao: 6, concluidas: 16,
    por_tipo: [
      { tipo: "Post Redes Sociais", qty: 15 },
      { tipo: "Banner Impresso", qty: 8 },
      { tipo: "Encarte Digital", qty: 7 },
      { tipo: "Vídeo", qty: 5 },
      { tipo: "Material PDV", qty: 4 },
      { tipo: "E-mail Marketing", qty: 3 },
    ]
  },
  campanhas_ativas: [
    { nome: "Semana do Consumidor 2026", status: "em_andamento", inicio: "2026-03-01", fim: "2026-03-15", orcamento: 85000, gasto: 42000, roi_parcial: 180 },
    { nome: "Páscoa 2026", status: "planejamento", inicio: "2026-04-01", fim: "2026-04-20", orcamento: 120000, gasto: 0, roi_parcial: null },
    { nome: "Aniversário Cidade Jardim", status: "em_andamento", inicio: "2026-02-25", fim: "2026-03-10", orcamento: 45000, gasto: 38000, roi_parcial: 245 },
  ],
  score_urgencia: 72,
  equipe: {
    total: 22, disponiveis: 15, sobrecarregados: 4, ferias: 3,
    areas: [
      { area: "Design", membros: 6, demandas_ativas: 12 },
      { area: "Social Media", membros: 5, demandas_ativas: 8 },
      { area: "Trade Marketing", membros: 4, demandas_ativas: 6 },
      { area: "Vídeo", membros: 3, demandas_ativas: 4 },
      { area: "Estratégia", membros: 4, demandas_ativas: 3 },
    ]
  }
};

// ============================================================================
// TOOL EXECUTION
// ============================================================================
async function executeToolCall(toolName: string, args: any, supabase: any): Promise<string> {
  try {
    switch (toolName) {
      // === Trade (real DB) ===
      case "get_suppliers": {
        let query = supabase.from('suppliers').select('*');
        if (args.active_only) query = query.eq('is_active', true);
        if (args.search) query = query.ilike('name', `%${args.search}%`);
        const { data, error } = await query.order('name');
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ source: "Trade", suppliers: data || [] });
      }
      case "get_trade_packages": {
        let query = supabase.from('trade_packages').select('*, suppliers(name)');
        if (args.supplier_id) query = query.eq('supplier_id', args.supplier_id);
        if (args.status) query = query.eq('status', args.status);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ source: "Trade", packages: data || [] });
      }
      case "get_checklists": {
        let query = supabase.from('trade_checklist_items').select('*, trade_packages(title)');
        if (args.package_id) query = query.eq('package_id', args.package_id);
        if (args.status) query = query.eq('status', args.status);
        const { data, error } = await query;
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ source: "Trade", checklists: data || [] });
      }
      case "get_trade_proofs": {
        let query = supabase.from('trade_proofs').select('*');
        if (args.status) query = query.eq('status', args.status);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ source: "Trade", proofs: data || [] });
      }

      // === Ofertas (real DB) ===
      case "get_campaigns": {
        let query = supabase.from('campaigns').select('*');
        if (args.status) query = query.eq('status', args.status);
        if (args.limit) query = query.limit(args.limit);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ source: "Ofertas", campaigns: data || [] });
      }
      case "get_contacts_stats": {
        const { data: contacts, error } = await supabase.from('contacts').select('status');
        if (error) return JSON.stringify({ error: error.message });
        const total = contacts?.length || 0;
        const active = contacts?.filter((c: any) => c.status === 'active').length || 0;
        return JSON.stringify({ source: "Ofertas", stats: { total, active, engagement_rate: total > 0 ? ((active / total) * 100).toFixed(1) + '%' : '0%' } });
      }
      case "get_units": {
        let query = supabase.from('units').select('*');
        if (args.active_only) query = query.eq('is_active', true);
        const { data, error } = await query.order('name');
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ source: "Ofertas", units: data || [] });
      }

      // === Marketing (real DB + fallback) ===
      case "get_budget_overview": {
        const year = args.year || new Date().getFullYear();
        const { data } = await supabase.from('marketing_budgets').select('*, marketing_budget_categories(*)').eq('year', year).single();
        if (!data) return JSON.stringify({ source: "Marketing", budget: { year, total: 1500000, spent: 524500, remaining: 975500, execution_rate: "35%" } });
        const totalSpent = (data.marketing_budget_categories || []).reduce((s: number, c: any) => s + (c.spent_amount || 0), 0);
        return JSON.stringify({ source: "Marketing", budget: { year: data.year, total: data.total_budget, spent: totalSpent, remaining: data.total_budget - totalSpent, execution_rate: ((totalSpent / data.total_budget) * 100).toFixed(1) + '%' } });
      }
      case "get_budget_by_category": {
        const { data } = await supabase.from('marketing_budget_categories').select('*').order('allocated_amount', { ascending: false });
        let result = data || [];
        if (args.category) result = result.filter((c: any) => c.name?.toLowerCase().includes(args.category.toLowerCase()));
        return JSON.stringify({ source: "Marketing", categories: result });
      }
      case "get_marketing_kpis": {
        const { data } = await supabase.from('marketing_kpis').select('*').order('period_start', { ascending: false }).limit(1).single();
        return JSON.stringify({ source: "Marketing", kpis: data || { roi: 215, cac: 9.80, ltv: 1450, conversion_rate: 5.2, nps: 72 } });
      }
      case "get_coop_funds": {
        let query = supabase.from('marketing_coop_funds').select('*, suppliers(name)');
        if (args.supplier_id) query = query.eq('supplier_id', args.supplier_id);
        if (args.status) query = query.eq('status', args.status);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ source: "Marketing", coop_funds: data || [] });
      }

      // === Winthor/ERP (mock) ===
      case "get_stock_levels": {
        const products = [
          { codigo: "N001", nome: "NESCAU 800g", categoria: "Achocolatados", estoque: 245, minimo: 100, status: "OK" },
          { codigo: "N003", nome: "KITKAT ao Leite 45g", categoria: "Chocolates", estoque: 1250, minimo: 500, status: "OK" },
          { codigo: "P001", nome: "Arroz Tio João 5kg", categoria: "Grãos", estoque: 45, minimo: 200, status: "CRÍTICO" },
          { codigo: "P002", nome: "Cerveja Brahma 350ml", categoria: "Bebidas", estoque: 12, minimo: 500, status: "RUPTURA" },
          { codigo: "N005", nome: "LEITE MOÇA 395g", categoria: "Leite Condensado", estoque: 720, minimo: 300, status: "OK" },
        ];
        let filtered = products;
        if (args.product_name) filtered = filtered.filter(p => p.nome.toLowerCase().includes(args.product_name.toLowerCase()));
        if (args.category) filtered = filtered.filter(p => p.categoria.toLowerCase().includes(args.category.toLowerCase()));
        if (args.low_stock_only) filtered = filtered.filter(p => p.status !== "OK");
        return JSON.stringify({ source: "Winthor ERP", products: filtered });
      }
      case "get_sales_data": {
        return JSON.stringify({ source: "Winthor ERP", period: args.period || "today", data: { faturamento: "R$ 413.500", variacao: "+12%", ticketMedio: "R$ 148,50", transacoes: 2847, topCategorias: [{ nome: "Alimentos", valor: "R$ 142.000" }, { nome: "Bebidas", valor: "R$ 98.500" }, { nome: "Limpeza", valor: "R$ 67.200" }] } });
      }
      case "get_nestle_partnership_data": {
        const result: any = { source: "Marketing + Winthor", partnership: { supplier: "Nestlé", period: "27/10/2025 a 27/01/2026", investment: 126000, revenue: 381000, roi: 285, growth: 37, status: "Concluída com sucesso" } };
        if (args.include_comparison) result.comparison = { metrics: [{ metric: "Vendas Nestlé", q1: "R$ 381.000", q2: "R$ 285.000", status: "↓ -25%" }, { metric: "ROI", q1: "285%", q2: "N/A" }, { metric: "Market Share", q1: "5.8%", q2: "4.9%" }] };
        if (args.include_stores) result.stores = [{ loja: "Cidade Jardim", vendas: "R$ 89.500", roi: "315%" }, { loja: "VS10", vendas: "R$ 78.200", roi: "298%" }, { loja: "Beira-Rio", vendas: "R$ 65.400", roi: "275%" }];
        return JSON.stringify(result);
      }

      // === Loja (mock) ===
      case "get_loja_rentabilidade": {
        let data = MOCK_LOJA.rentabilidade;
        if (args.loja) data = data.filter(d => d.loja.toLowerCase().includes(args.loja.toLowerCase()));
        if (args.secao) data = data.filter(d => d.secao.toLowerCase().includes(args.secao.toLowerCase()));
        return JSON.stringify({ source: "Loja", rentabilidade: data });
      }
      case "get_loja_precificacao": {
        const result: any = { source: "Loja", iap_rede: MOCK_LOJA.precificacao.iap_rede, iap_por_loja: MOCK_LOJA.precificacao.iap_por_loja, skus_pac: MOCK_LOJA.precificacao.skus_pac };
        if (args.loja) result.iap_por_loja = result.iap_por_loja.filter((d: any) => d.loja.toLowerCase().includes(args.loja.toLowerCase()));
        return JSON.stringify(result);
      }
      case "get_loja_perdas": {
        let data = MOCK_LOJA.perdas.por_loja;
        if (args.loja) data = data.filter(d => d.loja.toLowerCase().includes(args.loja.toLowerCase()));
        return JSON.stringify({ source: "Loja", ip_rede: MOCK_LOJA.perdas.ip_rede, por_loja: data });
      }
      case "get_loja_comparativo": {
        return JSON.stringify({ source: "Loja", comparativo: MOCK_LOJA.comparativo, kpi_solicitado: args.kpi || "todos" });
      }

      // === Financeiro (mock) ===
      case "get_fin_dre": {
        if (args.loja) {
          const margem = MOCK_FIN.margens_por_loja.find(m => m.loja.toLowerCase().includes(args.loja.toLowerCase()));
          return JSON.stringify({ source: "Financeiro", dre: margem ? { ...margem, nota: "DRE simplificado por loja" } : { error: "Loja não encontrada" } });
        }
        return JSON.stringify({ source: "Financeiro", dre: MOCK_FIN.dre_rede });
      }
      case "get_fin_margens": {
        let data = MOCK_FIN.margens_por_loja;
        if (args.loja) data = data.filter(m => m.loja.toLowerCase().includes(args.loja.toLowerCase()));
        return JSON.stringify({ source: "Financeiro", margens: data });
      }
      case "get_fin_alertas": {
        return JSON.stringify({ source: "Financeiro", alertas: MOCK_FIN.alertas });
      }

      // === CD (mock) ===
      case "get_cd_estoque": {
        let data = MOCK_CD.estoque;
        if (args.categoria) data = data.filter(d => d.categoria.toLowerCase().includes(args.categoria.toLowerCase()));
        if (args.critico_only) data = data.filter(d => d.status !== "disponivel");
        return JSON.stringify({ source: "CD", estoque: data });
      }
      case "get_cd_recebimento": {
        let data = MOCK_CD.recebimentos;
        if (args.status) data = data.filter(d => d.status === args.status);
        return JSON.stringify({ source: "CD", recebimentos: data });
      }
      case "get_cd_expedicao": {
        let data = MOCK_CD.expedicao;
        if (args.loja_destino) data = data.filter(d => d.loja_destino.toLowerCase().includes(args.loja_destino.toLowerCase()));
        if (args.status) data = data.filter(d => d.status === args.status);
        return JSON.stringify({ source: "CD", expedicao: data });
      }
      case "get_cd_kpis": {
        return JSON.stringify({ source: "CD", kpis: MOCK_CD.kpis });
      }

      // === RH (mock) ===
      case "get_rh_quadro": {
        const result: any = { source: "RH", headcount_total: MOCK_RH.quadro.headcount_total, vagas_abertas: MOCK_RH.quadro.vagas_abertas, custo_folha_mensal: MOCK_RH.quadro.custo_folha_mensal };
        if (args.loja) result.por_loja = MOCK_RH.quadro.por_loja.filter(l => l.loja.toLowerCase().includes(args.loja.toLowerCase()));
        else result.por_loja = MOCK_RH.quadro.por_loja;
        if (args.departamento) result.por_departamento = MOCK_RH.quadro.por_departamento.filter(d => d.dept.toLowerCase().includes(args.departamento.toLowerCase()));
        else result.por_departamento = MOCK_RH.quadro.por_departamento;
        return JSON.stringify(result);
      }
      case "get_rh_indicadores": {
        return JSON.stringify({ source: "RH", indicadores: MOCK_RH.indicadores });
      }
      case "get_rh_treinamentos": {
        let data = MOCK_RH.treinamentos;
        if (args.area) data = data.filter(t => t.trilha.toLowerCase().includes(args.area.toLowerCase()));
        return JSON.stringify({ source: "RH", treinamentos: data });
      }

      // === Compras (mock) ===
      case "get_compras_pedidos": {
        let data = MOCK_COMPRAS.pedidos;
        if (args.status) data = data.filter(p => p.status === args.status);
        if (args.fornecedor) data = data.filter(p => p.fornecedor.toLowerCase().includes(args.fornecedor.toLowerCase()));
        return JSON.stringify({ source: "Compras", pedidos: data });
      }
      case "get_compras_saving": {
        return JSON.stringify({ source: "Compras", saving: MOCK_COMPRAS.saving });
      }
      case "get_compras_fornecedores": {
        let data = MOCK_COMPRAS.fornecedores_performance;
        if (args.fornecedor) data = data.filter(f => f.fornecedor.toLowerCase().includes(args.fornecedor.toLowerCase()));
        return JSON.stringify({ source: "Compras", fornecedores: data });
      }
      case "get_compras_matriz": {
        return JSON.stringify({ source: "Compras", matriz_giro_margem: MOCK_COMPRAS.matriz_giro_margem });
      }

      // === Cliente (mock) ===
      case "get_cliente_nps": {
        if (args.loja) {
          const loja = MOCK_CLIENTE.nps.por_loja.filter(l => l.loja.toLowerCase().includes(args.loja.toLowerCase()));
          return JSON.stringify({ source: "Cliente", nps: loja });
        }
        return JSON.stringify({ source: "Cliente", nps_rede: MOCK_CLIENTE.nps.rede, evolucao: MOCK_CLIENTE.nps.evolucao, por_loja: MOCK_CLIENTE.nps.por_loja });
      }
      case "get_cliente_reclamacoes": {
        let data = MOCK_CLIENTE.reclamacoes;
        if (args.status) data = data.filter(r => r.status === args.status);
        if (args.categoria) data = data.filter(r => r.categoria.toLowerCase().includes(args.categoria.toLowerCase()));
        return JSON.stringify({ source: "Cliente", reclamacoes: data });
      }
      case "get_cliente_segmentacao": {
        return JSON.stringify({ source: "Cliente", segmentacao: MOCK_CLIENTE.segmentacao });
      }
      case "get_cliente_satisfacao": {
        return JSON.stringify({ source: "Cliente", satisfacao_por_area: MOCK_CLIENTE.satisfacao_por_area });
      }

      // === Tech (mock) ===
      case "get_tech_incidentes": {
        let data = MOCK_TECH.incidentes;
        if (args.status) data = data.filter(i => i.status === args.status);
        if (args.prioridade) data = data.filter(i => i.prioridade === args.prioridade);
        return JSON.stringify({ source: "Tech", incidentes: data });
      }
      case "get_tech_infra": {
        return JSON.stringify({ source: "Tech", infra: MOCK_TECH.infra });
      }
      case "get_tech_projetos": {
        return JSON.stringify({ source: "Tech", projetos: MOCK_TECH.projetos });
      }

      // === Academy (mock) ===
      case "get_academy_trilhas": {
        let data = MOCK_ACADEMY.trilhas;
        if (args.area) data = data.filter(t => t.area.toLowerCase().includes(args.area.toLowerCase()));
        return JSON.stringify({ source: "Academy", trilhas: data });
      }
      case "get_academy_kpis": {
        return JSON.stringify({ source: "Academy", kpis: MOCK_ACADEMY.kpis });
      }
      case "get_academy_ranking": {
        return JSON.stringify({ source: "Academy", ranking: MOCK_ACADEMY.ranking_lojas });
      }

      // === Marketing (mock) ===
      case "get_gestao_demandas": {
        return JSON.stringify({ source: "Marketing", demandas: MOCK_GESTAO.demandas, score_urgencia: MOCK_GESTAO.score_urgencia });
      }
      case "get_gestao_campanhas": {
        return JSON.stringify({ source: "Marketing", campanhas: MOCK_GESTAO.campanhas_ativas });
      }
      case "get_gestao_equipe": {
        return JSON.stringify({ source: "Marketing", equipe: MOCK_GESTAO.equipe });
      }

      // === Document Generation ===
      case "generate_document": {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        try {
          const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-document`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
            body: JSON.stringify({ format: args.format, title: args.title, content: args.content || "", structured_data: args.structured_data || null })
          });
          if (!response.ok) return JSON.stringify({ success: false, error: "Erro ao gerar documento" });
          const result = await response.json();
          return JSON.stringify({ success: true, message: `Documento "${args.title}" gerado!`, download_url: result.url, filename: result.filename });
        } catch { return JSON.stringify({ success: false, error: "Erro ao gerar documento" }); }
      }

      default:
        return JSON.stringify({ error: `Ferramenta desconhecida: ${toolName}` });
    }
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error);
    return JSON.stringify({ error: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
  }
}

// ============================================================================
// TOOL GROUP MAP
// ============================================================================
const TOOL_GROUP_MAP: Record<string, string[]> = {
  trade: ["get_suppliers", "get_trade_packages", "get_checklists", "get_trade_proofs"],
  ofertas: ["get_campaigns", "get_contacts_stats", "get_units"],
  marketing: ["get_budget_overview", "get_budget_by_category", "get_marketing_kpis", "get_coop_funds"],
  erp: ["get_stock_levels", "get_sales_data", "get_nestle_partnership_data"],
  loja: ["get_loja_rentabilidade", "get_loja_precificacao", "get_loja_perdas", "get_loja_comparativo"],
  financeiro: ["get_fin_dre", "get_fin_margens", "get_fin_alertas"],
  cd: ["get_cd_estoque", "get_cd_recebimento", "get_cd_expedicao", "get_cd_kpis"],
  rh: ["get_rh_quadro", "get_rh_indicadores", "get_rh_treinamentos"],
  compras: ["get_compras_pedidos", "get_compras_saving", "get_compras_fornecedores", "get_compras_matriz"],
  cliente: ["get_cliente_nps", "get_cliente_reclamacoes", "get_cliente_segmentacao", "get_cliente_satisfacao"],
  tech: ["get_tech_incidentes", "get_tech_infra", "get_tech_projetos"],
  academy: ["get_academy_trilhas", "get_academy_kpis", "get_academy_ranking"],
  gestao: ["get_gestao_demandas", "get_gestao_campanhas", "get_gestao_equipe"],
};


// ============================================================================
// MAIN HANDLER
// ============================================================================
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Serviço de IA não configurado" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const authClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Sessão expirada." }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { messages, thinkingMode = 'standard', connectedToolGroups = [], selectedModel } = await req.json();
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Tool filtering
    const alwaysAvailableTools = ["generate_document"];
    const allowedToolNames = new Set<string>(alwaysAvailableTools);
    
    if (connectedToolGroups.length > 0) {
      for (const group of connectedToolGroups) {
        for (const name of (TOOL_GROUP_MAP[group] || [])) allowedToolNames.add(name);
      }
    } else {
      for (const tool of TOOLS) allowedToolNames.add(tool.function.name);
    }

    const filteredTools = TOOLS.filter(t => allowedToolNames.has(t.function.name));
    console.log(`NexusIA: Connected groups: [${connectedToolGroups.join(', ')}], Tools: ${filteredTools.length}/${TOOLS.length}`);

    // Quota check
    const { data: roleRow } = await supabase.from("user_roles").select("tenant_id").eq("user_id", user.id).maybeSingle();
    if (!roleRow?.tenant_id) {
      return new Response(JSON.stringify({ error: "Tenant não identificado." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: canUseAI } = await supabase.rpc("check_quota", { p_tenant_id: roleRow.tenant_id, p_quota_type: "ai_queries" });
    if (!canUseAI) {
      return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Model selection: use explicit selectedModel from frontend, or fallback to thinkingMode
    const model = selectedModel 
      || (thinkingMode === 'extended' ? "google/gemini-2.5-pro" : "google/gemini-3-flash-preview");

    console.log(`NexusIA: Model=${model}, ThinkingMode=${thinkingMode}`);

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const sendEvent = async (type: string, data: any) => {
      const event = JSON.stringify({ type, ...data });
      await writer.write(encoder.encode(`data: ${event}\n\n`));
    };

    (async () => {
      try {
        const allMessages = [{ role: "system", content: SYSTEM_PROMPT }, ...messages];

        let response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model, messages: allMessages, tools: filteredTools, tool_choice: "auto" }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("AI error:", response.status, errorText);
          if (response.status === 429) { await sendEvent("error", { message: "Limite de requisições.", status: 429 }); await writer.close(); return; }
          if (response.status === 402) { await sendEvent("error", { message: "Créditos insuficientes.", status: 402 }); await writer.close(); return; }
          await sendEvent("error", { message: "Erro ao processar" }); await writer.close(); return;
        }

        let result = await response.json();
        let assistantMessage = result.choices?.[0]?.message;

        let iterations = 0;
        while (assistantMessage?.tool_calls && iterations < 10) {
          allMessages.push(assistantMessage);
          for (const toolCall of assistantMessage.tool_calls) {
            const toolName = toolCall.function.name;
            const toolArgs = JSON.parse(toolCall.function.arguments || "{}");
            await sendEvent("status", { message: `Consultando ${toolName}...` });
            const toolResult = await executeToolCall(toolName, toolArgs, supabase);
            allMessages.push({ role: "tool", tool_call_id: toolCall.id, content: toolResult });
          }
          await sendEvent("status", { message: "Processando..." });
          response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model, messages: allMessages, tools: filteredTools, tool_choice: "auto" }),
          });
          if (!response.ok) throw new Error(`AI error: ${response.status}`);
          result = await response.json();
          assistantMessage = result.choices?.[0]?.message;
          iterations++;
        }

        await sendEvent("status", { message: null });

        if (assistantMessage?.content) {
          const finalContent = assistantMessage.content;
          let i = 0;
          while (i < finalContent.length) {
            let chunkEnd = Math.min(i + 12, finalContent.length);
            if (chunkEnd < finalContent.length) {
              const nextSpace = finalContent.indexOf(' ', i + 4);
              const nextNewline = finalContent.indexOf('\n', i + 4);
              if (nextSpace > i && nextSpace <= i + 20) chunkEnd = nextSpace + 1;
              else if (nextNewline > i && nextNewline <= i + 20) chunkEnd = nextNewline + 1;
            }
            const chunk = finalContent.slice(i, chunkEnd);
            await writer.write(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`));
            i = chunkEnd;
            await new Promise(resolve => setTimeout(resolve, 8));
          }
        } else {
          const streamResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model, messages: allMessages, stream: true }),
          });
          if (!streamResponse.ok) throw new Error(`Streaming error: ${streamResponse.status}`);
          const reader = streamResponse.body?.getReader();
          if (reader) { while (true) { const { done, value } = await reader.read(); if (done) break; await writer.write(value); } }
        }

        await writer.write(encoder.encode(`data: [DONE]\n\n`));
        await writer.close();
      } catch (error) {
        console.error("Streaming error:", error);
        try { await sendEvent("error", { message: error instanceof Error ? error.message : "Erro" }); await writer.close(); } catch {}
      }
    })();

    return new Response(stream.readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
