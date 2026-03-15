import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Square, X, FileText, Image, Loader2, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ComposerActionsMenu, type ComposerAction } from './ComposerActionsMenu';
import { ThinkingModeSelector, type ThinkingMode, type AIModel } from './ThinkingModeSelector';
import { IntegrationsBar } from './IntegrationsBar';
import type { UploadedFile } from './types';

interface ChatComposerProps {
  onSend: (text: string, files?: UploadedFile[]) => void;
  onStop: () => void;
  disabled?: boolean;
  isStreaming: boolean;
  placeholder?: string;
  conversationId?: string | null;
  showFileUpload?: boolean;
  autoFocus?: boolean;
  initialValue?: string;
  thinkingMode?: ThinkingMode;
  onThinkingModeChange?: (mode: ThinkingMode) => void;
  selectedModel?: AIModel;
  onModelChange?: (model: AIModel) => void;
  onConnectedToolsChange?: (connectedIds: string[], toolGroups: string[]) => void;
}

import { GLOBAL_ACCEPTED_TYPES, GLOBAL_MAX_FILE_SIZE, GLOBAL_MAX_FILE_SIZE_LABEL, formatFileSize as globalFormatFileSize } from '@/lib/upload-constants';

const ALLOWED_TYPES = GLOBAL_ACCEPTED_TYPES;
const MAX_FILE_SIZE = GLOBAL_MAX_FILE_SIZE;

export const ChatComposer = memo(function ChatComposer({
  onSend,
  onStop,
  disabled = false,
  isStreaming,
  placeholder = "Mensagem para NexusIA...",
  conversationId,
  showFileUpload = true,
  autoFocus = false,
  initialValue = "",
  thinkingMode = 'standard',
  onThinkingModeChange,
  selectedModel,
  onModelChange,
  onConnectedToolsChange,
}: ChatComposerProps) {
  const { user } = useAuth();
  const [text, setText] = useState(initialValue);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [localThinkingMode, setLocalThinkingMode] = useState<ThinkingMode>(thinkingMode);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local thinking mode with prop
  useEffect(() => {
    setLocalThinkingMode(thinkingMode);
  }, [thinkingMode]);

  const handleThinkingModeChange = (mode: ThinkingMode) => {
    setLocalThinkingMode(mode);
    onThinkingModeChange?.(mode);
  };

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${Math.max(newHeight, 24)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [text, adjustHeight]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Sync with initialValue
  useEffect(() => {
    if (initialValue && initialValue !== text) {
      setText(initialValue);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);

  const submit = useCallback(() => {
    const v = text.trim();
    if (!v || disabled || isStreaming) return;
    onSend(v, uploadedFiles.length > 0 ? uploadedFiles : undefined);
    setText('');
    setUploadedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [text, disabled, isStreaming, onSend, uploadedFiles]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Enter sends, Shift+Enter for new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming) submit();
    }
    // Ctrl/Cmd+Enter also sends
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isStreaming) submit();
    }
  }, [isStreaming, submit]);

  // Handle menu actions
  const handleMenuAction = useCallback((action: ComposerAction) => {
    if (action === 'upload_files') {
      fileInputRef.current?.click();
    }
  }, []);

  // File upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (fileInputRef.current) fileInputRef.current.value = '';

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado', {
        description: 'Use imagens, vídeos, documentos, áudio ou arquivos compactados.',
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Arquivo muito grande', {
        description: `O tamanho máximo é ${GLOBAL_MAX_FILE_SIZE_LABEL}`,
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
      toast.success('Arquivo anexado');
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

  const formatFileSize = (bytes: number) => globalFormatFileSize(bytes);

  const handleVoiceInput = () => {
    toast.info('Entrada por voz', {
      description: 'Esta funcionalidade estará disponível em breve.',
    });
  };

  return (
    <div className="w-full">
      {/* Uploaded files chips with glass effect */}
      {uploadedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {uploadedFiles.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-white/[0.06] backdrop-blur-sm border border-white/10"
            >
              {getFileIcon(file.type)}
              <span className="max-w-[100px] truncate text-foreground">{file.name}</span>
              <span className="text-muted-foreground">
                {formatFileSize(file.size)}
              </span>
              <button
                onClick={() => handleRemoveFile(file.id)}
                className="ml-0.5 p-1 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept={ALLOWED_TYPES.join(',')}
        disabled={disabled || isUploading}
      />

      {/* Main composer - Claude style */}
      <div 
        className={cn(
          "relative rounded-2xl transition-all duration-300 bg-muted border border-border/50",
          "focus-within:ring-1 focus-within:ring-border",
        )}
      >
        {/* Textarea area */}
        <div className="px-5 pt-4 pb-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={disabled}
            className={cn(
              "w-full min-h-[28px] max-h-[200px] resize-none bg-transparent border-0",
              "focus:outline-none focus:ring-0",
              "text-[15px] leading-relaxed",
              "text-foreground placeholder:text-muted-foreground/60"
            )}
          />
        </div>

        {/* Action bar with premium styling */}
        <div className="flex items-center justify-between px-3 pb-3">
          {/* Left side - Menu + Thinking selector */}
          <div className="flex items-center gap-1">
            {showFileUpload && (
              <ComposerActionsMenu 
                onAction={handleMenuAction}
                disabled={disabled || isUploading}
              />
            )}
            <ThinkingModeSelector
              value={localThinkingMode}
              onChange={handleThinkingModeChange}
              selectedModel={selectedModel}
              onModelChange={onModelChange}
              disabled={disabled}
            />
          </div>

          {/* Right side - Voice + Send/Stop */}
          <div className="flex items-center gap-2">
            {/* Voice input button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleVoiceInput}
              disabled={disabled || isStreaming}
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
              title="Entrada por voz"
            >
              <Mic className="h-4 w-4" />
            </Button>

            {/* Send/Stop button with glow effect */}
            {isStreaming ? (
              <Button
                type="button"
                size="icon"
                onClick={onStop}
                className="h-9 w-9 rounded-xl bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all"
                title="Parar geração (Esc)"
              >
                <Square className="h-4 w-4 fill-current" />
              </Button>
            ) : (
              <Button
                onClick={submit}
                size="icon"
                disabled={!text.trim() || disabled}
                className={cn(
                  "h-9 w-9 rounded-xl transition-all duration-200",
                  text.trim() 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(var(--primary),0.3)]" 
                    : "bg-white/10 text-muted-foreground cursor-not-allowed"
                )}
                title="Enviar (Enter)"
              >
                {disabled && !isStreaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Integrations bar */}
      <IntegrationsBar onConnectionsChange={onConnectedToolsChange} />

      {/* Helper text */}
      <p className="mt-2 text-[11px] text-center text-muted-foreground">
        Enter para enviar • Shift+Enter para quebrar linha
      </p>
    </div>
  );
});

export default ChatComposer;
