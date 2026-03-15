import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHWProfile } from "@/hooks/useHWProfile";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useHWDepartments, useAddTeamMember, useRemoveTeamMember, type HWDepartmentWithTeams } from "@/hooks/useHWTeams";
import { useHWMembers } from "@/hooks/useHWMembers";
import { useAssignHWTraining } from "@/hooks/useHWTrainings";
import { getDepartmentRoleLabel } from "@/hooks/useUserDepartmentRole";
import { MemberProfileDialog } from "./MemberProfileDialog";
import { ShiftCalendar } from "./ShiftCalendar";
import { IncidentDialog } from "./IncidentDialog";
import { TransferDialog } from "./TransferDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Search, UserPlus, UserMinus, ChevronDown, ChevronRight, GraduationCap, Loader2, X, Eye, AlertTriangle, ArrowRightLeft, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// ─── Mock fallback ──────────────────────────────────

const MOCK_DEPARTMENTS: HWDepartmentWithTeams[] = [
  {
    id: 'd1', name: 'Caixas',
    teams: [{
      id: 't1', name: 'Frente de Caixa - Manhã', leaderName: 'Ana Oliveira',
      members: [
        { id: 'm1', userId: 'u1', name: 'Lucas Ferreira', initials: 'LF', role: 'Operador de Caixa', status: 'ativo', online: true, trainings: 2 },
        { id: 'm2', userId: 'u2', name: 'Camila Santos', initials: 'CS', role: 'Operadora de Caixa', status: 'ativo', online: true, trainings: 1 },
        { id: 'm3', userId: 'u3', name: 'Pedro Almeida', initials: 'PA', role: 'Operador de Caixa', status: 'ativo', online: false, trainings: 0 },
      ],
    }],
  },
  {
    id: 'd2', name: 'Reposição',
    teams: [{
      id: 't2', name: 'Equipe Reposição', leaderName: 'Roberto Santos',
      members: [
        { id: 'm5', userId: 'u5', name: 'João Pereira', initials: 'JP', role: 'Repositor', status: 'ativo', online: true, trainings: 1 },
        { id: 'm6', userId: 'u6', name: 'Fernanda Lima', initials: 'FL', role: 'Repositora', status: 'ativo', online: true, trainings: 0 },
      ],
    }],
  },
];

// ─── Sub-components ──────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    ativo: { bg: 'rgba(22, 163, 74, 0.15)', text: '#22C55E' },
    ferias: { bg: 'rgba(234, 179, 8, 0.15)', text: '#EAB308' },
    afastado: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' },
  };
  const c = colors[status] || colors.ativo;
  const labels: Record<string, string> = { ativo: 'Ativo', ferias: 'Férias', afastado: 'Afastado' };
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: c.bg, color: c.text }}>
      {labels[status] || status}
    </span>
  );
}

function MemberCard({
  member,
  canManage,
  onRemove,
  onAssignTraining,
  onViewProfile,
  onIncident,
  onTransfer,
  teamName,
}: {
  member: HWDepartmentWithTeams['teams'][0]['members'][0];
  canManage: boolean;
  onRemove: () => void;
  onAssignTraining: () => void;
  onViewProfile: () => void;
  onIncident: () => void;
  onTransfer: () => void;
  teamName?: string;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-zinc-800/50" style={{ backgroundColor: '#18181B' }}>
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-xs font-semibold" style={{ backgroundColor: '#27272A', color: '#A1A1AA' }}>
              {member.initials}
            </AvatarFallback>
          </Avatar>
          {member.online && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2" style={{ backgroundColor: '#22C55E', borderColor: '#18181B' }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: '#FAFAFA' }}>{member.name}</p>
          <p className="text-xs truncate" style={{ color: '#71717A' }}>{getDepartmentRoleLabel(member.role)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {member.trainings > 0 && (
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(194, 65, 12, 0.15)', color: '#EA580C' }}>
              <GraduationCap className="h-3 w-3" />{member.trainings}
            </span>
          )}
          <StatusBadge status={member.status} />
          {canManage && (
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-zinc-700" style={{ color: '#3B82F6' }}
                onClick={onViewProfile} title="Ver perfil">
                <Eye className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-zinc-700" style={{ color: '#EA580C' }}
                onClick={onAssignTraining} title="Atribuir treinamento">
                <GraduationCap className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-zinc-700" style={{ color: '#F59E0B' }}
                onClick={onIncident} title="Registrar ocorrência">
                <AlertTriangle className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-zinc-700" style={{ color: '#8B5CF6' }}
                onClick={onTransfer} title="Transferir">
                <ArrowRightLeft className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-zinc-700" style={{ color: '#52525B' }}
                onClick={() => setShowConfirm(true)} title="Remover da equipe">
                <UserMinus className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          {!canManage && (
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-zinc-700" style={{ color: '#71717A' }}
              onClick={onViewProfile} title="Ver perfil">
              <Eye className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent style={{ backgroundColor: '#18181B', borderColor: '#27272A' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#FAFAFA' }}>Remover membro</AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#A1A1AA' }}>
              Tem certeza que deseja remover <strong>{member.name}</strong> da equipe?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ color: '#A1A1AA', borderColor: '#3F3F46' }}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setShowConfirm(false); onRemove(); }} style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Add Member Dialog ──────────────────────────────

function AddMemberDialog({
  open,
  onOpenChange,
  teams,
  tenantId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  teams: { id: string; name: string }[];
  tenantId: string;
}) {
  const [q, setQ] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(teams[0]?.id || "");
  const { members } = useHWMembers();
  const addMember = useAddTeamMember();

  const filtered = members.filter(m => !q || m.full_name.toLowerCase().includes(q.toLowerCase()));

  const handleAdd = (userId: string) => {
    if (!selectedTeam) return;
    addMember.mutate({ teamId: selectedTeam, userId, tenantId }, {
      onSuccess: () => { toast.success("Membro adicionado!"); onOpenChange(false); },
      onError: () => toast.error("Erro ao adicionar membro"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ backgroundColor: '#18181B', borderColor: '#27272A' }} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle style={{ color: '#FAFAFA' }}>Adicionar Membro</DialogTitle>
        </DialogHeader>
        {teams.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2">
            {teams.map(t => (
              <button key={t.id} onClick={() => setSelectedTeam(t.id)}
                className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
                style={{ backgroundColor: selectedTeam === t.id ? 'rgba(194, 65, 12, 0.2)' : '#27272A', color: selectedTeam === t.id ? '#EA580C' : '#A1A1AA' }}>
                {t.name}
              </button>
            ))}
          </div>
        )}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#52525B' }} />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar colaborador..."
            className="pl-9" style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />
        </div>
        <div className="max-h-[300px] overflow-y-auto space-y-0.5">
          {filtered.map(m => (
            <button key={m.user_id} onClick={() => handleAdd(m.user_id)}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors hover:bg-zinc-800/50">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-[10px] font-semibold" style={{ backgroundColor: '#27272A', color: '#A1A1AA' }}>
                  {m.initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-left min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#FAFAFA' }}>{m.full_name}</p>
                <p className="text-[10px]" style={{ color: '#71717A' }}>{m.department_role || 'Colaborador'}</p>
              </div>
              <UserPlus className="h-3.5 w-3.5 ml-auto shrink-0" style={{ color: '#22C55E' }} />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Assign Training Dialog ──────────────────────────

function AssignTrainingDialog({
  open,
  onOpenChange,
  memberName,
  memberId,
  tenantId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  memberName: string;
  memberId: string;
  tenantId: string;
}) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [mandatory, setMandatory] = useState(false);
  const assign = useAssignHWTraining();

  const handleSubmit = () => {
    if (!title.trim() || !user?.id) return;
    assign.mutate({
      tenant_id: tenantId,
      user_id: memberId,
      training_title: title.trim(),
      training_description: desc.trim() || undefined,
      mandatory,
      assigned_by: user.id,
    }, {
      onSuccess: () => { toast.success("Treinamento atribuído!"); onOpenChange(false); setTitle(""); setDesc(""); setMandatory(false); },
      onError: () => toast.error("Erro ao atribuir treinamento"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ backgroundColor: '#18181B', borderColor: '#27272A' }} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle style={{ color: '#FAFAFA' }}>Atribuir Treinamento</DialogTitle>
        </DialogHeader>
        <p className="text-xs mb-2" style={{ color: '#71717A' }}>Para: <strong style={{ color: '#D4D4D8' }}>{memberName}</strong></p>
        <div className="space-y-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do treinamento"
            style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />
          <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descrição (opcional)" rows={3}
            style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: '#A1A1AA' }}>Obrigatório</span>
            <Switch checked={mandatory} onCheckedChange={setMandatory} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} style={{ color: '#71717A' }}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || assign.isPending} style={{ backgroundColor: '#C2410C', color: '#FFFFFF' }}>
            {assign.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Atribuir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main View ──────────────────────────────────────

export function HWTeamView() {
  const { user } = useAuth();
  const { permissions } = useHWProfile();
  const { data: tenantId } = useHWTenantId();
  const { data: dbDepartments, isLoading } = useHWDepartments(tenantId || undefined);
  const removeMember = useRemoveTeamMember();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [showAddMember, setShowAddMember] = useState(false);
  const [trainingTarget, setTrainingTarget] = useState<{ id: string; name: string } | null>(null);
  const [profileTarget, setProfileTarget] = useState<{ userId: string; name: string; initials: string; role: string; teamName: string } | null>(null);

  const [incidentTarget, setIncidentTarget] = useState<{ userId: string; name: string } | null>(null);
  const [transferTarget, setTransferTarget] = useState<{ userId: string; name: string; teamId: string; teamName: string; memberId: string } | null>(null);
  const [viewMode, setViewMode] = useState<'members' | 'shifts'>('members');

  const departments = dbDepartments && dbDepartments.length > 0 ? dbDepartments : MOCK_DEPARTMENTS;

  // Auto-expand first 2 departments
  if (expandedDepts.size === 0 && departments.length > 0) {
    const initial = new Set(departments.slice(0, 2).map(d => d.id));
    setTimeout(() => setExpandedDepts(initial), 0);
  }

  const toggleDept = (id: string) => {
    setExpandedDepts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleRemoveMember = (memberId: string) => {
    if (!tenantId) return;
    removeMember.mutate({ memberId, tenantId }, {
      onSuccess: () => toast.success("Membro removido"),
      onError: () => toast.error("Erro ao remover membro"),
    });
  };

  const allTeams = departments.flatMap(d => d.teams.map(t => ({ id: t.id, name: `${d.name} — ${t.name}` })));

  const filteredDepts = departments.map(d => ({
    ...d,
    teams: d.teams.map(t => ({
      ...t,
      members: t.members.filter(m =>
        !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.role.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    })).filter(t => t.members.length > 0),
  })).filter(d => d.teams.length > 0);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4">
        {/* View mode toggle */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #27272A' }}>
            <button onClick={() => setViewMode('members')}
              className="px-3 py-1.5 text-xs font-medium transition-colors"
              style={{ backgroundColor: viewMode === 'members' ? '#27272A' : 'transparent', color: viewMode === 'members' ? '#FAFAFA' : '#71717A' }}>
              Membros
            </button>
            <button onClick={() => setViewMode('shifts')}
              className="px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1"
              style={{ backgroundColor: viewMode === 'shifts' ? '#27272A' : 'transparent', color: viewMode === 'shifts' ? '#FAFAFA' : '#71717A' }}>
              <Calendar className="h-3 w-3" /> Escalas
            </button>
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#52525B' }} />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar membro..."
              className="pl-9" style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />
          </div>
          {permissions.canManageTeam && (
            <Button className="shrink-0 rounded-lg" style={{ backgroundColor: '#C2410C', color: '#FFFFFF' }}
              onClick={() => setShowAddMember(true)}>
              <UserPlus className="h-4 w-4 mr-1.5" /><span className="hidden sm:inline">Adicionar</span>
            </Button>
          )}
        </div>

        {viewMode === 'shifts' ? (
          <ShiftCalendar canManage={permissions.canManageTeam} />
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#52525B' }} />
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDepts.map(dept => (
              <div key={dept.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid #27272A' }}>
                <button onClick={() => toggleDept(dept.id)}
                  className="w-full flex items-center gap-2 px-4 py-3 transition-colors hover:bg-zinc-800/50"
                  style={{ backgroundColor: '#18181B' }}>
                  {expandedDepts.has(dept.id) ? <ChevronDown className="h-4 w-4" style={{ color: '#71717A' }} /> : <ChevronRight className="h-4 w-4" style={{ color: '#71717A' }} />}
                  <span className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>{dept.name}</span>
                  <span className="text-xs ml-auto" style={{ color: '#52525B' }}>
                    {dept.teams.reduce((acc, t) => acc + t.members.length, 0)} membros
                  </span>
                </button>
                <AnimatePresence>
                  {expandedDepts.has(dept.id) && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      {dept.teams.map(team => (
                        <div key={team.id} className="px-2 pb-2">
                          <p className="text-xs font-medium px-2 py-1.5" style={{ color: '#71717A' }}>
                            {team.name} · Líder: {team.leaderName}
                          </p>
                          <div className="space-y-0.5">
                            {team.members.map(m => (
                              <MemberCard
                                key={m.id}
                                member={m}
                                canManage={permissions.canManageTeam}
                                onRemove={() => handleRemoveMember(m.id)}
                                onAssignTraining={() => setTrainingTarget({ id: m.userId, name: m.name })}
                                onViewProfile={() => setProfileTarget({ userId: m.userId, name: m.name, initials: m.initials, role: m.role, teamName: team.name })}
                                onIncident={() => setIncidentTarget({ userId: m.userId, name: m.name })}
                                onTransfer={() => setTransferTarget({ userId: m.userId, name: m.name, teamId: team.id, teamName: team.name, memberId: m.id })}
                                teamName={team.name}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {tenantId && (
        <>
          <AddMemberDialog open={showAddMember} onOpenChange={setShowAddMember} teams={allTeams} tenantId={tenantId} />
          {trainingTarget && (
            <AssignTrainingDialog
              open={!!trainingTarget}
              onOpenChange={(o) => { if (!o) setTrainingTarget(null); }}
              memberName={trainingTarget.name}
              memberId={trainingTarget.id}
              tenantId={tenantId}
            />
          )}
          {profileTarget && (
            <MemberProfileDialog
              open={!!profileTarget}
              onOpenChange={(o) => { if (!o) setProfileTarget(null); }}
              userId={profileTarget.userId}
              memberName={profileTarget.name}
              memberInitials={profileTarget.initials}
              memberRole={profileTarget.role}
              teamName={profileTarget.teamName}
            />
          )}
          {incidentTarget && user?.id && (
            <IncidentDialog
              open={!!incidentTarget}
              onOpenChange={(o) => { if (!o) setIncidentTarget(null); }}
              userId={incidentTarget.userId}
              userName={incidentTarget.name}
              tenantId={tenantId}
              createdBy={user.id}
            />
          )}
          {transferTarget && user?.id && (
            <TransferDialog
              open={!!transferTarget}
              onOpenChange={(o) => { if (!o) setTransferTarget(null); }}
              userId={transferTarget.userId}
              userName={transferTarget.name}
              currentTeamId={transferTarget.teamId}
              currentTeamName={transferTarget.teamName}
              memberRecordId={transferTarget.memberId}
              tenantId={tenantId}
              transferredBy={user.id}
              availableTeams={allTeams}
            />
          )}
        </>
      )}
    </div>
  );
}
