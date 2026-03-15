
-- Add edited_at column for edit tracking
ALTER TABLE public.hiperworks_messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ DEFAULT NULL;

-- Create RPC to get unread counts for all channels at once
CREATE OR REPLACE FUNCTION public.get_unread_counts(p_user_id UUID)
RETURNS TABLE(channel_id UUID, unread_count BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    m.channel_id,
    COUNT(m.id) AS unread_count
  FROM public.hiperworks_messages m
  LEFT JOIN public.hiperworks_last_read lr
    ON lr.channel_id = m.channel_id AND lr.user_id = p_user_id
  WHERE m.parent_id IS NULL
    AND m.created_at > COALESCE(lr.last_read_at, '1970-01-01'::timestamptz)
  GROUP BY m.channel_id
  HAVING COUNT(m.id) > 0;
$$;
