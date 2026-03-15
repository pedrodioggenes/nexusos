
-- Fix: profiles policies were already dropped in the failed migration partial execution
-- Check and re-create the correct policies

-- Drop if they were partially created
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Users can see their own full profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins and sigma admins can see all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR is_sigma_admin(auth.uid())
  );

-- Security definer function for internal users to look up basic colleague info
CREATE OR REPLACE FUNCTION public.get_colleague_profiles(p_user_id UUID)
RETURNS TABLE(
  user_id UUID,
  full_name TEXT,
  email TEXT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    p.user_id,
    p.full_name,
    CASE 
      WHEN p.email IS NOT NULL THEN
        LEFT(split_part(p.email, '@', 1), 3) || '***@' || split_part(p.email, '@', 2)
      ELSE NULL
    END AS email
  FROM public.profiles p
  WHERE p.user_id IN (
    SELECT ur2.user_id
    FROM public.user_roles ur2
    WHERE ur2.tenant_id = get_user_tenant_id(p_user_id)
  );
$$;
