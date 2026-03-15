import { useState } from 'react';
import { Copy, Check, RefreshCcw, ThumbsUp, ThumbsDown, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MessageActionsProps {
  content: string;
  messageIndex: number;
  conversationId: string;
  isAssistant: boolean;
  isDarkMode: boolean;
  onRegenerate?: () => void;
  onEdit?: () => void;
  onFeedback?: (type: 'like' | 'dislike') => void;
  feedbackGiven?: 'like' | 'dislike' | null;
}

export function MessageActions({
  content,
  messageIndex,
  conversationId,
  isAssistant,
  isDarkMode,
  onRegenerate,
  onEdit,
  onFeedback,
  feedbackGiven,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Resposta copiada!');
    setTimeout(() => setCopied(false), 2000);
  };

  const buttonClass = "h-7 w-7 transition-colors text-muted-foreground hover:text-foreground hover:bg-muted";

  return (
    <div className="flex items-center gap-0.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className={buttonClass}
        title="Copiar resposta"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-success" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>

      {isAssistant && onRegenerate && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRegenerate}
          className={buttonClass}
          title="Regenerar resposta"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
        </Button>
      )}

      {!isAssistant && onEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className={buttonClass}
          title="Editar mensagem"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      )}

      {isAssistant && onFeedback && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onFeedback('like')}
            className={cn(
              buttonClass,
              feedbackGiven === 'like' && 'text-success hover:text-success'
            )}
            title="Útil"
          >
            <ThumbsUp className={cn("h-3.5 w-3.5", feedbackGiven === 'like' && 'fill-current')} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onFeedback('dislike')}
            className={cn(
              buttonClass,
              feedbackGiven === 'dislike' && 'text-destructive hover:text-destructive'
            )}
            title="Não útil"
          >
            <ThumbsDown className={cn("h-3.5 w-3.5", feedbackGiven === 'dislike' && 'fill-current')} />
          </Button>
        </>
      )}
    </div>
  );
}
