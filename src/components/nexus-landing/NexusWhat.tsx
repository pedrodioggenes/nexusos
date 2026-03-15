import { motion } from 'framer-motion';
import { LayoutGrid, Layers, TrendingUp } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 24 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: '-50px' as const },
  transition: { duration: 0.6, ease: EASE },
};

const PILLARS = [
  {
    icon: LayoutGrid,
    title: 'Workspace Unificado',
    desc: 'Comunicação, gestão e dados em um só lugar',
  },
  {
    icon: Layers,
    title: 'Personalização Real',
    desc: 'Design e lógica adaptados ao negócio do cliente',
  },
  {
    icon: TrendingUp,
    title: 'Inteligência Crescente',
    desc: 'Cada dado gerado refina o sistema ao longo do tempo',
  },
];

export function NexusWhat() {
  return (
    <section className="py-28 lg:py-32 px-6 md:px-10 lg:px-20 bg-festval-graphite">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left — Copy */}
          <div>
            <motion.span
              className="font-mono text-[11px] uppercase tracking-[0.15em] text-festval-copper block mb-4"
              {...fadeUp}
            >
              O Produto
            </motion.span>

            <motion.h2
              className="font-display text-[36px] sm:text-[44px] lg:text-[48px] font-extrabold text-festval-ivory leading-[1.1] mb-8"
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
            >
              Não é um software.
              <br />
              É a{' '}
              <span className="text-festval-copper">inteligência operacional</span>
              <br />
              do negócio.
            </motion.h2>

            <motion.div
              className="space-y-5"
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.2 }}
            >
              <p className="font-body text-[17px] text-festval-stone leading-[1.8]">
                O nexusOS é um sistema operacional de negócios — uma
                camada de inteligência que unifica como uma empresa
                se comunica, opera e toma decisões.
              </p>
              <p className="font-body text-[17px] text-festval-stone leading-[1.8]">
                Construído a partir de operação real, com lógica de
                negócio séria e arquitetura pensada para crescer junto
                com o cliente. Não é uma ferramenta genérica configurada
                para parecer personalizada. É uma plataforma construída
                e adaptada à identidade e à lógica de cada operação.
              </p>
            </motion.div>
          </div>

          {/* Right — Pillars */}
          <div className="flex flex-col justify-center h-full">
            {PILLARS.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                className={`flex items-start gap-5 py-7 ${
                  i < PILLARS.length - 1 ? 'border-b border-festval-border' : ''
                }`}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.15 + i * 0.1 }}
              >
                <div className="w-10 h-10 rounded-lg bg-festval-copper/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                  <pillar.icon className="w-5 h-5 text-festval-copper" />
                </div>
                <div>
                  <h3 className="font-body text-base font-semibold text-festval-ivory mb-1">
                    {pillar.title}
                  </h3>
                  <p className="font-body text-sm text-festval-stone">
                    {pillar.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
