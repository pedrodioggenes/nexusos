import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GLOBAL_ACCEPTED_TYPES, GLOBAL_MAX_FILE_SIZE, GLOBAL_MAX_FILE_SIZE_LABEL } from '@/lib/upload-constants';

interface UseDemandAttachmentUploadOptions {
  onSuccess?: (url: string, path: string) => void;
  onError?: (error: Error) => void;
}

interface UploadResult {
  url: string;
  path: string;
}

export function useDemandAttachmentUpload({ onSuccess, onError }: UseDemandAttachmentUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File, customPath?: string): Promise<UploadResult | null> => {
    setIsUploading(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = customPath || `${user.id}/${fileName}`;

      // Validate file type
      if (!GLOBAL_ACCEPTED_TYPES.includes(file.type)) {
        throw new Error('Tipo de arquivo não permitido.');
      }

      // Validate file size
      if (file.size > GLOBAL_MAX_FILE_SIZE) {
        throw new Error(`Arquivo muito grande. Máximo: ${GLOBAL_MAX_FILE_SIZE_LABEL}`);
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const { data, error } = await supabase.storage
        .from('demand-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type, // Explicit content type for proper rendering
        });

      clearInterval(progressInterval);

      if (error) {
        throw error;
      }

      setProgress(100);

      // Return the permanent storage path (not a signed URL)
      // The editor's resolveFileUrl will generate fresh signed URLs on-demand
      const result = {
        url: data.path,
        path: data.path,
      };

      onSuccess?.(result.url, result.path);
      return result;

    } catch (error) {
      const err = error instanceof Error ? error : new Error('Erro no upload');
      toast.error(err.message);
      onError?.(err);
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  // Upload for BlockNote editor
  const uploadFile = async (file: File): Promise<string> => {
    const result = await upload(file);
    if (!result) {
      throw new Error('Falha no upload');
    }
    return result.url;
  };

  const remove = async (path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from('demand-attachments')
        .remove([path]);

      if (error) throw error;
      
      toast.success('Arquivo removido');
      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Erro ao remover arquivo');
      toast.error(err.message);
      return false;
    }
  };

  return {
    upload,
    uploadFile,
    remove,
    isUploading,
    progress,
  };
}
