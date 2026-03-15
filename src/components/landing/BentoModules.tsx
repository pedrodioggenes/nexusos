import { motion } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  TrendingUp, 
  Bot,
  ShoppingCart,
  Megaphone,
  MessageSquare,
  Building2,
  DollarSign,
  Store,
  Wrench,
  Package,
  Truck,
  ClipboardList,
  UserCheck,
  Trophy
} from 'lucide-react';
import nexusdeskIcon from '@/assets/nexusdesk-icon.svg';
import { BlurFade } from '@/components/ui/blur-fade';

interface ModuleItem {
  id: string;
  title: string;
  tagline: string;
  icon: typeof Users;
  accentHue: number;
}

/**
 * BentoModules - NexusDesk Landing
 * Mobile: horizontal cards (icon left, text right) in vertical list
 * Desktop: bento grid layout
 */
export function BentoModules() {
  const heroModule: ModuleItem = {
    id: 'nexusdesk',
    title: 'NexusDesk',
    tagline: 'O Sistema Operacional Humano. Comunicação hierárquica, feed direcional, mensagens e gestão de equipes em um só lugar.',
    icon: MessageSquare,
    accentHue: 285,
  };

  const strategicModules: ModuleItem[] = [
    { id: 'ia', title: 'NexusIA', tagline: 'IA conversacional com análises, relatórios e insights automáticos.', icon: Bot, accentHue: 45 },
    { id: 'dominio', title: 'Domínio', tagline: 'Governança corporativa, indicadores e gestão estratégica da rede.', icon: Building2, accentHue: 28 },
    { id: 'financeiro', title: 'Financeiro', tagline: 'Controle financeiro, orçamentos e DRE por loja e por rede.', icon: DollarSign, accentHue: 42 },
    { id: 'loja', title: 'Loja', tagline: 'Operação de loja, checklists, visitas e monitoramento de PDV.', icon: Store, accentHue: 170 },
    { id: 'pmo', title: 'Tech', tagline: 'PMO de tecnologia, gestão de projetos e roadmap de inovação.', icon: Wrench, accentHue: 56 },
  ];

  const tacticalModules: ModuleItem[] = [
    { id: 'rh', title: 'RH', tagline: 'Gestão de pessoas, recrutamento, perfis e organograma.', icon: UserCheck, accentHue: 345 },
    { id: 'marketing', title: 'Marketing', tagline: 'Estratégia de marketing, KPIs, calendário editorial e campanhas.', icon: TrendingUp, accentHue: 350 },
  ];

  const operationalModules: ModuleItem[] = [
    { id: 'trade', title: 'Trade', tagline: 'Verbas cooperadas, pacotes e ROI por fornecedor.', icon: ShoppingCart, accentHue: 16 },
    { id: 'reposicao', title: 'Reposição', tagline: 'Controle de reposição, ruptura e abastecimento.', icon: Truck, accentHue: 100 },
    { id: 'cd', title: 'CD', tagline: 'Centro de distribuição, estoque e logística.', icon: Package, accentHue: 30 },
    { id: 'ofertas', title: 'Ofertas', tagline: 'Campanhas de ofertas, tabloides e WhatsApp.', icon: Megaphone, accentHue: 358 },
    { id: 'compras', title: 'Compras', tagline: 'Gestão de compras, cotações e fornecedores.', icon: ClipboardList, accentHue: 72 },
    { id: 'academy', title: 'Academy', tagline: 'Treinamentos, onboarding e certificações.', icon: GraduationCap, accentHue: 50 },
    { id: 'cliente', title: 'Cliente', tagline: 'CRM, atendimento e fidelização de clientes.', icon: Users, accentHue: 318 },
    { id: 'sorteios', title: 'Sorteios', tagline: 'Campanhas promocionais, cupons fiscais e sorteios com validação antifraude.', icon: Trophy, accentHue: 270 },
  ];

  const renderMobileCard = (module: ModuleItem, index: number) => (
    <BlurFade key={module.id} delay={0.03 + index * 0.02}>
      <div className="flex items-start gap-3 p-4 rounded-xl bg-festval-graphite border border-festval-border">
        <div 
          className="w-9 h-9 rounded-lg bg-festval-charcoal border border-festval-border flex items-center justify-center shrink-0 mt-0.5"
        >
          <module.icon 
            className="w-4 h-4" 
            style={{ color: `hsl(${module.accentHue} 60% 55%)` }}
          />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-festval-ivory mb-0.5">
            {module.title}
          </h4>
          <p className="text-xs text-festval-stone leading-relaxed">
            {module.tagline}
          </p>
        </div>
      </div>
    </BlurFade>
  );

  const renderDesktopCard = (module: ModuleItem, index: number) => (
    <BlurFade key={module.id} delay={0.05 + index * 0.03}>
      <motion.div
        whileHover={{ borderColor: `hsl(${module.accentHue} 50% 40% / 0.4)` }}
        className="group relative rounded-xl p-5 bg-festval-graphite border border-festval-border transition-all duration-300 h-full"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-festval-charcoal border border-festval-border flex items-center justify-center shrink-0">
            <module.icon className="w-5 h-5" style={{ color: `hsl(${module.accentHue} 60% 55%)` }} />
          </div>
          <div className="min-w-0">
            <h4 className="text-base font-semibold text-festval-ivory mb-1">{module.title}</h4>
            <p className="text-xs text-festval-stone leading-relaxed">{module.tagline}</p>
          </div>
        </div>
      </motion.div>
    </BlurFade>
  );

  const renderMobileLayerLabel = (label: string) => (
    <div className="flex items-center gap-3 my-5">
      <div className="h-px flex-1 bg-festval-border" />
      <span className="text-[10px] font-medium tracking-widest text-festval-stone uppercase">{label}</span>
      <div className="h-px flex-1 bg-festval-border" />
    </div>
  );

  const renderDesktopLayerLabel = (label: string, delay: number) => (
    <BlurFade delay={delay}>
      <div className="flex items-center gap-3 my-8">
        <div className="h-px flex-1 bg-festval-border" />
        <span className="text-xs font-medium tracking-widest text-festval-stone uppercase">{label}</span>
        <div className="h-px flex-1 bg-festval-border" />
      </div>
    </BlurFade>
  );

  return (
    <section id="aplicativos" className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 md:px-8 bg-festval-charcoal">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <BlurFade delay={0}>
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <span className="text-[10px] sm:text-xs font-medium tracking-widest text-festval-copper uppercase mb-3 sm:mb-4 block">
              Ecossistema Completo
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-festval-ivory mb-3 sm:mb-4">
              16 aplicativos.
              <br />
              <span className="text-festval-stone">Uma plataforma.</span>
            </h2>
            <p className="text-sm sm:text-base text-festval-stone max-w-2xl mx-auto px-2">
              Do operacional ao estratégico, cada aplicativo resolve uma necessidade real 
              do varejo — todos integrados e acessíveis em um único lugar.
            </p>
          </div>
        </BlurFade>

        {/* ===== MOBILE LAYOUT ===== */}
        <div className="md:hidden">
          {/* Hero - NexusDesk compact */}
          <BlurFade delay={0.05}>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-festval-graphite border border-festval-border mb-2">
              <div className="w-11 h-11 rounded-xl bg-festval-charcoal border border-festval-border flex items-center justify-center shrink-0 overflow-hidden">
                <img src={nexusdeskIcon} alt="NexusDesk" className="w-7 h-7 object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-festval-ivory">{heroModule.title}</h3>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-festval-copper/20 text-festval-copper">CENTRAL</span>
                </div>
                <p className="text-xs text-festval-stone leading-relaxed mt-0.5 line-clamp-2">
                  {heroModule.tagline}
                </p>
              </div>
            </div>
          </BlurFade>

          {renderMobileLayerLabel('Estratégico')}
          <div className="space-y-2">
            {strategicModules.map((m, i) => renderMobileCard(m, i))}
          </div>

          {renderMobileLayerLabel('Tático')}
          <div className="space-y-2">
            {tacticalModules.map((m, i) => renderMobileCard(m, i + 5))}
          </div>

          {renderMobileLayerLabel('Operacional')}
          <div className="space-y-2">
            {operationalModules.map((m, i) => renderMobileCard(m, i + 7))}
          </div>
        </div>

        {/* ===== DESKTOP LAYOUT ===== */}
        <div className="hidden md:block">
          {/* Hero - NexusDesk full-width */}
          <BlurFade delay={0.05}>
            <motion.div
              whileHover={{ borderColor: `hsl(285 50% 40% / 0.4)` }}
              className="rounded-2xl p-6 md:p-8 bg-festval-graphite border border-festval-border transition-all duration-300 mb-4"
            >
              <div className="flex flex-row items-start gap-6">
                <div className="w-14 h-14 rounded-xl bg-festval-charcoal border border-festval-border flex items-center justify-center shrink-0 overflow-hidden">
                  <img src={nexusdeskIcon} alt="NexusDesk" className="w-9 h-9 object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl md:text-3xl font-semibold text-festval-ivory">{heroModule.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-festval-copper/20 text-festval-copper">CENTRAL</span>
                  </div>
                  <p className="text-base text-festval-stone leading-relaxed max-w-2xl">{heroModule.tagline}</p>
                </div>
              </div>
            </motion.div>
          </BlurFade>

          {renderDesktopLayerLabel('Estratégico', 0.1)}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {strategicModules.slice(0, 3).map((m, i) => renderDesktopCard(m, i))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3 mb-4 max-w-4xl mx-auto">
            {strategicModules.slice(3).map((m, i) => renderDesktopCard(m, i + 3))}
          </div>

          {renderDesktopLayerLabel('Tático', 0.2)}
          <div className="grid grid-cols-2 gap-3 mb-4 max-w-4xl mx-auto">
            {tacticalModules.map((m, i) => renderDesktopCard(m, i + 5))}
          </div>

          {renderDesktopLayerLabel('Operacional', 0.3)}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {operationalModules.slice(0, 3).map((m, i) => renderDesktopCard(m, i + 7))}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {operationalModules.slice(3, 6).map((m, i) => renderDesktopCard(m, i + 10))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3 max-w-4xl mx-auto">
            {operationalModules.slice(6).map((m, i) => renderDesktopCard(m, i + 13))}
          </div>
        </div>
      </div>
    </section>
  );
}
