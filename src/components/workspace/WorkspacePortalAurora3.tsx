import { motion } from "framer-motion";
import { LogOut, TrendingUp, Target, ChevronRight } from "lucide-react";
import { useMemo, type ComponentType, type SVGProps } from "react";

import { cn } from "@/lib/utils";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import nexusLogo from "@/assets/nexus-logo.svg";

type ModuleTone = "ia" | "gestao" | "trade" | "ofertas" | "comunidade" | "academy" | "pmo" | "cliente" | "compras" | "dominio" | "rh" | "reposicao" | "cd" | "financeiro" | "loja";

type PortalModule = {
  id: string;
  name: string;
  description: string;
  category: string;
  path: string;
  tone: ModuleTone;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  available: boolean;
};

function toneVar(tone: ModuleTone) {
  const map: Record<ModuleTone, string> = {
    ia: "--module-ia",
    gestao: "--module-gestao",
    trade: "--module-trade",
    ofertas: "--module-ofertas",
    comunidade: "--module-comunidade",
    academy: "--module-academy",
    pmo: "--module-pmo",
    cliente: "--module-cliente",
    compras: "--module-compras",
    dominio: "--module-dominio",
    rh: "--module-rh",
    reposicao: "--module-reposicao",
    cd: "--module-cd",
    financeiro: "--module-financeiro",
    loja: "--module-loja",
  };
  return map[tone];
}

function toneColor(tone: ModuleTone) {
  return `hsl(var(${toneVar(tone)}))`;
}

export function WorkspacePortalAurora3({
  displayName,
  onSignOut,
  modules,
  className,
}: {
  displayName: string;
  onSignOut: () => void;
  modules: PortalModule[];
  className?: string;
}) {
  const availableModules = useMemo(
    () => modules.filter((m) => m.available),
    [modules]
  );

  return (
    <div className={cn("min-h-[100dvh] flex flex-col bg-surface-base", className)}>
      {/* Navbar Fixa no Topo */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-3 sm:px-4 py-1.5 bg-surface-overlay/95 backdrop-blur-xl border-b border-divider shadow-[inset_0_-1px_0_hsl(var(--divider))]">
        <div className="flex items-center">
          <img src={nexusLogo} alt="Nexus" className="h-7 sm:h-8 w-auto" />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle variant="minimal" className="text-muted-foreground hover:text-foreground h-10 w-10 sm:h-9 sm:w-9 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0" />
          <NotificationCenter />
          <button 
            type="button"
            className="p-2.5 sm:p-2 rounded-lg transition-colors text-muted-foreground hover:text-destructive bg-muted/50 shadow-[inset_0_1px_2px_hsl(var(--background)/0.2)] min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 touch-manipulation"
            onClick={onSignOut}
            aria-label="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 py-2 sm:py-3">
        <div className="w-full max-w-5xl">
          {/* Welcome - ultra compacto */}
          <div className="mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-foreground/95 mb-0.5 sm:mb-1">
              Bem-vindo, <span className="text-foreground font-semibold">{displayName}</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Selecione um aplicativo para começar
            </p>
          </div>

          {/* Aplicativos - Grid responsivo */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {availableModules.map((module) => {
            const color = toneColor(module.tone);

            return (
              <motion.button
                key={module.id}
                type="button"
                className="group w-full p-2.5 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl text-left relative bg-surface-elevated border border-divider-strong shadow-[inset_0_1px_3px_hsl(var(--background)/0.25),inset_0_0_0_1px_hsl(var(--background)/0.08)] touch-manipulation"
                initial={{ y: 0 }}
                whileHover={{ 
                  y: -2, 
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => {
                  window.location.assign(module.path);
                }}
              >
                {/* Seta alinhada com ícone */}
                <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3">
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
                </div>

                {/* Ícone - Topo esquerda */}
                <div 
                  className="p-1.5 sm:p-2 rounded-md sm:rounded-lg w-fit mb-1.5 sm:mb-2"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <module.icon 
                    className="w-4 h-4 sm:w-5 sm:h-5" 
                    style={{ color }} 
                  />
                </div>

                {/* Categoria uppercase */}
                <p
                  className="text-[9px] sm:text-[10px] lg:text-[11px] font-medium uppercase tracking-wider mb-0.5"
                  style={{ color }}
                >
                  {module.category}
                </p>

                {/* Nome do aplicativo */}
                <h3 className="font-semibold text-xs sm:text-sm lg:text-[15px] text-foreground/95 mb-0.5 leading-tight">
                  {module.name}
                </h3>

                {/* Descrição - oculta em mobile, 1 linha em tablet, 2 linhas em desktop */}
                <p className="hidden lg:block text-[11px] xl:text-xs text-muted-foreground leading-tight line-clamp-1 pr-4">
                  {module.description}
                </p>
              </motion.button>
            );
          })}
          </div>
        </div>
      </main>

      {/* Stats Footer - compacto */}
      <footer className="px-3 sm:px-4 pb-3">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-surface-overlay/85 border border-divider shadow-[inset_0_1px_2px_hsl(var(--background)/0.2)]">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-success" />
            <span className="text-xs text-muted-foreground">
              <span className="text-success font-medium">+23%</span> este mês
            </span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              <span className="text-foreground/80 font-medium">12</span> campanhas ativas
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
