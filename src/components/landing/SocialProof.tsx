import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';
import { AnimatedCounter } from '@/components/ui/animated-counter';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
}

/**
 * SocialProof - NexusDesk Landing
 * Mobile: horizontal snap-scroll carousel
 * Desktop: 3-column grid
 */
export function SocialProof() {
  const testimonials: Testimonial[] = [
    { id: '1', quote: 'O NexusDesk transformou nossa comunicação interna. Saímos do WhatsApp para um feed organizado com confirmação de leitura.', author: 'Ana Carolina', role: 'Coordenadora de Marketing', avatar: 'AC', rating: 5 },
    { id: '2', quote: 'Com o Trade, finalmente temos visibilidade total sobre as verbas e ROI de cada fornecedor. Um divisor de águas.', author: 'Roberto Silva', role: 'Gerente de Trade', avatar: 'RS', rating: 5 },
    { id: '3', quote: 'A NexusIA simplificou processos que antes levavam dias. Peço um relatório e tenho a resposta em segundos.', author: 'Fernanda Lima', role: 'Diretora Comercial', avatar: 'FL', rating: 5 },
  ];

  const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
    <div className="p-6 md:p-8 rounded-2xl bg-festval-graphite border border-festval-border h-full flex flex-col">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-festval-copper text-festval-copper" />
        ))}
      </div>
      <p className="text-festval-ivory text-sm md:text-base leading-relaxed mb-6 flex-1">
        "{testimonial.quote}"
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-festval-charcoal border border-festval-border flex items-center justify-center">
          <span className="text-xs font-medium text-festval-stone">{testimonial.avatar}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-festval-ivory">{testimonial.author}</p>
          <p className="text-xs text-festval-stone">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-20 md:py-32 px-5 sm:px-6 md:px-8 bg-festval-charcoal">
      <div className="max-w-5xl mx-auto">
        <BlurFade delay={0}>
          <div className="text-center mb-10 md:mb-16">
            <div className="text-5xl md:text-7xl font-bold text-festval-ivory mb-4">
              <AnimatedCounter value={1500} suffix="+" color="text-festval-ivory" duration={2} />
            </div>
            <p className="text-lg text-festval-stone">
              colaboradores no NexusDesk
            </p>
          </div>
        </BlurFade>

        {/* Mobile: horizontal snap carousel */}
        <div className="md:hidden -mx-5">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-5 scrollbar-hide">
            {testimonials.map((testimonial, index) => (
              <BlurFade key={testimonial.id} delay={0.1 + index * 0.1}>
                <div className="snap-start shrink-0 w-[85vw]">
                  <TestimonialCard testimonial={testimonial} />
                </div>
              </BlurFade>
            ))}
          </div>
          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5 mt-4">
            {testimonials.map((t) => (
              <div key={t.id} className="w-1.5 h-1.5 rounded-full bg-festval-border" />
            ))}
          </div>
        </div>

        {/* Desktop: 3-column grid */}
        <div className="hidden md:grid grid-cols-3 gap-4 md:gap-6">
          {testimonials.map((testimonial, index) => (
            <BlurFade key={testimonial.id} delay={0.1 + index * 0.1}>
              <motion.div whileHover={{ borderColor: 'hsl(240 4% 20%)' }} className="transition-all duration-300 h-full">
                <TestimonialCard testimonial={testimonial} />
              </motion.div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
