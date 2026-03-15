/**
 * Constantes globais de upload reutilizadas em todo o sistema.
 * Qualquer uploader deve importar daqui em vez de definir localmente.
 */

// ── Limite máximo de arquivo: 5 GB ──────────────────────────────────
export const GLOBAL_MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB

// ── MIME types aceitos ──────────────────────────────────────────────
export const GLOBAL_ACCEPTED_TYPES: string[] = [
  // Imagens
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/svg+xml',
  'image/tiff',
  'image/bmp',
  'image/x-icon',
  'image/vnd.adobe.photoshop',

  // Design
  'application/postscript',        // AI / EPS
  'application/x-indesign',        // INDD

  // Vídeo
  'video/mp4',
  'video/webm',
  'video/quicktime',               // MOV
  'video/x-msvideo',               // AVI
  'video/x-matroska',              // MKV
  'video/x-ms-wmv',                // WMV

  // Áudio
  'audio/mpeg',                    // MP3
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/mp4',                     // M4A

  // Documentos
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'text/markdown',
  'application/json',
  'application/xml',
  'text/xml',

  // Compactados
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
];

// ── Helpers ─────────────────────────────────────────────────────────

export type FileCategory = 'image' | 'video' | 'audio' | 'document' | 'design' | 'archive' | 'unknown';

export function getFileTypeCategory(mimeType: string): FileCategory {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (['application/postscript', 'application/x-indesign', 'image/vnd.adobe.photoshop'].includes(mimeType)) return 'design';
  if (['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'].includes(mimeType)) return 'archive';
  if (
    mimeType.startsWith('text/') ||
    mimeType === 'application/pdf' ||
    mimeType === 'application/json' ||
    mimeType === 'application/xml' ||
    mimeType.includes('document') ||
    mimeType.includes('sheet') ||
    mimeType.includes('presentation') ||
    mimeType.includes('msword') ||
    mimeType.includes('ms-excel') ||
    mimeType.includes('ms-powerpoint')
  ) return 'document';
  return 'unknown';
}

/** Detecta categoria a partir da URL (extensão) */
export function getFileCategoryFromUrl(url: string): FileCategory {
  const ext = url.split('.').pop()?.toLowerCase().split('?')[0] || '';
  const imageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'svg', 'tiff', 'bmp', 'ico'];
  const videoExts = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'wmv'];
  const audioExts = ['mp3', 'wav', 'ogg', 'aac', 'm4a'];
  const designExts = ['psd', 'ai', 'eps', 'indd'];
  const archiveExts = ['zip', 'rar', '7z'];

  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  if (designExts.includes(ext)) return 'design';
  if (archiveExts.includes(ext)) return 'archive';
  return 'document';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/** String legível do limite de tamanho */
export const GLOBAL_MAX_FILE_SIZE_LABEL = '5 GB';

/** accept string para inputs do tipo file */
export const GLOBAL_ACCEPT_STRING = GLOBAL_ACCEPTED_TYPES.join(',');
