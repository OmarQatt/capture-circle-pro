
-- Add admin to enum (must be in its own migration)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';
