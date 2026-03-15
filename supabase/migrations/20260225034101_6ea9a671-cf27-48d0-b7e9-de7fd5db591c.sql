
-- Add pages_allowed JSONB column to user_roles
ALTER TABLE public.user_roles
ADD COLUMN IF NOT EXISTS pages_allowed JSONB DEFAULT NULL;

-- Comment
COMMENT ON COLUMN public.user_roles.pages_allowed IS 'Per-module page access control. Keys are module IDs, values are arrays of allowed paths or null (all pages). NULL column = no restriction.';

-- Create is_page_allowed RPC for server-side validation
CREATE OR REPLACE FUNCTION public.is_page_allowed(p_user_id uuid, p_page_path text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pages_allowed JSONB;
  v_module_key TEXT;
  v_module_pages JSONB;
BEGIN
  -- Get pages_allowed for the user
  SELECT pages_allowed INTO v_pages_allowed
  FROM public.user_roles
  WHERE user_id = p_user_id
  LIMIT 1;

  -- NULL = no page restrictions at all
  IF v_pages_allowed IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Determine which module this path belongs to
  IF p_page_path LIKE '%/hipergestao%' THEN
    v_module_key := 'hipergestao';
  ELSIF p_page_path LIKE '%/hipertrade%' THEN
    v_module_key := 'hipertrade';
  ELSIF p_page_path LIKE '%/hiperofertas%' THEN
    v_module_key := 'hiperofertas';
  ELSIF p_page_path LIKE '%/hiperia%' THEN
    v_module_key := 'hiperia';
  ELSE
    -- Unknown module path, allow by default
    RETURN TRUE;
  END IF;

  -- Check if the module key exists in pages_allowed
  IF NOT v_pages_allowed ? v_module_key THEN
    -- Module not in pages_allowed = no restriction for this module
    RETURN TRUE;
  END IF;

  v_module_pages := v_pages_allowed -> v_module_key;

  -- null value for module = all pages allowed
  IF v_module_pages IS NULL OR v_module_pages = 'null'::JSONB THEN
    RETURN TRUE;
  END IF;

  -- Empty array = no pages allowed
  IF jsonb_array_length(v_module_pages) = 0 THEN
    RETURN FALSE;
  END IF;

  -- Check if the path is in the allowed list
  RETURN v_module_pages ? p_page_path;
END;
$$;
