import { useMemo, useState, useRef } from "react";
import { NotificationBadge } from "./NotificationBadge";
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
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { HWView } from "./HWSidebar";

interface NavItem {
  view: HWView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  show: boolean;
}

interface SortableNavItemProps {
  item: NavItem;
  isActive: boolean;
  isDraggingAny: boolean;
  onNav: (view: HWView) => void;
  conversationCount?: number;
  collapsed?: boolean;
  wobbleSeed: number;
}

function SortableNavItem({ item, isActive, isDraggingAny, onNav, conversationCount, collapsed, wobbleSeed }: SortableNavItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.view,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDraggingAny
      ? 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1)'
      : transition,
    opacity: isDragging ? 0 : 1,
  };

  const Icon = item.icon;
  const easing = 'cubic-bezier(0.32, 0.72, 0, 1)';

  const handleNativeDragStart = (e: React.DragEvent) => {
    const data = JSON.stringify({
      sourceType: 'nav',
      id: item.view,
      label: item.label,
      icon: item.icon.displayName || item.icon.name || 'Package',
    });
    e.dataTransfer.setData('application/hw-desk-item', data);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const button = (
    <button
      draggable
      onDragStart={handleNativeDragStart}
      onClick={() => !isDraggingAny && onNav(item.view)}
      className="w-full flex items-center rounded-lg text-xs font-medium select-none touch-manipulation relative overflow-hidden"
      style={{
        padding: collapsed ? '8px 15px' : '8px 10px',
        justifyContent: 'flex-start',
        transition: `padding 400ms ${easing}, background-color 150ms ease`,
        backgroundColor: isActive && !isDraggingAny ? 'rgba(124, 45, 18, 0.2)' : 'transparent',
        color: isActive && !isDraggingAny ? '#EA580C' : '#A1A1AA',
      }}
      onMouseEnter={(e) => {
        if (!isActive && !isDraggingAny) e.currentTarget.style.backgroundColor = '#27272A';
      }}
      onMouseLeave={(e) => {
        if (!isActive && !isDraggingAny) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span
        className="whitespace-nowrap overflow-hidden"
        style={{
          opacity: collapsed ? 0 : 1,
          maxWidth: collapsed ? 0 : 200,
          marginLeft: collapsed ? 0 : 10,
          transition: `opacity 300ms ${easing}, max-width 400ms ${easing}, margin-left 400ms ${easing}`,
          pointerEvents: collapsed ? 'none' : 'auto',
        }}
      >
        {item.label}
      </span>
      {item.view === 'messages' && !isDraggingAny && conversationCount && conversationCount > 0 ? (
        <>
          <NotificationBadge
            count={conversationCount}
            variant="inline"
            color="hsl(142 76% 36%)"
            visible={!collapsed}
            easing={easing}
          />
          <NotificationBadge
            count={conversationCount}
            variant="dot"
            color="hsl(142 76% 36%)"
            visible={!!collapsed}
            maxCount={9}
            easing={easing}
          />
        </>
      ) : null}
    </button>
  );

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative">
      <motion.div
        animate={isDraggingAny && !isDragging ? {
          rotate: [0, -0.5, 0.5, -0.4, 0.4, 0],
          scale: 0.985,
        } : { rotate: 0, scale: 1 }}
        transition={isDraggingAny && !isDragging ? {
          repeat: Infinity,
          duration: 1.1 + wobbleSeed * 0.4,
          ease: 'easeInOut',
        } : { type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Tooltip open={collapsed ? undefined : false}>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right"><p>{item.label}</p></TooltipContent>
        </Tooltip>
      </motion.div>
    </div>
  );
}

interface HWDraggableSidebarProps {
  navItems: NavItem[];
  currentView: HWView;
  onNav: (view: HWView) => void;
  sidebarOrder: string[];
  onOrderChange: (order: string[]) => void;
  conversationCount?: number;
  collapsed?: boolean;
}

export function HWDraggableSidebar({
  navItems,
  currentView,
  onNav,
  sidebarOrder,
  onOrderChange,
  conversationCount,
  collapsed = false,
}: HWDraggableSidebarProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const isDraggingAny = activeId !== null;
  const wobbleSeeds = useRef<Record<string, number>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 350, tolerance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 350, tolerance: 8 } })
  );

  const sortedItems = useMemo(() => {
    const visibleItems = navItems.filter(i => i.show);
    const ordered: NavItem[] = [];
    for (const key of sidebarOrder) {
      const item = visibleItems.find(i => i.view === key);
      if (item) ordered.push(item);
    }
    for (const item of visibleItems) {
      if (!ordered.includes(item)) ordered.push(item);
    }
    for (const item of ordered) {
      if (!(item.view in wobbleSeeds.current)) {
        wobbleSeeds.current[item.view] = Math.random();
      }
    }
    return ordered;
  }, [navItems, sidebarOrder]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortedItems.findIndex(i => i.view === active.id);
    const newIndex = sortedItems.findIndex(i => i.view === over.id);
    const newOrder = arrayMove(sortedItems.map(i => i.view), oldIndex, newIndex);
    onOrderChange(newOrder);
  };

  const activeItem = activeId ? sortedItems.find(i => i.view === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sortedItems.map(i => i.view)} strategy={verticalListSortingStrategy}>
        <div className="space-y-0.5">
          {sortedItems.map((item) => (
            <SortableNavItem
              key={item.view}
              item={item}
              isActive={currentView === item.view}
              isDraggingAny={isDraggingAny}
              onNav={onNav}
              conversationCount={item.view === 'messages' ? conversationCount : undefined}
              collapsed={collapsed}
              wobbleSeed={wobbleSeeds.current[item.view] || 0}
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
            animate={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 250, damping: 18 }}
          >
            <div
              className={`flex items-center rounded-lg text-sm font-medium ${collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'}`}
              style={{
                backgroundColor: '#27272A',
                color: '#EA580C',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.3)',
                cursor: 'grabbing',
              }}
            >
              <activeItem.icon className={collapsed ? "h-5 w-5" : "h-4.5 w-4.5"} />
              {!collapsed && <span>{activeItem.label}</span>}
            </div>
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
