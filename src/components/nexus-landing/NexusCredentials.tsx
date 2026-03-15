import { motion } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/animated-counter';

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 24 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: '-50px' as const },
  transition: { duration: 0.6, ease: EASE },
};

const METRICS = [
  { value: 16, suffix: '+', label: 'Aplicativos ativos', sub: 'em produção no ecossistema' },
  { value: 3, suffix: '+', label: 'Setores', sub: 'varejo, tecnologia, marketing' },
  { value: 18, suffix: '', label: 'Meses', sub: 'horizonte de contrato enterprise ativo' },
  { value: 2, suffix: '', label: 'Entradas', sub: 'OS completo ou Portal de Apps' },
];

export function NexusCredentials() {
  return (
    <section className="py-24 lg:py-28 px-6 md:px-10 lg:px-20 bg-festval-graphite">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div className="text-center mb-16" {...fadeUp}>
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-festval-copper block mb-4">
            Em Produção
          </span>
          <h2 className="font-display text-[36px] sm:text-[44px] font-bold text-festval-ivory leading-[1.1]">
            Não é conceito.
            <br />
            Está operando agora.
          </h2>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              className="text-center"
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 + i * 0.1 }}
            >
              <div className="font-display text-[56px] sm:text-[64px] font-black leading-none mb-2">
                <AnimatedCounter value={m.value} suffix={m.suffix} color="text-festval-copper" />
              </div>
              <p className="font-body text-base font-semibold text-festval-ivory mb-1">
                {m.label}
              </p>
              <p className="font-body text-[13px] text-festval-stone-muted">
                {m.sub}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
