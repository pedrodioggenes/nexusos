import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useHWProfile } from "@/hooks/useHWProfile";
import {
  useHWGoals, useCreateGoal, useUpdateGoalProgress, useDeleteGoal,
  useCreateKeyResult, useUpdateKeyResult,
  useGoalCampaigns, useCreateCampaign, useJoinCampaign,
  useGoalBadges, useAwardBadge,
  useCreateCheckin, useGoalCheckins,
  type HWGoal, type GoalScope, type GoalPriority, type HWGoalCampaign, type HWGoalBadge,
} from "@/hooks/useHWGoals";
import {
  Target, Plus, ChevronDown, ChevronRight, Trophy, Flame, Star, Sparkles,
  Users, Building2, Globe, User, Calendar, Flag, Trash2, MessageSquare,
  Award, Rocket, X, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format, isPast, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── Scope helpers ─────────────────────────────────────────────
const SCOPE_CONFIG: Record<GoalScope, { label: string; icon: typeof User; color: string }> = {
  personal: { label: 'Pessoais', icon: User, color: '#EA580C' },
  team: { label: 'Equipe', icon: Users, color: '#3B82F6' },
  department: { label: 'Departamento', icon: Building2, color: '#8B5CF6' },
  network: { label: 'Rede', icon: Globe, color: '#22C55E' },
};

const PRIORITY_CONFIG: Record<GoalPriority, { label: string; color: string }> = {
  low: { label: 'Baixa', color: '#71717A' },
  medium: { label: 'Média', color: '#EAB308' },
  high: { label: 'Alta', color: '#EF4444' },
};

const BADGE_ICONS: Record<string, typeof Trophy> = {
  Trophy, Flame, Star, Sparkles, Award, Rocket, Target,
};

function getBadgeIcon(name: string) {
  return BADGE_ICONS[name] || Trophy;
}

// ─── Main View ─────────────────────────────────────────────────
export function HWGoalsView() {
  const { user } = useAuth();
  const { data: tenantId } = useHWTenantId();
  const { profile } = useHWProfile();
  const isLeader = profile === 'diretor' || profile === 'chefe' || profile === 'secretaria';

  const [activeScope, setActiveScope] = useState<GoalScope>('personal');
  const [showCreate, setShowCreate] = useState(false);
  const [showCampaignCreate, setShowCampaignCreate] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  const { data: allGoals, isLoading } = useHWGoals();
  const { data: campaigns } = useGoalCampaigns();
  const { data: badges } = useGoalBadges(user?.id);

  // Filter goals by scope and visibility
  const filteredGoals = useMemo(() => {
    if (!allGoals) return [];
    return allGoals.filter(g => {
      if (g.scope !== activeScope) return false;
      if (activeScope === 'personal') return g.user_id === user?.id;
      return true; // team/department/network visible to all in tenant
    });
  }, [allGoals, activeScope, user?.id]);

  const activeCampaigns = useMemo(() =>
    (campaigns || []).filter(c => c.status === 'active' && !isPast(new Date(c.ends_at))),
    [campaigns]
  );

  const availableScopes: GoalScope[] = useMemo(() => {
    if (isLeader) return ['personal', 'team', 'department', 'network'];
    return ['personal', 'team', 'department', 'network'];
  }, [isLeader]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(234, 88, 12, 0.15)' }}>
              <Target className="h-5 w-5" style={{ color: '#EA580C' }} />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: '#FAFAFA' }}>Metas & OKRs</h1>
              <p className="text-xs" style={{ color: '#71717A' }}>
                {filteredGoals.length} meta{filteredGoals.length !== 1 ? 's' : ''} · {SCOPE_CONFIG[activeScope].label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLeader && (
              <Button
                variant="outline" size="sm" className="h-8 text-xs gap-1"
                style={{ borderColor: '#3F3F46', color: '#A1A1AA' }}
                onClick={() => setShowCampaignCreate(true)}
              >
                <Rocket className="h-3 w-3" /> Campanha
              </Button>
            )}
            <Button size="sm" className="h-8 text-xs" style={{ backgroundColor: '#EA580C' }} onClick={() => setShowCreate(true)}>
              <Plus className="h-3 w-3 mr-1" /> Nova Meta
            </Button>
          </div>
        </div>

        {/* Active Campaigns Banner */}
        {activeCampaigns.map(campaign => (
          <CampaignBanner key={campaign.id} campaign={campaign} userId={user?.id} tenantId={tenantId || ''} />
        ))}

        {/* Scope Tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: '#1C1C1F' }}>
          {availableScopes.map(scope => {
            const cfg = SCOPE_CONFIG[scope];
            const Icon = cfg.icon;
            const isActive = activeScope === scope;
            const count = (allGoals || []).filter(g => {
              if (g.scope !== scope) return false;
              if (scope === 'personal') return g.user_id === user?.id;
              return true;
            }).length;
            return (
              <button
                key={scope}
                onClick={() => setActiveScope(scope)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  backgroundColor: isActive ? '#27272A' : 'transparent',
                  color: isActive ? cfg.color : '#71717A',
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                {cfg.label}
                {count > 0 && (
                  <span className="text-[10px] px-1.5 rounded-full" style={{
                    backgroundColor: isActive ? `${cfg.color}20` : '#27272A',
                    color: isActive ? cfg.color : '#52525B',
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Badges Row */}
        {badges && badges.length > 0 && activeScope === 'personal' && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {badges.map(badge => {
              const Icon = getBadgeIcon(badge.badge_icon);
              return (
                <div key={badge.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shrink-0"
                  style={{ backgroundColor: `${badge.badge_color}15`, border: `1px solid ${badge.badge_color}30` }}>
                  <Icon className="h-3.5 w-3.5" style={{ color: badge.badge_color }} />
                  <span className="text-[10px] font-medium" style={{ color: badge.badge_color }}>{badge.badge_label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Goals List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                isExpanded={expandedGoal === goal.id}
                onToggle={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                isOwner={goal.user_id === user?.id}
                userId={user?.id || ''}
                tenantId={tenantId || ''}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {!isLoading && filteredGoals.length === 0 && (
          <div className="text-center py-16">
            <Target className="h-12 w-12 mx-auto mb-3" style={{ color: '#3F3F46' }} />
            <p className="text-sm font-medium" style={{ color: '#71717A' }}>
              Nenhuma meta {SCOPE_CONFIG[activeScope].label.toLowerCase()} definida
            </p>
            <p className="text-xs mt-1" style={{ color: '#52525B' }}>
              {activeScope === 'personal' ? 'Crie sua primeira meta para começar' :
                isLeader ? `Crie uma meta para ${SCOPE_CONFIG[activeScope].label.toLowerCase()}` :
                  'Metas aparecerão aqui quando criadas pela liderança'}
            </p>
            {(activeScope === 'personal' || isLeader) && (
              <Button size="sm" className="mt-4 text-xs" style={{ backgroundColor: '#EA580C' }} onClick={() => setShowCreate(true)}>
                <Plus className="h-3 w-3 mr-1" /> Criar Meta
              </Button>
            )}
          </div>
        )}

        {/* Create Goal Dialog */}
        <CreateGoalDialog
          open={showCreate}
          onOpenChange={setShowCreate}
          defaultScope={activeScope}
          tenantId={tenantId || ''}
          userId={user?.id || ''}
          isLeader={isLeader}
          activeCampaigns={activeCampaigns}
        />

        {/* Create Campaign Dialog */}
        {isLeader && (
          <CreateCampaignDialog
            open={showCampaignCreate}
            onOpenChange={setShowCampaignCreate}
            tenantId={tenantId || ''}
            userId={user?.id || ''}
          />
        )}
      </div>
    </div>
  );
}

// ─── Goal Card ─────────────────────────────────────────────────
function GoalCard({ goal, isExpanded, onToggle, isOwner, userId, tenantId }: {
  goal: HWGoal; isExpanded: boolean; onToggle: () => void; isOwner: boolean; userId: string; tenantId: string;
}) {
  const updateProgress = useUpdateGoalProgress();
  const deleteGoal = useDeleteGoal();
  const createCheckin = useCreateCheckin();
  const awardBadge = useAwardBadge();
  const { data: checkins } = useGoalCheckins(isExpanded ? goal.id : undefined);

  const [checkinNote, setCheckinNote] = useState('');
  const [newProgress, setNewProgress] = useState(goal.current_value);
  const [showCheckin, setShowCheckin] = useState(false);

  const pct = goal.target_value > 0 ? Math.round((goal.current_value / goal.target_value) * 100) : 0;
  const scopeCfg = SCOPE_CONFIG[goal.scope];
  const priorityCfg = PRIORITY_CONFIG[goal.priority];
  const ScopeIcon = scopeCfg.icon;

  const daysLeft = goal.deadline ? differenceInDays(new Date(goal.deadline), new Date()) : null;
  const isOverdue = daysLeft !== null && daysLeft < 0 && goal.status !== 'completed';

  const handleComplete = useCallback(async () => {
    try {
      await updateProgress.mutateAsync({ id: goal.id, current_value: goal.target_value, status: 'completed' });
      // Award badge
      await awardBadge.mutateAsync({
        user_id: goal.user_id,
        tenant_id: tenantId,
        badge_key: `goal_completed_${goal.id}`,
        badge_label: 'Meta Concluída',
        badge_icon: 'Trophy',
        badge_color: '#22C55E',
        goal_id: goal.id,
      });
      toast.success('Meta concluída! 🏆');
    } catch { toast.error('Erro ao concluir meta'); }
  }, [goal, updateProgress, awardBadge, tenantId]);

  const handleCheckin = useCallback(async () => {
    try {
      await createCheckin.mutateAsync({
        goal_id: goal.id, user_id: userId, tenant_id: tenantId,
        note: checkinNote.trim() || undefined, progress_snapshot: newProgress,
      });
      await updateProgress.mutateAsync({ id: goal.id, current_value: newProgress });
      setCheckinNote('');
      setShowCheckin(false);
      toast.success('Check-in registrado');
    } catch { toast.error('Erro no check-in'); }
  }, [goal.id, userId, tenantId, checkinNote, newProgress, createCheckin, updateProgress]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteGoal.mutateAsync(goal.id);
      toast.success('Meta removida');
    } catch { toast.error('Erro ao remover'); }
  }, [goal.id, deleteGoal]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: '#1C1C1F', border: `1px solid ${isOverdue ? '#EF444440' : '#27272A'}` }}
    >
      {/* Header */}
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start gap-3">
          {isExpanded
            ? <ChevronDown className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#71717A' }} />
            : <ChevronRight className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#71717A' }} />
          }
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${scopeCfg.color}15`, color: scopeCfg.color }}>
                <ScopeIcon className="h-2.5 w-2.5" />{scopeCfg.label}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${priorityCfg.color}15`, color: priorityCfg.color }}>
                {priorityCfg.label}
              </span>
              {goal.status === 'completed' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#22C55E15', color: '#22C55E' }}>
                  ✓ Concluída
                </span>
              )}
              {isOverdue && (
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#EF444415', color: '#EF4444' }}>
                  Atrasada
                </span>
              )}
            </div>
            <p className="text-sm font-medium truncate" style={{ color: '#FAFAFA' }}>{goal.title}</p>
            {goal.description && <p className="text-[11px] truncate mt-0.5" style={{ color: '#71717A' }}>{goal.description}</p>}
            {goal.deadline && (
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" style={{ color: isOverdue ? '#EF4444' : '#52525B' }} />
                <span className="text-[10px]" style={{ color: isOverdue ? '#EF4444' : '#52525B' }}>
                  {format(new Date(goal.deadline), "dd MMM yyyy", { locale: ptBR })}
                  {daysLeft !== null && daysLeft >= 0 && ` · ${daysLeft}d restantes`}
                </span>
              </div>
            )}
          </div>
          <span className="text-sm font-bold shrink-0" style={{ color: pct >= 100 ? '#22C55E' : pct >= 75 ? '#22C55E' : pct >= 40 ? '#EAB308' : '#EF4444' }}>
            {pct}%
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 rounded-full mt-3 ml-7" style={{ backgroundColor: '#27272A' }}>
          <motion.div
            className="h-full rounded-full"
            initial={false}
            animate={{ width: `${Math.min(100, pct)}%` }}
            transition={{ duration: 0.5 }}
            style={{ backgroundColor: pct >= 100 ? '#22C55E' : pct >= 75 ? '#22C55E' : pct >= 40 ? '#EAB308' : '#EF4444' }}
          />
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid #27272A' }}>
              {/* Key Results */}
              {goal.key_results && goal.key_results.length > 0 && (
                <div className="pt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#52525B' }}>Key Results</p>
                  <div className="space-y-2">
                    {goal.key_results.map(kr => {
                      const krPct = kr.target > 0 ? Math.round((kr.current / kr.target) * 100) : 0;
                      return (
                        <div key={kr.id} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px]" style={{ color: '#A1A1AA' }}>{kr.title}</span>
                              <span className="text-[10px] font-semibold" style={{ color: '#D4D4D8' }}>{kr.current}/{kr.target} {kr.unit}</span>
                            </div>
                            <div className="h-1 rounded-full" style={{ backgroundColor: '#27272A' }}>
                              <div className="h-full rounded-full" style={{ width: `${Math.min(100, krPct)}%`, backgroundColor: '#3B82F6' }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Check-in Section */}
              {isOwner && goal.status !== 'completed' && (
                <div className="pt-2">
                  {!showCheckin ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-7 text-[11px] flex-1 gap-1"
                        style={{ borderColor: '#3F3F46', color: '#A1A1AA' }}
                        onClick={() => { setShowCheckin(true); setNewProgress(goal.current_value); }}>
                        <MessageSquare className="h-3 w-3" /> Check-in
                      </Button>
                      {pct < 100 && (
                        <Button size="sm" className="h-7 text-[11px] gap-1" style={{ backgroundColor: '#22C55E' }} onClick={handleComplete}>
                          <Trophy className="h-3 w-3" /> Concluir
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 p-3 rounded-lg" style={{ backgroundColor: '#27272A' }}>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] shrink-0" style={{ color: '#71717A' }}>Progresso:</span>
                        <Input
                          type="number" min={0} max={goal.target_value}
                          value={newProgress}
                          onChange={e => setNewProgress(Number(e.target.value))}
                          className="h-7 w-20 text-xs"
                          style={{ backgroundColor: '#1C1C1F', borderColor: '#3F3F46', color: '#FAFAFA' }}
                        />
                        <span className="text-[10px]" style={{ color: '#71717A' }}>/ {goal.target_value} {goal.unit}</span>
                      </div>
                      <Input
                        placeholder="Nota do check-in (opcional)..."
                        value={checkinNote}
                        onChange={e => setCheckinNote(e.target.value)}
                        className="h-7 text-xs"
                        style={{ backgroundColor: '#1C1C1F', borderColor: '#3F3F46', color: '#FAFAFA' }}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="h-7 text-[11px] flex-1" style={{ backgroundColor: '#EA580C' }}
                          onClick={handleCheckin} disabled={createCheckin.isPending}>
                          Registrar
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-[11px]" style={{ color: '#71717A' }}
                          onClick={() => setShowCheckin(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Check-in History */}
              {checkins && checkins.length > 0 && (
                <div className="pt-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#52525B' }}>Histórico</p>
                  <div className="space-y-1.5">
                    {checkins.slice(0, 5).map(ci => (
                      <div key={ci.id} className="flex items-start gap-2 text-[11px]">
                        <Clock className="h-3 w-3 mt-0.5 shrink-0" style={{ color: '#52525B' }} />
                        <div>
                          <span style={{ color: '#A1A1AA' }}>{ci.progress_snapshot}%</span>
                          {ci.note && <span style={{ color: '#71717A' }}> — {ci.note}</span>}
                          <span className="ml-1" style={{ color: '#3F3F46' }}>
                            {format(new Date(ci.created_at), "dd/MM HH:mm")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delete */}
              {isOwner && (
                <div className="pt-1 flex justify-end">
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" style={{ color: '#EF4444' }}
                    onClick={handleDelete}>
                    <Trash2 className="h-3 w-3" /> Remover
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Campaign Banner ──────────────────────────────────────────
function CampaignBanner({ campaign, userId, tenantId }: { campaign: HWGoalCampaign; userId?: string; tenantId: string }) {
  const joinCampaign = useJoinCampaign();
  const daysLeft = differenceInDays(new Date(campaign.ends_at), new Date());
  const hasJoined = !!campaign.my_participation;

  const handleJoin = async () => {
    if (!userId) return;
    try {
      await joinCampaign.mutateAsync({ campaign_id: campaign.id, user_id: userId, tenant_id: tenantId });
      toast.success('Você aderiu à campanha! Agora crie sua meta.');
    } catch { toast.error('Erro ao aderir'); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 relative overflow-hidden"
      style={{ backgroundColor: '#EA580C10', border: '1px solid #EA580C30' }}
    >
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#EA580C20' }}>
          <Rocket className="h-5 w-5" style={{ color: '#EA580C' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>{campaign.title}</p>
          {campaign.description && (
            <p className="text-xs mt-0.5" style={{ color: '#A1A1AA' }}>{campaign.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-[10px]" style={{ color: '#71717A' }}>
              <Flag className="inline h-3 w-3 mr-0.5" />
              Mín. {campaign.min_goals_required} meta{campaign.min_goals_required > 1 ? 's' : ''}
            </span>
            <span className="text-[10px]" style={{ color: daysLeft <= 7 ? '#EF4444' : '#71717A' }}>
              <Calendar className="inline h-3 w-3 mr-0.5" />
              {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Encerrada'}
            </span>
            <span className="text-[10px]" style={{ color: '#71717A' }}>
              <Users className="inline h-3 w-3 mr-0.5" />
              {campaign.participants_count} participante{campaign.participants_count !== 1 ? 's' : ''}
            </span>
            {campaign.reward_description && (
              <span className="text-[10px]" style={{ color: '#EAB308' }}>
                <Star className="inline h-3 w-3 mr-0.5" />
                {campaign.reward_description}
              </span>
            )}
          </div>
        </div>
        {!hasJoined && daysLeft > 0 && (
          <Button size="sm" className="h-7 text-[11px] shrink-0" style={{ backgroundColor: '#EA580C' }}
            onClick={handleJoin} disabled={joinCampaign.isPending}>
            Participar
          </Button>
        )}
        {hasJoined && (
          <span className="text-[10px] px-2 py-1 rounded-lg shrink-0" style={{ backgroundColor: '#22C55E15', color: '#22C55E' }}>
            ✓ Participando
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Create Goal Dialog ───────────────────────────────────────
function CreateGoalDialog({ open, onOpenChange, defaultScope, tenantId, userId, isLeader, activeCampaigns }: {
  open: boolean; onOpenChange: (o: boolean) => void; defaultScope: GoalScope;
  tenantId: string; userId: string; isLeader: boolean; activeCampaigns: HWGoalCampaign[];
}) {
  const createGoal = useCreateGoal();
  const createKR = useCreateKeyResult();
  const awardBadge = useAwardBadge();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState<GoalScope>(defaultScope);
  const [priority, setPriority] = useState<GoalPriority>('medium');
  const [deadline, setDeadline] = useState('');
  const [targetValue, setTargetValue] = useState(100);
  const [unit, setUnit] = useState('%');
  const [showKRs, setShowKRs] = useState(false);
  const [keyResults, setKeyResults] = useState<{ title: string; target: number; unit: string }[]>([]);
  const [campaignId, setCampaignId] = useState<string>('');

  const resetForm = () => {
    setTitle(''); setDescription(''); setScope(defaultScope); setPriority('medium');
    setDeadline(''); setTargetValue(100); setUnit('%'); setShowKRs(false);
    setKeyResults([]); setCampaignId('');
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      const goal = await createGoal.mutateAsync({
        tenant_id: tenantId, user_id: userId, title: title.trim(),
        description: description.trim() || undefined,
        scope, priority,
        deadline: deadline || undefined,
        target_value: targetValue, unit,
        campaign_id: campaignId || undefined,
      });

      // Create Key Results
      if (showKRs && keyResults.length > 0) {
        for (const kr of keyResults) {
          if (kr.title.trim()) {
            await createKR.mutateAsync({
              goal_id: goal.id, tenant_id: tenantId,
              title: kr.title.trim(), target: kr.target, unit: kr.unit,
            });
          }
        }
      }

      // Award first goal badge
      await awardBadge.mutateAsync({
        user_id: userId, tenant_id: tenantId,
        badge_key: 'first_goal',
        badge_label: 'Primeira Meta',
        badge_icon: 'Star',
        badge_color: '#EAB308',
        goal_id: goal.id,
      }).catch(() => {}); // Ignore if already has badge

      resetForm();
      onOpenChange(false);
      toast.success('Meta criada com sucesso! 🎯');
    } catch {
      toast.error('Erro ao criar meta');
    }
  };

  const addKR = () => setKeyResults([...keyResults, { title: '', target: 100, unit: '%' }]);
  const removeKR = (i: number) => setKeyResults(keyResults.filter((_, idx) => idx !== i));
  const updateKR = (i: number, field: string, value: any) => {
    const updated = [...keyResults];
    (updated[i] as any)[field] = value;
    setKeyResults(updated);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="max-w-md max-h-[85vh]" style={{ backgroundColor: '#18181B', border: '1px solid #27272A' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: '#FAFAFA' }}>
            <Target className="h-4 w-4" style={{ color: '#EA580C' }} />
            Nova Meta
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] pr-3">
          <div className="space-y-4 mt-2">
            <Input placeholder="Título da meta..." value={title} onChange={e => setTitle(e.target.value)}
              style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />

            <Textarea placeholder="Descrição (opcional)..." value={description} onChange={e => setDescription(e.target.value)} rows={2}
              style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#71717A' }}>Escopo</label>
                <Select value={scope} onValueChange={v => setScope(v as GoalScope)}>
                  <SelectTrigger className="h-8 text-xs" style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: '#18181B', borderColor: '#27272A' }}>
                    <SelectItem value="personal">Pessoal</SelectItem>
                    {isLeader && <SelectItem value="team">Equipe</SelectItem>}
                    {isLeader && <SelectItem value="department">Departamento</SelectItem>}
                    {isLeader && <SelectItem value="network">Rede</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#71717A' }}>Prioridade</label>
                <Select value={priority} onValueChange={v => setPriority(v as GoalPriority)}>
                  <SelectTrigger className="h-8 text-xs" style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: '#18181B', borderColor: '#27272A' }}>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#71717A' }}>Meta</label>
                <Input type="number" value={targetValue} onChange={e => setTargetValue(Number(e.target.value))}
                  className="h-8 text-xs" style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#71717A' }}>Unidade</label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger className="h-8 text-xs" style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: '#18181B', borderColor: '#27272A' }}>
                    <SelectItem value="%">%</SelectItem>
                    <SelectItem value="R$">R$</SelectItem>
                    <SelectItem value="un">Unidades</SelectItem>
                    <SelectItem value="pts">Pontos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#71717A' }}>Prazo</label>
                <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                  className="h-8 text-xs" style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />
              </div>
            </div>

            {/* Campaign association */}
            {activeCampaigns.length > 0 && scope === 'personal' && (
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#71717A' }}>Vincular a Campanha</label>
                <Select value={campaignId} onValueChange={setCampaignId}>
                  <SelectTrigger className="h-8 text-xs" style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }}>
                    <SelectValue placeholder="Nenhuma campanha" />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: '#18181B', borderColor: '#27272A' }}>
                    <SelectItem value="">Nenhuma</SelectItem>
                    {activeCampaigns.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Key Results Toggle */}
            <div className="flex items-center justify-between py-2" style={{ borderTop: '1px solid #27272A' }}>
              <div>
                <p className="text-xs font-medium" style={{ color: '#D4D4D8' }}>Key Results</p>
                <p className="text-[10px]" style={{ color: '#52525B' }}>Adicionar resultados-chave mensuráveis</p>
              </div>
              <Switch checked={showKRs} onCheckedChange={setShowKRs} />
            </div>

            {showKRs && (
              <div className="space-y-2">
                {keyResults.map((kr, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input placeholder="Resultado-chave..." value={kr.title}
                      onChange={e => updateKR(i, 'title', e.target.value)}
                      className="h-7 text-xs flex-1"
                      style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />
                    <Input type="number" value={kr.target}
                      onChange={e => updateKR(i, 'target', Number(e.target.value))}
                      className="h-7 w-16 text-xs"
                      style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />
                    <button onClick={() => removeKR(i)} className="p-1 rounded hover:bg-zinc-700" style={{ color: '#71717A' }}>
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="h-7 text-[11px] w-full gap-1"
                  style={{ borderColor: '#3F3F46', color: '#A1A1AA' }}
                  onClick={addKR}>
                  <Plus className="h-3 w-3" /> Adicionar KR
                </Button>
              </div>
            )}

            <Button onClick={handleCreate} disabled={!title.trim() || createGoal.isPending}
              className="w-full" style={{ backgroundColor: '#EA580C' }}>
              Criar Meta
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ─── Create Campaign Dialog ───────────────────────────────────
function CreateCampaignDialog({ open, onOpenChange, tenantId, userId }: {
  open: boolean; onOpenChange: (o: boolean) => void; tenantId: string; userId: string;
}) {
  const createCampaign = useCreateCampaign();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [minGoals, setMinGoals] = useState(1);
  const [endsAt, setEndsAt] = useState('');
  const [reward, setReward] = useState('');

  const resetForm = () => { setTitle(''); setDescription(''); setMinGoals(1); setEndsAt(''); setReward(''); };

  const handleCreate = async () => {
    if (!title.trim() || !endsAt) return;
    try {
      await createCampaign.mutateAsync({
        tenant_id: tenantId, created_by: userId,
        title: title.trim(), description: description.trim() || undefined,
        min_goals_required: minGoals, ends_at: new Date(endsAt).toISOString(),
        reward_description: reward.trim() || undefined,
      });
      resetForm();
      onOpenChange(false);
      toast.success('Campanha de metas lançada! 🚀');
    } catch { toast.error('Erro ao criar campanha'); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="max-w-sm" style={{ backgroundColor: '#18181B', border: '1px solid #27272A' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: '#FAFAFA' }}>
            <Rocket className="h-4 w-4" style={{ color: '#EA580C' }} />
            Nova Campanha de Metas
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <Input placeholder="Nome da campanha..." value={title} onChange={e => setTitle(e.target.value)}
            style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />
          <Textarea placeholder="Descrição para os colaboradores..." value={description} onChange={e => setDescription(e.target.value)} rows={2}
            style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#71717A' }}>Mín. Metas</label>
              <Input type="number" min={1} value={minGoals} onChange={e => setMinGoals(Number(e.target.value))}
                className="h-8 text-xs" style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#71717A' }}>Encerramento</label>
              <Input type="date" value={endsAt} onChange={e => setEndsAt(e.target.value)}
                className="h-8 text-xs" style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />
            </div>
          </div>
          <Input placeholder="Recompensa (ex: Badge Protagonista + destaque no Mural)" value={reward} onChange={e => setReward(e.target.value)}
            style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />
          <Button onClick={handleCreate} disabled={!title.trim() || !endsAt || createCampaign.isPending}
            className="w-full" style={{ backgroundColor: '#EA580C' }}>
            Lançar Campanha
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
