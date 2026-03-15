INSERT INTO public.system_settings (key, value, description)
VALUES ('maintenance_mode', 'true'::jsonb, 'Modo manutenção - bloqueia acesso de todos os usuários')
ON CONFLICT (key) DO UPDATE SET value = 'true'::jsonb, updated_at = now();