-- Rename storage bucket hiperia-documents → ia-documents
--
-- Supabase blocks direct DELETE on storage.buckets (trigger 42501).
-- Deletion of the old bucket is handled via Storage API in the deploy workflow.
--
-- This migration:
--   1. Creates ia-documents bucket with same settings (INSERT ... ON CONFLICT DO NOTHING)
--   2. Moves all objects to the new bucket (UPDATE objects)
--
-- After this runs, hiperia-documents is empty and safe to delete via API.

-- Step 1: Create ia-documents with same config as hiperia-documents
INSERT INTO storage.buckets (id, name, owner, public, file_size_limit, allowed_mime_types, created_at, updated_at)
SELECT
  'ia-documents',
  'ia-documents',
  owner,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at,
  now()
FROM storage.buckets
WHERE id = 'hiperia-documents'
ON CONFLICT (id) DO NOTHING;

-- Step 2: Move objects to new bucket (FK satisfied: ia-documents now exists)
UPDATE storage.objects
SET bucket_id = 'ia-documents'
WHERE bucket_id = 'hiperia-documents';
