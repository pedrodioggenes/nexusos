import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHWUserDisplay } from "@/hooks/useHWUserDisplay";
import { useHWProfile } from "@/hooks/useHWProfile";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useHWTrainings } from "@/hooks/useHWTrainings";
import { useHWBirthdays } from "@/hooks/useHWBirthdays";
import { useHWDMConversations } from "@/hooks/useHWDMs";
import { useHWMembers } from "@/hooks/useHWMembers";
import { useHWPresence } from "@/hooks/useHWPresence";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Circle, GraduationCap, TrendingUp, AlertTriangle, BarChart3, Megaphone, Cake, PanelRightClose, PanelRightOpen, User, ClipboardList, Clock, Palmtree, ClipboardCheck, Heart, ThermometerSun, Pin, ShieldAlert, Target, Trophy, FileSignature, Plus, Minus, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useWidgetActions } from "./WidgetActionsContext";
import { Button } from "@/components/ui/button";
import { DemandNotificationWidget } from "./DemandNotificationWidget";
import type { HWView } from "./HWSidebar";
import { ClockWidget } from "./widgets/ClockWidget";
import { WhosOutWidget } from "./widgets/WhosOutWidget";
import { PerformancePendingWidget } from "./widgets/PerformancePendingWidget";
import { KudosRecentWidget } from "./widgets/KudosRecentWidget";
import { ClimateExpressWidget } from "./widgets/ClimateExpressWidget";
import { PinnedBulletinsWidget } from "./widgets/PinnedBulletinsWidget";
import { IncidentsRecentWidget } from "./widgets/IncidentsRecentWidget";
import { GoalsProgressWidget } from "./widgets/GoalsProgressWidget";
import { AchievementsWidget } from "./widgets/AchievementsWidget";
import { PendingSignaturesWidget } from "./widgets/PendingSignaturesWidget";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface HWWorkspaceWidgetsProps {
  currentView: HWView;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  widgetOrder?: string[];
  onWidgetOrderChange?: (order: string[]) => void;
}

interface WidgetCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}

function WidgetCard({ title, icon, children, delay = 0 }: WidgetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl p-4"
      style={{ backgroundColor: '#18181B', border: '1px solid #27272A' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: '#71717A' }}>{icon}</span>
        <h3 className="text-xs font-semibold tracking-wide uppercase" style={{ color: '#71717A' }}>
          {title}
        </h3>
      </div>
      {children}
    </motion.div>
  );
}

/* ─── Fixed Zone 1: Profile + Online ─── */
function ProfileWidget() {
  const { displayName, initials, user } = useHWUserDisplay();
  const { profileLabel } = useHWProfile();
  const { members } = useHWMembers();
  const { isOnline } = useHWPresence();
  const { onNavigateToChat } = useWidgetActions();

  const otherMembers = useMemo(() => {
    return members.filter(m => m.user_id !== user?.id);
  }, [members, user?.id]);

  const onlineMembers = useMemo(() => otherMembers.filter(m => isOnline(m.user_id)), [otherMembers, isOnline]);
  const offlineMembers = useMemo(() => otherMembers.filter(m => !isOnline(m.user_id)), [otherMembers, isOnline]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl p-4"
      style={{ backgroundColor: '#18181B', border: '1px solid #27272A' }}
    >
      <div className="text-center">
        <Avatar
          className="h-14 w-14 mx-auto ring-2 ring-offset-2"
          style={{ '--tw-ring-color': '#C2410C', '--tw-ring-offset-color': '#18181B' } as React.CSSProperties}
        >
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback className="text-base font-semibold" style={{ backgroundColor: '#27272A', color: '#FAFAFA' }}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <h3 className="text-sm font-semibold mt-3" style={{ color: '#FAFAFA' }}>{displayName}</h3>
        <p className="text-[10px] mt-0.5" style={{ color: '#71717A' }}>{profileLabel}</p>
        <div className="flex items-center justify-center gap-1 mt-1">
          <Circle className="h-2 w-2 fill-current" style={{ color: '#16A34A' }} />
          <span className="text-xs" style={{ color: '#71717A' }}>Online</span>
        </div>
      </div>

      {otherMembers.length > 0 && (
        <>
          <div className="my-3" style={{ borderTop: '1px solid #27272A' }} />

          {/* Online members */}
          {onlineMembers.length > 0 && (
            <>
              <div className="flex items-center gap-1.5 mb-2">
                <Circle className="h-2 w-2 fill-current" style={{ color: '#22C55E' }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#52525B' }}>
                  Online — {onlineMembers.length}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1 mb-3">
                {onlineMembers.slice(0, 8).map(m => (
                  <Tooltip key={m.user_id}>
                    <TooltipTrigger asChild>
                      <button
                        className="relative"
                        onClick={() => onNavigateToChat?.(m.user_id)}
                      >
                        <Avatar className="h-7 w-7 cursor-pointer">
                          <AvatarFallback className="text-[9px] font-semibold" style={{ backgroundColor: '#27272A', color: '#A1A1AA' }}>
                            {m.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border"
                          style={{ backgroundColor: '#22C55E', borderColor: '#18181B' }}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-[10px]">
                      <p>{m.full_name}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {onlineMembers.length > 8 && (
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold"
                    style={{ backgroundColor: '#27272A', color: '#71717A' }}
                  >
                    +{onlineMembers.length - 8}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Offline members */}
          {offlineMembers.length > 0 && (
            <>
              <div className="flex items-center gap-1.5 mb-2">
                <Circle className="h-2 w-2" style={{ color: '#52525B' }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#3F3F46' }}>
                  Offline — {offlineMembers.length}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {offlineMembers.slice(0, 8).map(m => (
                  <Tooltip key={m.user_id}>
                    <TooltipTrigger asChild>
                      <button
                        className="opacity-50"
                        onClick={() => onNavigateToChat?.(m.user_id)}
                      >
                        <Avatar className="h-7 w-7 cursor-pointer">
                          <AvatarFallback className="text-[9px] font-semibold" style={{ backgroundColor: '#27272A', color: '#52525B' }}>
                            {m.initials}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-[10px]">
                      <p>{m.full_name} (offline)</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {offlineMembers.length > 8 && (
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold"
                    style={{ backgroundColor: '#27272A', color: '#3F3F46' }}
                  >
                    +{offlineMembers.length - 8}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </motion.div>
  );
}

/* ─── Fixed Zone 3: Alerts ─── */
function AlertsWidget() {
  const alerts = [
    { title: 'Treinamento vencendo', desc: 'Segurança no Trabalho - 2 colaboradores', severity: 'warning' },
    { title: '3 candidatos novos', desc: 'Aguardando triagem no recrutamento', severity: 'info' },
  ];

  return (
    <WidgetCard title="Alertas" icon={<AlertTriangle className="h-4 w-4" />} delay={0.15}>
      <div className="space-y-2">
        {alerts.map((a, i) => (
          <div key={i} className="p-2 rounded-lg" style={{ backgroundColor: '#27272A' }}>
            <p className="text-xs font-medium" style={{ color: a.severity === 'warning' ? '#EAB308' : '#3B82F6' }}>
              {a.title}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: '#52525B' }}>{a.desc}</p>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

/* ─── Contextual Widget Components ─── */
function TeamActivityWidget() {
  const activities = [
    { name: 'Lucas Ferreira', action: 'completou treinamento', time: '2min', color: '#22C55E' },
    { name: 'Camila Santos', action: 'entrou no turno', time: '15min', color: '#3B82F6' },
    { name: 'Pedro Almeida', action: 'solicitou férias', time: '1h', color: '#EAB308' },
  ];

  return (
    <WidgetCard title="Atividade da Equipe" icon={<TrendingUp className="h-4 w-4" />}>
      <div className="space-y-2.5">
        {activities.map((a, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: a.color }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs" style={{ color: '#D4D4D8' }}>
                <strong>{a.name}</strong> {a.action}
              </p>
              <p className="text-[10px]" style={{ color: '#52525B' }}>{a.time} atrás</p>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

function TrainingWidget() {
  const { data: tenantId } = useHWTenantId();
  const { data: trainings } = useHWTrainings(tenantId || undefined);

  const total = trainings?.length || 0;
  const completed = trainings?.filter(t => t.status === 'completed').length || 0;
  const inProgress = trainings?.filter(t => t.status === 'in_progress').length || 0;
  const pending = trainings?.filter(t => t.status === 'pending').length || 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <WidgetCard title="Treinamentos" icon={<GraduationCap className="h-4 w-4" />}>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span style={{ color: '#A1A1AA' }}>Pendentes</span>
          <span className="font-semibold" style={{ color: '#EAB308' }}>{pending}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span style={{ color: '#A1A1AA' }}>Em andamento</span>
          <span className="font-semibold" style={{ color: '#3B82F6' }}>{inProgress}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span style={{ color: '#A1A1AA' }}>Concluídos</span>
          <span className="font-semibold" style={{ color: '#22C55E' }}>{completed}</span>
        </div>
        <div className="h-1.5 rounded-full mt-2" style={{ backgroundColor: '#27272A' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: '#22C55E' }} />
        </div>
        <p className="text-[10px]" style={{ color: '#52525B' }}>{pct}% da equipe com treinamentos em dia</p>
      </div>
    </WidgetCard>
  );
}

function BirthdayWidget() {
  const { data: tenantId } = useHWTenantId();
  const { data: birthdays } = useHWBirthdays(tenantId || undefined);

  if (!birthdays?.length) return null;

  return (
    <WidgetCard title="Aniversários" icon={<Cake className="h-4 w-4" />}>
      <div className="space-y-2">
        {birthdays.slice(0, 5).map(b => (
          <div key={b.userId} className="flex items-center gap-2">
            <span className="text-lg">{b.isToday ? '🎂' : '🎈'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: '#D4D4D8' }}>{b.name}</p>
              <p className="text-[10px]" style={{ color: b.isToday ? '#EAB308' : '#52525B' }}>
                {b.isToday ? 'Hoje! 🎉' : `em ${b.daysUntil} dia${b.daysUntil > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

function RecruitmentWidget() {
  return (
    <WidgetCard title="Recrutamento" icon={<Users className="h-4 w-4" />}>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span style={{ color: '#A1A1AA' }}>Candidatos novos</span>
          <span className="font-semibold" style={{ color: '#3B82F6' }}>5</span>
        </div>
        <div className="flex justify-between text-xs">
          <span style={{ color: '#A1A1AA' }}>Em análise</span>
          <span className="font-semibold" style={{ color: '#EAB308' }}>3</span>
        </div>
        <div className="flex justify-between text-xs">
          <span style={{ color: '#A1A1AA' }}>Aprovados este mês</span>
          <span className="font-semibold" style={{ color: '#22C55E' }}>2</span>
        </div>
      </div>
    </WidgetCard>
  );
}

function MessagesWidget() {
  return (
    <WidgetCard title="Mensagens Recentes" icon={<Megaphone className="h-4 w-4" />}>
      <div className="space-y-2.5">
        {[
          { name: 'Lucas Ferreira', msg: 'Preciso de ajuda no setor 3', time: '5min' },
          { name: 'Ana Oliveira', msg: 'Escala confirmada para amanhã', time: '30min' },
        ].map((m, i) => (
          <div key={i} className="flex items-start gap-2">
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarFallback className="text-[9px] font-semibold" style={{ backgroundColor: '#27272A', color: '#A1A1AA' }}>
                {m.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-xs font-medium truncate" style={{ color: '#D4D4D8' }}>{m.name}</p>
                <span className="text-[10px] shrink-0" style={{ color: '#52525B' }}>{m.time}</span>
              </div>
              <p className="text-[11px] truncate" style={{ color: '#71717A' }}>{m.msg}</p>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

function TeamStatsWidget() {
  return (
    <WidgetCard title="Equipe" icon={<BarChart3 className="h-4 w-4" />}>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span style={{ color: '#A1A1AA' }}>Online agora</span>
          <span className="font-semibold" style={{ color: '#22C55E' }}>8</span>
        </div>
        <div className="flex justify-between text-xs">
          <span style={{ color: '#A1A1AA' }}>Total membros</span>
          <span className="font-semibold" style={{ color: '#FAFAFA' }}>14</span>
        </div>
        <div className="flex justify-between text-xs">
          <span style={{ color: '#A1A1AA' }}>Em férias</span>
          <span className="font-semibold" style={{ color: '#EAB308' }}>2</span>
        </div>
      </div>
    </WidgetCard>
  );
}

/* ─── Widget registry ─── */
const WIDGET_REGISTRY: Record<string, { component: React.FC; label: string }> = {
  profile: { component: ProfileWidget, label: 'Perfil' },
  demands: { component: DemandNotificationWidget, label: 'Demandas' },
  alerts: { component: AlertsWidget, label: 'Alertas' },
  activity: { component: TeamActivityWidget, label: 'Atividade' },
  trainings: { component: TrainingWidget, label: 'Treinamentos' },
  birthdays: { component: BirthdayWidget, label: 'Aniversários' },
  recruitment: { component: RecruitmentWidget, label: 'Recrutamento' },
  messages_recent: { component: MessagesWidget, label: 'Mensagens' },
  team_stats: { component: TeamStatsWidget, label: 'Equipe' },
  clock: { component: ClockWidget, label: 'Ponto' },
  whos_out: { component: WhosOutWidget, label: 'Quem tá Fora' },
  performance_pending: { component: PerformancePendingWidget, label: 'Avaliações' },
  kudos_recent: { component: KudosRecentWidget, label: 'Kudos' },
  climate_express: { component: ClimateExpressWidget, label: 'Clima' },
  pinned_bulletins: { component: PinnedBulletinsWidget, label: 'Avisos' },
  incidents_recent: { component: IncidentsRecentWidget, label: 'Ocorrências' },
  goals_progress: { component: GoalsProgressWidget, label: 'Metas' },
  achievements: { component: AchievementsWidget, label: 'Conquistas' },
  pending_signatures: { component: PendingSignaturesWidget, label: 'Assinaturas' },
};

const VIEW_DEFAULT_WIDGETS: Record<string, string[]> = {
  home: ['profile', 'demands', 'alerts'],
  mural: ['profile', 'demands', 'alerts'],
  messages: ['profile', 'demands', 'alerts'],
  team: ['profile', 'demands', 'alerts'],
  documents: ['profile', 'demands', 'alerts'],
  profile: ['profile', 'demands', 'alerts'],
  recruitment: ['profile', 'demands', 'alerts'],
  trainings: ['profile', 'demands', 'alerts'],
  goals: ['profile', 'demands', 'alerts'],
  approvals: ['profile', 'demands', 'alerts'],
};

/* ─── Sortable Widget Item ─── */
function SortableWidgetItem({ id, isDraggingAny, wobbleSeed, editMode, onRemove }: {
  id: string; isDraggingAny: boolean; wobbleSeed: number; editMode: boolean; onRemove?: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const entry = WIDGET_REGISTRY[id];
  if (!entry) return null;

  const Component = entry.component;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDraggingAny
      ? 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1)'
      : transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative">
      <motion.div
        animate={(isDraggingAny || editMode) && !isDragging ? {
          rotate: [0, -0.5, 0.5, -0.4, 0.4, 0],
          scale: 0.985,
        } : { rotate: 0, scale: 1 }}
        transition={(isDraggingAny || editMode) && !isDragging ? {
          repeat: Infinity,
          duration: 1.1 + wobbleSeed * 0.4,
          ease: 'easeInOut',
        } : { type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Component />
      </motion.div>
      {/* Remove badge */}
      <AnimatePresence>
        {editMode && !isDragging && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full flex items-center justify-center z-10 shadow-lg"
            style={{ backgroundColor: '#EF4444', color: '#FAFAFA' }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onRemove?.(id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Minus className="h-3 w-3" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Widget Catalog Popover ─── */
function WidgetCatalog({ activeWidgets, onAdd, onClose }: {
  activeWidgets: string[];
  onAdd: (id: string) => void;
  onClose: () => void;
}) {
  const available = Object.entries(WIDGET_REGISTRY).filter(([key]) => !activeWidgets.includes(key));

  if (available.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="rounded-xl p-3 mb-2"
        style={{ backgroundColor: '#27272A', border: '1px solid #3F3F46' }}
      >
        <p className="text-xs text-center" style={{ color: '#71717A' }}>Todos os widgets já estão adicionados</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      className="rounded-xl p-3 mb-2 overflow-hidden"
      style={{ backgroundColor: '#27272A', border: '1px solid #3F3F46' }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#71717A' }}>Adicionar widget</p>
        <button onClick={onClose} className="h-4 w-4 flex items-center justify-center rounded" style={{ color: '#52525B' }}>
          <X className="h-3 w-3" />
        </button>
      </div>
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {available.map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => onAdd(key)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors hover:bg-zinc-700"
          >
            <Plus className="h-3 w-3 shrink-0" style={{ color: '#22C55E' }} />
            <span className="text-xs" style={{ color: '#D4D4D8' }}>{label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Draggable Contextual Zone ─── */
function DraggableContextualWidgets({
  currentView,
  widgetOrder,
  onWidgetOrderChange,
}: {
  currentView: HWView;
  widgetOrder: string[];
  onWidgetOrderChange?: (order: string[]) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const isDraggingAny = activeId !== null;
  const wobbleSeeds = useRef<Record<string, number>>({});
  const dockRef = useRef<HTMLDivElement>(null);

  const defaultWidgets = VIEW_DEFAULT_WIDGETS[currentView]
    || (currentView.startsWith('workbench:') ? ['profile', 'demands', 'alerts'] : []);

  // If widgetOrder has entries for this view, use them as the definitive list.
  // Otherwise fall back to defaults.
  const sortedWidgetIds = useMemo(() => {
    if (widgetOrder.length > 0) {
      // Use stored order — filter out any that no longer exist in registry
      const valid = widgetOrder.filter(k => k in WIDGET_REGISTRY);
      for (const key of valid) {
        if (!(key in wobbleSeeds.current)) wobbleSeeds.current[key] = Math.random();
      }
      return valid;
    }
    // First time: use defaults
    const ordered = [...defaultWidgets];
    for (const key of ordered) {
      if (!(key in wobbleSeeds.current)) wobbleSeeds.current[key] = Math.random();
    }
    return ordered;
  }, [widgetOrder, defaultWidgets]);

  // Click-outside to exit edit mode
  useEffect(() => {
    if (!editMode) return;
    const handler = (e: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setEditMode(false);
        setShowCatalog(false);
      }
    };
    // Use setTimeout to avoid immediate dismissal from the same click
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [editMode]);

  // Listen for external catalog toggle from header + button
  useEffect(() => {
    const handler = () => {
      setShowCatalog(prev => !prev);
      setEditMode(true);
    };
    window.addEventListener('hw-widget-dock-open-catalog', handler);
    return () => window.removeEventListener('hw-widget-dock-open-catalog', handler);
  }, []);

  // Touch-outside to exit edit mode
  useEffect(() => {
    if (!editMode) return;
    const handler = (e: TouchEvent) => {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setEditMode(false);
        setShowCatalog(false);
      }
    };
    const timer = setTimeout(() => document.addEventListener('touchstart', handler), 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('touchstart', handler);
    };
  }, [editMode]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 350, tolerance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 350, tolerance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setEditMode(true); // Enter edit mode on drag
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    // Edit mode persists — don't reset it here
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortedWidgetIds.indexOf(active.id as string);
    const newIndex = sortedWidgetIds.indexOf(over.id as string);
    const newOrder = arrayMove(sortedWidgetIds, oldIndex, newIndex);
    onWidgetOrderChange?.(newOrder);
  };

  const handleRemoveWidget = useCallback((id: string) => {
    const newOrder = sortedWidgetIds.filter(k => k !== id);
    onWidgetOrderChange?.(newOrder);
  }, [sortedWidgetIds, onWidgetOrderChange]);

  const handleAddWidget = useCallback((id: string) => {
    const newOrder = [...sortedWidgetIds, id];
    wobbleSeeds.current[id] = Math.random();
    onWidgetOrderChange?.(newOrder);
  }, [sortedWidgetIds, onWidgetOrderChange]);

  if (sortedWidgetIds.length === 0 && !showCatalog) {
    return (
      <div ref={dockRef}>
        <button
          onClick={() => setShowCatalog(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-colors hover:bg-zinc-800"
          style={{ border: '1px dashed #3F3F46', color: '#71717A' }}
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs">Adicionar widget</span>
        </button>
        <AnimatePresence>
          {showCatalog && (
            <WidgetCatalog
              activeWidgets={sortedWidgetIds}
              onAdd={handleAddWidget}
              onClose={() => setShowCatalog(false)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  const activeEntry = activeId ? WIDGET_REGISTRY[activeId] : null;

  return (
    <div ref={dockRef}>



      <AnimatePresence>
        {showCatalog && (
          <WidgetCatalog
            activeWidgets={sortedWidgetIds}
            onAdd={handleAddWidget}
            onClose={() => setShowCatalog(false)}
          />
        )}
      </AnimatePresence>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortedWidgetIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2.5">
            {sortedWidgetIds.map(id => (
              <SortableWidgetItem
                key={id}
                id={id}
                isDraggingAny={isDraggingAny}
                wobbleSeed={wobbleSeeds.current[id] || 0}
                editMode={editMode}
                onRemove={handleRemoveWidget}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={{
          duration: 300,
          easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)',
        }}>
          {activeEntry ? (
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 250, damping: 18 }}
            >
              <div
                className="rounded-xl p-4"
                style={{
                  backgroundColor: '#27272A',
                  border: '1px solid #3F3F46',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.3)',
                  cursor: 'grabbing',
                }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: '#71717A' }}>⋮⋮</span>
                  <h3 className="text-xs font-semibold tracking-wide uppercase" style={{ color: '#EA580C' }}>
                    {activeEntry.label}
                  </h3>
                </div>
              </div>
            </motion.div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Edit mode indicator */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-3 flex items-center justify-center"
          >
            <button
              onClick={() => { setEditMode(false); setShowCatalog(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors hover:bg-zinc-800"
              style={{ backgroundColor: '#27272A', color: '#A1A1AA', border: '1px solid #3F3F46' }}
            >
              <Check className="h-3 w-3" style={{ color: '#22C55E' }} />
              Concluir edição
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Collapsed Strip ─── */
const COLLAPSED_ICONS = [
  { key: 'profile', icon: User, label: 'Perfil' },
  { key: 'demands', icon: ClipboardList, label: 'Demandas' },
  { key: 'clock', icon: Clock, label: 'Ponto' },
  { key: 'alerts', icon: AlertTriangle, label: 'Alertas' },
  { key: 'activity', icon: TrendingUp, label: 'Atividade' },
  { key: 'training', icon: GraduationCap, label: 'Treinamentos' },
  { key: 'team', icon: BarChart3, label: 'Equipe' },
  { key: 'birthday', icon: Cake, label: 'Aniversários' },
  { key: 'whos_out', icon: Palmtree, label: 'Quem tá Fora' },
  { key: 'kudos', icon: Heart, label: 'Kudos' },
  { key: 'climate', icon: ThermometerSun, label: 'Clima' },
  { key: 'incidents', icon: ShieldAlert, label: 'Ocorrências' },
  { key: 'goals', icon: Target, label: 'Metas' },
  { key: 'achievements', icon: Trophy, label: 'Conquistas' },
  { key: 'signatures', icon: FileSignature, label: 'Assinaturas' },
];

function CollapsedStrip({ onToggle, installedWidgets = [] }: { onToggle?: () => void; installedWidgets?: string[] }) {
  const { initials, user } = useHWUserDisplay();

  return (
    <div className="h-full flex flex-col items-center py-3 gap-1" style={{ backgroundColor: '#18181B' }}>
      {onToggle && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-zinc-800 mb-2 shrink-0"
              onClick={onToggle}
              style={{ color: '#52525B' }}
            >
              <PanelRightOpen className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left"><p>Expandir painel</p></TooltipContent>
        </Tooltip>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className="h-8 w-8 ring-1 cursor-pointer shrink-0" style={{ '--tw-ring-color': '#27272A' } as React.CSSProperties}>
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="text-[10px] font-semibold" style={{ backgroundColor: '#27272A', color: '#A1A1AA' }}>
              {initials}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent side="left"><p>Perfil</p></TooltipContent>
      </Tooltip>

      <div className="w-6 my-2" style={{ borderTop: '1px solid #27272A' }} />

      {COLLAPSED_ICONS.slice(1).filter(({ key }) => installedWidgets.includes(key)).map(({ key, icon: Icon, label }) => (
        <Tooltip key={key}>
          <TooltipTrigger asChild>
            <button
              className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors hover:bg-zinc-800"
              style={{ color: '#71717A' }}
            >
              <Icon className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left"><p>{label}</p></TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

/* ─── Main export ─── */
export function HWWorkspaceWidgets({ currentView, collapsed = false, onToggleCollapse, widgetOrder = [], onWidgetOrderChange }: HWWorkspaceWidgetsProps) {
  const easing = 'cubic-bezier(0.32, 0.72, 0, 1)';

  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-full relative" style={{ backgroundColor: '#18181B' }}>
        {/* Collapsed icons layer — always rendered, fades in/out */}
        <div
          className="absolute inset-0 z-10"
          style={{
            opacity: collapsed ? 1 : 0,
            pointerEvents: collapsed ? 'auto' : 'none',
            transition: `opacity 300ms ${easing}`,
          }}
        >
          <CollapsedStrip onToggle={onToggleCollapse} installedWidgets={widgetOrder} />
        </div>

        {/* Expanded content layer — always rendered at 240px, clipped by parent aside overflow-hidden */}
        <div
          className="h-full overflow-y-auto p-3 space-y-2.5"
          style={{
            width: 240,
            opacity: collapsed ? 0 : 1,
            pointerEvents: collapsed ? 'none' : 'auto',
            transition: `opacity 300ms ${easing}`,
            backgroundColor: '#18181B',
          }}
        >
          {/* Header row: collapse left, add right */}
          <div className="flex items-center justify-between mb-1">
            {onToggleCollapse && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg hover:bg-zinc-800"
                    onClick={onToggleCollapse}
                    style={{ color: '#52525B' }}
                  >
                    <PanelRightClose className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left"><p>Colapsar painel</p></TooltipContent>
              </Tooltip>
            )}
            {!onToggleCollapse && <div />}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg hover:bg-zinc-800"
                  onClick={() => {
                    const event = new CustomEvent('hw-widget-dock-open-catalog');
                    window.dispatchEvent(event);
                  }}
                  style={{ color: '#71717A' }}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left"><p>Adicionar widget</p></TooltipContent>
            </Tooltip>
          </div>

          {/* All widgets — draggable */}
          <DraggableContextualWidgets
            currentView={currentView}
            widgetOrder={widgetOrder}
            onWidgetOrderChange={onWidgetOrderChange}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
