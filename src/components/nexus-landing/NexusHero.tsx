import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 24 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: '-50px' as const },
  transition: { duration: 0.6, ease: EASE },
};

export function NexusHero() {
  return (
    <section
      className="relative min-h-screen flex items-center pt-20 pb-24 px-6 md:px-10 lg:px-20"
      style={{
        background: `
          radial-gradient(ellipse 700px 500px at 85% 15%, hsla(25, 55%, 52%, 0.09) 0%, transparent 65%),
          hsl(var(--festval-charcoal))
        `,
      }}
    >
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-[1fr,0.8fr] gap-16 items-center">
          {/* Left — Copy */}
          <div>
            <motion.span
              className="font-mono text-[11px] uppercase tracking-[0.15em] text-festval-copper block mb-6"
              {...fadeUp}
            >
              nexusOS — Sistema Operacional de Negócios
            </motion.span>

            <motion.h1
              className="font-display text-[48px] sm:text-[56px] lg:text-[72px] font-extrabold text-festval-ivory leading-[1.1] mb-8"
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
            >
              O sistema que opera
              <br />
              o seu negócio{' '}
              <span className="text-festval-copper">por dentro.</span>
            </motion.h1>

            <motion.p
              className="font-body text-lg sm:text-xl text-festval-stone leading-[1.7] max-w-[580px] mb-12"
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.2 }}
            >
              Uma plataforma SaaS que substitui dezenas de ferramentas
              fragmentadas por um workspace inteligente — com gestão
              operacional, comunicação hierárquica e análise de dados
              integrados. Disponível como OS completo ou como portal
              de aplicativos independentes.
            </motion.p>

            {/* Bifurcation cards */}
            <motion.div
              className="grid sm:grid-cols-2 gap-4"
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.3 }}
            >
              {/* OS Completo */}
              <a
                href="#bifurcacao"
                className="group p-6 rounded-xl border border-festval-copper/40 bg-festval-copper/[0.08] hover:-translate-y-[3px] transition-all duration-300"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-festval-copper block mb-2">
                  nexusOS Completo
                </span>
                <h3 className="font-body text-base font-semibold text-festval-ivory mb-1">
                  O workspace total do seu negócio
                </h3>
                <p className="font-body text-sm text-festval-stone mb-4">
                  Comunicação, gestão e inteligência em um único sistema.
                </p>
                <span className="font-body text-sm text-festval-copper inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                  Conhecer o OS <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </a>

              {/* Portal de Apps */}
              <a
                href="#modulos"
                className="group p-6 rounded-xl border border-festval-border bg-festval-graphite hover:-translate-y-[3px] transition-all duration-300 hover:border-festval-copper/30"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-festval-stone-muted block mb-2">
                  Portal de Apps
                </span>
                <h3 className="font-body text-base font-semibold text-festval-ivory mb-1">
                  Ferramentas inteligentes sem o OS completo
                </h3>
                <p className="font-body text-sm text-festval-stone mb-4">
                  Acesse aplicativos de gestão e análise de forma independente.
                </p>
                <span className="font-body text-sm text-festval-stone inline-flex items-center gap-1.5 group-hover:gap-2.5 group-hover:text-festval-copper transition-all">
                  Ver os apps <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </a>
            </motion.div>
          </div>

          {/* Right — Mockup visual */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
          >
            <div
              className="relative rounded-xl border border-festval-border overflow-hidden"
              style={{
                transform: 'rotate(-2deg)',
                boxShadow: '0 20px 60px -15px hsla(25, 55%, 52%, 0.15)',
              }}
            >
              {/* Abstract dashboard mockup */}
              <div className="bg-festval-graphite p-6 aspect-[4/3]">
                {/* Top bar */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-festval-copper/40" />
                  <div className="w-3 h-3 rounded-full bg-festval-border" />
                  <div className="w-3 h-3 rounded-full bg-festval-border" />
                  <div className="ml-4 h-2.5 w-32 rounded bg-festval-border" />
                </div>
                {/* Sidebar + content area */}
                <div className="flex gap-4 h-full">
                  <div className="w-12 flex flex-col gap-3 pt-2">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded ${
                          i === 0 ? 'bg-festval-copper/20' : 'bg-festval-border/50'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="h-4 w-48 rounded bg-festval-border/60" />
                    <div className="grid grid-cols-3 gap-3 flex-1">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="rounded-lg bg-festval-charcoal border border-festval-border p-3"
                        >
                          <div className="h-2 w-12 rounded bg-festval-copper/30 mb-2" />
                          <div className="h-2 w-full rounded bg-festval-border/40 mb-1.5" />
                          <div className="h-2 w-3/4 rounded bg-festval-border/30" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
