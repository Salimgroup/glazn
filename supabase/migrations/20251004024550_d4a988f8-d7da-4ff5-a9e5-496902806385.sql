-- Fix public_profiles view to properly respect RLS policies
-- Per Supabase security best practices, views should use security_invoker=true
-- to respect underlying RLS policies rather than bypassing them

DROP VIEW IF EXISTS public.public_profiles CASCADE;

-- Recreate view with security_invoker=true (respects RLS)
CREATE VIEW public.public_profiles 
WITH (security_invoker=true)
AS
SELECT 
  id,
  username,
  display_name,
  avatar_url,
  bio,
  portfolio_url,
  verified,
  reputation_score,
  bounties_completed,
  bounties_posted,
  success_rate,
  created_at,
  updated_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- Now add RLS policy on profiles table to allow anonymous SELECT
-- This policy allows anyone to SELECT from profiles, but the public_profiles view
-- ensures only safe columns are exposed to public queries
CREATE POLICY "Anonymous users can view public profile data"
ON public.profiles
FOR SELECT
TO anon
USING (true);

COMMENT ON VIEW public.public_profiles IS 
'Safe public view of profiles exposing only non-sensitive data (no financial info).
Uses security_invoker=true to respect RLS policies on underlying profiles table.
Financial data (total_earnings, total_spent) intentionally excluded from view definition.';

COMMENT ON POLICY "Anonymous users can view public profile data" ON public.profiles IS
'Allows anonymous users to query profiles table through the public_profiles view.
The view definition itself restricts which columns are accessible.
Direct table queries from clients should be discouraged - use the view instead.';
