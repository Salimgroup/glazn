-- Fix public_profiles view to work correctly with RLS
-- The issue: security_invoker=true means the view runs with caller's permissions
-- For anonymous users, there's no policy on profiles table allowing SELECT
-- Solution: Use security_definer so the view runs with owner's permissions (bypassing RLS)
-- This is SAFE because the view itself only exposes non-sensitive columns

DROP VIEW IF EXISTS public.public_profiles CASCADE;

CREATE VIEW public.public_profiles 
WITH (security_invoker=false)  -- This means security_definer (owner's permissions)
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

-- Enable RLS on the view (though it's a view, this documents intent)
-- Views themselves don't enforce RLS, but this makes the security model clear
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Grant public access to the view
GRANT SELECT ON public.public_profiles TO authenticated, anon;

COMMENT ON VIEW public.public_profiles IS 
'Safe public view of profiles exposing only non-sensitive data (no financial info).
Uses security_definer to execute with owner permissions, safely bypassing RLS.
The view definition itself acts as the security boundary by selecting only safe columns.
Financial data (total_earnings, total_spent) intentionally excluded.';
