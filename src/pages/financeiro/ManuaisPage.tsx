import { PageHeader } from "@/components/ui/page-header";
import { BookOpen, FileText, Calculator, DollarSign, TrendingUp, PieChart, Target, RefreshCw } from "lucide-react";

const glossary = [
  { sigla: "RL", nome: "Receita Líquida", formula: "RB − Dev − Desc − Impostos", descricao: "Faturamento real após deduções" },
  { sigla: "CMV", nome: "Custo da Mercadoria Vendida", formula: "CMV Bruto + Perdas − Bonificações", descricao: "Custo líquido dos produtos vendidos" },
  { sigla: "LB", nome: "Lucro Bruto", formula: "RL − CMV Líquido", descricao: "Margem de comercialização" },
  { sigla: "MB%", nome: "Margem Bruta", formula: "(LB / RL) × 100", descricao: "Percentual de lucro sobre vendas" },
  { sigla: "EBIT", nome: "Lucro Operacional", formula: "LB Ajustado − Despesas Operacionais", descricao: "Resultado das operações" },
  { sigla: "MO%", nome: "Margem Operacional", formula: "(EBIT / RL) × 100", descricao: "Eficiência operacional" },
  { sigla: "EBITDA", nome: "EBITDA", formula: "EBIT + Depreciação + Amortização", descricao: "Geração de caixa operacional" },
  { sigla: "LL", nome: "Lucro Líquido", formula: "LAIR − IR", descricao: "Resultado final do período" },
  { sigla: "ML%", nome: "Margem Líquida", formula: "(LL / RL) × 100", descricao: "Rentabilidade final" },
  { sigla: "DIO", nome: "Days Inventory Outstanding", formula: "(Estoque Médio / CMV) × dias", descricao: "Prazo médio de estoque" },
  { sigla: "DSO", nome: "Days Sales Outstanding", formula: "(Contas a Receber / RL) × dias", descricao: "Prazo médio de recebimento" },
  { sigla: "DPO", nome: "Days Payable Outstanding", formula: "(Contas a Pagar / Compras) × dias", descricao: "Prazo médio de pagamento" },
  { sigla: "CCC", nome: "Ciclo de Conversão de Caixa", formula: "DIO + DSO − DPO", descricao: "Tempo para converter investimento em caixa" },
  { sigla: "NCG", nome: "Necessidade de Capital de Giro", formula: "(CCC / dias) × CMV diário", descricao: "Capital necessário para operar" },
  { sigla: "IMC", nome: "Índice de Margem de Contribuição", formula: "(MC / Receita) × 100", descricao: "Contribuição da categoria ao resultado" },
  { sigla: "ROIC", nome: "Retorno sobre Capital Investido", formula: "(NOPAT / Capital Investido) × 100", descricao: "Eficiência do capital empregado" },
  { sigla: "ROCE", nome: "Retorno sobre Capital Empregado", formula: "(EBIT / Capital Empregado) × 100", descricao: "Retorno operacional sobre ativos" },
  { sigla: "PEO", nome: "Ponto de Equilíbrio Operacional", formula: "CF / (1 − CV/RL)", descricao: "Receita mínima para cobrir custos" },
];

export default function ManuaisPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Glossário de Indicadores Financeiros"
        description="Fórmulas, siglas e lógica de negócio do Financeiro"
      />

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Sigla</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Indicador</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Fórmula</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Descrição</th>
              </tr>
            </thead>
            <tbody>
              {glossary.map((item, i) => (
                <tr key={item.sigla} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-app-financeiro">{item.sigla}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{item.nome}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.formula}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.descricao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
