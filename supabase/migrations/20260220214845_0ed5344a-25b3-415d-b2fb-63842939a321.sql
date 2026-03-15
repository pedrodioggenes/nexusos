
CREATE TABLE public.demand_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demand_id UUID NOT NULL REFERENCES public.marketing_demands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  tenant_id UUID,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.demand_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments from their tenant"
  ON public.demand_comments FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Authenticated users can create comments"
  ON public.demand_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND tenant_id = public.get_user_tenant_id(auth.uid())
  );

CREATE POLICY "Users can update their own comments"
  ON public.demand_comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON public.demand_comments FOR DELETE
  USING (user_id = auth.uid());
