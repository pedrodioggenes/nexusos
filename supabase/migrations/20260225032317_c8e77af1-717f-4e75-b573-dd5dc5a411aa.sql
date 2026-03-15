
-- Rename the enum value from sigma_admin to hiper_admin
ALTER TYPE public.user_type RENAME VALUE 'sigma_admin' TO 'hiper_admin';

-- Update the is_sigma_admin function to use the new enum value and rename it
CREATE OR REPLACE FUNCTION public.is_sigma_admin(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND user_type = 'hiper_admin'::user_type
  )
$$;
