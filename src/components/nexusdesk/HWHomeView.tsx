import React, { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHWUserDisplay } from "@/hooks/useHWUserDisplay";
import { useHWProfile } from "@/hooks/useHWProfile";
import { getDepartmentLabel } from "@/hooks/useUserDepartmentRole";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useHWTrainings } from "@/hooks/useHWTrainings";
import { useHWBirthdays } from "@/hooks/useHWBirthdays";
import { useHWDMConversations } from "@/hooks/useHWDMs";
import { useHWWorkbench } from "@/hooks/useHWWorkbench";
import { getWorkbenchAppForPage } from "@/config/workbench-registry";
import { useHWUserLayout } from "@/hooks/useHWUserLayout";
import { type ElementRect } from "./HWDraggableHome";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare, GraduationCap, Cake, Shield, AlertTriangle,
  Megaphone, Users, FileText, ChevronRight, Clock, TrendingUp, TrendingDown,
  Plus, X, Zap, Bot, Crown, DollarSign, Store, LayoutDashboard, ShoppingCart,
  Warehouse, Briefcase, User, Send, Upload, Home, Target,
  ClipboardList, BarChart3, Package, Kanban, Headset, Rocket, GanttChart,
  CheckSquare, Settings, FlaskConical, ListTodo, MapPin, Calendar,
} from "lucide-react";
import { useHWShortcuts, type HWShortcut } from "@/hooks/useHWShortcuts";
import { useNavigate } from "react-router-dom";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { HWDraggableHome, type DeskDropData } from "./HWDraggableHome";
import { HWMobileHomeStack } from "./HWMobileHomeStack";
import { DeskAppIcon } from "./DeskAppIcon";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQueryClient } from "@tanstack/react-query";
import { useDeskPins, getPinnedItemDeskKey, type DeskPinnedItem } from "@/hooks/useDeskPins";
import { PinChoiceDialog } from "./PinToDeskButton";

/* ── Widget catalog for context-menu "Adicionar Widget" ───── */
const WIDGET_CATALOG = [
  { id: 'kpis', label: 'Indicadores (KPIs)', description: 'Painel de indicadores', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'shortcuts', label: 'Atalhos', description: 'Acesso rápido a views e ações', icon: <Zap className="h-4 w-4" /> },
  { id: 'messages', label: 'Mensagens', description: 'Mensagens não lidas', icon: <MessageSquare className="h-4 w-4" /> },
  { id: 'shift', label: 'Meu Turno', description: 'Status do turno', icon: <Clock className="h-4 w-4" /> },
  { id: 'trainings', label: 'Treinamentos', description: 'Treinamentos pendentes', icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'birthdays', label: 'Aniversários', description: 'Aniversários da equipe', icon: <Cake className="h-4 w-4" /> },
];

interface HWHomeViewProps {
  delegateName?: string;
  onNavigate?: (view: string) => void;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

interface DeskCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  onClick?: () => void;
  accent?: string;
}

function DeskCard({ title, icon, children, delay = 0, onClick, accent }: DeskCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="rounded-xl p-4 cursor-pointer transition-all duration-200 h-full w-full flex flex-col overflow-hidden
        hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01] backdrop-blur-sm"
      style={{
        backgroundColor: '#18181B',
        border: '1px solid #27272A',
        borderLeft: accent ? `3px solid ${accent}` : undefined,
      }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span style={{ color: accent || '#71717A' }}>{icon}</span>
          <h3 className="text-xs font-semibold tracking-wide uppercase" style={{ color: '#A1A1AA' }}>
            {title}
          </h3>
        </div>
        {onClick && <ChevronRight className="h-3.5 w-3.5" style={{ color: '#52525B' }} />}
      </div>
      <div className="flex-1">{children}</div>
    </motion.div>
  );
}

function UnreadMessagesCard({ onNavigate }: { onNavigate?: (v: string) => void }) {
  const { conversations } = useHWDMConversations();
  const unread = conversations.filter(c => c.last_message && !c.last_message_is_mine && !c.last_message_read_by_other);

  return (
    <DeskCard
      title="Mensagens"
      icon={<MessageSquare className="h-4 w-4" />}
      delay={0.1}
      accent="#3B82F6"
      onClick={() => onNavigate?.('messages')}
    >
      {unread.length > 0 ? (
        <div className="space-y-2">
          <p className="text-2xl font-bold" style={{ color: '#3B82F6' }}>{unread.length}</p>
          <p className="text-[11px]" style={{ color: '#71717A' }}>mensagens não lidas</p>
          {unread.slice(0, 2).map(c => (
            <div key={c.id} className="flex items-center gap-2 mt-1">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[8px] font-semibold" style={{ backgroundColor: '#27272A', color: '#A1A1AA' }}>
                  {c.other_user_initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium truncate" style={{ color: '#D4D4D8' }}>{c.other_user_name}</p>
                <p className="text-[10px] truncate" style={{ color: '#52525B' }}>{c.last_message}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs" style={{ color: '#52525B' }}>Nenhuma mensagem pendente ✓</p>
      )}
    </DeskCard>
  );
}

function PendingTrainingsCard({ onNavigate }: { onNavigate?: (v: string) => void }) {
  const { user } = useAuth();
  const { data: tenantId } = useHWTenantId();
  const { data: trainings } = useHWTrainings(tenantId || undefined, user?.id);

  const pending = trainings?.filter(t => t.status !== 'completed') || [];
  const now = new Date();
  const overdue = pending.filter(t => t.dueDate && new Date(t.dueDate) < now);
  const upcoming = pending.filter(t => !overdue.includes(t));

  return (
    <DeskCard
      title="Treinamentos"
      icon={<GraduationCap className="h-4 w-4" />}
      delay={0.15}
      accent={overdue.length > 0 ? '#EF4444' : '#EAB308'}
      onClick={() => onNavigate?.('trainings')}
    >
      {pending.length === 0 ? (
        <p className="text-xs" style={{ color: '#52525B' }}>Todos os treinamentos em dia ✓</p>
      ) : (
        <div className="space-y-1.5">
          {overdue.length > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
              <AlertTriangle className="h-3 w-3" style={{ color: '#EF4444' }} />
              <span className="text-[11px] font-medium" style={{ color: '#EF4444' }}>
                {overdue.length} vencido{overdue.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
          {upcoming.slice(0, 3).map(t => (
            <div key={t.id} className="flex items-center gap-2">
              <Clock className="h-3 w-3 shrink-0" style={{ color: '#71717A' }} />
              <span className="text-[11px] truncate flex-1" style={{ color: '#D4D4D8' }}>{t.title}</span>
              {t.dueDate && (
                <span className="text-[10px] shrink-0" style={{ color: '#52525B' }}>
                  {new Date(t.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </DeskCard>
  );
}

function BirthdaysCard() {
  const { data: tenantId } = useHWTenantId();
  const { data: birthdays } = useHWBirthdays(tenantId || undefined);

  if (!birthdays?.length) return (
    <DeskCard title="Aniversários" icon={<Cake className="h-4 w-4" />} delay={0.2} accent="#F59E0B">
      <p className="text-xs" style={{ color: '#52525B' }}>Nenhum aniversário próximo 🎂</p>
    </DeskCard>
  );

  return (
    <DeskCard
      title="Aniversários"
      icon={<Cake className="h-4 w-4" />}
      delay={0.2}
      accent="#F59E0B"
    >
      <div className="space-y-2">
        {birthdays.slice(0, 4).map(b => (
          <div key={b.userId} className="flex items-center gap-2">
            <span className="text-base">{b.isToday ? '🎂' : '🎈'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium truncate" style={{ color: '#D4D4D8' }}>{b.name}</p>
              <p className="text-[10px]" style={{ color: b.isToday ? '#EAB308' : '#52525B' }}>
                {b.isToday ? 'Hoje! 🎉' : `em ${b.daysUntil} dia${b.daysUntil > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </DeskCard>
  );
}

// ─── Shortcut icon/catalog helpers ─────────────────────────────
const ICON_MAP: Record<string, typeof Zap> = {
  Zap, Home: ChevronRight, Megaphone, MessageSquare, Users, FileText, User, Briefcase,
  GraduationCap, Bot, Crown, DollarSign, Store, LayoutDashboard, ShoppingCart,
  Warehouse, Send, Upload, Plus, ChevronRight,
};
function getShortcutIcon(name: string) {
  return ICON_MAP[name] || Zap;
}

interface ShortcutOption {
  label: string; icon: string; shortcut_type: 'view' | 'module' | 'action'; target: string; category: string;
}

const SHORTCUT_CATALOG: ShortcutOption[] = [
  { label: 'Home', icon: 'Home', shortcut_type: 'view', target: 'home', category: 'Views' },
  { label: 'Mural', icon: 'Megaphone', shortcut_type: 'view', target: 'mural', category: 'Views' },
  { label: 'Mensagens', icon: 'MessageSquare', shortcut_type: 'view', target: 'messages', category: 'Views' },
  { label: 'Equipe', icon: 'Users', shortcut_type: 'view', target: 'team', category: 'Views' },
  { label: 'Documentos', icon: 'FileText', shortcut_type: 'view', target: 'documents', category: 'Views' },
  { label: 'Treinamentos', icon: 'GraduationCap', shortcut_type: 'view', target: 'trainings', category: 'Views' },
  { label: 'Recrutamento', icon: 'Briefcase', shortcut_type: 'view', target: 'recruitment', category: 'Views' },
  { label: 'Meu Perfil', icon: 'User', shortcut_type: 'view', target: 'profile', category: 'Views' },
  { label: 'NexusIA', icon: 'Bot', shortcut_type: 'module', target: '/app/ia', category: 'Aplicativos' },
  { label: 'Domínio', icon: 'Crown', shortcut_type: 'module', target: '/app/dominio', category: 'Aplicativos' },
  { label: 'Financeiro', icon: 'DollarSign', shortcut_type: 'module', target: '/app/financeiro', category: 'Aplicativos' },
  { label: 'Loja', icon: 'Store', shortcut_type: 'module', target: '/app/loja', category: 'Aplicativos' },
  { label: 'RH', icon: 'Users', shortcut_type: 'module', target: '/app/rh', category: 'Aplicativos' },
  { label: 'Marketing', icon: 'LayoutDashboard', shortcut_type: 'module', target: '/app/marketing', category: 'Aplicativos' },
  { label: 'Trade', icon: 'ShoppingCart', shortcut_type: 'module', target: '/app/trade', category: 'Aplicativos' },
  { label: 'Academy', icon: 'GraduationCap', shortcut_type: 'module', target: '/app/academy', category: 'Aplicativos' },
  { label: 'CD', icon: 'Warehouse', shortcut_type: 'module', target: '/app/cd', category: 'Aplicativos' },
  { label: 'Criar Comunicado', icon: 'Send', shortcut_type: 'action', target: 'action:new-post', category: 'Ações' },
  { label: 'Enviar Documento', icon: 'Upload', shortcut_type: 'action', target: 'action:upload-doc', category: 'Ações' },
  { label: 'Novo Treinamento', icon: 'GraduationCap', shortcut_type: 'action', target: 'action:new-training', category: 'Ações' },
];

function AddShortcutDialog({ open, onOpenChange, existingTargets, onAdd }: {
  open: boolean; onOpenChange: (o: boolean) => void; existingTargets: string[]; onAdd: (opt: ShortcutOption) => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const available = SHORTCUT_CATALOG.filter(s => !existingTargets.includes(s.target));
    if (!search.trim()) return available;
    return available.filter(s => s.label.toLowerCase().includes(search.toLowerCase()));
  }, [search, existingTargets]);
  const grouped = useMemo(() => {
    const groups: Record<string, ShortcutOption[]> = {};
    for (const s of filtered) (groups[s.category] ??= []).push(s);
    return groups;
  }, [filtered]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" style={{ backgroundColor: '#18181B', borderColor: '#27272A' }}>
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>
            <Plus className="inline h-4 w-4 mr-2" style={{ color: '#EA580C' }} />
            Adicionar Atalho
          </DialogTitle>
        </DialogHeader>
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
          className="h-8 text-xs rounded-lg" style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />
        <ScrollArea className="h-64 mt-2">
          {Object.entries(grouped).length === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: '#52525B' }}>Todos os atalhos já foram adicionados</p>
          ) : Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider px-2 mb-1" style={{ color: '#52525B' }}>{cat}</p>
              {items.map(item => {
                const Icon = getShortcutIcon(item.icon);
                return (
                  <button key={item.target} onClick={() => { onAdd(item); onOpenChange(false); setSearch(''); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors hover:bg-zinc-800" style={{ color: '#D4D4D8' }}>
                    <Icon className="h-4 w-4" style={{ color: '#71717A' }} />
                    <span>{item.label}</span>
                    <Plus className="h-3 w-3 ml-auto" style={{ color: '#52525B' }} />
                  </button>
                );
              })}
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function QuickActionsCard({ onNavigate }: { onNavigate?: (v: string) => void }) {
  const navigate = useNavigate();
  const { shortcuts, addShortcut, removeShortcut } = useHWShortcuts();
  const [showAdd, setShowAdd] = useState(false);

  const handleNav = (s: HWShortcut) => {
    if (s.shortcut_type === 'view') onNavigate?.(s.target);
    else if (s.shortcut_type === 'module') navigate(s.target);
    else if (s.shortcut_type === 'action') {
      switch (s.target) {
        case 'action:new-post': onNavigate?.('mural'); break;
        case 'action:upload-doc': onNavigate?.('documents'); break;
        case 'action:new-training': onNavigate?.('trainings'); break;
        default: break;
      }
    }
  };

  const handleAdd = (opt: ShortcutOption) => {
    addShortcut.mutate({ label: opt.label, icon: opt.icon, shortcut_type: opt.shortcut_type, target: opt.target }, {
      onSuccess: () => toast.success(`"${opt.label}" adicionado aos atalhos`),
    });
  };

  const handleRemove = (id: string) => {
    removeShortcut.mutate(id, {
      onSuccess: () => toast.success('Atalho removido'),
    });
  };

  return (
    <DeskCard
      title="Atalhos"
      icon={
        <button onClick={() => setShowAdd(true)} className="p-0.5 rounded hover:bg-zinc-700 transition-colors">
          <Plus className="h-3.5 w-3.5" style={{ color: '#71717A' }} />
        </button>
      }
      delay={0.25}
    >
      {shortcuts.length === 0 ? (
        <button onClick={() => setShowAdd(true)}
          className="w-full flex flex-col items-center gap-2 py-4 rounded-lg border border-dashed transition-colors hover:bg-zinc-800"
          style={{ borderColor: '#3F3F46', color: '#52525B' }}>
          <Plus className="h-5 w-5" />
          <span className="text-[10px]">Adicionar atalho</span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {shortcuts.map(s => {
            const Icon = getShortcutIcon(s.icon);
            return (
              <div key={s.id} className="group relative">
                <button onClick={() => handleNav(s)}
                  className="w-full flex flex-col items-center gap-1.5 p-2.5 rounded-lg transition-colors hover:bg-zinc-800">
                  <Icon className="h-5 w-5" style={{ color: '#A1A1AA' }} />
                  <span className="text-[10px] text-center leading-tight truncate w-full" style={{ color: '#A1A1AA' }}>{s.label}</span>
                </button>
                <button onClick={() => handleRemove(s.id)}
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: '#27272A', color: '#71717A' }}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      <AddShortcutDialog open={showAdd} onOpenChange={setShowAdd} existingTargets={shortcuts.map(s => s.target)} onAdd={handleAdd} />
    </DeskCard>
  );
}

function MyShiftCard() {
  const now = new Date();
  const hours = now.getHours();
  const isWorkHours = hours >= 8 && hours < 18;

  return (
    <DeskCard
      title="Meu Turno"
      icon={<Clock className="h-4 w-4" />}
      delay={0.12}
      accent={isWorkHours ? '#22C55E' : '#71717A'}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: isWorkHours ? '#22C55E' : '#71717A' }}
          />
          <span className="text-xs font-medium" style={{ color: '#D4D4D8' }}>
            {isWorkHours ? 'Em turno' : 'Fora do turno'}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span style={{ color: '#A1A1AA' }}>Horário</span>
          <span className="font-medium" style={{ color: '#D4D4D8' }}>08:00 – 18:00</span>
        </div>
        <div className="flex justify-between text-xs">
          <span style={{ color: '#A1A1AA' }}>Próxima folga</span>
          <span className="font-medium" style={{ color: '#D4D4D8' }}>Domingo</span>
        </div>
      </div>
    </DeskCard>
  );
}

function DelegationCard({ delegateName }: { delegateName: string }) {
  return (
    <DeskCard
      title="Delegação Ativa"
      icon={<Shield className="h-4 w-4" />}
      delay={0.05}
      accent="#EA580C"
    >
      <p className="text-xs" style={{ color: '#A1A1AA' }}>
        Atuando em nome de <strong style={{ color: '#EA580C' }}>{delegateName}</strong>
      </p>
    </DeskCard>
  );
}

interface MockKPI { label: string; value: string; delta: string; positive: boolean; }

function getKPIsForDepartment(profile: 'diretor' | 'chefe', department: string | null): MockKPI[] {
  // Director-level cross-department KPIs
  if (profile === 'diretor' && (!department || department === 'diretoria')) {
    return [
      { label: 'Colaboradores Ativos', value: '247', delta: '+3 este mês', positive: true },
      { label: 'Posts esta Semana', value: '34', delta: '+12% vs semana ant.', positive: true },
      { label: 'Treinamentos Pendentes', value: '18', delta: '-5 vs mês ant.', positive: true },
      { label: 'Taxa de Engajamento', value: '78%', delta: '+4pp', positive: true },
      { label: 'Equipes Ativas', value: '17', delta: 'Todas ativas', positive: true },
      { label: 'Aprovações Pendentes', value: '5', delta: '2 urgentes', positive: false },
    ];
  }

  // Department-specific KPIs
  switch (department) {
    case 'rh':
      return [
        { label: 'Candidatos Pipeline', value: '23', delta: '+8 esta semana', positive: true },
        { label: 'Vagas Abertas', value: '4', delta: '1 urgente', positive: false },
        { label: 'Turnover Mês', value: '2.1%', delta: '-0.3pp', positive: true },
        { label: 'Onboarding Ativo', value: '3', delta: 'Iniciando', positive: true },
      ];
    case 'marketing':
      return [
        { label: 'Demandas Ativas', value: '12', delta: '+3 novas', positive: true },
        { label: 'Score Produtividade', value: '87%', delta: '+5pp', positive: true },
        { label: 'Campanhas Ativas', value: '6', delta: '2 finalizando', positive: true },
        { label: 'Aprovações Pendentes', value: '4', delta: '1 urgente', positive: false },
      ];
    case 'trade':
      return [
        { label: 'Execuções Ativas', value: '8', delta: '3 concluídas', positive: true },
        { label: 'Compliance Geral', value: '92%', delta: '+3pp', positive: true },
        { label: 'Fornecedores Ativos', value: '15', delta: 'Todos em dia', positive: true },
        { label: 'Ações Pendentes', value: '3', delta: 'Prazo próximo', positive: false },
      ];
    case 'tecnologia':
      return [
        { label: 'Sprints Ativos', value: '2', delta: 'Em andamento', positive: true },
        { label: 'Roadmap Progresso', value: '68%', delta: '+12% este mês', positive: true },
        { label: 'Governança TI', value: '94%', delta: 'Compliance', positive: true },
        { label: 'Decisões Pendentes', value: '3', delta: '1 bloqueante', positive: false },
      ];
    case 'ti':
      return [
        { label: 'Tickets Abertos', value: '7', delta: '-3 vs semana ant.', positive: true },
        { label: 'SLA Cumprido', value: '96%', delta: '+2pp', positive: true },
        { label: 'Inventário', value: '142', delta: 'Atualizado', positive: true },
        { label: 'Incidentes Mês', value: '2', delta: '-1 vs mês ant.', positive: true },
      ];
    case 'financeiro':
      return [
        { label: 'DRE Status', value: 'OK', delta: 'Atualizado', positive: true },
        { label: 'Alertas Financeiros', value: '2', delta: '1 crítico', positive: false },
        { label: 'Budget Utilizado', value: '67%', delta: 'Dentro do plano', positive: true },
        { label: 'Verbas Alocadas', value: '89%', delta: '+4pp', positive: true },
      ];
    case 'loja':
      return [
        { label: 'Vendas Hoje', value: 'R$ 42k', delta: '+8% vs ontem', positive: true },
        { label: 'Ruptura', value: '3.2%', delta: '-0.5pp', positive: true },
        { label: 'Escalas Completas', value: '95%', delta: 'Semana', positive: true },
        { label: 'Pendências', value: '2', delta: 'Atenção', positive: false },
      ];
    default:
      return [
        { label: 'Membros da Equipe', value: '14', delta: '2 em férias', positive: true },
        { label: 'Posts do Mês', value: '8', delta: '+2 vs mês ant.', positive: true },
        { label: 'Treinamentos Pendentes', value: '3', delta: '1 vence amanhã', positive: false },
        { label: 'Engajamento Equipe', value: '85%', delta: '+6pp', positive: true },
      ];
  }
}

function KPIDashboardCard({ profile, department }: { profile: 'diretor' | 'chefe'; department: string | null }) {
  const kpis = getKPIsForDepartment(profile, department);
  const deptLabel = department ? getDepartmentLabel(department) : undefined;

  return (
    <DeskCard
      title={deptLabel ? `Indicadores · ${deptLabel}` : 'Indicadores'}
      icon={<TrendingUp className="h-4 w-4" />}
      delay={0.05}
      accent="#EA580C"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {kpis.map((kpi, i) => (
          <div key={i} className="rounded-lg p-2.5" style={{ backgroundColor: '#27272A' }}>
            <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#71717A' }}>{kpi.label}</p>
            <p className="text-lg font-bold mt-0.5" style={{ color: '#FAFAFA' }}>{kpi.value}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {kpi.positive ? (
                <TrendingUp className="h-2.5 w-2.5" style={{ color: '#22C55E' }} />
              ) : (
                <TrendingDown className="h-2.5 w-2.5" style={{ color: '#EF4444' }} />
              )}
              <p className="text-[10px]" style={{ color: kpi.positive ? '#22C55E' : '#EF4444' }}>{kpi.delta}</p>
            </div>
          </div>
        ))}
      </div>
    </DeskCard>
  );
}

export function HWHomeView({ delegateName, onNavigate }: HWHomeViewProps) {
  const { firstName } = useHWUserDisplay();
  const { profile, department } = useHWProfile();
  const deptLabel = department ? getDepartmentLabel(department) : null;
  const { resolvedPinnedPages } = useHWWorkbench();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  // Editing mode state (true = wobble / edit mode active)
  const [isEditing, setIsEditing] = useState(false);

  // DB-persisted desk positions
  const { deskPositions, updateDeskPositions } = useHWUserLayout();

  // Build initialPositions: prefer DB, merge with localStorage for any extras
  const initialPositions = useMemo<Record<string, ElementRect>>(() => {
    try {
      const local: Record<string, ElementRect> = JSON.parse(localStorage.getItem('hw-desk-positions') || '{}');
      const db = (deskPositions || {}) as Record<string, ElementRect>;
      // DB wins over localStorage for matching keys
      return { ...local, ...db };
    } catch {
      return (deskPositions || {}) as Record<string, ElementRect>;
    }
  }, [deskPositions]);

  const handlePositionsChange = useCallback((positions: Record<string, ElementRect>) => {
    updateDeskPositions(positions as Record<string, unknown>);
  }, [updateDeskPositions]);

  // Add widget dialog
  const [showAddWidget, setShowAddWidget] = useState(false);

  // Track which apps have been removed from the desk (but not from sidebar)
  const [hiddenDeskApps, setHiddenDeskApps] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('hw-hidden-desk-apps');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  // Track which widgets have been removed
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('hw-hidden-widgets');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  // Desk apps = pinned pages minus hidden ones
  const deskApps = React.useMemo(
    () => resolvedPinnedPages.filter(p => !hiddenDeskApps.includes(p.id)),
    [resolvedPinnedPages, hiddenDeskApps]
  );

  // Custom desk items dragged from sidebar
  const [customDeskItems, setCustomDeskItems] = useState<DeskDropData[]>(() => {
    try {
      const stored = localStorage.getItem('hw-custom-desk-items');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const SIDEBAR_ICON_MAP: Record<string, typeof Home> = {
    Home, Megaphone, MessageSquare, Users, FileText, User, Briefcase,
    GraduationCap, Target, CheckSquare, ClipboardList, BarChart3,
    LayoutDashboard, Package, Kanban, Headset, TrendingUp, Rocket, GanttChart,
    Store, DollarSign, Settings, FlaskConical, Zap, ListTodo, MapPin, Calendar,
    Shield, Crown, Warehouse, Bot, Clock,
  };

  const isLeader = profile === 'diretor' || profile === 'chefe' || profile === 'secretaria';

  // Build unified widget map (widgets + individual desk app icons + custom items)
  const widgetMap = useMemo(() => {
    const map: Record<string, React.ReactNode> = {
      shortcuts: <QuickActionsCard key="shortcuts" onNavigate={onNavigate} />,
      messages: <UnreadMessagesCard key="messages" onNavigate={onNavigate} />,
      shift: <MyShiftCard key="shift" />,
      trainings: <PendingTrainingsCard key="trainings" onNavigate={onNavigate} />,
      birthdays: <BirthdaysCard key="birthdays" />,
    };
    if (isLeader) {
      map.kpis = <KPIDashboardCard key="kpis" profile={profile === 'chefe' ? 'chefe' : 'diretor'} department={department} />;
    }
    // Each desk app is its own draggable item
    for (const page of deskApps) {
      const appKey = `app:${page.id}`;
      const module = getWorkbenchAppForPage(page.id);
      const accentColor = module?.appColor || '#EA580C';
      // Derive numeric wobble seed from id for DeskAppIcon
      let wobbleSeedNum = 0;
      let h = 5381;
      for (let i = 0; i < appKey.length; i++) { h = ((h << 5) + h) ^ appKey.charCodeAt(i); h |= 0; }
      wobbleSeedNum = Math.abs(h);
      map[appKey] = (
        <DeskAppIcon
          key={appKey}
          title={page.title}
          icon={page.icon}
          accentColor={accentColor}
          appLabel={module?.appLabel}
          delay={0}
          isEditing={isEditing}
          wobbleSeed={wobbleSeedNum}
          onClick={() => { if (!isEditing) onNavigate?.(`workbench:${page.id}`); }}
          onRemove={() => {
            setHiddenDeskApps(prev => {
              const next = [...prev, page.id];
              localStorage.setItem('hw-hidden-desk-apps', JSON.stringify(next));
              return next;
            });
          }}
        />
      );
    }

    // Custom desk items from sidebar drops
    for (const item of customDeskItems) {
      const isWidget = (item as any)._asWidget === true;
      const deskKey = isWidget
        ? (item.sourceType === 'pinned-page' ? `desk-widget:${item.id}` : `desk-nav-widget:${item.id}`)
        : (item.sourceType === 'pinned-page' ? `desk:${item.id}` : `desk-nav:${item.id}`);

      if (isWidget) {
        // Widget card
        const accent = item.accentColor || '#EA580C';
        const IconComp = SIDEBAR_ICON_MAP[item.icon] || Package;
        map[deskKey] = (
          <DeskCard
            key={deskKey}
            title={item.label}
            icon={<IconComp className="h-4 w-4" />}
            accent={accent}
            onClick={() => {
              if (isEditing) return;
              if (item.sourceType === 'pinned-page') {
                onNavigate?.(`workbench:${item.id}`);
              } else {
                onNavigate?.(item.id);
              }
            }}
          >
            <p className="text-[11px]" style={{ color: '#71717A' }}>
              {item.appLabel || 'Clique para abrir'}
            </p>
          </DeskCard>
        );
      } else {
        // Icon (atalho)
        let ws = 0;
        let wh = 5381;
        for (let i = 0; i < deskKey.length; i++) { wh = ((wh << 5) + wh) ^ deskKey.charCodeAt(i); wh |= 0; }
        ws = Math.abs(wh);
        map[deskKey] = (
          <DeskAppIcon
            key={deskKey}
            title={item.label}
            icon={item.icon}
            accentColor={item.accentColor || '#EA580C'}
            appLabel={item.appLabel}
            delay={0}
            isEditing={isEditing}
            wobbleSeed={ws}
            onClick={() => {
              if (isEditing) return;
              if (item.sourceType === 'pinned-page') {
                onNavigate?.(`workbench:${item.id}`);
              } else {
                onNavigate?.(item.id);
              }
            }}
            onRemove={() => {
              setCustomDeskItems(prev => {
                const next = prev.filter(i => !(i.id === item.id && i.sourceType === item.sourceType && (i as any)._asWidget === (item as any)._asWidget));
                localStorage.setItem('hw-custom-desk-items', JSON.stringify(next));
                return next;
              });
            }}
          />
        );
      }
    }

    return map;
  }, [onNavigate, isLeader, profile, department, deskApps, customDeskItems, isEditing]);

  const availableWidgets = useMemo(() => {
    const allKeys = isLeader
      ? ['kpis', 'shortcuts', 'messages', 'shift', 'trainings', 'birthdays']
      : ['shortcuts', 'messages', 'shift', 'trainings', 'birthdays'];
    const visible = allKeys.filter(k => !hiddenWidgets.includes(k));
    // Add each desk app as a separate draggable item
    for (const page of deskApps) {
      visible.push(`app:${page.id}`);
    }
    // Add custom desk items
    for (const item of customDeskItems) {
      const isWidget = (item as any)._asWidget === true;
      const deskKey = isWidget
        ? (item.sourceType === 'pinned-page' ? `desk-widget:${item.id}` : `desk-nav-widget:${item.id}`)
        : (item.sourceType === 'pinned-page' ? `desk:${item.id}` : `desk-nav:${item.id}`);
      visible.push(deskKey);
    }
    return visible;
  }, [isLeader, hiddenWidgets, deskApps, customDeskItems]);

  // Mobile: fixed logical order of core widgets only (no app icons / custom desk items)
  const mobileWidgetOrder = useMemo(() => {
    const defaultOrder = isLeader
      ? ['kpis', 'messages', 'shift', 'trainings', 'birthdays', 'shortcuts']
      : ['messages', 'shift', 'trainings', 'birthdays', 'shortcuts'];
    // Try to load persisted mobile order
    try {
      const stored = localStorage.getItem('hw-mobile-widget-order');
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        // Filter to only valid, non-hidden keys
        const valid = parsed.filter(k => defaultOrder.includes(k) && !hiddenWidgets.includes(k));
        // Add any new keys that weren't in the stored order
        const missing = defaultOrder.filter(k => !valid.includes(k) && !hiddenWidgets.includes(k));
        return [...valid, ...missing];
      }
    } catch { /* noop */ }
    return defaultOrder.filter(k => !hiddenWidgets.includes(k));
  }, [isLeader, hiddenWidgets]);

  // Context menu handlers
  // Helper: clean position from localStorage when removing an item (Fix C)
  const cleanPosition = React.useCallback((id: string) => {
    try {
      const STORAGE_KEY = 'hw-desk-positions';
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      delete saved[id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch { /* noop */ }
  }, []);

  const handleRemoveWidget = React.useCallback((widgetId: string) => {
    cleanPosition(widgetId);

    // Custom desk items (from sidebar drag)
    if (widgetId.startsWith('desk:') || widgetId.startsWith('desk-nav:') || widgetId.startsWith('desk-widget:') || widgetId.startsWith('desk-nav-widget:')) {
      setCustomDeskItems(prev => {
        const next = prev.filter(i => {
          const key = i.sourceType === 'pinned-page'
            ? (widgetId.includes('-widget') ? `desk-widget:${i.id}` : `desk:${i.id}`)
            : (widgetId.includes('-widget') ? `desk-nav-widget:${i.id}` : `desk-nav:${i.id}`);
          return key !== widgetId;
        });
        localStorage.setItem('hw-custom-desk-items', JSON.stringify(next));
        return next;
      });
      toast.success('Item removido da mesa');
      return;
    }
    // Individual app icon
    if (widgetId.startsWith('app:')) {
      const pageId = widgetId.replace('app:', '');
      setHiddenDeskApps(prev => {
        const next = [...new Set([...prev, pageId])];
        localStorage.setItem('hw-hidden-desk-apps', JSON.stringify(next));
        return next;
      });
      toast.success('Aplicativo removido da mesa');
      return;
    }
    setHiddenWidgets(prev => {
      const next = [...prev, widgetId];
      localStorage.setItem('hw-hidden-widgets', JSON.stringify(next));
      return next;
    });
    toast.success('Widget removido da mesa');
  }, [cleanPosition]);

  const handleAddWidget = React.useCallback((widgetId: string) => {
    setHiddenWidgets(prev => {
      const next = prev.filter(id => id !== widgetId);
      localStorage.setItem('hw-hidden-widgets', JSON.stringify(next));
      return next;
    });
    toast.success('Widget adicionado à mesa');
  }, []);

  const handleMoveToTop = React.useCallback((_widgetId: string) => {
    toast.success('Widget movido para o início');
  }, []);

  const handleAutoOrganize = React.useCallback(() => {
    toast.success('Mesa organizada');
  }, []);

  const handleRefresh = React.useCallback(() => {
    queryClient.invalidateQueries();
    toast.success('Atualizando dados...');
  }, [queryClient]);

  const handleToggleEdit = useCallback(() => {
    setIsEditing(prev => !prev);
  }, []);

  // Sidebar drop handler
  const handleSidebarDrop = React.useCallback((data: DeskDropData, canvasX: number, canvasY: number, asWidget: boolean) => {
    // Check if already on desk
    const exists = customDeskItems.some(i => i.id === data.id && i.sourceType === data.sourceType);
    if (exists) {
      toast.info('Este item já está na mesa');
      return;
    }

    // Store the item with a marker for widget vs icon
    const itemToStore: DeskDropData & { _asWidget?: boolean } = { ...data };
    if (asWidget) {
      (itemToStore as any)._asWidget = true;
    }

    setCustomDeskItems(prev => {
      const next = [...prev, itemToStore];
      localStorage.setItem('hw-custom-desk-items', JSON.stringify(next));
      return next;
    });

    // Set position for the new item
    const deskKey = asWidget
      ? (data.sourceType === 'pinned-page' ? `desk-widget:${data.id}` : `desk-nav-widget:${data.id}`)
      : (data.sourceType === 'pinned-page' ? `desk:${data.id}` : `desk-nav:${data.id}`);
    const size = asWidget ? { w: 240, h: 200 } : { w: 96, h: 96 };
    const STORAGE_KEY = 'hw-desk-positions';
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    saved[deskKey] = { x: canvasX, y: canvasY, ...size };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

    toast.success(asWidget ? 'Widget adicionado à mesa' : 'Ícone adicionado à mesa');
  }, [customDeskItems]);

  // All possible widgets for the add dialog
  const addableWidgets = useMemo(() => {
    const allKeys = isLeader
      ? ['kpis', 'shortcuts', 'messages', 'shift', 'trainings', 'birthdays']
      : ['shortcuts', 'messages', 'shift', 'trainings', 'birthdays'];
    return WIDGET_CATALOG.filter(w => allKeys.includes(w.id) && hiddenWidgets.includes(w.id));
  }, [isLeader, hiddenWidgets]);

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden flex flex-col">
      <div className="px-3 sm:px-6 py-6 pb-20 lg:pb-6 flex-1 flex flex-col w-full max-w-[1200px] mx-auto">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-lg sm:text-xl font-bold" style={{ color: '#FAFAFA' }}>
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-xs mt-1" style={{ color: '#71717A' }}>
            {deptLabel ? `${deptLabel} · ` : ''}Aqui está o resumo do seu dia
          </p>
        </motion.div>

        {/* Delegation banner */}
        {profile === 'secretaria' && delegateName && (
          <DelegationCard delegateName={delegateName} />
        )}

        {/* Mobile: clean vertical stack — Desktop: draggable canvas */}
        {isMobile ? (
          <HWMobileHomeStack
            widgetMap={widgetMap}
            widgetOrder={mobileWidgetOrder}
            onOrderChange={(newOrder) => {
              // Persist mobile widget order
              try {
                localStorage.setItem('hw-mobile-widget-order', JSON.stringify(newOrder));
              } catch { /* noop */ }
            }}
            onRemoveWidget={handleRemoveWidget}
            onAddWidget={() => setShowAddWidget(true)}
            addableCount={addableWidgets.length}
          />
        ) : (
          <HWDraggableHome
            widgetMap={widgetMap}
            availableWidgets={availableWidgets}
            isEditing={isEditing}
            initialPositions={initialPositions}
            onPositionsChange={handlePositionsChange}
            onRemoveWidget={handleRemoveWidget}
            onMoveToTop={handleMoveToTop}
            onAddWidget={() => setShowAddWidget(true)}
            onAutoOrganize={handleAutoOrganize}
            onRefresh={handleRefresh}
            onToggleEdit={handleToggleEdit}
            onSidebarDrop={handleSidebarDrop}
          />
        )}
      </div>

      {/* Add Widget Dialog */}
      <Dialog open={showAddWidget} onOpenChange={setShowAddWidget}>
        <DialogContent className="max-w-sm" style={{ backgroundColor: '#18181B', borderColor: '#27272A' }}>
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>
              <Plus className="inline h-4 w-4 mr-2" style={{ color: '#EA580C' }} />
              Adicionar Widget
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-64 mt-2">
            {addableWidgets.length === 0 ? (
              <p className="text-xs text-center py-8" style={{ color: '#52525B' }}>
                Todos os widgets já estão na mesa
              </p>
            ) : (
              <div className="space-y-1">
                {addableWidgets.map(w => (
                  <button
                    key={w.id}
                    onClick={() => { handleAddWidget(w.id); setShowAddWidget(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-zinc-800"
                  >
                    <span style={{ color: '#71717A' }}>{w.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium" style={{ color: '#D4D4D8' }}>{w.label}</p>
                      <p className="text-[10px]" style={{ color: '#52525B' }}>{w.description}</p>
                    </div>
                    <Plus className="h-3.5 w-3.5 shrink-0" style={{ color: '#52525B' }} />
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
