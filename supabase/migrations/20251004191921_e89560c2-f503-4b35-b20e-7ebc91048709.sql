-- Security Enhancement Phase 3: Fix remaining function with empty search_path
-- The update_updated_at_column function has search_path = '' which is insecure

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;