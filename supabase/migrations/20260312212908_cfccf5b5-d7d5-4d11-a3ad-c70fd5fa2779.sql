CREATE OR REPLACE FUNCTION public.clear_must_change_password()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.user_roles
  SET must_change_password = false
  WHERE user_id = auth.uid()
    AND must_change_password = true;

  RETURN FOUND;
END;
$$;