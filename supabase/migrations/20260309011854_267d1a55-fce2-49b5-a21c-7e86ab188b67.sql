
-- Create a SECURITY DEFINER function to check DM participation without triggering RLS
CREATE OR REPLACE FUNCTION public.is_dm_participant(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM hiperworks_dm_participants
    WHERE conversation_id = _conversation_id AND user_id = _user_id
  )
$$;

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Participants can view DM conversations" ON hiperworks_dm_conversations;
DROP POLICY IF EXISTS "Participants can view participants" ON hiperworks_dm_participants;
DROP POLICY IF EXISTS "Users can add participants" ON hiperworks_dm_participants;
DROP POLICY IF EXISTS "Participants can view DM messages" ON hiperworks_dm_messages;
DROP POLICY IF EXISTS "Participants can send DM messages" ON hiperworks_dm_messages;

-- Recreate policies using the SECURITY DEFINER function (no recursion)
CREATE POLICY "Participants can view DM conversations"
ON hiperworks_dm_conversations FOR SELECT TO authenticated
USING (public.is_dm_participant(id, auth.uid()));

CREATE POLICY "Participants can view participants"
ON hiperworks_dm_participants FOR SELECT TO authenticated
USING (public.is_dm_participant(conversation_id, auth.uid()));

CREATE POLICY "Users can add participants"
ON hiperworks_dm_participants FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM hiperworks_dm_conversations c
    WHERE c.id = conversation_id AND c.tenant_id = get_user_tenant_id(auth.uid())
  )
);

CREATE POLICY "Participants can view DM messages"
ON hiperworks_dm_messages FOR SELECT TO authenticated
USING (public.is_dm_participant(conversation_id, auth.uid()));

CREATE POLICY "Participants can send DM messages"
ON hiperworks_dm_messages FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND public.is_dm_participant(conversation_id, auth.uid())
);
