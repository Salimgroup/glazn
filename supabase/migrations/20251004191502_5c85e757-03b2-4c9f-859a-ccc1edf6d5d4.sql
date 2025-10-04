-- Security Enhancement Phase 2: Fix function search paths
-- All functions must have search_path explicitly set to prevent SQL injection via search_path manipulation

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    'user_' || substr(NEW.id::text, 1, 8)
  );
  RETURN NEW;
END;
$function$;

-- Update log_security_event function  
CREATE OR REPLACE FUNCTION public.log_security_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Log significant changes to submissions status
  IF TG_TABLE_NAME = 'submissions' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.security_audit_log (
      user_id,
      action,
      table_name,
      record_id,
      old_data,
      new_data
    ) VALUES (
      auth.uid(),
      'submission_status_change',
      'submissions',
      NEW.id,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status, 'reviewed_by', NEW.reviewed_by)
    );
  END IF;
  
  -- Log bounty contribution status changes
  IF TG_TABLE_NAME = 'bounty_contributions' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.security_audit_log (
      user_id,
      action,
      table_name,
      record_id,
      old_data,
      new_data
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
$function$;

-- Update handle_submission_approved function
CREATE OR REPLACE FUNCTION public.handle_submission_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_bounty_amount NUMERIC;
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Get the total bounty amount
    SELECT get_total_bounty(NEW.request_id) INTO v_bounty_amount;
    
    -- Update creator status
    PERFORM update_creator_status(NEW.creator_id, v_bounty_amount);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update handle_bounty_created function
CREATE OR REPLACE FUNCTION public.handle_bounty_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Update requester status when bounty is created
  PERFORM update_requester_status(NEW.user_id, NEW.bounty);
  RETURN NEW;
END;
$function$;