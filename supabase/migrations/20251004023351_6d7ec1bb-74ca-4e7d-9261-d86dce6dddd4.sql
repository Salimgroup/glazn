-- Fix Security Definer View issue
-- Recreate views with explicit security_invoker=true to ensure RLS policies are respected

-- Fix public_profiles view
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

COMMENT ON VIEW public.public_profiles IS 
'Safe public view of profiles excluding sensitive financial data. Uses security_invoker to respect RLS policies on underlying profiles table.';

-- Fix content_creator_requests view
DROP VIEW IF EXISTS public.content_creator_requests CASCADE;

CREATE VIEW public.content_creator_requests
WITH (security_invoker=true)
AS
SELECT 
  r.id,
  r.user_id,
  r.title,
  r.description,
  r.bounty,
  r.category,
  r.deadline,
  r.status,
  r.created_at,
  r.updated_at,
  r.allow_contributions,
  r.minimum_contribution,
  r.view_count,
  r.trending_score,
  r.featured,
  r.platform,
  r.is_anonymous,
  r.content_creator_id,
  CASE 
    WHEN r.is_anonymous THEN 'Anonymous'
    ELSE p.display_name
  END as requester_name
FROM public.requests r
LEFT JOIN public.profiles p ON r.user_id = p.id
WHERE r.content_creator_id IS NOT NULL;

-- Grant access to the view
GRANT SELECT ON public.content_creator_requests TO authenticated;

COMMENT ON VIEW public.content_creator_requests IS 
'View of requests assigned to content creators. Uses security_invoker to respect RLS policies on underlying requests and profiles tables.';