-- Security Fix: User roles infinite recursion fix
-- This is the critical fix to prevent admin role management errors
DROP POLICY IF EXISTS "user_roles_admin_manage" ON public.user_roles;

CREATE POLICY "user_roles_admin_manage"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Note: The profiles table policies are intentionally permissive for a bounty platform
-- where public reputation, earnings, and stats are part of the transparency model.
-- The public_profiles view exists for contexts where you want to hide financial data.
-- Application code should use public_profiles view when financial privacy is needed.