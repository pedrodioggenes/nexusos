import { Store } from "lucide-react";

interface Props {
  fotoLojaUrl?: string | null;
  nomeEmpresa: string;
}

export default function DynamicDeviceMockup({ fotoLojaUrl, nomeEmpresa }: Props) {
  return (
    <section className="py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">Nossas <span className="text-primary">Lojas</span></h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-14">A promoção vale em todas as unidades da rede {nomeEmpresa}.</p>
        <div className="inline-block relative">
          <div className="relative w-[320px] sm:w-[480px] md:w-[600px] aspect-[4/3] rounded-3xl border-[6px] border-border bg-card overflow-hidden">
            {fotoLojaUrl ? (
              <img src={fotoLojaUrl} alt={`Loja ${nomeEmpresa}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-muted">
                <Store className="w-16 h-16 text-muted-foreground" strokeWidth={1} />
                <p className="text-muted-foreground text-sm font-medium">Foto da Loja {nomeEmpresa}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
