import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import nexusdeskLogo from '@/assets/nexusdesk-logo.png';

/**
 * LandingHeader - NexusDesk Landing
 * Minimal fixed header with NexusDesk branding
 */
export function LandingHeader() {
  const navigate = useNavigate();

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-festval-charcoal/80 backdrop-blur-xl border-b border-festval-border"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo NexusDesk */}
          <div className="flex items-center">
            <img src={nexusdeskLogo} alt="NexusDesk" className="h-8 md:h-9 w-auto" />
          </div>

          {/* Navigation - hidden on small screens */}
          <nav className="hidden md:flex items-center gap-8">
            <a 
              href="#aplicativos" 
              className="text-sm text-festval-stone hover:text-festval-ivory transition-colors"
            >
              Aplicativos
            </a>
            <a 
              href="#como-funciona" 
              className="text-sm text-festval-stone hover:text-festval-ivory transition-colors"
            >
              Como Funciona
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="sm"
                className="h-10 sm:h-9 px-4 sm:px-5 rounded-xl bg-festval-ivory text-festval-charcoal hover:bg-festval-ivory/90 font-medium text-sm border-0 min-h-[44px] sm:min-h-0 touch-manipulation"
                onClick={() => navigate('/auth')}
              >
                Entrar
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
