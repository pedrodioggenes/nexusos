import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { useHWDMMessages, type MessageStatus, type DMAttachment } from "@/hooks/useHWDMs";
import { useHWTyping, type PresenceActivity } from "@/hooks/useHWTyping";
import { useAuth } from "@/contexts/AuthContext";
import { useHWUserDisplay } from "@/hooks/useHWUserDisplay";
import { Loader2, Check, CheckCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { DMAttachmentPicker, AttachmentPreviewBar, MessageAttachments } from "./DMAttachmentPicker";
import { VoiceRecorder } from "./VoiceRecorder";

interface DirectMessagesViewProps {
  userId: string;
}

function formatMsgTime(dateStr: string) {
  const d = new Date(dateStr);
  return format(d, "HH:mm");
}

function formatDateSeparator(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return "Hoje";
  if (isYesterday(d)) return "Ontem";
  return format(d, "d 'de' MMMM", { locale: ptBR });
}

/** WhatsApp-style message status icon */
function MessageStatusIcon({ status }: { status?: MessageStatus }) {
  if (!status) return null;

  switch (status) {
    case 'sending':
      return <Check className="h-3 w-3" style={{ color: "hsl(var(--muted-foreground) / 0.3)" }} />;
    case 'sent':
      return <Check className="h-3 w-3" style={{ color: "hsl(var(--muted-foreground) / 0.5)" }} />;
    case 'delivered':
      return <CheckCheck className="h-3 w-3" style={{ color: "hsl(var(--muted-foreground) / 0.5)" }} />;
    case 'read':
      return <CheckCheck className="h-3 w-3" style={{ color: "hsl(210 80% 60%)" }} />;
    default:
      return null;
  }
}

/** Activity indicator bubble — supports typing and recording audio */
function ActivityBubble({ userName, activity }: { userName: string; activity: PresenceActivity }) {
  const isRecording = activity === 'recording_audio';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      className="flex justify-start mt-2"
    >
      <div className="w-8 shrink-0 mr-2" />
      <div className="flex flex-col items-start">
        <p className="text-[10px] font-semibold mb-0.5 ml-2.5" style={{ color: "hsl(var(--primary))" }}>
          {userName}
        </p>
        <div
          className="px-3 py-2.5 flex items-center gap-1.5"
          style={{
            backgroundColor: "hsl(var(--card))",
            border: `1px solid ${isRecording ? "hsl(var(--destructive) / 0.2)" : "hsl(var(--border))"}`,
            borderRadius: "14px 14px 14px 4px",
          }}
        >
          {isRecording ? (
            /* Recording audio — mic icon + sound wave bars */
            <>
              <motion.div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: "hsl(var(--destructive))" }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <div className="flex items-end gap-[2px] h-4">
                {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 0.3].map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-[3px] rounded-full"
                    style={{ backgroundColor: "hsl(var(--destructive) / 0.7)" }}
                    animate={{
                      height: [`${h * 60}%`, `${h * 100}%`, `${h * 40}%`, `${h * 80}%`],
                    }}
                    transition={{
                      duration: 0.8 + i * 0.05,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.08,
                    }}
                  />
                ))}
              </div>
              <span className="text-[10px] ml-0.5" style={{ color: "hsl(var(--destructive) / 0.8)" }}>
                gravando áudio
              </span>
            </>
          ) : (
            /* Typing — classic bouncing dots */
            <>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "hsl(var(--muted-foreground))" }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.1, 0.8],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
              <span className="text-[10px] ml-0.5" style={{ color: "hsl(var(--muted-foreground) / 0.7)" }}>
                digitando
              </span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface GroupedMsg {
  id: string;
  content: string;
  attachments?: DMAttachment[];
  user_id: string;
  user_name: string;
  user_initials: string;
  user_avatar?: string;
  created_at: string;
  is_mine: boolean;
  is_read: boolean;
  is_optimistic?: boolean;
  status?: MessageStatus;
  reactions: { emoji: string; count: number; hasReacted: boolean }[];
  showAvatar: boolean;
  showName: boolean;
  dateSeparator?: string;
}

export function DirectMessagesView({ userId: conversationId }: DirectMessagesViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { displayName } = useHWUserDisplay();
  const { messages, isLoading, sendMessage, toggleReaction } = useHWDMMessages(conversationId);
  const { typingUsers, onKeystroke, stopTyping, setActivity, stopActivity } = useHWTyping(conversationId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const grouped = useMemo<GroupedMsg[]>(() => {
    const result: GroupedMsg[] = [];
    let lastUserId = "";
    let lastDate = "";

    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      const msgDate = new Date(m.created_at).toDateString();
      let dateSeparator: string | undefined;
      if (msgDate !== lastDate) {
        dateSeparator = formatDateSeparator(m.created_at);
        lastDate = msgDate;
      }

      const sameUser = m.user_id === lastUserId && !dateSeparator;
      const timeDiff = i > 0 ? new Date(m.created_at).getTime() - new Date(messages[i - 1].created_at).getTime() : Infinity;
      const grouped_ = sameUser && timeDiff < 120000;

      result.push({
        id: m.id,
        content: m.content,
        attachments: (Array.isArray(m.attachments) ? m.attachments : typeof m.attachments === 'string' ? JSON.parse(m.attachments) : []) as DMAttachment[],
        user_id: m.user_id,
        user_name: m.user_name,
        user_initials: m.user_initials,
        user_avatar: m.user_avatar,
        created_at: m.created_at,
        is_mine: !!m.is_mine,
        is_read: !!m.is_read,
        is_optimistic: m.is_optimistic,
        status: m.is_optimistic ? 'sending' : m.status,
        reactions: m.reactions || [],
        showAvatar: !grouped_,
        showName: !grouped_ && !m.is_mine,
        dateSeparator,
      });
      lastUserId = m.user_id;
    }
    return result;
  }, [messages]);

  const handleSendMessage = useCallback((content: string, attachments?: DMAttachment[]) => {
    stopActivity();
    sendMessage.mutate({ content, attachments });
  }, [sendMessage, stopActivity]);

  const handleReaction = (messageId: string, emoji: string) => {
    toggleReaction(messageId, emoji);
  };

  const handleKeystroke = useCallback(() => {
    onKeystroke(displayName);
  }, [onKeystroke, displayName]);

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: "hsl(var(--background))" }}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : grouped.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "hsl(var(--muted))" }}>
                <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Inicie uma conversa</p>
              <p className="text-xs mt-1 text-muted-foreground/60">Envie uma mensagem para começar</p>
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            {grouped.map((msg) => (
              <div key={msg.id}>
                {/* Date separator */}
                {msg.dateSeparator && (
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px" style={{ backgroundColor: "hsl(var(--border))" }} />
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
                      {msg.dateSeparator}
                    </span>
                    <div className="flex-1 h-px" style={{ backgroundColor: "hsl(var(--border))" }} />
                  </div>
                )}

                {/* Message bubble */}
                <div className={`flex ${msg.is_mine ? "justify-end" : "justify-start"} ${msg.showAvatar ? "mt-3" : "mt-0.5"}`}>
                  {/* Other user avatar */}
                  {!msg.is_mine && (
                    <div className="w-8 shrink-0 mr-2">
                      {msg.showAvatar ? (
                        <Avatar className="h-7 w-7">
                          {msg.user_avatar && <AvatarImage src={msg.user_avatar} />}
                          <AvatarFallback className="text-[9px] font-semibold" style={{ backgroundColor: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
                            {msg.user_initials}
                          </AvatarFallback>
                        </Avatar>
                      ) : null}
                    </div>
                  )}

                  <div className={`max-w-[75%] min-w-[80px] ${msg.is_mine ? "items-end" : "items-start"}`}>
                    {/* Name */}
                    {msg.showName && (
                      <p className="text-[10px] font-semibold mb-0.5 ml-2.5" style={{ color: "hsl(var(--primary))" }}>
                        {msg.user_name}
                      </p>
                    )}

                    {/* Bubble */}
                    <div
                      className={`relative px-3 py-2 text-sm leading-relaxed break-words ${msg.is_optimistic ? 'opacity-70' : ''}`}
                      style={{
                        backgroundColor: msg.is_mine
                          ? "hsl(var(--primary) / 0.15)"
                          : "hsl(var(--card))",
                        borderRadius: msg.is_mine
                          ? msg.showAvatar ? "14px 14px 4px 14px" : "14px 4px 4px 14px"
                          : msg.showAvatar ? "14px 14px 14px 4px" : "4px 14px 14px 4px",
                        color: "hsl(var(--foreground))",
                        border: msg.is_mine
                          ? "1px solid hsl(var(--primary) / 0.25)"
                          : "1px solid hsl(var(--border))",
                      }}
                    >
                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <MessageAttachments attachments={msg.attachments as DMAttachment[]} isMine={!!msg.is_mine} />
                      )}
                      {/* Hide text for voice messages (only show player) */}
                      {!(msg.attachments?.some((a: DMAttachment) => a.type?.startsWith("audio/"))) && (
                        <span>{msg.content}</span>
                      )}
                      {/* Inline time + receipt */}
                      <span className="float-right ml-3 mt-1.5 flex items-center gap-0.5 select-none">
                        <span className="text-[9px]" style={{ color: "hsl(var(--muted-foreground) / 0.6)" }}>
                          {formatMsgTime(msg.created_at)}
                        </span>
                        {msg.is_mine && <MessageStatusIcon status={msg.status} />}
                      </span>
                    </div>

                    {/* Reactions */}
                    {msg.reactions.length > 0 && (
                      <div className={`flex items-center gap-1 mt-0.5 ${msg.is_mine ? "justify-end mr-1" : "ml-1"}`}>
                        {msg.reactions.map((r) => (
                          <button
                            key={r.emoji}
                            onClick={() => handleReaction(msg.id, r.emoji)}
                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] transition-colors"
                            style={{
                              backgroundColor: r.hasReacted ? "hsl(var(--primary) / 0.15)" : "hsl(var(--muted))",
                              border: r.hasReacted ? "1px solid hsl(var(--primary) / 0.3)" : "1px solid transparent",
                              color: "hsl(var(--muted-foreground))",
                            }}
                          >
                            <span>{r.emoji}</span>
                            <span className="font-medium">{r.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Activity indicator */}
            <AnimatePresence>
              {typingUsers.map((tu) => (
                <ActivityBubble key={tu.user_id} userName={tu.user_name} activity={tu.activity} />
              ))}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <DMComposer onSend={handleSendMessage} onKeystroke={handleKeystroke} setActivity={setActivity} stopActivity={stopActivity} displayName={displayName} />
    </div>
  );
}

/** Simplified composer for DMs — with file attachment and voice support */
function DMComposer({ onSend, onKeystroke, setActivity, stopActivity, displayName }: {
  onSend: (content: string, attachments?: DMAttachment[]) => void;
  onKeystroke: () => void;
  setActivity: (activity: PresenceActivity, userName: string) => void;
  stopActivity: () => void;
  displayName: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<DMAttachment[]>([]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
    }
  }, [content]);

  const handleSend = () => {
    if (!content.trim() && !pendingAttachments.length) return;
    onSend(content.trim(), pendingAttachments.length > 0 ? pendingAttachments : undefined);
    setContent("");
    setPendingAttachments([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (e.target.value.trim()) {
      onKeystroke();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttach = (newAttachments: DMAttachment[]) => {
    setPendingAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const canSend = content.trim() || pendingAttachments.length > 0;

  return (
    <div className="px-3 pb-3 pt-1">
      {/* Attachment previews */}
      <AttachmentPreviewBar attachments={pendingAttachments} onRemove={handleRemoveAttachment} />

      <div
        className="flex items-end gap-2 rounded-2xl px-3 py-2 transition-all"
        style={{
          backgroundColor: "hsl(var(--card))",
          border: `1px solid ${isFocused ? "hsl(var(--primary) / 0.5)" : "hsl(var(--border))"}`,
        }}
      >
        {/* Attachment picker */}
        <DMAttachmentPicker onAttach={handleAttach} />

        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Mensagem..."
          rows={1}
          className="flex-1 resize-none bg-transparent outline-none text-sm"
          style={{ color: "hsl(var(--foreground))", minHeight: "24px", maxHeight: "140px" }}
        />

        {/* Show voice recorder when input is empty, send button when there's content */}
        {canSend ? (
          <button
            onClick={handleSend}
            className="shrink-0 h-8 w-8 rounded-xl flex items-center justify-center transition-colors"
            style={{
              backgroundColor: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
            }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        ) : (
          <VoiceRecorder onSend={onSend} onRecordingStart={() => setActivity('recording_audio', displayName)} onRecordingStop={stopActivity} />
        )}
      </div>
    </div>
  );
}
