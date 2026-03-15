-- Rename RPC function: search_hiperworks_global → search_nexusdesk_global
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'search_hiperworks_global'
  ) THEN
    ALTER FUNCTION public.search_hiperworks_global RENAME TO search_nexusdesk_global;
  END IF;
END;
$$;
