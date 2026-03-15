import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Square, Paperclip, X, FileText, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { VoiceInput } from './VoiceInput';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

interface InputBarProps {
  onSubmit: (message: string, files?: UploadedFile[]) => void;
  onCancel: () => void;
  isLoading: boolean;
  isStreaming: boolean;
  isDarkMode?: boolean;
  placeholder?: string;
  initialValue?: string;
  onVoiceTranscript?: (text: string, isFinal: boolean) => void;
  autoFocus?: boolean;
  conversationId?: string | null;
  showFileUpload?: boolean;
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

/**
 * Unified input component with auto-resize, voice input and file upload
 * Gemini/ChatGPT style
 */
export const InputBar = memo(function InputBar({
  onSubmit,
  onCancel,
  isLoading,
  isStreaming,
  isDarkMode = true,
  placeholder = "Pergunte alguma coisa",
  initialValue = "",
  onVoiceTranscript,
  autoFocus = false,
  conversationId,
  showFileUpload = true,
}: InputBarProps) {
  const { user } = useAuth();
  const [value, setValue] = useState(initialValue);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to measure scrollHeight correctly
    textarea.style.height = 'auto';
    // Set new height with max limit
    const newHeight = Math.min(textarea.scrollHeight, 160);
    textarea.style.height = `${newHeight}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus();
    }
  }, [autoFocus]);

  // Update value when initialValue changes (e.g., from suggestions)
  useEffect(() => {
    if (initialValue !== value && initialValue) {
      setValue(initialValue);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);

  const handleSubmit = useCallback(() => {
    if (!value.trim() || isLoading) return;
    onSubmit(value.trim(), uploadedFiles.length > 0 ? uploadedFiles : undefined);
    setValue('');
    setUploadedFiles([]);
    // Reset height after submit
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, isLoading, onSubmit, uploadedFiles]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleVoice = useCallback((text: string, isFinal: boolean) => {
    setValue(text);
    onVoiceTranscript?.(text, isFinal);
  }, [onVoiceTranscript]);

  // File upload handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado', {
        description: 'Formatos aceitos: imagens (JPG, PNG, GIF, WebP), PDF, CSV, TXT, JSON',
      });
      return;
    }

    // Validate size
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
        id: fileName,
        name: file.name,
        type: file.type,
        url: signedData?.signedUrl || filePath,
        size: file.size,
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);
      toast.success('Arquivo anexado!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar arquivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="h-3 w-3" />;
    }
    return <FileText className="h-3 w-3" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="relative">
      {/* Uploaded files chips */}
      {uploadedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-1">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground"
            >
              {getFileIcon(file.type)}
              <span className="max-w-[100px] truncate">{file.name}</span>
              <span className="text-[10px] text-muted-foreground/70">
                {formatFileSize(file.size)}
              </span>
              <button
                onClick={() => handleRemoveFile(file.id)}
                className="ml-1 p-0.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={cn(
        "relative rounded-2xl border transition-shadow duration-200 bg-card border-border",
        "focus-within:border-border/80 focus-within:shadow-sm"
      )}>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept={ALLOWED_TYPES.join(',')}
          disabled={isLoading || isUploading}
        />
        
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className={cn(
            "w-full min-h-[52px] max-h-40 resize-none bg-transparent border-0 rounded-2xl",
            "focus:outline-none focus:ring-0 py-4 px-4 text-[15px] leading-relaxed",
            "text-foreground placeholder:text-muted-foreground",
            showFileUpload ? "pr-28" : "pr-24"
          )}
        />
        <div className="absolute right-3 bottom-3 flex items-center gap-1">
          {showFileUpload && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isUploading}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Anexar arquivo"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </Button>
          )}
          <VoiceInput 
            onTranscript={handleVoice}
            isDarkMode={isDarkMode}
            disabled={isLoading}
          />
          {isStreaming ? (
            <Button
              type="button"
              size="icon"
              onClick={onCancel}
              className="h-8 w-8 rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors"
            >
              <Square className="h-3 w-3 fill-current" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              size="icon"
              disabled={!value.trim() || isLoading}
              className={cn(
                "h-8 w-8 rounded-lg transition-all duration-200",
                "disabled:opacity-30 disabled:cursor-not-allowed",
                "bg-foreground hover:bg-foreground/90 text-background"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

export default InputBar;
