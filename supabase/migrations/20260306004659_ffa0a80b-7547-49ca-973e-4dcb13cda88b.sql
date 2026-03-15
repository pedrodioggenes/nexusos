
-- 1. Availability status enum + column on hw_team_members
DO $$ BEGIN
  CREATE TYPE public.hw_availability_status AS ENUM ('disponivel', 'em_turno', 'folga', 'indisponivel');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.hw_team_members
  ADD COLUMN IF NOT EXISTS availability_status public.hw_availability_status DEFAULT 'disponivel';

-- 2. Scheduled posts columns on hw_posts
ALTER TABLE public.hw_posts
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS requires_ack BOOLEAN DEFAULT false;

-- 3. Polls table
CREATE TABLE IF NOT EXISTS public.hw_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.hw_posts(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hw_polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view polls"
  ON public.hw_polls FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid()));

CREATE POLICY "Tenant members can insert polls"
  ON public.hw_polls FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid()));

-- 4. Poll votes table
CREATE TABLE IF NOT EXISTS public.hw_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES public.hw_polls(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

ALTER TABLE public.hw_poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view poll votes"
  ON public.hw_poll_votes FOR SELECT TO authenticated
  USING (poll_id IN (SELECT id FROM public.hw_polls WHERE tenant_id IN (SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid())));

CREATE POLICY "Users can vote"
  ON public.hw_poll_votes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can change vote"
  ON public.hw_poll_votes FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 5. Post acknowledgments table
CREATE TABLE IF NOT EXISTS public.hw_post_acks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.hw_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  acked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.hw_post_acks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view acks"
  ON public.hw_post_acks FOR SELECT TO authenticated
  USING (post_id IN (SELECT id FROM public.hw_posts WHERE tenant_id IN (SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid())));

CREATE POLICY "Users can ack posts"
  ON public.hw_post_acks FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 6. Full-text search RPC for posts
CREATE OR REPLACE FUNCTION public.search_hw_posts(
  search_query TEXT,
  p_tenant_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  content TEXT,
  author_name TEXT,
  type TEXT,
  created_at TIMESTAMPTZ,
  rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  tsquery_val TSQUERY;
BEGIN
  tsquery_val := plainto_tsquery('portuguese', search_query);
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.content,
    COALESCE(pr.full_name, split_part(pr.email, '@', 1), 'Usuário') AS author_name,
    p.type,
    p.created_at,
    ts_rank(
      setweight(to_tsvector('portuguese', COALESCE(p.title, '')), 'A') ||
      setweight(to_tsvector('portuguese', COALESCE(p.content, '')), 'B'),
      tsquery_val
    ) AS rank
  FROM public.hw_posts p
  LEFT JOIN public.profiles pr ON pr.user_id = p.author_id
  WHERE (
    setweight(to_tsvector('portuguese', COALESCE(p.title, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(p.content, '')), 'B')
  ) @@ tsquery_val
    AND p.tenant_id = p_tenant_id
    AND p.is_published = true
  ORDER BY rank DESC, p.created_at DESC
  LIMIT p_limit;
END;
$$;
