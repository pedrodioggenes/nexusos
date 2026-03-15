-- Add soft delete column for trash functionality
ALTER TABLE public.workspace_pages 
ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Index for efficient filtering of deleted pages
CREATE INDEX idx_workspace_pages_deleted_at 
ON public.workspace_pages(deleted_at) WHERE deleted_at IS NOT NULL;