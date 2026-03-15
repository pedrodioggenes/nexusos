import { motion } from 'framer-motion';
import { 
  CheckCircle2,
  MessageCircle,
  GraduationCap,
  ShoppingCart,
  TrendingUp
} from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';

/**
 * UseCases - Nexus OS Landing
 * Mobile: stacked cards with vertical Before→After + impact badge
 * Desktop: horizontal row layout
 */
export function UseCases() {
  const useCases = [
    { icon: MessageCircle, problem: 'Comunicação via grupos de WhatsApp', solution: 'Feed hierárquico com confirmação de leitura', impact: '100% rastreável' },
    { icon: GraduationCap, problem: 'Treinamentos em PDF sem controle', solution: 'Academy com certificados automáticos', impact: '+200 certificados' },
    { icon: ShoppingCart, problem: 'Verbas cooperadas em planilhas', solution: 'Trade com tracking e ROI em tempo real', impact: 'R$ 2.4M rastreados' },
    { icon: TrendingUp, problem: 'Relatórios manuais levavam dias', solution: 'NexusIA gera insights em segundos', impact: '95% menos tempo' },
  ];

  return (
    <section className="pt-14 sm:pt-16 md:pt-20 pb-12 md:pb-16 px-5 sm:px-6 md:px-8 bg-festval-charcoal">
      <div className="max-w-5xl mx-auto">
        <BlurFade delay={0}>
          <div className="text-center mb-10 md:mb-16">
            <span className="text-xs font-medium tracking-widest text-festval-copper uppercase mb-4 block">
              Problemas Resolvidos
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-festval-ivory mb-4">
              Antes vs. Depois.
            </h2>
            <p className="text-base text-festval-stone max-w-lg mx-auto">
              Transformações reais na operação dos nossos clientes.
            </p>
          </div>
        </BlurFade>

        {/* Mobile: stacked vertical cards */}
        <div className="md:hidden space-y-3">
          {useCases.map((useCase, index) => (
            <BlurFade key={useCase.problem} delay={0.1 + index * 0.08}>
              <div className="relative p-5 rounded-xl bg-festval-graphite border border-festval-border">
                {/* Impact badge top-right */}
                <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold bg-festval-copper/15 text-festval-copper">
                  {useCase.impact}
                </span>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-festval-charcoal border border-festval-border flex items-center justify-center shrink-0">
                    <useCase.icon className="w-5 h-5 text-festval-stone" />
                  </div>
                </div>

                {/* Before */}
                <div className="mb-3">
                  <p className="text-[10px] text-festval-stone uppercase tracking-wider mb-1">Antes</p>
                  <p className="text-sm text-festval-stone line-through decoration-festval-stone/50">
                    {useCase.problem}
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-festval-copper/20 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-festval-copper" />
                  </div>
                  <div className="h-px flex-1 bg-festval-border" />
                </div>

                {/* After */}
                <div>
                  <p className="text-[10px] text-festval-copper uppercase tracking-wider mb-1">Depois</p>
                  <p className="text-sm text-festval-ivory font-medium">
                    {useCase.solution}
                  </p>
                </div>
              </div>
            </BlurFade>
          ))}
        </div>

        {/* Desktop: horizontal rows */}
        <div className="hidden md:block space-y-4">
          {useCases.map((useCase, index) => (
            <BlurFade key={useCase.problem} delay={0.1 + index * 0.1}>
              <motion.div
                whileHover={{ borderColor: 'hsl(240 4% 20%)' }}
                className="p-6 md:p-8 rounded-2xl bg-festval-graphite border border-festval-border transition-all duration-300"
              >
                <div className="grid grid-cols-12 gap-6 items-center">
                  <div className="col-span-1">
                    <div className="w-12 h-12 rounded-xl bg-festval-charcoal border border-festval-border flex items-center justify-center">
                      <useCase.icon className="w-6 h-6 text-festval-stone" />
                    </div>
                  </div>
                  <div className="col-span-4">
                    <p className="text-xs text-festval-stone uppercase tracking-wider mb-1">Antes</p>
                    <p className="text-sm text-festval-stone line-through decoration-festval-stone/50">{useCase.problem}</p>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <div className="w-8 h-8 rounded-full bg-festval-copper/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-festval-copper" />
                    </div>
                  </div>
                  <div className="col-span-4">
                    <p className="text-xs text-festval-copper uppercase tracking-wider mb-1">Depois</p>
                    <p className="text-sm text-festval-ivory font-medium">{useCase.solution}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-lg font-bold text-festval-copper">{useCase.impact}</p>
                  </div>
                </div>
              </motion.div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
