-- Create enum for status tiers
CREATE TYPE public.status_tier AS ENUM (
  'glass_beginner',
  'glass_collector', 
  'glass_enthusiast',
  'glass_connoisseur',
  'glass_royalty',
  'glass_legend'
);

-- Create user_status table to track points and badges
CREATE TABLE public.user_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Creator stats
  creator_points INTEGER NOT NULL DEFAULT 0,
  bounties_completed INTEGER NOT NULL DEFAULT 0,
  creator_tier status_tier NOT NULL DEFAULT 'glass_beginner',
  
  -- Requester stats  
  requester_points INTEGER NOT NULL DEFAULT 0,
  bounties_paid INTEGER NOT NULL DEFAULT 0,
  total_paid_amount NUMERIC NOT NULL DEFAULT 0,
  requester_tier status_tier NOT NULL DEFAULT 'glass_beginner',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own status"
  ON public.user_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view other users status"
  ON public.user_status FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own status"
  ON public.user_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to calculate tier based on points
CREATE OR REPLACE FUNCTION public.calculate_tier(points INTEGER)
RETURNS status_tier
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF points >= 10000 THEN
    RETURN 'glass_legend'::status_tier;
  ELSIF points >= 5000 THEN
    RETURN 'glass_royalty'::status_tier;
  ELSIF points >= 2000 THEN
    RETURN 'glass_connoisseur'::status_tier;
  ELSIF points >= 500 THEN
    RETURN 'glass_enthusiast'::status_tier;
  ELSIF points >= 100 THEN
    RETURN 'glass_collector'::status_tier;
  ELSE
    RETURN 'glass_beginner'::status_tier;
  END IF;
END;
$$;

-- Function to update creator status when bounty is completed
CREATE OR REPLACE FUNCTION public.update_creator_status(p_user_id UUID, p_bounty_amount NUMERIC)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_points INTEGER;
  v_new_tier status_tier;
BEGIN
  -- Calculate points (1 point per dollar)
  v_new_points := FLOOR(p_bounty_amount)::INTEGER;
  
  -- Upsert user status
  INSERT INTO user_status (user_id, creator_points, bounties_completed)
  VALUES (p_user_id, v_new_points, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    creator_points = user_status.creator_points + v_new_points,
    bounties_completed = user_status.bounties_completed + 1,
    updated_at = now();
  
  -- Update tier based on new points
  SELECT creator_points INTO v_new_points
  FROM user_status
  WHERE user_id = p_user_id;
  
  v_new_tier := calculate_tier(v_new_points);
  
  UPDATE user_status
  SET creator_tier = v_new_tier
  WHERE user_id = p_user_id;
END;
$$;

-- Function to update requester status when bounty is paid
CREATE OR REPLACE FUNCTION public.update_requester_status(p_user_id UUID, p_bounty_amount NUMERIC)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_points INTEGER;
  v_new_tier status_tier;
BEGIN
  -- Calculate points (1 point per dollar paid)
  v_new_points := FLOOR(p_bounty_amount)::INTEGER;
  
  -- Upsert user status
  INSERT INTO user_status (user_id, requester_points, bounties_paid, total_paid_amount)
  VALUES (p_user_id, v_new_points, 1, p_bounty_amount)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    requester_points = user_status.requester_points + v_new_points,
    bounties_paid = user_status.bounties_paid + 1,
    total_paid_amount = user_status.total_paid_amount + p_bounty_amount,
    updated_at = now();
  
  -- Update tier based on new points
  SELECT requester_points INTO v_new_points
  FROM user_status
  WHERE user_id = p_user_id;
  
  v_new_tier := calculate_tier(v_new_points);
  
  UPDATE user_status
  SET requester_tier = v_new_tier
  WHERE user_id = p_user_id;
END;
$$;

-- Trigger to update creator status when submission is approved
CREATE OR REPLACE FUNCTION public.handle_submission_approved()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE TRIGGER on_submission_approved
  AFTER UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION handle_submission_approved();

-- Trigger to update requester status when bounty is created
CREATE OR REPLACE FUNCTION public.handle_bounty_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update requester status when bounty is created
  PERFORM update_requester_status(NEW.user_id, NEW.bounty);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_bounty_created
  AFTER INSERT ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_bounty_created();

-- Create updated_at trigger
CREATE TRIGGER update_user_status_updated_at
  BEFORE UPDATE ON public.user_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();