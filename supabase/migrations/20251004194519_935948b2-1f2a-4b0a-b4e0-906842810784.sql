-- ====================================================================
-- MIGRATION: Restrict profiles table to expose only non-sensitive fields
-- ====================================================================
-- Issue: profiles table exposes sensitive financial data to all authenticated users
-- Solution: Create a public_profiles view with only non-sensitive fields
-- and update RLS policies to restrict direct table access

-- Drop existing public access policy
DROP POLICY IF EXISTS "profile_public_limited_access" ON public.profiles;

-- Create view with only non-sensitive profile fields
CREATE OR REPLACE VIEW public.public_profiles AS
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

-- Grant access to the view for authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;

-- Add comment to document sensitive fields
COMMENT ON TABLE public.profiles IS 
  'User profiles table. Sensitive fields (total_earnings, total_spent) should only be visible to the profile owner. Use public_profiles view for public access.';

-- Recreate policy with stricter access - only own profile via direct table access
-- Public access should use the public_profiles view instead
CREATE POLICY "profile_public_via_view_only" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);