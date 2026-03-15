import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, ArrowUpToLine, LayoutGrid, RefreshCw,
  Check, Pencil, Minus,
} from "lucide-react";

/* ── Constants ─────────────────────────────────────────────── */
const UNIFORM_GAP = 4;
const OVERLAP_THRESHOLD = 4;
const MIN_W = 120;
const MIN_H = 80;
const APP_ICON_PREFIX = "app:";

/** Compact icons (not resizable widgets) */
function isCompactElement(id: string): boolean {
  return (
    id.startsWith(APP_ICON_PREFIX) ||
    id.startsWith('desk:') ||
    id.startsWith('desk-nav:') ||
    id.startsWith('pin:')
  );
}

/* ── Deterministic wobble seed from element ID ─────────────── */
function wobbleSeedFromId(id: string): { rotation: number; duration: number; delay: number } {
  let h = 5381;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) + h) ^ id.charCodeAt(i);
    h |= 0;
  }
  const n = Math.abs(h);
  return {
    rotation: 0.7 + (n % 80) / 80 * 0.9,     // 0.7°–1.6°
    duration:  0.65 + (n % 60) / 60 * 0.5,    // 0.65s–1.15s
    delay:     ((n >> 4) % 40) / 40 * 0.35,   // 0s–0.35s phase offset
  };
}

/* ── Icon grid snap (96px icon + 16px gap = 112px cell) ────── */
const ICON_GRID = 112;
function snapToIconGrid(x: number, y: number): { x: number; y: number } {
  return {
    x: Math.max(0, Math.round(x / ICON_GRID) * ICON_GRID),
    y: Math.max(0, Math.round(y / ICON_GRID) * ICON_GRID),
  };
}

/* ── Default sizes per widget type ─────────────────────────── */
const DEFAULT_SIZES: Record<string, { w: number; h: number }> = {
  kpis:      { w: 720, h: 200 },
  shortcuts: { w: 240, h: 240 },
  messages:  { w: 240, h: 200 },
  shift:     { w: 240, h: 160 },
  trainings: { w: 240, h: 200 },
  birthdays: { w: 240, h: 200 },
};
const APP_ICON_SIZE = { w: 96, h: 96 };

function getDefaultSize(id: string) {
  if (isCompactElement(id)) return { ...APP_ICON_SIZE };
  if (id.startsWith('desk-widget:') || id.startsWith('desk-nav-widget:') || id.startsWith('pin-widget:'))
    return { w: 240, h: 200 };
  return DEFAULT_SIZES[id] ? { ...DEFAULT_SIZES[id] } : { w: 240, h: 200 };
}

/* ── Persistence (localStorage for same-tab perf) ──────────── */
export interface ElementRect { x: number; y: number; w: number; h: number; }

const STORAGE_KEY = "hw-desk-positions";

function loadPositions(): Record<string, ElementRect> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* noop */ }
  return {};
}

function savePositions(positions: Record<string, ElementRect>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
}

/* ── Smart placement ────────────────────────────────────────── */
const SNAP_GRID = 8;
const EDGE_SNAP = 16;
const MAX_SHIFT = 20;

function rectsOverlap(a: ElementRect, b: ElementRect, gap = 0): boolean {
  return (
    a.x < b.x + b.w + gap &&
    a.x + a.w > b.x - gap &&
    a.y < b.y + b.h + gap &&
    a.y + a.h > b.y - gap
  );
}

function overlapsAny(rect: ElementRect, others: ElementRect[]): boolean {
  for (const o of others) {
    if (rectsOverlap(rect, o, -OVERLAP_THRESHOLD)) return true;
  }
  return false;
}

function smartPlace(rect: ElementRect, others: ElementRect[]): ElementRect {
  let { w, h } = rect;
  let x = Math.round(rect.x / SNAP_GRID) * SNAP_GRID;
  let y = Math.round(rect.y / SNAP_GRID) * SNAP_GRID;
  const gx = x, gy = y;

  let bestX = x, bestXDist = Infinity;
  let bestY = y, bestYDist = Infinity;

  for (const o of others) {
    const oR = o.x + o.w;
    const oB = o.y + o.h;
    for (const ex of [o.x, oR - w, oR + UNIFORM_GAP, o.x - w - UNIFORM_GAP]) {
      const d = Math.abs(ex - gx);
      if (d < EDGE_SNAP && d < bestXDist && Math.abs(ex - gx) <= MAX_SHIFT) { bestX = ex; bestXDist = d; }
    }
    for (const ey of [o.y, oB - h, oB + UNIFORM_GAP, o.y - h - UNIFORM_GAP]) {
      const d = Math.abs(ey - gy);
      if (d < EDGE_SNAP && d < bestYDist && Math.abs(ey - gy) <= MAX_SHIFT) { bestY = ey; bestYDist = d; }
    }
  }

  if (bestXDist < Infinity && !overlapsAny({ x: bestX, y, w, h }, others)) x = bestX;
  if (bestYDist < Infinity && !overlapsAny({ x, y: bestY, w, h }, others)) y = bestY;
  if (overlapsAny({ x, y, w, h }, others)) { x = gx; y = gy; }

  if (overlapsAny({ x, y, w, h }, others)) {
    const colliders = others.filter(o => rectsOverlap({ x, y, w, h }, o, -OVERLAP_THRESHOLD));
    if (colliders.length === 0) return { x: Math.max(0, x), y: Math.max(0, y), w, h };

    const groupLeft   = Math.min(...colliders.map(c => c.x));
    const groupTop    = Math.min(...colliders.map(c => c.y));
    const groupRight  = Math.max(...colliders.map(c => c.x + c.w));
    const groupBottom = Math.max(...colliders.map(c => c.y + c.h));

    type Slot = { sx: number; sy: number; alignScore: number };
    const slots: Slot[] = [];

    for (const c of colliders) {
      const cR = c.x + c.w;
      const cB = c.y + c.h;
      const candidates = [
        { sx: cR + UNIFORM_GAP, sy: c.y }, { sx: cR + UNIFORM_GAP, sy: cB - h },
        { sx: c.x - w - UNIFORM_GAP, sy: c.y }, { sx: c.x - w - UNIFORM_GAP, sy: cB - h },
        { sx: c.x, sy: cB + UNIFORM_GAP }, { sx: cR - w, sy: cB + UNIFORM_GAP },
        { sx: c.x, sy: c.y - h - UNIFORM_GAP }, { sx: cR - w, sy: c.y - h - UNIFORM_GAP },
        { sx: groupRight + UNIFORM_GAP, sy: c.y }, { sx: groupLeft - w - UNIFORM_GAP, sy: c.y },
        { sx: c.x, sy: groupBottom + UNIFORM_GAP }, { sx: c.x, sy: groupTop - h - UNIFORM_GAP },
      ];
      for (const pos of candidates) {
        let alignScore = 0;
        for (const n of others) {
          const nR = n.x + n.w, nB = n.y + n.h, pR = pos.sx + w, pB = pos.sy + h;
          if (Math.abs(pos.sy - n.y) <= 2) alignScore += 2;
          if (Math.abs(pB - nB) <= 2) alignScore += 2;
          if (Math.abs(pos.sy - nB - UNIFORM_GAP) <= 2) alignScore += 3;
          if (Math.abs(pB + UNIFORM_GAP - n.y) <= 2) alignScore += 3;
          if (Math.abs(pos.sx - n.x) <= 2) alignScore += 2;
          if (Math.abs(pR - nR) <= 2) alignScore += 2;
          if (Math.abs(pos.sx - nR - UNIFORM_GAP) <= 2) alignScore += 3;
          if (Math.abs(pR + UNIFORM_GAP - n.x) <= 2) alignScore += 3;
        }
        slots.push({ ...pos, alignScore });
      }
    }

    const validSlots = slots.filter(s => s.sx >= 0 && s.sy >= 0 && !overlapsAny({ x: s.sx, y: s.sy, w, h }, others));
    if (validSlots.length > 0) {
      validSlots.sort((a, b) => {
        const diff = b.alignScore - a.alignScore;
        const dA = Math.abs(a.sx - gx) + Math.abs(a.sy - gy);
        const dB = Math.abs(b.sx - gx) + Math.abs(b.sy - gy);
        return Math.abs(diff) >= 2 ? diff : dA - dB;
      });
      x = validSlots[0].sx;
      y = validSlots[0].sy;
    } else {
      const fallbacks = [
        { nx: groupRight + UNIFORM_GAP, ny: groupTop },
        { nx: groupLeft - w - UNIFORM_GAP, ny: groupTop },
        { nx: groupLeft, ny: groupBottom + UNIFORM_GAP },
        { nx: groupLeft, ny: groupTop - h - UNIFORM_GAP },
      ].sort((a, b) => (Math.abs(a.nx - gx) + Math.abs(a.ny - gy)) - (Math.abs(b.nx - gx) + Math.abs(b.ny - gy)));
      for (const f of fallbacks) {
        const c = { x: Math.max(0, f.nx), y: Math.max(0, f.ny), w, h };
        if (!overlapsAny(c, others)) { x = c.x; y = c.y; break; }
      }
    }
  }

  x = Math.round(x / SNAP_GRID) * SNAP_GRID;
  y = Math.round(y / SNAP_GRID) * SNAP_GRID;
  return { x: Math.max(0, x), y: Math.max(0, y), w, h };
}

function findFreeSpot(newRect: { w: number; h: number }, existing: ElementRect[], containerWidth: number): { x: number; y: number } {
  const step = 8;
  const maxY = existing.reduce((max, r) => Math.max(max, r.y + r.h), 0) + 200;
  for (let cy = 0; cy < maxY; cy += step) {
    for (let cx = 0; cx < containerWidth - newRect.w; cx += step) {
      if (!overlapsAny({ x: cx, y: cy, w: newRect.w, h: newRect.h }, existing)) return { x: cx, y: cy };
    }
  }
  return { x: 0, y: maxY + UNIFORM_GAP };
}

/* ── Auto-organize ──────────────────────────────────────────── */
function autoOrganize(ids: string[], containerWidth: number, positions: Record<string, ElementRect>): Record<string, ElementRect> {
  const GAP = 12;
  const result: Record<string, ElementRect> = {};
  const wideWidgets: string[] = [], stdWidgets: string[] = [], compactItems: string[] = [];

  for (const id of ids) {
    if (isCompactElement(id)) compactItems.push(id);
    else {
      const defSize = getDefaultSize(id);
      const w = positions[id]?.w || defSize.w;
      (w > 400 || defSize.w > 400 ? wideWidgets : stdWidgets).push(id);
    }
  }

  let cursorY = 0;

  for (const id of wideWidgets) {
    const h = positions[id]?.h || getDefaultSize(id).h;
    result[id] = { x: 0, y: cursorY, w: containerWidth, h };
    cursorY += h + GAP;
  }

  if (stdWidgets.length > 0) {
    const cols = Math.max(1, Math.min(stdWidgets.length, Math.floor(containerWidth / 252)));
    const colWidth = (containerWidth - (cols - 1) * GAP) / cols;
    for (let i = 0; i < stdWidgets.length; i += cols) {
      const row = stdWidgets.slice(i, i + cols);
      const rowH = Math.max(...row.map(id => positions[id]?.h || getDefaultSize(id).h));
      row.forEach((id, c) => {
        result[id] = { x: Math.round(c * (colWidth + GAP)), y: cursorY, w: Math.round(colWidth), h: positions[id]?.h || getDefaultSize(id).h };
      });
      cursorY += rowH + GAP;
    }
  }

  if (compactItems.length > 0) {
    cursorY += 20;
    const iconsPerRow = Math.max(1, Math.floor((containerWidth + 16) / (APP_ICON_SIZE.w + 16)));
    compactItems.forEach((id, i) => {
      const col = i % iconsPerRow;
      const row = Math.floor(i / iconsPerRow);
      result[id] = { x: col * ICON_GRID, y: cursorY + row * ICON_GRID, w: APP_ICON_SIZE.w, h: APP_ICON_SIZE.h };
    });
  }

  return result;
}

/* ── Resize handles ─────────────────────────────────────────── */
type ResizeDir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
const RESIZE_CURSORS: Record<ResizeDir, string> = {
  n: "n-resize", s: "s-resize", e: "e-resize", w: "w-resize",
  ne: "ne-resize", nw: "nw-resize", se: "se-resize", sw: "sw-resize",
};
const RESIZE_HANDLES = [
  { dir: "n" as ResizeDir,  style: { top: -3, left: 8, right: 8, height: 6, cursor: "n-resize" } },
  { dir: "s" as ResizeDir,  style: { bottom: -3, left: 8, right: 8, height: 6, cursor: "s-resize" } },
  { dir: "e" as ResizeDir,  style: { right: -3, top: 8, bottom: 8, width: 6, cursor: "e-resize" } },
  { dir: "w" as ResizeDir,  style: { left: -3, top: 8, bottom: 8, width: 6, cursor: "w-resize" } },
  { dir: "nw" as ResizeDir, style: { top: -4, left: -4, width: 10, height: 10, cursor: "nw-resize", borderRadius: "50%" } },
  { dir: "ne" as ResizeDir, style: { top: -4, right: -4, width: 10, height: 10, cursor: "ne-resize", borderRadius: "50%" } },
  { dir: "sw" as ResizeDir, style: { bottom: -4, left: -4, width: 10, height: 10, cursor: "sw-resize", borderRadius: "50%" } },
  { dir: "se" as ResizeDir, style: { bottom: -4, right: -4, width: 10, height: 10, cursor: "se-resize", borderRadius: "50%" } },
];

/* ── Context menu ─────────────────────────────────────────────*/
interface ContextMenuState { x: number; y: number; widgetId: string | null; }

function FloatingContextMenu({
  state, onClose, isEditing,
  onRemoveWidget, onMoveToTop, onAddWidget, onAutoOrganize, onRefresh, onToggleEdit,
}: {
  state: ContextMenuState | null;
  onClose: () => void;
  isEditing?: boolean;
  onRemoveWidget?: (id: string) => void;
  onMoveToTop?: (id: string) => void;
  onAddWidget?: () => void;
  onAutoOrganize?: () => void;
  onRefresh?: () => void;
  onToggleEdit?: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  if (!state) return null;

  type MenuItem = { label: string; icon: React.ReactNode; onClick: () => void; destructive?: boolean } | null;
  const items: MenuItem[] = [];

  if (state.widgetId) {
    items.push({
      label: "Mover para o início",
      icon: <ArrowUpToLine className="h-3.5 w-3.5" style={{ color: "#71717A" }} />,
      onClick: () => { onMoveToTop?.(state.widgetId!); onClose(); },
    });
    items.push({
      label: "Remover da mesa",
      icon: <Trash2 className="h-3.5 w-3.5" />,
      onClick: () => { onRemoveWidget?.(state.widgetId!); onClose(); },
      destructive: true,
    });
    items.push(null);
  }

  items.push({
    label: "Adicionar widget",
    icon: <Plus className="h-3.5 w-3.5" style={{ color: "#EA580C" }} />,
    onClick: () => { onAddWidget?.(); onClose(); },
  });
  items.push(null);
  items.push({
    label: "Organizar automaticamente",
    icon: <LayoutGrid className="h-3.5 w-3.5" style={{ color: "#71717A" }} />,
    onClick: () => { onAutoOrganize?.(); onClose(); },
  });
  items.push({
    label: "Atualizar mesa",
    icon: <RefreshCw className="h-3.5 w-3.5" style={{ color: "#71717A" }} />,
    onClick: () => { onRefresh?.(); onClose(); },
  });
  items.push(null);
  items.push({
    label: isEditing ? "Feito (sair da edição)" : "Personalizar mesa",
    icon: isEditing
      ? <Check className="h-3.5 w-3.5" style={{ color: "#22C55E" }} />
      : <Pencil className="h-3.5 w-3.5" style={{ color: "#71717A" }} />,
    onClick: () => { onToggleEdit?.(); onClose(); },
  });

  return (
    <div
      className="fixed inset-0 z-[9999]"
      onClick={(e) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose(); }}
      onContextMenu={(e) => { e.preventDefault(); onClose(); }}
    >
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.92, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -4 }}
        transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
        className="absolute w-52 rounded-xl p-1.5"
        style={{
          left: state.x, top: state.y,
          backgroundColor: "rgba(28, 28, 31, 0.95)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.06) inset",
          backdropFilter: "blur(24px)",
        }}
      >
        {items.map((item, i) =>
          !item
            ? <div key={`sep-${i}`} className="my-1 mx-2 h-px" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
            : (
              <button
                key={item.label}
                onClick={item.onClick}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all duration-150 hover:bg-white/[0.06] active:bg-white/[0.1] active:scale-[0.98]"
                style={{ color: item.destructive ? "#EF4444" : "#E4E4E7" }}
              >
                {item.icon}{item.label}
              </button>
            )
        )}
      </motion.div>
    </div>
  );
}

/* ── Canvas element ─────────────────────────────────────────── */
interface CanvasElementProps {
  id: string;
  rect: ElementRect;
  children: React.ReactNode;
  isEditing?: boolean;
  isDragging: boolean;
  isResizing: boolean;
  isAnyActive: boolean;
  isAppIcon: boolean;
  isContainerResizing: boolean;
  staggerDelay?: number;
  onDragStart: (id: string, e: React.PointerEvent) => void;
  onResizeStart: (id: string, dir: ResizeDir, e: React.PointerEvent) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onRemove?: () => void;
}

function CanvasElement({
  id, rect, children, isEditing, isDragging, isResizing, isAnyActive, isAppIcon,
  isContainerResizing, staggerDelay, onDragStart, onResizeStart, onContextMenu, onRemove,
}: CanvasElementProps) {
  const [hovered, setHovered] = useState(false);
  const showHandles = hovered && !isEditing && !isDragging && !isAppIcon;
  const wasDraggedRef = useRef(false);
  const wobble = useMemo(() => wobbleSeedFromId(id), [id]);

  useEffect(() => { if (isDragging) wasDraggedRef.current = true; }, [isDragging]);
  useEffect(() => {
    if (!isDragging && wasDraggedRef.current) {
      const t = setTimeout(() => { wasDraggedRef.current = false; }, 100);
      return () => clearTimeout(t);
    }
  }, [isDragging]);

  /* Wobble animation for non-icon widgets in editing mode */
  const innerAnimate = useMemo(() => {
    if (isEditing && !isDragging && !isResizing && !isAppIcon) {
      return {
        rotate: [0, -wobble.rotation, wobble.rotation, -wobble.rotation * 0.6, wobble.rotation * 0.6, 0],
        scale: 0.975,
      };
    }
    if (isAnyActive && !isDragging && !isResizing) {
      return { rotate: [0, -0.4, 0.4, -0.3, 0.3, 0], scale: 0.985 };
    }
    return { rotate: 0, scale: 1 };
  }, [isEditing, isAnyActive, isDragging, isResizing, isAppIcon, wobble]);

  const innerTransition = useMemo(() => {
    if (isEditing && !isDragging && !isResizing && !isAppIcon) {
      return {
        rotate: { repeat: Infinity, duration: wobble.duration, ease: "easeInOut", delay: wobble.delay },
        scale: { duration: 0.2 },
      };
    }
    if (isAnyActive && !isDragging && !isResizing) {
      return { repeat: Infinity, duration: 1.1 + wobble.delay, ease: "easeInOut" };
    }
    return { type: "spring" as const, stiffness: 300, damping: 20 };
  }, [isEditing, isAnyActive, isDragging, isResizing, isAppIcon, wobble]);

  return (
    <motion.div
      layout
      initial={false}
      animate={{
        x: rect.x,
        y: rect.y,
        width: rect.w,
        height: rect.h,
        scale: isDragging ? 1.04 : 1,
        zIndex: isDragging ? 100 : isResizing ? 50 : 1,
        filter: isDragging ? "drop-shadow(0 12px 32px rgba(0,0,0,0.5))" : "none",
      }}
      transition={
        isDragging || isResizing || isContainerResizing
          ? { type: "tween", duration: 0 }
          : staggerDelay !== undefined
            ? { type: "spring", stiffness: 260, damping: 26, delay: staggerDelay }
            : { type: "spring", stiffness: 300, damping: 28, mass: 0.8 }
      }
      className="select-none touch-manipulation"
      onClickCapture={(e) => {
        if (wasDraggedRef.current) { e.stopPropagation(); e.preventDefault(); }
      }}
      onPointerDown={(e) => {
        if (e.button === 2) return;
        onDragStart(id, e);
      }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu(e, id); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "absolute", top: 0, left: 0, cursor: isDragging ? "grabbing" : "grab", willChange: "transform" }}
    >
      {/* Wobble wrapper */}
      <motion.div
        animate={innerAnimate}
        transition={innerTransition as any}
        className="h-full w-full relative"
      >
        {children}

        {/* X badge for non-icon widgets in editing mode */}
        {isEditing && !isAppIcon && (
          <AnimatePresence>
            <motion.button
              key="remove-badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 16 }}
              onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
              className="absolute -top-2 -left-2 z-20 h-5 w-5 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: "#EF4444",
                boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
              }}
            >
              <Minus className="h-2.5 w-2.5 text-white" strokeWidth={3} />
            </motion.button>
          </AnimatePresence>
        )}
      </motion.div>

      {/* Resize handles — only when not editing and hovering */}
      <AnimatePresence>
        {showHandles && RESIZE_HANDLES.map(({ dir, style }) => (
          <motion.div
            key={dir}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30"
            style={{ ...style, cursor: RESIZE_CURSORS[dir] }}
            onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); onResizeStart(id, dir, e); }}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Snap guide lines (reserved for future visual guides) ───── */
function SnapGuideLines(_props: { containerRect: DOMRect | null }) { return null; }

/* ── Drop choice popover ────────────────────────────────────── */
interface DeskDropData {
  sourceType: 'nav' | 'pinned-page';
  id: string;
  label: string;
  icon: string;
  accentColor?: string;
  appLabel?: string;
}

interface DropChoiceState { x: number; y: number; canvasX: number; canvasY: number; data: DeskDropData; }

function DropChoicePopover({
  state, onClose, onChoice,
}: {
  state: DropChoiceState | null;
  onClose: () => void;
  onChoice: (data: DeskDropData, canvasX: number, canvasY: number, asWidget: boolean) => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  if (!state) return null;

  return (
    <div
      className="fixed inset-0 z-[9999]"
      onClick={(e) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose(); }}
    >
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.92, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -4 }}
        transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
        className="absolute w-56 rounded-xl p-1.5"
        style={{
          left: state.x, top: state.y,
          backgroundColor: "rgba(28, 28, 31, 0.95)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.1) inset",
          backdropFilter: "blur(20px)",
        }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1.5" style={{ color: '#52525B' }}>
          Adicionar "{state.data.label}"
        </p>
        {[
          { label: "Como ícone (atalho)", emoji: "📌", asWidget: false },
          { label: "Como widget (gaveta)", emoji: "📊", asWidget: true },
        ].map(({ label, emoji, asWidget }) => (
          <button
            key={label}
            onClick={() => { onChoice(state.data, state.canvasX, state.canvasY, asWidget); onClose(); }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all duration-150 hover:bg-white/[0.06]"
            style={{ color: '#E4E4E7' }}
          >
            <span className="h-5 w-5 rounded-md flex items-center justify-center text-[10px]" style={{ backgroundColor: '#27272A' }}>{emoji}</span>
            {label}
          </button>
        ))}
      </motion.div>
    </div>
  );
}

/* ── Landing zone ghost ─────────────────────────────────────── */
interface LandingZoneProps { rect: ElementRect; isIcon: boolean; }

function LandingZoneGhost({ rect, isIcon }: LandingZoneProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="absolute pointer-events-none"
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        border: `1.5px dashed rgba(255,255,255,${isIcon ? '0.18' : '0.12'})`,
        backgroundColor: `rgba(255,255,255,${isIcon ? '0.04' : '0.02'})`,
        borderRadius: isIcon ? 14 : 12,
        zIndex: 0,
      }}
    />
  );
}

/* ── Main component ─────────────────────────────────────────── */
interface HWDraggableHomeProps {
  widgetMap: Record<string, React.ReactNode>;
  availableWidgets: string[];
  isEditing?: boolean;
  initialPositions?: Record<string, ElementRect>;
  onPositionsChange?: (positions: Record<string, ElementRect>) => void;
  onRemoveWidget?: (widgetId: string) => void;
  onMoveToTop?: (widgetId: string) => void;
  onAddWidget?: () => void;
  onAutoOrganize?: () => void;
  onRefresh?: () => void;
  onToggleEdit?: () => void;
  onSidebarDrop?: (data: DeskDropData, canvasX: number, canvasY: number, asWidget: boolean) => void;
}

export function HWDraggableHome({
  widgetMap, availableWidgets,
  isEditing, initialPositions, onPositionsChange,
  onRemoveWidget, onMoveToTop, onAddWidget, onAutoOrganize, onRefresh, onToggleEdit,
  onSidebarDrop,
}: HWDraggableHomeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Init from DB positions, then fall back to localStorage
  const [positions, setPositions] = useState<Record<string, ElementRect>>(() => {
    if (initialPositions && Object.keys(initialPositions).length > 0) return initialPositions;
    return loadPositions();
  });

  // Once DB positions arrive (async), seed state if not yet initialized from DB
  const initializedFromDB = useRef(false);
  useEffect(() => {
    if (!initializedFromDB.current && initialPositions && Object.keys(initialPositions).length > 0) {
      initializedFromDB.current = true;
      setPositions(initialPositions);
    }
  }, [initialPositions]);

  const [ctxMenu, setCtxMenu] = useState<ContextMenuState | null>(null);
  const [dropChoice, setDropChoice] = useState<DropChoiceState | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<"drag" | "resize" | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const [isContainerResizing, setIsContainerResizing] = useState(false);
  const [landingZone, setLandingZone] = useState<{ id: string; rect: ElementRect } | null>(null);
  const [staggerMap, setStaggerMap] = useState<Record<string, number> | null>(null);

  const containerResizeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastGhostUpdate = useRef(0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const widgetIdsHash = availableWidgets.join(',');

  // Mirror positions in a ref for access inside event handlers
  const positionsRef = useRef(positions);
  useEffect(() => { positionsRef.current = positions; }, [positions]);

  const ensuredPositions = useMemo(() => {
    const result: Record<string, ElementRect> = {};
    const cw = containerRect?.width || 0;
    for (const id of availableWidgets) {
      const pos = positions[id] || { ...getDefaultSize(id), x: 0, y: 0 };
      if (cw > 0) {
        const w = Math.min(pos.w, cw);
        const x = Math.min(pos.x, Math.max(0, cw - w));
        result[id] = { ...pos, w, x };
      } else {
        result[id] = pos;
      }
    }
    return result;
  }, [positions, widgetIdsHash, containerRect?.width]);

  const ensuredRef = useRef(ensuredPositions);
  useEffect(() => { ensuredRef.current = ensuredPositions; }, [ensuredPositions]);

  // Clean stale localStorage positions
  useEffect(() => {
    const saved = loadPositions();
    const currentSet = new Set(availableWidgets);
    let changed = false;
    for (const key of Object.keys(saved)) {
      if (!currentSet.has(key)) { delete saved[key]; changed = true; }
    }
    if (changed) savePositions(saved);
  }, [widgetIdsHash]);

  // Place new items after mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container || availableWidgets.length === 0) return;
    const cw = container.offsetWidth;
    if (cw === 0) return;

    const newIds = availableWidgets.filter(id => !positions[id]);
    if (newIds.length === 0) return;

    setPositions(prev => {
      const result = { ...prev };
      const hasAny = availableWidgets.some(id => prev[id]);

      if (!hasAny) {
        const initial: Record<string, ElementRect> = {};
        for (const id of availableWidgets) initial[id] = { ...getDefaultSize(id), x: 0, y: 0 };
        const organized = autoOrganize(availableWidgets, cw, initial);
        savePositions(organized);
        onPositionsChange?.(organized);
        return organized;
      }

      for (const id of newIds) {
        const size = getDefaultSize(id);
        const existingRects = availableWidgets.filter(oid => oid !== id && result[oid]).map(oid => result[oid]);
        const spot = findFreeSpot(size, existingRects, cw);
        result[id] = isCompactElement(id)
          ? { ...size, ...snapToIconGrid(spot.x, spot.y) }
          : { ...size, x: spot.x, y: spot.y };
      }
      savePositions(result);
      onPositionsChange?.(result);
      return result;
    });
  }, [widgetIdsHash, containerRect?.width]);

  // Container resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setContainerRect(container.getBoundingClientRect());
    const ro = new ResizeObserver(() => {
      setContainerRect(container.getBoundingClientRect());
      setIsContainerResizing(true);
      if (containerResizeTimer.current) clearTimeout(containerResizeTimer.current);
      containerResizeTimer.current = setTimeout(() => setIsContainerResizing(false), 500);
    });
    ro.observe(container);
    return () => { ro.disconnect(); if (containerResizeTimer.current) clearTimeout(containerResizeTimer.current); };
  }, []);

  // Escape key exits editing mode
  useEffect(() => {
    if (!isEditing) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onToggleEdit?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isEditing, onToggleEdit]);

  const canvasHeight = useMemo(() => {
    let maxBottom = 400;
    for (const id of availableWidgets) {
      const r = ensuredPositions[id];
      if (r) maxBottom = Math.max(maxBottom, r.y + r.h + 40);
    }
    return maxBottom;
  }, [ensuredPositions, availableWidgets]);

  /* ── Drag ───────────────────────────────────────────────── */
  const dragState = useRef<{
    id: string; startX: number; startY: number; origX: number; origY: number; activated: boolean;
  } | null>(null);

  const handleDragStart = useCallback((id: string, e: React.PointerEvent) => {
    const r = ensuredPositions[id];
    if (!r) return;
    dragState.current = { id, startX: e.clientX, startY: e.clientY, origX: r.x, origY: r.y, activated: false };

    const handleMove = (ev: PointerEvent) => {
      if (!dragState.current) return;
      const dx = ev.clientX - dragState.current.startX;
      const dy = ev.clientY - dragState.current.startY;

      if (!dragState.current.activated) {
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
        dragState.current.activated = true;
        setActiveId(id);
        setActiveAction("drag");
        if (navigator.vibrate) navigator.vibrate(10);
      }

      const newX = dragState.current.origX + dx;
      const newY = Math.max(0, dragState.current.origY + dy);

      setPositions(prev => ({ ...prev, [id]: { ...prev[id]!, x: newX, y: newY } }));

      // Landing zone update at ~15fps
      const now = Date.now();
      if (now - lastGhostUpdate.current > 66) {
        lastGhostUpdate.current = now;
        const cur = ensuredRef.current[id];
        if (cur) {
          const liveRect: ElementRect = { x: newX, y: newY, w: cur.w, h: cur.h };
          const others = availableWidgets
            .filter(oid => oid !== id)
            .map(oid => ensuredRef.current[oid])
            .filter((r): r is ElementRect => Boolean(r));
          let landing = smartPlace(liveRect, others);
          if (isCompactElement(id)) {
            const snapped = snapToIconGrid(landing.x, landing.y);
            landing = { ...landing, ...snapped };
          }
          setLandingZone({ id, rect: landing });
        }
      }
    };

    const handleUp = () => {
      const dragId = dragState.current?.id;
      const wasActivated = dragState.current?.activated;
      dragState.current = null;
      setLandingZone(null);

      if (wasActivated && dragId) {
        setPositions(prev => {
          const r = prev[dragId];
          if (!r) return prev;
          const others = availableWidgets.filter(oid => oid !== dragId).map(oid => prev[oid]).filter(Boolean);
          let placed = smartPlace(r, others);
          if (isCompactElement(dragId)) {
            const snapped = snapToIconGrid(placed.x, placed.y);
            placed = { ...placed, ...snapped };
          }
          const updated = { ...prev, [dragId]: placed };
          savePositions(updated);
          onPositionsChange?.(updated);
          return updated;
        });
      }
      setActiveId(null);
      setActiveAction(null);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }, [ensuredPositions, availableWidgets, onPositionsChange]);

  /* ── Resize ─────────────────────────────────────────────── */
  const resizeState = useRef<{
    id: string; dir: ResizeDir; startX: number; startY: number; origRect: ElementRect;
  } | null>(null);

  const handleResizeStart = useCallback((id: string, dir: ResizeDir, e: React.PointerEvent) => {
    if (isEditing) return; // no resize in editing mode
    const r = ensuredPositions[id];
    if (!r) return;
    resizeState.current = { id, dir, startX: e.clientX, startY: e.clientY, origRect: { ...r } };
    setActiveId(id);
    setActiveAction("resize");

    const handleMove = (ev: PointerEvent) => {
      if (!resizeState.current) return;
      const { dir, startX, startY, origRect } = resizeState.current;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let { x, y, w, h } = origRect;
      if (dir.includes("e")) w = Math.max(MIN_W, origRect.w + dx);
      if (dir.includes("w")) { w = Math.max(MIN_W, origRect.w - dx); x = origRect.x + origRect.w - w; }
      if (dir.includes("s")) h = Math.max(MIN_H, origRect.h + dy);
      if (dir.includes("n")) { h = Math.max(MIN_H, origRect.h - dy); y = origRect.y + origRect.h - h; }
      setPositions(prev => ({ ...prev, [id]: { x, y, w, h } }));
    };

    const handleUp = () => {
      const resizeId = resizeState.current?.id;
      resizeState.current = null;
      if (resizeId) {
        setPositions(prev => {
          const r = prev[resizeId];
          if (!r) return prev;
          const others = availableWidgets.filter(oid => oid !== resizeId).map(oid => prev[oid]).filter(Boolean);
          const placed = smartPlace(r, others);
          const next = { ...prev, [resizeId]: placed };
          savePositions(next);
          onPositionsChange?.(next);
          return next;
        });
      }
      setActiveId(null);
      setActiveAction(null);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }, [isEditing, ensuredPositions, availableWidgets, onPositionsChange]);

  /* ── Context menu ───────────────────────────────────────── */
  const handleWidgetCtx = useCallback((e: React.MouseEvent, id: string) => {
    setCtxMenu({ x: e.clientX, y: e.clientY, widgetId: id });
  }, []);

  const handleBgCtx = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY, widgetId: null });
  }, []);

  /* ── Auto-organize with stagger ─────────────────────────── */
  const handleAutoOrg = useCallback(() => {
    const container = containerRef.current;
    if (!container) { onAutoOrganize?.(); return; }
    const organized = autoOrganize(availableWidgets, container.offsetWidth, ensuredPositions);

    // Sort ids by final position for natural stagger (top-left to bottom-right)
    const sortedIds = [...availableWidgets].sort((a, b) => {
      const ra = organized[a] || { x: 0, y: 0 };
      const rb = organized[b] || { x: 0, y: 0 };
      return ra.y !== rb.y ? ra.y - rb.y : ra.x - rb.x;
    });

    // Assign stagger indices
    const smap: Record<string, number> = {};
    sortedIds.forEach((id, i) => { smap[id] = i; });
    setStaggerMap(smap);

    // Apply positions one by one with stagger
    sortedIds.forEach((id, i) => {
      setTimeout(() => {
        setPositions(prev => {
          const next = { ...prev, [id]: organized[id] };
          if (i === sortedIds.length - 1) {
            savePositions(next);
            onPositionsChange?.(next);
          }
          return next;
        });
      }, i * 30);
    });

    // Clear stagger map after animations settle
    setTimeout(() => setStaggerMap(null), sortedIds.length * 30 + 600);
    onAutoOrganize?.();
  }, [availableWidgets, ensuredPositions, onAutoOrganize, onPositionsChange]);

  /* ── Long press on empty canvas → toggle edit ───────────── */
  const handleCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement) !== containerRef.current) return;
    longPressTimer.current = setTimeout(() => {
      onToggleEdit?.();
      if (navigator.vibrate) navigator.vibrate([40, 20, 40]);
    }, 600);
  }, [onToggleEdit]);

  const handleCanvasPointerUp = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  /* ── Native drag-and-drop from sidebar ─────────────────── */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/hw-desk-item')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const handleNativeDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const raw = e.dataTransfer.getData('application/hw-desk-item');
    if (!raw) return;
    try {
      const data: DeskDropData = JSON.parse(raw);
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      setDropChoice({
        x: e.clientX, y: e.clientY,
        canvasX: e.clientX - rect.left + container.scrollLeft,
        canvasY: e.clientY - rect.top + container.scrollTop,
        data,
      });
    } catch { /* ignore */ }
  }, []);

  const handleDropChoice = useCallback((data: DeskDropData, canvasX: number, canvasY: number, asWidget: boolean) => {
    onSidebarDrop?.(data, canvasX, canvasY, asWidget);
  }, [onSidebarDrop]);

  const isAnyActive = activeId !== null;

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full flex-1 overflow-x-clip transition-colors duration-300"
        style={{
          minHeight: canvasHeight,
          outline: isDragOver ? '2px dashed rgba(234, 88, 12, 0.4)' : 'none',
          outlineOffset: -2,
          borderRadius: 12,
        }}
        onContextMenu={handleBgCtx}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleNativeDrop}
        onPointerDown={handleCanvasPointerDown}
        onPointerUp={handleCanvasPointerUp}
        onPointerCancel={handleCanvasPointerUp}
      >
        {/* Subtle dot grid when in editing mode */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              key="edit-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
                backgroundSize: '56px 56px',
                backgroundPosition: '0px 0px',
                borderRadius: 12,
              }}
            />
          )}
        </AnimatePresence>

        {/* Landing zone ghost */}
        <AnimatePresence>
          {landingZone && activeAction === 'drag' && (
            <LandingZoneGhost
              key="landing"
              rect={landingZone.rect}
              isIcon={isCompactElement(landingZone.id)}
            />
          )}
        </AnimatePresence>

        {/* Snap guide lines */}
        <SnapGuideLines containerRect={containerRect} />

        {/* Canvas elements */}
        {availableWidgets.map((id) => {
          const widget = widgetMap[id];
          if (!widget) return null;
          // Don't render until item has a real saved position (avoids flash at origin 0,0)
          if (!positions[id]) return null;
          const rect = ensuredPositions[id];
          if (!rect) return null;
          return (
            <CanvasElement
              key={id}
              id={id}
              rect={rect}
              isEditing={isEditing}
              isDragging={activeId === id && activeAction === "drag"}
              isResizing={activeId === id && activeAction === "resize"}
              isAnyActive={isAnyActive}
              isAppIcon={isCompactElement(id)}
              isContainerResizing={isContainerResizing}
              staggerDelay={staggerMap ? (staggerMap[id] ?? 0) * 0.03 : undefined}
              onDragStart={handleDragStart}
              onResizeStart={handleResizeStart}
              onContextMenu={handleWidgetCtx}
              onRemove={() => onRemoveWidget?.(id)}
            >
              {widget}
            </CanvasElement>
          );
        })}

        {/* "Feito" pill — appears when editing */}
        <AnimatePresence>
          {isEditing && (
            <motion.button
              key="done-btn"
              initial={{ opacity: 0, scale: 0.85, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -6 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              onClick={onToggleEdit}
              className="absolute top-2 right-2 z-50 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold pointer-events-auto"
              style={{
                backgroundColor: '#EA580C',
                color: 'white',
                boxShadow: '0 4px 16px rgba(234, 88, 12, 0.45)',
              }}
            >
              <Check className="h-3 w-3" strokeWidth={2.5} />
              Feito
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <FloatingContextMenu
        state={ctxMenu}
        onClose={() => setCtxMenu(null)}
        isEditing={isEditing}
        onRemoveWidget={onRemoveWidget}
        onMoveToTop={onMoveToTop}
        onAddWidget={onAddWidget}
        onAutoOrganize={handleAutoOrg}
        onRefresh={onRefresh}
        onToggleEdit={onToggleEdit}
      />

      <AnimatePresence>
        <DropChoicePopover
          state={dropChoice}
          onClose={() => setDropChoice(null)}
          onChoice={handleDropChoice}
        />
      </AnimatePresence>
    </>
  );
}

export type { DeskDropData };
