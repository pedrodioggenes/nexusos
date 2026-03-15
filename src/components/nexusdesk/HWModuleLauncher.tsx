import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, X, Bot, Crown, DollarSign, Store, Users, LayoutDashboard, ShoppingCart, Heart, Megaphone, Briefcase, GraduationCap, Warehouse, Package, ShoppingBag, Dice5 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { ComponentType, SVGProps } from "react";

type AppTone = "ia" | "gestao" | "trade" | "ofertas" | "comunidade" | "academy" | "pmo" | "cliente" | "compras" | "dominio" | "rh" | "reposicao" | "cd" | "financeiro" | "loja" | "sorteios";

interface AppDef {
  id: string;
  name: string;
  category: string;
  path: string;
  tone: AppTone;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const TONE_COLORS: Record<AppTone, string> = {
  ia: "hsl(var(--app-ia))",
  gestao: "hsl(var(--app-gestao))",
  trade: "hsl(var(--app-trade))",
  ofertas: "hsl(var(--app-ofertas))",
  comunidade: "hsl(var(--app-comunidade))",
  academy: "hsl(var(--app-academy))",
  pmo: "hsl(var(--app-pmo))",
  cliente: "hsl(var(--app-cliente))",
  compras: "hsl(var(--app-compras))",
  dominio: "hsl(var(--app-dominio))",
  rh: "hsl(var(--app-rh))",
  reposicao: "hsl(var(--app-reposicao))",
  cd: "hsl(var(--app-cd))",
  financeiro: "hsl(var(--app-financeiro))",
  loja: "hsl(var(--app-loja))",
  sorteios: "hsl(var(--app-sorteios))",
};

const ALL_APPS: AppDef[] = [
  { id: "ia", name: "NexusIA", category: "AI ASSISTANT", path: "/app/ia", tone: "ia", icon: Bot },
  { id: "dominio", name: "Domínio", category: "EXECUTIVE BI", path: "/app/dominio", tone: "dominio", icon: Crown },
  { id: "financeiro", name: "Financeiro", category: "FINANCIAL", path: "/app/financeiro", tone: "financeiro", icon: DollarSign },
  { id: "loja", name: "Loja", category: "STORE", path: "/app/loja", tone: "loja", icon: Store },
  { id: "rh", name: "RH", category: "HUMAN RESOURCES", path: "/app/rh", tone: "rh", icon: Users },
  { id: "marketing", name: "Marketing", category: "MARKETING", path: "/app/marketing", tone: "gestao", icon: LayoutDashboard },
  { id: "trade", name: "Trade", category: "TRADE MARKETING", path: "/app/trade", tone: "trade", icon: ShoppingCart },
  { id: "cliente", name: "Cliente", category: "CUSTOMER EXP", path: "/app/cliente", tone: "cliente", icon: Heart },
  { id: "ofertas", name: "Ofertas", category: "OFFER CAMPAIGNS", path: "/app/ofertas", tone: "ofertas", icon: Megaphone },
  { id: "pmo", name: "Tech / PMO", category: "SERVICE DELIVERY", path: "/app/tech", tone: "pmo", icon: Briefcase },
  { id: "academy", name: "Academy", category: "TRAINING HUB", path: "/app/academy", tone: "academy", icon: GraduationCap },
  { id: "cd", name: "CD", category: "DISTRIBUTION", path: "/app/cd", tone: "cd", icon: Warehouse },
  { id: "reposicao", name: "Reposição", category: "REPLENISHMENT", path: "/app/reposicao", tone: "reposicao", icon: Package },
  { id: "compras", name: "Compras", category: "PURCHASING", path: "/app/compras", tone: "compras", icon: ShoppingBag },
  { id: "sorteios", name: "Sorteios", category: "PROMOTIONS", path: "/app/sorteios", tone: "sorteios", icon: Dice5 },
];

export function HWAppLauncher({ triggerClassName, externalOpen, onExternalOpenChange }: { triggerClassName?: string; externalOpen?: boolean; onExternalOpenChange?: (open: boolean) => void }) {
  const isControlled = externalOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled ? (v: boolean) => onExternalOpenChange?.(v) : setInternalOpen;
  const navigate = useNavigate();
  const { tenant, userModulesAllowed } = useAuth();

  const apps = useMemo(() => {
    return ALL_APPS.filter((m) => {
      const tenantEnabled = tenant?.modules_enabled?.includes(m.id);
      const userAllowed = !userModulesAllowed || userModulesAllowed.includes(m.id);
      return tenantEnabled && userAllowed;
    });
  }, [tenant?.modules_enabled, userModulesAllowed]);

  const handleNavigate = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      {!isControlled && (
        <button
          onClick={() => setOpen(true)}
          className={`flex items-center justify-center rounded-lg transition-colors hover:bg-zinc-800 ${triggerClassName ?? "h-9 w-9"}`}
          style={{ color: '#A1A1AA' }}
          title="Aplicativos"
        >
          <LayoutGrid className="h-[18px] w-[18px]" />
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-[560px] w-[95vw] p-0 border-0 rounded-2xl overflow-hidden"
          style={{ backgroundColor: '#0f0f10' }}
        >
          <DialogTitle className="sr-only">Aplicativos</DialogTitle>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2.5">
              <LayoutGrid className="h-5 w-5" style={{ color: '#71717A' }} />
              <h2 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>
                Aplicativos
              </h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#27272A', color: '#71717A' }}>
                {apps.length}
              </span>
            </div>
          </div>

          {/* Grid */}
          <div className="px-4 pb-5 max-h-[70vh] overflow-y-auto">
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 gap-2.5"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.04 } },
              }}
            >
              <AnimatePresence>
                {apps.map((mod) => {
                  const color = TONE_COLORS[mod.tone];
                  const Icon = mod.icon;
                  return (
                    <motion.button
                      key={mod.id}
                      variants={{
                        hidden: { opacity: 0, y: 12, scale: 0.95 },
                        visible: { opacity: 1, y: 0, scale: 1 },
                      }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      onClick={() => handleNavigate(mod.path)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 group cursor-pointer"
                      style={{
                        backgroundColor: '#18181B',
                        borderColor: '#27272A',
                      }}
                      whileHover={{
                        scale: 1.03,
                        borderColor: color,
                        boxShadow: `0 0 20px ${color}22`,
                      }}
                    >
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center transition-colors"
                        style={{ backgroundColor: `${color}15` }}
                      >
                        <Icon className="h-5 w-5" style={{ color }} />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium" style={{ color: '#FAFAFA' }}>
                          {mod.name}
                        </p>
                        <p className="text-[9px] uppercase tracking-wider mt-0.5 font-medium" style={{ color: '#52525B' }}>
                          {mod.category}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {apps.length === 0 && (
              <div className="text-center py-12">
                <LayoutGrid className="h-8 w-8 mx-auto mb-3" style={{ color: '#27272A' }} />
                <p className="text-sm" style={{ color: '#52525B' }}>Nenhum aplicativo disponível</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
