/**
 * Financeiro — Mock Data Layer
 * Provides realistic demo data for all financial pages.
 * When DB integration is ready, replace with TanStack Query + Supabase calls.
 */

export interface DRELine {
  key: string;
  label: string;
  level: number; // 0=total, 1=subtotal, 2=detail
  value: number;
  prevValue: number;
  metaValue: number | null;
  isPercent?: boolean;
  isBold?: boolean;
}

export interface StoreDRE {
  storeId: string;
  storeName: string;
  lines: DRELine[];
  status: "rascunho" | "em_revisao" | "aprovado";
  version: number;
}

export interface CapitalGiroSnapshot {
  month: string;
  dio: number;
  dso: number;
  dpo: number;
  ccc: number;
  ncg: number;
  icdf: number;
}

export interface CategoriaIMC {
  categoria: string;
  receita: number;
  custoVariavel: number;
  mc: number;
  imc: number;
  participacao: number;
  mcPonderada: number;
  tendencia: "up" | "down" | "stable";
  imcAnterior: number;
}

export interface CustoNatureza {
  natureza: string;
  valor: number;
  percentualRL: number;
  meta: number;
  benchmark: number;
  color: string;
}

export interface ProjecaoData {
  horizonte: string;
  receitaProj: number;
  cmvProj: number;
  despProj: number;
  lucroProj: number;
  margemProj: number;
  metaReceita: number;
  gap: number;
}

export interface StoreBreakeven {
  storeId: string;
  storeName: string;
  receitaReal: number;
  custoFixo: number;
  custoVariavel: number;
  peo: number;
  margemSeguranca: number;
  gao: number;
}

export interface ROICData {
  period: string;
  nopat: number;
  capitalInvestido: number;
  roic: number;
  roce: number;
  spreadValor: number;
  giroCapital: number;
  margemNopat: number;
}

// ========== MOCK DATA ==========

const STORES = ["Loja Matriz", "Loja Norte", "Loja Sul", "Loja Centro", "Loja Leste"];

export function useDRERedeData(): { lines: DRELine[]; period: string } {
  const lines: DRELine[] = [
    { key: "rb", label: "Receita Bruta", level: 2, value: 22500000, prevValue: 21800000, metaValue: 23000000 },
    { key: "dev", label: "(-) Devoluções", level: 2, value: -450000, prevValue: -420000, metaValue: null },
    { key: "desc", label: "(-) Descontos", level: 2, value: -1350000, prevValue: -1280000, metaValue: null },
    { key: "imp", label: "(-) Impostos s/ Vendas", level: 2, value: -2500000, prevValue: -2400000, metaValue: null },
    { key: "rl", label: "Receita Líquida", level: 0, value: 18200000, prevValue: 17700000, metaValue: 18800000, isBold: true },
    { key: "cmv", label: "(-) CMV Bruto", level: 2, value: -12400000, prevValue: -12100000, metaValue: null },
    { key: "perdas", label: "(-) Perdas Operacionais", level: 2, value: -185000, prevValue: -195000, metaValue: null },
    { key: "bonif", label: "(+) Bonificações", level: 2, value: 620000, prevValue: 580000, metaValue: null },
    { key: "cmvliq", label: "CMV Líquido", level: 1, value: -11965000, prevValue: -11715000, metaValue: null },
    { key: "lb", label: "Lucro Bruto", level: 0, value: 6235000, prevValue: 5985000, metaValue: 6400000, isBold: true },
    { key: "mb", label: "Margem Bruta %", level: 0, value: 34.3, prevValue: 33.8, metaValue: 34.0, isPercent: true, isBold: true },
    { key: "verbas", label: "(+) Verbas Comerciais", level: 2, value: 380000, prevValue: 350000, metaValue: null },
    { key: "lbaj", label: "Lucro Bruto Ajustado", level: 1, value: 6615000, prevValue: 6335000, metaValue: null },
    { key: "despop", label: "(-) Despesas Operacionais", level: 1, value: -5505000, prevValue: -5400000, metaValue: -5300000 },
    { key: "ebit", label: "EBIT (Resultado Operacional)", level: 0, value: 1110000, prevValue: 935000, metaValue: 1100000, isBold: true },
    { key: "mo", label: "Margem Operacional %", level: 0, value: 6.1, prevValue: 5.3, metaValue: 5.8, isPercent: true, isBold: true },
    { key: "depamort", label: "(+) Depreciação e Amortização", level: 2, value: 310000, prevValue: 300000, metaValue: null },
    { key: "ebitda", label: "EBITDA", level: 0, value: 1420000, prevValue: 1235000, metaValue: 1400000, isBold: true },
    { key: "mebitda", label: "Margem EBITDA %", level: 0, value: 7.8, prevValue: 7.0, metaValue: 7.4, isPercent: true },
    { key: "resfin", label: "(+/-) Resultado Financeiro", level: 2, value: -180000, prevValue: -170000, metaValue: null },
    { key: "lair", label: "LAIR", level: 1, value: 930000, prevValue: 765000, metaValue: null },
    { key: "ir", label: "(-) Provisão IR", level: 2, value: -88000, prevValue: -72000, metaValue: null },
    { key: "ll", label: "Lucro Líquido", level: 0, value: 842000, prevValue: 693000, metaValue: 800000, isBold: true },
    { key: "ml", label: "Margem Líquida %", level: 0, value: 4.6, prevValue: 3.9, metaValue: 4.3, isPercent: true, isBold: true },
  ];
  return { lines, period: "Fev/2026" };
}

export function useDRELojaData(): StoreDRE[] {
  return STORES.map((name, idx) => {
    const factor = [1.3, 0.9, 0.85, 0.7, 0.65][idx];
    const base = useDRERedeData();
    return {
      storeId: `store-${idx}`,
      storeName: name,
      lines: base.lines.map(l => ({
        ...l,
        value: l.isPercent ? +(l.value + (idx - 2) * 0.5).toFixed(1) : Math.round(l.value * factor / STORES.length),
        prevValue: l.isPercent ? +(l.prevValue + (idx - 2) * 0.3).toFixed(1) : Math.round(l.prevValue * factor / STORES.length),
        metaValue: l.metaValue ? (l.isPercent ? l.metaValue : Math.round(l.metaValue * factor / STORES.length)) : null,
      })),
      status: idx === 0 ? "aprovado" : idx < 3 ? "em_revisao" : "rascunho",
      version: idx === 0 ? 3 : 1,
    };
  });
}

export function useCapitalGiroData(): { current: CapitalGiroSnapshot; history: CapitalGiroSnapshot[] } {
  const history: CapitalGiroSnapshot[] = [
    { month: "Mar/25", dio: 35, dso: 4, dpo: 30, ccc: 9, ncg: 2100000, icdf: 22 },
    { month: "Abr/25", dio: 34, dso: 3, dpo: 29, ccc: 8, ncg: 1950000, icdf: 21 },
    { month: "Mai/25", dio: 33, dso: 4, dpo: 28, ccc: 9, ncg: 2050000, icdf: 20 },
    { month: "Jun/25", dio: 36, dso: 3, dpo: 31, ccc: 8, ncg: 1900000, icdf: 23 },
    { month: "Jul/25", dio: 34, dso: 3, dpo: 29, ccc: 8, ncg: 1850000, icdf: 22 },
    { month: "Ago/25", dio: 33, dso: 4, dpo: 28, ccc: 9, ncg: 2000000, icdf: 21 },
    { month: "Set/25", dio: 32, dso: 3, dpo: 27, ccc: 8, ncg: 1800000, icdf: 20 },
    { month: "Out/25", dio: 31, dso: 3, dpo: 26, ccc: 8, ncg: 1750000, icdf: 19 },
    { month: "Nov/25", dio: 30, dso: 4, dpo: 27, ccc: 7, ncg: 1700000, icdf: 18 },
    { month: "Dez/25", dio: 33, dso: 3, dpo: 29, ccc: 7, ncg: 1850000, icdf: 20 },
    { month: "Jan/26", dio: 34, dso: 4, dpo: 30, ccc: 8, ncg: 1900000, icdf: 21 },
    { month: "Fev/26", dio: 32, dso: 3, dpo: 28, ccc: 7, ncg: 1800000, icdf: 20 },
  ];
  return { current: history[history.length - 1], history };
}

export function useMargemCategoriaData(): CategoriaIMC[] {
  const items: CategoriaIMC[] = [
    { categoria: "Mercearia Seca", receita: 3200000, custoVariavel: 2240000, mc: 960000, imc: 30.0, participacao: 17.6, mcPonderada: 5.3, tendencia: "stable" as const, imcAnterior: 29.5 },
    { categoria: "Hortifruti", receita: 2100000, custoVariavel: 1260000, mc: 840000, imc: 40.0, participacao: 11.5, mcPonderada: 4.6, tendencia: "up" as const, imcAnterior: 38.2 },
    { categoria: "Açougue", receita: 2800000, custoVariavel: 1960000, mc: 840000, imc: 30.0, participacao: 15.4, mcPonderada: 4.6, tendencia: "down" as const, imcAnterior: 31.5 },
    { categoria: "Padaria", receita: 1500000, custoVariavel: 750000, mc: 750000, imc: 50.0, participacao: 8.2, mcPonderada: 4.1, tendencia: "up" as const, imcAnterior: 48.0 },
    { categoria: "Frios e Laticínios", receita: 1800000, custoVariavel: 1260000, mc: 540000, imc: 30.0, participacao: 9.9, mcPonderada: 3.0, tendencia: "stable" as const, imcAnterior: 30.2 },
    { categoria: "Bebidas", receita: 2400000, custoVariavel: 1920000, mc: 480000, imc: 20.0, participacao: 13.2, mcPonderada: 2.6, tendencia: "down" as const, imcAnterior: 22.0 },
    { categoria: "Higiene Pessoal", receita: 1200000, custoVariavel: 900000, mc: 300000, imc: 25.0, participacao: 6.6, mcPonderada: 1.7, tendencia: "down" as const, imcAnterior: 27.0 },
    { categoria: "Limpeza", receita: 1100000, custoVariavel: 825000, mc: 275000, imc: 25.0, participacao: 6.0, mcPonderada: 1.5, tendencia: "stable" as const, imcAnterior: 24.8 },
    { categoria: "Congelados", receita: 900000, custoVariavel: 630000, mc: 270000, imc: 30.0, participacao: 4.9, mcPonderada: 1.5, tendencia: "up" as const, imcAnterior: 28.0 },
    { categoria: "Pet Shop", receita: 600000, custoVariavel: 420000, mc: 180000, imc: 30.0, participacao: 3.3, mcPonderada: 1.0, tendencia: "stable" as const, imcAnterior: 29.5 },
  ];
  return items.sort((a, b) => b.imc - a.imc);
}

export function useCustosData(): { naturezas: CustoNatureza[]; totalRL: number; total: number } {
  const naturezas: CustoNatureza[] = [
    { natureza: "Folha de Pagamento", valor: 2750000, percentualRL: 15.1, meta: 14.5, benchmark: 14.0, color: "hsl(var(--chart-1))" },
    { natureza: "Ocupação", valor: 850000, percentualRL: 4.7, meta: 4.5, benchmark: 4.0, color: "hsl(var(--chart-2))" },
    { natureza: "Utilidades", valor: 420000, percentualRL: 2.3, meta: 2.2, benchmark: 2.0, color: "hsl(var(--chart-3))" },
    { natureza: "Perdas", valor: 185000, percentualRL: 1.0, meta: 0.8, benchmark: 0.7, color: "hsl(var(--chart-4))" },
    { natureza: "Manutenção", valor: 280000, percentualRL: 1.5, meta: 1.4, benchmark: 1.3, color: "hsl(var(--chart-5))" },
    { natureza: "Tecnologia", valor: 320000, percentualRL: 1.8, meta: 1.7, benchmark: 1.5, color: "hsl(var(--chart-1))" },
    { natureza: "Marketing", valor: 380000, percentualRL: 2.1, meta: 2.0, benchmark: 2.0, color: "hsl(var(--chart-2))" },
    { natureza: "Logística", valor: 220000, percentualRL: 1.2, meta: 1.2, benchmark: 1.0, color: "hsl(var(--chart-3))" },
    { natureza: "Outras", valor: 100000, percentualRL: 0.5, meta: 0.5, benchmark: 0.5, color: "hsl(var(--chart-4))" },
  ];
  return { naturezas, totalRL: 18200000, total: naturezas.reduce((s, n) => s + n.valor, 0) };
}

export function useProjecaoData(): ProjecaoData[] {
  return [
    { horizonte: "30 dias", receitaProj: 18750000, cmvProj: 12280000, despProj: 5550000, lucroProj: 920000, margemProj: 4.9, metaReceita: 19000000, gap: -250000 },
    { horizonte: "60 dias", receitaProj: 19100000, cmvProj: 12510000, despProj: 5620000, lucroProj: 970000, margemProj: 5.1, metaReceita: 19500000, gap: -400000 },
    { horizonte: "90 dias", receitaProj: 19500000, cmvProj: 12750000, despProj: 5700000, lucroProj: 1050000, margemProj: 5.4, metaReceita: 20000000, gap: -500000 },
  ];
}

export function useBreakevenData(): StoreBreakeven[] {
  return STORES.map((name, idx) => {
    const receitaReal = [4700000, 3600000, 3400000, 2800000, 2600000][idx];
    const custoFixo = [1100000, 850000, 780000, 720000, 650000][idx];
    const custoVariavel = [2820000, 2160000, 2100000, 1820000, 1720000][idx];
    const mcPct = (receitaReal - custoVariavel) / receitaReal;
    const peo = custoFixo / mcPct;
    const ms = ((receitaReal - peo) / receitaReal) * 100;
    const lb = receitaReal - custoVariavel;
    const ebit = lb - custoFixo;
    const gao = ebit !== 0 ? lb / ebit : 0;
    return {
      storeId: `store-${idx}`,
      storeName: name,
      receitaReal,
      custoFixo,
      custoVariavel,
      peo: Math.round(peo),
      margemSeguranca: +ms.toFixed(1),
      gao: +gao.toFixed(2),
    };
  });
}

export function useROICData(): ROICData[] {
  return [
    { period: "Q2/25", nopat: 780000, capitalInvestido: 8500000, roic: 9.2, roce: 11.5, spreadValor: -0.8, giroCapital: 2.1, margemNopat: 4.4 },
    { period: "Q3/25", nopat: 820000, capitalInvestido: 8300000, roic: 9.9, roce: 12.1, spreadValor: -0.1, giroCapital: 2.2, margemNopat: 4.5 },
    { period: "Q4/25", nopat: 870000, capitalInvestido: 8100000, roic: 10.7, roce: 13.0, spreadValor: 0.7, giroCapital: 2.3, margemNopat: 4.7 },
    { period: "Q1/26", nopat: 910000, capitalInvestido: 7900000, roic: 11.5, roce: 13.8, spreadValor: 1.5, giroCapital: 2.4, margemNopat: 4.9 },
  ];
}

export function useCustosEvolutionData(): { month: string; folha: number; ocupacao: number; utilidades: number; perdas: number; outras: number }[] {
  return [
    { month: "Set/25", folha: 14.8, ocupacao: 4.8, utilidades: 2.4, perdas: 1.1, outras: 7.2 },
    { month: "Out/25", folha: 15.0, ocupacao: 4.7, utilidades: 2.3, perdas: 1.0, outras: 7.1 },
    { month: "Nov/25", folha: 14.9, ocupacao: 4.6, utilidades: 2.2, perdas: 0.9, outras: 7.0 },
    { month: "Dez/25", folha: 15.2, ocupacao: 4.7, utilidades: 2.5, perdas: 1.2, outras: 7.3 },
    { month: "Jan/26", folha: 15.1, ocupacao: 4.7, utilidades: 2.3, perdas: 1.0, outras: 7.1 },
    { month: "Fev/26", folha: 15.1, ocupacao: 4.7, utilidades: 2.3, perdas: 1.0, outras: 7.2 },
  ];
}

export function useKPIHistory(): { month: string; mb: number; mo: number; ml: number; ccc: number }[] {
  return [
    { month: "Mar/25", mb: 32.5, mo: 4.8, ml: 3.2, ccc: 9 },
    { month: "Abr/25", mb: 32.8, mo: 5.0, ml: 3.4, ccc: 8 },
    { month: "Mai/25", mb: 33.0, mo: 5.1, ml: 3.5, ccc: 9 },
    { month: "Jun/25", mb: 33.2, mo: 5.2, ml: 3.5, ccc: 8 },
    { month: "Jul/25", mb: 33.0, mo: 5.0, ml: 3.4, ccc: 8 },
    { month: "Ago/25", mb: 33.4, mo: 5.3, ml: 3.6, ccc: 9 },
    { month: "Set/25", mb: 33.5, mo: 5.2, ml: 3.6, ccc: 8 },
    { month: "Out/25", mb: 33.6, mo: 5.1, ml: 3.7, ccc: 8 },
    { month: "Nov/25", mb: 33.8, mo: 5.3, ml: 3.9, ccc: 7 },
    { month: "Dez/25", mb: 33.5, mo: 5.0, ml: 3.5, ccc: 7 },
    { month: "Jan/26", mb: 34.0, mo: 5.5, ml: 4.0, ccc: 8 },
    { month: "Fev/26", mb: 34.3, mo: 6.1, ml: 4.6, ccc: 7 },
  ];
}
