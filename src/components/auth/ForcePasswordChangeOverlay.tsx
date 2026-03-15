import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/;
const SPECIAL_CHAR_LIST = "!@#$%^&*()_+-=[]{};':\"|\\,.<>/?~`";

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'Mínimo 8 caracteres', test: (pw) => pw.length >= 8 },
  { label: 'Pelo menos 1 letra maiúscula', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'Pelo menos 1 letra minúscula', test: (pw) => /[a-z]/.test(pw) },
  { label: 'Pelo menos 1 número', test: (pw) => /\d/.test(pw) },
  { label: 'Pelo menos 1 caractere especial', test: (pw) => SPECIAL_CHAR_REGEX.test(pw) },
];

export function ForcePasswordChangeOverlay() {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(password));
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = allRulesPassed && passwordsMatch && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !user) return;

    const userId = user.id;
    const logBase = { user_id: userId };

    setLoading(true);
    console.info('[force-password-change] update_user_start', {
      ...logBase,
      timestamp: new Date().toISOString(),
    });

    try {
      const { error: authError } = await supabase.auth.updateUser({ password });
      if (authError) {
        console.error('[force-password-change] update_user_failed', {
          ...logBase,
          timestamp: new Date().toISOString(),
          error: authError.message,
        });
        throw authError;
      }

      console.info('[force-password-change] update_user_success', {
        ...logBase,
        timestamp: new Date().toISOString(),
      });

      const { data: notifyData, error: notifyError } = await supabase.functions.invoke('notify-nos-password-changed', {
        body: { user_id: userId },
      });

      if (notifyError) {
        console.error('[force-password-change] notify_nos_failed', {
          ...logBase,
          timestamp: new Date().toISOString(),
          error: notifyError.message,
        });
        throw new Error(`Senha atualizada, mas falha ao finalizar sincronização: ${notifyError.message}`);
      }

      if (!notifyData?.success) {
        throw new Error('Senha atualizada, mas não foi possível concluir a atualização de permissões.');
      }

      toast.success('Senha definida com sucesso!');
      window.dispatchEvent(new CustomEvent('auth:password-changed'));
    } catch (err: any) {
      console.error('Password change error:', {
        ...logBase,
        timestamp: new Date().toISOString(),
        error: err?.message || 'unknown_error',
      });

      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('same password') || msg.includes('different from the old')) {
        toast.error('A nova senha deve ser diferente da senha atual.');
      } else if (msg.includes('should contain at least one character') || msg.includes('should contain')) {
        toast.error(`A senha deve conter: maiúscula, minúscula, número e caractere especial (${SPECIAL_CHAR_LIST}).`);
      } else {
        toast.error(err?.message || 'Erro ao definir senha. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        background: 'rgba(0, 0, 0, 0.4)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="relative w-[90%] max-w-[420px] rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onKeyDown={(e) => {
          if (e.key === 'Escape') e.preventDefault();
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--festval-copper) / 0.1)', border: '1px solid hsl(var(--festval-copper) / 0.2)' }}>
            <Lock className="h-5 w-5 text-festval-copper" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Crie sua senha</h2>
          <p className="text-sm text-muted-foreground text-center">
            Antes de continuar, defina uma senha pessoal para sua conta.
          </p>
        </div>

        {/* Password fields */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-xs text-muted-foreground">
              Nova senha
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua nova senha"
                autoFocus
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password" className="text-xs text-muted-foreground">
              Confirmar senha
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua nova senha"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                <X className="h-3 w-3" /> As senhas não coincidem
              </p>
            )}
          </div>
        </div>

        {/* Validation rules */}
        <div className="mt-4 space-y-1.5">
          {PASSWORD_RULES.map((rule) => {
            const passed = rule.test(password);
            return (
              <div key={rule.label} className="flex items-center gap-2 text-xs">
                {passed ? (
                  <Check className="h-3 w-3 text-festval-copper shrink-0" />
                ) : (
                  <div className="h-3 w-3 rounded-full border border-muted-foreground/30 shrink-0" />
                )}
                <span className={passed ? 'text-festval-copper' : 'text-muted-foreground'}>
                  {rule.label}
                </span>
              </div>
            );
          })}
          <p className="text-[11px] text-muted-foreground/80 leading-relaxed pt-1">
            Caracteres especiais aceitos: <span className="font-mono">{SPECIAL_CHAR_LIST}</span>
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full h-10 rounded-lg bg-festval-copper text-white text-[13px] font-semibold active:brightness-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-['DM_Sans'] hover:brightness-110 mt-6"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Definindo...
            </>
          ) : (
            'Definir Senha'
          )}
        </button>
      </form>
    </div>
  );
}
