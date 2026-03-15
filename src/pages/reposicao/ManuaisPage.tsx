import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { SolidCard } from "@/components/ui/solid-card";
import { BookOpen, ArrowRight, Headphones } from "lucide-react";

export default function ManuaisPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <PageHeader title="Manuais de Uso" description="Documentação e guias de referência do aplicativo Reposição" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SolidCard hoverable className="cursor-pointer group" onClick={() => navigate("/app/reposicao/manuais/glossario")}>
          <div className="p-6 flex flex-col gap-4">
            <div className="h-12 w-12 rounded-xl bg-app-reposicao/10 flex items-center justify-center"><BookOpen className="h-6 w-6 text-app-reposicao" /></div>
            <div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-app-reposicao transition-colors">Siglas e Indicadores</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Glossário completo com tradução, explicação e lógica de cálculo de todos os KPIs e siglas usados no aplicativo.</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-app-reposicao font-medium opacity-0 group-hover:opacity-100 transition-opacity">Abrir glossário <ArrowRight className="h-3.5 w-3.5" /></div>
          </div>
        </SolidCard>
        <SolidCard hoverable className="cursor-pointer group" onClick={() => navigate("/app/reposicao/suporte-tecnico")}>
          <div className="p-6 flex flex-col gap-4">
            <div className="h-12 w-12 rounded-xl bg-app-reposicao/10 flex items-center justify-center"><Headphones className="h-6 w-6 text-app-reposicao" /></div>
            <div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-app-reposicao transition-colors">Suporte Técnico</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Abra chamados, consulte FAQ, converse pelo chat ou entre em contato com a equipe técnica.</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-app-reposicao font-medium opacity-0 group-hover:opacity-100 transition-opacity">Acessar suporte <ArrowRight className="h-3.5 w-3.5" /></div>
          </div>
        </SolidCard>
      </div>
    </div>
  );
}
