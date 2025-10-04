-- CRITICAL SECURITY FIX: Remove overly permissive anonymous policy on profiles table
-- Anonymous users should ONLY access profile data through public_profiles view
DROP POLICY IF EXISTS "Anonymous users can view public profile data" ON public.profiles;

-- HIGH PRIORITY: Create atomic wallet operation functions with row-level locking
-- to prevent race conditions in concurrent transactions

CREATE OR REPLACE FUNCTION public.process_payout_atomic(
  p_user_id uuid,
  p_amount numeric
) RETURNS jsonb AS $$
DECLARE
  v_wallet wallet_balances;
  v_result jsonb;
BEGIN
  -- Lock the wallet row for this transaction to prevent race conditions
  SELECT * INTO v_wallet
  FROM wallet_balances
  WHERE user_id = p_user_id
    AND currency = 'USD'
  FOR UPDATE;  -- Row-level lock prevents concurrent updates
  
  -- Check if wallet exists
  IF v_wallet IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user';
  END IF;
  
  -- Check sufficient balance
  IF v_wallet.available_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Available: %, Requested: %', v_wallet.available_balance, p_amount;
  END IF;
  
  -- Atomic update - move from available to pending
  UPDATE wallet_balances
  SET 
    available_balance = available_balance - p_amount,
    pending_balance = pending_balance + p_amount,
    updated_at = now()
  WHERE id = v_wallet.id;
  
  -- Return updated values
  SELECT jsonb_build_object(
    'success', true,
    'wallet_id', id,
    'new_available', available_balance,
    'new_pending', pending_balance
  ) INTO v_result
  FROM wallet_balances
  WHERE id = v_wallet.id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.complete_payout_atomic(
  p_user_id uuid,
  p_amount numeric
) RETURNS jsonb AS $$
DECLARE
  v_wallet wallet_balances;
BEGIN
  -- Lock and update wallet - remove from pending, add to withdrawn
  UPDATE wallet_balances
  SET 
    pending_balance = pending_balance - p_amount,
    total_withdrawn = total_withdrawn + p_amount,
    updated_at = now()
  WHERE user_id = p_user_id 
    AND currency = 'USD'
  RETURNING jsonb_build_object(
    'success', true,
    'pending_balance', pending_balance,
    'total_withdrawn', total_withdrawn
  ) INTO v_wallet;
  
  IF v_wallet IS NULL THEN
    RAISE EXCEPTION 'Failed to update wallet for payout completion';
  END IF;
  
  RETURN v_wallet;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.process_deposit_atomic(
  p_user_id uuid,
  p_net_amount numeric,
  p_total_amount numeric
) RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Upsert with atomic update
  INSERT INTO wallet_balances (user_id, available_balance, total_deposited, currency)
  VALUES (p_user_id, p_net_amount, p_total_amount, 'USD')
  ON CONFLICT (user_id, currency) 
  DO UPDATE SET
    available_balance = wallet_balances.available_balance + p_net_amount,
    total_deposited = wallet_balances.total_deposited + p_total_amount,
    updated_at = now()
  RETURNING jsonb_build_object(
    'success', true,
    'available_balance', available_balance,
    'total_deposited', total_deposited
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- HIGH PRIORITY: Strengthen wallet_balances RLS to explicitly require authentication
DROP POLICY IF EXISTS "Users can view own wallet" ON wallet_balances;

CREATE POLICY "Users can view own wallet"
ON wallet_balances
FOR SELECT
TO authenticated  -- Explicitly require authentication
USING (auth.uid() = user_id);

-- MEDIUM PRIORITY: Add DELETE policy for notifications
CREATE POLICY "Users can delete own notifications"
ON notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON FUNCTION public.process_payout_atomic IS 
'Atomically moves funds from available to pending balance with row-level locking to prevent race conditions';

COMMENT ON FUNCTION public.complete_payout_atomic IS 
'Atomically completes a payout by moving funds from pending to withdrawn';

COMMENT ON FUNCTION public.process_deposit_atomic IS 
'Atomically adds deposited funds to wallet balance with upsert logic';