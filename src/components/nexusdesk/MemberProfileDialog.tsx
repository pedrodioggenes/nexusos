import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useHWTrainings } from "@/hooks/useHWTrainings";
import { useHWDocuments } from "@/hooks/useHWDocuments";
import { supabase } from "@/integrations/supabase/client";
import { getDepartmentRoleLabel } from "@/hooks/useUserDepartmentRole";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Building2, Calendar, GraduationCap, FileText, CheckCircle2, Clock, AlertCircle, MessageSquare } from "lucide-react";

interface MemberProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  memberName: string;
  memberInitials: string;
  memberRole: string;
  teamName?: string;
  onSendMessage?: (userId: string) => void;
}

const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  completed: CheckCircle2,
  in_progress: Clock,
  pending: AlertCircle,
};

const STATUS_COLOR: Record<string, string> = {
  completed: '#22C55E',
  in_progress: '#3B82F6',
  pending: '#EAB308',
};

export function MemberProfileDialog({
  open, onOpenChange, userId, memberName, memberInitials, memberRole, teamName, onSendMessage,
}: MemberProfileDialogProps) {
  const { data: tenantId } = useHWTenantId();
  const { data: trainings } = useHWTrainings(tenantId || undefined, userId);
  const { data: allDocs } = useHWDocuments(tenantId || undefined);
  const [hiredAt, setHiredAt] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !userId) return;
    supabase
      .from("profiles")
      .select("hired_at, email")
      .eq("user_id", userId)
      .single()
      .then(({ data }) => {
        if (data) {
          setHiredAt(data.hired_at || null);
          setEmail(data.email || null);
        }
      });
  }, [open, userId]);

  const memberDocs = (allDocs || []).filter((d: any) => d.contextType === 'personal');
  const completedCount = (trainings || []).filter(t => t.status === 'completed').length;
  const totalTrainings = (trainings || []).length;
  const progressPct = totalTrainings > 0 ? Math.round((completedCount / totalTrainings) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-festval-graphite border-festval-border">
        <DialogHeader>
          <DialogTitle className="text-festval-ivory">Perfil do Membro</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Avatar + info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-offset-2"
              style={{ '--tw-ring-color': 'hsl(var(--festval-copper))', '--tw-ring-offset-color': 'hsl(var(--festval-graphite))' } as React.CSSProperties}>
              <AvatarFallback className="text-lg font-bold" style={{ backgroundColor: 'hsl(var(--festval-border))', color: 'hsl(var(--festval-ivory))' }}>
                {memberInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-festval-ivory">{memberName}</h3>
              <p className="text-xs text-festval-stone">{getDepartmentRoleLabel(memberRole)}</p>
              {email && <p className="text-[10px] mt-0.5" style={{ color: 'hsl(var(--festval-stone-muted))' }}>{email}</p>}
            </div>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-3">
            {teamName && (
              <div className="flex items-center gap-1.5 text-xs text-festval-stone">
                <Building2 className="h-3.5 w-3.5" /><span>{teamName}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-festval-stone">
              <Calendar className="h-3.5 w-3.5" />
              <span>{hiredAt ? `Desde ${new Date(hiredAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}` : 'Data não informada'}</span>
            </div>
          </div>

          {/* Training progress */}
          <div className="rounded-lg p-3" style={{ backgroundColor: 'hsl(var(--festval-border))' }}>
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-4 w-4 text-festval-copper" />
              <span className="text-xs font-semibold text-festval-ivory">Treinamentos</span>
              <span className="ml-auto text-[10px]" style={{ color: '#22C55E' }}>{completedCount}/{totalTrainings}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ backgroundColor: 'hsl(var(--festval-surface-elevated))' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, backgroundColor: '#22C55E' }} />
            </div>
            {(trainings || []).slice(0, 4).map(t => {
              const Icon = STATUS_ICON[t.status] || AlertCircle;
              const color = STATUS_COLOR[t.status] || 'hsl(var(--festval-stone))';
              return (
                <div key={t.id} className="flex items-center gap-2 py-1">
                  <Icon className="h-3 w-3 shrink-0" style={{ color }} />
                  <span className="text-[10px] truncate text-festval-ivory">{t.title}</span>
                  {t.mandatory && <span className="text-[9px] px-1 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>Obrig.</span>}
                </div>
              );
            })}
          </div>

          {/* Documents */}
          <div className="rounded-lg p-3" style={{ backgroundColor: 'hsl(var(--festval-border))' }}>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-festval-stone" />
              <span className="text-xs font-semibold text-festval-ivory">Documentos Pessoais</span>
              <span className="ml-auto text-[10px]" style={{ color: 'hsl(var(--festval-stone-muted))' }}>{memberDocs.length}</span>
            </div>
            {memberDocs.length > 0 ? (
              memberDocs.slice(0, 3).map((doc: any) => (
                <div key={doc.id} className="flex items-center gap-2 py-1">
                  <FileText className="h-3 w-3 shrink-0" style={{ color: '#EF4444' }} />
                  <span className="text-[10px] truncate text-festval-ivory">{doc.name}</span>
                </div>
              ))
            ) : (
              <p className="text-[10px]" style={{ color: 'hsl(var(--festval-stone-muted))' }}>Nenhum documento pessoal.</p>
            )}
          </div>
        </div>

        {onSendMessage && (
          <DialogFooter>
            <Button onClick={() => { onSendMessage(userId); onOpenChange(false); }}
              className="gap-2 bg-festval-copper text-white">
              <MessageSquare className="h-4 w-4" />
              Enviar mensagem
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
