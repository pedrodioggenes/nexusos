import { Shield, Lock, FileCheck } from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';

/**
 * TrustSection - NexusDesk Landing
 * Mobile: horizontal row, icon + title only (no description)
 * Desktop: 3-column with descriptions
 */
export function TrustSection() {
  const trustItems = [
    { icon: Shield, title: 'Segurança Enterprise', description: 'Infraestrutura robusta com criptografia de ponta a ponta.' },
    { icon: Lock, title: 'Dados Protegidos', description: 'Conformidade com LGPD e políticas de privacidade.' },
    { icon: FileCheck, title: 'Auditoria Completa', description: 'Logs detalhados de todas as ações no sistema.' },
  ];

  return (
    <section className="py-14 md:py-24 px-5 sm:px-6 md:px-8 bg-festval-charcoal border-t border-festval-border">
      <div className="max-w-4xl mx-auto">
        {/* Mobile: horizontal compact row */}
        <div className="md:hidden">
          <BlurFade delay={0.1}>
            <div className="flex justify-between gap-2">
              {trustItems.map((item) => (
                <div key={item.title} className="flex-1 text-center">
                  <div className="w-10 h-10 rounded-xl bg-festval-graphite border border-festval-border flex items-center justify-center mx-auto mb-2.5">
                    <item.icon className="w-5 h-5 text-festval-stone" />
                  </div>
                  <h4 className="text-[11px] font-semibold text-festval-ivory leading-tight">
                    {item.title}
                  </h4>
                </div>
              ))}
            </div>
          </BlurFade>
        </div>

        {/* Desktop: full layout */}
        <div className="hidden md:grid grid-cols-3 gap-8 md:gap-12">
          {trustItems.map((item, index) => (
            <BlurFade key={item.title} delay={0.1 + index * 0.1}>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-festval-graphite border border-festval-border flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-festval-stone" />
                </div>
                <h4 className="text-sm font-semibold text-festval-ivory mb-2">{item.title}</h4>
                <p className="text-xs text-festval-stone leading-relaxed">{item.description}</p>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
