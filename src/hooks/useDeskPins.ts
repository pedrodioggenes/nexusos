/**
 * Universal "Pin to Desk" system.
 *
 * Any page can emit PinnableItems. Users can pin them to the Home desk
 * as either an icon (shortcut) or a card (widget preview).
 *
 * Pinned items are persisted in localStorage and rendered on the desk
 * alongside widgets and app icons.
 */

import { createContext, useContext, useCallback, useState, useEffect } from "react";
import { toast } from "sonner";

/* ── PinnableItem: the universal contract ─────────────────── */

export interface PinnableItem {
  /** Unique ID (usually entity ID from DB) */
  id: string;
  /** Human-readable title */
  title: string;
  /** Lucide icon name (e.g. 'FileText', 'GraduationCap') */
  icon: string;
  /** Optional subtitle / description */
  subtitle?: string;
  /** Accent color for the icon/card */
  accentColor?: string;
  /** Which source view this came from (e.g. 'documents', 'trainings', 'goals') */
  sourceView: string;
  /** Item type for display purposes */
  itemType: string;
  /** Whether to display as widget by default (user still chooses) */
  preferWidget?: boolean;
  /** Extra metadata for rendering (e.g. file type, status, etc.) */
  meta?: Record<string, string>;
}

export interface DeskPinnedItem extends PinnableItem {
  /** How the user chose to display it */
  displayMode: 'icon' | 'widget';
  /** When it was pinned */
  pinnedAt: string;
}

/* ── Storage ──────────────────────────────────────────────── */

const STORAGE_KEY = 'hw-desk-pinned-items';

function loadPinnedItems(): DeskPinnedItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function savePinnedItems(items: DeskPinnedItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/* ── Hook: useDeskPins ────────────────────────────────────── */

export function useDeskPins() {
  const [pinnedItems, setPinnedItems] = useState<DeskPinnedItem[]>(() => loadPinnedItems());

  // Sync to localStorage whenever items change
  useEffect(() => {
    savePinnedItems(pinnedItems);
  }, [pinnedItems]);

  const pinItem = useCallback((item: PinnableItem, displayMode: 'icon' | 'widget') => {
    setPinnedItems(prev => {
      // Check if already pinned
      const exists = prev.some(p => p.id === item.id && p.sourceView === item.sourceView);
      if (exists) {
        toast.info('Este item já está fixado na mesa');
        return prev;
      }

      const pinned: DeskPinnedItem = {
        ...item,
        displayMode,
        pinnedAt: new Date().toISOString(),
      };

      toast.success(
        displayMode === 'icon'
          ? `"${item.title}" fixado como ícone na mesa`
          : `"${item.title}" fixado como widget na mesa`
      );

      return [...prev, pinned];
    });
  }, []);

  const unpinItem = useCallback((id: string, sourceView: string) => {
    setPinnedItems(prev => {
      const next = prev.filter(p => !(p.id === id && p.sourceView === sourceView));
      if (next.length < prev.length) {
        toast.success('Item removido da mesa');
        // Also clean position from localStorage
        try {
          const positions = JSON.parse(localStorage.getItem('hw-desk-positions') || '{}');
          const iconKey = `pin:${sourceView}:${id}`;
          const widgetKey = `pin-widget:${sourceView}:${id}`;
          delete positions[iconKey];
          delete positions[widgetKey];
          localStorage.setItem('hw-desk-positions', JSON.stringify(positions));
        } catch { /* noop */ }
      }
      return next;
    });
  }, []);

  const isPinned = useCallback((id: string, sourceView: string) => {
    return pinnedItems.some(p => p.id === id && p.sourceView === sourceView);
  }, [pinnedItems]);

  return { pinnedItems, pinItem, unpinItem, isPinned };
}

/* ── Context for passing pin capability to child pages ─────── */

interface DeskPinContextValue {
  pinItem: (item: PinnableItem, displayMode: 'icon' | 'widget') => void;
  unpinItem: (id: string, sourceView: string) => void;
  isPinned: (id: string, sourceView: string) => boolean;
  /** Show the pin choice dialog for this item */
  showPinChoice: (item: PinnableItem) => void;
}

const DeskPinContext = createContext<DeskPinContextValue | null>(null);

export const DeskPinProvider = DeskPinContext.Provider;

export function useDeskPinContext() {
  return useContext(DeskPinContext);
}

/* ── Helper: get desk key for a pinned item ───────────────── */

export function getPinnedItemDeskKey(item: DeskPinnedItem): string {
  return item.displayMode === 'widget'
    ? `pin-widget:${item.sourceView}:${item.id}`
    : `pin:${item.sourceView}:${item.id}`;
}

export function isPinnedDeskKey(key: string): boolean {
  return key.startsWith('pin:') || key.startsWith('pin-widget:');
}
