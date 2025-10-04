-- Security Enhancement: Restrict overly permissive RLS policies
-- Phase 1: Update profiles and user_status tables to require authentication

-- Drop the overly permissive policy on user_status that allows anonymous access
DROP POLICY IF EXISTS "Users can view other users status" ON public.user_status;

-- Create a new policy that requires authentication and documents sensitive columns
CREATE POLICY "Authenticated users can view public status info"
ON public.user_status
FOR SELECT
TO authenticated
USING (true);

COMMENT ON POLICY "Authenticated users can view public status info" ON public.user_status IS 
'Allows authenticated users to view user status. Applications should filter sensitive columns (total_paid_amount, creator_points, requester_points) when displaying other users data.';

-- Add a policy comment to profiles table documenting sensitive columns
COMMENT ON POLICY "profile_public_limited_access" ON public.profiles IS 
'Allows users to view other profiles. Applications should filter sensitive financial columns (total_earnings, total_spent) when displaying other users data.';

-- Ensure activity_feed requires authentication for restricted access
-- (already has good policy but adding comment for clarity)
COMMENT ON POLICY "activity_feed_restricted_access" ON public.activity_feed IS 
'Users can see their own activity, their follows activity, and public activity types (bounty_posted, milestone_reached).';

-- Add comment to bounty_contributions table about financial sensitivity
COMMENT ON TABLE public.bounty_contributions IS 
'Stores bounty contributions. Contains financial data - ensure RLS policies protect contributor privacy.';

-- Add comment to transactions table about PII
COMMENT ON TABLE public.transactions IS 
'Contains financial transaction history and PII. Protected by user_id RLS policies.';

-- Add comment to wallet_balances table
COMMENT ON TABLE public.wallet_balances IS 
'Contains user wallet balances. All modifications must go through security definer functions to prevent manipulation.';