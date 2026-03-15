import { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface EditableMessageProps {
  content: string;
  isEditing: boolean;
  onSave: (newContent: string) => void;
  onCancel: () => void;
  isDarkMode: boolean;
}

export function EditableMessage({
  content,
  isEditing,
  onSave,
  onCancel,
  isDarkMode,
}: EditableMessageProps) {
  const [editedContent, setEditedContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      setEditedContent(content);
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 50);
    }
  }, [isEditing, content]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      onSave(editedContent);
    }
  };

  if (!isEditing) {
    return null;
  }

  return (
    <div className="space-y-2 w-full">
      <Textarea
        ref={textareaRef}
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-[80px] resize-none bg-muted border-border text-foreground"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onSave(editedContent)}
          className="gap-1 bg-foreground text-background hover:bg-foreground/90"
        >
          <Check className="h-3.5 w-3.5" />
          Salvar e regenerar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Cancelar
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Pressione Ctrl+Enter para salvar ou Esc para cancelar
      </p>
    </div>
  );
}
