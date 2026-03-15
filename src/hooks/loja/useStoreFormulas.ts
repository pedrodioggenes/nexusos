/**
 * Loja — Motor de Fórmulas F-01 a F-21
 * Todas as fórmulas retornam null quando ocorre divisão por zero.
 * null → exibido como "—" na UI.
 *
 * Arredondamento:
 *  - Monetários: 2 casas
 *  - Percentuais: 1 casa
 *  - IPE: 4 casas
 */

// ─── Helpers ──────────────────────────────────────────
function safeDivide(num: number, den: number): number | null {
  if (den === 0 || !isFinite(den)) return null;
  return num / den;
}

function round(v: number | null, decimals: number): number | null {
  if (v === null || !isFinite(v)) return null;
  const f = Math.pow(10, decimals);
  return Math.round(v * f) / f;
}

// ─── F-01 a F-06: Rentabilidade por Espaço ────────────

/** F-01: Receita por m² (R$/m²) = Receita_s / Area_s */
export function calcReceitaM2(receita: number, area: number): number | null {
  return round(safeDivide(receita, area), 2);
}

/** F-02: Margem por m² = MargemBruta_s / Area_s */
export function calcMargemM2(margem: number, area: number): number | null {
  return round(safeDivide(margem, area), 2);
}

/** F-03: Participação Receita % = (Receita_s / Receita_total) * 100 */
export function calcParticipacaoReceita(receitaSecao: number, receitaTotal: number): number | null {
  return round(safeDivide(receitaSecao * 100, receitaTotal), 1);
}

/** F-04: Participação Área % = (Area_s / Area_total) * 100 */
export function calcParticipacaoArea(areaSecao: number, areaTotal: number): number | null {
  return round(safeDivide(areaSecao * 100, areaTotal), 1);
}

/** F-05: IPE = PR_s / PA_s (onde PR = participação receita, PA = participação área) */
export function calcIPE(participacaoReceita: number | null, participacaoArea: number | null): number | null {
  if (participacaoReceita === null || participacaoArea === null) return null;
  return round(safeDivide(participacaoReceita, participacaoArea), 4);
}

/** F-06: Variação IPE % = ((IPE_atual - IPE_anterior) / IPE_anterior) * 100 */
export function calcVariacaoIPE(ipeAtual: number | null, ipeAnterior: number | null): number | null {
  if (ipeAtual === null || ipeAnterior === null) return null;
  return round(safeDivide((ipeAtual - ipeAnterior) * 100, ipeAnterior), 1);
}

// ─── F-07 a F-12: Precificação ────────────────────────

/** F-07: Markup Real = ((PV - Custo) / Custo) * 100 */
export function calcMarkupReal(pv: number, custo: number): number | null {
  return round(safeDivide((pv - custo) * 100, custo), 1);
}

/** F-08: Margem Real % = ((PV - Custo) / PV) * 100 */
export function calcMargemReal(pv: number, custo: number): number | null {
  return round(safeDivide((pv - custo) * 100, pv), 1);
}

/** F-09: Desvio Markup = Markup_real - Markup_meta */
export function calcDesvioMarkup(markupReal: number | null, markupMeta: number): number | null {
  if (markupReal === null) return null;
  return round(markupReal - markupMeta, 1);
}

/** F-10: IAP (Índice de Aderência à Precificação) = (SKUs_aderentes / SKUs_total) * 100 */
export function calcIAP(skusAderentes: number, skusTotal: number): number | null {
  return round(safeDivide(skusAderentes * 100, skusTotal), 1);
}

/** F-11: Impacto Financeiro do Desvio = Σ (PV_real - PV_ideal) * Volume */
export function calcImpactoFinanceiroDesvio(
  items: Array<{ pvReal: number; pvIdeal: number; volume: number }>
): number {
  return round(
    items.reduce((sum, i) => sum + (i.pvReal - i.pvIdeal) * i.volume, 0),
    2
  ) ?? 0;
}

/** F-12: SOV — Sensibilidade ao Volume = ΔReceita / ΔVolume */
export function calcSOV(deltaReceita: number, deltaVolume: number): number | null {
  return round(safeDivide(deltaReceita, deltaVolume), 2);
}

// ─── F-13 a F-17: Perdas ──────────────────────────────

/** F-13: Valor da Perda = Quantidade * Custo_unitário */
export function calcValorPerda(quantidade: number, custoUnitario: number): number {
  return round(quantidade * custoUnitario, 2) ?? 0;
}

/** F-14: IP% = (Valor_perda / Receita_bruta) * 100 */
export function calcIP(valorPerda: number, receitaBruta: number): number | null {
  return round(safeDivide(valorPerda * 100, receitaBruta), 1);
}

/** F-15: Participação por Tipo % = (Perda_tipo / Perda_total) * 100 */
export function calcParticipacaoTipo(perdaTipo: number, perdaTotal: number): number | null {
  return round(safeDivide(perdaTipo * 100, perdaTotal), 1);
}

/** F-16: Desvio Padrão Diário de perdas */
export function calcDesvioPadraoDiario(valoresDiarios: number[]): number | null {
  if (valoresDiarios.length < 2) return null;
  const mean = valoresDiarios.reduce((s, v) => s + v, 0) / valoresDiarios.length;
  const variance = valoresDiarios.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (valoresDiarios.length - 1);
  return round(Math.sqrt(variance), 2);
}

/** F-17: Perda Relativa SKU = IP_sku / IP_secao */
export function calcPerdaRelativaSKU(ipSku: number | null, ipSecao: number | null): number | null {
  if (ipSku === null || ipSecao === null) return null;
  return round(safeDivide(ipSku, ipSecao), 2);
}

// ─── F-18 a F-21: Comparativo ─────────────────────────

/** F-18: Normalização KPI = ((valor - min) / (max - min)) * 100 */
export function calcNormalizacaoKPI(valor: number, min: number, max: number): number | null {
  return round(safeDivide((valor - min) * 100, max - min), 1);
}

/** F-19: IPC = Σ (w_k * KPI_normalizado_k) */
export function calcIPC(kpis: Array<{ peso: number; valorNormalizado: number | null }>): number | null {
  if (kpis.some(k => k.valorNormalizado === null)) return null;
  const soma = kpis.reduce((s, k) => s + k.peso * (k.valorNormalizado ?? 0), 0);
  return round(soma, 1);
}

/** F-20: Distância da Melhor Prática = melhor_valor - valor_loja */
export function calcDistanciaMelhorPratica(melhorValor: number, valorLoja: number): number {
  return round(melhorValor - valorLoja, 2) ?? 0;
}

/** F-21: Same-Store KPI = ((KPI_atual - KPI_anterior) / KPI_anterior) * 100 */
export function calcSameStoreKPI(kpiAtual: number, kpiAnterior: number): number | null {
  return round(safeDivide((kpiAtual - kpiAnterior) * 100, kpiAnterior), 1);
}

// ─── Formatação para UI ───────────────────────────────

export function formatValue(v: number | null, prefix = "", suffix = ""): string {
  if (v === null) return "—";
  return `${prefix}${v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}${suffix}`;
}

export function formatMoney(v: number | null): string {
  if (v === null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatPercent(v: number | null): string {
  if (v === null) return "—";
  return `${v.toFixed(1)}%`;
}

// ─── Hook wrapper ─────────────────────────────────────

export function useStoreFormulas() {
  return {
    // Rentabilidade
    calcReceitaM2,
    calcMargemM2,
    calcParticipacaoReceita,
    calcParticipacaoArea,
    calcIPE,
    calcVariacaoIPE,
    // Precificação
    calcMarkupReal,
    calcMargemReal,
    calcDesvioMarkup,
    calcIAP,
    calcImpactoFinanceiroDesvio,
    calcSOV,
    // Perdas
    calcValorPerda,
    calcIP,
    calcParticipacaoTipo,
    calcDesvioPadraoDiario,
    calcPerdaRelativaSKU,
    // Comparativo
    calcNormalizacaoKPI,
    calcIPC,
    calcDistanciaMelhorPratica,
    calcSameStoreKPI,
    // Formatação
    formatValue,
    formatMoney,
    formatPercent,
  };
}
