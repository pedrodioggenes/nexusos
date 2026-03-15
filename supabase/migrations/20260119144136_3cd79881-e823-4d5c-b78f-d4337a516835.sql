-- Add is_active column to user_roles for tracking user status
ALTER TABLE public.user_roles 
ADD COLUMN is_active boolean NOT NULL DEFAULT true;

-- Add index for faster filtering
CREATE INDEX idx_user_roles_is_active ON public.user_roles(is_active);

-- Update audit_logs to track user status changes
COMMENT ON COLUMN public.user_roles.is_active IS 'Whether the user account is active. Inactive users cannot login.';