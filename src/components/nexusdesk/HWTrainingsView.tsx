import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHWUserDisplay } from "@/hooks/useHWUserDisplay";
import { useHWProfile, canManageTeam } from "@/hooks/useHWProfile";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useHWTrainings, useAssignHWTraining } from "@/hooks/useHWTrainings";
import { useHWMembers } from "@/hooks/useHWMembers";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  GraduationCap, CheckCircle2, Clock, AlertCircle, Download, Plus,
  Users, TrendingUp, AlertTriangle, Filter, BookOpen, Upload,
  Search, ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { pdf } from "@react-pdf/renderer";
import { TrainingCertificate } from "./TrainingCertificate";
import { toast } from "sonner";

type StatusFilter = 'all' | 'pending' | 'in_progress' | 'completed' | 'overdue';

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string; icon: typeof CheckCircle2 }> = {
  completed: { bg: 'rgba(22, 163, 74, 0.15)', text: '#22C55E', label: 'Concluído', icon: CheckCircle2 },
  in_progress: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', label: 'Em andamento', icon: Clock },
  pending: { bg: 'rgba(234, 179, 8, 0.15)', text: '#EAB308', label: 'Pendente', icon: AlertCircle },
};

const FILTER_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'in_progress', label: 'Em Andamento' },
  { key: 'completed', label: 'Concluídos' },
  { key: 'overdue', label: 'Vencidos' },
];

interface HWTrainingsViewProps {
  onNavigate?: (view: string) => void;
}

// ─── My Trainings Tab ──────────────────────────────────────────────
function MyTrainingsTab() {
  const { displayName, tenantName, user } = useHWUserDisplay();
  const { data: tenantId } = useHWTenantId();
  const { data: trainings, isLoading } = useHWTrainings(tenantId || undefined, user?.id);
  const [filter, setFilter] = useState<StatusFilter>('all');

  const now = new Date();

  const filteredTrainings = useMemo(() => {
    if (!trainings) return [];
    return trainings.filter(t => {
      if (filter === 'all') return true;
      if (filter === 'overdue') return t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed';
      return t.status === filter;
    });
  }, [trainings, filter]);

  const completedCount = trainings?.filter(t => t.status === 'completed').length || 0;
  const total = trainings?.length || 0;
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const overdueCount = trainings?.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed').length || 0;

  const handleDownloadCert = async (t: any) => {
    const blob = await pdf(
      <TrainingCertificate
        userName={displayName}
        trainingTitle={t.title}
        completedAt={t.completedAt || ''}
        tenantName={tenantName}
        mandatory={t.mandatory}
      />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificado-${t.title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Progress overview */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-5"
        style={{ backgroundColor: '#18181B', border: '1px solid #27272A' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" style={{ color: '#EA580C' }} />
            <h3 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Meu Progresso</h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(22, 163, 74, 0.15)', color: '#22C55E' }}>
            {completedCount}/{total}
          </span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#27272A' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: '#22C55E' }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px]" style={{ color: '#71717A' }}>{progressPct}% concluído</span>
          {overdueCount > 0 && (
            <div className="flex items-center gap-1" style={{ color: '#EF4444' }}>
              <AlertTriangle className="h-3 w-3" />
              <span className="text-[11px] font-medium">{overdueCount} vencido{overdueCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Filter className="h-3.5 w-3.5 shrink-0" style={{ color: '#52525B' }} />
        {FILTER_OPTIONS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors"
            style={{
              backgroundColor: filter === f.key ? '#EA580C' : '#27272A',
              color: filter === f.key ? '#FFFFFF' : '#A1A1AA',
            }}
          >
            {f.label}
            {f.key === 'overdue' && overdueCount > 0 && ` (${overdueCount})`}
          </button>
        ))}
      </div>

      {/* Training list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: '#52525B', borderTopColor: 'transparent' }} />
            </div>
          ) : filteredTrainings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <GraduationCap className="h-10 w-10 mx-auto mb-3" style={{ color: '#27272A' }} />
              <p className="text-sm" style={{ color: '#52525B' }}>
                {filter === 'all' ? 'Nenhum treinamento atribuído ainda' : 'Nenhum treinamento nesta categoria'}
              </p>
            </motion.div>
          ) : (
            filteredTrainings.map((t, i) => {
              const s = STATUS_STYLES[t.status] || STATUS_STYLES.pending;
              const Icon = s.icon;
              const isOverdue = t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed';
              const daysUntilDue = t.dueDate && t.status !== 'completed'
                ? Math.ceil((new Date(t.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-xl p-4 transition-colors hover:brightness-105"
                  style={{
                    backgroundColor: '#18181B',
                    border: `1px solid ${isOverdue ? 'rgba(239,68,68,0.3)' : '#27272A'}`,
                    borderLeft: isOverdue ? '3px solid #EF4444' : daysUntilDue !== null && daysUntilDue <= 3 ? '3px solid #EAB308' : '3px solid transparent',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-2 rounded-lg" style={{ backgroundColor: s.bg }}>
                      <Icon className="h-4 w-4" style={{ color: s.text }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-medium" style={{ color: '#FAFAFA' }}>{t.title}</h4>
                        {t.mandatory && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>Obrigatório</span>
                        )}
                      </div>
                      {t.description && (
                        <p className="text-[11px] mt-1 line-clamp-2" style={{ color: '#71717A' }}>{t.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: s.bg, color: s.text }}>{s.label}</span>
                        {t.dueDate && t.status !== 'completed' && (
                          <span className="text-[10px]" style={{ color: isOverdue ? '#EF4444' : '#71717A' }}>
                            {isOverdue ? `Vencido há ${Math.abs(daysUntilDue!)}d` : `Prazo: ${new Date(t.dueDate).toLocaleDateString('pt-BR')}`}
                          </span>
                        )}
                        {t.completedAt && (
                          <span className="text-[10px]" style={{ color: '#52525B' }}>Concluído em {t.completedAt}</span>
                        )}
                      </div>
                    </div>
                    {t.status === 'completed' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-zinc-700 shrink-0"
                        style={{ color: '#22C55E' }}
                        onClick={() => handleDownloadCert(t)}
                        title="Baixar certificado"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Management Tab ─────────────────────────────────────────────────
function ManagementTab() {
  const { user } = useAuth();
  const { profile } = useHWProfile();
  const { data: tenantId } = useHWTenantId();
  const { data: allTrainings } = useHWTrainings(tenantId || undefined);
  const { members } = useHWMembers();
  const assignTraining = useAssignHWTraining();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const now = new Date();
  const totalTrainings = allTrainings?.length || 0;
  const completedTrainings = allTrainings?.filter(t => t.status === 'completed').length || 0;
  const overdueTrainings = allTrainings?.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed').length || 0;
  const completionRate = totalTrainings > 0 ? Math.round((completedTrainings / totalTrainings) * 100) : 0;

  // Group by user
  const byUser = useMemo(() => {
    if (!allTrainings || !members) return [];
    const map = new Map<string, { name: string; trainings: typeof allTrainings }>();
    for (const t of allTrainings) {
      if (!map.has(t.userId)) {
        const member = members.find((m: any) => m.user_id === t.userId);
        map.set(t.userId, { name: member?.full_name || 'Colaborador', trainings: [] });
      }
      map.get(t.userId)!.trainings.push(t);
    }
    return Array.from(map.entries()).map(([userId, data]) => ({ userId, ...data }));
  }, [allTrainings, members]);

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Taxa de Conclusão', value: `${completionRate}%`, icon: TrendingUp, color: '#22C55E' },
          { label: 'Total Atribuídos', value: String(totalTrainings), icon: BookOpen, color: '#3B82F6' },
          { label: 'Vencidos', value: String(overdueTrainings), icon: AlertTriangle, color: overdueTrainings > 0 ? '#EF4444' : '#71717A' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl p-4 text-center"
            style={{ backgroundColor: '#18181B', border: '1px solid #27272A' }}
          >
            <kpi.icon className="h-5 w-5 mx-auto mb-2" style={{ color: kpi.color }} />
            <p className="text-xl font-bold" style={{ color: '#FAFAFA' }}>{kpi.value}</p>
            <p className="text-[10px] mt-1" style={{ color: '#71717A' }}>{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="flex-1 h-10 rounded-xl text-sm font-medium"
          style={{ backgroundColor: '#EA580C', color: '#FFFFFF' }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Criar Treinamento
        </Button>
      </div>

      {/* Members progress */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#52525B' }}>
          Progresso por Colaborador
        </h3>
        {byUser.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-8 w-8 mx-auto mb-2" style={{ color: '#27272A' }} />
            <p className="text-xs" style={{ color: '#52525B' }}>Nenhum treinamento atribuído ainda</p>
          </div>
        ) : (
          byUser.map(({ userId, name, trainings: uTrainings }) => {
            const completed = uTrainings.filter(t => t.status === 'completed').length;
            const pct = uTrainings.length > 0 ? Math.round((completed / uTrainings.length) * 100) : 0;
            const hasOverdue = uTrainings.some(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed');

            return (
              <motion.div
                key={userId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl p-4"
                style={{ backgroundColor: '#18181B', border: `1px solid ${hasOverdue ? 'rgba(239,68,68,0.3)' : '#27272A'}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: '#FAFAFA' }}>{name}</span>
                  <span className="text-[11px] font-medium" style={{ color: pct === 100 ? '#22C55E' : '#A1A1AA' }}>
                    {completed}/{uTrainings.length} ({pct}%)
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#27272A' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#22C55E' : hasOverdue ? '#EF4444' : '#3B82F6' }} />
                </div>
                {hasOverdue && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <AlertTriangle className="h-3 w-3" style={{ color: '#EF4444' }} />
                    <span className="text-[10px]" style={{ color: '#EF4444' }}>Tem treinamentos vencidos</span>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create Training Dialog */}
      <CreateTrainingDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        tenantId={tenantId || ''}
        userId={user?.id || ''}
        profile={profile}
        members={members || []}
        teams={[]}
        onAssign={assignTraining}
      />
    </div>
  );
}

// ─── Create Training Dialog ──────────────────────────────────────
interface CreateTrainingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  userId: string;
  profile: string;
  members: any[];
  teams: any[];
  onAssign: ReturnType<typeof useAssignHWTraining>;
}

function CreateTrainingDialog({ open, onOpenChange, tenantId, userId, profile, members, teams, onAssign }: CreateTrainingDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mandatory, setMandatory] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    const filtered = members.filter((m: any) =>
      m.user_id !== userId &&
      (m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || m.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return filtered;
  }, [members, searchQuery, userId]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedMembers(checked ? filteredMembers.map((m: any) => m.user_id) : []);
  };

  const handleToggleMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || selectedMembers.length === 0) {
      toast.error('Preencha o título e selecione ao menos um colaborador');
      return;
    }

    try {
      for (const memberId of selectedMembers) {
        await onAssign.mutateAsync({
          tenant_id: tenantId,
          user_id: memberId,
          training_title: title.trim(),
          training_description: description.trim() || undefined,
          mandatory,
          assigned_by: userId,
        });
      }
      toast.success(`Treinamento atribuído para ${selectedMembers.length} colaborador(es)`);
      onOpenChange(false);
      // Reset
      setTitle('');
      setDescription('');
      setMandatory(false);
      setDueDate('');
      setSelectedMembers([]);
      setSelectAll(false);
    } catch (err) {
      toast.error('Erro ao criar treinamento');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" style={{ backgroundColor: '#18181B', borderColor: '#27272A' }}>
        <DialogHeader>
          <DialogTitle className="text-base font-semibold" style={{ color: '#FAFAFA' }}>
            <GraduationCap className="inline h-5 w-5 mr-2" style={{ color: '#EA580C' }} />
            Criar Treinamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="text-[11px] font-medium mb-1 block" style={{ color: '#A1A1AA' }}>Título *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Treinamento de Segurança"
              className="h-9 text-sm rounded-lg"
              style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium mb-1 block" style={{ color: '#A1A1AA' }}>Descrição</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo do treinamento..."
              rows={3}
              className="text-sm rounded-lg resize-none"
              style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={mandatory} onCheckedChange={setMandatory} />
              <label className="text-xs" style={{ color: '#A1A1AA' }}>Obrigatório</label>
            </div>
            <div className="flex-1">
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-9 text-xs rounded-lg"
                style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#A1A1AA' }}
              />
            </div>
          </div>

          {/* Member picker */}
          <div>
            <label className="text-[11px] font-medium mb-1 block" style={{ color: '#A1A1AA' }}>
              Destinatários * ({selectedMembers.length} selecionados)
            </label>
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: '#52525B' }} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar colaborador..."
                className="h-8 text-xs rounded-lg pl-8"
                style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }}
              />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                id="select-all"
                checked={selectAll}
                onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
              />
              <label htmlFor="select-all" className="text-[11px]" style={{ color: '#A1A1AA' }}>Selecionar todos</label>
            </div>
            <ScrollArea className="h-40 rounded-lg" style={{ backgroundColor: '#0f0f10', border: '1px solid #27272A' }}>
              <div className="p-2 space-y-1">
                {filteredMembers.map((m: any) => (
                  <label
                    key={m.user_id}
                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors hover:bg-zinc-800"
                  >
                    <Checkbox
                      checked={selectedMembers.includes(m.user_id)}
                      onCheckedChange={() => handleToggleMember(m.user_id)}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: '#D4D4D8' }}>{m.full_name || 'Sem nome'}</p>
                      {m.email && <p className="text-[10px] truncate" style={{ color: '#52525B' }}>{m.email}</p>}
                    </div>
                  </label>
                ))}
                {filteredMembers.length === 0 && (
                  <p className="text-[11px] text-center py-4" style={{ color: '#52525B' }}>Nenhum colaborador encontrado</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-sm" style={{ color: '#71717A' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || selectedMembers.length === 0 || onAssign.isPending}
            className="text-sm rounded-xl"
            style={{ backgroundColor: '#EA580C', color: '#FFFFFF' }}
          >
            {onAssign.isPending ? 'Criando...' : `Atribuir para ${selectedMembers.length}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main View ──────────────────────────────────────────────────────
export function HWTrainingsView({ onNavigate }: HWTrainingsViewProps) {
  const { profile, permissions } = useHWProfile();
  const isLeader = permissions.canManageTeam;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-3 sm:px-6 py-6 pb-20 lg:pb-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(234, 88, 12, 0.15)' }}>
              <GraduationCap className="h-6 w-6" style={{ color: '#EA580C' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#FAFAFA' }}>Treinamentos</h1>
              <p className="text-xs" style={{ color: '#71717A' }}>Centro de desenvolvimento e capacitação</p>
            </div>
          </div>
        </motion.div>

        {isLeader ? (
          <Tabs defaultValue="my" className="w-full">
            <TabsList className="w-full h-10 rounded-xl p-1 mb-5" style={{ backgroundColor: '#27272A' }}>
              <TabsTrigger value="my" className="flex-1 rounded-lg text-xs font-medium data-[state=active]:bg-zinc-700 data-[state=active]:text-white" style={{ color: '#71717A' }}>
                Meus Treinamentos
              </TabsTrigger>
              <TabsTrigger value="manage" className="flex-1 rounded-lg text-xs font-medium data-[state=active]:bg-zinc-700 data-[state=active]:text-white" style={{ color: '#71717A' }}>
                Gestão
              </TabsTrigger>
            </TabsList>
            <TabsContent value="my">
              <MyTrainingsTab />
            </TabsContent>
            <TabsContent value="manage">
              <ManagementTab />
            </TabsContent>
          </Tabs>
        ) : (
          <MyTrainingsTab />
        )}
      </div>
    </div>
  );
}
