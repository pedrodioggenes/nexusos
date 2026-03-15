import { motion } from 'framer-motion';
import { BlurFade } from '@/components/ui/blur-fade';
import { AnimatedCounter } from '@/components/ui/animated-counter';

/**
 * PlatformStats - NexusDesk Landing
 * Mobile: unified container with internal dividers instead of individual cards
 */
export function PlatformStats() {
  const stats = [
    { value: 15, suffix: '', label: 'Aplicativos Integrados', description: 'Ecossistema completo' },
    { value: 7, suffix: '', label: 'Lojas Conectadas', description: 'Rede conectada' },
    { value: 1500, suffix: '+', label: 'Colaboradores', description: 'Pessoas conectadas' },
    { value: 100, suffix: '%', label: 'IA em Tempo Real', description: 'Insights instantâneos' },
  ];

  return (
    <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 md:px-8 bg-festval-graphite border-y border-festval-border">
      <div className="max-w-6xl mx-auto">
        <BlurFade delay={0}>
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <span className="text-[10px] sm:text-xs font-medium tracking-widest text-festval-copper uppercase mb-3 sm:mb-4 block">
              Escala Real. Resultados Reais.
            </span>
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-festval-ivory">
              Construído para a sua rede.
            </h2>
          </div>
        </BlurFade>

        {/* Mobile: unified 2x2 container with thin dividers */}
        <div className="md:hidden">
          <BlurFade delay={0.1}>
            <div className="rounded-2xl bg-festval-charcoal border border-festval-border overflow-hidden">
              <div className="grid grid-cols-2">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={`text-center py-6 px-4 ${
                      index % 2 === 0 ? 'border-r border-festval-border' : ''
                    } ${index < 2 ? 'border-b border-festval-border' : ''}`}
                  >
                    <div className="text-3xl font-bold text-festval-ivory mb-1">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} color="text-festval-ivory" duration={2} />
                    </div>
                    <p className="text-xs font-medium text-festval-ivory mb-0.5">{stat.label}</p>
                    <p className="text-[10px] text-festval-stone">{stat.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </BlurFade>
        </div>

        {/* Desktop: individual cards */}
        <div className="hidden md:grid grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <BlurFade key={stat.label} delay={0.1 + index * 0.1}>
              <motion.div 
                className="text-center p-6 rounded-2xl bg-festval-charcoal border border-festval-border"
                whileHover={{ borderColor: 'hsl(240 4% 20%)' }}
              >
                <div className="text-4xl lg:text-5xl font-bold text-festval-ivory mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} color="text-festval-ivory" duration={2} />
                </div>
                <p className="text-sm font-medium text-festval-ivory mb-1">{stat.label}</p>
                <p className="text-xs text-festval-stone">{stat.description}</p>
              </motion.div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
