import { useHWProfile } from "@/hooks/useHWProfile";
import { useHWAvailability, AVAILABILITY_CONFIG, type AvailabilityStatus } from "@/hooks/useHWAvailability";
import { HWNotificationsPanel } from "./HWNotificationsPanel";
import { HWGlobalSearchDropdown } from "./HWGlobalSearchDropdown";
import { Home, MessageSquare, Users, FileText, User, Briefcase, Megaphone, GraduationCap, ChevronDown, Target, CheckSquare, Layers } from "lucide-react";
import { HWAppLauncher } from "./HWModuleLauncher";
import { getWorkbenchPageById, getWorkbenchModuleForPage } from "@/config/workbench-registry";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { HWView } from "./HWSidebar";

interface HWHeaderProps {
  currentView: HWView;
  onNavigateSearch?: (entityType: string, entityId: string) => void;
}

const VIEW_CONFIG: Record<HWView, { label: string; icon: typeof Home }> = {
  home: { label: 'Home', icon: Home },
  mural: { label: 'Mural', icon: Megaphone },
  messages: { label: 'Mensagens', icon: MessageSquare },
  team: { label: 'Equipe', icon: Users },
  documents: { label: 'Documentos', icon: FileText },
  profile: { label: 'Meu Perfil', icon: User },
  recruitment: { label: 'Recrutamento', icon: Briefcase },
  trainings: { label: 'Treinamentos', icon: GraduationCap },
  goals: { label: 'Metas', icon: Target },
  approvals: { label: 'Aprovações', icon: CheckSquare },
};

export function HWHeader({ currentView, onNavigateSearch }: HWHeaderProps) {
  const { profileLabel, profile } = useHWProfile();
  const { status, updateStatus } = useHWAvailability();
  // Handle workbench views dynamically
  let config: { label: string; icon: typeof Home } | undefined = VIEW_CONFIG[currentView as keyof typeof VIEW_CONFIG];
  if (!config && currentView.startsWith('workbench:')) {
    const pageId = currentView.replace('workbench:', '');
    const page = getWorkbenchPageById(pageId);
    const mod = getWorkbenchModuleForPage(pageId);
    config = {
      label: page?.title || 'Aplicativo',
      icon: Layers,
    };
  }
  if (!config) config = VIEW_CONFIG.home;
  const Icon = config.icon;
  const avail = AVAILABILITY_CONFIG[status];

  const toggleStatus = () => {
    const next: AvailabilityStatus = status === 'disponivel' ? 'nao_perturbe' : 'disponivel';
    updateStatus.mutate(next);
  };

  return (
    <header
      className="h-12 flex items-center justify-between px-3 sm:px-4 shrink-0 bg-festval-charcoal border-b border-festval-border"
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <Icon className="h-4 w-4" style={{ color: 'hsl(var(--festval-stone))' }} />
        <div>
          <h1 className="text-sm font-semibold text-festval-ivory">
            {config.label}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div className="lg:hidden">
          <HWAppLauncher triggerClassName="h-9 w-9" />
        </div>
        <HWGlobalSearchDropdown onNavigate={onNavigateSearch} />
        {/* Availability toggle: Disponível / Não Perturbe */}
        <button
          onClick={toggleStatus}
          type="button"
          className="flex items-center justify-center gap-1.5 rounded-full text-[11px] font-medium transition-all duration-200 hover:brightness-110 active:scale-95 touch-manipulation select-none"
          style={{
            backgroundColor: avail.bg,
            color: avail.color,
            height: 32,
            minWidth: 32,
            paddingLeft: 10,
            paddingRight: 10,
          }}
          title={status === 'disponivel' ? 'Clique para ativar Não Perturbe' : 'Clique para ficar Disponível'}
        >
          <span
            className="h-[7px] w-[7px] rounded-full shrink-0"
            style={{
              backgroundColor: avail.color,
              boxShadow: `0 0 6px ${avail.color}`,
            }}
          />
          <span className="hidden sm:inline whitespace-nowrap">{avail.label}</span>
        </button>

        <HWNotificationsPanel />
      </div>
    </header>
  );
}
