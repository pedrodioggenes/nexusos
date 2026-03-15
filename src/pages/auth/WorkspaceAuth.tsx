import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { APP_PATHS } from '@/config/route-paths';
import { Loader2, Eye, EyeOff, CheckCircle, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

const authSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
});
const emailSchema = z.object({
  email: z.string().email('Email inválido')
});

export default function WorkspaceAuth() {
  const { user, loading, userType, userModulesAllowed, signIn, signOut, resetPassword, isAgency } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<'login' | 'forgot' | 'sent'>('login');

  useEffect(() => {
    const handleUnauthorized = (event: CustomEvent<{message: string;}>) => {
      toast.error(event.detail.message);
      setIsLoading(false);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized as EventListener);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized as EventListener);
    };
  }, []);

  if (!loading && user && userType) {
    if (userType === 'nos_admin') { signOut(); return null; }
    if (userType === 'supplier') return <Navigate to="/app/trade/fornecedor" replace />;
    if (isAgency()) return <Navigate to="/app/marketing" replace />;
    // Smart redirect: single module → go direct; multiple/null → desk
    if (userModulesAllowed && userModulesAllowed.length === 1) {
      const target = APP_PATHS[userModulesAllowed[0]] || `/app/${userModulesAllowed[0]}`;
      return <Navigate to={target} replace />;
    }
    return <Navigate to="/app/desk" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      toast.error(error.message === 'Invalid login credentials' ? 'Credenciais inválidas' : error.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = emailSchema.safeParse({ email });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }
    setIsLoading(true);
    const { error } = await resetPassword(email);
    setIsLoading(false);
    if (error) {
      toast.error('Erro ao enviar email de recuperação. Tente novamente.');
    } else {
      setView('sent');
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } }
  };

  return (
    <div className="min-h-[100dvh] bg-festval-charcoal flex relative overflow-hidden">
      {/* ── Left: Institutional Panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col justify-between p-12 xl:p-16 relative">
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--festval-copper)) 0.5px, transparent 0)`,
            backgroundSize: '24px 24px'
          }} />
        
        {/* Copper ambient glow */}
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.06] pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(var(--festval-copper)) 0%, transparent 70%)' }} />
        

        {/* Top: Brand */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative z-10">
          
          <div className="flex items-center gap-3 mb-2">
            







            
            <span className="text-[22px] font-semibold text-festval-ivory tracking-tight font-['DM_Sans']">
              ​nexusOS
            </span>
          </div>
        </motion.div>

        {/* Center: Institutional message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative z-10 -mt-12">
          
          <h2 className="text-[32px] xl:text-[38px] leading-[1.15] font-bold text-festval-ivory font-['Playfair_Display'] tracking-tight mb-5">
            O sistema operacional<br />
            <span className="text-festval-copper">da sua rede varejista.</span>
          </h2>
          <p className="text-[14px] leading-relaxed max-w-[360px] font-['DM_Sans']" style={{ color: 'hsl(var(--festval-stone))' }}>Gestão integrada, inteligência aplicada e controle total. Tudo em uma única plataforma.

          </p>
        </motion.div>

        {/* Bottom: Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative z-10 flex items-center gap-6">
          
          <p className="text-[10px] font-['DM_Mono'] tracking-wider uppercase" style={{ color: 'hsl(var(--festval-stone-muted) / 0.7)' }}>
            © {new Date().getFullYear()} Araripe.me
          </p>
          <div className="h-3 w-px" style={{ backgroundColor: 'hsl(var(--festval-border))' }} />
          <p className="text-[10px] font-['DM_Mono'] tracking-wider uppercase" style={{ color: 'hsl(var(--festval-stone-muted) / 0.7)' }}>
            Tecnologia & Inovação
          </p>
        </motion.div>
      </div>

      {/* ── Divider ── */}
      <div className="hidden lg:block w-px self-stretch my-12" style={{ backgroundColor: 'hsl(var(--festval-border))' }} />

      {/* ── Right: Login Form ── */}
      <div className="flex-1 flex flex-col relative">
        {/* Copper glow (mobile + right panel) */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04] pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(var(--festval-copper)) 0%, transparent 70%)' }} />
        

        {/* Status bar spacer for mobile */}
        <div className="h-[env(safe-area-inset-top,0px)]" />

        {/* Navigation bar — only on sub-views */}
        <div className="h-11 flex items-center px-4 relative shrink-0">
          <AnimatePresence>
            {view !== 'login' &&
            <motion.button
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              onClick={() => setView('login')}
              className="flex items-center gap-0.5 text-festval-copper text-[13px] font-medium active:opacity-60 transition-opacity font-['DM_Sans']">
              
                <ChevronLeft className="w-4.5 h-4.5 -ml-1" />
                Entrar
              </motion.button>
            }
          </AnimatePresence>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8 relative z-10">
          <AnimatePresence mode="wait">
            {view === 'login' &&
            <motion.div
              key="login"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-[340px] flex flex-col items-center">
              
                {/* Brand Mark */}
                <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="mb-10 flex flex-col items-center">
                
                  {/* Icon only on mobile (desktop has left panel) */}
                  <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center mb-4 lg:hidden"
                  style={{
                    backgroundColor: 'hsl(var(--festval-copper) / 0.1)',
                    border: '1px solid hsl(var(--festval-copper) / 0.2)'
                  }}>
                  
                    <span className="text-lg font-bold text-festval-copper font-['Playfair_Display']">N</span>
                  </div>
                  <h1 className="text-[19px] font-semibold text-festval-ivory tracking-tight font-['DM_Sans']">
                    Acesse sua conta
                  </h1>
                </motion.div>

                {/* Form */}
                <form onSubmit={handleSignIn} className="w-full space-y-3">
                  <div className="rounded-lg overflow-hidden border-festval-border border">
                    <input
                    type="email"
                    placeholder="Email"
                    className="w-full h-10 px-3.5 text-[16px] md:text-[13px] bg-festval-graphite text-festval-ivory placeholder:opacity-40 focus:outline-none transition-colors border-b border-festval-border font-['DM_Sans']"
                    style={{ color: 'hsl(var(--festval-ivory))' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required />
                  
                    <div className="relative">
                      <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Senha"
                      className="w-full h-10 px-3.5 pr-10 text-[16px] md:text-[13px] bg-festval-graphite text-festval-ivory placeholder:opacity-40 focus:outline-none transition-colors font-['DM_Sans']"
                      style={{ color: 'hsl(var(--festval-ivory))' }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required />
                    
                      <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-all"
                      style={{ color: 'hsl(var(--festval-stone-muted))' }}>
                      
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 rounded-lg bg-festval-copper text-white text-[13px] font-semibold active:brightness-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-['DM_Sans'] hover:brightness-110">
                  
                    {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Entrar
                  </button>
                </form>

                {/* Forgot password */}
                <button
                type="button"
                onClick={() => setView('forgot')}
                className="mt-5 text-[13px] active:opacity-60 transition-all font-['DM_Sans']"
                style={{ color: 'hsl(var(--festval-stone))' }}>
                
                  Esqueceu a senha?
                </button>

                {/* Footer (mobile only — desktop has left panel footer) */}
                <p className="lg:hidden mt-auto pt-12 text-[10px] text-center font-['DM_Mono'] tracking-wider" style={{ color: 'hsl(var(--festval-stone-muted) / 0.5)' }}>
                  © {new Date().getFullYear()} Araripe.me
                </p>
              </motion.div>
            }

            {view === 'forgot' &&
            <motion.div
              key="forgot"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-[340px] flex flex-col items-center">
              
                <h2 className="text-[19px] font-semibold text-festval-ivory tracking-tight mb-2 font-['DM_Sans']">
                  Recuperar Senha
                </h2>
                <p className="text-[13px] text-center mb-8 leading-relaxed font-['DM_Sans']" style={{ color: 'hsl(var(--festval-stone))' }}>
                  Informe seu email e enviaremos um link para redefinir sua senha.
                </p>

                <form onSubmit={handleResetPassword} className="w-full space-y-3">
                  <input
                  type="email"
                  placeholder="Email"
                  className="w-full h-10 px-3.5 text-[16px] md:text-[13px] rounded-lg bg-festval-graphite text-festval-ivory placeholder:opacity-40 focus:outline-none border border-festval-border transition-colors font-['DM_Sans']"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required />
                
                  <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 rounded-lg bg-festval-copper text-white text-[13px] font-semibold active:brightness-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-['DM_Sans'] hover:brightness-110">
                  
                    {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Enviar link
                  </button>
                </form>
              </motion.div>
            }

            {view === 'sent' &&
            <motion.div
              key="sent"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-[340px] flex flex-col items-center text-center">
              
                <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
                className="h-14 w-14 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mb-6">
                
                  <CheckCircle className="h-7 w-7 text-success" />
                </motion.div>
                <h2 className="text-[19px] font-semibold text-festval-ivory tracking-tight mb-2 font-['DM_Sans']">
                  Email enviado
                </h2>
                <p className="text-[13px] leading-relaxed mb-8 font-['DM_Sans']" style={{ color: 'hsl(var(--festval-stone))' }}>
                  Enviamos um link de recuperação para{' '}
                  <span className="text-festval-ivory font-medium">{email}</span>.
                  Verifique sua caixa de entrada.
                </p>
                <button
                onClick={() => setView('login')}
                className="w-full h-10 rounded-lg bg-festval-copper text-white text-[13px] font-semibold active:brightness-90 transition-all font-['DM_Sans'] hover:brightness-110">
                
                  Voltar ao login
                </button>
              </motion.div>
            }
          </AnimatePresence>
        </div>

        {/* Bottom safe area */}
        <div className="h-[env(safe-area-inset-bottom,0px)]" />
      </div>
    </div>);

}