import { useState } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";

interface Props {
  logoUrl?: string | null;
  nomeEmpresa: string;
  corPrimaria: string;
}

export default function DynamicHeader({ logoUrl, nomeEmpresa, corPrimaria }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = [
    { label: "Prêmios", href: "#premios" },
    { label: "Como Participar", href: "#como-funciona" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt={nomeEmpresa} className="h-9 w-auto object-contain" />
            ) : (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: corPrimaria }}>
                <ShoppingCart className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
            )}
            <span className="text-lg font-bold text-foreground">{nomeEmpresa}</span>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{l.label}</a>
            ))}
          </nav>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-foreground">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground">{l.label}</a>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
