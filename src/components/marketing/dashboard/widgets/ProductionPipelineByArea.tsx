import { useNavigate } from "react-router-dom";
import { Users, ArrowRight, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassBentoCard, GlassBentoContent, GlassBentoHeader, GlassBentoTitle } from "@/components/ui/glass-bento";
import { cn } from "@/lib/utils";

interface AreaData {
  label: string;
  key: string;
  count: number;
  route: string;
  color: string;
}

interface Props {
  tasksByArea: Record<string, { length: number } | any[]>;
  overdueTasks: number;
  className?: string;
}

const AREAS: Omit<AreaData, 'count'>[] = [
  { label: "Social", key: "social", route: "/app/marketing/equipe/social", color: "bg-pink-500" },
  { label: "Design", key: "design", route: "/app/marketing/equipe/design", color: "bg-violet-500" },
  { label: "Copy", key: "copy", route: "/app/marketing/equipe/copywriter", color: "bg-blue-500" },
  { label: "Tráfego", key: "traffic", route: "/app/marketing/equipe/trafego", color: "bg-emerald-500" },
  { label: "Vídeo", key: "video", route: "/app/marketing/equipe/videomaker", color: "bg-amber-500" },
];

export function ProductionPipelineByArea({ tasksByArea, overdueTasks, className }: Props) {
  const navigate = useNavigate();

  const areas: AreaData[] = AREAS.map(a => ({
    ...a,
    count: Array.isArray(tasksByArea[a.key]) ? (tasksByArea[a.key] as any[]).length : 0,
  }));

  const totalWIP = areas.reduce((s, a) => s + a.count, 0);
  const maxCount = Math.max(...areas.map(a => a.count), 1);

  return (
    <GlassBentoCard className={cn("h-full", className)} glowColor="rgba(var(--app-gestao-rgb, 200,170,80), 0.1)">
      <GlassBentoContent>
        <GlassBentoHeader
          icon={<Users className="h-4 w-4 text-app-gestao" />}
          action={
            totalWIP > 0 ? (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {totalWIP} em andamento
              </Badge>
            ) : null
          }
        >
          <GlassBentoTitle>Produção por Área</GlassBentoTitle>
        </GlassBentoHeader>

        {overdueTasks > 0 && (
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-destructive/5 border border-destructive/20 mb-2">
            <AlertCircle className="h-3 w-3 text-destructive" />
            <span className="text-[11px] text-destructive">{overdueTasks} tarefa(s) atrasada(s)</span>
          </div>
        )}

        {totalWIP === 0 ? (
          <div className="py-6 text-center">
            <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Nenhuma tarefa em andamento</p>
          </div>
        ) : (
          <div className="space-y-2">
            {areas.map(a => (
              <button
                key={a.key}
                onClick={() => navigate(a.route)}
                className="flex items-center gap-2 w-full group hover:bg-muted/30 rounded-lg p-1.5 transition-colors"
              >
                <span className="text-[11px] font-medium w-14 text-left text-foreground/80">{a.label}</span>
                <div className="flex-1 h-3 rounded-full bg-muted/50 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", a.color)}
                    style={{ width: `${(a.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-foreground/70 w-6 text-right">{a.count}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}
      </GlassBentoContent>
    </GlassBentoCard>
  );
}
