-- Add desk_positions to hw_user_layout so the canvas layout is synced across devices
ALTER TABLE public.hw_user_layout
ADD COLUMN IF NOT EXISTS desk_positions JSONB DEFAULT '{}'::jsonb;
