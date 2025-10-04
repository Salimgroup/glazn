-- Fix Security Definer View warning by explicitly setting SECURITY INVOKER
-- This ensures the view uses the permissions of the querying user, not the creator

DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS
SELECT 
  id,
  username,
  display_name,
  bio,
  avatar_url,
  portfolio_url,
  verified,
  is_content_creator,
  creator_platforms,
  reputation_score,
  bounties_completed,
  bounties_posted,
  success_rate,
  created_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;