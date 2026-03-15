/**
 * GlobalMessageBanner — iOS-style banner that slides down when a new DM arrives
 * while the user is NOT in the messages view or is viewing a different conversation.
 * Auto-dismisses after 5 seconds.
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface IncomingMessageData {
  id: string;
  senderName: string;
  senderAvatar?: string;
  senderInitials: string;
  preview: string;
  conversationId: string;
  timestamp: string;
}

interface Props {
  message: IncomingMessageData | null;
  onTap: (conversationId: string) => void;
  onDismiss: () => void;
}

export function GlobalMessageBanner({ message, onTap, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [message, onDismiss]);

  const handleTap = () => {
    if (message) {
      setVisible(false);
      onTap(message.conversationId);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <AnimatePresence>
      {visible && message && (
        <motion.div
          key={message.id}
          initial={{ y: -80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-3 inset-x-0 mx-auto z-[280] w-[calc(100%-24px)] max-w-sm cursor-pointer"
          onClick={handleTap}
        >
          <div
            className="rounded-2xl px-4 py-3 shadow-2xl border flex items-start gap-3"
            style={{
              backgroundColor: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
              boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Sender avatar */}
            <Avatar className="h-10 w-10 shrink-0">
              {message.senderAvatar && <AvatarImage src={message.senderAvatar} />}
              <AvatarFallback
                className="text-xs font-bold"
                style={{ backgroundColor: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))' }}
              >
                {message.senderInitials}
              </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-3 w-3 shrink-0" style={{ color: 'hsl(142 76% 36%)' }} />
                <p className="text-xs font-semibold text-foreground truncate">{message.senderName}</p>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{message.preview}</p>
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90"
              style={{
                backgroundColor: 'hsl(var(--muted))',
                color: 'hsl(var(--muted-foreground))',
              }}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
