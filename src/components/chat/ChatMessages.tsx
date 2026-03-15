import { memo, useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { ArrowDown, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChatMessage } from './types';
import { MessageItem } from './MessageItem';
import type { PendingAction } from './types';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  isLoading: boolean;
  displayStatus?: string | null;
  onRegenerate: (index: number) => void;
  onEdit: (index: number) => void;
  onFeedback: (index: number, type: 'like' | 'dislike') => void;
  onConfirmAction?: (messageId: string, action: PendingAction) => void;
  onRejectAction?: (messageId: string, actionId: string) => void;
  processingActionId?: string | null;
}

const messageVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.15 }
  }
};

export const ChatMessages = memo(function ChatMessages({
  messages,
  isStreaming,
  isLoading,
  displayStatus,
  onRegenerate,
  onEdit,
  onFeedback,
  onConfirmAction,
  onRejectAction,
  processingActionId,
}: ChatMessagesProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  // Check scroll position
  const handleScroll = useCallback(() => {
    const container = listRef.current;
    if (!container) return;
    
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const isNearBottom = distanceFromBottom < 150;
    
    setShowScrollButton(!isNearBottom && messages.length > 0);
    setIsAutoScrolling(isNearBottom);
  }, [messages.length]);

  // Scroll to bottom function
  const scrollToBottom = useCallback((smooth = true) => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
    }
  }, []);

  // Auto-scroll when new messages arrive or during streaming
  useEffect(() => {
    if (isAutoScrolling) {
      scrollToBottom(false);
    }
  }, [messages, isStreaming, displayStatus, isAutoScrolling, scrollToBottom]);

  // Initial scroll
  useEffect(() => {
    scrollToBottom(false);
  }, [scrollToBottom]);

  return (
    <div 
      ref={listRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto relative"
    >
      {/* Top fade removed for Claude-style clean look */}
      
      <div className="max-w-3xl mx-auto w-full px-4 py-10">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <MessageItem
                message={message}
                index={index}
                isStreaming={isStreaming}
                displayStatus={displayStatus}
                isLastMessage={index === messages.length - 1}
                onRegenerate={message.role === 'assistant' ? () => onRegenerate(index) : undefined}
                onEdit={message.role === 'user' ? () => onEdit(index) : undefined}
                onFeedback={message.role === 'assistant' ? (type) => onFeedback(index, type) : undefined}
                onConfirmAction={onConfirmAction ? (action) => onConfirmAction(message.id, action) : undefined}
                onRejectAction={onRejectAction ? (actionId) => onRejectAction(message.id, actionId) : undefined}
                isProcessingAction={processingActionId !== null}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Status indicator with glass effect */}
        <AnimatePresence>
          {displayStatus && !isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3 mb-6"
            >
              <div className="h-9 w-9 rounded-xl bg-white/[0.06] backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/10">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-sm border border-white/5">
                <span className="text-sm text-muted-foreground">{displayStatus}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Loading dots with premium animation */}
        {isLoading && !displayStatus && messages.length > 0 && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex gap-3 mb-6">
            <div className="h-9 w-9 rounded-xl bg-white/[0.06] backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/10">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center gap-2 py-2">
              {[0, 1, 2].map((i) => (
                <motion.span 
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary/60"
                  animate={{ 
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1, 0.8]
                  }}
                  transition={{ 
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </div>
        )}
        
        <div ref={endRef} className="h-4" />
      </div>

      {/* Scroll to bottom FAB with glass effect */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
          >
            <Button
              onClick={() => {
                setIsAutoScrolling(true);
                scrollToBottom(true);
              }}
              size="sm"
              className={cn(
                "rounded-full gap-2 px-4",
                "bg-white/[0.08] hover:bg-white/[0.12]",
                "backdrop-blur-xl border border-white/10",
                "text-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
                "transition-all duration-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
              )}
            >
              <ArrowDown className="h-4 w-4" />
              Ir para o final
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default ChatMessages;
