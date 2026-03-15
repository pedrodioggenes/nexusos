import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 24 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: '-50px' as const },
  transition: { duration: 0.6, ease: EASE },
};

const OS_ITEMS = [
  'Workspace completo personalizado',
  'Comunicação interna hierárquica',
  'Todos os aplicativos de gestão integrados',
  'IA conversacional integrada',
  'Painel executivo unificado',
  'Acesso ao catálogo completo de apps',
  'Onboarding e operação pela Araripe',
];

const APPS_ITEMS = [
  'Acesso direto aos apps contratados',
  'Mesma inteligência e lógica dos apps',
  'Entrada progressiva no ecossistema',
  'Sem compromisso com o OS completo',
  'Caminho natural para o OS quando fizer sentido',
];

export function NexusBifurcation() {
  return (
    <section id="bifurcacao" className="py-28 lg:py-32 px-6 md:px-10 lg:px-20 bg-festval-charcoal">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div className="text-center mb-16" {...fadeUp}>
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-festval-copper block mb-4">
            Duas Formas de Entrar
          </span>
          <h2 className="font-display text-[36px] sm:text-[44px] font-bold text-festval-ivory leading-[1.1] mb-5">
            Você começa onde
            <br />
            faz sentido para você.
          </h2>
          <p className="font-body text-lg text-festval-stone max-w-xl mx-auto leading-relaxed">
            O ecossistema nexusOS tem duas entradas.
            Nenhuma é inferior à outra — são jornadas diferentes
            para necessidades diferentes.
          </p>
        </motion.div>

        {/* Two panels */}
        <div className="relative grid lg:grid-cols-2 gap-6 lg:gap-0">
          {/* OS Completo */}
          <motion.div
            className="group p-8 sm:p-10 lg:p-12 rounded-xl lg:rounded-r-none border border-festval-copper/30 bg-festval-copper/[0.08] hover:bg-festval-copper/[0.12] transition-colors duration-300"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-festval-copper block mb-5">
              OS Completo
            </span>

            <h3 className="font-display text-[28px] sm:text-[32px] font-bold text-festval-ivory leading-[1.15] mb-5">
              O workspace total
              <br />
              do seu negócio.
            </h3>

            <div className="space-y-4 mb-8">
              <p className="font-body text-[15px] text-festval-stone leading-[1.7]">
                Comunicação interna hierárquica, gestão operacional,
                análise de dados e inteligência integrados em um único
                workspace — personalizado com a identidade visual e a
                lógica operacional da sua empresa.
              </p>
              <p className="font-body text-[15px] text-festval-stone leading-[1.7]">
                Para organizações que querem substituir o caos de
                ferramentas fragmentadas por um sistema que conhece
                o negócio de dentro.
              </p>
            </div>

            <ul className="space-y-2.5 mb-10">
              {OS_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-festval-copper shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-festval-ivory/90">{item}</span>
                </li>
              ))}
            </ul>

            <a
              href="#cta"
              className="inline-flex items-center gap-2 font-body text-sm px-6 py-3 rounded-lg bg-festval-copper text-white hover:bg-festval-copper-hover transition-colors duration-200"
            >
              Conversar sobre o OS <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Separator "ou" — desktop only */}
          <div className="hidden lg:flex absolute left-1/2 top-0 bottom-0 -translate-x-1/2 z-10 flex-col items-center justify-center">
            <div className="w-px flex-1 bg-festval-border" />
            <span className="font-mono text-xs text-festval-stone-muted py-3 px-2 bg-festval-charcoal">
              ou
            </span>
            <div className="w-px flex-1 bg-festval-border" />
          </div>

          {/* Portal de Apps */}
          <motion.div
            className="group p-8 sm:p-10 lg:p-12 rounded-xl lg:rounded-l-none border border-festval-border bg-festval-graphite hover:border-festval-copper/25 transition-colors duration-300"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.2 }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-festval-stone-muted block mb-5">
              Portal de Apps
            </span>

            <h3 className="font-display text-[28px] sm:text-[32px] font-bold text-festval-ivory leading-[1.15] mb-5">
              Inteligência específica,
              <br />
              sem o OS completo.
            </h3>

            <div className="space-y-4 mb-8">
              <p className="font-body text-[15px] text-festval-stone leading-[1.7]">
                Acesse aplicativos de gestão, análise e operação
                diretamente — sem o workspace completo, sem a camada
                de comunicação interna.
              </p>
              <p className="font-body text-[15px] text-festval-stone leading-[1.7]">
                Com toda a capacidade analítica e a lógica de negócio
                que cada app carrega. Uma entrada menor no ecossistema,
                com o mesmo nível de inteligência e seriedade.
              </p>
              <p className="font-body text-[15px] text-festval-stone leading-[1.7]">
                Para quem quer resolver um problema específico agora
                e crescer dentro do ecossistema no seu tempo.
              </p>
            </div>

            <ul className="space-y-2.5 mb-10">
              {APPS_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-festval-stone shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-festval-ivory/90">{item}</span>
                </li>
              ))}
            </ul>

            <a
              href="#modulos"
              className="inline-flex items-center gap-2 font-body text-sm px-6 py-3 rounded-lg border border-festval-border text-festval-ivory hover:border-festval-copper hover:text-festval-copper transition-all duration-200"
            >
              Ver catálogo de apps <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
