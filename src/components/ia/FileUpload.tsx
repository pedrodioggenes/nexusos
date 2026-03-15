import { useState, useRef } from 'react';
import { Paperclip, X, FileText, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UploadedFile {
  name: string;
  type: string;
  url: string;
  size: number;
}

interface FileUploadProps {
  conversationId: string | null;
  onUpload: (file: UploadedFile) => void;
  onRemove: (fileName: string) => void;
  uploadedFiles: UploadedFile[];
  isDarkMode: boolean;
  disabled?: boolean;
}

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/csv',
  'text/plain',
  'application/json',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function FileUpload({
  conversationId,
  onUpload,
  onRemove,
  uploadedFiles,
  isDarkMode,
  disabled,
}: FileUploadProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (inputRef.current) inputRef.current.value = '';

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado', {
        description: 'Formatos aceitos: imagens (JPG, PNG, GIF, WebP), PDF, CSV, TXT, JSON',
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Arquivo muito grande', {
        description: 'O tamanho máximo é 5MB',
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `ia/${conversationId || 'temp'}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('trade-proofs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: signedData } = await supabase.storage
        .from('trade-proofs')
        .createSignedUrl(filePath, 3600);

      const uploadedFile: UploadedFile = {
        name: file.name,
        type: file.type,
        url: signedData?.signedUrl || filePath,
        size: file.size,
      };

      onUpload(uploadedFile);
      toast.success('Arquivo anexado!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar arquivo');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="h-3.5 w-3.5" />;
    }
    return <FileText className="h-3.5 w-3.5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept={ALLOWED_TYPES.join(',')}
        disabled={disabled || isUploading}
      />
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || isUploading}
        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
        title="Anexar arquivo"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Paperclip className="h-4 w-4" />
        )}
      </Button>

      {uploadedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uploadedFiles.map((file) => (
            <div
              key={file.name}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-muted text-secondary-foreground"
            >
              {getFileIcon(file.type)}
              <span className="max-w-[100px] truncate">{file.name}</span>
              <span className="text-[10px] text-muted-foreground">
                {formatFileSize(file.size)}
              </span>
              <button
                onClick={() => onRemove(file.name)}
                className="ml-1 p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/20"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
