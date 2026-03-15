import { UNITS } from "./mock-data";

// ===== PESSOAS MOCK DATA =====

export interface HeadcountUnidade {
  unit_id: string;
  unit_name: string;
  quantidade: number;
  quantidade_prev: number;
  variacao: number;
}

export interface CustoPessoalUnidade {
  unit_id: string;
  unit_name: string;
  custo: number;
  custo_prev: number;
  pct_venda: number;
  trend: number[];
}

export interface FaltaAtraso {
  unit_id: string;
  unit_name: string;
  faltas: number;
  atrasos: number;
  faltas_prev: number;
  atrasos_prev: number;
  trend_faltas: number[];
  trend_atrasos: number[];
}

export interface EntradaSaida {
  unit_id: string;
  unit_name: string;
  entradas: number;
  saidas: number;
  saldo: number;
  mes: string;
}

export interface LiderTime {
  id: string;
  unit_id: string;
  unit_name: string;
  setor: string;
  lider: string;
  tamanho_time: number;
  cargo: string;
}

// ===== HEADCOUNT =====

const staffSizes = [82, 68, 55, 48, 60, 42, 35];

export const HEADCOUNT: HeadcountUnidade[] = UNITS.map((u, i) => {
  const qty = staffSizes[i] || 40;
  const prev = qty + Math.floor(Math.random() * 6 - 3);
  return {
    unit_id: u.id,
    unit_name: u.name,
    quantidade: qty,
    quantidade_prev: prev,
    variacao: qty - prev,
  };
});

// ===== CUSTO DE PESSOAL =====

export const CUSTO_PESSOAL: CustoPessoalUnidade[] = UNITS.map((u, i) => {
  const custo = Math.round(u.sales * (0.12 + Math.random() * 0.06));
  const custoPrev = Math.round(custo * (0.95 + Math.random() * 0.05));
  return {
    unit_id: u.id,
    unit_name: u.name,
    custo,
    custo_prev: custoPrev,
    pct_venda: +((custo / u.sales) * 100).toFixed(1),
    trend: Array.from({ length: 6 }, () => Math.round(custo * (0.92 + Math.random() * 0.16))),
  };
});

// ===== FALTAS & ATRASOS =====

export const FALTAS_ATRASOS: FaltaAtraso[] = UNITS.map((u, i) => {
  const faltas = Math.floor(5 + Math.random() * 15);
  const atrasos = Math.floor(8 + Math.random() * 20);
  return {
    unit_id: u.id,
    unit_name: u.name,
    faltas,
    atrasos,
    faltas_prev: faltas + Math.floor(Math.random() * 6 - 3),
    atrasos_prev: atrasos + Math.floor(Math.random() * 8 - 4),
    trend_faltas: Array.from({ length: 6 }, () => Math.floor(3 + Math.random() * 18)),
    trend_atrasos: Array.from({ length: 6 }, () => Math.floor(5 + Math.random() * 25)),
  };
});

// ===== ENTRADAS & SAÍDAS =====

export const ENTRADAS_SAIDAS: EntradaSaida[] = UNITS.map((u) => {
  const entradas = Math.floor(Math.random() * 5);
  const saidas = Math.floor(Math.random() * 4);
  return {
    unit_id: u.id,
    unit_name: u.name,
    entradas,
    saidas,
    saldo: entradas - saidas,
    mes: "Fev/2026",
  };
});

// ===== LÍDERES & TIMES =====

const setores = ["Frente de Caixa", "Perecíveis", "Mercearia", "Hortifruti", "Açougue", "Padaria", "Estoque", "Administrativo"];
const nomes = [
  "João Mendes", "Ana Oliveira", "Carlos Ferreira", "Maria Lima", "Pedro Costa",
  "Luciana Silva", "Roberto Santos", "Marcos Souza", "Sônia Dias", "Paulo Neves",
  "Fernanda Rocha", "Ricardo Alves", "Juliana Castro", "André Gomes", "Patrícia Lopes",
  "Bruno Martins", "Camila Ribeiro", "Diego Nascimento", "Elena Cardoso", "Felipe Araújo",
  "Gabriela Pinto", "Hugo Teixeira", "Isabela Moraes", "Leonardo Barbosa", "Mariana Correia",
];

let liderId = 0;
export const LIDERES_TIMES: LiderTime[] = UNITS.flatMap((u, ui) => {
  const numSetores = 3 + Math.floor(Math.random() * 4);
  const setoresUnit = setores.slice(0, numSetores);
  return setoresUnit.map((setor) => {
    liderId++;
    return {
      id: `lt${liderId}`,
      unit_id: u.id,
      unit_name: u.name,
      setor,
      lider: nomes[(liderId - 1) % nomes.length],
      tamanho_time: Math.floor(4 + Math.random() * 12),
      cargo: "Encarregado",
    };
  });
});
