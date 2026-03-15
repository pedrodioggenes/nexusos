
CREATE TABLE public.hw_user_shortcuts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Zap',
  shortcut_type TEXT NOT NULL DEFAULT 'view',
  target TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hw_user_shortcuts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own shortcuts"
  ON public.hw_user_shortcuts
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_hw_user_shortcuts_user ON public.hw_user_shortcuts(user_id, sort_order);
