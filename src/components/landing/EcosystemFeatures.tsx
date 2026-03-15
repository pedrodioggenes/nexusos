import { motion } from 'framer-motion';
import { 
  UserCog, 
  Bot, 
  MessageSquareText, 
  Smartphone, 
  Shield, 
  Globe, 
  Radio, 
  SlidersHorizontal
} from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';

/**
 * EcosystemFeatures - NexusDesk Landing
 * Mobile: compact single-column with inline icon+title
 * Desktop: 4-column grid
 */
export function EcosystemFeatures() {
  const features = [
    { icon: UserCog, title: 'Perfis Inteligentes', description: 'Cada cargo vê exatamente o que precisa. Colaborador, chefe, diretor — experiências personalizadas.' },
    { icon: Bot, title: 'IA Conversacional', description: 'NexusIA integrada em toda a plataforma para análises, relatórios e insights em linguagem natural.' },
    { icon: MessageSquareText, title: 'Comunicação Hierárquica', description: 'Feed direcional com confirmação de leitura. Cada nível da organização se comunica de forma estruturada.' },
    { icon: Smartphone, title: 'Mobile-First', description: 'Interface otimizada para toque, com bottom navigation e experiência nativa no celular.' },
    { icon: Shield, title: 'Segurança Enterprise', description: 'LGPD compliance, audit trails completos e dados isolados por loja com criptografia.' },
    { icon: Globe, title: 'Integração ERP', description: 'Conectores nativos com Winthor e principais ERPs do varejo brasileiro.' },
    { icon: Radio, title: 'Tempo Real', description: 'Dashboards, feeds e notificações atualizados ao vivo via websockets.' },
    { icon: SlidersHorizontal, title: 'Customizável', description: 'Widgets configuráveis, dashboards por perfil e home personalizada para cada colaborador.' },
  ];

  return (
    <section className="pt-16 sm:pt-20 md:pt-24 pb-10 sm:pb-12 md:pb-14 px-4 sm:px-6 md:px-8 bg-festval-charcoal">
      <div className="max-w-6xl mx-auto">
        <BlurFade delay={0}>
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <span className="text-[10px] sm:text-xs font-medium tracking-widest text-festval-copper uppercase mb-3 sm:mb-4 block">
              Por que NexusDesk
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-festval-ivory mb-3 sm:mb-4">
              O que torna diferente.
              <br />
              <span className="text-festval-stone">O que torna melhor.</span>
            </h2>
            <p className="text-sm sm:text-base text-festval-stone max-w-2xl mx-auto px-2">
              Por trás de uma interface simples, existe uma plataforma construída 
              para as demandas mais exigentes do varejo.
            </p>
          </div>
        </BlurFade>

        {/* Mobile: compact list with inline icon */}
        <div className="md:hidden space-y-2.5">
          {features.map((feature, index) => (
            <BlurFade key={feature.title} delay={0.05 + index * 0.04}>
              <div className="p-4 rounded-xl bg-festval-graphite border border-festval-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-festval-charcoal border border-festval-border flex items-center justify-center shrink-0">
                    <feature.icon className="w-4 h-4 text-festval-copper" />
                  </div>
                  <h4 className="text-sm font-semibold text-festval-ivory">
                    {feature.title}
                  </h4>
                </div>
                <p className="text-xs text-festval-stone leading-relaxed pl-11">
                  {feature.description}
                </p>
              </div>
            </BlurFade>
          ))}
        </div>

        {/* Desktop: 4-column grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {features.map((feature, index) => (
            <BlurFade key={feature.title} delay={0.1 + index * 0.05}>
              <motion.div
                whileHover={{ borderColor: 'hsl(240 4% 20%)' }}
                className="p-5 md:p-6 rounded-2xl bg-festval-graphite border border-festval-border transition-all duration-300 h-full"
              >
                <div className="w-10 h-10 rounded-xl bg-festval-charcoal border border-festval-border flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-festval-copper" />
                </div>
                <h4 className="text-base font-semibold text-festval-ivory mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-festval-stone leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
