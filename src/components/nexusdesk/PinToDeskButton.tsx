import React, { useState } from "react";
import { Pin, PinOff, Layout, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { PinnableItem } from "@/hooks/useDeskPins";

/* ── "Fixar na Mesa" button ─────────────────────────────── */

interface PinToDeskButtonProps {
  item: PinnableItem;
  isPinned: boolean;
  onPinChoice: (item: PinnableItem) => void;
  onUnpin: (id: string, sourceView: string) => void;
  size?: 'sm' | 'md';
}

export function PinToDeskButton({ item, isPinned, onPinChoice, onUnpin, size = 'sm' }: PinToDeskButtonProps) {
  if (isPinned) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); onUnpin(item.id, item.sourceView); }}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium transition-all hover:bg-white/[0.06]"
        style={{ color: '#EA580C' }}
        title="Remover da mesa"
      >
        <PinOff className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
        {size !== 'sm' && 'Na mesa'}
      </button>
    );
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onPinChoice(item); }}
      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium transition-all hover:bg-white/[0.06]"
      style={{ color: '#71717A' }}
      title="Fixar na mesa"
    >
      <Pin className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {size !== 'sm' && 'Fixar na mesa'}
    </button>
  );
}

/* ── Pin Choice Popover (icon vs widget) ─────────────────── */

interface PinChoiceDialogProps {
  item: PinnableItem | null;
  onClose: () => void;
  onChoice: (item: PinnableItem, mode: 'icon' | 'widget') => void;
  anchorPos?: { x: number; y: number };
}

export function PinChoiceDialog({ item, onClose, onChoice, anchorPos }: PinChoiceDialogProps) {
  if (!item) return null;

  const pos = anchorPos || { x: window.innerWidth / 2 - 112, y: window.innerHeight / 2 - 60 };

  return (
    <div className="fixed inset-0 z-[9999]" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -4 }}
        transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
        className="absolute w-56 rounded-xl p-1.5"
        style={{
          left: Math.min(pos.x, window.innerWidth - 240),
          top: Math.min(pos.y, window.innerHeight - 140),
          backgroundColor: "rgba(28, 28, 31, 0.95)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.1) inset",
          backdropFilter: "blur(20px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1.5"
          style={{ color: '#52525B' }}>
          Fixar "{item.title.length > 20 ? item.title.slice(0, 20) + '…' : item.title}"
        </p>
        <button
          onClick={() => { onChoice(item, 'icon'); onClose(); }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all duration-150 hover:bg-white/[0.06]"
          style={{ color: '#E4E4E7' }}
        >
          <span className="h-5 w-5 rounded-md flex items-center justify-center"
            style={{ backgroundColor: '#27272A' }}>
            <ImageIcon className="h-3 w-3" style={{ color: '#71717A' }} />
          </span>
          Como ícone (atalho)
        </button>
        <button
          onClick={() => { onChoice(item, 'widget'); onClose(); }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all duration-150 hover:bg-white/[0.06]"
          style={{ color: '#E4E4E7' }}
        >
          <span className="h-5 w-5 rounded-md flex items-center justify-center"
            style={{ backgroundColor: '#27272A' }}>
            <Layout className="h-3 w-3" style={{ color: '#71717A' }} />
          </span>
          Como widget (card)
        </button>
      </motion.div>
    </div>
  );
}
