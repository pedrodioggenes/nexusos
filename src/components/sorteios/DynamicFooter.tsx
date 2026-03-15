import { ShoppingCart, Shield, CheckCircle2 } from "lucide-react";

interface Props {
  nomeEmpresa: string;
  whatsappContato?: string | null;
  corPrimaria: string;
  logoUrl?: string | null;
}

export default function DynamicFooter({ nomeEmpresa, whatsappContato, corPrimaria, logoUrl }: Props) {
  return (
    <footer className="bg-foreground text-background">
      {whatsappContato && (
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h3 className="text-xl font-bold mb-2">Dúvidas?</h3>
            <p className="text-sm opacity-70 mb-4">Entre em contato pelo WhatsApp</p>
            <a href={`https://wa.me/55${whatsappContato.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90"
              style={{ backgroundColor: corPrimaria, color: "#fff" }}>
              Falar no WhatsApp
            </a>
          </div>
        </div>
      )}
      <div className="border-t border-card/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {logoUrl ? (
                <img src={logoUrl} alt={nomeEmpresa} className="h-8 w-auto" />
              ) : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: corPrimaria }}>
                  <ShoppingCart className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
              )}
              <span className="text-lg font-bold">{nomeEmpresa}</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 opacity-60"><Shield className="w-4 h-4" /><span className="text-xs">Dados Protegidos</span></div>
              <div className="flex items-center gap-1.5 opacity-60"><CheckCircle2 className="w-4 h-4" /><span className="text-xs">Site Seguro</span></div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-card/10 text-center">
            <p className="text-xs opacity-40">© {new Date().getFullYear()} {nomeEmpresa}. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
