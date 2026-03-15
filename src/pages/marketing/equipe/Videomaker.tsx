import {
  Video,
  Film,
  Clock,
  CheckCircle,
  Play,
  Clapperboard,
} from "lucide-react";
import { TeamAreaPage, TeamAreaConfig } from "@/components/marketing/team/TeamAreaPage";
import { TeamTask } from "@/hooks/useTeamTasks";

const config: TeamAreaConfig = {
  taskType: "video",
  title: "Videomaker",
  subtitle: "Produção de vídeos e conteúdo audiovisual",
  defaultPlatforms: ["Reels"],
  statIcons: [
    <Video className="h-4 w-4" />,
    <Clock className="h-4 w-4" />,
    <Film className="h-4 w-4" />,
    <CheckCircle className="h-4 w-4" />,
  ],
  statLabels: ["Total Demandas", "Em Produção", "Aguardando Aprovação", "Aprovadas"],
  extraSection: (tasks: TeamTask[]) => {
    const videoTypes = {
      reels: tasks.filter((t) => t.platforms?.includes("Reels")).length,
      stories: tasks.filter((t) => t.platforms?.includes("Stories")).length,
      youtube: tasks.filter((t) => t.platforms?.includes("YouTube")).length,
      institucional: tasks.filter((t) => t.platforms?.includes("Institucional")).length,
    };

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Play className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reels</p>
              <p className="text-lg font-semibold">{videoTypes.reels}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-module-gestao/10 flex items-center justify-center">
              <Film className="h-4 w-4 text-module-gestao" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Stories</p>
              <p className="text-lg font-semibold">{videoTypes.stories}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
              <Clapperboard className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">YouTube</p>
              <p className="text-lg font-semibold">{videoTypes.youtube}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Video className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Institucional</p>
              <p className="text-lg font-semibold">{videoTypes.institucional}</p>
            </div>
          </div>
        </div>
      </div>
    );
  },
  bottomSection: () => (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clapperboard className="h-4 w-4 text-module-gestao" />
        <h3 className="text-sm font-semibold">Recursos de Produção</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs">Câmera Principal</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs">Drone DJI</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs">Kit Iluminação</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-xs">Estúdio (Reservado)</span>
        </div>
      </div>
    </div>
  ),
};

export default function Videomaker() {
  return <TeamAreaPage config={config} />;
}
