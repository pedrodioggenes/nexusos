-- 0. Ensure unique constraint on key (required for ON CONFLICT below)
ALTER TABLE public.system_settings
  DROP CONSTRAINT IF EXISTS system_settings_key_key;
ALTER TABLE public.system_settings
  ADD CONSTRAINT system_settings_key_key UNIQUE (key);

-- 1. Allow anyone (anon + authenticated) to read maintenance_mode from system_settings.
--    This is safe — it's just a boolean flag, no sensitive data.
--    Without this, MaintenanceGate and AuthContext can never read the real value.
DROP POLICY IF EXISTS "public_read_maintenance_mode" ON public.system_settings;
CREATE POLICY "public_read_maintenance_mode" ON public.system_settings
  FOR SELECT
  USING (key = 'maintenance_mode');

-- 2. Force maintenance_mode to false.
--    The console UI was always showing "OFF" (anon key got 0 rows),
--    so the real DB state was unknown. This ensures a clean slate.
INSERT INTO public.system_settings (key, value, updated_at)
VALUES ('maintenance_mode', 'false'::jsonb, now())
ON CONFLICT (key) DO UPDATE
  SET value = 'false'::jsonb, updated_at = now();
