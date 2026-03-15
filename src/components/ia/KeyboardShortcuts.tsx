import { useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface KeyboardShortcutsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDarkMode: boolean;
}

interface ShortcutHandlers {
  newChat?: () => void;
  copyResponse?: () => void;
  toggleSidebar?: () => void;
  toggleTheme?: () => void;
  cancelStreaming?: () => void;
  regenerate?: () => void;
  openShortcuts?: () => void;
  export?: () => void;
}

const SHORTCUTS = [
  { keys: ['⌘', 'K'], description: 'Novo chat', action: 'newChat' },
  { keys: ['⌘', 'Shift', 'C'], description: 'Copiar última resposta', action: 'copyResponse' },
  { keys: ['⌘', 'Shift', 'S'], description: 'Alternar sidebar', action: 'toggleSidebar' },
  { keys: ['⌘', 'Shift', 'D'], description: 'Alternar tema', action: 'toggleTheme' },
  { keys: ['Esc'], description: 'Cancelar streaming', action: 'cancelStreaming' },
  { keys: ['⌘', 'R'], description: 'Regenerar resposta', action: 'regenerate' },
  { keys: ['⌘', '?'], description: 'Mostrar atalhos', action: 'openShortcuts' },
  { keys: ['⌘', 'Shift', 'E'], description: 'Exportar conversa', action: 'export' },
];

export function KeyboardShortcutsDialog({ open, onOpenChange, isDarkMode }: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-popover border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Atalhos de teclado
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2 mt-4">
          {SHORTCUTS.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
            >
              <span className="text-secondary-foreground">
                {shortcut.description}
              </span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <kbd
                    key={keyIndex}
                    className="px-2 py-1 text-xs font-mono rounded bg-card text-secondary-foreground border border-border"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-xs mt-4 text-muted-foreground">
          Use ⌘ no Mac ou Ctrl no Windows/Linux
        </p>
      </DialogContent>
    </Dialog>
  );
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers, enabled: boolean = true) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    const target = e.target as HTMLElement | null;
    const isTyping =
      !!target &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

    const isMac = navigator.platform.includes('Mac');
    const cmdKey = isMac ? e.metaKey : e.ctrlKey;
    const key = e.key.toLowerCase();

    if (isTyping && !(cmdKey && key === 'k') && key !== 'escape') return;

    if (cmdKey && key === 'k') {
      e.preventDefault();
      handlers.newChat?.();
    }
    else if (cmdKey && e.shiftKey && key === 'c') {
      e.preventDefault();
      handlers.copyResponse?.();
    }
    else if (cmdKey && e.shiftKey && key === 's') {
      e.preventDefault();
      handlers.toggleSidebar?.();
    }
    else if (cmdKey && e.shiftKey && key === 'd') {
      e.preventDefault();
      handlers.toggleTheme?.();
    }
    else if (key === 'escape') {
      handlers.cancelStreaming?.();
    }
    else if (cmdKey && key === 'r') {
      e.preventDefault();
      handlers.regenerate?.();
    }
    else if (cmdKey && (e.key === '?' || (e.shiftKey && key === '/'))) {
      e.preventDefault();
      handlers.openShortcuts?.();
    }
    else if (cmdKey && e.shiftKey && key === 'e') {
      e.preventDefault();
      handlers.export?.();
    }
  }, [handlers, enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
