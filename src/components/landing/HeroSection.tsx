import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlurFade } from '@/components/ui/blur-fade';

/**
 * HeroSection - Nexus OS Landing
 * Full-screen cinematographic hero — mobile-native experience
 */
export function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Matte charcoal background with subtle noise texture */}
      <div className="absolute inset-0 bg-festval-charcoal">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
        }} />
        <div className="absolute inset-0 bg-gradient-radial from-festval-graphite/50 via-transparent to-transparent opacity-50" />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-6 md:px-8 text-center pt-24 sm:pt-24 pb-8 sm:pb-16">
        {/* Badge */}
        <BlurFade delay={0.1}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-festval-graphite border border-festval-border mb-8">
            <div className="w-2 h-2 rounded-full bg-festval-copper animate-pulse" />
            <span className="text-xs text-festval-stone font-medium">
              Ecossistema
            </span>
          </div>
        </BlurFade>

        {/* Headline — bigger and more dramatic on mobile */}
        <BlurFade delay={0.2}>
          <h1 className="font-serif text-[40px] leading-[1.05] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-semibold tracking-tight sm:leading-[1.05] mb-5 sm:mb-6 text-festval-ivory">
            Pessoas, Operação
            <br />
            <span className="text-festval-stone">e Inteligência.</span>
          </h1>
        </BlurFade>

        {/* Subheadline */}
        <BlurFade delay={0.3}>
          <p className="text-[15px] leading-relaxed sm:text-base md:text-lg lg:text-xl text-festval-stone max-w-2xl mx-auto mb-5 sm:mb-4">
            A plataforma que unifica comunicação, gestão, IA e operação 
            em um único ecossistema para toda a sua empresa.
          </p>
        </BlurFade>

        {/* Value proposition pills — horizontal snap scroll on mobile */}
        <BlurFade delay={0.35}>
          <div className="mb-10 sm:mb-10 -mx-5 sm:mx-0">
            <div className="flex sm:flex-wrap sm:justify-center gap-2 overflow-x-auto snap-x snap-mandatory px-5 sm:px-0 scrollbar-hide">
              {['16 Aplicativos', 'IA Nativa', 'Mobile-First', 'Enterprise'].map(pill => (
                <span key={pill} className="snap-start shrink-0 px-3.5 py-1.5 rounded-full text-xs text-festval-stone bg-festval-graphite border border-festval-border whitespace-nowrap">
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </BlurFade>

        {/* CTA — single full-width copper button on mobile, secondary as text link */}
        <BlurFade delay={0.4}>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-10 rounded-xl bg-festval-copper text-white hover:bg-festval-copper/90 font-semibold text-base gap-3 border-0 shadow-none min-h-[56px] touch-manipulation" onClick={() => navigate('/auth')}>
                Entrar no Nexus Desk
                <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>
            
            {/* Desktop: outline button / Mobile: subtle text link */}
            <button
              onClick={() => document.getElementById('aplicativos')?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden sm:inline-flex items-center gap-2 h-14 px-8 rounded-xl bg-transparent text-festval-ivory border border-festval-border hover:bg-festval-graphite font-medium text-base touch-manipulation transition-colors"
            >
              <Play className="h-4 w-4" />
              Ver Aplicativos
            </button>
            <button
              onClick={() => document.getElementById('aplicativos')?.scrollIntoView({ behavior: 'smooth' })}
              className="sm:hidden text-sm text-festval-stone font-medium touch-manipulation"
            >
              Ver os 16 aplicativos ↓
            </button>
          </div>
        </BlurFade>

        {/* Trust badge */}
        <BlurFade delay={0.5}>
          <div className="mt-14 sm:mt-16 pt-6 sm:pt-8 border-t border-festval-border">
            <p className="text-xs text-festval-stone tracking-wider">
              Arquitetura <span className="font-bold text-festval-ivory">Nexus</span> por <span className="font-bold">Araripe</span>
            </p>
          </div>
        </BlurFade>
      </div>

      {/* Scroll indicator — desktop only */}
      <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden sm:block" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="w-6 h-10 rounded-full border-2 border-festval-stone/30 flex justify-center pt-2">
          <div className="w-1.5 h-2.5 rounded-full bg-festval-stone/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
