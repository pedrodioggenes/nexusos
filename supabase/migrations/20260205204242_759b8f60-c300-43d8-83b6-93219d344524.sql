-- Corrigir policy de menções para ser mais restritiva
DROP POLICY IF EXISTS "Sistema pode criar menções" ON public.hyperworks_mentions;

CREATE POLICY "Usuários podem criar menções em suas mensagens"
  ON public.hyperworks_mentions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.hyperworks_messages m
      WHERE m.id = message_id AND m.user_id = auth.uid()
    )
  );