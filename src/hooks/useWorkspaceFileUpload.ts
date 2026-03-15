import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { GLOBAL_ACCEPTED_TYPES, GLOBAL_MAX_FILE_SIZE, GLOBAL_MAX_FILE_SIZE_LABEL } from '@/lib/upload-constants';

const BUCKET_NAME = 'workspace-files';
const MAX_FILE_SIZE = GLOBAL_MAX_FILE_SIZE;
const ALLOWED_TYPES = GLOBAL_ACCEPTED_TYPES;

interface UseWorkspaceFileUploadOptions {
  pageId?: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

export function useWorkspaceFileUpload(options: UseWorkspaceFileUploadOptions = {}) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    if (!user?.id) {
      throw new Error('Você precisa estar autenticado para fazer upload');
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`Arquivo muito grande. Máximo permitido: ${GLOBAL_MAX_FILE_SIZE_LABEL}`);
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Tipo de arquivo não suportado: ${file.type}`);
    }

    setIsUploading(true);
    setProgress(0);

    try {
      // Generate unique path: userId/pageId/timestamp-filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = options.pageId
        ? `${user.id}/${options.pageId}/${timestamp}-${sanitizedName}`
        : `${user.id}/${timestamp}-${sanitizedName}`;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      clearInterval(progressInterval);

      if (error) {
        throw error;
      }

      // Return the permanent storage path (not a signed URL)
      // The editor's resolveFileUrl will generate fresh signed URLs on-demand
      setProgress(100);
      options.onSuccess?.(data.path);
      
      return data.path;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Erro ao fazer upload');
      options.onError?.(err);
      toast.error(err.message);
      throw err;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [user?.id, options]);

  const deleteFile = useCallback(async (filePath: string): Promise<boolean> => {
    if (!user?.id) {
      throw new Error('Você precisa estar autenticado para deletar arquivos');
    }

    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Erro ao deletar arquivo');
      toast.error(err.message);
      throw err;
    }
  }, [user?.id]);

  return {
    uploadFile,
    deleteFile,
    isUploading,
    progress,
  };
}
