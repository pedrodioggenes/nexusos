import { useState } from "react";
import { useHWMembers } from "@/hooks/useHWMembers";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Search, Shield, UserCheck } from "lucide-react";

interface DelegationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelegate: (directorId: string, directorName: string) => void;
  onClearDelegation: () => void;
  currentDelegateId?: string;
}

export function DelegationDialog({
  open, onOpenChange, onDelegate, onClearDelegation, currentDelegateId,
}: DelegationDialogProps) {
  const { members } = useHWMembers();
  const [q, setQ] = useState("");

  const directors = members.filter(m =>
    m.department_role && ['gestor', 'gestor_marketing', 'supervisor'].includes(m.department_role)
  );

  const filtered = directors.filter(d =>
    !q || d.full_name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-secondary border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Shield className="h-4 w-4 text-primary" />
            Atuar em Nome de
          </DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground">
          Selecione o diretor em nome do qual você deseja atuar. Todas as ações serão registradas com seu nome real.
        </p>

        {currentDelegateId && (
          <div className="rounded-lg p-3 flex items-center justify-between bg-primary/10 border border-primary/20">
            <span className="text-xs font-medium text-primary">Delegação ativa</span>
            <Button variant="ghost" size="sm" onClick={() => { onClearDelegation(); onOpenChange(false); }}
              className="text-xs h-7 text-muted-foreground">
              Encerrar
            </Button>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar diretor..."
            className="pl-9 bg-muted border-border text-foreground" />
        </div>

        <div className="max-h-[250px] overflow-y-auto space-y-0.5">
          {filtered.length === 0 ? (
            <p className="text-xs text-center py-4 text-muted-foreground/60">Nenhum diretor encontrado.</p>
          ) : (
            filtered.map(d => (
              <button key={d.user_id} onClick={() => { onDelegate(d.user_id, d.full_name); onOpenChange(false); }}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors hover:bg-muted ${currentDelegateId === d.user_id ? 'bg-primary/10' : ''}`}>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-[10px] font-semibold bg-muted text-muted-foreground">
                    {d.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{d.full_name}</p>
                  <p className="text-[10px] text-muted-foreground">Diretor</p>
                </div>
                {currentDelegateId === d.user_id && (
                  <UserCheck className="h-4 w-4 ml-auto shrink-0 text-success" />
                )}
              </button>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-muted-foreground">Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
