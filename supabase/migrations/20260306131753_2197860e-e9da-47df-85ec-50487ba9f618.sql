
-- 1. hw_favorites table
CREATE TABLE public.hw_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, entity_type, entity_id)
);

ALTER TABLE public.hw_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own favorites"
  ON public.hw_favorites FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own favorites"
  ON public.hw_favorites FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own favorites"
  ON public.hw_favorites FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 2. hw_recent_views table
CREATE TABLE public.hw_recent_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id),
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, entity_type, entity_id)
);

ALTER TABLE public.hw_recent_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own recent views"
  ON public.hw_recent_views FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own recent views"
  ON public.hw_recent_views FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own recent views"
  ON public.hw_recent_views FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own recent views"
  ON public.hw_recent_views FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 3. search_hiperworks_global RPC
CREATE OR REPLACE FUNCTION public.search_hiperworks_global(
  search_query TEXT,
  p_tenant_id UUID DEFAULT NULL
)
RETURNS TABLE(
  entity_type TEXT,
  entity_id UUID,
  title TEXT,
  preview TEXT,
  rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  tsq TSQUERY;
BEGIN
  tsq := plainto_tsquery('portuguese', search_query);

  RETURN QUERY

  -- Profiles (Pessoas)
  SELECT
    'pessoa'::TEXT AS entity_type,
    p.user_id AS entity_id,
    COALESCE(p.full_name, split_part(p.email, '@', 1)) AS title,
    COALESCE(p.email, '') AS preview,
    ts_rank(to_tsvector('portuguese', COALESCE(p.full_name, '') || ' ' || COALESCE(p.email, '')), tsq) AS rank
  FROM public.profiles p
  WHERE to_tsvector('portuguese', COALESCE(p.full_name, '') || ' ' || COALESCE(p.email, '')) @@ tsq
    AND (p_tenant_id IS NULL OR p.user_id IN (
      SELECT ur.user_id FROM public.user_roles ur WHERE ur.tenant_id = p_tenant_id
    ))

  UNION ALL

  -- Posts (Comunicados)
  SELECT
    'post'::TEXT,
    hp.id,
    COALESCE(hp.title, LEFT(hp.content, 60)),
    LEFT(hp.content, 200),
    ts_rank(
      setweight(to_tsvector('portuguese', COALESCE(hp.title, '')), 'A') ||
      setweight(to_tsvector('portuguese', COALESCE(hp.content, '')), 'B'),
      tsq
    )
  FROM public.hw_posts hp
  WHERE (
    setweight(to_tsvector('portuguese', COALESCE(hp.title, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(hp.content, '')), 'B')
  ) @@ tsq
    AND hp.is_published = true
    AND (p_tenant_id IS NULL OR hp.tenant_id = p_tenant_id)

  UNION ALL

  -- Documents
  SELECT
    'document'::TEXT,
    hd.id,
    hd.title,
    LEFT(COALESCE(hd.description, ''), 200),
    ts_rank(
      setweight(to_tsvector('portuguese', COALESCE(hd.title, '')), 'A') ||
      setweight(to_tsvector('portuguese', COALESCE(hd.description, '')), 'B'),
      tsq
    )
  FROM public.hw_documents hd
  WHERE (
    setweight(to_tsvector('portuguese', COALESCE(hd.title, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(hd.description, '')), 'B')
  ) @@ tsq
    AND (p_tenant_id IS NULL OR hd.tenant_id = p_tenant_id)

  UNION ALL

  -- Messages
  SELECT
    'message'::TEXT,
    m.id,
    COALESCE(pr.full_name, 'Usuário') || ': ' || LEFT(m.content, 60),
    LEFT(m.content, 200),
    ts_rank(to_tsvector('portuguese', COALESCE(m.content, '')), tsq)
  FROM public.hiperworks_messages m
  LEFT JOIN public.profiles pr ON pr.user_id = m.user_id
  JOIN public.hiperworks_channels c ON c.id = m.channel_id
  WHERE to_tsvector('portuguese', COALESCE(m.content, '')) @@ tsq
    AND (p_tenant_id IS NULL OR c.tenant_id = p_tenant_id)

  ORDER BY rank DESC
  LIMIT 25;
END;
$$;
