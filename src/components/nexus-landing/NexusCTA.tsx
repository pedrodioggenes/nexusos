import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 24 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: '-50px' as const },
  transition: { duration: 0.6, ease: EASE },
};

export function NexusCTA() {
  return (
    <section
      id="cta"
      className="relative py-32 lg:py-36 px-6 md:px-10 lg:px-20"
      style={{
        background: `
          radial-gradient(ellipse 600px 400px at 50% 50%, hsla(25, 55%, 52%, 0.06) 0%, transparent 70%),
          hsl(var(--festval-charcoal))
        `,
      }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          className="font-display text-[36px] sm:text-[44px] lg:text-[52px] font-extrabold text-festval-ivory leading-[1.1] mb-6"
          {...fadeUp}
        >
          Pronto para operar
          <br />
          com um sistema que
          <br />
          <span className="text-festval-copper">conhece o seu negócio?</span>
        </motion.h2>

        <motion.p
          className="font-body text-lg text-festval-stone leading-relaxed max-w-[520px] mx-auto mb-10"
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
        >
          Seja pelo OS completo ou pelos apps —
          a conversa começa pelo entendimento do que
          o seu negócio realmente precisa.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.2 }}
        >
          <a
            href="#cta"
            className="inline-flex items-center justify-center gap-2 font-body text-base px-8 py-3.5 rounded-lg bg-festval-copper text-white hover:bg-festval-copper-hover transition-colors duration-200"
          >
            Conversar com a Araripe
          </a>
          <a
            href="#modulos"
            className="inline-flex items-center justify-center gap-2 font-body text-base px-8 py-3.5 rounded-lg border border-festval-border text-festval-ivory hover:border-festval-copper hover:text-festval-copper transition-all duration-200"
          >
            Ver o catálogo de apps <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>

        <motion.p
          className="font-body text-sm text-festval-stone-muted"
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.3 }}
        >
          Ou volte para conhecer a empresa por completo →{' '}
          <a href="/" className="text-festval-copper hover:underline">
            araripe.me
          </a>
        </motion.p>
      </div>
    </section>
  );
}
