-- Corrigir a policy de INSERT em notifications que usa WITH CHECK (true)
-- Sistema só deve poder inserir notificações para o próprio usuário ou via service_role

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Permitir inserção apenas se o user_id corresponder ao usuário autenticado
-- OU se for uma inserção via service_role (edge functions)
CREATE POLICY "Users or system can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    auth.jwt()->>'role' = 'service_role'
  );