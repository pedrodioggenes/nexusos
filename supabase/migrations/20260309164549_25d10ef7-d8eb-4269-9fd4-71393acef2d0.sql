
-- RPC: Get all DM conversations for a user in a single query (replaces N+1)
CREATE OR REPLACE FUNCTION public.get_dm_conversations_for_user(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  tenant_id uuid,
  other_user_id uuid,
  other_user_name text,
  other_user_initials text,
  other_user_avatar text,
  last_message text,
  last_message_at timestamptz,
  last_message_user_id uuid,
  other_last_read_at timestamptz,
  other_last_online_at timestamptz,
  created_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  WITH my_convs AS (
    SELECT conversation_id FROM hiperworks_dm_participants WHERE user_id = p_user_id
  ),
  other_parts AS (
    SELECT dp.conversation_id, dp.user_id as other_uid
    FROM hiperworks_dm_participants dp
    JOIN my_convs mc ON mc.conversation_id = dp.conversation_id
    WHERE dp.user_id != p_user_id
  ),
  last_msgs AS (
    SELECT DISTINCT ON (m.conversation_id)
      m.conversation_id, m.content, m.created_at, m.user_id
    FROM hiperworks_dm_messages m
    JOIN my_convs mc ON mc.conversation_id = m.conversation_id
    ORDER BY m.conversation_id, m.created_at DESC
  ),
  read_markers AS (
    SELECT lr.dm_conversation_id, lr.user_id, lr.last_read_at
    FROM hiperworks_last_read lr
    JOIN my_convs mc ON mc.conversation_id = lr.dm_conversation_id
  )
  SELECT
    c.id,
    c.tenant_id,
    op.other_uid as other_user_id,
    COALESCE(p.full_name, split_part(p.email, '@', 1), 'Usuário') as other_user_name,
    UPPER(LEFT(COALESCE(p.full_name, split_part(p.email, '@', 1), 'US'), 2)) as other_user_initials,
    p.avatar_url as other_user_avatar,
    lm.content as last_message,
    lm.created_at as last_message_at,
    lm.user_id as last_message_user_id,
    rm.last_read_at as other_last_read_at,
    p.last_online_at as other_last_online_at,
    c.created_at
  FROM hiperworks_dm_conversations c
  JOIN other_parts op ON op.conversation_id = c.id
  LEFT JOIN profiles p ON p.user_id = op.other_uid
  LEFT JOIN last_msgs lm ON lm.conversation_id = c.id
  LEFT JOIN read_markers rm ON rm.dm_conversation_id = c.id AND rm.user_id = op.other_uid
  ORDER BY COALESCE(lm.created_at, c.created_at) DESC;
$$;

-- RPC: Get total unread DM conversation count in a single query (replaces N+1 loop)
CREATE OR REPLACE FUNCTION public.get_dm_unread_count(p_user_id uuid)
RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  WITH my_convs AS (
    SELECT conversation_id FROM hiperworks_dm_participants WHERE user_id = p_user_id
  ),
  my_reads AS (
    SELECT dm_conversation_id, last_read_at
    FROM hiperworks_last_read
    WHERE user_id = p_user_id
  )
  SELECT COALESCE(COUNT(DISTINCT m.conversation_id)::integer, 0)
  FROM hiperworks_dm_messages m
  JOIN my_convs mc ON mc.conversation_id = m.conversation_id
  LEFT JOIN my_reads mr ON mr.dm_conversation_id = m.conversation_id
  WHERE m.user_id != p_user_id
    AND m.created_at > COALESCE(mr.last_read_at, '1970-01-01'::timestamptz);
$$;
