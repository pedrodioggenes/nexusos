import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { AskAIBox } from "@/components/dominio/AskAIBox";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { Card } from "@/components/ui/card";
import { Sparkles, Info } from "lucide-react";

export default function InteligenciaAnalisesIA() {
  const { filters, updateFilter } = useGlobalFilters();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Análises IA</h1>
        <p className="text-muted-foreground">Faça perguntas sobre os dados da rede e receba respostas objetivas com fontes</p>
      </div>

      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />

      {/* Info card */}
      <Card className="p-4 border-app-ia/20 bg-app-ia/5">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-app-ia shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Como funciona</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Use os botões rápidos ou digite sua pergunta. As respostas são baseadas nos dados atuais da rede.
              Se não houver dado suficiente, o sistema informa onde coletar a informação.
            </p>
          </div>
        </div>
      </Card>

      <AskAIBox />

      {/* Disclaimer */}
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Info className="h-3.5 w-3.5" />
        <span>As análises usam dados internos da rede. Não são inventados fatos — se não há dado, a resposta informa.</span>
      </div>
    </div>
  );
}
