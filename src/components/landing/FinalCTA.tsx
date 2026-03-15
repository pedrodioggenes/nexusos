import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlurFade } from '@/components/ui/blur-fade';

/**
 * FinalCTA - NexusDesk Landing
 * Mobile: tighter copy, full-width copper CTA
 */
export function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-32 px-5 sm:px-6 md:px-8 bg-festval-charcoal">
      <div className="max-w-3xl mx-auto text-center">
        <BlurFade delay={0}>
          <h2 className="font-serif text-[28px] leading-[1.1] sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-festval-ivory mb-4 sm:mb-6">
            <span className="md:hidden">Entre no NexusDesk.</span>
            <span className="hidden md:inline">
              Pronto para entrar
              <br />
              no NexusDesk?
            </span>
          </h2>
        </BlurFade>

        <BlurFade delay={0.1}>
          <p className="text-sm sm:text-base md:text-lg text-festval-stone mb-8 sm:mb-10 max-w-lg mx-auto">
            <span className="md:hidden">+1.500 colaboradores já conectados.</span>
            <span className="hidden md:inline">Junte-se a mais de 1.500 colaboradores conectados no ecossistema nexusOS.</span>
          </p>
        </BlurFade>

        <BlurFade delay={0.2}>
          <motion.div 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            className="w-full sm:inline-block sm:w-auto"
          >
            <Button
              size="lg"
              className="w-full sm:w-auto h-14 sm:h-16 px-10 sm:px-12 rounded-xl bg-festval-copper text-white hover:bg-festval-copper/90 font-semibold text-base sm:text-lg gap-2 sm:gap-3 border-0 shadow-none min-h-[56px] touch-manipulation"
              onClick={() => navigate('/auth')}
            >
              Entrar no NexusDesk
              <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </BlurFade>
      </div>
    </section>
  );
}
