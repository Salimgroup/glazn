-- Fix security definer view warning
-- Drop and recreate the view WITHOUT security definer
-- The RLS policies on profiles table will still protect the data

DROP VIEW IF EXISTS public.public_profiles CASCADE;

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

-- Add comment explaining the security model
COMMENT ON VIEW public.public_profiles IS 
'Public view of profiles that excludes sensitive financial data (total_spent, total_earnings). Uses security_invoker to respect RLS policies on underlying profiles table.';