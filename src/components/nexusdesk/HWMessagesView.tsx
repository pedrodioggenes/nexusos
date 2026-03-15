import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHWDMConversations } from "@/hooks/useHWDMs";
import { useHWPresence } from "@/hooks/useHWPresence";
import { useHWProfile, canMessageAnyone } from "@/hooks/useHWProfile";
import { useHWMembers, type TeamMember } from "@/hooks/useHWMembers";
import { DirectMessagesView } from "./DirectMessagesView";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, ArrowLeft, Check, CheckCheck, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function NewConversationDialog({
  open,
  onOpenChange,
  members,
  onSelect,
  existingIds,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  members: TeamMember[];
  onSelect: (userId: string) => void;
  existingIds: Set<string>;
}) {
  const [q, setQ] = useState("");
  const { profile } = useHWProfile();
  const canAll = canMessageAnyone(profile);

  const filtered = members.filter(m => {
    if (existingIds.has(m.user_id)) return false;
    if (q && !m.full_name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-festval-graphite border-festval-border">
        <DialogHeader>
          <DialogTitle className="text-festval-ivory">Nova Conversa</DialogTitle>
        </DialogHeader>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'hsl(var(--festval-stone-muted))' }} />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar colega..."
            className="pl-9" style={{ backgroundColor: 'hsl(var(--festval-border))', borderColor: 'hsl(var(--festval-surface-elevated))', color: 'hsl(var(--festval-ivory))' }} />
        </div>
        {!canAll && (
          <p className="text-[10px] mb-2 px-1 text-festval-stone">
            Você pode conversar com membros da sua equipe e chefes.
          </p>
        )}
        <div className="max-h-[300px] overflow-y-auto space-y-0.5">
          {filtered.map(m => (
            <button key={m.user_id} onClick={() => { onSelect(m.user_id); onOpenChange(false); }}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors hover:bg-zinc-800/50 text-festval-ivory">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs font-semibold" style={{ backgroundColor: 'hsl(var(--festval-border))', color: 'hsl(var(--festval-stone))' }}>
                  {m.initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-left min-w-0">
                <p className="text-sm font-medium truncate">{m.full_name}</p>
                <p className="text-[10px] truncate text-festval-stone">{m.department_role || 'Colaborador'}</p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-xs py-6" style={{ color: 'hsl(var(--festval-stone-muted))' }}>Nenhum contato encontrado</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function HWMessagesView() {
  const { user } = useAuth();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const { conversations, isLoading, startConversation } = useHWDMConversations();
  const { isOnline } = useHWPresence();
  const { members } = useHWMembers();

  const filtered = conversations.filter(c =>
    !searchQuery || c.other_user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const existingContactIds = new Set(conversations.map(c => c.other_user_id));
  if (user?.id) existingContactIds.add(user.id);

  const handleNewConversation = async (userId: string) => {
    try {
      const convId = await startConversation.mutateAsync(userId);
      setActiveConversation(convId);
    } catch {
      toast.error("Erro ao iniciar conversa");
    }
  };

  if (activeConversation) {
    return (
      <div className="h-full flex flex-col">
        <div className="h-12 flex items-center gap-2 px-3 shrink-0" style={{ borderBottom: '1px solid hsl(var(--festval-border))' }}>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-zinc-800 text-festval-stone"
            onClick={() => setActiveConversation(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {(() => {
            const conv = conversations.find(c => c.id === activeConversation);
            return conv ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-[10px] font-semibold" style={{ backgroundColor: 'hsl(var(--festval-border))', color: 'hsl(var(--festval-stone))' }}>
                      {conv.other_user_initials}
                    </AvatarFallback>
                  </Avatar>
                  {conv.other_user_id && isOnline(conv.other_user_id) && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2" style={{ backgroundColor: '#22C55E', borderColor: 'hsl(var(--festval-charcoal))' }} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-festval-ivory">{conv.other_user_name}</p>
                  <p className="text-[10px] text-festval-stone">
                    {conv.other_user_id && isOnline(conv.other_user_id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            ) : null;
          })()}
        </div>
        <div className="flex-1 overflow-hidden">
          <DirectMessagesView userId={activeConversation} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'hsl(var(--festval-stone-muted))' }} />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar conversa..." className="pl-9"
              style={{ backgroundColor: 'hsl(var(--festval-border))', borderColor: 'hsl(var(--festval-surface-elevated))', color: 'hsl(var(--festval-ivory))' }} />
          </div>
          <Button className="shrink-0 rounded-lg bg-festval-copper text-white"
            onClick={() => setShowNewDialog(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'hsl(var(--festval-stone-muted))' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: 'hsl(var(--festval-stone-muted))' }}>
              {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'hsl(var(--festval-border))' }}>
              Toque no + para iniciar uma conversa
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filtered.map((conv) => {
              const online = conv.other_user_id ? isOnline(conv.other_user_id) : false;
              const lastTime = conv.last_message_at ? timeAgo(conv.last_message_at) : timeAgo(conv.created_at);
              return (
                <motion.button key={conv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={() => setActiveConversation(conv.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-zinc-800/50 text-left bg-festval-graphite">
                  <div className="relative">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="text-sm font-semibold" style={{ backgroundColor: 'hsl(var(--festval-border))', color: 'hsl(var(--festval-stone))' }}>
                        {conv.other_user_initials}
                      </AvatarFallback>
                    </Avatar>
                    {online && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2" style={{ backgroundColor: '#22C55E', borderColor: 'hsl(var(--festval-graphite))' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate text-festval-ivory">{conv.other_user_name}</p>
                      <span className="text-[10px] shrink-0 ml-2" style={{ color: 'hsl(var(--festval-stone-muted))' }}>{lastTime}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {conv.last_message_is_mine && (
                        conv.last_message_status === 'sent' ? (
                          <Check className="h-3 w-3 shrink-0" style={{ color: 'hsl(var(--festval-stone-muted))' }} />
                        ) : (
                          <CheckCheck className="h-3 w-3 shrink-0" style={{ color: conv.last_message_status === 'read' ? '#3B82F6' : 'hsl(var(--festval-stone-muted))' }} />
                        )
                      )}
                      <p className="text-xs truncate text-festval-stone">
                        {conv.last_message || 'Início da conversa'}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      <NewConversationDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        members={members}
        onSelect={handleNewConversation}
        existingIds={existingContactIds}
      />
    </div>
  );
}
