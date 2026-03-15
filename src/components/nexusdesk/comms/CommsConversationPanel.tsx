import { DirectMessagesView } from "../DirectMessagesView";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { ArrowLeft, Phone, Video, Circle } from "lucide-react";
import { useHWTyping } from "@/hooks/useHWTyping";
import { motion, AnimatePresence } from "framer-motion";
import type { DMConversation } from "@/hooks/useHWDMs";
import type { CallType } from "@/hooks/useHWCalling";

interface Props {
  conversationId: string;
  conversation?: DMConversation;
  isOnline: boolean;
  onBack: () => void;
  onStartCall?: (userId: string, type: CallType) => void;
}

export function CommsConversationPanel({ conversationId, conversation, isOnline, onBack, onStartCall }: Props) {
  const { typingUsers } = useHWTyping(conversationId);
  const activeUser = typingUsers[0];
  const isOtherTyping = !!activeUser;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 shrink-0" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground hover:bg-muted lg:hidden"
          onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {conversation && (
          <>
            <div className="relative">
              <Avatar className="h-9 w-9">
                {conversation.other_user_avatar && <AvatarImage src={conversation.other_user_avatar} />}
                <AvatarFallback className="text-[10px] font-semibold" style={{ backgroundColor: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
                  {conversation.other_user_initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">{conversation.other_user_name}</p>
              <AnimatePresence mode="wait">
                {isOtherTyping ? (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -2 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1"
                  >
                    <span className="text-[10px] font-medium" style={{ color: activeUser?.activity === 'recording_audio' ? "hsl(var(--destructive))" : "hsl(var(--primary))" }}>
                      {activeUser?.activity === 'recording_audio' ? 'gravando áudio' : 'digitando'}
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: activeUser?.activity === 'recording_audio' ? "hsl(var(--destructive))" : "hsl(var(--primary))" }}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="status"
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -2 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1"
                  >
                    <Circle className="h-1.5 w-1.5 fill-current" style={{ color: isOnline ? "hsl(var(--success))" : "hsl(var(--muted-foreground))" }} />
                    <span className="text-[10px] text-muted-foreground">
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <TooltipProvider delayDuration={0}>
              <div className="flex items-center gap-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl"
                      style={{ color: "hsl(var(--muted-foreground))" }}
                      onClick={() => conversation?.other_user_id && onStartCall?.(conversation.other_user_id, 'voice')}>
                      <Phone className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Chamada de voz</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl"
                      style={{ color: "hsl(var(--muted-foreground))" }}
                      onClick={() => conversation?.other_user_id && onStartCall?.(conversation.other_user_id, 'video')}>
                      <Video className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Chamada de vídeo</p></TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </>
        )}
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <DirectMessagesView userId={conversationId} />
      </div>
    </div>
  );
}
