-- Fix Critical Security Issue: Remove public access to sensitive profile financial data
-- The profiles table contains sensitive financial information (total_earnings, total_spent, reputation_score)
-- that should NOT be publicly accessible. Public access should only go through the public_profiles view.

-- Drop the overly permissive policy that allows anyone to query the profiles table directly
DROP POLICY IF EXISTS "Public can view non-sensitive profile data" ON public.profiles;

-- Document the security model:
-- 1. Users can view their OWN full profile (policy: profile_own_full_access)
-- 2. Users can view OTHER users' limited data (policy: profile_public_limited_access) 
-- 3. Public/anonymous access must use the public_profiles VIEW (which only exposes safe fields)
-- 4. The public_profiles view uses security_invoker=true to respect these RLS policies

COMMENT ON TABLE public.profiles IS 
'User profiles table with RLS protection. Contains sensitive financial data (total_earnings, total_spent). 
Public access restricted - use public_profiles view for safe public data access.
RLS Policies:
- profile_own_full_access: Users can see all fields of their own profile
- profile_public_limited_access: Users can see limited fields of other profiles
- No anonymous/public direct access - use public_profiles view instead';
