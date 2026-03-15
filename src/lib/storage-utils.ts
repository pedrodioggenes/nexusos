import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Extract storage path from a full public URL or return path as-is.
 * Handles both old public URLs and raw paths.
 */
export function extractStoragePath(urlOrPath: string, bucket: string): string {
  if (!urlOrPath) return urlOrPath;
  
  // If it's already a path (no http), return as-is
  if (!urlOrPath.startsWith('http')) return urlOrPath;
  
  // Extract path from public URL pattern: .../storage/v1/object/public/{bucket}/{path}
  const publicPattern = `/storage/v1/object/public/${bucket}/`;
  const publicIdx = urlOrPath.indexOf(publicPattern);
  if (publicIdx !== -1) {
    return decodeURIComponent(urlOrPath.substring(publicIdx + publicPattern.length));
  }
  
  // Extract path from signed URL pattern: .../storage/v1/object/sign/{bucket}/{path}?token=...
  const signPattern = `/storage/v1/object/sign/${bucket}/`;
  const signIdx = urlOrPath.indexOf(signPattern);
  if (signIdx !== -1) {
    const pathWithQuery = urlOrPath.substring(signIdx + signPattern.length);
    return decodeURIComponent(pathWithQuery.split('?')[0]);
  }
  
  // Fallback: return as-is
  return urlOrPath;
}

/**
 * Create a signed URL for a file in a private bucket.
 * Handles both raw paths and old public URLs.
 * Returns the signed URL or the original URL on error.
 */
export async function createSignedStorageUrl(
  bucket: string,
  urlOrPath: string,
  expiresIn = 3600
): Promise<string> {
  const path = extractStoragePath(urlOrPath, bucket);
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  
  if (error || !data?.signedUrl) {
    console.error('Failed to create signed URL:', error);
    return urlOrPath; // fallback to original
  }
  
  return data.signedUrl;
}

/**
 * Create signed URLs for multiple files in a bucket.
 */
export async function createSignedStorageUrls(
  bucket: string,
  urlsOrPaths: string[],
  expiresIn = 3600
): Promise<string[]> {
  const paths = urlsOrPaths.map(u => extractStoragePath(u, bucket));
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(paths, expiresIn);
  
  if (error || !data) {
    console.error('Failed to create signed URLs:', error);
    return urlsOrPaths;
  }
  
  return data.map((d, i) => d.signedUrl || urlsOrPaths[i]);
}

/**
 * Detect which bucket a URL belongs to based on its path.
 */
export function detectBucket(url: string): string | null {
  const buckets = ['workspace-files', 'campaign-media', 'demand-attachments', 'trade-proofs', 'ia-documents'];
  for (const b of buckets) {
    if (url.includes(`/${b}/`)) return b;
  }
  return null;
}

/**
 * Resolve any storage URL (public or signed) to a fresh signed URL.
 * Auto-detects the bucket from the URL.
 */
export async function resolveStorageUrl(url: string, expiresIn = 3600): Promise<string> {
  if (!url || !url.includes('/storage/v1/')) return url;
  
  const bucket = detectBucket(url);
  if (!bucket) return url;
  
  return createSignedStorageUrl(bucket, url, expiresIn);
}

/**
 * Resolve a file URL for BlockNote editor rendering.
 * Handles raw storage paths (new content) and expired signed URLs (legacy content).
 * Used as the `resolveFileUrl` prop in BlockNote's `useCreateBlockNote`.
 */
export async function resolveBlockNoteFileUrl(
  url: string,
  defaultBucket: string = 'workspace-files'
): Promise<string> {
  if (!url) return url;
  
  // External URLs (not from our storage) — pass through
  if (url.startsWith('http') && !url.includes(SUPABASE_URL || '___never_match___')) {
    return url;
  }
  
  // Data URLs — pass through
  if (url.startsWith('data:')) return url;
  
  // Blob URLs — pass through
  if (url.startsWith('blob:')) return url;
  
  // If it's a full Supabase URL (signed or public), detect bucket and refresh
  if (url.startsWith('http')) {
    const bucket = detectBucket(url) || defaultBucket;
    return createSignedStorageUrl(bucket, url);
  }
  
  // It's a raw storage path (e.g. "userId/timestamp-file.png")
  // Generate a fresh signed URL using the default bucket
  return createSignedStorageUrl(defaultBucket, url);
}
