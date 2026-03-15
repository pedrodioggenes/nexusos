import { Gift } from "lucide-react";

interface Props {
  titulo: string;
  subtitulo?: string | null;
  descricao?: string | null;
  bannerUrl?: string | null;
  sorteioId: string;
  tenantId: string;
  corPrimaria: string;
  corSecundaria: string;
}

export default function DynamicHero({ titulo, subtitulo, descricao, bannerUrl, corPrimaria }: Props) {
  return (
    <section className="relative overflow-hidden bg-background py-12 md:py-20">
      {bannerUrl && (
        <div className="absolute inset-0 z-0">
          <img src={bannerUrl} alt="" className="w-full h-full object-cover opacity-10" />
        </div>
      )}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <div className="flex justify-center mb-8">
          <div className="w-40 h-40 rounded-full bg-muted border-4 flex items-center justify-center" style={{ borderColor: `${corPrimaria}33` }}>
            {bannerUrl ? (
              <img src={bannerUrl} alt={titulo} className="w-full h-full rounded-full object-cover" />
            ) : (
              <Gift className="w-20 h-20 text-muted-foreground/40" strokeWidth={1} />
            )}
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">
          <span style={{ color: corPrimaria }}>{titulo}</span>
        </h1>
        {subtitulo && <p className="text-lg font-semibold text-foreground/80 mb-2">{subtitulo}</p>}
        <p className="text-base text-muted-foreground max-w-lg mx-auto">
          {descricao || "Cadastre-se agora para participar da nossa promoção exclusiva!"}
        </p>
      </div>
    </section>
  );
}
