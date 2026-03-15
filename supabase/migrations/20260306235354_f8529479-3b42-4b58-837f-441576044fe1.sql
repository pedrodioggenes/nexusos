ALTER TABLE public.hw_user_layout 
  ADD COLUMN IF NOT EXISTS pinned_pages JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS pinned_widgets JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS pinned_actions JSONB DEFAULT '[]'::jsonb;