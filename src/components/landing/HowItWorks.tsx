import { motion } from 'framer-motion';
import { 
  LogIn, 
  LayoutDashboard, 
  Blocks, 
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';

/**
 * HowItWorks - NexusDesk Landing
 * Mobile: vertical timeline with copper left border
 * Desktop: horizontal 4-column grid
 */
export function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: LogIn,
      title: 'Login por Perfil',
      description: 'Acesso seguro baseado no seu cargo e permissões. Cada colaborador vê exatamente o que precisa.',
    },
    {
      number: '02',
      icon: LayoutDashboard,
      title: 'Home Personalizada',
      description: 'Widgets, feed da equipe, notificações e atalhos configurados para o seu dia a dia.',
    },
    {
      number: '03',
      icon: Blocks,
      title: 'Aplicativos Integrados',
      description: 'Acesse qualquer um dos 16 aplicativos dentro do mesmo ecossistema.',
    },
    {
      number: '04',
      icon: BarChart3,
      title: 'IA e Resultados',
      description: 'Consulte a NexusIA para análises, relatórios e insights em tempo real sobre toda a operação.',
    },
  ];

  return (
    <section id="como-funciona" className="py-20 md:py-32 px-5 sm:px-6 md:px-8 bg-festval-graphite border-y border-festval-border">
      <div className="max-w-5xl mx-auto">
        <BlurFade delay={0}>
          <div className="text-center mb-12 md:mb-16">
            <span className="text-xs font-medium tracking-widest text-festval-copper uppercase mb-4 block">
              Jornada do Colaborador
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-festval-ivory mb-4">
              Como funciona.
            </h2>
            <p className="text-base text-festval-stone max-w-lg mx-auto">
              Do login aos resultados, em uma experiência fluida.
            </p>
          </div>
        </BlurFade>

        {/* Mobile: vertical timeline */}
        <div className="md:hidden">
          <div className="relative pl-8">
            {/* Copper timeline line */}
            <div className="absolute left-[13px] top-2 bottom-2 w-px bg-festval-copper/30" />

            <div className="space-y-8">
              {steps.map((step, index) => (
                <BlurFade key={step.number} delay={0.1 + index * 0.1}>
                  <div className="relative">
                    {/* Number dot on the line */}
                    <div className="absolute -left-8 top-0 w-[27px] h-[27px] rounded-full bg-festval-copper flex items-center justify-center z-10">
                      <span className="text-[10px] font-bold text-white">{step.number}</span>
                    </div>
                    <div className="pt-0.5">
                      <h4 className="text-base font-semibold text-festval-ivory mb-1.5">
                        {step.title}
                      </h4>
                      <p className="text-sm text-festval-stone leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </BlurFade>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop: horizontal grid */}
        <div className="hidden md:block relative">
          <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-px bg-festval-border" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <BlurFade key={step.number} delay={0.1 + index * 0.1}>
                <motion.div
                  className="relative text-center"
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <div className="relative mx-auto mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-festval-charcoal border border-festval-border flex items-center justify-center mx-auto relative z-10">
                      <step.icon className="w-8 h-8 text-festval-ivory" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-festval-copper flex items-center justify-center z-20">
                      <span className="text-xs font-bold text-white">{step.number}</span>
                    </div>
                  </div>

                  <h4 className="text-lg font-semibold text-festval-ivory mb-2">
                    {step.title}
                  </h4>
                  <p className="text-sm text-festval-stone leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              </BlurFade>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
