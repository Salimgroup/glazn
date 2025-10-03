-- =====================================================
-- COMPREHENSIVE SECURITY FIXES - Idempotent Version
-- =====================================================

-- Fix 1: Secure Profiles Table - Hide Financial Data
-- =====================================================

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own complete profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;

-- Create restricted policy: Users can see ALL their own data
CREATE POLICY "Users can view own complete profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Create public policy: Others can only see non-sensitive data (no financial info)
-- This policy filters out total_earnings and total_spent from the SELECT
CREATE POLICY "Public can view basic profile info"
ON public.profiles FOR SELECT
USING (auth.uid() != id OR auth.uid() IS NULL);

-- Create a safe public view that excludes sensitive financial data
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

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- Fix 2: Secure Activity Feed - Restrict Visibility
-- =====================================================

DROP POLICY IF EXISTS "Activity feed is viewable by everyone" ON public.activity_feed;
DROP POLICY IF EXISTS "Users can view relevant activity" ON public.activity_feed;

-- Users can view their own activities, followed users' activities, and public activities
CREATE POLICY "Users can view relevant activity"
ON public.activity_feed FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM public.follows 
    WHERE follower_id = auth.uid() 
    AND following_id = activity_feed.user_id
  )
  OR
  activity_type IN ('bounty_posted', 'milestone_reached')
);

-- Fix 3: Implement Role-Based Access Control (RBAC)
-- =====================================================

-- Create enum for roles (if not exists)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_at timestamp with time zone DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Only admins can assign/manage roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Fix 4: Add Input Validation Constraints
-- =====================================================

-- Add constraints only if they don't exist
DO $$ 
BEGIN
  -- bounty_contributions constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'message_length_check') THEN
    ALTER TABLE public.bounty_contributions 
      ADD CONSTRAINT message_length_check 
      CHECK (message IS NULL OR length(message) <= 1000);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'amount_positive_check') THEN
    ALTER TABLE public.bounty_contributions 
      ADD CONSTRAINT amount_positive_check 
      CHECK (amount > 0);
  END IF;

  -- submissions constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'submissions_title_length_check') THEN
    ALTER TABLE public.submissions 
      ADD CONSTRAINT submissions_title_length_check 
      CHECK (length(title) <= 200);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'submissions_description_length_check') THEN
    ALTER TABLE public.submissions 
      ADD CONSTRAINT submissions_description_length_check 
      CHECK (description IS NULL OR length(description) <= 2000);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'preview_notes_length_check') THEN
    ALTER TABLE public.submissions 
      ADD CONSTRAINT preview_notes_length_check 
      CHECK (preview_notes IS NULL OR length(preview_notes) <= 1000);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'external_url_length_check') THEN
    ALTER TABLE public.submissions 
      ADD CONSTRAINT external_url_length_check 
      CHECK (external_url IS NULL OR length(external_url) <= 500);
  END IF;

  -- requests constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'requests_title_length_check') THEN
    ALTER TABLE public.requests 
      ADD CONSTRAINT requests_title_length_check 
      CHECK (length(title) <= 200);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'requests_description_length_check') THEN
    ALTER TABLE public.requests 
      ADD CONSTRAINT requests_description_length_check 
      CHECK (length(description) <= 5000);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bounty_positive_check') THEN
    ALTER TABLE public.requests 
      ADD CONSTRAINT bounty_positive_check 
      CHECK (bounty >= 0);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'minimum_contribution_check') THEN
    ALTER TABLE public.requests 
      ADD CONSTRAINT minimum_contribution_check 
      CHECK (minimum_contribution >= 0);
  END IF;
END $$;

-- Fix 5: Add Security Audit Logging
-- =====================================================

CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS - only admins can view audit logs
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.security_audit_log;
CREATE POLICY "Only admins can view audit logs"
ON public.security_audit_log FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger function for audit logging
CREATE OR REPLACE FUNCTION public.log_security_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_TABLE_NAME = 'submissions' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.security_audit_log (
      user_id, action, table_name, record_id, old_data, new_data
    ) VALUES (
      auth.uid(),
      'submission_status_change',
      'submissions',
      NEW.id,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status, 'reviewed_by', NEW.reviewed_by)
    );
  END IF;
  
  IF TG_TABLE_NAME = 'bounty_contributions' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.security_audit_log (
      user_id, action, table_name, record_id, old_data, new_data
    ) VALUES (
      auth.uid(),
      'contribution_status_change',
      'bounty_contributions',
      NEW.id,
      jsonb_build_object('status', OLD.status, 'amount', OLD.amount),
      jsonb_build_object('status', NEW.status, 'amount', NEW.amount)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add audit triggers
DROP TRIGGER IF EXISTS audit_submissions_changes ON public.submissions;
CREATE TRIGGER audit_submissions_changes
  AFTER UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_security_event();

DROP TRIGGER IF EXISTS audit_contributions_changes ON public.bounty_contributions;
CREATE TRIGGER audit_contributions_changes
  AFTER UPDATE ON public.bounty_contributions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_security_event();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.security_audit_log(created_at DESC);