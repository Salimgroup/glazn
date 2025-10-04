-- Drop the existing public_profiles view
DROP VIEW IF EXISTS public.public_profiles;

-- Create a security definer function that returns public profile data
-- This bypasses RLS to provide controlled access to non-sensitive fields only
CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE (
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  bio text,
  portfolio_url text,
  verified boolean,
  reputation_score integer,
  bounties_completed integer,
  bounties_posted integer,
  success_rate numeric,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
  FROM public.profiles
  -- Only expose non-sensitive fields, exclude financial data
  -- (total_earnings, total_spent, etc.)
$$;

-- Recreate public_profiles as a view using the security definer function
CREATE VIEW public.public_profiles AS 
SELECT * FROM public.get_public_profiles();

-- Grant SELECT access to anonymous and authenticated users
GRANT SELECT ON public.public_profiles TO anon, authenticated;