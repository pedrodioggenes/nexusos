import {
  PenTool,
  FileText,
  MessageSquare,
  Sparkles,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TeamAreaPage, TeamAreaConfig } from "@/components/marketing/team/TeamAreaPage";
import { TeamTask } from "@/hooks/useTeamTasks";

const config: TeamAreaConfig = {
  taskType: "copy",
  title: "Copywriting",
  subtitle: "Gestão de textos, comunicação e tom de voz",
  createButtonLabel: "Novo Texto",
  defaultPlatforms: ["Social Media"],
  statIcons: [
    <FileText className="h-4 w-4" />,
    <Clock className="h-4 w-4" />,
    <PenTool className="h-4 w-4" />,
    <CheckCircle className="h-4 w-4" />,
  ],
  statLabels: ["Total Demandas", "Em Produção", "Aguardando Aprovação", "Aprovados"],
  extraSection: (tasks: TeamTask[]) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="rounded-xl border border-border bg-card p-4 text-center">
        <MessageSquare className="h-6 w-6 mx-auto mb-2 text-accent" />
        <p className="text-lg font-bold">
          {tasks.filter((t) => t.platforms?.includes("Social Media")).length}
        </p>
        <p className="text-xs text-muted-foreground">Social Media</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 text-center">
        <FileText className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
        <p className="text-lg font-bold">
          {tasks.filter((t) => t.platforms?.includes("E-mail")).length}
        </p>
        <p className="text-xs text-muted-foreground">E-mails</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 text-center">
        <PenTool className="h-6 w-6 mx-auto mb-2 text-app-gestao" />
        <p className="text-lg font-bold">
          {tasks.filter((t) => t.platforms?.includes("Campanha")).length}
        </p>
        <p className="text-xs text-muted-foreground">Campanhas</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 text-center">
        <Sparkles className="h-6 w-6 mx-auto mb-2 text-amber-500" />
        <p className="text-lg font-bold">
          {tasks.filter((t) => t.platforms?.includes("Landing Page")).length}
        </p>
        <p className="text-xs text-muted-foreground">Landing Pages</p>
      </div>
    </div>
  ),
  bottomSection: () => (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold mb-3">Tom de Voz da Marca</h3>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Acolhedor</Badge>
        <Badge variant="outline">Profissional</Badge>
        <Badge variant="outline">Dinâmico</Badge>
        <Badge variant="outline">Confiável</Badge>
        <Badge variant="outline">Próximo</Badge>
      </div>
    </div>
  ),
};

export default function Copywriter() {
  return <TeamAreaPage config={config} />;
}
