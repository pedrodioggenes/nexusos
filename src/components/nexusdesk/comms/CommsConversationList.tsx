import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Check, CheckCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { DMConversation } from "@/hooks/useHWDMs";
import type { TeamMember } from "@/hooks/useHWMembers";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

interface Props {
  conversations: DMConversation[];
  isLoading: boolean;
  activeId: string | null;
  isOnline: (userId: string) => boolean;
  members: TeamMember[];
  currentUserId?: string;
  onSelect: (id: string) => void;
  onNewConversation: (userId: string) => void;
}

export function CommsConversationList({ conversations, isLoading, activeId, isOnline, members, currentUserId, onSelect, onNewConversation }: Props) {
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newSearch, setNewSearch] = useState("");

  const filtered = conversations.filter(c =>
    !search || c.other_user_name.toLowerCase().includes(search.toLowerCase())
  );

  const existingIds = new Set(conversations.map(c => c.other_user_id));
  if (currentUserId) existingIds.add(currentUserId);
  const availableMembers = members.filter(m => !existingIds.has(m.user_id) && (!newSearch || m.full_name.toLowerCase().includes(newSearch.toLowerCase())));

  return (
    <>
      <div className="px-3 py-2.5 space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar conversa..."
              className="pl-8 h-8 text-xs rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground" />
          </div>
          <Button size="icon" className="h-8 w-8 shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setShowNew(true)}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "hsl(var(--muted))" }}>
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              {search ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </p>
            <p className="text-[10px] text-muted-foreground/50 mt-1">
              {!search && 'Clique em + para iniciar'}
            </p>
          </div>
        ) : (
          <div className="px-1.5 space-y-0.5">
            {filtered.map(conv => {
              const online = conv.other_user_id ? isOnline(conv.other_user_id) : false;
              const isActive = conv.id === activeId;
              return (
                <motion.button
                  key={conv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => onSelect(conv.id)}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl transition-all text-left relative overflow-hidden"
                  style={{
                    backgroundColor: isActive ? "hsl(var(--muted))" : "transparent",
                  }}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full" style={{ backgroundColor: "hsl(var(--primary))" }} />
                  )}

                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10">
                      {conv.other_user_avatar && <AvatarImage src={conv.other_user_avatar} />}
                      <AvatarFallback className="text-[10px] font-semibold" style={{ backgroundColor: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
                        {conv.other_user_initials}
                      </AvatarFallback>
                    </Avatar>
                    {online && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2"
                        style={{ backgroundColor: "hsl(var(--success))", borderColor: isActive ? "hsl(var(--muted))" : "hsl(var(--background))" }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold truncate text-foreground">{conv.other_user_name}</p>
                      <span className="text-[9px] shrink-0 ml-1 text-muted-foreground">
                        {timeAgo(conv.last_message_at || conv.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {conv.last_message_is_mine && (
                        conv.last_message_status === 'sent' ? (
                          <Check className="h-2.5 w-2.5 shrink-0" style={{ color: "hsl(var(--muted-foreground))" }} />
                        ) : (
                          <CheckCheck className="h-2.5 w-2.5 shrink-0" style={{ color: conv.last_message_status === 'read' ? "hsl(210 80% 60%)" : "hsl(var(--muted-foreground))" }} />
                        )
                      )}
                      <p className="text-[11px] truncate text-muted-foreground">
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

      {/* New conversation dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="sm:max-w-md" style={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <DialogHeader>
            <DialogTitle className="text-foreground">Nova Conversa</DialogTitle>
          </DialogHeader>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={newSearch} onChange={e => setNewSearch(e.target.value)}
              placeholder="Buscar colega..."
              className="pl-9 rounded-xl bg-background border-border text-foreground" />
          </div>
          <div className="max-h-[300px] overflow-y-auto space-y-0.5">
            {availableMembers.map(m => (
              <button key={m.user_id}
                onClick={() => { onNewConversation(m.user_id); setShowNew(false); }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors text-foreground"
                style={{ backgroundColor: "transparent" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "hsl(var(--muted))")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs font-semibold" style={{ backgroundColor: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
                    {m.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium truncate">{m.full_name}</p>
                  <p className="text-[10px] truncate text-muted-foreground">{m.department_role || 'Colaborador'}</p>
                </div>
              </button>
            ))}
            {availableMembers.length === 0 && (
              <p className="text-center text-xs py-6 text-muted-foreground">Nenhum contato disponível</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
