import * as React from 'react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTitle: string;
  onRename: (newTitle: string) => void;
  isDarkMode?: boolean;
}

export const RenameDialog = React.forwardRef<HTMLDivElement, RenameDialogProps>(
  function RenameDialog({
    open,
    onOpenChange,
    currentTitle,
    onRename,
  }, ref) {
    const [title, setTitle] = useState(currentTitle);

    useEffect(() => {
      if (open) {
        setTitle(currentTitle);
      }
    }, [open, currentTitle]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (title.trim()) {
        onRename(title.trim());
        onOpenChange(false);
      }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          ref={ref}
          className="sm:max-w-md bg-secondary/95 border-border"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground/90">
              Renomear conversa
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome da conversa"
              className="bg-muted/50 border-border text-foreground/90 placeholder:text-muted-foreground focus:border-border focus:ring-1 focus:ring-ring"
              autoFocus
            />
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);
