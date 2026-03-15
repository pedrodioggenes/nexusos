import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Plus, X, GripVertical, Check } from "lucide-react";

interface HWMobileHomeStackProps {
  widgetMap: Record<string, React.ReactNode>;
  widgetOrder: string[];
  onOrderChange?: (newOrder: string[]) => void;
  onRemoveWidget?: (id: string) => void;
  onAddWidget?: () => void;
  addableCount?: number;
}

// iOS spring curve
const APPLE_EASE = [0.25, 0.1, 0.25, 1.0] as const;
const SPRING_CONFIG = { type: 'spring' as const, stiffness: 280, damping: 26, mass: 0.8 };

export function HWMobileHomeStack({
  widgetMap,
  widgetOrder,
  onOrderChange,
  onRemoveWidget,
  onAddWidget,
  addableCount = 0,
}: HWMobileHomeStackProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [order, setOrder] = useState(widgetOrder);
  const [pressingId, setPressingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const dragStartY = useRef(0);

  useEffect(() => {
    if (!isEditing) setOrder(widgetOrder);
  }, [widgetOrder, isEditing]);

  const handleRemove = useCallback((id: string) => {
    setOrder(prev => {
      const next = prev.filter(k => k !== id);
      onOrderChange?.(next);
      return next;
    });
    onRemoveWidget?.(id);
  }, [onRemoveWidget, onOrderChange]);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setPressingId(null);
  }, []);

  const handleTouchStart = useCallback((id: string, e: React.TouchEvent) => {
    if (isEditing) return;
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    setPressingId(id);
    longPressTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(10);
      setIsEditing(true);
      setPressingId(null);
    }, 450);
  }, [isEditing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartPos.current || !longPressTimer.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);
    if (dx > 8 || dy > 8) cancelLongPress();
  }, [cancelLongPress]);

  const handleDragStart = useCallback((id: string, e: React.TouchEvent) => {
    if (!isEditing) return;
    setDraggingId(id);
    dragStartY.current = e.touches[0].clientY;
  }, [isEditing]);

  const handleDragMove = useCallback((e: React.TouchEvent) => {
    if (!draggingId || !isEditing) return;
    const currentY = e.touches[0].clientY;
    const delta = currentY - dragStartY.current;

    if (Math.abs(delta) > 48) {
      const direction = delta > 0 ? 1 : -1;
      setOrder(prev => {
        const idx = prev.indexOf(draggingId);
        const newIdx = idx + direction;
        if (newIdx < 0 || newIdx >= prev.length) return prev;
        const next = [...prev];
        [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
        onOrderChange?.(next);
        return next;
      });
      dragStartY.current = currentY;
      if (navigator.vibrate) navigator.vibrate(5);
    }
  }, [draggingId, isEditing, onOrderChange]);

  const handleDragEnd = useCallback(() => setDraggingId(null), []);

  return (
    <div
      className="flex flex-col gap-3 w-full select-none"
      onTouchMove={isEditing ? handleDragMove : undefined}
      onTouchEnd={isEditing ? handleDragEnd : undefined}
      onTouchCancel={isEditing ? handleDragEnd : undefined}
    >
      {/* Concluir */}
      <div
        className="flex items-center justify-end px-1 overflow-hidden"
        style={{
          maxHeight: isEditing ? 40 : 0,
          opacity: isEditing ? 1 : 0,
          transition: 'max-height 0.35s cubic-bezier(0.25,0.1,0.25,1), opacity 0.3s ease',
        }}
      >
        <button
          onClick={() => setIsEditing(false)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold active:scale-95"
          style={{
            backgroundColor: 'hsl(142 76% 36%)',
            color: '#FFFFFF',
            transition: 'transform 0.15s ease',
          }}
        >
          <Check className="h-3 w-3" />
          Concluir
        </button>
      </div>

      {/* Widgets — single stable DOM tree */}
      <LayoutGroup>
      <AnimatePresence mode="popLayout">
      {order.map((id, i) => {
        const widget = widgetMap[id];
        if (!widget) return null;
        const isPressing = pressingId === id;
        const isDragging = draggingId === id;

        return (
          <motion.div
            key={id}
            layout="position"
            initial={false}
            animate={{
              scale: isDragging ? 1.03 : isPressing ? 0.96 : 1,
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] },
            }}
            transition={{
              layout: { type: 'spring', stiffness: 340, damping: 32, mass: 0.7 },
              scale: { ...SPRING_CONFIG, stiffness: 320 },
              opacity: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] },
            }}
            className="w-full origin-center relative"
            style={{
              zIndex: isDragging ? 50 : 1,
              filter: isDragging ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))' : 'none',
              transition: 'filter 0.2s ease, z-index 0s',
            }}
            onTouchStart={(e) => {
              handleTouchStart(id, e);
              if (isEditing) handleDragStart(id, e);
            }}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => { cancelLongPress(); handleDragEnd(); }}
            onTouchCancel={() => { cancelLongPress(); handleDragEnd(); }}
          >
            {/* Jiggle — pure CSS on a wrapper div, fades in/out via opacity transition */}
            <div
              style={{
                animation: isEditing ? `hw-jiggle ${0.22 + (i % 4) * 0.03}s ease-in-out infinite` : 'none',
                animationDelay: `${(i % 5) * -0.07}s`,
                transformOrigin: 'center center',
                transition: isEditing ? 'none' : 'transform 0.3s cubic-bezier(0.25,0.1,0.25,1)',
                transform: isEditing ? undefined : 'rotate(0deg)',
              }}
            >
              {/* Remove badge */}
              <div
                className="absolute -top-2 -left-1 z-20"
                style={{
                  transform: isEditing ? 'scale(1)' : 'scale(0)',
                  opacity: isEditing ? 1 : 0,
                  transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease',
                  transitionDelay: isEditing ? `${i * 20}ms` : '0ms',
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (navigator.vibrate) navigator.vibrate(5);
                    handleRemove(id);
                  }}
                  className="h-[22px] w-[22px] rounded-full flex items-center justify-center active:scale-75"
                  style={{
                    backgroundColor: 'hsl(var(--destructive))',
                    color: '#FFFFFF',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
                    transition: 'transform 0.1s ease',
                  }}
                >
                  <X className="h-2.5 w-2.5" strokeWidth={3} />
                </button>
              </div>

              {/* Drag grip */}
              <div
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                style={{
                  color: 'hsl(var(--muted-foreground))',
                  opacity: isEditing ? 0.3 : 0,
                  transition: 'opacity 0.25s ease',
                }}
              >
                <GripVertical className="h-5 w-5" />
              </div>

              {/* Widget content */}
              <div
                className="w-full rounded-2xl overflow-hidden"
                style={{
                
                }}
              >
                {widget}
              </div>
            </div>
          </motion.div>
        );
      })}
      </AnimatePresence>
      </LayoutGroup>

      {/* Add widget */}
      <div
        style={{
          maxHeight: isEditing && addableCount > 0 ? 60 : 0,
          opacity: isEditing && addableCount > 0 ? 1 : 0,
          transition: 'max-height 0.3s cubic-bezier(0.25,0.1,0.25,1), opacity 0.25s ease',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={onAddWidget}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed active:scale-[0.98]"
          style={{
            borderColor: 'hsl(var(--border))',
            color: 'hsl(var(--muted-foreground))',
            transition: 'transform 0.15s ease',
          }}
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs font-medium">Adicionar Widget</span>
        </button>
      </div>

      <style>{`
        @keyframes hw-jiggle {
          0%, 100% { transform: rotate(-0.4deg); }
          50% { transform: rotate(0.4deg); }
        }
      `}</style>
    </div>
  );
}
