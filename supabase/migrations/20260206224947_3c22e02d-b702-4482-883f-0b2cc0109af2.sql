-- Tabela para armazenar conexões de redes sociais
CREATE TABLE public.social_media_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id),
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'tiktok', 'youtube')),
  account_name TEXT,
  account_id TEXT,
  profile_image_url TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_connected BOOLEAN DEFAULT false,
  connected_at TIMESTAMP WITH TIME ZONE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, platform)
);

-- Tabela para armazenar métricas das redes sociais
CREATE TABLE public.social_media_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID REFERENCES public.social_media_connections(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5,2) DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  video_views INTEGER DEFAULT 0,
  subscribers INTEGER DEFAULT 0,
  watch_time_hours NUMERIC(10,2) DEFAULT 0,
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(connection_id, metric_date)
);

-- Habilitar RLS
ALTER TABLE public.social_media_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas para social_media_connections
CREATE POLICY "Usuários podem ver conexões do seu tenant"
ON public.social_media_connections
FOR SELECT
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Usuários podem criar conexões do seu tenant"
ON public.social_media_connections
FOR INSERT
WITH CHECK (
  tenant_id IN (
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Usuários podem atualizar conexões do seu tenant"
ON public.social_media_connections
FOR UPDATE
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Usuários podem deletar conexões do seu tenant"
ON public.social_media_connections
FOR DELETE
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Políticas para social_media_metrics
CREATE POLICY "Usuários podem ver métricas das suas conexões"
ON public.social_media_metrics
FOR SELECT
USING (
  connection_id IN (
    SELECT id FROM public.social_media_connections 
    WHERE tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Usuários podem inserir métricas das suas conexões"
ON public.social_media_metrics
FOR INSERT
WITH CHECK (
  connection_id IN (
    SELECT id FROM public.social_media_connections 
    WHERE tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_social_media_connections_updated_at
BEFORE UPDATE ON public.social_media_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_social_connections_tenant ON public.social_media_connections(tenant_id);
CREATE INDEX idx_social_connections_platform ON public.social_media_connections(platform);
CREATE INDEX idx_social_metrics_connection ON public.social_media_metrics(connection_id);
CREATE INDEX idx_social_metrics_date ON public.social_media_metrics(metric_date);