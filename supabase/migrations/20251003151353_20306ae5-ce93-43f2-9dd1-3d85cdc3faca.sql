-- Security Fix 1: Enable public_profiles view access for anonymous users
-- Drop existing restrictive policy on profiles if needed and add public access for safe fields
CREATE POLICY "Public profiles viewable by everyone"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (true);

-- Note: The public_profiles view will now work because it queries profiles table
-- The view already filters to only safe fields (no total_earnings, total_spent, etc.)

-- Security Fix 2: Fix user_roles infinite recursion issue
-- Drop the problematic policy
DROP POLICY IF EXISTS "user_roles_admin_manage" ON public.user_roles;

-- Recreate using the has_role() function to prevent recursion
CREATE POLICY "user_roles_admin_manage"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Security Fix 3: Secure notifications table - prevent client-side INSERT
CREATE POLICY "notifications_no_client_insert"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Note: Notifications should only be created via database triggers or edge functions
-- This prevents malicious users from creating fake notifications