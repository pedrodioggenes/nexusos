import { useState } from "react";
import { useTransferMember } from "@/hooks/useHWTransfers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  userId: string;
  userName: string;
  currentTeamId: string;
  currentTeamName: string;
  memberRecordId: string;
  tenantId: string;
  transferredBy: string;
  availableTeams: { id: string; name: string }[];
}

export function TransferDialog({
  open, onOpenChange, userId, userName,
  currentTeamId, currentTeamName, memberRecordId,
  tenantId, transferredBy, availableTeams,
}: TransferDialogProps) {
  const [toTeamId, setToTeamId] = useState("");
  const [reason, setReason] = useState("");
  const transfer = useTransferMember();

  const otherTeams = availableTeams.filter(t => t.id !== currentTeamId);
  const selectedTeam = otherTeams.find(t => t.id === toTeamId);

  const handleSubmit = () => {
    if (!toTeamId) return;
    transfer.mutate(
      {
        user_id: userId,
        from_team_id: currentTeamId,
        to_team_id: toTeamId,
        tenant_id: tenantId,
        transferred_by: transferredBy,
        reason: reason.trim() || undefined,
        member_record_id: memberRecordId,
      },
      {
        onSuccess: () => {
          toast.success(`${userName} transferido(a) com sucesso!`);
          onOpenChange(false);
          setToTeamId("");
          setReason("");
        },
        onError: () => toast.error("Erro ao transferir membro"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-festval-graphite border-festval-border">
        <DialogHeader>
          <DialogTitle className="text-festval-ivory">Transferir Membro</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 py-2">
          <span className="text-xs font-medium px-3 py-1.5 rounded-lg text-festval-stone" style={{ backgroundColor: 'hsl(var(--festval-border))' }}>
            {currentTeamName}
          </span>
          <ArrowRight className="h-4 w-4 shrink-0" style={{ color: 'hsl(var(--festval-stone-muted))' }} />
          <span className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{
            backgroundColor: toTeamId ? 'rgba(22, 163, 74, 0.15)' : 'hsl(var(--festval-border))',
            color: toTeamId ? '#22C55E' : 'hsl(var(--festval-stone-muted))',
          }}>
            {selectedTeam?.name || 'Selecione...'}
          </span>
        </div>

        <p className="text-xs text-festval-stone">
          Transferindo: <strong className="text-festval-ivory">{userName}</strong>
        </p>

        {/* Team selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-festval-stone">Equipe destino</label>
          <div className="max-h-[200px] overflow-y-auto space-y-0.5">
            {otherTeams.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: 'hsl(var(--festval-stone-muted))' }}>Nenhuma outra equipe disponível</p>
            ) : (
              otherTeams.map(team => (
                <button key={team.id} onClick={() => setToTeamId(team.id)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: toTeamId === team.id ? 'hsl(var(--festval-copper) / 0.15)' : 'transparent',
                    color: toTeamId === team.id ? 'hsl(var(--festval-copper))' : 'hsl(var(--festval-ivory))',
                  }}>
                  {team.name}
                </button>
              ))
            )}
          </div>
        </div>

        <Textarea value={reason} onChange={(e) => setReason(e.target.value)}
          placeholder="Motivo da transferência (opcional)" rows={2}
          style={{ backgroundColor: 'hsl(var(--festval-border))', borderColor: 'hsl(var(--festval-surface-elevated))', color: 'hsl(var(--festval-ivory))' }} />

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-festval-stone">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!toTeamId || transfer.isPending}
            className="bg-festval-copper text-white">
            {transfer.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Transferir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
