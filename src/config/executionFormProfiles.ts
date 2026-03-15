import type { ExecutionChannel } from "@/hooks/useMarketingExecutions";

export type FormProfile = "social_post" | "social_video" | "digital_comms" | "point_of_sale" | "operational";

export const CATEGORY_FORM_PROFILE: Record<string, FormProfile> = {
  instagram: "social_post",
  facebook: "social_post",
  tiktok: "social_post",
  linkedin: "social_post",
  youtube: "social_video",
  site: "digital_comms",
  email: "digital_comms",
  whatsapp: "digital_comms",
  loja: "point_of_sale",
  tv_interna: "point_of_sale",
  encarte: "point_of_sale",
  endomarketing: "operational",
  compras: "operational",
  treinamento: "operational",
  producao_fisica: "operational",
  outros: "operational",
};

export const SOCIAL_POST_CONTENT_TYPES = [
  { value: "post_estatico", label: "Post Estático" },
  { value: "carrossel", label: "Carrossel" },
  { value: "story", label: "Story" },
  { value: "reels_short", label: "Reels / Short" },
  { value: "anuncio_pago", label: "Anúncio Pago" },
];

export const SOCIAL_VIDEO_TYPES = [
  { value: "video", label: "Vídeo" },
  { value: "short", label: "Short" },
  { value: "live", label: "Live" },
];

export const DIGITAL_COMMS_TYPES = [
  { value: "banner_popup", label: "Banner / Pop-up" },
  { value: "landing_page", label: "Landing Page" },
  { value: "newsletter", label: "Newsletter" },
  { value: "disparo_massa", label: "Disparo em massa" },
  { value: "mensagem_segmentada", label: "Mensagem segmentada" },
];

export const OPERATIONAL_STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluido", label: "Concluído" },
];

export function getFormProfile(channel: string): FormProfile {
  return CATEGORY_FORM_PROFILE[channel] || "operational";
}
