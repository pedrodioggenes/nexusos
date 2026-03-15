
ALTER TABLE public.marketing_executions DROP CONSTRAINT IF EXISTS valid_channel;

ALTER TABLE public.marketing_executions ADD CONSTRAINT valid_channel CHECK (
  channel IN (
    'instagram', 'facebook', 'tiktok', 'youtube', 'linkedin', 'site', 'email',
    'whatsapp', 'tv_interna', 'encarte', 'loja_fisica',
    'endomarketing', 'compras', 'treinamento', 'producao_fisica', 'outros'
  )
);
