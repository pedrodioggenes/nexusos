
-- 1. Make hiperia-documents bucket private
UPDATE storage.buckets SET public = false WHERE id = 'hiperia-documents';

-- 2. Create failed_access_attempts table for rate limiting
CREATE TABLE IF NOT EXISTS public.failed_access_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS but allow service role only
ALTER TABLE public.failed_access_attempts ENABLE ROW LEVEL SECURITY;

-- Auto-cleanup old attempts (older than 1 hour)
CREATE INDEX IF NOT EXISTS idx_failed_access_attempts_ip_time 
  ON public.failed_access_attempts (ip_address, attempted_at DESC);

-- 3. Fix sorteios anon insert policies - scope to active sweepstakes
DROP POLICY IF EXISTS "sorteios_participants_anon_insert" ON public.sorteios_participants;
CREATE POLICY "sorteios_participants_anon_insert" ON public.sorteios_participants
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sorteios_sweepstakes sw
      WHERE sw.tenant_id = sorteios_participants.tenant_id
        AND sw.status = 'ativo'
    )
  );

DROP POLICY IF EXISTS "sorteios_coupons_anon_insert" ON public.sorteios_coupons;
CREATE POLICY "sorteios_coupons_anon_insert" ON public.sorteios_coupons
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sorteios_sweepstakes sw
      WHERE sw.tenant_id = sorteios_coupons.tenant_id
        AND sw.status = 'ativo'
    )
  );
