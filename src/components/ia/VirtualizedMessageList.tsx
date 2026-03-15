import { memo, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { motion } from 'framer-motion';
import { Bot, Pencil, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

// Types
interface UploadedFile {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

interface PendingAction {
  id: string;
  type: string;
  data: Record<string, any>;
  confirmed?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  pendingActions?: PendingAction[];
  responseTime?: number;
  tokenCount?: number;
  feedback?: 'like' | 'dislike';
  attachments?: UploadedFile[];
}

interface VirtualizedMessageListProps {
  messages: Message[];
  isStreaming: boolean;
  displayStatus: string | null;
  editingMessageIndex: number | null;
  isDarkMode: boolean;
  activeConversationId: string | null;
  processingActionId: string | null;
  onEdit: (index: number) => void;
  onEditSave: (index: number, content: string) => void;
  onEditCancel: () => void;
  onRegenerate: (index: number) => void;
  onFeedback: (index: number, type: 'like' | 'dislike') => void;
  onConfirmAction: (messageId: string, action: PendingAction) => void;
  onRejectAction: (messageId: string, actionId: string) => void;
  renderMessageContent: (message: Message, index: number, cleanContent: string, downloadLinks: any[]) => React.ReactNode;
}

export interface VirtualizedMessageListHandle {
  scrollToBottom: (behavior?: 'auto' | 'smooth') => void;
  isAtBottom: () => boolean;
}

// Memoized message row component
const MessageRow = memo(function MessageRow({
  message,
  index,
  isStreaming,
  isLastMessage,
  editingMessageIndex,
  onEdit,
  renderContent,
}: {
  message: Message;
  index: number;
  isStreaming: boolean;
  isLastMessage: boolean;
  editingMessageIndex: number | null;
  onEdit: (index: number) => void;
  renderContent: () => React.ReactNode;
}) {
  return (
    <div className="mb-6 group">
      {message.role === 'user' ? (
        <div className="flex justify-end">
          {editingMessageIndex === index ? (
            <div className="max-w-[85%] w-full">
              {renderContent()}
            </div>
          ) : (
            <div className="relative max-w-[85%]">
              <div className="rounded-2xl px-4 py-3 bg-muted">
                <p className="text-[15px] whitespace-pre-wrap text-foreground">
                  {message.content}
                </p>
              </div>
              <button
                onClick={() => onEdit(index)}
                className="absolute -left-10 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-3">
          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
            <Bot className="h-4 w-4 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      )}
    </div>
  );
});

export const VirtualizedMessageList = forwardRef<VirtualizedMessageListHandle, VirtualizedMessageListProps>(
  function VirtualizedMessageList(props, ref) {
    const {
      messages,
      isStreaming,
      displayStatus,
      editingMessageIndex,
      isDarkMode,
      activeConversationId,
      processingActionId,
      onEdit,
      onEditSave,
      onEditCancel,
      onRegenerate,
      onFeedback,
      onConfirmAction,
      onRejectAction,
      renderMessageContent,
    } = props;

    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const isAtBottomRef = useRef(true);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      scrollToBottom: (behavior: 'auto' | 'smooth' = 'smooth') => {
        virtuosoRef.current?.scrollToIndex({
          index: messages.length - 1,
          behavior,
          align: 'end',
        });
      },
      isAtBottom: () => isAtBottomRef.current,
    }));

    // Auto-scroll when new messages arrive (if at bottom)
    useEffect(() => {
      if (isAtBottomRef.current && messages.length > 0) {
        virtuosoRef.current?.scrollToIndex({
          index: messages.length - 1,
          behavior: 'smooth',
          align: 'end',
        });
      }
    }, [messages.length, isStreaming]);

    const handleAtBottomStateChange = useCallback((atBottom: boolean) => {
      isAtBottomRef.current = atBottom;
    }, []);

    const itemContent = useCallback((index: number, message: Message) => {
      return (
        <MessageRow
          key={message.id}
          message={message}
          index={index}
          isStreaming={isStreaming}
          isLastMessage={index === messages.length - 1}
          editingMessageIndex={editingMessageIndex}
          onEdit={onEdit}
          renderContent={() => renderMessageContent(message, index, message.content, [])}
        />
      );
    }, [messages.length, isStreaming, editingMessageIndex, onEdit, renderMessageContent]);

    // Footer component for status indicator
    const Footer = useCallback(() => {
      if (!displayStatus) return null;
      
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex gap-3 mb-6"
        >
          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
            <Loader2 className="h-4 w-4 animate-spin text-foreground" />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
            <span className="text-sm text-muted-foreground">{displayStatus}</span>
          </div>
        </motion.div>
      );
    }, [displayStatus]);

    return (
      <Virtuoso
        ref={virtuosoRef}
        data={messages}
        itemContent={itemContent}
        atBottomStateChange={handleAtBottomStateChange}
        followOutput="smooth"
        alignToBottom
        increaseViewportBy={{ top: 200, bottom: 200 }}
        components={{
          Footer,
        }}
        className="h-full"
        style={{ height: '100%' }}
      />
    );
  }
);

export default VirtualizedMessageList;
