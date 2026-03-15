import { ShoppingCart, FileText, Trophy } from "lucide-react";

interface Props {
  textoPasso1?: string | null;
  textoPasso2?: string | null;
  textoPasso3?: string | null;
  corPrimaria: string;
}

export default function DynamicHowItWorks({ textoPasso1, textoPasso2, textoPasso3, corPrimaria }: Props) {
  const steps = [
    { icon: ShoppingCart, title: "Compre", desc: textoPasso1 || "Faça suas compras em qualquer loja da rede." },
    { icon: FileText, title: "Cadastre", desc: textoPasso2 || "Cadastre seu cupom fiscal e dados pessoais na plataforma." },
    { icon: Trophy, title: "Concorra", desc: textoPasso3 || "Acompanhe os sorteios e descubra se você foi premiado!" },
  ];

  return (
    <section id="como-funciona" className="py-16 md:py-24 bg-background">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-10">
          Como <span style={{ color: corPrimaria }}>Funciona</span>
        </h2>
        <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ backgroundColor: `${corPrimaria}1a` }}>
                  <s.icon className="w-7 h-7" style={{ color: corPrimaria }} strokeWidth={1.5} />
                </div>
                <div className="text-xs font-bold mb-1 uppercase tracking-wide" style={{ color: corPrimaria }}>Passo {i + 1}</div>
                <h3 className="text-lg font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
