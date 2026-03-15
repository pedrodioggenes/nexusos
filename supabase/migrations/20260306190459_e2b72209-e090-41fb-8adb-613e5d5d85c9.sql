
ALTER TABLE public.hw_training_assignments
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'internal',
  ADD COLUMN IF NOT EXISTS academy_course_id TEXT,
  ADD COLUMN IF NOT EXISTS materials JSONB NOT NULL DEFAULT '[]'::jsonb;
