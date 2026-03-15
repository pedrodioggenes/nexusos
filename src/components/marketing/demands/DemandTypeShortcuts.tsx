import { CalendarDays, Palette, Video, PenLine } from "lucide-react";
import { PremiumGlassCard } from "@/components/dashboard/PremiumGlassCard";
import { cn } from "@/lib/utils";

interface DemandTypeShortcutsProps {
  onFilterType: (type: string) => void;
  onToggleCalendar: () => void;
  calendarOpen: boolean;
}

const shortcuts = [
  {
    id: "social_calendar",
    label: "Calendário de Postagens",
    description: "Visualize e crie posts por dia e rede social",
    icon: CalendarDays,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
    isCalendar: true,
  },
  {
    id: "design",
    label: "Briefings de Design",
    description: "Demandas de criação visual em andamento",
    icon: Palette,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
  },
  {
    id: "video",
    label: "Roteiros de Vídeo",
    description: "Scripts e produções pendentes",
    icon: Video,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  {
    id: "copywriting",
    label: "Tarefas de Copy",
    description: "Textos e legendas para aprovar",
    icon: PenLine,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
];

export function DemandTypeShortcuts({ onFilterType, onToggleCalendar, calendarOpen }: DemandTypeShortcutsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-foreground">Quadros Especiais</h3>
        <span className="text-xs text-muted-foreground">Atalhos por tipo de demanda</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {shortcuts.map((shortcut) => {
          const isActive = shortcut.isCalendar && calendarOpen;
          return (
            <PremiumGlassCard
              key={shortcut.id}
              className={cn(
                "p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md border",
                isActive ? shortcut.borderColor : "border-transparent"
              )}
              onClick={() => {
                if (shortcut.isCalendar) {
                  onToggleCalendar();
                } else {
                  onFilterType(shortcut.id);
                }
              }}
            >
              <div className="flex items-start gap-3">
                <div className={cn("p-2.5 rounded-xl", shortcut.bgColor)}>
                  <shortcut.icon className={cn("h-5 w-5", shortcut.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{shortcut.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{shortcut.description}</p>
                </div>
              </div>
            </PremiumGlassCard>
          );
        })}
      </div>
    </div>
  );
}
