
-- Fix 1: hiperworks_dm_conversations SELECT policy
DROP POLICY IF EXISTS "Participants can view DM conversations" ON public.hiperworks_dm_conversations;
CREATE POLICY "Participants can view DM conversations"
  ON public.hiperworks_dm_conversations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM hiperworks_dm_participants p
    WHERE p.conversation_id = hiperworks_dm_conversations.id
      AND p.user_id = auth.uid()
  ));

-- Fix 2: hiperworks_dm_participants SELECT policy
DROP POLICY IF EXISTS "Participants can view participants" ON public.hiperworks_dm_participants;
CREATE POLICY "Participants can view participants"
  ON public.hiperworks_dm_participants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM hiperworks_dm_participants p2
    WHERE p2.conversation_id = hiperworks_dm_participants.conversation_id
      AND p2.user_id = auth.uid()
  ));
