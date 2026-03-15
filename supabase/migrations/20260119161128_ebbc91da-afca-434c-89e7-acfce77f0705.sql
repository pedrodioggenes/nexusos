-- Create system_settings table for global console configurations
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default access code
INSERT INTO public.system_settings (key, value, description)
VALUES ('console_access_code', '"0000"', 'Código de acesso para criação de contas SIGMA Admin');

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Policy: sigma_admin can read and update settings
CREATE POLICY "sigma_admin_read" ON public.system_settings
  FOR SELECT TO authenticated
  USING (public.is_sigma_admin(auth.uid()));

CREATE POLICY "sigma_admin_update" ON public.system_settings
  FOR UPDATE TO authenticated
  USING (public.is_sigma_admin(auth.uid()))
  WITH CHECK (public.is_sigma_admin(auth.uid()));

-- Policy: Anyone can read the access code for validation during signup
CREATE POLICY "public_read_access_code" ON public.system_settings
  FOR SELECT
  USING (key = 'console_access_code');

-- Update trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();