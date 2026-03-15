-- Add marketing workforce model column to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS marketing_workforce_model TEXT 
DEFAULT 'internal' 
CHECK (marketing_workforce_model IN ('internal', 'agency'));