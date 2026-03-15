import { motion } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 24 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: '-50px' as const },
  transition: { duration: 0.6, ease: EASE },
};

const STEPS = [
  {
    num: '01',
    title: 'Diagnóstico',
    text: 'Imersão na operação real. Mapeamento de processos, dores e oportunidades. O nexusOS é calibrado antes de ser ligado.',
  },
  {
    num: '02',
    title: 'Configuração',
    text: 'Personalização profunda — identidade visual, lógica operacional, apps ativos, integrações. Não é trocar o logo. É adaptar o sistema ao DNA do negócio.',
  },
  {
    num: '03',
    title: 'Implantação',
    text: 'Onboarding estruturado, treinamento das equipes, validação de cada app em condições reais de operação.',
  },
  {
    num: '04',
    title: 'Operação Contínua',
    text: 'A Araripe não desaparece após a entrega. Discovery contínuo, evolução do sistema, novos apps conforme o negócio cresce.',
  },
];

export function NexusMethodology() {
  return (
    <section id="metodologia" className="py-28 lg:py-32 px-6 md:px-10 lg:px-20 bg-festval-charcoal">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div className="mb-16 max-w-2xl" {...fadeUp}>
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-festval-copper block mb-4">
            A Metodologia
          </span>
          <h2 className="font-display text-[36px] sm:text-[44px] lg:text-[48px] font-extrabold text-festval-ivory leading-[1.1] mb-5">
            O nexusOS não é instalado.
            <br />
            É <span className="text-festval-copper">implantado.</span>
          </h2>
          <p className="font-body text-lg text-festval-stone leading-relaxed max-w-[600px]">
            A diferença entre um software que você configura sozinho
            e um sistema que a Araripe opera dentro do seu negócio.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className="relative p-7 rounded-lg border border-festval-border bg-festval-graphite"
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 + i * 0.1 }}
            >
              {/* Connector line — desktop */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-px bg-festval-copper/40" />
              )}

              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-festval-copper block mb-3">
                Etapa {step.num}
              </span>
              <h3 className="font-body text-base font-semibold text-festval-ivory mb-3">
                {step.title}
              </h3>
              <p className="font-body text-[15px] text-festval-stone leading-[1.7]">
                {step.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
