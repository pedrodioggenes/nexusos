import { useMemo, useState, useRef } from "react";
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
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Home, Megaphone, MessageSquare, Users, User, FileText, Briefcase, GraduationCap, Menu } from "lucide-react";
import type { HWView } from "./HWSidebar";

const ALL_TAB_OPTIONS: { view: HWView; label: string; icon: typeof Home }[] = [
  { view: 'home', label: 'Home', icon: Home },
  { view: 'mural', label: 'Mural', icon: Megaphone },
  { view: 'messages', label: 'Msgs', icon: MessageSquare },
  { view: 'team', label: 'Equipe', icon: Users },
  { view: 'profile', label: 'Perfil', icon: User },
  { view: 'documents', label: 'Docs', icon: FileText },
  { view: 'trainings', label: 'Treinos', icon: GraduationCap },
  { view: 'recruitment', label: 'RH', icon: Briefcase },
];

interface SortableTabProps {
  view: HWView;
  label: string;
  icon: typeof Home;
  isActive: boolean;
  isDraggingAny: boolean;
  onNav: (view: HWView) => void;
  unreadMessages?: number;
  wobbleSeed: number;
}

function SortableTab({ view, label, icon: Icon, isActive, isDraggingAny, onNav, unreadMessages, wobbleSeed }: SortableTabProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: view });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDraggingAny
      ? 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1)'
      : transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex-1">
      <motion.div
        animate={isDraggingAny && !isDragging ? {
          rotate: [0, -0.8, 0.8, -0.6, 0.6, 0],
          scale: 0.97,
        } : { rotate: 0, scale: 1 }}
        transition={isDraggingAny && !isDragging ? {
          repeat: Infinity,
          duration: 1.0 + wobbleSeed * 0.4,
          ease: 'easeInOut',
        } : { type: 'spring', stiffness: 300, damping: 20 }}
      >
        <button
          onClick={() => !isDraggingAny && onNav(view)}
          className="flex flex-col items-center justify-center gap-0.5 w-full py-1 relative touch-manipulation select-none"
        >
          <div className="relative">
            <Icon
              className="h-5 w-5"
              style={{ color: isActive && !isDraggingAny ? 'hsl(var(--festval-copper))' : 'hsl(var(--festval-stone))' }}
            />
            {view === 'messages' && !isDraggingAny && unreadMessages && unreadMessages > 0 ? (
              <span
                className="absolute -top-1 -right-2 min-w-[16px] h-[16px] flex items-center justify-center rounded-full text-[9px] font-bold"
                style={{ backgroundColor: 'hsl(var(--festval-copper))', color: '#FFFFFF' }}
              >
                {unreadMessages > 99 ? '99+' : unreadMessages}
              </span>
            ) : null}
          </div>
          <span
            className="text-[10px] font-medium"
            style={{ color: isActive && !isDraggingAny ? 'hsl(var(--festval-copper))' : 'hsl(var(--festval-stone))' }}
          >
            {label}
          </span>
          {isActive && !isDraggingAny && (
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
              style={{ backgroundColor: 'hsl(var(--festval-copper))' }}
            />
          )}
        </button>
      </motion.div>
    </div>
  );
}

interface HWDraggableBottomBarProps {
  currentView: HWView;
  onViewChange: (view: HWView) => void;
  bottomTabs: string[];
  onTabsChange: (tabs: string[]) => void;
  unreadMessages?: number;
  onOpenSidebar?: () => void;
}

export function HWDraggableBottomBar({
  currentView,
  onViewChange,
  bottomTabs,
  onTabsChange,
  unreadMessages = 0,
  onOpenSidebar,
}: HWDraggableBottomBarProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const isDraggingAny = activeId !== null;
  const wobbleSeeds = useRef<Record<string, number>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 400, tolerance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 400, tolerance: 8 } })
  );

  const tabItems = useMemo(() => {
    const items = bottomTabs
      .map(id => ALL_TAB_OPTIONS.find(t => t.view === id))
      .filter(Boolean) as typeof ALL_TAB_OPTIONS;
    for (const item of items) {
      if (!(item.view in wobbleSeeds.current)) {
        wobbleSeeds.current[item.view] = Math.random();
      }
    }
    return items;
  }, [bottomTabs]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = bottomTabs.indexOf(active.id as string);
    const newIndex = bottomTabs.indexOf(over.id as string);
    onTabsChange(arrayMove(bottomTabs, oldIndex, newIndex));
  };

  const activeItem = activeId ? tabItems.find(t => t.view === activeId) : null;

  const displayView = currentView === 'recruitment' || currentView === 'documents' || currentView === 'trainings'
    ? (bottomTabs.includes(currentView) ? currentView : 'home')
    : currentView;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center h-16 px-1 bg-festval-graphite border-t border-festval-border"
    >
      {/* Fixed Menu button */}
      {onOpenSidebar && (
        <div className="flex items-center h-full shrink-0">
          <button
            onClick={onOpenSidebar}
            className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 touch-manipulation select-none"
          >
            <Menu
              className="h-5 w-5"
              style={{ color: 'hsl(var(--festval-stone))' }}
            />
            <span
              className="text-[10px] font-medium"
              style={{ color: 'hsl(var(--festval-stone))' }}
            >
              Menu
            </span>
          </button>
          <div
            className="w-px h-7 mx-0.5"
            style={{ backgroundColor: '#3F3F46' }}
          />
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={bottomTabs} strategy={horizontalListSortingStrategy}>
          <div className="flex items-center flex-1 justify-around">
            {tabItems.map((tab) => (
              <SortableTab
                key={tab.view}
                view={tab.view}
                label={tab.label}
                icon={tab.icon}
                isActive={displayView === tab.view}
                isDraggingAny={isDraggingAny}
                onNav={onViewChange}
                unreadMessages={tab.view === 'messages' ? unreadMessages : undefined}
                wobbleSeed={wobbleSeeds.current[tab.view] || 0}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={{
          duration: 300,
          easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)',
        }}>
          {activeItem ? (
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 1.15 }}
              transition={{ type: 'spring', stiffness: 250, damping: 18 }}
              className="flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-xl"
              style={{
                backgroundColor: 'hsl(var(--festval-border))',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.3)',
                cursor: 'grabbing',
              }}
            >
              <activeItem.icon className="h-5 w-5" style={{ color: 'hsl(var(--festval-copper))' }} />
              <span className="text-[10px] font-medium" style={{ color: 'hsl(var(--festval-copper))' }}>
                {activeItem.label}
              </span>
            </motion.div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </nav>
  );
}
