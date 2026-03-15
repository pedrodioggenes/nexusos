-- =============================================
-- SIGMA SISTEMAS - Enterprise Multi-Tenant Architecture - STEP 1
-- Add sigma_admin to user_type enum (must be separate)
-- =============================================
ALTER TYPE public.user_type ADD VALUE IF NOT EXISTS 'sigma_admin';