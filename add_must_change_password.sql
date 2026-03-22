-- SQL snippet to add must_change_password column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT true;
