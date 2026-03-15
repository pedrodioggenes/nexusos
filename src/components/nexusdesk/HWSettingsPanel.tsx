import { useHWUserDisplay } from "@/hooks/useHWUserDisplay";
import { useAuth } from "@/contexts/AuthContext";
import { useHWProfile } from "@/hooks/useHWProfile";
import { useHWUserLayout } from "@/hooks/useHWUserLayout";
import { useHWSettings } from "@/components/nexusdesk/HWSettingsProvider";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Settings, Palette, Bell, Layout, ShieldCheck, Accessibility, Keyboard,
  ChevronRight, RotateCcw, Monitor, Moon, Sun, MessageSquare,
  Megaphone, GraduationCap, Cake, Users, Eye, EyeOff, Volume2, VolumeX,
  Clock, Type, Contrast, Sparkles, X, Check,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface HWSettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SettingsSection = 'main' | 'appearance' | 'notifications' | 'layout' | 'privacy' | 'accessibility' | 'shortcuts';

const SECTIONS: { id: SettingsSection; label: string; icon: typeof Settings; desc: string }[] = [
  { id: 'appearance', label: 'Aparência', icon: Palette, desc: 'Tema, cores e densidade' },
  { id: 'notifications', label: 'Notificações', icon: Bell, desc: 'Alertas, sons e silêncio' },
  { id: 'layout', label: 'Layout & Workspace', icon: Layout, desc: 'Organização e widgets' },
  { id: 'privacy', label: 'Privacidade', icon: ShieldCheck, desc: 'Status, DMs e leitura' },
  { id: 'accessibility', label: 'Acessibilidade', icon: Accessibility, desc: 'Movimento, fonte e contraste' },
  { id: 'shortcuts', label: 'Atalhos do teclado', icon: Keyboard, desc: 'Referência rápida' },
];

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 gap-4" style={{ borderBottom: '1px solid #1F1F23' }}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: '#E4E4E7' }}>{label}</p>
        {description && <p className="text-[11px] mt-0.5" style={{ color: '#52525B' }}>{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SectionHeader({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 pb-4 mb-2" style={{ borderBottom: '1px solid #27272A' }}>
      <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors" style={{ color: '#71717A' }}>
        <ChevronRight className="h-4 w-4 rotate-180" />
      </button>
      <h2 className="text-base font-semibold" style={{ color: '#FAFAFA' }}>{label}</h2>
    </div>
  );
}

function ThemeOption({ icon: Icon, label, active, onClick }: { icon: typeof Sun; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
      style={{
        backgroundColor: active ? 'rgba(234,88,12,0.12)' : '#1F1F23',
        border: active ? '1.5px solid #EA580C' : '1.5px solid #27272A',
      }}
    >
      <Icon className="h-5 w-5" style={{ color: active ? '#EA580C' : '#71717A' }} />
      <span className="text-[11px] font-medium" style={{ color: active ? '#EA580C' : '#A1A1AA' }}>{label}</span>
    </button>
  );
}

// ---- SECTIONS ----

function AppearanceSection({ onBack }: { onBack: () => void }) {
  const { settings, updateSetting } = useHWSettings();

  const accents = ['#EA580C', '#3B82F6', '#8B5CF6', '#22C55E', '#EAB308', '#EC4899'];
  const densities = [
    { id: 'compact' as const, label: 'Compacto' },
    { id: 'default' as const, label: 'Normal' },
    { id: 'comfortable' as const, label: 'Confortável' },
  ];

  return (
    <div>
      <SectionHeader label="Aparência" onBack={onBack} />

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#52525B' }}>Tema</p>
        <div className="grid grid-cols-3 gap-2">
          <ThemeOption icon={Moon} label="Escuro" active={settings.theme === 'dark'} onClick={() => updateSetting('theme', 'dark')} />
          <ThemeOption icon={Sun} label="Claro" active={settings.theme === 'light'} onClick={() => updateSetting('theme', 'light')} />
          <ThemeOption icon={Monitor} label="Sistema" active={settings.theme === 'system'} onClick={() => updateSetting('theme', 'system')} />
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#52525B' }}>Cor de destaque</p>
        <div className="flex gap-2">
          {accents.map(color => (
            <button
              key={color}
              onClick={() => updateSetting('accentColor', color)}
              className="h-8 w-8 rounded-full transition-transform hover:scale-110 relative"
              style={{ backgroundColor: color, border: settings.accentColor === color ? '2px solid #FAFAFA' : '2px solid transparent' }}
            >
              {settings.accentColor === color && <Check className="h-3.5 w-3.5 absolute inset-0 m-auto" style={{ color: '#FFFFFF' }} />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#52525B' }}>Densidade da interface</p>
        <div className="flex gap-2">
          {densities.map(d => (
            <button
              key={d.id}
              onClick={() => updateSetting('density', d.id)}
              className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: settings.density === d.id ? 'rgba(234,88,12,0.12)' : '#1F1F23',
                color: settings.density === d.id ? '#EA580C' : '#A1A1AA',
                border: settings.density === d.id ? '1px solid #EA580C' : '1px solid #27272A',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationsSection({ onBack }: { onBack: () => void }) {
  const { settings, updateSetting } = useHWSettings();

  const channels: { key: 'notifyMessages' | 'notifyMural' | 'notifyTrainings' | 'notifyBirthdays' | 'notifyTeam'; label: string; icon: typeof MessageSquare }[] = [
    { key: 'notifyMessages', label: 'Mensagens diretas', icon: MessageSquare },
    { key: 'notifyMural', label: 'Comunicados e mural', icon: Megaphone },
    { key: 'notifyTrainings', label: 'Treinamentos e prazos', icon: GraduationCap },
    { key: 'notifyBirthdays', label: 'Aniversários da equipe', icon: Cake },
    { key: 'notifyTeam', label: 'Mudanças na equipe', icon: Users },
  ];

  return (
    <div>
      <SectionHeader label="Notificações" onBack={onBack} />

      <SettingRow label="Sons de notificação" description="Emitir som ao receber notificações">
        <div className="flex items-center gap-2">
          {settings.soundEnabled ? <Volume2 className="h-4 w-4" style={{ color: '#EA580C' }} /> : <VolumeX className="h-4 w-4" style={{ color: '#52525B' }} />}
          <Switch checked={settings.soundEnabled} onCheckedChange={v => updateSetting('soundEnabled', v)} />
        </div>
      </SettingRow>

      <div className="py-3" style={{ borderBottom: '1px solid #1F1F23' }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-medium" style={{ color: '#E4E4E7' }}>Modo silêncio</p>
            <p className="text-[11px]" style={{ color: '#52525B' }}>Pausar notificações em horários definidos</p>
          </div>
          <Switch checked={settings.quietHours} onCheckedChange={v => updateSetting('quietHours', v)} />
        </div>
        {settings.quietHours && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 mt-2 pl-1"
          >
            <Clock className="h-3.5 w-3.5" style={{ color: '#71717A' }} />
            <input
              type="time"
              value={settings.quietStart}
              onChange={e => updateSetting('quietStart', e.target.value)}
              className="bg-transparent text-xs px-2 py-1 rounded border"
              style={{ borderColor: '#27272A', color: '#A1A1AA' }}
            />
            <span className="text-xs" style={{ color: '#52525B' }}>até</span>
            <input
              type="time"
              value={settings.quietEnd}
              onChange={e => updateSetting('quietEnd', e.target.value)}
              className="bg-transparent text-xs px-2 py-1 rounded border"
              style={{ borderColor: '#27272A', color: '#A1A1AA' }}
            />
          </motion.div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#52525B' }}>Canais de notificação</p>
        {channels.map(ch => {
          const Icon = ch.icon;
          return (
            <div key={ch.key} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid #1F1F23' }}>
              <div className="flex items-center gap-2.5">
                <Icon className="h-4 w-4" style={{ color: '#71717A' }} />
                <span className="text-sm" style={{ color: '#D4D4D8' }}>{ch.label}</span>
              </div>
              <Switch
                checked={settings[ch.key]}
                onCheckedChange={v => updateSetting(ch.key, v)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LayoutSection({ onBack }: { onBack: () => void }) {
  const { resetToDefaults } = useHWUserLayout();
  const { settings, updateSetting } = useHWSettings();

  const views = [
    { id: 'home', label: 'Home' },
    { id: 'mural', label: 'Mural' },
    { id: 'messages', label: 'Mensagens' },
  ];

  return (
    <div>
      <SectionHeader label="Layout & Workspace" onBack={onBack} />

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#52525B' }}>Tela inicial</p>
        <div className="flex gap-2">
          {views.map(v => (
            <button
              key={v.id}
              onClick={() => updateSetting('defaultView', v.id)}
              className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: settings.defaultView === v.id ? 'rgba(234,88,12,0.12)' : '#1F1F23',
                color: settings.defaultView === v.id ? '#EA580C' : '#A1A1AA',
                border: settings.defaultView === v.id ? '1px solid #EA580C' : '1px solid #27272A',
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] mt-2" style={{ color: '#52525B' }}>Tela exibida ao abrir o NexusDesk</p>
      </div>

      <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: '#1F1F23', border: '1px solid #27272A' }}>
        <div className="flex items-center gap-3 mb-2">
          <Layout className="h-4 w-4" style={{ color: '#EA580C' }} />
          <span className="text-sm font-medium" style={{ color: '#E4E4E7' }}>Personalização por arrastar</span>
        </div>
        <p className="text-[11px] leading-relaxed mb-3" style={{ color: '#71717A' }}>
          Segure e arraste itens do menu lateral, widgets da Home ou tabs da barra inferior para reorganizar à sua maneira.
        </p>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(234,88,12,0.08)', border: '1px solid rgba(234,88,12,0.15)' }}>
          <Sparkles className="h-3.5 w-3.5" style={{ color: '#EA580C' }} />
          <span className="text-[11px]" style={{ color: '#FB923C' }}>
            Dica: segure ~0.4s em qualquer item para arrastar
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        className="w-full h-10 text-sm gap-2 rounded-xl hover:bg-zinc-800"
        style={{ color: '#EF4444', border: '1px solid #27272A' }}
        onClick={() => { resetToDefaults(); toast.success('Layout restaurado ao padrão'); }}
      >
        <RotateCcw className="h-4 w-4" />
        Restaurar layout padrão
      </Button>
      <p className="text-[10px] mt-2 text-center" style={{ color: '#52525B' }}>
        Volta a ordem original de menu, widgets e barra inferior
      </p>
    </div>
  );
}

function PrivacySection({ onBack }: { onBack: () => void }) {
  const { settings, updateSetting } = useHWSettings();

  return (
    <div>
      <SectionHeader label="Privacidade" onBack={onBack} />

      <SettingRow label="Mostrar status online" description="Outros veem quando você está ativo">
        <div className="flex items-center gap-2">
          {settings.showOnline ? <Eye className="h-4 w-4" style={{ color: '#22C55E' }} /> : <EyeOff className="h-4 w-4" style={{ color: '#52525B' }} />}
          <Switch checked={settings.showOnline} onCheckedChange={v => updateSetting('showOnline', v)} />
        </div>
      </SettingRow>

      <SettingRow label="Confirmação de leitura" description="Mostrar quando você leu mensagens">
        <Switch checked={settings.readReceipts} onCheckedChange={v => updateSetting('readReceipts', v)} />
      </SettingRow>

      <SettingRow label="Indicador de digitação" description="Mostrar quando você está digitando">
        <Switch checked={settings.typingIndicator} onCheckedChange={v => updateSetting('typingIndicator', v)} />
      </SettingRow>

      <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: '#1F1F23', border: '1px solid #27272A' }}>
        <p className="text-xs font-semibold mb-2" style={{ color: '#E4E4E7' }}>Sobre suas mensagens</p>
        <p className="text-[11px] leading-relaxed" style={{ color: '#71717A' }}>
          Suas mensagens diretas são visíveis apenas para você e o destinatário. Gestores e diretores não têm acesso ao conteúdo das suas conversas privadas.
        </p>
      </div>
    </div>
  );
}

function AccessibilitySection({ onBack }: { onBack: () => void }) {
  const { settings, updateSetting } = useHWSettings();

  return (
    <div>
      <SectionHeader label="Acessibilidade" onBack={onBack} />

      <SettingRow label="Reduzir animações" description="Diminui efeitos de movimento e transições">
        <Switch checked={settings.reduceMotion} onCheckedChange={v => updateSetting('reduceMotion', v)} />
      </SettingRow>

      <div className="py-3" style={{ borderBottom: '1px solid #1F1F23' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium" style={{ color: '#E4E4E7' }}>Tamanho da fonte</p>
            <p className="text-[11px]" style={{ color: '#52525B' }}>{settings.fontSize}%</p>
          </div>
          <Type className="h-4 w-4" style={{ color: '#71717A' }} />
        </div>
        <Slider
          value={[settings.fontSize]}
          onValueChange={([v]) => updateSetting('fontSize', v)}
          min={80}
          max={130}
          step={10}
          className="w-full"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px]" style={{ color: '#52525B' }}>Menor</span>
          <span className="text-[10px]" style={{ color: '#52525B' }}>Maior</span>
        </div>
      </div>

      <SettingRow label="Alto contraste" description="Aumenta o contraste de textos e bordas">
        <div className="flex items-center gap-2">
          <Contrast className="h-4 w-4" style={{ color: settings.highContrast ? '#EA580C' : '#52525B' }} />
          <Switch checked={settings.highContrast} onCheckedChange={v => updateSetting('highContrast', v)} />
        </div>
      </SettingRow>
    </div>
  );
}

function ShortcutsSection({ onBack }: { onBack: () => void }) {
  const shortcuts = [
    { keys: ['⌘', 'K'], desc: 'Busca global' },
    { keys: ['⌘', 'B'], desc: 'Abrir/fechar sidebar' },
    { keys: ['⌘', '1-7'], desc: 'Navegar entre seções' },
    { keys: ['⌘', 'N'], desc: 'Novo comunicado' },
    { keys: ['⌘', 'M'], desc: 'Ir para mensagens' },
    { keys: ['Esc'], desc: 'Fechar painel/modal' },
    { keys: ['⌘', ','], desc: 'Abrir configurações' },
  ];

  return (
    <div>
      <SectionHeader label="Atalhos do teclado" onBack={onBack} />
      <div className="space-y-1">
        {shortcuts.map((s, i) => (
          <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid #1F1F23' }}>
            <span className="text-sm" style={{ color: '#D4D4D8' }}>{s.desc}</span>
            <div className="flex items-center gap-1">
              {s.keys.map((k, j) => (
                <kbd
                  key={j}
                  className="px-2 py-1 rounded text-[11px] font-mono font-medium"
                  style={{ backgroundColor: '#27272A', color: '#A1A1AA', border: '1px solid #3F3F46' }}
                >
                  {k}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] mt-4 text-center" style={{ color: '#52525B' }}>
        Atalhos usam ⌘ no Mac e Ctrl no Windows/Linux
      </p>
    </div>
  );
}

function MainMenu({ onSelect }: { onSelect: (section: SettingsSection) => void }) {
  const { displayName, initials, user } = useHWUserDisplay();
  const { profileLabel } = useHWProfile();

  return (
    <div>
      <div className="flex items-center gap-3 p-4 rounded-xl mb-6" style={{ backgroundColor: '#1F1F23', border: '1px solid #27272A' }}>
        <Avatar className="h-12 w-12 ring-2" style={{ '--tw-ring-color': '#EA580C' } as React.CSSProperties}>
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback className="text-sm font-semibold" style={{ backgroundColor: '#27272A', color: '#FAFAFA' }}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: '#FAFAFA' }}>{displayName}</p>
          <p className="text-[11px]" style={{ color: '#71717A' }}>{profileLabel}</p>
          <p className="text-[10px] truncate" style={{ color: '#52525B' }}>{user?.email}</p>
        </div>
      </div>

      <div className="space-y-1">
        {SECTIONS.map(section => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => onSelect(section.id)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors hover:bg-zinc-800 group"
              style={{ color: '#D4D4D8' }}
            >
              <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#1F1F23' }}>
                <Icon className="h-4.5 w-4.5" style={{ color: '#71717A' }} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium" style={{ color: '#E4E4E7' }}>{section.label}</p>
                <p className="text-[10px]" style={{ color: '#52525B' }}>{section.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#52525B' }} />
            </button>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <p className="text-[10px]" style={{ color: '#3F3F46' }}>
          NexusDesk v2.0 · Nexus Ecosystem
        </p>
      </div>
    </div>
  );
}

export function HWSettingsPanel({ open, onOpenChange }: HWSettingsPanelProps) {
  const [section, setSection] = useState<SettingsSection>('main');

  const handleClose = () => {
    setSection('main');
    onOpenChange(false);
  };

  const goBack = () => setSection('main');

  const renderSection = () => {
    switch (section) {
      case 'appearance': return <AppearanceSection onBack={goBack} />;
      case 'notifications': return <NotificationsSection onBack={goBack} />;
      case 'layout': return <LayoutSection onBack={goBack} />;
      case 'privacy': return <PrivacySection onBack={goBack} />;
      case 'accessibility': return <AccessibilitySection onBack={goBack} />;
      case 'shortcuts': return <ShortcutsSection onBack={goBack} />;
      default: return <MainMenu onSelect={setSection} />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) handleClose(); else onOpenChange(v); }}>
        <SheetContent
          side="right"
          hideClose
          className="w-[90vw] max-w-[420px] p-0 overflow-hidden"
          style={{ backgroundColor: '#0f0f10', borderColor: '#27272A' }}
        >
        <SheetTitle className="sr-only">Configurações</SheetTitle>

        <div className="h-14 flex items-center justify-between px-5 shrink-0" style={{ borderBottom: '1px solid #27272A' }}>
          <div className="flex items-center gap-2">
            <Settings className="h-4.5 w-4.5" style={{ color: '#71717A' }} />
            <span className="text-base font-semibold" style={{ color: '#FAFAFA' }}>Configurações</span>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors" style={{ color: '#71717A' }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <ScrollArea className="h-[calc(100dvh-3.5rem)]">
          <div className="p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={section}
                initial={{ opacity: 0, x: section === 'main' ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: section === 'main' ? 10 : -10 }}
                transition={{ duration: 0.15 }}
              >
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
