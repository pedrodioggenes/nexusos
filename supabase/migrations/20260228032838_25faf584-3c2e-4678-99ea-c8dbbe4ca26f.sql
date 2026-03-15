
-- Make buckets private
UPDATE storage.buckets SET public = false WHERE id IN ('workspace-files', 'campaign-media', 'demand-attachments');

-- Drop old public SELECT policies
DROP POLICY IF EXISTS "Public read access for workspace files" ON storage.objects;
DROP POLICY IF EXISTS "Campaign media is publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view demand attachments" ON storage.objects;

-- Create authenticated SELECT policies
CREATE POLICY "Authenticated users can read workspace files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'workspace-files');

CREATE POLICY "Authenticated users can read campaign media"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'campaign-media');

CREATE POLICY "Authenticated users can read demand attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'demand-attachments');

-- Fix workspace-files upload policy (currently allows anyone)
DROP POLICY IF EXISTS "Users can upload workspace files" ON storage.objects;
CREATE POLICY "Authenticated users can upload workspace files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'workspace-files');
