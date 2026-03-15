
-- Full-text search function for HiperWorks messages
CREATE OR REPLACE FUNCTION public.search_hiperworks_messages(
  search_query TEXT,
  p_tenant_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  content TEXT,
  channel_id UUID,
  channel_name TEXT,
  user_name TEXT,
  user_initials TEXT,
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
    m.id,
    m.content,
    m.channel_id,
    c.name AS channel_name,
    COALESCE(p.full_name, split_part(p.email, '@', 1), 'Usuário') AS user_name,
    UPPER(LEFT(COALESCE(p.full_name, split_part(p.email, '@', 1), 'US'), 2)) AS user_initials,
    m.created_at,
    ts_rank(to_tsvector('portuguese', COALESCE(m.content, '')), tsquery_val) AS rank
  FROM public.hiperworks_messages m
  JOIN public.hiperworks_channels c ON c.id = m.channel_id
  LEFT JOIN public.profiles p ON p.user_id = m.user_id
  WHERE to_tsvector('portuguese', COALESCE(m.content, '')) @@ tsquery_val
    AND (p_tenant_id IS NULL OR c.tenant_id = p_tenant_id)
  ORDER BY rank DESC, m.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Index for full-text search performance
CREATE INDEX IF NOT EXISTS idx_hiperworks_messages_content_fts
ON public.hiperworks_messages
USING GIN(to_tsvector('portuguese', COALESCE(content, '')));
