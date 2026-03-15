import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Terminal } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-festval-charcoal">
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), 
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
      
      <div className="text-center max-w-md mx-4 relative z-10">
        {/* Logo */}
        <div className="mx-auto h-12 w-12 rounded-lg flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, hsl(var(--festval-copper)), hsl(var(--festval-copper-hover)))' }}>
          <Terminal className="h-6 w-6 text-white" />
        </div>
        
        {/* Error code */}
        <div className="mb-4">
          <span className="text-6xl font-condensed font-bold text-festval-ivory">404</span>
        </div>
        
        {/* Message */}
        <h1 className="text-lg font-condensed font-semibold text-festval-ivory mb-2">
          Página não encontrada
        </h1>
        <p className="text-xs mb-6 leading-relaxed" style={{ color: 'hsl(var(--festval-stone))' }}>
          O endereço <code className="text-[10px] bg-festval-graphite px-1.5 py-0.5 rounded">{location.pathname}</code> não existe ou foi movido.
        </p>
        
        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </Button>
          <Button 
            size="sm"
            className="h-8 text-xs gap-1.5 bg-festval-copper hover:brightness-110 text-white"
            onClick={() => navigate('/')}
          >
            <Home className="h-3.5 w-3.5" />
            Página Inicial
          </Button>
        </div>
        
        {/* Footer */}
        <p className="text-[9px] mt-8 font-['DM_Mono']" style={{ color: 'hsl(var(--festval-stone-muted))' }}>
          © {new Date().getFullYear()} Araripe.me
        </p>
      </div>
    </div>
  );
};

export default NotFound;
