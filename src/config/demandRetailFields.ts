/**
 * Retail-specific demand field configs.
 * Shared between NovaDemanda, EditarDemanda, DetailSheet, and List views.
 *
 * "EXECUTION_CATEGORIES" replaces the old "CHANNEL_OPTIONS" concept.
 * It includes traditional channels AND operational categories like
 * Endomarketing, Compras, Treinamento, etc.
 */

export const DELIVERABLE_KINDS = [
  { value: "arte_digital", label: "Arte Digital", icon: "🖼️" },
  { value: "arte_impressa", label: "Arte Impressa", icon: "🖨️" },
  { value: "video_curto", label: "Vídeo Curto", icon: "🎬" },
  { value: "video_longo", label: "Vídeo Longo", icon: "📹" },
  { value: "texto_copy", label: "Texto / Copy", icon: "✍️" },
  { value: "encarte", label: "Encarte", icon: "📰" },
  { value: "cartaz", label: "Cartaz / Banner", icon: "🪧" },
  { value: "kit_loja", label: "Kit de Loja", icon: "🏪" },
  { value: "apresentacao", label: "Apresentação", icon: "📊" },
  { value: "email_mkt", label: "E-mail Marketing", icon: "📧" },
  { value: "outro", label: "Outro", icon: "📦" },
] as const;

export const DESTINATION_SCOPES = [
  { value: "rede", label: "Toda a Rede", icon: "🏢" },
  { value: "lojas", label: "Lojas Específicas", icon: "📍" },
] as const;

// ─── Execution Categories (grouped) ────────────────────────────
export interface ExecutionCategoryOption {
  value: string;
  label: string;
  icon: string;
  group: "digital" | "direto" | "operacional";
}

export const CATEGORY_GROUPS: Record<string, string> = {
  digital: "Canais Digitais",
  direto: "Canais Diretos",
  operacional: "Operacional",
};

export const EXECUTION_CATEGORIES: ExecutionCategoryOption[] = [
  // Digital channels
  { value: "instagram", label: "Instagram", icon: "📸", group: "digital" },
  { value: "facebook", label: "Facebook", icon: "👍", group: "digital" },
  { value: "tiktok", label: "TikTok", icon: "🎵", group: "digital" },
  { value: "youtube", label: "YouTube", icon: "▶️", group: "digital" },
  { value: "linkedin", label: "LinkedIn", icon: "💼", group: "digital" },
  { value: "site", label: "Site", icon: "🌐", group: "digital" },
  { value: "email", label: "E-mail", icon: "📧", group: "digital" },

  // Direct channels
  { value: "whatsapp", label: "WhatsApp", icon: "💬", group: "direto" },
  { value: "loja", label: "Loja Física", icon: "🏬", group: "direto" },
  { value: "tv_interna", label: "TV Interna", icon: "📺", group: "direto" },
  { value: "encarte", label: "Encarte", icon: "📰", group: "direto" },
  { value: "radio_interna", label: "Rádio Interna", icon: "🎙️", group: "direto" },
  { value: "radio_externa", label: "Rádio Externa", icon: "📻", group: "direto" },
  { value: "outdoor", label: "Outdoor", icon: "🪧", group: "direto" },
  { value: "carro_de_som", label: "Carro de Som", icon: "🔊", group: "direto" },

  // Operational categories
  { value: "endomarketing", label: "Endomarketing", icon: "👔", group: "operacional" },
  { value: "compras", label: "Compras / Aquisição", icon: "🛒", group: "operacional" },
  { value: "treinamento", label: "Treinamento", icon: "🎓", group: "operacional" },
  { value: "producao_fisica", label: "Produção Física", icon: "🏗️", group: "operacional" },
  { value: "outros", label: "Outros", icon: "📋", group: "operacional" },
];

/** Flat list for backwards-compat (same shape as old CHANNEL_OPTIONS) */
export const CHANNEL_OPTIONS = EXECUTION_CATEGORIES;

// ─── Types ─────────────────────────────────────────────────────
export type DeliverableKind = typeof DELIVERABLE_KINDS[number]["value"];
export type DestinationScope = "rede" | "lojas";

// ─── Helpers ───────────────────────────────────────────────────
export function getDeliverableLabel(kind: string | null | undefined): string {
  if (!kind) return "";
  return DELIVERABLE_KINDS.find(d => d.value === kind)?.label || kind;
}

export function getDeliverableIcon(kind: string | null | undefined): string {
  if (!kind) return "📦";
  return DELIVERABLE_KINDS.find(d => d.value === kind)?.icon || "📦";
}

export function getCategoryLabel(category: string): string {
  return EXECUTION_CATEGORIES.find(c => c.value === category)?.label || category;
}

export function getCategoryIcon(category: string): string {
  return EXECUTION_CATEGORIES.find(c => c.value === category)?.icon || "📋";
}

/** @deprecated Use getCategoryLabel */
export const getChannelLabel = getCategoryLabel;
/** @deprecated Use getCategoryIcon */
export const getChannelIcon = getCategoryIcon;
