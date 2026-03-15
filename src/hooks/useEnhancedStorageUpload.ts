import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { GLOBAL_ACCEPTED_TYPES, GLOBAL_MAX_FILE_SIZE } from '@/lib/upload-constants';

interface UseEnhancedStorageUploadOptions {
  bucket: string;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  generateThumbnail?: boolean;
  onProgress?: (progress: number) => void;
  onSuccess?: (url: string, path: string, metadata: UploadMetadata) => void;
  onError?: (error: Error) => void;
}

interface UploadMetadata {
  originalName: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
  uploadedAt: string;
}

interface UploadResult {
  url: string;
  path: string;
  signedUrl?: string;
  metadata: UploadMetadata;
}

const DEFAULT_MAX_SIZE = GLOBAL_MAX_FILE_SIZE;
const DEFAULT_ALLOWED_TYPES = GLOBAL_ACCEPTED_TYPES;

/**
 * Enhanced storage upload hook with validation, progress, and signed URLs
 */
export function useEnhancedStorageUpload({
  bucket,
  maxFileSize = DEFAULT_MAX_SIZE,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  generateThumbnail = false,
  onProgress,
  onSuccess,
  onError,
}: UseEnhancedStorageUploadOptions) {
  const { user, tenant } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Type validation
    if (!allowedTypes.includes(file.type)) {
      return `Tipo de arquivo não permitido: ${file.type}. Permitidos: ${allowedTypes.join(', ')}`;
    }
    
    // Size validation
    if (file.size > maxFileSize) {
      const maxMB = (maxFileSize / 1024 / 1024).toFixed(1);
      const fileMB = (file.size / 1024 / 1024).toFixed(1);
      return `Arquivo muito grande (${fileMB}MB). Máximo: ${maxMB}MB`;
    }
    
    return null;
  }, [allowedTypes, maxFileSize]);

  const getImageDimensions = (file: File): Promise<{ width: number; height: number } | null> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(null);
        return;
      }

      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        resolve(null);
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const generateFilePath = (file: File): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const sanitizedName = file.name
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-zA-Z0-9]/g, '-') // Replace special chars
      .substring(0, 50); // Limit length
    
    // Structure: tenant_id/user_id/timestamp-random-name.ext
    const tenantPart = tenant?.id || 'global';
    const userPart = user?.id || 'anonymous';
    
    return `${tenantPart}/${userPart}/${timestamp}-${random}-${sanitizedName}.${ext}`;
  };

  const upload = async (file: File, customPath?: string): Promise<UploadResult | null> => {
    // Validate
    const validationError = validateFile(file);
    if (validationError) {
      const err = new Error(validationError);
      setError(err);
      toast.error(validationError);
      onError?.(err);
      return null;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      // Get image dimensions if applicable
      const dimensions = await getImageDimensions(file);
      
      // Generate path
      const filePath = customPath || generateFilePath(file);
      
      // Simulate progress (Supabase doesn't provide real progress)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const next = Math.min(prev + 5, 90);
          onProgress?.(next);
          return next;
        });
      }, 100);

      // Upload
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      clearInterval(progressInterval);

      if (uploadError) {
        throw uploadError;
      }

      setProgress(95);
      onProgress?.(95);

      // Get signed URL (buckets are private)
      const { data: signedData } = await supabase.storage
        .from(bucket)
        .createSignedUrl(data.path, 3600);

      // Build metadata
      const metadata: UploadMetadata = {
        originalName: file.name,
        size: file.size,
        type: file.type,
        width: dimensions?.width,
        height: dimensions?.height,
        uploadedAt: new Date().toISOString(),
      };

      setProgress(100);
      onProgress?.(100);

      // ------------------------------------------------------------
      // STORAGE QUOTA (REAL): consome bytes após upload bem sucedido
      // ------------------------------------------------------------
      if (tenant?.id) {
        const { data: ok, error: storageErr } = await supabase.rpc('consume_storage_bytes', {
          p_tenant_id: tenant.id,
          p_bytes: file.size,
        });

        if (storageErr) {
          // Não quebra o upload (arquivo já subiu), mas sinaliza
          console.error('consume_storage_bytes error:', storageErr);
        }

        if (ok === false) {
          // Avisa que limite foi atingido mas mantém upload (arquivo já subiu)
          toast.warning('Limite de armazenamento atingido. Entre em contato com o administrador.');
        }
      }

      const result: UploadResult = {
        url: signedData?.signedUrl || data.path,
        path: data.path,
        metadata,
      };

      onSuccess?.(result.url, result.path, metadata);
      toast.success('Upload concluído');
      
      return result;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro no upload');
      setError(error);
      toast.error(error.message);
      onError?.(error);
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 500);
      abortControllerRef.current = null;
    }
  };

  const uploadMultiple = async (files: File[]): Promise<(UploadResult | null)[]> => {
    const results: (UploadResult | null)[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const result = await upload(files[i]);
      results.push(result);
    }
    
    return results;
  };

  const getSignedUrl = async (path: string, expiresIn = 3600): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) throw error;
      return data.signedUrl;
    } catch (err) {
      console.error('Failed to get signed URL:', err);
      return null;
    }
  };

  const remove = async (path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
      toast.success('Arquivo removido');
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao remover');
      toast.error(error.message);
      return false;
    }
  };

  const cancel = () => {
    abortControllerRef.current?.abort();
    setIsUploading(false);
    setProgress(0);
  };

  return {
    upload,
    uploadMultiple,
    remove,
    getSignedUrl,
    cancel,
    isUploading,
    progress,
    error,
    validateFile,
  };
}

// Convenience hooks for specific buckets
export function useTradeProofsUpload(options?: Partial<UseEnhancedStorageUploadOptions>) {
  return useEnhancedStorageUpload({
    bucket: 'trade-proofs',
    ...options,
  });
}

export function useWorkspaceFilesUpload(options?: Partial<UseEnhancedStorageUploadOptions>) {
  return useEnhancedStorageUpload({
    bucket: 'workspace-files',
    ...options,
  });
}

export function useNexusIADocumentsUpload(options?: Partial<UseEnhancedStorageUploadOptions>) {
  return useEnhancedStorageUpload({
    bucket: 'ia-documents',
    ...options,
  });
}
