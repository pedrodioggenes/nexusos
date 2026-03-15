import { PageHeader } from "@/components/ui/page-header";
import { Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ConfigGeralPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Configuração Financeira" description="Parâmetros gerais do aplicativo financeiro" />

      <div className="rounded-xl border border-border bg-card p-6 max-w-xl space-y-6">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Settings className="h-4 w-4 text-app-financeiro" />
          Parâmetros Gerais
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aliquota">Alíquota Efetiva de IR (%)</Label>
            <Input id="aliquota" type="number" defaultValue="9.5" step="0.1" className="max-w-[200px]" />
            <p className="text-[10px] text-muted-foreground">Usada no cálculo de IR (F-11) e NOPAT (F-37)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wacc">WACC — Custo Médio de Capital (%)</Label>
            <Input id="wacc" type="number" defaultValue="10.0" step="0.1" className="max-w-[200px]" />
            <p className="text-[10px] text-muted-foreground">Referência para Spread de Valor EVA (F-41)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icdf">Limite Caixa Crítico — ICDF (dias)</Label>
            <Input id="icdf" type="number" defaultValue="15" className="max-w-[200px]" />
            <p className="text-[10px] text-muted-foreground">Gera alerta vermelho se ICDF cair abaixo deste valor</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="depamort">Depreciação & Amortização Mensal (R$)</Label>
            <Input id="depamort" type="number" defaultValue="310000" className="max-w-[200px]" />
            <p className="text-[10px] text-muted-foreground">Valor padrão para cálculo do EBITDA (F-08)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="benchmark">Benchmark Setor — ROIC (%)</Label>
            <Input id="benchmark" type="number" defaultValue="8.5" step="0.1" className="max-w-[200px]" />
            <p className="text-[10px] text-muted-foreground">Referência setorial para o painel ROIC</p>
          </div>
        </div>

        <Button className="gap-2 bg-app-financeiro hover:bg-app-financeiro/90 text-white">
          <Save className="h-3.5 w-3.5" /> Salvar Configuração
        </Button>
      </div>
    </div>
  );
}
