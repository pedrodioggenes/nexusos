-- P2: Criar storage bucket para comprovações do HiperTrade

-- Criar bucket para armazenar fotos de comprovações
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trade-proofs',
  'trade-proofs',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

-- Policies para o bucket trade-proofs

-- Suppliers podem fazer upload de suas próprias comprovações
CREATE POLICY "Suppliers can upload proofs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'trade-proofs' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Suppliers podem ver suas próprias comprovações
CREATE POLICY "Suppliers can view own proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'trade-proofs' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    get_user_type(auth.uid()) = 'internal'::user_type OR
    is_sigma_admin(auth.uid())
  )
);

-- Suppliers podem deletar suas próprias comprovações
CREATE POLICY "Suppliers can delete own proofs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'trade-proofs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Internal users podem ver todas as comprovações
CREATE POLICY "Internal users can view all proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'trade-proofs' AND
  get_user_type(auth.uid()) = 'internal'::user_type
);

-- Internal users podem deletar comprovações (moderação)
CREATE POLICY "Internal users can delete proofs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'trade-proofs' AND
  (get_user_type(auth.uid()) = 'internal'::user_type OR is_sigma_admin(auth.uid()))
);