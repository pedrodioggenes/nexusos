import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Lock, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface HWOffHoursGuardProps {
  termText: string;
  onAccept: (password: string) => Promise<void>;
}

export function HWOffHoursGuard({ termText, onAccept }: HWOffHoursGuardProps) {
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleSubmit = async () => {
    if (!password.trim()) {
      toast.error('Digite sua senha para confirmar');
      return;
    }
    setLoading(true);
    try {
      await onAccept(password);
      setDismissed(true);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao verificar senha');
    } finally {
      setLoading(false);
    }
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, delay: 1.5 }}
          className="fixed inset-0 z-[500] flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.35, delay: 1.8 }}
            className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden bg-festval-graphite border-festval-border"
          >
            {/* Header */}
            <div
              className="px-6 pt-6 pb-4 flex items-start gap-3"
              style={{ borderBottom: '1px solid hsl(var(--festval-border))' }}
            >
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}
              >
                <AlertTriangle className="h-5 w-5" style={{ color: '#F59E0B' }} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-festval-ivory">
                  Acesso Fora do Horário de Trabalho
                </h2>
                <p className="text-xs mt-1 text-festval-stone">
                  Você está acessando o NexusDesk fora do seu horário regular de trabalho.
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Term text */}
              <div
                className="rounded-lg p-3 text-xs leading-relaxed bg-festval-charcoal"
                style={{
                  color: 'hsl(var(--festval-stone))',
                  border: '1px solid hsl(var(--festval-border))',
                }}
              >
                {termText}
              </div>

              {/* Checkbox declaration */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(v) => setChecked(!!v)}
                  className="mt-0.5 border-zinc-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                />
                <span className="text-xs leading-relaxed text-festval-ivory">
                  Li e declaro que estou acessando o sistema por livre e espontânea vontade,
                  ciente de que estou fora do meu horário de trabalho.
                </span>
              </label>

              {/* Password field — appears only after checkbox */}
              <AnimatePresence>
                {checked && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-3 overflow-hidden"
                  >
                    <div>
                      <label className="text-xs font-medium mb-1.5 block text-festval-stone">
                        <Lock className="h-3 w-3 inline mr-1" />
                        Confirme com sua senha
                      </label>
                      <Input
                        type="password"
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
                        className="h-9 text-sm"
                        style={{ backgroundColor: 'hsl(var(--festval-charcoal))', borderColor: 'hsl(var(--festval-border))', color: 'hsl(var(--festval-ivory))' }}
                        autoFocus
                      />
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={loading || !password.trim()}
                      className="w-full h-9 text-sm font-medium bg-amber-600 hover:bg-amber-500 text-white border-0 disabled:opacity-40"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verificando...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5" />
                          Continuar
                        </span>
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
