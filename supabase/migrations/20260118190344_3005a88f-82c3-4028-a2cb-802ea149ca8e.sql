-- P0: CORREÇÃO DE SEGURANÇA - RLS POLICIES

-- 1. Remover policies permissivas existentes e criar novas mais restritivas

-- campaigns: permitir apenas usuários internos do mesmo tenant
DROP POLICY IF EXISTS "Authenticated users can view campaigns" ON public.campaigns;
CREATE POLICY "Internal users can view campaigns"
  ON public.campaigns FOR SELECT
  USING (get_user_type(auth.uid()) = 'internal'::user_type);

-- campaign_units: mesma lógica
DROP POLICY IF EXISTS "Authenticated users can view campaign_units" ON public.campaign_units;
CREATE POLICY "Internal users can view campaign_units"
  ON public.campaign_units FOR SELECT
  USING (get_user_type(auth.uid()) = 'internal'::user_type);

-- contacts: apenas internos
DROP POLICY IF EXISTS "Authenticated users can view contacts" ON public.contacts;
CREATE POLICY "Internal users can view contacts"
  ON public.contacts FOR SELECT
  USING (get_user_type(auth.uid()) = 'internal'::user_type);

-- message_logs: apenas internos
DROP POLICY IF EXISTS "Authenticated users can view message_logs" ON public.message_logs;
CREATE POLICY "Internal users can view message_logs"
  ON public.message_logs FOR SELECT
  USING (get_user_type(auth.uid()) = 'internal'::user_type);

-- subscriptions: apenas internos
DROP POLICY IF EXISTS "Authenticated users can view subscriptions" ON public.subscriptions;
CREATE POLICY "Internal users can view subscriptions"
  ON public.subscriptions FOR SELECT
  USING (get_user_type(auth.uid()) = 'internal'::user_type);

-- units: apenas internos (units é core do sistema, não deve ser público)
DROP POLICY IF EXISTS "Authenticated users can view units" ON public.units;
CREATE POLICY "Internal users can view units"
  ON public.units FOR SELECT
  USING (get_user_type(auth.uid()) = 'internal'::user_type);

-- 2. Adicionar policy para sigma_admin ver tudo
CREATE POLICY "Sigma admins can view all campaigns"
  ON public.campaigns FOR SELECT
  USING (is_sigma_admin(auth.uid()));

CREATE POLICY "Sigma admins can view all campaign_units"
  ON public.campaign_units FOR SELECT
  USING (is_sigma_admin(auth.uid()));

CREATE POLICY "Sigma admins can view all contacts"
  ON public.contacts FOR SELECT
  USING (is_sigma_admin(auth.uid()));

CREATE POLICY "Sigma admins can view all message_logs"
  ON public.message_logs FOR SELECT
  USING (is_sigma_admin(auth.uid()));

CREATE POLICY "Sigma admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (is_sigma_admin(auth.uid()));

CREATE POLICY "Sigma admins can view all units"
  ON public.units FOR SELECT
  USING (is_sigma_admin(auth.uid()));

-- 3. Permitir admins ver todos os profiles (necessário para gestão)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Internal users can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    (auth.uid() = user_id) OR 
    (get_user_type(auth.uid()) = 'internal'::user_type) OR
    is_sigma_admin(auth.uid())
  );

-- 4. Adicionar policy para admins verem user_roles (gestão de usuários)
CREATE POLICY "Internal admins can view user_roles"
  ON public.user_roles FOR SELECT
  USING (
    (auth.uid() = user_id) OR
    (get_user_type(auth.uid()) = 'internal'::user_type AND has_role(auth.uid(), 'admin'::app_role))
  );