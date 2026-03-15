/**
 * Loja — Mock data + tipos para 2 lojas, 4 seções, ~20 SKUs
 */

// ─── Interfaces ───────────────────────────────────────

export interface Loja {
  id: string;
  nome: string;
  areaTotal: number;
}

export interface Secao {
  id: string;
  nome: string;
  lojaId: string;
  area: number;
  receita: number;
  margemBruta: number;
  receitaAnterior?: number;
  margemAnterior?: number;
}

export interface SKU {
  id: string;
  codigo: string;
  nome: string;
  secao: string;
  lojaId: string;
  custoUnitario: number;
  precoVenda: number;
  markupMeta: number;
  tolerancia: number;
  volumeMensal: number;
}

export interface RegistroPerda {
  id: string;
  lojaId: string;
  secao: string;
  skuId: string;
  skuNome: string;
  tipo: "operacional" | "vencimento" | "furto_externo" | "furto_interno";
  quantidade: number;
  custoUnitario: number;
  valorPerda: number;
  data: string;
}

export interface HistoricoPreco {
  id: string;
  skuId: string;
  skuNome: string;
  lojaId: string;
  precoAnterior: number;
  precoNovo: number;
  custoVigente: number;
  dataAlteracao: string;
}

export interface AlertaLoja {
  id: string;
  lojaId: string;
  codigo: string;
  nivel: "critico" | "alerta" | "info";
  titulo: string;
  descricao: string;
  kpiNome: string;
  valorAtual: number;
  valorLimite: number;
  criadoEm: string;
  status: "aberto" | "reconhecido" | "resolvido";
  slaHoras: number;
}

export interface ConfiguracaoIPC {
  kpiNome: string;
  peso: number;
  label: string;
}

// ─── Mock Data ────────────────────────────────────────

export const mockLojas: Loja[] = [
  { id: "loja-a", nome: "Loja Centro", areaTotal: 1200 },
  { id: "loja-b", nome: "Loja Leste", areaTotal: 950 },
];

export const mockSecoes: Secao[] = [
  // Loja A
  { id: "sa1", nome: "Hortifruti", lojaId: "loja-a", area: 180, receita: 485000, margemBruta: 145500, receitaAnterior: 460000, margemAnterior: 138000 },
  { id: "sa2", nome: "Açougue", lojaId: "loja-a", area: 220, receita: 720000, margemBruta: 180000, receitaAnterior: 695000, margemAnterior: 173750 },
  { id: "sa3", nome: "Mercearia", lojaId: "loja-a", area: 520, receita: 890000, margemBruta: 222500, receitaAnterior: 880000, margemAnterior: 220000 },
  { id: "sa4", nome: "Padaria", lojaId: "loja-a", area: 280, receita: 650000, margemBruta: 260000, receitaAnterior: 620000, margemAnterior: 248000 },
  // Loja B
  { id: "sb1", nome: "Hortifruti", lojaId: "loja-b", area: 150, receita: 380000, margemBruta: 114000, receitaAnterior: 370000, margemAnterior: 111000 },
  { id: "sb2", nome: "Açougue", lojaId: "loja-b", area: 200, receita: 580000, margemBruta: 145000, receitaAnterior: 560000, margemAnterior: 140000 },
  { id: "sb3", nome: "Mercearia", lojaId: "loja-b", area: 380, receita: 620000, margemBruta: 155000, receitaAnterior: 610000, margemAnterior: 152500 },
  { id: "sb4", nome: "Padaria", lojaId: "loja-b", area: 220, receita: 510000, margemBruta: 204000, receitaAnterior: 490000, margemAnterior: 196000 },
];

export const mockSKUs: SKU[] = [
  // Hortifruti
  { id: "sku01", codigo: "HF001", nome: "Banana Prata kg", secao: "Hortifruti", lojaId: "loja-a", custoUnitario: 3.20, precoVenda: 5.49, markupMeta: 60, tolerancia: 5, volumeMensal: 8500 },
  { id: "sku02", codigo: "HF002", nome: "Tomate Italiano kg", secao: "Hortifruti", lojaId: "loja-a", custoUnitario: 4.80, precoVenda: 8.99, markupMeta: 75, tolerancia: 5, volumeMensal: 4200 },
  { id: "sku03", codigo: "HF003", nome: "Alface Crespa un", secao: "Hortifruti", lojaId: "loja-a", custoUnitario: 1.20, precoVenda: 2.99, markupMeta: 120, tolerancia: 10, volumeMensal: 3100 },
  { id: "sku04", codigo: "HF004", nome: "Maçã Fuji kg", secao: "Hortifruti", lojaId: "loja-a", custoUnitario: 7.50, precoVenda: 12.90, markupMeta: 65, tolerancia: 5, volumeMensal: 2800 },
  { id: "sku05", codigo: "HF005", nome: "Batata Lavada kg", secao: "Hortifruti", lojaId: "loja-a", custoUnitario: 3.90, precoVenda: 3.50, markupMeta: 50, tolerancia: 5, volumeMensal: 6200 }, // PAC!
  // Açougue
  { id: "sku06", codigo: "AC001", nome: "Picanha kg", secao: "Açougue", lojaId: "loja-a", custoUnitario: 52.00, precoVenda: 79.90, markupMeta: 50, tolerancia: 3, volumeMensal: 1200 },
  { id: "sku07", codigo: "AC002", nome: "Frango Inteiro kg", secao: "Açougue", lojaId: "loja-a", custoUnitario: 8.50, precoVenda: 14.99, markupMeta: 70, tolerancia: 5, volumeMensal: 5800 },
  { id: "sku08", codigo: "AC003", nome: "Costela Bovina kg", secao: "Açougue", lojaId: "loja-a", custoUnitario: 28.00, precoVenda: 42.90, markupMeta: 50, tolerancia: 3, volumeMensal: 2100 },
  { id: "sku09", codigo: "AC004", nome: "Linguiça Toscana kg", secao: "Açougue", lojaId: "loja-a", custoUnitario: 15.90, precoVenda: 24.90, markupMeta: 55, tolerancia: 5, volumeMensal: 3400 },
  { id: "sku10", codigo: "AC005", nome: "Carne Moída kg", secao: "Açougue", lojaId: "loja-a", custoUnitario: 22.50, precoVenda: 21.90, markupMeta: 45, tolerancia: 3, volumeMensal: 4100 }, // PAC!
  // Mercearia
  { id: "sku11", codigo: "MC001", nome: "Arroz 5kg", secao: "Mercearia", lojaId: "loja-a", custoUnitario: 18.90, precoVenda: 27.90, markupMeta: 40, tolerancia: 3, volumeMensal: 7200 },
  { id: "sku12", codigo: "MC002", nome: "Feijão Carioca 1kg", secao: "Mercearia", lojaId: "loja-a", custoUnitario: 6.50, precoVenda: 9.49, markupMeta: 40, tolerancia: 5, volumeMensal: 5800 },
  { id: "sku13", codigo: "MC003", nome: "Óleo Soja 900ml", secao: "Mercearia", lojaId: "loja-a", custoUnitario: 5.20, precoVenda: 7.99, markupMeta: 45, tolerancia: 5, volumeMensal: 6100 },
  { id: "sku14", codigo: "MC004", nome: "Açúcar 5kg", secao: "Mercearia", lojaId: "loja-a", custoUnitario: 14.50, precoVenda: 21.90, markupMeta: 45, tolerancia: 3, volumeMensal: 4900 },
  { id: "sku15", codigo: "MC005", nome: "Leite UHT 1L", secao: "Mercearia", lojaId: "loja-a", custoUnitario: 4.10, precoVenda: 5.99, markupMeta: 38, tolerancia: 3, volumeMensal: 12000 },
  // Padaria
  { id: "sku16", codigo: "PD001", nome: "Pão Francês kg", secao: "Padaria", lojaId: "loja-a", custoUnitario: 5.80, precoVenda: 14.90, markupMeta: 140, tolerancia: 10, volumeMensal: 9500 },
  { id: "sku17", codigo: "PD002", nome: "Bolo Chocolate un", secao: "Padaria", lojaId: "loja-a", custoUnitario: 8.50, precoVenda: 22.90, markupMeta: 160, tolerancia: 10, volumeMensal: 1800 },
  { id: "sku18", codigo: "PD003", nome: "Croissant un", secao: "Padaria", lojaId: "loja-a", custoUnitario: 2.30, precoVenda: 6.50, markupMeta: 170, tolerancia: 10, volumeMensal: 2400 },
  { id: "sku19", codigo: "PD004", nome: "Pão de Queijo kg", secao: "Padaria", lojaId: "loja-a", custoUnitario: 12.00, precoVenda: 34.90, markupMeta: 180, tolerancia: 10, volumeMensal: 3200 },
  { id: "sku20", codigo: "PD005", nome: "Sonho Creme un", secao: "Padaria", lojaId: "loja-a", custoUnitario: 1.80, precoVenda: 5.90, markupMeta: 200, tolerancia: 15, volumeMensal: 1500 },
];

export const mockPerdas: RegistroPerda[] = [
  { id: "p1", lojaId: "loja-a", secao: "Hortifruti", skuId: "sku01", skuNome: "Banana Prata kg", tipo: "vencimento", quantidade: 45, custoUnitario: 3.20, valorPerda: 144.00, data: "2026-03-01" },
  { id: "p2", lojaId: "loja-a", secao: "Hortifruti", skuId: "sku02", skuNome: "Tomate Italiano kg", tipo: "operacional", quantidade: 28, custoUnitario: 4.80, valorPerda: 134.40, data: "2026-03-01" },
  { id: "p3", lojaId: "loja-a", secao: "Hortifruti", skuId: "sku03", skuNome: "Alface Crespa un", tipo: "vencimento", quantidade: 60, custoUnitario: 1.20, valorPerda: 72.00, data: "2026-03-02" },
  { id: "p4", lojaId: "loja-a", secao: "Açougue", skuId: "sku06", skuNome: "Picanha kg", tipo: "furto_externo", quantidade: 3, custoUnitario: 52.00, valorPerda: 156.00, data: "2026-03-01" },
  { id: "p5", lojaId: "loja-a", secao: "Açougue", skuId: "sku07", skuNome: "Frango Inteiro kg", tipo: "vencimento", quantidade: 15, custoUnitario: 8.50, valorPerda: 127.50, data: "2026-03-02" },
  { id: "p6", lojaId: "loja-a", secao: "Mercearia", skuId: "sku13", skuNome: "Óleo Soja 900ml", tipo: "operacional", quantidade: 8, custoUnitario: 5.20, valorPerda: 41.60, data: "2026-03-03" },
  { id: "p7", lojaId: "loja-a", secao: "Padaria", skuId: "sku16", skuNome: "Pão Francês kg", tipo: "vencimento", quantidade: 35, custoUnitario: 5.80, valorPerda: 203.00, data: "2026-03-01" },
  { id: "p8", lojaId: "loja-a", secao: "Padaria", skuId: "sku17", skuNome: "Bolo Chocolate un", tipo: "vencimento", quantidade: 5, custoUnitario: 8.50, valorPerda: 42.50, data: "2026-03-02" },
  { id: "p9", lojaId: "loja-b", secao: "Hortifruti", skuId: "sku01", skuNome: "Banana Prata kg", tipo: "vencimento", quantidade: 38, custoUnitario: 3.20, valorPerda: 121.60, data: "2026-03-01" },
  { id: "p10", lojaId: "loja-b", secao: "Açougue", skuId: "sku08", skuNome: "Costela Bovina kg", tipo: "furto_interno", quantidade: 2, custoUnitario: 28.00, valorPerda: 56.00, data: "2026-03-03" },
];

export const mockHistoricoPrecos: HistoricoPreco[] = [
  { id: "hp1", skuId: "sku01", skuNome: "Banana Prata kg", lojaId: "loja-a", precoAnterior: 4.99, precoNovo: 5.49, custoVigente: 3.20, dataAlteracao: "2026-02-15" },
  { id: "hp2", skuId: "sku06", skuNome: "Picanha kg", lojaId: "loja-a", precoAnterior: 74.90, precoNovo: 79.90, custoVigente: 52.00, dataAlteracao: "2026-02-10" },
  { id: "hp3", skuId: "sku11", skuNome: "Arroz 5kg", lojaId: "loja-a", precoAnterior: 25.90, precoNovo: 27.90, custoVigente: 18.90, dataAlteracao: "2026-02-20" },
  { id: "hp4", skuId: "sku16", skuNome: "Pão Francês kg", lojaId: "loja-a", precoAnterior: 13.90, precoNovo: 14.90, custoVigente: 5.80, dataAlteracao: "2026-01-28" },
  { id: "hp5", skuId: "sku05", skuNome: "Batata Lavada kg", lojaId: "loja-a", precoAnterior: 4.90, precoNovo: 3.50, custoVigente: 3.90, dataAlteracao: "2026-03-01" },
  { id: "hp6", skuId: "sku10", skuNome: "Carne Moída kg", lojaId: "loja-a", precoAnterior: 29.90, precoNovo: 21.90, custoVigente: 22.50, dataAlteracao: "2026-03-02" },
];

export const mockAlertas: AlertaLoja[] = [
  { id: "al1", lojaId: "loja-a", codigo: "PAC", nivel: "critico", titulo: "Preço Abaixo do Custo", descricao: "Batata Lavada kg — PV R$3,50 < Custo R$3,90", kpiNome: "markup_real", valorAtual: -10.3, valorLimite: 0, criadoEm: "2026-03-01T10:00:00", status: "aberto", slaHoras: 4 },
  { id: "al2", lojaId: "loja-a", codigo: "PAC", nivel: "critico", titulo: "Preço Abaixo do Custo", descricao: "Carne Moída kg — PV R$21,90 < Custo R$22,50", kpiNome: "markup_real", valorAtual: -2.7, valorLimite: 0, criadoEm: "2026-03-02T08:30:00", status: "aberto", slaHoras: 4 },
  { id: "al3", lojaId: "loja-a", codigo: "IP_SECAO", nivel: "alerta", titulo: "IP% Hortifruti elevado", descricao: "IP% Hortifruti 2.5% acima do benchmark 2.0%", kpiNome: "ip_pct", valorAtual: 2.5, valorLimite: 2.0, criadoEm: "2026-03-01T06:00:00", status: "aberto", slaHoras: 24 },
  { id: "al4", lojaId: "loja-a", codigo: "IPE_QUEDA", nivel: "alerta", titulo: "IPE Mercearia em queda", descricao: "IPE caiu 2 períodos consecutivos: 1.02 → 0.98 → 0.95", kpiNome: "ipe", valorAtual: 0.95, valorLimite: 1.0, criadoEm: "2026-03-03T07:00:00", status: "aberto", slaHoras: 48 },
  { id: "al5", lojaId: "loja-a", codigo: "IAP_BAIXO", nivel: "alerta", titulo: "IAP abaixo de 85%", descricao: "IAP geral da loja em 82.3%", kpiNome: "iap", valorAtual: 82.3, valorLimite: 85.0, criadoEm: "2026-03-02T06:00:00", status: "reconhecido", slaHoras: 24 },
  { id: "al6", lojaId: "loja-b", codigo: "IP_ANOMALIA", nivel: "info", titulo: "Pico de perda detectado", descricao: "Perda diária 3x acima da média em Açougue", kpiNome: "ip_anomalia", valorAtual: 312, valorLimite: 104, criadoEm: "2026-03-03T09:00:00", status: "aberto", slaHoras: 48 },
];

export const mockConfigIPC: ConfiguracaoIPC[] = [
  { kpiNome: "receita_m2", peso: 0.30, label: "R$/m²" },
  { kpiNome: "margem_m2", peso: 0.25, label: "Margem/m²" },
  { kpiNome: "iap", peso: 0.20, label: "IAP" },
  { kpiNome: "ip_pct", peso: 0.15, label: "IP% (invertido)" },
  { kpiNome: "ipe_medio", peso: 0.10, label: "IPE Médio" },
];

// Evolução semanal de perdas (12 semanas, Loja A)
export const mockEvolucaoPerdas = [
  { semana: "S01", operacional: 320, vencimento: 580, furto_externo: 120, furto_interno: 45 },
  { semana: "S02", operacional: 290, vencimento: 610, furto_externo: 95, furto_interno: 30 },
  { semana: "S03", operacional: 350, vencimento: 540, furto_externo: 110, furto_interno: 55 },
  { semana: "S04", operacional: 310, vencimento: 590, furto_externo: 130, furto_interno: 40 },
  { semana: "S05", operacional: 280, vencimento: 620, furto_externo: 100, furto_interno: 35 },
  { semana: "S06", operacional: 340, vencimento: 560, furto_externo: 115, furto_interno: 50 },
  { semana: "S07", operacional: 300, vencimento: 600, furto_externo: 90, furto_interno: 42 },
  { semana: "S08", operacional: 330, vencimento: 570, furto_externo: 125, furto_interno: 38 },
  { semana: "S09", operacional: 295, vencimento: 630, furto_externo: 105, furto_interno: 48 },
  { semana: "S10", operacional: 315, vencimento: 585, furto_externo: 118, furto_interno: 44 },
  { semana: "S11", operacional: 275, vencimento: 650, furto_externo: 88, furto_interno: 52 },
  { semana: "S12", operacional: 345, vencimento: 555, furto_externo: 135, furto_interno: 36 },
];

// ─── Derived helpers ──────────────────────────────────

export function getSecoesForLoja(lojaId: string): Secao[] {
  return mockSecoes.filter(s => s.lojaId === lojaId);
}

export function getSKUsForLoja(lojaId: string): SKU[] {
  return mockSKUs.filter(s => s.lojaId === lojaId);
}

export function getPerdasForLoja(lojaId: string): RegistroPerda[] {
  return mockPerdas.filter(p => p.lojaId === lojaId);
}

export function getAlertasForLoja(lojaId: string): AlertaLoja[] {
  return mockAlertas.filter(a => a.lojaId === lojaId);
}

export function getReceitaTotalLoja(lojaId: string): number {
  return getSecoesForLoja(lojaId).reduce((s, sec) => s + sec.receita, 0);
}

export function getPerdaTotalLoja(lojaId: string): number {
  return getPerdasForLoja(lojaId).reduce((s, p) => s + p.valorPerda, 0);
}

export function useStoreData() {
  return {
    lojas: mockLojas,
    secoes: mockSecoes,
    skus: mockSKUs,
    perdas: mockPerdas,
    historicoPrecos: mockHistoricoPrecos,
    alertas: mockAlertas,
    configIPC: mockConfigIPC,
    evolucaoPerdas: mockEvolucaoPerdas,
    getSecoesForLoja,
    getSKUsForLoja,
    getPerdasForLoja,
    getAlertasForLoja,
    getReceitaTotalLoja,
    getPerdaTotalLoja,
  };
}
