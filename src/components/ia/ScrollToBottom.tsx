import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollToBottomProps {
  visible: boolean;
  onClick: () => void;
  isDarkMode: boolean;
}

export function ScrollToBottom({ visible, onClick, isDarkMode }: ScrollToBottomProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20"
        >
          <Button
            onClick={onClick}
            size="sm"
            className="rounded-full shadow-lg gap-1 bg-card hover:bg-muted text-foreground border border-border"
          >
            <ArrowDown className="h-4 w-4" />
            Rolar para baixo
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
