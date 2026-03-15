import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHWUserDisplay } from "@/hooks/useHWUserDisplay";
import { supabase } from "@/integrations/supabase/client";
import { useHWProfile, getHWProfileLabel } from "@/hooks/useHWProfile";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useHWTrainings } from "@/hooks/useHWTrainings";
import { useHWDocuments } from "@/hooks/useHWDocuments";
import { useUserDepartmentRole, getDepartmentRoleLabel } from "@/hooks/useUserDepartmentRole";
import { useHWNotifPreferences } from "@/hooks/useHWNotifPreferences";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Edit3, GraduationCap, FileText, Bell, Calendar, Building2, Users, Loader2, CheckCircle2, Clock, AlertCircle, Download, Moon, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { pdf } from "@react-pdf/renderer";
import { TrainingCertificate } from "./TrainingCertificate";
import { EditProfileDialog } from "./EditProfileDialog";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string; icon: typeof CheckCircle2 }> = {
  completed: { bg: 'hsl(var(--success) / 0.15)', text: 'hsl(var(--success))', label: 'Concluído', icon: CheckCircle2 },
  in_progress: { bg: 'hsl(210 80% 60% / 0.15)', text: 'hsl(210 80% 60%)', label: 'Em andamento', icon: Clock },
  pending: { bg: 'hsl(var(--warning) / 0.15)', text: 'hsl(var(--warning))', label: 'Pendente', icon: AlertCircle },
};

const MOCK_TRAININGS = [
  { id: 't1', title: 'Operação de Caixa - Avançado', status: 'completed' as const, mandatory: true, completedAt: '20/02/2026' },
  { id: 't2', title: 'LGPD Básico', status: 'completed' as const, mandatory: true, completedAt: '15/01/2026' },
  { id: 't3', title: 'Atendimento ao Cliente', status: 'in_progress' as const, mandatory: false },
  { id: 't4', title: 'Segurança no Trabalho', status: 'pending' as const, mandatory: true },
  { id: 't5', title: 'Manipulação de Alimentos', status: 'pending' as const, mandatory: false },
];

export function HWProfileView({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const { displayName, initials, tenantName, user } = useHWUserDisplay();
  const { profile, profileLabel } = useHWProfile();
  const { data: departmentRole } = useUserDepartmentRole();
  const { data: tenantId } = useHWTenantId();
  const { data: dbTrainings, isLoading: trainingsLoading } = useHWTrainings(tenantId || undefined, user?.id);
  const { data: dbDocs } = useHWDocuments(tenantId || undefined);
  const { prefs: notifPrefs, update: updateNotifPrefs } = useHWNotifPreferences();

  const trainings = dbTrainings && dbTrainings.length > 0 ? dbTrainings : MOCK_TRAININGS;
  const completedCount = trainings.filter(t => t.status === 'completed').length;
  const progressPct = trainings.length > 0 ? Math.round((completedCount / trainings.length) * 100) : 0;

  const personalDocs = (dbDocs || []).filter((d: any) => d.contextType === 'personal');

  const roleLabel = departmentRole ? getDepartmentRoleLabel(departmentRole) : profileLabel;

  const [hiredAt, setHiredAt] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const avatarUrl = user?.user_metadata?.avatar_url;

  useEffect(() => {
    if (!user?.id) return;
    supabase.from("profiles").select("hired_at, phone, bio, avatar_url").eq("user_id", user.id).single().then(({ data }) => {
      if (data?.hired_at) setHiredAt(data.hired_at);
      if (data?.phone) setPhone(data.phone);
      if (data?.bio) setBio(data.bio);
    });
  }, [user?.id]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6">
        {/* Profile header with cover */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl overflow-hidden relative"
          style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>

          {/* Cover gradient */}
          <div className="h-28" style={{ background: "linear-gradient(135deg, hsl(var(--muted)), hsl(var(--card)))" }} />

          {/* Avatar overlapping cover */}
          <div className="px-6 pb-5 -mt-12">
            <div className="flex items-end gap-4">
              <Avatar className="h-20 w-20 ring-4 cursor-pointer shrink-0"
                onClick={() => setShowEditDialog(true)}
                style={{ "--tw-ring-color": "hsl(var(--card))" } as React.CSSProperties}>
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-xl font-bold" style={{ backgroundColor: "hsl(var(--muted))", color: "hsl(var(--foreground))" }}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold truncate text-foreground">{displayName}</h2>
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: "hsl(var(--success))" }} />
                </div>
                <p className="text-xs text-muted-foreground truncate">{roleLabel}</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl text-xs shrink-0 border-border text-muted-foreground hover:text-foreground"
                onClick={() => setShowEditDialog(true)}>
                <Edit3 className="h-3 w-3 mr-1.5" /> Editar
              </Button>
            </div>

            {/* Bio */}
            {bio && (
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{bio}</p>
            )}

            {/* Info chips */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-semibold"
                style={{ backgroundColor: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))" }}>
                {profileLabel}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full text-muted-foreground"
                style={{ backgroundColor: "hsl(var(--muted))" }}>
                <Building2 className="h-2.5 w-2.5" /> {tenantName}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full text-muted-foreground"
                style={{ backgroundColor: "hsl(var(--muted))" }}>
                <Calendar className="h-2.5 w-2.5" /> {hiredAt ? `Desde ${new Date(hiredAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}` : 'Desde Jan/2024'}
              </span>
            </div>

            {/* Contact info */}
            <div className="flex flex-wrap gap-3 mt-3 pt-3" style={{ borderTop: "1px solid hsl(var(--border))" }}>
              {user?.email && (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Mail className="h-3 w-3" /> {user.email}
                </span>
              )}
              {phone && (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Phone className="h-3 w-3" /> {phone}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Training progress */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="rounded-xl p-4 mt-4" style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="h-4 w-4" style={{ color: "hsl(var(--primary))" }} />
            <h3 className="text-sm font-semibold text-foreground">Treinamentos</h3>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "hsl(var(--success) / 0.15)", color: "hsl(var(--success))" }}>
              {completedCount}/{trainings.length} concluídos
            </span>
            <button onClick={() => onNavigate?.('trainings')} className="ml-auto text-[11px] font-medium hover:underline" style={{ color: "hsl(var(--primary))" }}>
              Ver todos →
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-muted-foreground">Progresso geral</span>
              <span className="text-[10px] font-bold text-foreground">{progressPct}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(var(--muted))" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, backgroundColor: "hsl(var(--success))" }} />
            </div>
          </div>

          {trainingsLoading ? (
            <div className="flex items-center justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-2">
              {trainings.map(t => {
                const s = STATUS_STYLES[t.status];
                const Icon = s.icon;
                const dueDate = (t as any).dueDate;
                const dueBadge = dueDate && t.status !== 'completed' ? (() => {
                  const now = new Date();
                  const due = new Date(dueDate);
                  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  if (diffDays < 0) return { label: 'Vencido', bg: 'hsl(var(--destructive) / 0.15)', color: 'hsl(var(--destructive))' };
                  if (diffDays <= 3) return { label: `Vence em ${diffDays}d`, bg: 'hsl(var(--warning) / 0.15)', color: 'hsl(var(--warning))' };
                  return null;
                })() : null;

                const handleDownloadCert = async () => {
                  const blob = await pdf(
                    <TrainingCertificate userName={displayName} trainingTitle={t.title} completedAt={t.completedAt || ''} tenantName={tenantName} mandatory={t.mandatory} />
                  ).toBlob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `certificado-${t.title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
                  a.click();
                  URL.revokeObjectURL(url);
                };

                return (
                  <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ backgroundColor: "hsl(var(--muted))" }}>
                    <Icon className="h-4 w-4 shrink-0" style={{ color: s.text }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate text-foreground/90">{t.title}</p>
                      {t.completedAt && <p className="text-[10px] mt-0.5 text-muted-foreground">Concluído em {t.completedAt}</p>}
                      {dueDate && t.status !== 'completed' && (
                        <p className="text-[10px] mt-0.5 text-muted-foreground">Prazo: {new Date(dueDate).toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {dueBadge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: dueBadge.bg, color: dueBadge.color }}>{dueBadge.label}</span>
                      )}
                      {t.mandatory && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: "hsl(var(--destructive) / 0.15)", color: "hsl(var(--destructive))" }}>Obrigatório</span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: s.bg, color: s.text }}>{s.label}</span>
                      {t.status === 'completed' && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded hover:bg-card" style={{ color: "hsl(var(--success))" }}
                          onClick={handleDownloadCert} title="Baixar certificado">
                          <Download className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Personal Documents */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-xl p-4 mt-4" style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Documentos Pessoais</h3>
            <span className="ml-auto text-xs text-muted-foreground">{personalDocs.length} arquivo{personalDocs.length !== 1 ? 's' : ''}</span>
          </div>
          {personalDocs.length > 0 ? (
            <div className="space-y-1">
              {personalDocs.slice(0, 5).map((doc: any) => (
                <div key={doc.id} className="flex items-center gap-2 p-2 rounded-xl" style={{ backgroundColor: "hsl(var(--muted))" }}>
                  <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: "hsl(var(--destructive))" }} />
                  <p className="text-xs truncate text-foreground/80">{doc.name}</p>
                  <span className="text-[10px] ml-auto shrink-0 text-muted-foreground">{doc.uploadedAt}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Acesse a aba Documentos para enviar seus documentos pessoais.</p>
          )}
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-xl p-4 mt-4" style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Notificações</h3>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl p-3" style={{ backgroundColor: "hsl(var(--muted))" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Moon className="h-3.5 w-3.5" style={{ color: "hsl(265 60% 60%)" }} />
                  <span className="text-xs font-medium text-foreground">Modo Não Perturbe</span>
                </div>
                <Switch checked={notifPrefs.dnd_active}
                  onCheckedChange={(v) => updateNotifPrefs.mutate({ dnd_active: v })} />
              </div>
              {notifPrefs.dnd_active && (
                <div className="flex items-center gap-2 mt-2">
                  <input type="time" value={notifPrefs.dnd_start || '22:00'}
                    onChange={(e) => updateNotifPrefs.mutate({ dnd_start: e.target.value })}
                    className="h-7 text-[10px] rounded-lg px-2 w-20 bg-background border text-muted-foreground"
                    style={{ borderColor: "hsl(var(--border))" }} />
                  <span className="text-[10px] text-muted-foreground">até</span>
                  <input type="time" value={notifPrefs.dnd_end || '07:00'}
                    onChange={(e) => updateNotifPrefs.mutate({ dnd_end: e.target.value })}
                    className="h-7 text-[10px] rounded-lg px-2 w-20 bg-background border text-muted-foreground"
                    style={{ borderColor: "hsl(var(--border))" }} />
                </div>
              )}
            </div>

            {[
              { label: 'Mensagens diretas', key: 'mute_channels' as const, inverted: true },
              { label: 'Menções em comentários', key: 'mute_mentions' as const, inverted: true },
              { label: 'Resumo diário (digest)', key: 'digest_enabled' as const, inverted: false },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <Switch
                  checked={item.inverted ? !notifPrefs[item.key] : notifPrefs[item.key]}
                  onCheckedChange={(v) => updateNotifPrefs.mutate({ [item.key]: item.inverted ? !v : v })}
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <EditProfileDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        currentName={displayName}
        currentAvatarUrl={avatarUrl}
        initials={initials}
      />
    </div>
  );
}
