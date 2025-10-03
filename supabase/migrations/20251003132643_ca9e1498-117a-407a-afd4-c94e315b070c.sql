-- Phase 1: Restrict Unauthenticated Access to Sensitive Data

-- 1. Lock down profiles table - restrict public access to authenticated users only
DROP POLICY IF EXISTS "profile_public_limited_access" ON public.profiles;

CREATE POLICY "profile_public_limited_access" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() <> id);

-- 2. Restrict follows table - authenticated users only
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;

CREATE POLICY "Authenticated users can view follows" 
ON public.follows 
FOR SELECT 
TO authenticated
USING (true);

-- 3. Add explicit denial for anonymous access to user_roles
CREATE POLICY "user_roles_no_anonymous_access" 
ON public.user_roles 
FOR ALL 
TO anon 
USING (false);

-- Add helpful comments
COMMENT ON POLICY "profile_public_limited_access" ON public.profiles IS 
'Authenticated users can view other users profiles (not their own). Unauthenticated users must use public_profiles view.';

COMMENT ON POLICY "Authenticated users can view follows" ON public.follows IS 
'Only authenticated users can view the social graph. Prevents public scraping of follow relationships.';

COMMENT ON POLICY "user_roles_no_anonymous_access" ON public.user_roles IS 
'Explicitly deny all anonymous access to user_roles table to prevent admin role discovery.';