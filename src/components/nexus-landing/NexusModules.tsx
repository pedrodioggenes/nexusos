import { motion } from 'framer-motion';
import {
  LayoutDashboard, Megaphone, ShoppingCart, Users, Warehouse,
  BrainCircuit, MessageSquare, Package, FileText,
  TrendingUp, GraduationCap, Headphones, Store,
  Gift, Repeat, ArrowRight,
} from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 24 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: '-50px' as const },
  transition: { duration: 0.6, ease: EASE },
};

const APPS = [
  { icon: LayoutDashboard, tag: 'WORKSPACE', name: 'Nexus Desk', desc: 'Workspace unificado com feeds hierárquicos, comunicação interna e painel executivo.' },
  { icon: BrainCircuit, tag: 'IA', name: 'nexusIA', desc: 'Assistente conversacional com IA integrada ao contexto operacional do negócio.' },
  { icon: Megaphone, tag: 'MARKETING', name: 'Marketing', desc: 'Gestão de campanhas, briefings, resultados e comunicação com agências.' },
  { icon: TrendingUp, tag: 'OFERTAS', name: 'Ofertas', desc: 'Gestão de ofertas e precificação com análise de margem e campanhas promocionais.' },
  { icon: ShoppingCart, tag: 'TRADE', name: 'Trade Marketing', desc: 'Ações em loja, materiais POS, promotores e análise de performance.' },
  { icon: MessageSquare, tag: 'COMMS', name: 'Comunicação', desc: 'Comunicação interna estruturada com feeds direcionais e confirmação de leitura.' },
  { icon: Package, tag: 'COMPRAS', name: 'Compras', desc: 'Gestão completa de compras com cotações, pedidos e análise de fornecedores.' },
  { icon: Warehouse, tag: 'CD', name: 'Centro de Distribuição', desc: 'Recebimento, armazenagem, picking e expedição integrados em um único fluxo.' },
  { icon: Store, tag: 'LOJA', name: 'Loja', desc: 'Gestão de lojas com visibilidade operacional, indicadores e comunicação por unidade.' },
  { icon: Repeat, tag: 'REPOSIÇÃO', name: 'Reposição', desc: 'Controle de reposição de gôndola com roteiros, checklists e fotos de execução.' },
  { icon: Users, tag: 'RH', name: 'Pessoas', desc: 'Gestão de pessoas com perfis, departamentos, escalas e indicadores de equipe.' },
  { icon: Headphones, tag: 'CLIENTE', name: 'Atendimento', desc: 'Atendimento ao cliente com chamados, SLA e base de conhecimento.' },
  { icon: GraduationCap, tag: 'ACADEMY', name: 'Academy', desc: 'Plataforma de treinamento e capacitação com trilhas, conteúdos e certificações.' },
  { icon: FileText, tag: 'DOMÍNIO', name: 'Domínio', desc: 'Gestão documental com controle de versões, templates e workflows de aprovação.' },
  { icon: Gift, tag: 'SORTEIOS', name: 'Sorteios', desc: 'Campanhas de sorteios e promoções com controle de participantes e resultados.' },
];

export function NexusModules() {
  return (
    <section id="modulos" className="py-28 lg:py-32 px-6 md:px-10 lg:px-20 bg-festval-graphite">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div className="text-center mb-16" {...fadeUp}>
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-festval-copper block mb-4">
            Os Aplicativos
          </span>
          <h2 className="font-display text-[36px] sm:text-[44px] font-bold text-festval-ivory leading-[1.1] mb-5">
            Cada app é um sistema.
            <br />
            <span className="text-festval-stone">Juntos, são uma operação.</span>
          </h2>
          <p className="font-body text-lg text-festval-stone max-w-[600px] mx-auto leading-relaxed">
            16+ aplicativos ativos. Cada um construído com lógica
            de negócio real, matemática aplicada e UX pensado
            para quem opera — não para quem demonstra.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {APPS.map((mod, i) => (
            <motion.div
              key={mod.name}
              className="group p-7 rounded-lg border border-festval-border bg-festval-charcoal hover:border-festval-copper/[0.35] hover:-translate-y-1 transition-all duration-300 flex flex-col"
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: Math.min(i * 0.04, 0.4) }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-9 h-9 rounded-lg bg-festval-copper/[0.08] flex items-center justify-center shrink-0">
                  <mod.icon className="w-[18px] h-[18px] text-festval-copper" />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-festval-copper block mb-0.5">
                    {mod.tag}
                  </span>
                  <h3 className="font-body text-[17px] font-semibold text-festval-ivory">
                    {mod.name}
                  </h3>
                </div>
              </div>

              <p className="font-body text-sm text-festval-stone leading-[1.6] mb-5 flex-1">
                {mod.desc}
              </p>

              <div className="border-t border-festval-border pt-4">
                <span className="font-body text-[13px] text-festval-copper inline-flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Saiba mais <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quote */}
        <motion.div
          className="mt-14 max-w-2xl mx-auto border-l-2 border-festval-copper pl-6 py-2"
          {...fadeUp}
        >
          <p className="font-body text-[15px] text-festval-stone-muted leading-relaxed italic">
            Novos aplicativos são desenvolvidos continuamente —
            inclusive sob demanda. Cada solução construída
            para um cliente integra o catálogo geral.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
