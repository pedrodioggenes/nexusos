import { UNITS, CATEGORIES } from "./mock-data";

// ===== SUPPLIER DATA =====

export interface SupplierDim {
  id: string;
  name: string;
  categories: string[];
  cnpj: string;
  contact: string;
  city: string;
  rating: number; // 1-5
  volume_mensal: number;
  prazo_dias: number;
  desconto_pct: number;
  bonificacao_pct: number;
  observacoes: string;
}

export interface CompraFato {
  id: string;
  date: string;
  supplier_id: string;
  supplier_name: string;
  category: string;
  valor: number;
  unit_id: string;
  unit_name: string;
  status: "confirmada" | "pendente" | "cancelada" | "em_transito";
  nf: string;
}

export interface CondicaoComercial {
  id: string;
  supplier_id: string;
  supplier_name: string;
  prazo_dias: number;
  desconto_pct: number;
  bonificacao_pct: number;
  observacoes: string;
  updated_at: string;
  updated_by: string;
}

export interface EntregaPerformance {
  id: string;
  supplier_id: string;
  supplier_name: string;
  atraso_medio_dias: number;
  pct_faltas: number;
  ocorrencias: number;
  total_entregas: number;
  on_time_pct: number;
  trend: number[];
}

export interface RiscoAbastecimento {
  id: string;
  item: string;
  category: string;
  risco: "alto" | "medio" | "baixo";
  evidencia: string;
  unit_name: string;
  unit_id: string;
  fornecedores_count: number;
  dependencia_principal: string;
  ruptura_recorrente: boolean;
}

export interface CondicaoLog {
  id: string;
  supplier_name: string;
  campo: string;
  valor_anterior: string;
  valor_novo: string;
  data: string;
  usuario: string;
}

// ===== SUPPLIERS =====

export const SUPPLIERS: SupplierDim[] = [
  { id: "s1", name: "Nestlé Brasil", categories: ["Mercearia", "Bebidas"], cnpj: "60.409.075/0001-52", contact: "João Almeida", city: "São Paulo", rating: 4.5, volume_mensal: 485000, prazo_dias: 28, desconto_pct: 3.5, bonificacao_pct: 2.0, observacoes: "Contrato renovado em Jan/2026" },
  { id: "s2", name: "Ambev S.A.", categories: ["Bebidas"], cnpj: "07.526.557/0001-00", contact: "Maria Souza", city: "São Paulo", rating: 4.2, volume_mensal: 380000, prazo_dias: 21, desconto_pct: 5.0, bonificacao_pct: 3.0, observacoes: "Bonificação sazonal ativa" },
  { id: "s3", name: "JBS Foods", categories: ["Açougue", "Perecíveis"], cnpj: "02.916.265/0001-60", contact: "Carlos Fernandes", city: "Goiânia", rating: 3.8, volume_mensal: 320000, prazo_dias: 14, desconto_pct: 2.0, bonificacao_pct: 1.5, observacoes: "NF 12340 com atraso" },
  { id: "s4", name: "P&G", categories: ["Higiene", "Limpeza"], cnpj: "04.571.731/0001-53", contact: "Ana Martins", city: "São Paulo", rating: 4.7, volume_mensal: 245000, prazo_dias: 30, desconto_pct: 4.0, bonificacao_pct: 2.5, observacoes: "Contrato especial Higiene" },
  { id: "s5", name: "BRF S.A.", categories: ["Perecíveis", "Açougue"], cnpj: "01.838.723/0001-27", contact: "Pedro Rocha", city: "Curitiba", rating: 4.0, volume_mensal: 290000, prazo_dias: 21, desconto_pct: 3.0, bonificacao_pct: 2.0, observacoes: "" },
  { id: "s6", name: "Coca-Cola FEMSA", categories: ["Bebidas"], cnpj: "13.551.291/0001-60", contact: "Lucia Ramos", city: "São Paulo", rating: 4.3, volume_mensal: 210000, prazo_dias: 28, desconto_pct: 4.5, bonificacao_pct: 3.5, observacoes: "Campanha verão ativa" },
  { id: "s7", name: "Ypê Química", categories: ["Limpeza"], cnpj: "61.585.619/0001-48", contact: "Roberto Lima", city: "Amparo/SP", rating: 4.1, volume_mensal: 125000, prazo_dias: 30, desconto_pct: 3.0, bonificacao_pct: 1.0, observacoes: "" },
  { id: "s8", name: "Unilever Brasil", categories: ["Higiene", "Limpeza", "Mercearia"], cnpj: "61.067.600/0001-63", contact: "Fernanda Costa", city: "São Paulo", rating: 4.6, volume_mensal: 310000, prazo_dias: 28, desconto_pct: 3.8, bonificacao_pct: 2.2, observacoes: "Portfólio ampliado" },
  { id: "s9", name: "Granja Brasil", categories: ["Hortifruti"], cnpj: "05.123.456/0001-78", contact: "Marcos Pereira", city: "Campinas", rating: 3.5, volume_mensal: 95000, prazo_dias: 7, desconto_pct: 1.0, bonificacao_pct: 0, observacoes: "Entrega diária perecível" },
  { id: "s10", name: "Panificadora Central", categories: ["Padaria"], cnpj: "12.345.678/0001-90", contact: "Sônia Dias", city: "Local", rating: 3.2, volume_mensal: 65000, prazo_dias: 7, desconto_pct: 0, bonificacao_pct: 0, observacoes: "Fornecedor local" },
  { id: "s11", name: "Melitta do Brasil", categories: ["Mercearia"], cnpj: "61.074.559/0001-30", contact: "Paulo Neves", city: "São Paulo", rating: 4.4, volume_mensal: 78000, prazo_dias: 28, desconto_pct: 2.5, bonificacao_pct: 1.5, observacoes: "" },
  { id: "s12", name: "Barilla Brasil", categories: ["Mercearia"], cnpj: "62.551.333/0001-87", contact: "Daniela Ruiz", city: "São Paulo", rating: 4.3, volume_mensal: 52000, prazo_dias: 30, desconto_pct: 2.0, bonificacao_pct: 1.0, observacoes: "" },
];

// ===== COMPRAS DO PERÍODO =====

const statuses: CompraFato["status"][] = ["confirmada", "pendente", "em_transito", "cancelada"];

export const COMPRAS: CompraFato[] = (() => {
  const items: CompraFato[] = [];
  let idx = 1;
  for (let d = 1; d <= 13; d++) {
    const numCompras = 2 + Math.floor(Math.random() * 3);
    for (let c = 0; c < numCompras; c++) {
      const supplier = SUPPLIERS[Math.floor(Math.random() * SUPPLIERS.length)];
      const cat = supplier.categories[Math.floor(Math.random() * supplier.categories.length)];
      const unit = UNITS[Math.floor(Math.random() * UNITS.length)];
      const status = d < 10 ? "confirmada" : statuses[Math.floor(Math.random() * statuses.length)];
      items.push({
        id: `cp${idx}`,
        date: `2026-02-${String(d).padStart(2, "0")}`,
        supplier_id: supplier.id,
        supplier_name: supplier.name,
        category: cat,
        valor: Math.round(15000 + Math.random() * 120000),
        unit_id: unit.id,
        unit_name: unit.name,
        status,
        nf: `NF ${12350 + idx}`,
      });
      idx++;
    }
  }
  return items.sort((a, b) => b.date.localeCompare(a.date));
})();

// ===== CONDIÇÕES COMERCIAIS =====

export const CONDICOES: CondicaoComercial[] = SUPPLIERS.map((s) => ({
  id: `cc${s.id}`,
  supplier_id: s.id,
  supplier_name: s.name,
  prazo_dias: s.prazo_dias,
  desconto_pct: s.desconto_pct,
  bonificacao_pct: s.bonificacao_pct,
  observacoes: s.observacoes,
  updated_at: "2026-01-15T10:00:00Z",
  updated_by: "Carlos Silva",
}));

export const CONDICOES_LOG: CondicaoLog[] = [
  { id: "cl1", supplier_name: "Nestlé Brasil", campo: "Desconto", valor_anterior: "3.0%", valor_novo: "3.5%", data: "2026-01-15", usuario: "Carlos Silva" },
  { id: "cl2", supplier_name: "Ambev S.A.", campo: "Bonificação", valor_anterior: "2.0%", valor_novo: "3.0%", data: "2026-01-20", usuario: "Ana Oliveira" },
  { id: "cl3", supplier_name: "P&G", campo: "Prazo", valor_anterior: "28 dias", valor_novo: "30 dias", data: "2026-01-22", usuario: "Carlos Silva" },
  { id: "cl4", supplier_name: "Coca-Cola FEMSA", campo: "Bonificação", valor_anterior: "2.5%", valor_novo: "3.5%", data: "2026-02-01", usuario: "Ana Oliveira" },
  { id: "cl5", supplier_name: "JBS Foods", campo: "Prazo", valor_anterior: "21 dias", valor_novo: "14 dias", data: "2026-02-05", usuario: "Roberto Santos" },
  { id: "cl6", supplier_name: "Unilever Brasil", campo: "Desconto", valor_anterior: "3.5%", valor_novo: "3.8%", data: "2026-02-08", usuario: "Carlos Silva" },
];

// ===== ENTREGAS PERFORMANCE =====

export const ENTREGAS: EntregaPerformance[] = SUPPLIERS.map((s, i) => {
  const total = 15 + Math.floor(Math.random() * 30);
  const onTime = s.rating > 4 ? 85 + Math.random() * 13 : 60 + Math.random() * 25;
  return {
    id: `ep${s.id}`,
    supplier_id: s.id,
    supplier_name: s.name,
    atraso_medio_dias: s.rating > 4 ? +(0.5 + Math.random() * 1.5).toFixed(1) : +(1.5 + Math.random() * 4).toFixed(1),
    pct_faltas: +(s.rating > 4 ? Math.random() * 3 : 3 + Math.random() * 8).toFixed(1),
    ocorrencias: Math.floor(s.rating > 4 ? Math.random() * 3 : 3 + Math.random() * 6),
    total_entregas: total,
    on_time_pct: +onTime.toFixed(1),
    trend: Array.from({ length: 6 }, () => +(70 + Math.random() * 28).toFixed(0)),
  };
});

// ===== RISCO DE ABASTECIMENTO =====

export const RISCOS: RiscoAbastecimento[] = [
  { id: "r1", item: "Refrigerante Cola - 2L", category: "Bebidas", risco: "alto", evidencia: "Dependência 100% Coca-Cola FEMSA, 3 rupturas em 60 dias", unit_name: "Rede", unit_id: "all", fornecedores_count: 1, dependencia_principal: "Coca-Cola FEMSA", ruptura_recorrente: true },
  { id: "r2", item: "Carne Vermelha - 1kg", category: "Açougue", risco: "alto", evidencia: "JBS único fornecedor, NF atrasada, atraso médio 4.2 dias", unit_name: "Rede", unit_id: "all", fornecedores_count: 1, dependencia_principal: "JBS Foods", ruptura_recorrente: true },
  { id: "r3", item: "Pão Francês - kg", category: "Padaria", risco: "alto", evidencia: "Fornecedor local único, sem backup, rating 3.2", unit_name: "Rede", unit_id: "all", fornecedores_count: 1, dependencia_principal: "Panificadora Central", ruptura_recorrente: false },
  { id: "r4", item: "Hortifruti (geral)", category: "Hortifruti", risco: "medio", evidencia: "Granja Brasil único, entrega diária perecível, rating 3.5", unit_name: "Rede", unit_id: "all", fornecedores_count: 1, dependencia_principal: "Granja Brasil", ruptura_recorrente: false },
  { id: "r5", item: "Leite Integral - 1L", category: "Perecíveis", risco: "medio", evidencia: "2 fornecedores alternativos mas volume concentrado 80% em BRF", unit_name: "Norte", unit_id: "u2", fornecedores_count: 2, dependencia_principal: "BRF S.A.", ruptura_recorrente: true },
  { id: "r6", item: "Detergente - 500ml", category: "Limpeza", risco: "baixo", evidencia: "Ypê + Unilever disponíveis, boa cobertura", unit_name: "Rede", unit_id: "all", fornecedores_count: 2, dependencia_principal: "Ypê Química", ruptura_recorrente: false },
  { id: "r7", item: "Sabonete Líquido - 500ml", category: "Higiene", risco: "baixo", evidencia: "P&G + Unilever + alternativas, sem histórico de ruptura", unit_name: "Rede", unit_id: "all", fornecedores_count: 3, dependencia_principal: "P&G", ruptura_recorrente: false },
  { id: "r8", item: "Café Expresso - 500g", category: "Mercearia", risco: "medio", evidencia: "Melitta único fornecedor, sem ruptura recente mas sem backup", unit_name: "Rede", unit_id: "all", fornecedores_count: 1, dependencia_principal: "Melitta do Brasil", ruptura_recorrente: false },
  { id: "r9", item: "Iogurte Natural - 500g", category: "Perecíveis", risco: "medio", evidencia: "Perecível com 2 dias de cobertura, BRF único na região Leste", unit_name: "Leste", unit_id: "u4", fornecedores_count: 1, dependencia_principal: "BRF S.A.", ruptura_recorrente: true },
  { id: "r10", item: "Queijo Meia Cura - 500g", category: "Perecíveis", risco: "alto", evidencia: "Fornecedor regional de Poços de Caldas, difícil substituição, 2 rupturas", unit_name: "Rede", unit_id: "all", fornecedores_count: 1, dependencia_principal: "Poços de Caldas", ruptura_recorrente: true },
];

// ===== HELPERS =====

export function getSupplierById(id: string): SupplierDim | undefined {
  return SUPPLIERS.find(s => s.id === id);
}

export function getSupplierProblems(supplierId: string) {
  const supplier = getSupplierById(supplierId);
  if (!supplier) return [];
  const problems: { type: string; description: string; impact: string }[] = [];
  const entrega = ENTREGAS.find(e => e.supplier_id === supplierId);
  if (entrega && entrega.on_time_pct < 80) {
    problems.push({ type: "Entrega", description: `On-time ${entrega.on_time_pct}%`, impact: `${entrega.ocorrencias} ocorrências` });
  }
  const riscos = RISCOS.filter(r => r.dependencia_principal === supplier.name && r.risco !== "baixo");
  riscos.forEach(r => {
    problems.push({ type: "Risco", description: r.evidencia, impact: r.risco === "alto" ? "Alto" : "Médio" });
  });
  return problems;
}
