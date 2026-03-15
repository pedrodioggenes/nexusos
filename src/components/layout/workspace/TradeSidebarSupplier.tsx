import { useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  FileCheck,
  Image,
  BarChart3,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const navigation: NavItem[] = [
  { title: "Visão Geral", icon: LayoutDashboard, path: "/app/trade/fornecedor" },
  { title: "Meus Pacotes", icon: Package, path: "/app/trade/fornecedor/pacotes" },
  { title: "Checklist", icon: FileCheck, path: "/app/trade/fornecedor/checklist" },
  { title: "Comprovações", icon: Image, path: "/app/trade/fornecedor/comprovacoes" },
  { title: "Relatórios", icon: BarChart3, path: "/app/trade/fornecedor/relatorios" },
  { title: "Ajuda", icon: HelpCircle, path: "/app/trade/fornecedor/ajuda" },
];

interface TradeSidebarSupplierProps {
  onNavigate?: () => void;
}

/**
 * Trade Supplier Sidebar Navigation
 * Uses app-trade (orange) color as the app identity
 */
export function TradeSidebarSupplier({ onNavigate }: TradeSidebarSupplierProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/app/trade/fornecedor") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-2 px-1">
        Navegação
      </p>
      {navigation.map((item) => {
        const active = isActive(item.path);
        return (
          <button
            key={item.path}
            onClick={() => {
              navigate(item.path);
              onNavigate?.();
            }}
            className={cn(
              "relative w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-all duration-150",
              active
                ? "bg-app-trade/10 text-app-trade"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {active && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-app-trade" />
            )}
            <item.icon className={cn(
              "h-4 w-4 shrink-0",
              active && "text-app-trade"
            )} />
            <span>{item.title}</span>
          </button>
        );
      })}
    </div>
  );
}
