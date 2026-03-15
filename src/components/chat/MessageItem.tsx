import { memo, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Check, 
  Copy, 
  RefreshCw, 
  ThumbsUp, 
  ThumbsDown, 
  Pencil, 
  FileDown,
  AlertCircle,
  Image as ImageIcon,
  FileText,
  File,
  X,
  Sparkles,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ChatMessage, PendingAction, UploadedFile } from './types';
import { TypingIndicator } from '@/components/ia/TypingIndicator';

interface MessageItemProps {
  message: ChatMessage;
  index: number;
  isStreaming?: boolean;
  displayStatus?: string | null;
  isLastMessage?: boolean;
  onRegenerate?: () => void;
  onEdit?: () => void;
  onFeedback?: (type: 'like' | 'dislike') => void;
  onConfirmAction?: (action: PendingAction) => void;
  onRejectAction?: (actionId: string) => void;
  isProcessingAction?: boolean;
}

// Helper to detect and highlight currency values
function highlightCurrencyValues(text: string): React.ReactNode {
  const currencyPattern = /(R\$\s?[\d.,]+(?:\s?(?:mil|milhões|mi|k|M|B))?)/gi;
  const parts = text.split(currencyPattern);
  
  if (parts.length === 1) return text;
  
  return parts.map((part, index) => {
    if (currencyPattern.test(part)) {
      return (
        <span key={index} className="accent-soft-text font-medium">
          {part}
        </span>
      );
    }
    return part;
  });
}

// Copy button for code blocks
const CopyButton = memo(function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-1.5 rounded-md transition-colors duration-150 hover:bg-white/[0.08]"
      title="Copiar código"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-white/40" />
      )}
    </button>
  );
});

// Attachment chip component
const AttachmentChip = memo(function AttachmentChip({ 
  file,
  showRemove = false,
  onRemove
}: { 
  file: UploadedFile;
  showRemove?: boolean;
  onRemove?: () => void;
}) {
  const getFileIcon = () => {
    if (file.type.startsWith('image/')) return ImageIcon;
    if (file.type.includes('pdf')) return FileText;
    return File;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const Icon = getFileIcon();
  const isImage = file.type.startsWith('image/');

  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150",
        "bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08]",
        "group relative"
      )}
      onClick={(e) => {
        if (showRemove && onRemove) {
          e.preventDefault();
        }
      }}
    >
      {isImage && file.url ? (
        <img 
          src={file.url} 
          alt={file.name} 
          className="h-5 w-5 rounded object-cover"
        />
      ) : (
        <Icon className="h-3.5 w-3.5 text-white/40" />
      )}
      <span className="max-w-[120px] truncate text-white/80">{file.name}</span>
      <span className="text-white/40">{formatSize(file.size)}</span>
      
      {showRemove && onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 p-0.5 rounded hover:bg-destructive/20 text-white/40 hover:text-destructive transition-colors duration-150"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </a>
  );
});

// Parse download links from content
function parseDownloadLinks(content: string): { url: string; filename: string; format: string }[] {
  const regex = /\[DOWNLOAD:(\w+):([^\]]+)\]/g;
  const links: { url: string; filename: string; format: string }[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    links.push({
      format: match[1],
      url: match[2],
      filename: `documento.${match[1]}`,
    });
  }
  return links;
}

// Clean download markers from content
function cleanDownloadMarkers(content: string): string {
  return content.replace(/\[DOWNLOAD:\w+:[^\]]+\]/g, '').trim();
}

// Download button component
const DownloadButton = memo(function DownloadButton({ 
  url, 
  filename, 
  format,
}: { 
  url: string; 
  filename: string; 
  format: string;
}) {
  const formatLabels: Record<string, string> = {
    pdf: 'PDF',
    xlsx: 'Excel',
    docx: 'Word',
  };

  return (
    <a
      href={url}
      download={filename}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-150 mt-3 bg-white/[0.04] border-white/[0.06] text-white/80 hover:bg-white/[0.08]"
    >
      <FileDown className="h-4 w-4" />
      <span className="text-sm font-medium">Baixar {formatLabels[format] || format.toUpperCase()}</span>
    </a>
  );
});

// Error message with retry CTA
const ErrorMessage = memo(function ErrorMessage({
  content,
  onRetry,
}: {
  content: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-destructive/10 shrink-0">
          <AlertCircle className="h-4 w-4 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/85 mb-2">
            {content || 'Ocorreu um erro ao processar sua solicitação.'}
          </p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="gap-2 h-8 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Tentar novamente
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

// Message actions bar
const MessageActions = memo(function MessageActions({
  content,
  onRegenerate,
  onFeedback,
  feedbackGiven,
}: {
  content: string;
  onRegenerate?: () => void;
  onFeedback?: (type: 'like' | 'dislike') => void;
  feedbackGiven?: 'like' | 'dislike';
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-7 px-2 text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
      
      {onFeedback && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFeedback('like')}
            className={cn(
              "h-7 px-2 transition-colors duration-150",
              feedbackGiven === 'like' 
                ? "text-green-500"
                : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
            )}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFeedback('dislike')}
            className={cn(
              "h-7 px-2 transition-colors duration-150",
              feedbackGiven === 'dislike' 
                ? "text-destructive"
                : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
            )}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </Button>
        </>
      )}
      
      {onRegenerate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          className="h-7 px-2 text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
          title="Regenerar resposta"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
});

export const MessageItem = memo(function MessageItem({
  message,
  index,
  isStreaming = false,
  displayStatus,
  isLastMessage = false,
  onRegenerate,
  onEdit,
  onFeedback,
  onConfirmAction,
  onRejectAction,
  isProcessingAction = false,
}: MessageItemProps) {
  const isUser = message.role === 'user';
  const isError = message.status === 'error';
  const downloadLinks = !isUser ? parseDownloadLinks(message.content) : [];
  const cleanContent = !isUser ? cleanDownloadMarkers(message.content) : message.content;
  const hasAttachments = message.attachments && message.attachments.length > 0;

  if (isUser) {
    // User message - Right aligned bubble (Aurora 3 style)
    return (
      <div className="flex items-start gap-3 justify-end mb-6 group">
        <div className="relative max-w-[80%]">
          {/* Attachments above message */}
          {hasAttachments && (
            <div className="flex flex-wrap gap-2 mb-2 justify-end">
              {message.attachments!.map((file) => (
                <AttachmentChip key={file.id} file={file} />
              ))}
            </div>
          )}
          
          <div 
            className="rounded-2xl rounded-tr-md px-4 py-2.5 border"
            style={{
              backgroundColor: "rgba(39, 39, 42, 0.6)",
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
          </div>
          
          {/* Edit button on hover */}
          {onEdit && (
            <button
              onClick={onEdit}
              className="absolute -left-10 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-white/[0.04]"
              title="Editar mensagem"
            >
              <Pencil className="h-3.5 w-3.5 text-white/40" />
            </button>
          )}
        </div>
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: "rgba(39, 39, 42, 0.8)" }}
        >
          <User className="w-4 h-4 text-white/50" />
        </div>
      </div>
    );
  }

  // Error state with retry CTA
  if (isError) {
    return (
      <div className="flex gap-3 mb-6 group">
        <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
          <AlertCircle className="h-4 w-4 text-destructive" />
        </div>
        
        <div className="flex-1 min-w-0">
          <ErrorMessage 
            content={cleanContent} 
            onRetry={onRegenerate}
          />
        </div>
      </div>
    );
  }

  // Assistant message - Left aligned with avatar (Aurora 3 style)
  return (
    <div className="flex gap-3 mb-6 group">
      <div className="h-8 w-8 rounded-full accent-soft-bg border accent-soft-border flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="h-4 w-4 accent-soft-text" />
      </div>
      
      <div className="flex-1 min-w-0">
        {/* Markdown content - Aurora 3 style bubble with monochromatic typography */}
        <div className="prose prose-sm max-w-none prose-invert px-4 py-3 rounded-2xl rounded-tl-md" style={{ backgroundColor: "rgba(24, 24, 27, 0.7)" }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const codeContent = String(children).replace(/\n$/, '');
                
                if (!inline && (match || codeContent.includes('\n'))) {
                  return (
                    <div className="relative group/code my-3 rounded-lg overflow-hidden bg-white/[0.04]">
                      <div className="flex items-center justify-between px-4 py-2 text-xs bg-white/[0.02] text-white/50">
                        <span className="font-medium">{match ? match[1] : 'code'}</span>
                        <CopyButton text={codeContent} />
                      </div>
                      <pre className="p-4 overflow-x-auto">
                        <code className="text-sm text-white/80 font-mono" {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  );
                }
                return (
                  <code className="px-1.5 py-0.5 rounded text-sm font-mono bg-white/[0.05] text-white/80" {...props}>
                    {children}
                  </code>
                );
              },
              ul({ children }) {
                return <ul className="list-disc list-inside my-2 space-y-1 text-white/80">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal list-inside my-2 space-y-1 text-white/80">{children}</ol>;
              },
              li({ children }) {
                return <li className="leading-relaxed text-white/80">{children}</li>;
              },
              p({ children }) {
                return <p className="text-[15px] leading-relaxed mb-3 last:mb-0 text-white/85">{children}</p>;
              },
              strong({ children }) {
                // Monochromatic: white semibold instead of amber
                return <strong className="font-semibold text-white">{children}</strong>;
              },
              em({ children }) {
                return <em className="italic text-white/75">{children}</em>;
              },
              a({ href, children }) {
                // Links get the accent color + underline
                return (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="accent-soft-text hover:opacity-80 underline underline-offset-2 transition-opacity duration-150"
                  >
                    {children}
                  </a>
                );
              },
              h1({ children }) {
                return <h1 className="text-xl font-semibold mb-3 mt-4 text-white/95">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="text-lg font-semibold mb-2 mt-4 text-white/95">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="text-base font-semibold mb-2 mt-3 text-white/95">{children}</h3>;
              },
              blockquote({ children }) {
                return (
                  <blockquote className="border-l-4 border-white/10 pl-4 my-3 italic text-white/60">
                    {children}
                  </blockquote>
                );
              },
              hr() {
                return <hr className="border-white/[0.05] my-4" />;
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-3">
                    <table className="min-w-full border-collapse">
                      {children}
                    </table>
                  </div>
                );
              },
              th({ children }) {
                return (
                  <th className="border border-white/[0.06] px-3 py-2 text-left font-semibold bg-white/[0.02] text-white/90">
                    {children}
                  </th>
                );
              },
              td({ children }) {
                return (
                  <td className="border border-white/[0.06] px-3 py-2 text-white/80">
                    {children}
                  </td>
                );
              },
            }}
          >
            {cleanContent}
          </ReactMarkdown>
          
          {/* Download buttons for generated files */}
          {downloadLinks.map((link, idx) => (
            <DownloadButton
              key={idx}
              url={link.url}
              filename={link.filename}
              format={link.format}
            />
          ))}
          
          {/* Typing indicator during streaming */}
          {isStreaming && isLastMessage && (
            <div className="mt-2">
              <TypingIndicator isDarkMode={true} status={displayStatus} />
            </div>
          )}
        </div>
        
        {/* Message actions - only show when not streaming */}
        {!isStreaming && message.content && (
          <MessageActions
            content={cleanContent}
            onRegenerate={onRegenerate}
            onFeedback={onFeedback}
            feedbackGiven={message.feedback}
          />
        )}
        
        {/* Response metrics */}
        {message.responseTime && !isStreaming && (
          <div className="mt-2 text-[11px] text-white/40">
            {(message.responseTime / 1000).toFixed(1)}s
            {message.tokenCount && ` • ~${message.tokenCount} tokens`}
          </div>
        )}
      </div>
    </div>
  );
});

export default MessageItem;
