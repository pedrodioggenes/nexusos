import { motion } from 'framer-motion';
import { Brain, ClipboardList, ShoppingCart, Megaphone, TrendingUp, Bell, Search } from 'lucide-react';

/**
 * PortalPreview - High-fidelity mock of the internal platform
 * Apple + ONM aesthetic - Premium glass design
 */
export function PortalPreview() {
  const modules = [
    { icon: Brain, name: 'NexusIA', color: 'bg-module-ia', textColor: 'text-module-ia', status: 'online' },
    { icon: ClipboardList, name: 'Marketing', color: 'bg-module-gestao', textColor: 'text-module-gestao', status: 'online' },
    { icon: ShoppingCart, name: 'Trade', color: 'bg-module-trade', textColor: 'text-module-trade', status: '3 pendentes' },
    { icon: Megaphone, name: 'Ofertas', color: 'bg-module-ofertas', textColor: 'text-module-ofertas', status: 'online' },
  ];

  return (
    <motion.div
      className="relative w-full max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Browser chrome / window frame */}
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-border/30 bg-card/90 backdrop-blur-2xl shadow-2xl">
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 bg-card/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#FFBD2E]" />
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#28C840]" />
            </div>
          </div>
          
          {/* URL bar */}
          <div className="flex-1 max-w-md mx-4 hidden sm:block">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/20">
              <Search className="w-3 h-3 text-muted-foreground/60" />
              <span className="text-xs text-muted-foreground/70 font-mono">app.nexus.araripe.me</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-muted-foreground/50" />
          </div>
        </div>

        {/* Content area */}
        <div className="p-4 md:p-6 lg:p-8">
          {/* Header inside app */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wide mb-1">Bem-vindo de volta</p>
              <h3 className="text-sm md:text-base font-semibold text-foreground">Painel de Aplicativos</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] md:text-xs text-muted-foreground">Todos os sistemas online</span>
            </div>
          </div>

          {/* Module grid */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
            {modules.map((module, index) => (
              <motion.div
                key={module.name}
                className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-secondary/30 border border-border/20 hover:border-border/40 transition-all duration-300 cursor-pointer group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl ${module.color}/20 flex items-center justify-center`}>
                    <module.icon className={`w-4 h-4 md:w-5 md:h-5 ${module.textColor}`} />
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                </div>
                <p className="text-xs md:text-sm font-semibold text-foreground/90 group-hover:text-foreground transition-colors mb-1">
                  {module.name}
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground">
                  {module.status}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Quick stats bar */}
          <motion.div
            className="flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-module-gestao/10 via-module-ia/5 to-module-trade/10 border border-border/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-success/20 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-success" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-muted-foreground">Performance geral</p>
                <p className="text-xs md:text-sm font-semibold text-foreground">+23% este mês</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] md:text-xs text-muted-foreground">Campanhas ativas</p>
              <p className="text-xs md:text-sm font-semibold text-module-ofertas">12</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative glow */}
      <div 
        className="absolute inset-0 -z-10 blur-3xl opacity-40"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--module-ia) / 0.3) 0%, hsl(var(--module-gestao) / 0.2) 50%, hsl(var(--module-trade) / 0.3) 100%)',
          transform: 'translateY(20%) scale(0.9)',
        }}
      />
    </motion.div>
  );
}
