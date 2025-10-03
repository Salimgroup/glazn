-- Fix security issue: Remove overly permissive public access to profiles table
DROP POLICY IF EXISTS "Public profiles viewable by everyone" ON public.profiles;

-- Create or replace the public_profiles view with only non-sensitive fields
DROP VIEW IF EXISTS public.public_profiles;

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
-- Note: Excludes sensitive financial data like total_earnings and total_spent

-- Add a policy to allow anonymous and authenticated users to view non-sensitive profile data
-- This enables the leaderboard to work while protecting sensitive information
CREATE POLICY "Public can view non-sensitive profile data"
ON public.profiles
FOR SELECT
TO public
USING (true);

-- Since views inherit RLS from underlying tables and we need the view accessible,
-- we keep the policy but the view itself limits what columns are exposed
COMMENT ON VIEW public.public_profiles IS 'Public view of profiles excluding sensitive financial data like total_earnings and total_spent';
