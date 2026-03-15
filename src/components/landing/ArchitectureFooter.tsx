import { BlurFade } from '@/components/ui/blur-fade';

/**
 * ArchitectureFooter - NexusDesk Landing
 * Mobile: logo + copyright only (no dead links)
 * Desktop: full footer with link columns
 */
export function ArchitectureFooter() {
  const footerLinks = {
    plataforma: [
      { label: 'Aplicativos', href: '#aplicativos' },
      { label: 'Como Funciona', href: '#como-funciona' },
      { label: 'Segurança', href: '#' },
    ],
    suporte: [
      { label: 'FAQ', href: '#' },
      { label: 'Documentação', href: '#' },
      { label: 'Status', href: '#' },
    ],
    legal: [
      { label: 'Termos de Uso', href: '#' },
      { label: 'Privacidade', href: '#' },
    ],
    contato: [
      { label: 'Email', href: 'mailto:contato@araripe.me' },
      { label: 'WhatsApp', href: '#' },
    ],
  };

  return (
    <footer className="py-10 sm:py-16 md:py-20 px-5 sm:px-6 md:px-8 bg-festval-charcoal border-t border-festval-border">
      <div className="max-w-5xl mx-auto">
        {/* Mobile: minimal footer */}
        <div className="md:hidden text-center">
          <BlurFade delay={0}>
            <div className="text-base font-bold tracking-tight mb-2">
              <span className="text-festval-ivory">NOS</span><span className="text-festval-copper">Works</span>
            </div>
            <p className="text-[11px] text-festval-stone mb-1">
              O Sistema Operacional de Negócios por Araripe.me
            </p>
            <p className="text-[10px] text-zinc-500">
              © 2025 NexusDesk by Araripe. Todos os direitos reservados.
            </p>
          </BlurFade>
        </div>

        {/* Desktop: full footer */}
        <div className="hidden md:block">
          <BlurFade delay={0}>
            <div className="grid grid-cols-5 gap-12 mb-12">
              <div>
                <div className="text-lg font-bold tracking-tight mb-4">
                  <span className="text-festval-ivory">NOS</span><span className="text-festval-copper">Works</span>
                </div>
                <p className="text-xs text-festval-stone leading-relaxed max-w-xs">
                  O Sistema Operacional de Negócios por Araripe.me.
                </p>
                <p className="text-[10px] text-festval-stone/60 mt-2">
                  Construído sobre arquitetura Nexus por Araripe
                </p>
              </div>

              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category}>
                  <h5 className="text-xs font-semibold text-festval-ivory uppercase tracking-wider mb-4">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h5>
                  <ul className="space-y-3">
                    {links.map((link) => (
                      <li key={link.label}>
                        <a href={link.href} className="text-sm text-festval-stone hover:text-festval-ivory transition-colors">
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </BlurFade>

          <BlurFade delay={0.1}>
            <div className="pt-8 border-t border-festval-border">
              <p className="text-xs text-zinc-500 text-center">
                © 2025 NexusDesk by Araripe. Todos os direitos reservados.
              </p>
            </div>
          </BlurFade>
        </div>
      </div>
    </footer>
  );
}
