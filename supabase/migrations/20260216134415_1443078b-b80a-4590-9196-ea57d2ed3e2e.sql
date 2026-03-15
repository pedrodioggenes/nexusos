-- Create storage bucket for campaign media
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-media', 'campaign-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload campaign media
CREATE POLICY "Authenticated users can upload campaign media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'campaign-media' AND auth.uid() IS NOT NULL);

-- Allow public read access to campaign media
CREATE POLICY "Campaign media is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'campaign-media');

-- Allow users to delete their own campaign media
CREATE POLICY "Users can delete their campaign media"
ON storage.objects FOR DELETE
USING (bucket_id = 'campaign-media' AND auth.uid() IS NOT NULL);

-- Fix workspace_pages creation: set tenant_id automatically via trigger
CREATE OR REPLACE FUNCTION public.set_workspace_page_tenant()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS NULL THEN
    NEW.tenant_id := get_user_tenant_id(auth.uid());
  END IF;
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_set_workspace_page_tenant
BEFORE INSERT ON public.workspace_pages
FOR EACH ROW
EXECUTE FUNCTION public.set_workspace_page_tenant();