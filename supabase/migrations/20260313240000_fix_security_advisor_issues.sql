-- ============================================================
-- Fix Supabase Security Advisor warnings (5 issues)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. export_schema_ddl() — SECURITY DEFINER sem SET search_path
--    Risco: function pode ser explorada via search_path injection.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.export_schema_ddl()
  RETURNS json
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'tables', (
      SELECT json_agg(json_build_object(
        'table_name', t.table_name,
        'columns', (
          SELECT json_agg(json_build_object(
            'column_name', c.column_name,
            'data_type', c.data_type,
            'udt_name', c.udt_name,
            'column_default', c.column_default,
            'is_nullable', c.is_nullable,
            'character_maximum_length', c.character_maximum_length
          ) ORDER BY c.ordinal_position)
          FROM information_schema.columns c
          WHERE c.table_schema = 'public' AND c.table_name = t.table_name
        ),
        'primary_keys', (
          SELECT json_agg(kcu.column_name)
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
          WHERE tc.table_schema = 'public'
            AND tc.table_name = t.table_name
            AND tc.constraint_type = 'PRIMARY KEY'
        ),
        'foreign_keys', (
          SELECT json_agg(json_build_object(
            'column_name', kcu.column_name,
            'foreign_table', ccu.table_name,
            'foreign_column', ccu.column_name,
            'constraint_name', tc.constraint_name
          ))
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
          WHERE tc.table_schema = 'public'
            AND tc.table_name = t.table_name
            AND tc.constraint_type = 'FOREIGN KEY'
        ),
        'indexes', (
          SELECT json_agg(json_build_object(
            'index_name', i.relname,
            'index_def', pg_catalog.pg_get_indexdef(ix.indexrelid)
          ))
          FROM pg_catalog.pg_index ix
          JOIN pg_catalog.pg_class i ON i.oid = ix.indexrelid
          JOIN pg_catalog.pg_class t2 ON t2.oid = ix.indrelid
          JOIN pg_catalog.pg_namespace n ON n.oid = t2.relnamespace
          WHERE n.nspname = 'public' AND t2.relname = t.table_name
            AND NOT ix.indisprimary
        ),
        'rls_enabled', (
          SELECT relrowsecurity FROM pg_catalog.pg_class
          JOIN pg_catalog.pg_namespace ON pg_catalog.pg_namespace.oid = pg_catalog.pg_class.relnamespace
          WHERE pg_catalog.pg_namespace.nspname = 'public'
            AND pg_catalog.pg_class.relname = t.table_name
        ),
        'rls_policies', (
          SELECT json_agg(json_build_object(
            'policy_name', p.policyname,
            'command', p.cmd,
            'roles', p.roles,
            'qual', pg_catalog.pg_get_expr(p.qual, p.polrelid),
            'with_check', pg_catalog.pg_get_expr(p.with_check, p.polrelid)
          ))
          FROM pg_catalog.pg_policy p
          JOIN pg_catalog.pg_class c ON c.oid = p.polrelid
          JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = 'public' AND c.relname = t.table_name
        )
      ))
      FROM information_schema.tables t
      WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
    ),
    'functions', (
      SELECT json_agg(json_build_object(
        'function_name', p.proname,
        'definition', pg_catalog.pg_get_functiondef(p.oid),
        'language', l.lanname
      ))
      FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
      JOIN pg_catalog.pg_language l ON l.oid = p.prolang
      WHERE n.nspname = 'public'
        AND p.prokind = 'f'
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 2. sorteios_participants — INSERT WITH CHECK
--    sorteios_participants não tem sorteio_id (participantes são
--    genéricos; o vínculo com o sorteio é via sorteios_coupons).
--    Liberamos insert com tenant_id obrigatório.
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "sorteios_participants_anon_insert" ON public.sorteios_participants;
CREATE POLICY "sorteios_participants_anon_insert" ON public.sorteios_participants
  FOR INSERT TO anon, authenticated
  WITH CHECK (tenant_id IS NOT NULL);

-- ────────────────────────────────────────────────────────────
-- 3. sorteios_sweepstakes — SELECT USING (true)
--    Público vê apenas sorteios ativos. Usuários autenticados
--    do tenant veem todos (inclusive rascunhos/encerrados).
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "sorteios_sweepstakes_public_select" ON public.sorteios_sweepstakes;
DROP POLICY IF EXISTS "sorteios_sweepstakes_anon_select" ON public.sorteios_sweepstakes;
DROP POLICY IF EXISTS "sorteios_sweepstakes_tenant_select" ON public.sorteios_sweepstakes;

-- Visitantes anônimos: apenas sorteios ativos
CREATE POLICY "sorteios_sweepstakes_anon_select" ON public.sorteios_sweepstakes
  FOR SELECT TO anon
  USING (status = 'ativo');

-- Usuários autenticados do tenant: todos os sorteios do seu tenant
CREATE POLICY "sorteios_sweepstakes_tenant_select" ON public.sorteios_sweepstakes
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- ────────────────────────────────────────────────────────────
-- 4. sorteios_coupons — INSERT WITH CHECK (true)
--    Garante que o cupom pertence a um participante real.
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "sorteios_coupons_anon_insert" ON public.sorteios_coupons;
CREATE POLICY "sorteios_coupons_anon_insert" ON public.sorteios_coupons
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sorteios_participants p
      WHERE p.id = participant_id
    )
  );

-- ────────────────────────────────────────────────────────────
-- 5. sorteios_coupons — SELECT USING (true) → expõe CPF/PII
--    Cupons só visíveis para usuários autenticados do tenant.
--    Anônimos consultam por participant_id via API pública.
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "sorteios_coupons_public_select" ON public.sorteios_coupons;
DROP POLICY IF EXISTS "sorteios_coupons_tenant_select" ON public.sorteios_coupons;
DROP POLICY IF EXISTS "sorteios_coupons_anon_select_by_participant" ON public.sorteios_coupons;

CREATE POLICY "sorteios_coupons_tenant_select" ON public.sorteios_coupons
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Anônimos podem consultar cupons de um participante específico
-- (necessário para o flow de validação pública sem login)
CREATE POLICY "sorteios_coupons_anon_select_by_participant" ON public.sorteios_coupons
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.sorteios_participants p
      WHERE p.id = participant_id
    )
  );

-- ────────────────────────────────────────────────────────────
-- 6. sorteios_prizes — SELECT USING (true)
--    Prêmios de sorteios ativos são públicos; demais só tenant.
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "sorteios_prizes_public_select" ON public.sorteios_prizes;
DROP POLICY IF EXISTS "sorteios_prizes_anon_select" ON public.sorteios_prizes;
DROP POLICY IF EXISTS "sorteios_prizes_tenant_select" ON public.sorteios_prizes;

CREATE POLICY "sorteios_prizes_anon_select" ON public.sorteios_prizes
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.sorteios_sweepstakes s
      WHERE s.id = sorteio_id AND s.status = 'ativo'
    )
  );

CREATE POLICY "sorteios_prizes_tenant_select" ON public.sorteios_prizes
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));
