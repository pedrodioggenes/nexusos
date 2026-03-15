import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  isDarkMode?: boolean;
  status?: string | null;
}

/**
 * Gemini/ChatGPT style thinking indicator
 * Shows contextual status text with animated dots
 */
export function TypingIndicator({ isDarkMode = true, status }: TypingIndicatorProps) {
  // Map status to user-friendly text
  const getStatusText = (status: string | null | undefined): string => {
    if (!status) return 'Pensando';
    
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('consultando') || statusLower.includes('get_')) {
      return 'Consultando dados';
    }
    if (statusLower.includes('gerando') || statusLower.includes('generate_document')) {
      return 'Gerando documento';
    }
    if (statusLower.includes('processando')) {
      return 'Processando';
    }
    if (statusLower.includes('analisando')) {
      return 'Analisando';
    }
    
    // Clean up tool names
    if (status.includes('...')) {
      return status.replace('...', '');
    }
    
    return status;
  };

  const displayText = getStatusText(status);

  return (
    <motion.span 
      className="inline-flex items-center gap-1.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <span className="text-sm text-white/50">
        {displayText}
      </span>
      <span className="inline-flex items-center gap-0.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/40"
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.85, 1, 0.85],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </span>
    </motion.span>
  );
}
