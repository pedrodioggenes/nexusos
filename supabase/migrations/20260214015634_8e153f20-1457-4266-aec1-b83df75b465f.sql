
-- Weekly checklist items (persisted per user)
CREATE TABLE public.weekly_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id),
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  label TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.weekly_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklist" ON public.weekly_checklist_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklist" ON public.weekly_checklist_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklist" ON public.weekly_checklist_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklist" ON public.weekly_checklist_items
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_weekly_checklist_updated_at
  BEFORE UPDATE ON public.weekly_checklist_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
