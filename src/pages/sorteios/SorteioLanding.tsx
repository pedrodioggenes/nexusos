import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import SorteioLandingHeader from "@/components/sorteios/DynamicHeader";
import SorteioLandingHero from "@/components/sorteios/DynamicHero";
import SorteioLandingHowItWorks from "@/components/sorteios/DynamicHowItWorks";
import SorteioLandingDeviceMockup from "@/components/sorteios/DynamicDeviceMockup";
import SorteioLandingFooter from "@/components/sorteios/DynamicFooter";

export default function SorteioLanding() {
  const { slug } = useParams<{ slug: string }>();
  const [sorteio, setSorteio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchSorteio = async () => {
      if (!slug) { setNotFound(true); setLoading(false); return; }
      const { data, error } = await supabase
        .from("sorteios_sweepstakes")
        .select("*")
        .eq("slug", slug)
        .eq("status", "ativo")
        .maybeSingle();
      if (error || !data) { setNotFound(true); } else { setSorteio(data); }
      setLoading(false);
    };
    fetchSorteio();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (notFound || !sorteio) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold text-foreground">Sorteio não encontrado</h1>
      <p className="text-muted-foreground">Este sorteio não existe ou já foi encerrado.</p>
    </div>
  );

  const cor1 = sorteio.cor_primaria || "#ec0000";
  const cor2 = sorteio.cor_secundaria || "#fed43e";

  return (
    <div className="min-h-screen bg-background">
      <SorteioLandingHeader logoUrl={sorteio.logo_url} nomeEmpresa={sorteio.nome_empresa} corPrimaria={cor1} />
      <SorteioLandingHero
        titulo={sorteio.titulo}
        subtitulo={sorteio.subtitulo}
        descricao={sorteio.descricao}
        bannerUrl={sorteio.banner_url}
        sorteioId={sorteio.id}
        tenantId={sorteio.tenant_id}
        corPrimaria={cor1}
        corSecundaria={cor2}
      />
      <SorteioLandingHowItWorks textoPasso1={sorteio.texto_passo1} textoPasso2={sorteio.texto_passo2} textoPasso3={sorteio.texto_passo3} corPrimaria={cor1} />
      <SorteioLandingDeviceMockup fotoLojaUrl={sorteio.foto_loja_url} nomeEmpresa={sorteio.nome_empresa} />
      <SorteioLandingFooter nomeEmpresa={sorteio.nome_empresa} whatsappContato={sorteio.whatsapp_contato} corPrimaria={cor1} logoUrl={sorteio.logo_url} />
    </div>
  );
}
