-- Garantia final: maintenance_mode = false no DB externo.
-- Esta migration roda depois de 230000 (que faz o mesmo),
-- mas serve de fallback caso o estado tenha sido alterado.

INSERT INTO public.system_settings (key, value, updated_at)
VALUES ('maintenance_mode', 'false'::jsonb, now())
ON CONFLICT (key) DO UPDATE
  SET value = 'false'::jsonb, updated_at = now();
