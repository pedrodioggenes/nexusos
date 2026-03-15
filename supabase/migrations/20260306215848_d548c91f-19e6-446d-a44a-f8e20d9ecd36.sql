
-- =====================================================
-- HiperSorteios Module - Database Migration
-- Prefixed tables for multi-tenant Nexus integration
-- =====================================================

-- Enums
CREATE TYPE public.sorteios_participant_status AS ENUM ('ativo', 'bloqueado');
CREATE TYPE public.sorteios_coupon_status AS ENUM ('pendente', 'validado', 'rejeitado', 'fraudulento');
CREATE TYPE public.sorteios_sweepstake_status AS ENUM ('ativo', 'encerrado');
CREATE TYPE public.sorteios_fraud_type AS ENUM ('cpf_duplicado', 'cupom_invalido', 'frequencia_anormal');

-- Participants table
CREATE TABLE public.sorteios_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  status public.sorteios_participant_status NOT NULL DEFAULT 'ativo',
  senha_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, cpf)
);

-- Sweepstakes table
CREATE TABLE public.sorteios_sweepstakes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  slug TEXT,
  subtitulo TEXT,
  descricao TEXT,
  nome_empresa TEXT NOT NULL DEFAULT 'HiperSenna',
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
  status public.sorteios_sweepstake_status NOT NULL DEFAULT 'ativo',
  winner_id UUID REFERENCES public.sorteios_participants(id),
  cor_primaria TEXT NOT NULL DEFAULT '#ec0000',
  cor_secundaria TEXT NOT NULL DEFAULT '#fed43e',
  logo_url TEXT,
  banner_url TEXT,
  foto_loja_url TEXT,
  texto_passo1 TEXT DEFAULT 'Faça suas compras em qualquer loja da rede.',
  texto_passo2 TEXT DEFAULT 'Cadastre seu cupom fiscal e dados pessoais na plataforma.',
  texto_passo3 TEXT DEFAULT 'Acompanhe os sorteios e descubra se você foi premiado!',
  whatsapp_contato TEXT,
  regulamento_texto TEXT,
  regulamento_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Coupons table
CREATE TABLE public.sorteios_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.sorteios_participants(id) ON DELETE CASCADE,
  sorteio_id UUID REFERENCES public.sorteios_sweepstakes(id),
  cupom_numero TEXT NOT NULL,
  valor_compra NUMERIC(10,2),
  data_compra DATE,
  status public.sorteios_coupon_status NOT NULL DEFAULT 'pendente',
  validacao_erp TEXT NOT NULL DEFAULT 'pendente_erp',
  erp_resposta JSONB DEFAULT NULL,
  erp_validado_em TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  validated_at TIMESTAMP WITH TIME ZONE,
  validated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Prizes table
CREATE TABLE public.sorteios_prizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  imagem_url TEXT,
  quantidade INTEGER NOT NULL DEFAULT 0,
  sorteio_id UUID REFERENCES public.sorteios_sweepstakes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fraud logs table
CREATE TABLE public.sorteios_fraud_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.sorteios_participants(id) ON DELETE SET NULL,
  coupon_id UUID REFERENCES public.sorteios_coupons(id) ON DELETE SET NULL,
  tipo public.sorteios_fraud_type NOT NULL,
  detalhes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.sorteios_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sorteios_sweepstakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sorteios_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sorteios_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sorteios_fraud_logs ENABLE ROW LEVEL SECURITY;

-- Unique index on slug per tenant
CREATE UNIQUE INDEX idx_sorteios_sweepstakes_slug ON public.sorteios_sweepstakes (tenant_id, slug) WHERE slug IS NOT NULL;

-- Performance indexes
CREATE INDEX idx_sorteios_participants_cpf ON public.sorteios_participants(tenant_id, cpf);
CREATE INDEX idx_sorteios_coupons_participant ON public.sorteios_coupons(participant_id);
CREATE INDEX idx_sorteios_coupons_status ON public.sorteios_coupons(status);
CREATE INDEX idx_sorteios_coupons_sorteio ON public.sorteios_coupons(sorteio_id);
CREATE INDEX idx_sorteios_fraud_logs_participant ON public.sorteios_fraud_logs(participant_id);
CREATE INDEX idx_sorteios_fraud_logs_created ON public.sorteios_fraud_logs(created_at DESC);

-- =====================================================
-- RLS Policies
-- =====================================================

-- PARTICIPANTS: Public insert (registration), tenant-scoped read for internal users
CREATE POLICY "sorteios_participants_anon_insert" ON public.sorteios_participants
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "sorteios_participants_tenant_select" ON public.sorteios_participants
  FOR SELECT TO authenticated
  USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "sorteios_participants_tenant_update" ON public.sorteios_participants
  FOR UPDATE TO authenticated
  USING (tenant_id = get_user_tenant_id(auth.uid()));

-- SWEEPSTAKES: Public read for active, tenant-scoped management
CREATE POLICY "sorteios_sweepstakes_public_select" ON public.sorteios_sweepstakes
  FOR SELECT USING (true);

CREATE POLICY "sorteios_sweepstakes_tenant_insert" ON public.sorteios_sweepstakes
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "sorteios_sweepstakes_tenant_update" ON public.sorteios_sweepstakes
  FOR UPDATE TO authenticated
  USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "sorteios_sweepstakes_tenant_delete" ON public.sorteios_sweepstakes
  FOR DELETE TO authenticated
  USING (tenant_id = get_user_tenant_id(auth.uid()));

-- COUPONS: Public insert, public select for participant view, tenant-scoped management
CREATE POLICY "sorteios_coupons_anon_insert" ON public.sorteios_coupons
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "sorteios_coupons_public_select" ON public.sorteios_coupons
  FOR SELECT USING (true);

CREATE POLICY "sorteios_coupons_tenant_update" ON public.sorteios_coupons
  FOR UPDATE TO authenticated
  USING (tenant_id = get_user_tenant_id(auth.uid()));

-- PRIZES: Public read, tenant-scoped management
CREATE POLICY "sorteios_prizes_public_select" ON public.sorteios_prizes
  FOR SELECT USING (true);

CREATE POLICY "sorteios_prizes_tenant_manage" ON public.sorteios_prizes
  FOR ALL TO authenticated
  USING (tenant_id = get_user_tenant_id(auth.uid()));

-- FRAUD LOGS: Tenant-scoped only
CREATE POLICY "sorteios_fraud_logs_tenant_select" ON public.sorteios_fraud_logs
  FOR SELECT TO authenticated
  USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "sorteios_fraud_logs_tenant_insert" ON public.sorteios_fraud_logs
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

-- =====================================================
-- Database Functions
-- =====================================================

-- Verify participant login
CREATE OR REPLACE FUNCTION public.verify_sorteio_participant_login(p_cpf TEXT, p_senha TEXT, p_tenant_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_participant RECORD;
BEGIN
  SELECT id, nome, cpf, whatsapp, status, senha_hash
  INTO v_participant
  FROM public.sorteios_participants
  WHERE cpf = p_cpf AND tenant_id = p_tenant_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'CPF não encontrado.');
  END IF;

  IF v_participant.status = 'bloqueado' THEN
    RETURN json_build_object('success', false, 'message', 'Conta bloqueada. Entre em contato com o suporte.');
  END IF;

  IF v_participant.senha_hash IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Senha não cadastrada. Faça um novo cadastro.');
  END IF;

  IF v_participant.senha_hash != crypt(p_senha, v_participant.senha_hash) THEN
    RETURN json_build_object('success', false, 'message', 'Senha incorreta.');
  END IF;

  RETURN json_build_object(
    'success', true,
    'participant', json_build_object(
      'id', v_participant.id,
      'nome', v_participant.nome,
      'cpf', v_participant.cpf,
      'whatsapp', v_participant.whatsapp
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_sorteio_participant_login(TEXT, TEXT, UUID) TO anon, authenticated;

-- Set participant password
CREATE OR REPLACE FUNCTION public.set_sorteio_participant_password(p_participant_id UUID, p_senha TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.sorteios_participants
  SET senha_hash = crypt(p_senha, gen_salt('bf'))
  WHERE id = p_participant_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_sorteio_participant_password(UUID, TEXT) FROM anon, authenticated;

-- Storage bucket for campaign assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('sorteios-campaign-assets', 'sorteios-campaign-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "sorteios_assets_public_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'sorteios-campaign-assets');

CREATE POLICY "sorteios_assets_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'sorteios-campaign-assets');

CREATE POLICY "sorteios_assets_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'sorteios-campaign-assets');

CREATE POLICY "sorteios_assets_auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'sorteios-campaign-assets');
