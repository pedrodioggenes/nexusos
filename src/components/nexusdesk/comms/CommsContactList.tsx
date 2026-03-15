import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, MessageCircle } from "lucide-react";
import type { TeamMember } from "@/hooks/useHWMembers";

interface Props {
  members: TeamMember[];
  isOnline: (userId: string) => boolean;
  onStartConversation: (userId: string) => void;
}

export function CommsContactList({ members, isOnline, onStartConversation }: Props) {
  const [search, setSearch] = useState("");

  const filtered = members.filter(m =>
    !search || m.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const online = filtered.filter(m => isOnline(m.user_id));
  const offline = filtered.filter(m => !isOnline(m.user_id));

  const renderGroup = (title: string, list: TeamMember[], showStatus: boolean) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider px-3 mb-2 text-muted-foreground">
          {title} — {list.length}
        </p>
        <div className="space-y-0.5 px-1.5">
          {list.map(m => (
            <button
              key={m.user_id}
              onClick={() => onStartConversation(m.user_id)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors text-left group"
              style={{ backgroundColor: "transparent" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "hsl(var(--muted))")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <div className="relative shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-[10px] font-semibold" style={{ backgroundColor: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
                    {m.initials}
                  </AvatarFallback>
                </Avatar>
                {showStatus && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2"
                    style={{ backgroundColor: "hsl(var(--success))", borderColor: "hsl(var(--background))" }} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate text-foreground">{m.full_name}</p>
                <p className="text-[10px] truncate text-muted-foreground">{m.department_role || 'Colaborador'}</p>
              </div>
              <MessageCircle className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-3 py-2.5">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar contato..."
            className="pl-8 h-8 text-xs rounded-xl bg-card border-border text-foreground placeholder:text-muted-foreground" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {renderGroup("Online", online, true)}
        {renderGroup("Offline", offline, false)}
        {filtered.length === 0 && (
          <div className="text-center py-10">
            <Search className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Nenhum contato encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
