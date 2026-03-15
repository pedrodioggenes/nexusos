import {
  Palette,
  Image,
  Clock,
  CheckCircle,
} from "lucide-react";
import { TeamAreaPage, TeamAreaConfig } from "@/components/marketing/team/TeamAreaPage";

const config: TeamAreaConfig = {
  taskType: "design",
  title: "Design",
  subtitle: "Gestão de peças criativas e materiais visuais",
  defaultPlatforms: ["Banner"],
  statIcons: [
    <Image className="h-4 w-4" />,
    <Clock className="h-4 w-4" />,
    <Palette className="h-4 w-4" />,
    <CheckCircle className="h-4 w-4" />,
  ],
  statLabels: ["Total Demandas", "Em Produção", "Aguardando Aprovação", "Aprovadas"],
  bottomSection: () => (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="h-4 w-4 text-app-gestao" />
        <h3 className="text-sm font-semibold">Identidade Visual</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-primary" />
          <span className="text-xs text-muted-foreground">Primária</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-secondary" />
          <span className="text-xs text-muted-foreground">Secundária</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-accent" />
          <span className="text-xs text-muted-foreground">Accent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-emerald-500" />
          <span className="text-xs text-muted-foreground">Sucesso</span>
        </div>
      </div>
    </div>
  ),
};

export default function Design() {
  return <TeamAreaPage config={config} />;
}
