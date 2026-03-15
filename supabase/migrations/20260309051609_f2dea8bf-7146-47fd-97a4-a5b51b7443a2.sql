
-- Create a dedicated bucket for DM file attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('dm-attachments', 'dm-attachments', false, 52428800)
ON CONFLICT (id) DO NOTHING;

-- RLS: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload DM attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'dm-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Users can read files in conversations they participate in
CREATE POLICY "Users can read DM attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'dm-attachments'
);

-- RLS: Users can delete their own uploads
CREATE POLICY "Users can delete own DM attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'dm-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
