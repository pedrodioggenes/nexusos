import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import nexusLogo from '@/assets/nexus-icon.png';

const passwordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação deve ter no mínimo 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export default function ResetPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check for recovery token in URL hash (Supabase puts it there)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (type === 'recovery' && accessToken) {
        // Set the session from the recovery token
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || '',
        });
        
        if (error) {
          setIsValidSession(false);
        } else {
          setIsValidSession(true);
        }
      } else if (session) {
        setIsValidSession(true);
      } else {
        setIsValidSession(false);
      }
    };

    checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = passwordSchema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase.auth.updateUser({ password });
    
    setIsLoading(false);

    if (error) {
      toast.error('Erro ao redefinir senha. Tente novamente.');
    } else {
      setIsSuccess(true);
      // Sign out after password change for security
      await supabase.auth.signOut();
    }
  };

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-[380px] relative z-10 px-6">
        {/* Back link */}
        <button 
          onClick={() => navigate('/auth')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao login
        </button>

        {/* Logo and branding */}
        <div className="text-center mb-10">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-5 overflow-hidden">
            <img 
              src={nexusLogo} 
              alt="Logo" 
              className="h-12 w-12 object-contain"
            />
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            nexusOS
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Redefinir Senha
          </p>
        </div>

        {/* Invalid or Expired Link */}
        {!isValidSession && (
          <div className="text-center space-y-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-medium text-foreground">Link inválido ou expirado</h2>
              <p className="text-sm text-muted-foreground">
                O link de recuperação de senha é inválido ou já expirou. 
                Solicite um novo link na página de login.
              </p>
            </div>
            <Button
              onClick={() => navigate('/auth')}
              className="w-full h-12 text-base rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Ir para o login
            </Button>
          </div>
        )}

        {/* Success State */}
        {isValidSession && isSuccess && (
          <div className="text-center space-y-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-medium text-foreground">Senha redefinida!</h2>
              <p className="text-sm text-muted-foreground">
                Sua senha foi alterada com sucesso. 
                Agora você pode fazer login com sua nova senha.
              </p>
            </div>
            <Button
              onClick={() => navigate('/auth')}
              className="w-full h-12 text-base rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Fazer login
            </Button>
          </div>
        )}

        {/* Reset Password Form */}
        {isValidSession && !isSuccess && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <p className="text-sm text-muted-foreground mb-4">
              Digite sua nova senha abaixo.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-foreground font-medium">
                Nova senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                  className="h-12 text-base pl-10 bg-card border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent/30 placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm text-foreground font-medium">
                Confirmar nova senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                  className="h-12 text-base pl-10 bg-card border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent/30 placeholder:text-muted-foreground/60"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground mt-2" 
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Redefinir senha
            </Button>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-10">
          © {new Date().getFullYear()} nexusOS · Powered by Araripe.me
        </p>
      </div>
    </div>
  );
}
