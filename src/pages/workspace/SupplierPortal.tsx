import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, LogOut, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { GlowCard } from '@/components/ui/glow-card';
import { ModuleHeroIcon } from '@/components/ui/module-icon';
import { PageTransition } from '@/components/ui/page-transition';
import { NexusLogoInline } from '@/components/brand/NexusLogo';

/**
 * Supplier Portal - Simplified portal for suppliers
 * Shows only Trade module with supplier-specific messaging
 */
const SupplierPortal = () => {
  const navigate = useNavigate();
  const { user, loading, signOut, supplier, isNosAdmin, isInternal } = useAuth();

  // Redirect NOS admins
  if (!loading && user && isNosAdmin()) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect internal users to full portal
  if (!loading && user && isInternal()) {
    return <Navigate to="/portal" replace />;
  }

  // Redirect to auth if not logged in
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAccessModule = () => {
    navigate('/app/trade/fornecedor');
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col relative">
      {/* Header */}
      <motion.header 
        className="shrink-0 border-b border-border/40 glass relative z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-[900px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <NexusLogoInline />
            </div>
            
            <div className="flex items-center gap-4">
              {/* Supplier badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-app-trade/10 border border-app-trade/20">
                <Building2 className="h-3.5 w-3.5 text-app-trade" />
                <span className="text-xs font-medium text-app-trade">
                  {supplier?.name || 'Fornecedor'}
                </span>
              </div>
              
              <div className="h-4 w-px bg-border/40 hidden md:block" />
              
              <span className="text-[11px] text-muted-foreground/50 hidden md:block font-light">
                {user?.email}
              </span>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleSignOut} 
                  className="h-8 w-8 rounded-xl text-muted-foreground/50 hover:text-foreground hover:bg-secondary/60 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 min-h-0 overflow-auto">
        <div className="min-h-full flex flex-col items-center justify-center px-6 py-12 md:py-16">
          <PageTransition className="w-full max-w-[500px]">
            {/* Title Section */}
            <div className="text-center mb-8">
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-app-trade/10 border border-app-trade/20 mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Building2 className="h-3.5 w-3.5 text-app-trade" />
                <span className="text-xs font-medium text-app-trade">Portal do Fornecedor</span>
              </motion.div>
              
              <motion.h1 
                className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                Bem-vindo, {supplier?.name || 'Parceiro'}
              </motion.h1>
              <motion.p 
                className="text-base text-muted-foreground max-w-md mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Acesse o Trade para gerenciar seus pacotes, checklists e comprovações
              </motion.p>
            </div>

            {/* Single Module Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <GlowCard
                glowColor="trade"
                onClick={handleAccessModule}
                className="w-full"
              >
                <div className="p-6 md:p-8">
                  {/* Header with icon */}
                  <div className="flex items-start justify-between mb-6">
                    <ModuleHeroIcon 
                      icon={ShoppingCart} 
                      color="trade"
                    />
                    <motion.div
                      className="text-muted-foreground/40 group-hover:text-app-trade mt-2"
                      initial={{ x: 0, opacity: 0.4 }}
                      whileHover={{ x: 4, opacity: 1 }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </div>
                  
                  {/* Content */}
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-widest mb-1 text-app-trade">
                      Trade Marketing
                    </p>
                    <h3 className="text-2xl font-semibold mb-3 tracking-tight text-foreground">
                      Trade
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                      Gerencie seus pacotes de trade marketing, envie comprovações e acompanhe o status das suas ativações.
                    </p>
                    
                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-foreground">Pacotes</p>
                        <p className="text-xs text-muted-foreground">Seus contratos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-foreground">Checklists</p>
                        <p className="text-xs text-muted-foreground">Itens pendentes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-foreground">Fotos</p>
                        <p className="text-xs text-muted-foreground">Comprovações</p>
                      </div>
                    </div>
                  </div>
                </div>
              </GlowCard>
            </motion.div>

            {/* Access Button */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                size="lg"
                onClick={handleAccessModule}
                className="bg-app-trade hover:bg-app-trade/90 text-white px-8"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Acessar Trade
              </Button>
            </motion.div>
          </PageTransition>
        </div>
      </main>

      {/* Footer */}
      <motion.footer 
        className="shrink-0 border-t border-border/30 py-4 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="max-w-[1000px] mx-auto px-6 lg:px-8">
          <p className="text-xs text-muted-foreground/60 text-center">
            © {new Date().getFullYear()} Portal do Fornecedor · Powered by <span className="text-muted-foreground">Nexus</span>
          </p>
        </div>
      </motion.footer>
    </div>
  );
};

export default SupplierPortal;
