-- ============================================
-- CRITICAL SECURITY FIX: User Status Data Exposure
-- ============================================

-- Drop the overly permissive RLS policy that exposes financial data
DROP POLICY IF EXISTS "Authenticated users can view public status info" ON public.user_status;

-- Create secure public view that excludes sensitive financial data
CREATE OR REPLACE VIEW public.public_user_status
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  creator_tier,
  requester_tier,
  bounties_completed,
  bounties_paid,
  created_at,
  updated_at
FROM public.user_status;

-- Grant access to the public view
GRANT SELECT ON public.public_user_status TO authenticated;
GRANT SELECT ON public.public_user_status TO anon;

-- Note: Access to public_profiles view is already secured via:
-- 1. security_invoker = true (uses querying user's permissions)
-- 2. GRANT SELECT statements (already applied)
-- 3. Underlying profiles table RLS policies

-- user_status table now has secure policies:
-- - "Users can view own status" FOR SELECT USING (auth.uid() = user_id)
-- - "Users can insert own status" FOR INSERT WITH CHECK (auth.uid() = user_id)
-- - Others must use public_user_status view to see non-sensitive data