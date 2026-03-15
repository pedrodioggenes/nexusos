-- Enable realtime for profiles table (needed for delivered status and avatar updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;