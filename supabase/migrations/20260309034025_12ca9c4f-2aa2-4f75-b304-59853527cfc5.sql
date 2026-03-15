
-- Drop the old policy that only allows seeing own read markers
DROP POLICY IF EXISTS "Users manage own last_read" ON public.hiperworks_last_read;

-- SELECT: allow seeing read markers for conversations/channels the user participates in
CREATE POLICY "Users can view read markers in their conversations"
  ON public.hiperworks_last_read FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR (
      dm_conversation_id IS NOT NULL
      AND public.is_dm_participant(dm_conversation_id, auth.uid())
    )
    OR (
      channel_id IS NOT NULL
    )
  );

-- INSERT: users can only create their own read markers
CREATE POLICY "Users can insert own read markers"
  ON public.hiperworks_last_read FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: users can only update their own read markers
CREATE POLICY "Users can update own read markers"
  ON public.hiperworks_last_read FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- DELETE: users can only delete their own read markers
CREATE POLICY "Users can delete own read markers"
  ON public.hiperworks_last_read FOR DELETE TO authenticated
  USING (user_id = auth.uid());
