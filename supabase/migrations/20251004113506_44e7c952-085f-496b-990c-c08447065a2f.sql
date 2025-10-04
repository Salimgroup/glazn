-- Drop the public_profiles view first (it depends on the function)
DROP VIEW IF EXISTS public.public_profiles;

-- Now drop the security definer function as it bypasses RLS
DROP FUNCTION IF EXISTS public.get_public_profiles();

-- The profiles table already has proper RLS policies:
-- - profile_own_full_access: Users can see their full profile
-- - profile_public_limited_access: Other authenticated users can see limited profile data (excluding sensitive financial info)
-- These policies properly enforce access control without needing SECURITY DEFINER