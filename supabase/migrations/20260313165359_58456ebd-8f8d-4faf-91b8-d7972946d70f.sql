
CREATE POLICY "anon_read_maintenance_mode"
ON public.system_settings
FOR SELECT
TO anon
USING (key = 'maintenance_mode');

CREATE POLICY "auth_read_maintenance_mode"
ON public.system_settings
FOR SELECT
TO authenticated
USING (key = 'maintenance_mode');
