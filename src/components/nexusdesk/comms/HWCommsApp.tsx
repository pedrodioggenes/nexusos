import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHWDMConversations } from "@/hooks/useHWDMs";
import { useHWPresence } from "@/hooks/useHWPresence";
import { useHWMembers } from "@/hooks/useHWMembers";
import { useGlobalCalling, type CallType } from "@/contexts/HWCallingContext";
import { CommsConversationList } from "./CommsConversationList";
import { CommsConversationPanel } from "./CommsConversationPanel";
import { CommsContactList } from "./CommsContactList";
import { CommsCallHistory } from "./CommsCallHistory";
import { CommsActiveCall } from "./CommsActiveCall";
import { GlobalIncomingCallBanner } from "./GlobalIncomingCallBanner";
import { MessageSquare, Users, Phone } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";

type CommsTab = "conversations" | "contacts" | "calls";

interface HWCommsAppProps {
  chatTargetUserId?: string;
  onChatTargetConsumed?: () => void;
}

export function HWCommsApp({ chatTargetUserId, onChatTargetConsumed }: HWCommsAppProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<CommsTab>("conversations");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const { conversations, isLoading, startConversation } = useHWDMConversations();
  const { isOnline } = useHWPresence();
  const { members } = useHWMembers();
  const calling = useGlobalCalling();

  useEffect(() => {
    if (!chatTargetUserId || !user?.id) return;
    const existing = conversations.find(c => c.other_user_id === chatTargetUserId);
    if (existing) {
      setActiveConversationId(existing.id);
      setActiveTab("conversations");
      onChatTargetConsumed?.();
    } else if (!startConversation.isPending) {
      startConversation.mutateAsync(chatTargetUserId).then(convId => {
        setActiveConversationId(convId);
        setActiveTab("conversations");
        onChatTargetConsumed?.();
      }).catch(() => toast.error("Erro ao iniciar conversa"));
    }
  }, [chatTargetUserId, conversations, user?.id]);

  const handleStartConversation = async (userId: string) => {
    try {
      const convId = await startConversation.mutateAsync(userId);
      setActiveConversationId(convId);
      setActiveTab("conversations");
    } catch {
      toast.error("Erro ao iniciar conversa");
    }
  };

  const handleStartCall = async (userId: string, type: CallType) => {
    try {
      await calling.startCall([userId], type);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao iniciar chamada");
    }
  };

  const activeConv = conversations.find(c => c.id === activeConversationId);

  // Get other user info for active call
  const getCallOtherUser = () => {
    if (calling.incomingCall) {
      return { name: calling.incomingCall.callerName, avatar: calling.incomingCall.callerAvatar };
    }
    // For outgoing calls, find the conversation or member info
    if (activeConv) {
      return { name: activeConv.other_user_name, avatar: activeConv.other_user_avatar || undefined };
    }
    return { name: 'Chamada', avatar: undefined };
  };

  const tabs: { key: CommsTab; label: string; icon: typeof MessageSquare }[] = [
    { key: "conversations", label: "Conversas", icon: MessageSquare },
    { key: "contacts", label: "Contatos", icon: Users },
    { key: "calls", label: "Chamadas", icon: Phone },
  ];

  const isInCall = calling.callStatus === 'calling' || calling.callStatus === 'active';
  const callOtherUser = getCallOtherUser();

  return (
    <div className="h-full flex flex-col relative">
      {/* Active call view replaces content */}
      {isInCall ? (
        <CommsActiveCall
          callStatus={calling.callStatus}
          callType={calling.callType}
          localStream={calling.localStream}
          remoteStreams={calling.remoteStreams}
          isMuted={calling.isMuted}
          isVideoOff={calling.isVideoOff}
          otherUserName={callOtherUser.name}
          otherUserAvatar={callOtherUser.avatar}
          onToggleMute={calling.toggleMute}
          onToggleVideo={calling.toggleVideo}
          onEndCall={calling.endCall}
        />
      ) : (
        <>
          {/* Tab bar */}
          <div className="flex items-center gap-1 px-3 py-2 shrink-0" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            {tabs.map(t => {
              const Icon = t.icon;
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? "hsl(var(--muted))" : "transparent",
                    color: isActive ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {activeTab === "calls" ? (
              <CommsCallHistory onStartCall={handleStartCall} />
            ) : activeTab === "contacts" ? (
              <CommsContactList
                members={members.filter(m => m.user_id !== user?.id)}
                isOnline={isOnline}
                onStartConversation={handleStartConversation}
              />
            ) : (
              <>
                {/* Sidebar */}
                <div
                  className={`shrink-0 overflow-hidden flex flex-col transition-all ${activeConversationId ? 'hidden lg:flex' : 'flex w-full'}`}
                  style={{
                    width: activeConversationId ? 300 : undefined,
                    maxWidth: activeConversationId ? 300 : undefined,
                    borderRight: activeConversationId ? "1px solid hsl(var(--border))" : undefined,
                  }}
                >
                  <CommsConversationList
                    conversations={conversations}
                    isLoading={isLoading}
                    activeId={activeConversationId}
                    isOnline={isOnline}
                    members={members}
                    currentUserId={user?.id}
                    onSelect={setActiveConversationId}
                    onNewConversation={handleStartConversation}
                  />
                </div>

                {/* Chat panel or empty state */}
                {activeConversationId ? (
                  <div className="flex-1 min-w-0">
                    <CommsConversationPanel
                      conversationId={activeConversationId}
                      conversation={activeConv}
                      isOnline={activeConv?.other_user_id ? isOnline(activeConv.other_user_id) : false}
                      onBack={() => setActiveConversationId(null)}
                      onStartCall={handleStartCall}
                    />
                  </div>
                ) : (
                  <div className="flex-1 hidden lg:flex items-center justify-center">
                    <div className="text-center px-4">
                      <div className="w-20 h-20 mx-auto mb-5 rounded-3xl flex items-center justify-center" style={{ backgroundColor: "hsl(var(--muted))" }}>
                        <MessageSquare className="h-9 w-9 text-muted-foreground" />
                      </div>
                      <p className="text-base font-semibold text-foreground/70">Suas mensagens</p>
                      <p className="text-xs mt-1.5 text-muted-foreground max-w-[220px] mx-auto">
                        Selecione uma conversa ou inicie uma nova para começar
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
