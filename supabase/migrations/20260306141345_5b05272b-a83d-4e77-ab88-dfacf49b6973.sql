
CREATE TABLE public.hw_user_layout (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),
  sidebar_order TEXT[] DEFAULT '{}',
  home_widgets_order TEXT[] DEFAULT '{}',
  bottom_tabs TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.hw_user_layout ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own layout"
  ON public.hw_user_layout FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own layout"
  ON public.hw_user_layout FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own layout"
  ON public.hw_user_layout FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
