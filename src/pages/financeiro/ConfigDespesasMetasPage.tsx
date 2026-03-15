import { PageHeader } from "@/components/ui/page-header";
import { Sliders, Plus, Target, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatCurrency, formatPercent } from "@/hooks/financeiro/useFinancialFormulas";

const mockDespesas = [
  { id: "1", natureza: "Folha de Pagamento", loja: "Rede", valor: 2750000, periodo: "Fev/2026", origem: "RH" },
  { id: "2", natureza: "Ocupação", loja: "Rede", valor: 850000, periodo: "Fev/2026", origem: "Manual" },
  { id: "3", natureza: "Utilidades", loja: "Loja Matriz", valor: 120000, periodo: "Fev/2026", origem: "Manual" },
  { id: "4", natureza: "Perdas", loja: "Rede", valor: 185000, periodo: "Fev/2026", origem: "CD" },
  { id: "5", natureza: "Manutenção", loja: "Loja Norte", valor: 65000, periodo: "Fev/2026", origem: "Manual" },
  { id: "6", natureza: "Tecnologia", loja: "Rede", valor: 320000, periodo: "Fev/2026", origem: "Tech" },
  { id: "7", natureza: "Marketing", loja: "Rede", valor: 380000, periodo: "Fev/2026", origem: "Marketing" },
  { id: "8", natureza: "Logística", loja: "Rede", valor: 220000, periodo: "Fev/2026", origem: "Manual" },
];

const mockMetas = [
  { id: "1", kpi: "Margem Bruta %", dimensao: "Rede", meta: 34.0, limAmarelo: 32.0, limVermelho: 30.0 },
  { id: "2", kpi: "Margem Operacional %", dimensao: "Rede", meta: 5.8, limAmarelo: 5.0, limVermelho: 4.0 },
  { id: "3", kpi: "Margem Líquida %", dimensao: "Rede", meta: 4.3, limAmarelo: 3.5, limVermelho: 3.0 },
  { id: "4", kpi: "CCC (dias)", dimensao: "Rede", meta: 10, limAmarelo: 12, limVermelho: 15 },
  { id: "5", kpi: "ROIC %", dimensao: "Rede", meta: 12.0, limAmarelo: 10.0, limVermelho: 8.0 },
  { id: "6", kpi: "Margem Bruta %", dimensao: "Loja Matriz", meta: 35.0, limAmarelo: 33.0, limVermelho: 31.0 },
];

export default function ConfigDespesasMetasPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Despesas & Metas" description="Cadastro de despesas operacionais e metas financeiras" />

      <Tabs defaultValue="despesas">
        <TabsList>
          <TabsTrigger value="despesas" className="gap-1.5"><DollarSign className="h-3.5 w-3.5" /> Despesas</TabsTrigger>
          <TabsTrigger value="metas" className="gap-1.5"><Target className="h-3.5 w-3.5" /> Metas</TabsTrigger>
        </TabsList>

        <TabsContent value="despesas" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" className="gap-1.5 bg-app-financeiro hover:bg-app-financeiro/90 text-white">
              <Plus className="h-3.5 w-3.5" /> Nova Despesa
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-[1fr_100px_100px_90px_90px] gap-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
              <div className="px-4 py-3">Natureza</div>
              <div className="px-3 py-3">Loja</div>
              <div className="px-3 py-3 text-right">Valor</div>
              <div className="px-3 py-3">Período</div>
              <div className="px-3 py-3">Origem</div>
            </div>
            {mockDespesas.map(d => (
              <div key={d.id} className="grid grid-cols-[1fr_100px_100px_90px_90px] gap-0 border-b border-border/50 last:border-0 items-center hover:bg-muted/20">
                <div className="px-4 py-2.5 text-sm font-medium text-foreground">{d.natureza}</div>
                <div className="px-3 py-2.5 text-sm text-muted-foreground">{d.loja}</div>
                <div className="px-3 py-2.5 text-right text-sm tabular-nums text-foreground">{formatCurrency(d.valor)}</div>
                <div className="px-3 py-2.5 text-xs text-muted-foreground">{d.periodo}</div>
                <div className="px-3 py-2.5">
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                    d.origem === "Manual" ? "bg-muted text-muted-foreground" : "bg-app-financeiro/10 text-app-financeiro"
                  )}>{d.origem}</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metas" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" className="gap-1.5 bg-app-financeiro hover:bg-app-financeiro/90 text-white">
              <Plus className="h-3.5 w-3.5" /> Nova Meta
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-[1fr_100px_80px_80px_80px] gap-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
              <div className="px-4 py-3">KPI</div>
              <div className="px-3 py-3">Dimensão</div>
              <div className="px-3 py-3 text-right">Meta</div>
              <div className="px-3 py-3 text-right">Amarelo</div>
              <div className="px-3 py-3 text-right">Vermelho</div>
            </div>
            {mockMetas.map(m => (
              <div key={m.id} className="grid grid-cols-[1fr_100px_80px_80px_80px] gap-0 border-b border-border/50 last:border-0 items-center hover:bg-muted/20">
                <div className="px-4 py-2.5 text-sm font-medium text-foreground">{m.kpi}</div>
                <div className="px-3 py-2.5 text-sm text-muted-foreground">{m.dimensao}</div>
                <div className="px-3 py-2.5 text-right text-sm tabular-nums font-semibold text-foreground">{m.meta}</div>
                <div className="px-3 py-2.5 text-right text-sm tabular-nums text-warning">{m.limAmarelo}</div>
                <div className="px-3 py-2.5 text-right text-sm tabular-nums text-destructive">{m.limVermelho}</div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
