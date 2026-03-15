import { X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface BatchActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete: () => void;
}

export function BatchActionsBar({ 
  selectedCount, 
  onClearSelection, 
  onDelete 
}: BatchActionsBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-3 bg-background border rounded-full shadow-lg px-4 py-2">
            <span className="text-sm font-medium">
              {selectedCount} {selectedCount === 1 ? 'documento selecionado' : 'documentos selecionados'}
            </span>
            
            <div className="h-4 w-px bg-border" />
            
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClearSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
