-- Fix security issue: Remove overly permissive public access to profiles table
-- This policy allows unrestricted access to sensitive financial data
DROP POLICY IF EXISTS "Public profiles viewable by everyone" ON public.profiles;

-- Recreate the public_profiles view to ensure it only exposes non-sensitive fields
DROP VIEW IF EXISTS public.public_profiles CASCADE;

CREATE VIEW public.public_profiles AS
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
-- Excludes sensitive fields: total_earnings, total_spent

COMMENT ON VIEW public.public_profiles IS 'Safe public view of profiles excluding sensitive financial data';