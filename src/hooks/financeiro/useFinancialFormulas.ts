/**
 * Financeiro — Motor de Fórmulas F-01 a F-42
 * Todas as fórmulas retornam null quando o denominador é zero (exibido como "—").
 * Monetários: 2 casas decimais. Percentuais: 1 casa decimal.
 */

// Helper: safe division
function safeDiv(numerator: number, denominator: number): number | null {
  if (!denominator || denominator === 0) return null;
  return numerator / denominator;
}

function round2(v: number | null): number | null {
  return v === null ? null : Math.round(v * 100) / 100;
}

function round1(v: number | null): number | null {
  return v === null ? null : Math.round(v * 10) / 10;
}

// ========== DRE (F-01 a F-13) ==========

/** F-01: Receita Líquida */
export function calcRL(rb: number, dev: number, desc: number, imp: number): number {
  return rb - dev - desc - imp;
}

/** F-02: CMV Líquido */
export function calcCMVLiq(cmvBruto: number, perdas: number, bonificacoes: number): number {
  return cmvBruto + perdas - bonificacoes;
}

/** F-03: Lucro Bruto */
export function calcLB(rl: number, cmvLiq: number): number {
  return rl - cmvLiq;
}

/** F-04: Margem Bruta % */
export function calcMB(lb: number, rl: number): number | null {
  return round1(safeDiv(lb * 100, rl));
}

/** F-05: Lucro Bruto Ajustado */
export function calcLBAjustado(lb: number, verbas: number): number {
  return lb + verbas;
}

/** F-06: EBIT */
export function calcEBIT(lbAjustado: number, despOp: number): number {
  return lbAjustado - despOp;
}

/** F-07: Margem Operacional % */
export function calcMO(ebit: number, rl: number): number | null {
  return round1(safeDiv(ebit * 100, rl));
}

/** F-08: EBITDA */
export function calcEBITDA(ebit: number, depAmort: number): number {
  return ebit + depAmort;
}

/** F-09: Margem EBITDA % */
export function calcMEBITDA(ebitda: number, rl: number): number | null {
  return round1(safeDiv(ebitda * 100, rl));
}

/** F-10: LAIR */
export function calcLAIR(ebit: number, resultadoFinanceiro: number): number {
  return ebit + resultadoFinanceiro;
}

/** F-11: Provisão IR */
export function calcIR(lair: number, aliquotaEfetiva: number): number {
  if (lair <= 0) return 0;
  return round2(lair * (aliquotaEfetiva / 100)) ?? 0;
}

/** F-12: Lucro Líquido */
export function calcLL(lair: number, ir: number): number {
  return lair - ir;
}

/** F-13: Margem Líquida % */
export function calcML(ll: number, rl: number): number | null {
  return round1(safeDiv(ll * 100, rl));
}

// ========== Capital de Giro (F-14 a F-19) ==========

/** F-14: DIO (Days Inventory Outstanding) */
export function calcDIO(estoqueMedio: number, cmv: number, dias: number = 30): number | null {
  return round1(safeDiv(estoqueMedio * dias, cmv));
}

/** F-15: DSO (Days Sales Outstanding) */
export function calcDSO(contasReceber: number, rl: number, dias: number = 30): number | null {
  return round1(safeDiv(contasReceber * dias, rl));
}

/** F-16: DPO (Days Payable Outstanding) */
export function calcDPO(contasPagar: number, compras: number, dias: number = 30): number | null {
  return round1(safeDiv(contasPagar * dias, compras));
}

/** F-17: CCC (Ciclo de Conversão de Caixa) */
export function calcCCC(dio: number | null, dso: number | null, dpo: number | null): number | null {
  if (dio === null || dso === null || dpo === null) return null;
  return round1(dio + dso - dpo);
}

/** F-18: NCG (Necessidade de Capital de Giro) */
export function calcNCG(ccc: number | null, cmvDiario: number): number | null {
  if (ccc === null) return null;
  return round2(ccc * cmvDiario);
}

/** F-19: ICDF (Índice de Cobertura de Disponibilidades Financeiras) */
export function calcICDF(disponibilidades: number, cmvDiario: number): number | null {
  return round1(safeDiv(disponibilidades, cmvDiario));
}

// ========== Margem de Contribuição (F-20 a F-25) ==========

/** F-20: Margem de Contribuição */
export function calcMC(receitaCategoria: number, custoVariavel: number): number {
  return receitaCategoria - custoVariavel;
}

/** F-21: IMC (Índice de Margem de Contribuição) */
export function calcIMC(mc: number, receitaCategoria: number): number | null {
  return round1(safeDiv(mc * 100, receitaCategoria));
}

/** F-22: Participação na Receita % */
export function calcParticipacaoReceita(receitaCategoria: number, receitaTotal: number): number | null {
  return round1(safeDiv(receitaCategoria * 100, receitaTotal));
}

/** F-23: MC Ponderada */
export function calcMCPonderada(imc: number | null, participacao: number | null): number | null {
  if (imc === null || participacao === null) return null;
  return round2((imc * participacao) / 100);
}

/** F-24: Variação IMC período */
export function calcVariacaoIMC(imcAtual: number | null, imcAnterior: number | null): number | null {
  if (imcAtual === null || imcAnterior === null) return null;
  return round1(imcAtual - imcAnterior);
}

/** F-25: IMC Rede (consolidado) */
export function calcIMCRede(mcTotal: number, receitaTotal: number): number | null {
  return round1(safeDiv(mcTotal * 100, receitaTotal));
}

// ========== Projeção (F-26 a F-31) ==========

/** F-26: Receita Projetada */
export function calcReceitaProjetada(rlAtual: number, taxaCrescimento: number): number {
  return round2(rlAtual * (1 + taxaCrescimento / 100)) ?? 0;
}

/** F-27: CMV Projetado */
export function calcCMVProjetado(receitaProj: number, mbHistorica: number | null): number {
  if (mbHistorica === null) return 0;
  return round2(receitaProj * (1 - mbHistorica / 100)) ?? 0;
}

/** F-28: Despesas Projetadas */
export function calcDespesasProjetadas(despAtual: number, inflacao: number = 0): number {
  return round2(despAtual * (1 + inflacao / 100)) ?? 0;
}

/** F-29: Lucro Projetado */
export function calcLucroProjetado(receitaProj: number, cmvProj: number, despProj: number): number {
  return round2(receitaProj - cmvProj - despProj) ?? 0;
}

/** F-30: Margem Projetada % */
export function calcMargemProjetada(lucroProj: number, receitaProj: number): number | null {
  return round1(safeDiv(lucroProj * 100, receitaProj));
}

/** F-31: Gap vs Meta */
export function calcGapMeta(valorProjetado: number, valorMeta: number): number {
  return round2(valorProjetado - valorMeta) ?? 0;
}

// ========== Custos Operacionais (F-32 a F-36) ==========

/** F-32: Índice de Custo por Natureza */
export function calcIndiceCusto(custoNatureza: number, rl: number): number | null {
  return round1(safeDiv(custoNatureza * 100, rl));
}

/** F-33: Custo Operacional Total / RL */
export function calcCustoOperacionalRL(despOp: number, rl: number): number | null {
  return round1(safeDiv(despOp * 100, rl));
}

/** F-34: Ponto de Equilíbrio Operacional */
export function calcPEO(custoFixo: number, custoVariavel: number, rl: number): number | null {
  const mcPct = safeDiv((rl - custoVariavel) * 100, rl);
  if (mcPct === null || mcPct === 0) return null;
  return round2(custoFixo / (mcPct / 100));
}

/** F-35: Margem de Segurança */
export function calcMargemSeguranca(rl: number, peo: number | null): number | null {
  if (peo === null) return null;
  return round1(safeDiv((rl - peo) * 100, rl));
}

/** F-36: Grau de Alavancagem Operacional */
export function calcGAO(lb: number, ebit: number): number | null {
  return round2(safeDiv(lb, ebit));
}

// ========== ROIC (F-37 a F-42) ==========

/** F-37: NOPAT */
export function calcNOPAT(ebit: number, aliquotaEfetiva: number): number {
  return round2(ebit * (1 - aliquotaEfetiva / 100)) ?? 0;
}

/** F-38: Capital Investido */
export function calcCapitalInvestido(ativoOp: number, passivoOp: number): number {
  return ativoOp - passivoOp;
}

/** F-39: ROIC */
export function calcROIC(nopat: number, capitalInvestido: number): number | null {
  return round1(safeDiv(nopat * 100, capitalInvestido));
}

/** F-40: ROCE */
export function calcROCE(ebit: number, capitalEmpregado: number): number | null {
  return round1(safeDiv(ebit * 100, capitalEmpregado));
}

/** F-41: Spread de Valor (EVA %) */
export function calcSpreadValor(roic: number | null, wacc: number): number | null {
  if (roic === null) return null;
  return round1(roic - wacc);
}

/** F-42: Giro do Capital */
export function calcGiroCapital(rl: number, capitalInvestido: number): number | null {
  return round2(safeDiv(rl, capitalInvestido));
}

// ========== Formatação para exibição ==========

export function formatCurrency(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function formatPercent(value: number | null): string {
  if (value === null) return "—";
  return `${value.toFixed(1)}%`;
}

export function formatDays(value: number | null): string {
  if (value === null) return "—";
  return `${value.toFixed(1)} dias`;
}

/** Semáforo: compara valor contra limiares de meta */
export function getSemaforo(
  valor: number | null,
  meta: number,
  limiteAmarelo: number | null,
  limiteVermelho: number | null,
  higherIsBetter: boolean = true
): "green" | "yellow" | "red" | "neutral" {
  if (valor === null) return "neutral";
  if (limiteVermelho !== null) {
    if (higherIsBetter ? valor <= limiteVermelho : valor >= limiteVermelho) return "red";
  }
  if (limiteAmarelo !== null) {
    if (higherIsBetter ? valor <= limiteAmarelo : valor >= limiteAmarelo) return "yellow";
  }
  return "green";
}
